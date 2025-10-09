// Automated Payment Scheduler Service
// Handles daily automated payments at 23:00 hrs and withdrawal processing

import { logRiderActivity } from "../utils/riderActivity";

export interface WithdrawalRequest {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  amount: number;
  withdrawalFee: number;
  netAmount: number;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  processedAt?: string;
  notes?: string;
  adminNotes?: string;
}

export interface AutomatedPayment {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  amount: number;
  paymentMethod: 'automated_mpesa';
  processedAt: string;
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  failureReason?: string;
}

// In-memory storage (in production, use a proper database)
let withdrawalRequests: WithdrawalRequest[] = [];
let automatedPayments: AutomatedPayment[] = [];
let withdrawalIdCounter = 1;
let paymentIdCounter = 1;

// Sample withdrawal requests for demonstration
const sampleWithdrawals: WithdrawalRequest[] = [
  {
    id: 'WR-001',
    riderId: 'RD-001',
    riderName: 'John Mwangi',
    riderPhone: '+254 712 345 678',
    amount: 800,
    withdrawalFee: 20,
    netAmount: 780,
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  },
  {
    id: 'WR-002',
    riderId: 'RD-002',
    riderName: 'Peter Kimani',
    riderPhone: '+254 700 123 456',
    amount: 1500,
    withdrawalFee: 50,
    netAmount: 1450,
    requestedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  }
];

// Initialize with sample data
withdrawalRequests = [];
withdrawalIdCounter = 1;

// Calculate withdrawal fee based on amount
export const calculateWithdrawalFee = (amount: number): number => {
  if (amount < 1000) {
    return 20; // KES 20 for amounts below 1000
  } else {
    return 50; // KES 50 for amounts 1000 and above
  }
};

// Validate withdrawal request
export const validateWithdrawalRequest = (riderId: string, amount: number, currentBalance: number): {
  valid: boolean;
  error?: string;
  fee?: number;
  netAmount?: number;
} => {
  if (amount <= 0) {
    return { valid: false, error: 'Withdrawal amount must be greater than 0' };
  }

  if (currentBalance <= 0) {
    return { valid: false, error: 'No balance available for withdrawal' };
  }

  if (amount > currentBalance) {
    return { valid: false, error: 'Insufficient balance for withdrawal' };
  }

  const fee = calculateWithdrawalFee(amount);
  const netAmount = amount - fee;

  if (netAmount <= 0) {
    return { valid: false, error: 'Withdrawal amount too small after deducting fees' };
  }

  return {
    valid: true,
    fee,
    netAmount
  };
};

// Create withdrawal request
export const createWithdrawalRequest = (data: {
  riderId: string;
  riderName: string;
  riderPhone: string;
  amount: number;
  currentBalance: number;
  notes?: string;
}): { success: boolean; withdrawalRequest?: WithdrawalRequest; error?: string } => {
  const validation = validateWithdrawalRequest(data.riderId, data.amount, data.currentBalance);
  
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const withdrawalRequest: WithdrawalRequest = {
    id: `WR-${withdrawalIdCounter.toString().padStart(3, '0')}`,
    riderId: data.riderId,
    riderName: data.riderName,
    riderPhone: data.riderPhone,
    amount: data.amount,
    withdrawalFee: validation.fee!,
    netAmount: validation.netAmount!,
    requestedAt: new Date().toISOString(),
    status: 'pending',
    notes: data.notes
  };

  withdrawalRequests.unshift(withdrawalRequest); // Add to beginning for newest first
  withdrawalIdCounter++;

  // Log rider activity for withdrawal request
  logRiderActivity({
    riderId: data.riderId,
    riderName: data.riderName,
    type: 'status_change',
    description: `Requested early withdrawal of KES ${data.amount.toLocaleString()} (Fee: KES ${validation.fee}, Net: KES ${validation.netAmount})`,
    amount: data.amount,
    metadata: {
      withdrawalFee: validation.fee,
      netAmount: validation.netAmount,
      notes: data.notes
    }
  });

  console.log(`💸 Withdrawal Request Created: ${data.riderName} - KES ${data.amount} (Net: KES ${validation.netAmount})`);
  
  return { success: true, withdrawalRequest };
};

// Get all withdrawal requests
export const getWithdrawalRequests = (): WithdrawalRequest[] => {
  return withdrawalRequests;
};

// Get withdrawal requests for a specific rider
export const getRiderWithdrawalRequests = (riderId: string): WithdrawalRequest[] => {
  return withdrawalRequests.filter(req => req.riderId === riderId);
};

// Update withdrawal request status
export const updateWithdrawalRequestStatus = (
  requestId: string,
  status: WithdrawalRequest['status'],
  adminNotes?: string
): { success: boolean; withdrawalRequest?: WithdrawalRequest; error?: string } => {
  const requestIndex = withdrawalRequests.findIndex(req => req.id === requestId);
  
  if (requestIndex === -1) {
    return { success: false, error: 'Withdrawal request not found' };
  }

  const request = withdrawalRequests[requestIndex];
  request.status = status;
  request.processedAt = new Date().toISOString();
  
  if (adminNotes) {
    request.adminNotes = adminNotes;
  }

  // Log activity for status change
  logRiderActivity({
    riderId: request.riderId,
    riderName: request.riderName,
    type: 'status_change',
    description: `Withdrawal request ${status}: KES ${request.amount.toLocaleString()} (ID: ${requestId})`,
    amount: request.amount,
    metadata: {
      withdrawalRequestId: requestId,
      previousStatus: 'pending',
      newStatus: status,
      adminNotes
    }
  });

  console.log(`📋 Withdrawal Request Updated: ${request.riderName} - ${requestId} → ${status}`);
  
  return { success: true, withdrawalRequest: request };
};

