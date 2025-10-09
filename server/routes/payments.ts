import { RequestHandler } from "express";

// In-memory storage for payments (in production, use a proper database)
let payments: any[] = [];
let paymentIdCounter = 1;

// PayPal configuration (in production, use environment variables)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'your-paypal-client-id';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'your-paypal-client-secret';
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

// Helper function to get PayPal access token
async function getPayPalAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw new Error('Failed to authenticate with PayPal');
  }
}

// POST /api/payments/create-paypal-order - Create PayPal order
export const createPayPalOrder: RequestHandler = async (req, res) => {
  try {
    const { amount, currency = 'USD', orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount and orderId' 
      });
    }

    const accessToken = await getPayPalAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        description: `Rocs Crew Delivery Service - Order ${orderId}`
      }],
      application_context: {
        return_url: `${req.protocol}://${req.get('host')}/api/payments/paypal-success`,
        cancel_url: `${req.protocol}://${req.get('host')}/api/payments/paypal-cancel`,
        brand_name: 'Rocs Crew',
        user_action: 'PAY_NOW'
      }
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const paypalOrder = await response.json();

    if (!response.ok) {
      throw new Error(paypalOrder.message || 'Failed to create PayPal order');
    }

    // Store payment record
    const payment = {
      id: `PAY-${paymentIdCounter.toString().padStart(6, '0')}`,
      orderId,
      paypalOrderId: paypalOrder.id,
      amount,
      currency,
      status: 'created',
      method: 'paypal',
      createdAt: new Date().toISOString()
    };

    payments.push(payment);
    paymentIdCounter++;

    res.json({
      success: true,
      paymentId: payment.id,
      paypalOrderId: paypalOrder.id,
      approvalUrl: paypalOrder.links.find((link: any) => link.rel === 'approve')?.href
    });

  } catch (error) {
    console.error('PayPal order creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create PayPal order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// POST /api/payments/capture-paypal-order - Capture PayPal payment
export const capturePayPalOrder: RequestHandler = async (req, res) => {
  try {
    const { paypalOrderId } = req.body;

    if (!paypalOrderId) {
      return res.status(400).json({ 
        error: 'Missing PayPal order ID' 
      });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    const captureData = await response.json();

    if (!response.ok) {
      throw new Error(captureData.message || 'Failed to capture PayPal payment');
    }

    // Update payment record
    const paymentIndex = payments.findIndex(p => p.paypalOrderId === paypalOrderId);
    if (paymentIndex !== -1) {
      payments[paymentIndex].status = 'completed';
      payments[paymentIndex].capturedAt = new Date().toISOString();
      payments[paymentIndex].transactionId = captureData.id;
      payments[paymentIndex].captureDetails = captureData;
    }

    res.json({
      success: true,
      paymentStatus: 'completed',
      transactionId: captureData.id,
      captureDetails: captureData
    });

  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ 
      error: 'Failed to capture PayPal payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// POST /api/payments/verify-paypal - Verify PayPal payment
export const verifyPayPalPayment: RequestHandler = async (req, res) => {
  try {
    const { paypalOrderId } = req.body;

    if (!paypalOrderId) {
      return res.status(400).json({ 
        error: 'Missing PayPal order ID' 
      });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    const orderData = await response.json();

    if (!response.ok) {
      throw new Error(orderData.message || 'Failed to verify PayPal payment');
    }

    res.json({
      success: true,
      orderStatus: orderData.status,
      orderDetails: orderData
    });

  } catch (error) {
    console.error('PayPal verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify PayPal payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// POST /api/payments/cash-on-delivery - Process cash on delivery
export const processCashOnDelivery: RequestHandler = (req, res) => {
  try {
    const { orderId, amount, currency = 'KES' } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: orderId and amount' 
      });
    }

    // Create cash payment record
    const payment = {
      id: `COD-${paymentIdCounter.toString().padStart(6, '0')}`,
      orderId,
      amount,
      currency,
      status: 'pending',
      method: 'cash_on_delivery',
      createdAt: new Date().toISOString(),
      note: 'Payment will be collected upon delivery'
    };

    payments.push(payment);
    paymentIdCounter++;

    res.json({
      success: true,
      paymentId: payment.id,
      status: 'pending',
      message: 'Cash on delivery order created successfully'
    });

  } catch (error) {
    console.error('Cash on delivery error:', error);
    res.status(500).json({ 
      error: 'Failed to process cash on delivery',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/payments/:id - Get payment details
export const getPayment: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = payments.find(p => p.id === id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET /api/admin/payments - Get all payments (admin only)
export const getAllPayments: RequestHandler = (req, res) => {
  try {
    const sortedPayments = [...payments].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      payments: sortedPayments,
      total: payments.length
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve payments',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// PATCH /api/payments/:id/status - Update payment status (admin only)
export const updatePaymentStatus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const paymentIndex = payments.findIndex(p => p.id === id);
    if (paymentIndex === -1) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payments[paymentIndex].status = status;
    payments[paymentIndex].updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      payment: payments[paymentIndex]
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ 
      error: 'Failed to update payment status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
