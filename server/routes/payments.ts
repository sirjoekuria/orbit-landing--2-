import { RequestHandler } from "express";
import path from "path";
import fs from "fs";
import { initiateStkPush } from "../services/mpesaService";

// JSON file operations (fallback when Supabase is not available)
const PAYMENTS_FILE = path.join(process.cwd(), 'server', 'data', 'payments.json');

function loadPayments(): any[] {
  try {
    if (!fs.existsSync(PAYMENTS_FILE)) return [];
    const raw = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Failed to load payments:', e);
    return [];
  }
}

function savePayments(payments: any[]) {
  try {
    const dir = path.dirname(PAYMENTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save payments:', e);
  }
}

function getNextPaymentId(existingPayments: any[], prefix: string = 'PAY'): string {
  if (existingPayments.length === 0) return `${prefix}-000001`;

  const ids = existingPayments
    .map(p => {
      const parts = p.id.split('-');
      return parts.length === 2 ? parseInt(parts[1]) : 0;
    })
    .filter(id => !isNaN(id));

  const maxId = Math.max(0, ...ids);
  return `${prefix}-${(maxId + 1).toString().padStart(6, '0')}`;
}

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

    let payments = loadPayments();

    // Store payment record
    const payment = {
      id: getNextPaymentId(payments),
      orderId,
      paypalOrderId: paypalOrder.id,
      amount,
      currency,
      status: 'created',
      method: 'paypal',
      createdAt: new Date().toISOString()
    };

    payments.push(payment);
    savePayments(payments);

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
    const payments = loadPayments();
    const paymentIndex = payments.findIndex(p => p.paypalOrderId === paypalOrderId);
    if (paymentIndex !== -1) {
      payments[paymentIndex].status = 'completed';
      payments[paymentIndex].capturedAt = new Date().toISOString();
      payments[paymentIndex].transactionId = captureData.id;
      payments[paymentIndex].captureDetails = captureData;
      savePayments(payments);
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

    let payments = loadPayments();

    // Create cash payment record
    const payment = {
      id: getNextPaymentId(payments, 'COD'),
      orderId,
      amount,
      currency,
      status: 'pending',
      method: 'cash_on_delivery',
      createdAt: new Date().toISOString(),
      note: 'Payment will be collected upon delivery'
    };

    payments.push(payment);
    savePayments(payments);

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

    const payments = loadPayments();
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
    const payments = loadPayments();
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

    const payments = loadPayments();
    const paymentIndex = payments.findIndex(p => p.id === id);
    if (paymentIndex === -1) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payments[paymentIndex].status = status;
    payments[paymentIndex].updatedAt = new Date().toISOString();

    savePayments(payments);

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

// POST /api/payments/mpesa/stkpush - Initiate M-Pesa STK Push
import fs from 'fs';
import path from 'path';

const logMpesa = (data: any) => {
  const logPath = path.join(process.cwd(), 'mpesa-debug.log');
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${JSON.stringify(data, null, 2)}\n\n`;
  fs.appendFileSync(logPath, logEntry);
};

export const initiateMpesaStkPush: RequestHandler = async (req, res) => {
  try {
    const { phoneNumber, amount, orderId } = req.body;
    logMpesa({ action: 'initiate', body: req.body });

    if (!phoneNumber || !amount || !orderId) {
      return res.status(400).json({
        error: 'Missing required fields: phoneNumber, amount, and orderId'
      });
    }

    const response = await initiateStkPush(phoneNumber, amount, orderId);
    logMpesa({ action: 'response', response });

    if (response.ResponseCode === '0') {
      let payments = loadPayments();

      // Store payment record with CheckoutRequestID for polling
      const payment = {
        id: getNextPaymentId(payments, 'MPESA'),
        orderId,
        checkoutRequestId: response.CheckoutRequestID,
        merchantRequestId: response.MerchantRequestID,
        amount,
        currency: 'KES',
        status: 'pending',
        method: 'mpesa',
        createdAt: new Date().toISOString()
      };

      payments.push(payment);
      savePayments(payments);

      res.json({
        success: true,
        checkoutRequestId: response.CheckoutRequestID,
        customerMessage: response.CustomerMessage
      });
    } else {
      throw new Error(response.ResponseDescription || 'Failed to initiate M-Pesa payment');
    }

  } catch (error: any) {
    logMpesa({ action: 'error', error: error.message, stack: error.stack });
    console.error('M-Pesa STK Push error:', error);
    res.status(500).json({
      error: 'Failed to initiate M-Pesa payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// POST /api/payments/mpesa/callback - M-Pesa payment callback
export const mpesaCallback: RequestHandler = async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;

    console.log('M-Pesa Callback received:', JSON.stringify(stkCallback, null, 2));

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    let payments = loadPayments();
    const paymentIndex = payments.findIndex(p => p.checkoutRequestId === checkoutRequestId);

    if (paymentIndex !== -1) {
      if (resultCode === 0) {
        // Success
        payments[paymentIndex].status = 'completed';
        payments[paymentIndex].completedAt = new Date().toISOString();

        // Extract metadata
        const metadata = stkCallback.CallbackMetadata.Item;
        const receipt = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
        const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;

        payments[paymentIndex].transactionId = receipt;
        payments[paymentIndex].actualAmount = amount;
      } else {
        // Failed
        payments[paymentIndex].status = 'failed';
        payments[paymentIndex].error = resultDesc;
      }

      payments[paymentIndex].callbackResult = stkCallback;
      savePayments(payments);
    }

    // Safaricom expects a 200 OK response
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/payments/mpesa/status/:checkoutRequestId - Check M-Pesa payment status
export const getMpesaStatus: RequestHandler = (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    const payments = loadPayments();
    const payment = payments.find(p => p.checkoutRequestId === checkoutRequestId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      status: payment.status,
      transactionId: payment.transactionId,
      message: payment.error || (payment.status === 'completed' ? 'Payment successful' : 'Payment pending')
    });

  } catch (error) {
    console.error('Get M-Pesa status error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