// Simulate M-Pesa payment (in production, integrate with actual M-Pesa API)
const simulateMpesaPayment = async (phone: string, amount: number): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate 95% success rate
  const success = Math.random() > 0.05;
  
  if (success) {
    const transactionId = `MP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    return { success: true, transactionId };
  } else {
    return { success: false, error: 'M-Pesa transaction failed' };
  }
};

// Process automated payment for a rider
export const processAutomatedPayment = async (rider: {
  id: string;
  fullName: string;
  phone: string;
  currentBalance: number;
}): Promise<AutomatedPayment> => {
  const payment: AutomatedPayment = {
    id: `AP-${paymentIdCounter.toString().padStart(3, '0')}`,
    riderId: rider.id,
    riderName: rider.fullName,
    riderPhone: rider.phone,
    amount: rider.currentBalance,
    paymentMethod: 'automated_mpesa',
    processedAt: new Date().toISOString(),
    status: 'pending'
  };

  paymentIdCounter++;

  try {
    // Simulate M-Pesa payment
    const mpesaResult = await simulateMpesaPayment(rider.phone, rider.currentBalance);
    
    if (mpesaResult.success) {
      payment.status = 'success';
      payment.transactionId = mpesaResult.transactionId;
      
      // Log successful automated payment
      logRiderActivity({
        riderId: rider.id,
        riderName: rider.fullName,
        type: 'payment_received',
        description: `Automated daily payment of KES ${rider.currentBalance.toLocaleString()} sent via M-Pesa`,
        amount: rider.currentBalance,
        metadata: {
          paymentMethod: 'automated_mpesa',
          transactionId: mpesaResult.transactionId,
          balanceChange: -rider.currentBalance,
          newBalance: 0,
          paymentType: 'automated_daily'
        }
      });
      
      console.log(`✅ Automated Payment Success: ${rider.fullName} - KES ${rider.currentBalance} (TX: ${mpesaResult.transactionId})`);
    } else {
      payment.status = 'failed';
      payment.failureReason = mpesaResult.error;
      
      console.log(`❌ Automated Payment Failed: ${rider.fullName} - ${mpesaResult.error}`);
    }
  } catch (error) {
    payment.status = 'failed';
    payment.failureReason = 'System error during payment processing';
    console.error(`💥 Automated Payment Error: ${rider.fullName}`, error);
  }

  automatedPayments.unshift(payment);
  return payment;
};

// Get all automated payments
export const getAutomatedPayments = (): AutomatedPayment[] => {
  return automatedPayments;
};

// Get automated payments for a specific rider
export const getRiderAutomatedPayments = (riderId: string): AutomatedPayment[] => {
  return automatedPayments.filter(payment => payment.riderId === riderId);
};

// Check if it's time for automated payments (23:00 hrs)
export const isAutomatedPaymentTime = (): boolean => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Check if it's 23:00 (11 PM)
  return hour === 23 && minute === 0;
};

// Get payment statistics
export const getPaymentStats = (): {
  totalWithdrawalRequests: number;
  pendingWithdrawals: number;
  totalAutomatedPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalAmountPaid: number;
} => {
  const pendingWithdrawals = withdrawalRequests.filter(req => req.status === 'pending').length;
  const successfulPayments = automatedPayments.filter(payment => payment.status === 'success').length;
  const failedPayments = automatedPayments.filter(payment => payment.status === 'failed').length;
  const totalAmountPaid = automatedPayments
    .filter(payment => payment.status === 'success')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    totalWithdrawalRequests: withdrawalRequests.length,
    pendingWithdrawals,
    totalAutomatedPayments: automatedPayments.length,
    successfulPayments,
    failedPayments,
    totalAmountPaid
  };
};

// Cleanup old records (optional)
export const cleanupOldRecords = (daysToKeep: number = 30): void => {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  
  const originalWithdrawalsCount = withdrawalRequests.length;
  const originalPaymentsCount = automatedPayments.length;
  
  withdrawalRequests = withdrawalRequests.filter(req => new Date(req.requestedAt) > cutoffDate);
  automatedPayments = automatedPayments.filter(payment => new Date(payment.processedAt) > cutoffDate);
  
  const cleanedWithdrawals = originalWithdrawalsCount - withdrawalRequests.length;
  const cleanedPayments = originalPaymentsCount - automatedPayments.length;
  
  if (cleanedWithdrawals > 0 || cleanedPayments > 0) {
    console.log(`🧹 Cleanup: Removed ${cleanedWithdrawals} old withdrawal requests and ${cleanedPayments} old payment records`);
  }
};
