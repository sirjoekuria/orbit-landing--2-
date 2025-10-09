import { RequestHandler } from "express";
import { sendOrderReceipt, sendAdminNotification, sendRiderEarningsReceipt } from "../services/emailService";
import { findRiderByName, addEarningToRider } from "../utils/riderEarnings";
import { logRiderActivity } from "../utils/riderActivity";

// In-memory storage for orders (in production, use a proper database)
let orders: any[] = [];
let orderIdCounter = 1;

// Sample data for demonstration
const sampleOrders = [
  {
    id: 'RC-2024-001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '+254 712 345 678',
    pickup: 'Westlands Shopping Mall, Nairobi',
    delivery: 'KICC, Nairobi CBD',
    distance: 5.2,
    cost: 156,
    currentStatus: 'in_transit',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    riderName: 'Peter Kimani',
    riderPhone: '+254 700 123 456',
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: 'Order received and is being processed'
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
        description: 'Order confirmed and rider assigned'
      },
      {
        status: 'picked_up',
        timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        description: 'Package picked up from Westlands Shopping Mall'
      },
      {
        status: 'in_transit',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        description: 'Package is on the way to destination'
      }
    ]
  },
  {
    id: 'RC-2024-002',
    customerName: 'Mary Wanjiku',
    customerEmail: 'mary.wanjiku@example.com',
    customerPhone: '+254 722 987 654',
    pickup: 'Karen Shopping Centre',
    delivery: 'Yaya Centre, Kilimani',
    distance: 8.1,
    cost: 243,
    currentStatus: 'delivered',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    riderName: 'James Mwangi',
    riderPhone: '+254 701 987 654',
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        description: 'Order received and is being processed'
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 220 * 60 * 1000).toISOString(),
        description: 'Order confirmed and rider assigned'
      },
      {
        status: 'picked_up',
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        description: 'Package picked up from Karen Shopping Centre'
      },
      {
        status: 'in_transit',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        description: 'Package is on the way to destination'
      },
      {
        status: 'delivered',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        description: 'Package delivered successfully to Yaya Centre'
      }
    ]
  }
];

// Initialize with sample data
orders = [];
orderIdCounter = 1;

