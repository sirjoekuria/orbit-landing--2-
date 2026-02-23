import { RequestHandler } from "express";
import fs from 'fs';
import path from 'path';
import { DatabaseService } from '../services/database';
import { supabase } from '../lib/supabase';
import { sendOrderReceipt, sendAdminNotification, sendRiderEarningsReceipt } from "../services/emailService";
import { findRiderByName, addEarningToRider } from "../utils/riderEarnings";
import { logRiderActivity } from "../utils/riderActivity";

// JSON file operations (fallback when Supabase is not available)
const ORDERS_FILE = path.join(process.cwd(), 'server', 'data', 'orders.json');

function isSupabaseAvailable() {
  return !!supabase;
}

function loadOrders(): any[] {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Failed to load orders:', e);
    return [];
  }
}

function saveOrders(orders: any[]) {
  try {
    const dir = path.dirname(ORDERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
}

function getNextOrderId(existingOrders: any[]): string {
  if (existingOrders.length === 0) return 'RC-2024-001';

  // Find the highest numeric part
  const ids = existingOrders
    .map(o => {
      const parts = o.id.split('-');
      return parts.length === 3 ? parseInt(parts[2]) : 0;
    })
    .filter(id => !isNaN(id));

  const maxId = Math.max(0, ...ids);
  return `RC-2024-${(maxId + 1).toString().padStart(3, '0')}`;
}

// POST /api/orders - Create a new order
export const createOrder: RequestHandler = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      pickup,
      delivery,
      distance,
      cost,
      packageDetails,
      notes,
      paymentMethod,
      paymentStatus,
      transactionId
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !pickup || !delivery || !distance || !cost || !packageDetails) {
      return res.status(400).json({
        error: 'Missing required fields: customerName, customerEmail, customerPhone, pickup, delivery, distance, cost, and packageDetails are required'
      });
    }

    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + 90 * 60 * 1000); // 90 minutes from now

    let newOrder;
    if (isSupabaseAvailable()) {
      try {
        // Map frontend fields to DB fields if necessary, or pass through if DatabaseService handles it
        // DatabaseService.createOrder expects Omit<Order, 'id' | 'created_at' | 'updated_at'>
        // Let's assume for now it handles the mapping or we keep names consistent
        newOrder = await DatabaseService.createOrder({
          customer_id: req.body.customerId || 'anonymous', // Need a valid customer ID for Supabase
          pickup_location: { name: pickup, address: pickup, coordinates: [0, 0] },
          delivery_location: { name: delivery, address: delivery, coordinates: [0, 0] },
          items: [{ name: packageDetails, description: packageDetails, quantity: 1 }],
          status: 'pending',
          payment_status: paymentStatus || 'pending',
          payment_method: paymentMethod || 'cash_on_delivery',
          total_amount: Number(cost),
          delivery_fee: 0, // Should be calculated
          notes: notes || '',
          estimated_delivery_time: estimatedDelivery.toISOString()
        } as any);
      } catch (e) {
        console.error('Supabase createOrder failed, falling back to JSON:', e);
      }
    }

    if (!newOrder) {
      const orders = loadOrders();
      newOrder = {
        id: getNextOrderId(orders),
        customerName,
        customerEmail,
        customerPhone,
        pickup,
        delivery,
        distance: Number(distance),
        cost: Number(cost),
        packageDetails,
        notes: notes || '',
        paymentMethod: paymentMethod || 'cash_on_delivery',
        paymentStatus: paymentStatus || 'pending',
        transactionId: transactionId || null,
        currentStatus: 'pending',
        createdAt: now.toISOString(),
        estimatedDelivery: estimatedDelivery.toISOString(),
        statusHistory: [
          {
            status: 'pending',
            timestamp: now.toISOString(),
            description: 'Order received and is being processed'
          }
        ]
      };

      orders.push(newOrder);
      saveOrders(orders);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });

    // Send order confirmation email (non-blocking)
    try {
      await sendOrderReceipt(newOrder);
      console.log(`Order confirmation email sent to ${newOrder.customerEmail || newOrder.customer_email}`);
    } catch (emailErr) {
      console.error('Failed to send order creation email:', emailErr);
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/orders/track/:id - Get order tracking information
export const trackOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    let order;
    if (isSupabaseAvailable()) {
      try {
        order = await DatabaseService.getOrderById(id);
      } catch (e) {
        console.error('Supabase getOrderById failed, falling back to JSON:', e);
      }
    }

    if (!order) {
      const orders = loadOrders();
      order = orders.find(o => o.id === id);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/orders - Get all orders (admin only)
export const getOrders: RequestHandler = async (req, res) => {
  try {
    let allOrders: any[] = [];

    if (isSupabaseAvailable()) {
      try {
        allOrders = await DatabaseService.getOrders();
      } catch (e) {
        console.error('Supabase getOrders failed, falling back to JSON:', e);
      }
    }

    if (allOrders.length === 0) {
      allOrders = loadOrders();
    }

    // Sort orders by creation date (newest first)
    const sortedOrders = [...allOrders].sort((a, b) =>
      new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime()
    );

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

    res.json({
      success: true,
      orders: paginatedOrders,
      total: allOrders.length,
      page,
      limit,
      totalPages: Math.ceil(allOrders.length / limit)
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/admin/orders/:id - Update order status
export const updateOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'picked_up', 'in_transit', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    let order;
    let orders: any[] = [];

    if (isSupabaseAvailable()) {
      try {
        order = await DatabaseService.updateOrder(id, { status } as any);
      } catch (e) {
        console.error('Supabase updateOrder failed, falling back to JSON:', e);
      }
    }

    if (!order) {
      orders = loadOrders();
      const orderIndex = orders.findIndex(o => o.id === id);
      if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
      }
      order = orders[orderIndex];
      const now = new Date().toISOString();

      // Update status
      order.currentStatus = status;
      order.updatedAt = now;

      // Add to status history
      const statusDescriptions = {
        pending: 'Order received and is being processed',
        confirmed: 'Order confirmed and rider assigned',
        picked_up: `Package picked up from ${order.pickup}`,
        in_transit: 'Package is on the way to destination',
        delivered: `Package delivered successfully to ${order.delivery}`
      };

      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status,
        timestamp: now,
        description: statusDescriptions[status as keyof typeof statusDescriptions]
      });

      saveOrders(orders);
    }

    // Log rider activities for status changes (if rider is assigned)
    if (order.riderName && (status === 'picked_up' || status === 'in_transit')) {
      const rider = findRiderByName(order.riderName);
      if (rider) {
        if (status === 'picked_up') {
          logRiderActivity({
            riderId: rider.id,
            riderName: rider.fullName,
            type: 'pickup_completed',
            orderId: order.id,
            description: `Package picked up from ${order.pickup} for order ${order.id}`,
            location: order.pickup,
            metadata: {
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              pickupLocation: order.pickup,
              deliveryLocation: order.delivery
            }
          });
        }
      }
    }

    // Send email receipt when order is confirmed
    if (status === 'confirmed') {
      try {
        const emailSent = await sendOrderReceipt(order);
        if (emailSent) {
          console.log(`Receipt email sent successfully to ${order.customerEmail}`);
          await sendAdminNotification(order);
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
    }

    // Process rider earnings when order is delivered
    if (status === 'delivered' && (order.riderName || order.rider_id)) {
      try {
        const riderName = order.riderName || 'Rider';
        const cost = order.cost || order.total_amount || 0;
        console.log(`Order ${order.id} delivered - Processing rider earnings for ${riderName}`);

        let rider = null;
        if (order.riderId || order.rider_id) {
          rider = findRiderByName(riderName);
        } else {
          rider = findRiderByName(riderName);
        }

        if (rider) {
          const now = new Date().toISOString();
          const earningResult = addEarningToRider(rider.id, {
            orderId: order.id,
            orderAmount: cost,
            deliveryDate: now
          });

          if (earningResult.success) {
            logRiderActivity({
              riderId: rider.id,
              riderName: rider.fullName,
              type: 'delivery_completed',
              orderId: order.id,
              description: `Successfully delivered order ${order.id} to ${order.delivery || 'destination'}`,
              amount: cost,
              commission: cost * 0.2,
              netEarning: cost * 0.8,
              location: order.delivery || 'N/A',
              metadata: {
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                pickupLocation: order.pickup,
                deliveryLocation: order.delivery,
                balanceChange: cost * 0.8,
                newBalance: earningResult.newBalance
              }
            });

            try {
              await sendRiderEarningsReceipt(rider, earningResult.earning);
            } catch (emailError) {
              console.error('Error sending earnings receipt:', emailError);
            }
          }
        }
      } catch (error) {
        console.error('Error processing rider earnings:', error);
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order,
      emailSent: status === 'confirmed' ? true : undefined
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/admin/orders/:id/assign-rider - Assign rider to order
export const assignRiderToOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { riderId, riderName, riderPhone } = req.body;

    if (!riderId || !riderName || !riderPhone) {
      return res.status(400).json({
        error: 'Missing required fields: riderId, riderName, and riderPhone'
      });
    }

    let order;
    let orders: any[] = [];

    if (isSupabaseAvailable()) {
      try {
        order = await DatabaseService.updateOrder(id, {
          rider_id: riderId,
          // We might need to store names in metadata or other fields if not in schema
        } as any);
      } catch (e) {
        console.error('Supabase assignRiderToOrder failed, falling back to JSON:', e);
      }
    }

    if (!order) {
      orders = loadOrders();
      const orderIndex = orders.findIndex(o => o.id === id);
      if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
      }
      order = orders[orderIndex];
      const now = new Date().toISOString();

      // Update order with rider info
      order.riderName = riderName;
      order.riderPhone = riderPhone;
      order.riderId = riderId;
      order.updatedAt = now;

      // Update status to confirmed if it's pending
      if (order.currentStatus === 'pending') {
        order.currentStatus = 'confirmed';
        if (!order.statusHistory) order.statusHistory = [];
        order.statusHistory.push({
          status: 'confirmed',
          timestamp: now,
          description: `Order confirmed and assigned to ${riderName}`
        });
      } else {
        // Add rider assignment to history
        if (!order.statusHistory) order.statusHistory = [];
        order.statusHistory.push({
          status: order.currentStatus,
          timestamp: now,
          description: `Rider assigned: ${riderName}`
        });
      }

      saveOrders(orders);
    }

    // Log rider activity for order assignment
    logRiderActivity({
      riderId: riderId,
      riderName: riderName,
      type: 'order_assigned',
      orderId: order.id,
      description: `Assigned to delivery order ${order.id} (${order.pickup || 'N/A'} → ${order.delivery || 'N/A'})`,
      location: order.pickup || 'N/A',
      metadata: {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        pickupLocation: order.pickup,
        deliveryLocation: order.delivery,
        previousStatus: 'available',
        newStatus: 'assigned'
      }
    });

    res.json({
      success: true,
      message: 'Rider assigned successfully',
      order
    });
  } catch (error) {
    console.error('Error assigning rider to order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/admin/orders/:id/confirm-payment - Manually confirm payment and send receipt
export const confirmPaymentAndSendReceipt: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    let order;
    let orders: any[] = [];

    if (isSupabaseAvailable()) {
      try {
        order = await DatabaseService.updateOrder(id, { payment_status: 'paid' } as any);
      } catch (e) {
        console.error('Supabase confirmPaymentAndSendReceipt failed, falling back to JSON:', e);
      }
    }

    if (!order) {
      orders = loadOrders();
      const orderIndex = orders.findIndex(o => o.id === id);
      if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
      }
      order = orders[orderIndex];
      const now = new Date().toISOString();

      // Update payment status and add timestamp
      order.paymentConfirmed = true;
      order.paymentConfirmedAt = now;
      order.updatedAt = now;

      // If order is still pending, update to confirmed
      if (order.currentStatus === 'pending') {
        order.currentStatus = 'confirmed';
        if (!order.statusHistory) order.statusHistory = [];
        order.statusHistory.push({
          status: 'confirmed',
          timestamp: now,
          description: 'Payment confirmed and order confirmed by admin'
        });
      }

      // Add payment confirmation to status history
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: 'payment_confirmed',
        timestamp: now,
        description: 'Payment confirmed by admin - Receipt sent to customer'
      });

      saveOrders(orders);
    }

    try {
      // Send receipt email
      const emailSent = await sendOrderReceipt(order);
      if (emailSent) {
        console.log(`Payment confirmation receipt sent to ${order.customerEmail}`);
        await sendAdminNotification(order);

        res.json({
          success: true,
          message: 'Payment confirmed and receipt sent successfully',
          order,
          emailSent: true
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Payment confirmed but failed to send receipt email',
          order,
          emailSent: false
        });
      }
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
      res.status(500).json({
        success: false,
        error: 'Payment confirmed but email sending failed',
        order,
        emailSent: false,
        emailError: (emailError as Error).message
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/admin/orders/:id/resend-receipt - Resend receipt email
export const resendReceipt: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    let order;
    if (isSupabaseAvailable()) {
      try {
        order = await DatabaseService.getOrderById(id);
      } catch (e) {
        console.error('Supabase getOrderById failed, falling back to JSON:', e);
      }
    }

    if (!order) {
      const orders = loadOrders();
      order = orders.find(o => o.id === id);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    try {
      const emailSent = await sendOrderReceipt(order);
      if (emailSent) {
        console.log(`Receipt resent to ${order.customerEmail || order.customer_email}`);

        res.json({
          success: true,
          message: 'Receipt resent successfully',
          emailSent: true,
          customerEmail: order.customerEmail || order.customer_email
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to resend receipt email',
          emailSent: false
        });
      }
    } catch (emailError) {
      console.error('Error resending receipt:', emailError);
      res.status(500).json({
        success: false,
        error: 'Failed to resend receipt',
        emailError: (emailError as Error).message
      });
    }
  } catch (error) {
    console.error('Error resending receipt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// GET /api/orders/user/:email - Get all orders for a specific customer
export const getUserOrders: RequestHandler = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const orders = loadOrders();
    const userOrders = orders
      .filter(o => (o.customerEmail || '').toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, orders: userOrders, total: userOrders.length });
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/orders/:id/rate-rider - Customer rates their rider
export const rateRider: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const orders = loadOrders();
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

    orders[orderIndex].riderRating = rating;
    orders[orderIndex].riderRatedAt = new Date().toISOString();
    saveOrders(orders);

    res.json({ success: true, message: 'Rating submitted. Thank you!' });
  } catch (error) {
    console.error('Error rating rider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/riders/assigned-orders - Get orders assigned to a specific rider
export const getAssignedOrders: RequestHandler = async (req, res) => {
  try {
    const { riderId } = req.query as { riderId?: string };
    if (!riderId) return res.status(400).json({ error: 'riderId required' });

    const orders = loadOrders();
    const riderOrders = orders
      .filter(o => o.riderId === riderId || o.rider_id === riderId)
      .sort((a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime());

    res.json({ success: true, orders: riderOrders, total: riderOrders.length });
  } catch (error) {
    console.error('Error getting assigned orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
