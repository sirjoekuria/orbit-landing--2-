import { RequestHandler } from "express";
import { 
  createWithdrawalRequest,
  getWithdrawalRequests,
  getRiderWithdrawalRequests,
  updateWithdrawalRequestStatus,
  getAutomatedPayments,
  getRiderAutomatedPayments,
  processAutomatedPayment,
  getPaymentStats,
  calculateWithdrawalFee
} from "../services/paymentScheduler";
import { 
  getRiderById, 
  updateRiderBalance, 
  validateRiderForWithdrawal,
  getPaymentStatistics
} from "../utils/ridersData";
import { 
  startCronScheduler, 
  stopCronScheduler, 
  getCronStatus, 
  triggerManualPayments 
} from "../services/cronScheduler";

// POST /api/riders/:riderId/withdrawal-request - Create withdrawal request
export const createWithdrawal: RequestHandler = (req, res) => {
  try {
    const { riderId } = req.params;
    const { amount, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid withdrawal amount'
      });
    }

    // Validate rider
    const riderValidation = validateRiderForWithdrawal(riderId);
    if (!riderValidation.valid) {
      return res.status(400).json({
        error: riderValidation.error
      });
    }

    const rider = riderValidation.rider!;

    // Create withdrawal request
    const result = createWithdrawalRequest({
      riderId: rider.id,
      riderName: rider.fullName,
      riderPhone: rider.phone,
      amount: parseFloat(amount),
      currentBalance: rider.currentBalance,
      notes
    });

    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Withdrawal request created successfully',
      withdrawalRequest: result.withdrawalRequest,
      fee: result.withdrawalRequest!.withdrawalFee,
      netAmount: result.withdrawalRequest!.netAmount
    });
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/withdrawal-requests - Get all withdrawal requests (admin)
export const getAdminWithdrawalRequests: RequestHandler = (req, res) => {
  try {
    const { status, riderId, limit = '50' } = req.query;
    
    let requests = getWithdrawalRequests();
    
    // Apply filters
    if (status) {
      requests = requests.filter(req => req.status === status);
    }
    
    if (riderId) {
      requests = requests.filter(req => req.riderId === riderId);
    }
    
    // Apply limit
    const limitNum = parseInt(limit as string);
    requests = requests.slice(0, limitNum);

    const stats = getPaymentStats();

    res.json({
      success: true,
      requests,
      total: requests.length,
      stats
    });
  } catch (error) {
    console.error('Error getting withdrawal requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/riders/:riderId/withdrawal-requests - Get rider's withdrawal requests
export const getRiderWithdrawals: RequestHandler = (req, res) => {
  try {
    const { riderId } = req.params;
    const { limit = '20' } = req.query;

    const requests = getRiderWithdrawalRequests(riderId);
    const limitNum = parseInt(limit as string);
    const limitedRequests = requests.slice(0, limitNum);

    res.json({
      success: true,
      riderId,
      requests: limitedRequests,
      total: requests.length
    });
  } catch (error) {
    console.error('Error getting rider withdrawal requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/admin/withdrawal-requests/:requestId - Update withdrawal request status
export const updateWithdrawalStatus: RequestHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'processed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const result = updateWithdrawalRequestStatus(requestId, status, adminNotes);
    
    if (!result.success) {
      return res.status(404).json({
        error: result.error
      });
    }

    // If approved, process the payment
    if (status === 'approved') {
      const request = result.withdrawalRequest!;
      
      // Update rider balance (deduct the withdrawal amount)
      const balanceUpdated = updateRiderBalance(
        request.riderId, 
        0, // Set balance to 0 since we're paying out everything (simplified for demo)
        request.amount
      );

      if (!balanceUpdated) {
        return res.status(500).json({
          error: 'Failed to update rider balance'
        });
      }
    }

    res.json({
      success: true,
      message: `Withdrawal request ${status} successfully`,
      withdrawalRequest: result.withdrawalRequest
    });
  } catch (error) {
    console.error('Error updating withdrawal request status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/automated-payments - Get automated payment history
export const getAdminAutomatedPayments: RequestHandler = (req, res) => {
  try {
    const { status, riderId, limit = '50' } = req.query;
    
    let payments = getAutomatedPayments();
    
    // Apply filters
    if (status) {
      payments = payments.filter(payment => payment.status === status);
    }
    
    if (riderId) {
      payments = payments.filter(payment => payment.riderId === riderId);
    }
    
    // Apply limit
    const limitNum = parseInt(limit as string);
    payments = payments.slice(0, limitNum);

    res.json({
      success: true,
      payments,
      total: payments.length
    });
  } catch (error) {
    console.error('Error getting automated payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/riders/:riderId/automated-payments - Get rider's automated payment history
export const getRiderAutomatedPaymentHistory: RequestHandler = (req, res) => {
  try {
    const { riderId } = req.params;
    const { limit = '20' } = req.query;

    const payments = getRiderAutomatedPayments(riderId);
    const limitNum = parseInt(limit as string);
    const limitedPayments = payments.slice(0, limitNum);

    res.json({
      success: true,
      riderId,
      payments: limitedPayments,
      total: payments.length
    });
  } catch (error) {
    console.error('Error getting rider automated payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/admin/trigger-automated-payments - Manually trigger automated payments
export const triggerAutomatedPayments: RequestHandler = async (req, res) => {
  try {
    console.log('🔧 Admin triggered manual automated payments');
    
    // Trigger the payments
    await triggerManualPayments();
    
    res.json({
      success: true,
      message: 'Automated payments triggered successfully',
      triggeredAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error triggering automated payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/payment-scheduler/status - Get scheduler status
export const getSchedulerStatus: RequestHandler = (req, res) => {
  try {
    const status = getCronStatus();
    const stats = getPaymentStatistics();
    
    res.json({
      success: true,
      scheduler: status,
      statistics: stats
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/admin/payment-scheduler/start - Start scheduler
export const startScheduler: RequestHandler = (req, res) => {
  try {
    startCronScheduler();
    
    res.json({
      success: true,
      message: 'Payment scheduler started successfully'
    });
  } catch (error) {
    console.error('Error starting scheduler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/admin/payment-scheduler/stop - Stop scheduler
export const stopScheduler: RequestHandler = (req, res) => {
  try {
    stopCronScheduler();
    
    res.json({
      success: true,
      message: 'Payment scheduler stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping scheduler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/withdrawal-fee-calculator - Calculate withdrawal fee
export const calculateFee: RequestHandler = (req, res) => {
  try {
    const { amount } = req.query;
    
    if (!amount) {
      return res.status(400).json({
        error: 'Amount parameter is required'
      });
    }
    
    const amountNum = parseFloat(amount as string);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        error: 'Invalid amount'
      });
    }
    
    const fee = calculateWithdrawalFee(amountNum);
    const netAmount = amountNum - fee;
    
    res.json({
      success: true,
      amount: amountNum,
      fee,
      netAmount,
      feePercentage: ((fee / amountNum) * 100).toFixed(2)
    });
  } catch (error) {
    console.error('Error calculating withdrawal fee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