// POST /api/orders - Create a new order
export const createOrder: RequestHandler = (req, res) => {
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

    const newOrder = {
      id: `RC-2024-${orderIdCounter.toString().padStart(3, '0')}`,
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
    orderIdCounter++;

    res.status(201).json({ 
      success: true, 
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/orders/track/:id - Get order tracking information
export const trackOrder: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const order = orders.find(order => order.id === id);
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
export const getOrders: RequestHandler = (req, res) => {
  try {
    // Sort orders by creation date (newest first)
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({ 
      success: true, 
      orders: sortedOrders,
      total: orders.length 
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

    const orderIndex = orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];
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

    order.statusHistory.push({
      status,
      timestamp: now,
      description: statusDescriptions[status as keyof typeof statusDescriptions]
    });

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

    // Assign rider info when confirmed
    if (status === 'confirmed' && !order.riderName) {
      // Rider must be assigned explicitly via the assign-rider endpoint
    }

    // Send email receipt when order is confirmed
    if (status === 'confirmed') {
      try {
        const emailSent = await sendOrderReceipt(order);
        if (emailSent) {
          console.log(`Receipt email sent successfully to ${order.customerEmail}`);
          // Also notify admin
          await sendAdminNotification(order);
        } else {
          console.log(`Failed to send receipt email to ${order.customerEmail}`);
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Continue with the response even if email fails
      }
    }

    // Process rider earnings when order is delivered
    if (status === 'delivered' && order.riderName) {
      try {
        console.log(`Order ${order.id} delivered - Processing rider earnings for ${order.riderName}`);
        console.log(`Order amount: KES ${order.cost}, Rider will earn: KES ${(order.cost * 0.8).toFixed(2)} (80%)`);

        // Find rider and add earning
        let rider = null;
        if (order.riderId) {
          // Try to find by ID first
          rider = findRiderByName(order.riderName); // Using findRiderByName for now since we have the full mapping
        } else {
          // Fallback to finding by name
          rider = findRiderByName(order.riderName);
        }

        if (rider) {
          const earningResult = addEarningToRider(rider.id, {
            orderId: order.id,
            orderAmount: order.cost,
            deliveryDate: now
          });

          if (earningResult.success) {
            console.log(`✅ Rider earning processed successfully:`, earningResult);

            // Log rider activity for delivery completion with earnings
            logRiderActivity({
              riderId: rider.id,
              riderName: rider.fullName,
              type: 'delivery_completed',
              orderId: order.id,
              description: `Successfully delivered order ${order.id} to ${order.delivery}`,
              amount: order.cost,
              commission: order.cost * 0.2,
              netEarning: order.cost * 0.8,
              location: order.delivery,
              metadata: {
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                pickupLocation: order.pickup,
                deliveryLocation: order.delivery,
                balanceChange: order.cost * 0.8,
                newBalance: earningResult.newBalance
              }
            });

            // Send earnings receipt email to rider
            try {
              const riderEarning = order.cost * 0.8;
              const commission = order.cost * 0.2;

              const earningData = {
                riderId: rider.id,
                riderName: rider.fullName,
                riderEmail: rider.email,
                orderId: order.id,
                orderAmount: order.cost,
                riderEarning,
                commission,
                newBalance: earningResult.newBalance,
                totalEarnings: earningResult.totalEarnings,
                deliveryDate: now,
                customerName: order.customerName,
                pickupLocation: order.pickup,
                deliveryLocation: order.delivery
              };

              await sendRiderEarningsReceipt(earningData);
              console.log(`📧 Earnings receipt sent to rider ${rider.fullName}`);
            } catch (emailError) {
              console.error('Error sending earnings receipt:', emailError);
            }
          } else {
            console.error('Failed to add rider earning:', earningResult.error);
          }
        } else {
          console.log(`⚠️ Rider ${order.riderName} not found in system - earnings will need to be manually processed`);
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
export const assignRiderToOrder: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { riderId, riderName, riderPhone } = req.body;

    if (!riderId || !riderName || !riderPhone) {
      return res.status(400).json({
        error: 'Missing required fields: riderId, riderName, and riderPhone'
      });
    }

    const orderIndex = orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];
    const now = new Date().toISOString();

    // Update order with rider info
    order.riderName = riderName;
    order.riderPhone = riderPhone;
    order.riderId = riderId;
    order.updatedAt = now;

    // Update status to confirmed if it's pending
    if (order.currentStatus === 'pending') {
      order.currentStatus = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        timestamp: now,
        description: `Order confirmed and assigned to ${riderName}`
      });
    } else {
      // Add rider assignment to history
      order.statusHistory.push({
        status: order.currentStatus,
        timestamp: now,
        description: `Rider assigned: ${riderName}`
      });
    }

    // Log rider activity for order assignment
    logRiderActivity({
      riderId: riderId,
      riderName: riderName,
      type: 'order_assigned',
      orderId: order.id,
      description: `Assigned to delivery order ${order.id} (${order.pickup} → ${order.delivery})`,
      location: order.pickup,
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

    const orderIndex = orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];
    const now = new Date().toISOString();

    // Update payment status and add timestamp
    order.paymentConfirmed = true;
    order.paymentConfirmedAt = now;
    order.updatedAt = now;

    // If order is still pending, update to confirmed
    if (order.currentStatus === 'pending') {
      order.currentStatus = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        timestamp: now,
        description: 'Payment confirmed and order confirmed by admin'
      });
    }

    // Add payment confirmation to status history
    order.statusHistory.push({
      status: 'payment_confirmed',
      timestamp: now,
      description: 'Payment confirmed by admin - Receipt sent to customer'
    });

    try {
      // Send receipt email
      const emailSent = await sendOrderReceipt(order);
      if (emailSent) {
        console.log(`Payment confirmation receipt sent to ${order.customerEmail}`);
        // Notify admin
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
        emailError: emailError.message
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

    const order = orders.find(order => order.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    try {
      const emailSent = await sendOrderReceipt(order);
      if (emailSent) {
        console.log(`Receipt resent to ${order.customerEmail}`);

        res.json({
          success: true,
          message: 'Receipt resent successfully',
          emailSent: true,
          customerEmail: order.customerEmail
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
        emailError: emailError.message
      });
    }
  } catch (error) {
    console.error('Error resending receipt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
