import { RequestHandler } from "express";
import { aiService } from "../services/aiService";
import { DatabaseService } from "../services/database";

// AI Health Check
export const aiHealthCheck: RequestHandler = async (req, res) => {
  try {
    const health = await aiService.healthCheck();
    res.json(health);
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({ 
      error: 'AI service health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Smart Route Optimization
export const optimizeRoutes: RequestHandler = async (req, res) => {
  try {
    const { orders, riders } = req.body;

    if (!orders || !riders) {
      return res.status(400).json({ 
        error: 'Orders and riders data are required' 
      });
    }

    const optimizedRoutes = await aiService.optimizeRoute(orders, riders);
    
    res.json({
      message: 'Routes optimized successfully',
      optimizedRoutes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    res.status(500).json({ 
      error: 'Route optimization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Demand Prediction
export const predictDemand: RequestHandler = async (req, res) => {
  try {
    const { location, timeHorizon = 24 } = req.body;

    if (!location) {
      return res.status(400).json({ 
        error: 'Location data is required' 
      });
    }

    const prediction = await aiService.predictDemand(location, timeHorizon);
    
    res.json({
      message: 'Demand prediction completed',
      prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Demand prediction error:', error);
    res.status(500).json({ 
      error: 'Demand prediction failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// AI Customer Support
export const aiCustomerSupport: RequestHandler = async (req, res) => {
  try {
    const { message, customerId, orderId } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Customer message is required' 
      });
    }

    // Get context if customer ID or order ID provided
    let context = {};
    if (customerId) {
      const customer = await DatabaseService.getUserById(customerId);
      if (customer) {
        context = { customer: { id: customer.id, email: customer.email, userType: customer.user_type } };
      }
    }
    
    if (orderId) {
      const order = await DatabaseService.getOrderById(orderId);
      if (order) {
        context = { ...context, order: { id: order.id, status: order.status, totalAmount: order.total_amount } };
      }
    }

    const response = await aiService.generateSupportResponse(message, context);
    
    res.json({
      message: 'AI support response generated',
      response,
      context,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI customer support error:', error);
    res.status(500).json({ 
      error: 'AI customer support failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Dynamic Pricing
export const calculateDynamicPrice: RequestHandler = async (req, res) => {
  try {
    const { basePrice, location, timeOfDay } = req.body;

    if (!basePrice || !location) {
      return res.status(400).json({ 
        error: 'Base price and location are required' 
      });
    }

    // Get current demand and supply data
    const orders = await DatabaseService.getOrders();
    const riders = await DatabaseService.getRiders();
    
    const activeOrders = orders.filter(order => 
      ['pending', 'assigned', 'picked_up', 'in_transit'].includes(order.status)
    );
    
    const availableRiders = riders.filter(rider => 
      rider.is_active && rider.status === 'approved'
    );

    const demand = activeOrders.length;
    const supply = availableRiders.length;

    const dynamicPrice = await aiService.calculateDynamicPrice(
      basePrice, 
      demand, 
      supply, 
      { ...location, timeOfDay }
    );
    
    res.json({
      message: 'Dynamic price calculated',
      basePrice,
      dynamicPrice,
      demand,
      supply,
      multiplier: dynamicPrice / basePrice,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dynamic pricing error:', error);
    res.status(500).json({ 
      error: 'Dynamic pricing calculation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Fraud Detection
export const detectFraud: RequestHandler = async (req, res) => {
  try {
    const { orderId, userId, paymentId } = req.body;

    if (!orderId || !userId || !paymentId) {
      return res.status(400).json({ 
        error: 'Order ID, User ID, and Payment ID are required' 
      });
    }

    // Get order, user, and payment data
    const [order, user, payment] = await Promise.all([
      DatabaseService.getOrderById(orderId),
      DatabaseService.getUserById(userId),
      DatabaseService.getPaymentById(paymentId)
    ]);

    if (!order || !user || !payment) {
      return res.status(404).json({ 
        error: 'Order, user, or payment not found' 
      });
    }

    const fraudAnalysis = await aiService.detectFraud(order, user, payment);
    
    res.json({
      message: 'Fraud detection completed',
      fraudAnalysis,
      orderId,
      userId,
      paymentId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Fraud detection error:', error);
    res.status(500).json({ 
      error: 'Fraud detection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Sentiment Analysis
export const analyzeSentiment: RequestHandler = async (req, res) => {
  try {
    const { text, source = 'general', messageId } = req.body;

    if (!text) {
      return res.status(400).json({ 
        error: 'Text content is required for sentiment analysis' 
      });
    }

    const sentimentAnalysis = await aiService.analyzeSentiment(text, source);
    
    // If messageId provided, update the message with sentiment data
    if (messageId) {
      try {
        await DatabaseService.updateMessage(messageId, {
          metadata: { sentiment: sentimentAnalysis }
        });
      } catch (updateError) {
        console.warn('Failed to update message with sentiment:', updateError);
      }
    }
    
    res.json({
      message: 'Sentiment analysis completed',
      sentimentAnalysis,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      source,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ 
      error: 'Sentiment analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Bulk Sentiment Analysis for Messages
export const bulkSentimentAnalysis: RequestHandler = async (req, res) => {
  try {
    const { limit = 50, source = 'messages' } = req.query;

    // Get recent messages
    const messages = await DatabaseService.getMessages();
    const recentMessages = messages.slice(0, parseInt(limit as string));

    const results = [];
    
    for (const message of recentMessages) {
      try {
        const sentimentAnalysis = await aiService.analyzeSentiment(
          message.message, 
          source as string
        );
        
        // Update message with sentiment data
        await DatabaseService.updateMessage(message.id, {
          metadata: { sentiment: sentimentAnalysis }
        });
        
        results.push({
          messageId: message.id,
          sentiment: sentimentAnalysis,
          subject: message.subject
        });
      } catch (error) {
        console.error(`Failed to analyze sentiment for message ${message.id}:`, error);
        results.push({
          messageId: message.id,
          error: 'Analysis failed',
          subject: message.subject
        });
      }
    }
    
    res.json({
      message: 'Bulk sentiment analysis completed',
      totalProcessed: results.length,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bulk sentiment analysis error:', error);
    res.status(500).json({ 
      error: 'Bulk sentiment analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// AI Insights Dashboard
export const getAIInsights: RequestHandler = async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;

    // Get recent data for insights
    const [orders, activities, messages] = await Promise.all([
      DatabaseService.getOrders(),
      DatabaseService.getActivities(),
      DatabaseService.getMessages()
    ]);

    // Calculate basic insights
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    const totalActivities = activities.length;
    const recentActivities = activities.filter(activity => {
      const activityTime = new Date(activity.timestamp);
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      return activityTime > cutoffTime;
    });

    const totalMessages = messages.length;
    const unreadMessages = messages.filter(message => message.status === 'unread').length;

    // Analyze sentiment of recent messages
    let averageSentiment = 0;
    let sentimentCount = 0;
    
    for (const message of messages.slice(0, 10)) { // Analyze last 10 messages
      try {
        const sentiment = await aiService.analyzeSentiment(message.message, 'support');
        averageSentiment += sentiment.score;
        sentimentCount++;
      } catch (error) {
        console.warn('Failed to analyze sentiment for insight:', error);
      }
    }

    if (sentimentCount > 0) {
      averageSentiment = averageSentiment / sentimentCount;
    }

    const insights = {
      orders: {
        total: totalOrders,
        completed: completedOrders,
        completionRate: Math.round(completionRate * 100) / 100
      },
      activities: {
        total: totalActivities,
        recent: recentActivities.length
      },
      messages: {
        total: totalMessages,
        unread: unreadMessages,
        averageSentiment: Math.round(averageSentiment * 100) / 100
      },
      aiFeatures: {
        smartRouting: process.env.ENABLE_SMART_ROUTING === 'true',
        demandPrediction: process.env.ENABLE_DEMAND_PREDICTION === 'true',
        customerSupport: process.env.ENABLE_CUSTOMER_SUPPORT_AI === 'true',
        dynamicPricing: process.env.ENABLE_DYNAMIC_PRICING === 'true',
        fraudDetection: process.env.ENABLE_FRAUD_DETECTION === 'true',
        sentimentAnalysis: process.env.ENABLE_SENTIMENT_ANALYSIS === 'true'
      }
    };
    
    res.json({
      message: 'AI insights generated',
      insights,
      timeRange,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
