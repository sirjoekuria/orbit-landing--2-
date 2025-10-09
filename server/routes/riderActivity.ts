import { RequestHandler } from "express";
import {
  getAllRiderActivities,
  getRiderActivities,
  getActivitiesByType,
  getOrderActivities,
  getActivityStats,
  getRiderEarningsActivities,
  calculateTotalEarningsFromActivities,
  getDetailedActivityDescription,
  logRiderActivity,
  replaceActivities,
  deleteActivityById
} from "../utils/riderActivity";

// GET /api/admin/rider-activities - Get all rider activities
export const getAllActivities: RequestHandler = (req, res) => {
  try {
    const { limit = '50', offset = '0', riderId, type, orderId } = req.query;
    
    let activities = getAllRiderActivities();
    
    // Apply filters
    if (riderId) {
      activities = activities.filter(a => a.riderId === riderId);
    }
    
    if (type) {
      activities = activities.filter(a => a.type === type);
    }
    
    if (orderId) {
      activities = activities.filter(a => a.orderId === orderId);
    }
    
    // Apply pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const paginatedActivities = activities.slice(offsetNum, offsetNum + limitNum);
    
    // Add detailed descriptions
    const activitiesWithDetails = paginatedActivities.map(activity => ({
      ...activity,
      detailedDescription: getDetailedActivityDescription(activity)
    }));

    res.json({
      success: true,
      activities: activitiesWithDetails,
      total: activities.length,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < activities.length
    });
  } catch (error) {
    console.error('Error getting rider activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/rider-activities/stats - Get activity statistics
export const getActivitiesStats: RequestHandler = (req, res) => {
  try {
    const stats = getActivityStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting activity stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/rider-activities/rider/:riderId - Get activities for specific rider
export const getRiderSpecificActivities: RequestHandler = (req, res) => {
  try {
    const { riderId } = req.params;
    const { limit = '20', type } = req.query;
    
    let activities = getRiderActivities(riderId);
    
    if (type) {
      activities = activities.filter(a => a.type === type);
    }
    
    // Apply limit
    const limitNum = parseInt(limit as string);
    const limitedActivities = activities.slice(0, limitNum);
    
    // Add detailed descriptions
    const activitiesWithDetails = limitedActivities.map(activity => ({
      ...activity,
      detailedDescription: getDetailedActivityDescription(activity)
    }));

    // Get earnings summary for this rider
    const earningsSummary = calculateTotalEarningsFromActivities(riderId);

    res.json({
      success: true,
      riderId,
      activities: activitiesWithDetails,
      total: activities.length,
      earningsSummary
    });
  } catch (error) {
    console.error('Error getting rider specific activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/rider-activities/order/:orderId - Get activities for specific order
export const getOrderSpecificActivities: RequestHandler = (req, res) => {
  try {
    const { orderId } = req.params;
    
    const activities = getOrderActivities(orderId);
    
    // Add detailed descriptions
    const activitiesWithDetails = activities.map(activity => ({
      ...activity,
      detailedDescription: getDetailedActivityDescription(activity)
    }));

    res.json({
      success: true,
      orderId,
      activities: activitiesWithDetails,
      total: activities.length
    });
  } catch (error) {
    console.error('Error getting order specific activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/rider-activities/earnings/:riderId - Get earnings-related activities for rider
export const getRiderEarningsHistory: RequestHandler = (req, res) => {
  try {
    const { riderId } = req.params;
    
    const earningsActivities = getRiderEarningsActivities(riderId);
    const earningsSummary = calculateTotalEarningsFromActivities(riderId);
    
    // Add detailed descriptions
    const activitiesWithDetails = earningsActivities.map(activity => ({
      ...activity,
      detailedDescription: getDetailedActivityDescription(activity)
    }));

    res.json({
      success: true,
      riderId,
      activities: activitiesWithDetails,
      summary: earningsSummary,
      total: earningsActivities.length
    });
  } catch (error) {
    console.error('Error getting rider earnings history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/admin/rider-activities/log - Manually log a rider activity (admin use)
export const createActivity: RequestHandler = (req, res) => {
  try {
    const {
      riderId,
      riderName,
      type,
      orderId,
      description,
      amount,
      commission,
      netEarning,
      location,
      metadata
    } = req.body;

    if (!riderId || !riderName || !type || !description) {
      return res.status(400).json({
        error: 'Missing required fields: riderId, riderName, type, and description are required'
      });
    }

    const activity = logRiderActivity({
      riderId,
      riderName,
      type,
      orderId,
      description,
      amount,
      commission,
      netEarning,
      location,
      metadata
    });

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      activity: {
        ...activity,
        detailedDescription: getDetailedActivityDescription(activity)
      }
    });
  } catch (error) {
    console.error('Error creating rider activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/rider-activities/types - Get available activity types
export const getActivityTypes: RequestHandler = (req, res) => {
  try {
    const types = [
      { value: 'order_assigned', label: 'Order Assigned', color: 'blue' },
      { value: 'pickup_completed', label: 'Pickup Completed', color: 'orange' },
      { value: 'delivery_completed', label: 'Delivery Completed', color: 'green' },
      { value: 'payment_received', label: 'Payment Received', color: 'purple' },
      { value: 'status_change', label: 'Status Change', color: 'gray' },
      { value: 'earnings_added', label: 'Earnings Added', color: 'emerald' },
      { value: 'login', label: 'Login', color: 'indigo' },
      { value: 'logout', label: 'Logout', color: 'red' }
    ];

    res.json({
      success: true,
      types
    });
  } catch (error) {
    console.error('Error getting activity types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/admin/rider-activities/:id - Delete activity by id
export const deleteActivity: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const ok = deleteActivityById(id);
    if (!ok) return res.status(404).json({ error: 'Activity not found' });
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/admin/rider-activities/export?format=csv|json - export activities
export const exportActivities: RequestHandler = (req, res) => {
  try {
    const format = (req.query.format as string) || 'json';
    const activities = getAllRiderActivities();
    if (format === 'csv') {
      const headers = ['id','riderId','riderName','type','orderId','description','amount','commission','netEarning','location','timestamp'];
      const rows = activities.map(a => headers.map(h => {
        const v = (a as any)[h];
        if (v === undefined || v === null) return '';
        return typeof v === 'string' ? v.replace(/\"/g,'"') : v.toString();
      }).join(','));
      const csv = headers.join(',') + '\n' + rows.join('\n');
      res.setHeader('Content-Type','text/csv');
      res.setHeader('Content-Disposition','attachment; filename="activities.csv"');
      res.send(csv);
      return;
    }

    res.setHeader('Content-Type','application/json');
    res.setHeader('Content-Disposition','attachment; filename="activities.json"');
    res.send(JSON.stringify(activities, null, 2));
  } catch (error) {
    console.error('Error exporting activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/admin/rider-activities/import - import activities (JSON array in body)
export const importActivities: RequestHandler = (req, res) => {
  try {
    const payload = req.body;
    if (!Array.isArray(payload)) return res.status(400).json({ error: 'Expected an array of activities in request body' });

    // Basic validation
    const parsed = payload.map((p: any, idx: number) => {
      if (!p.id) p.id = `ACT-IMP-${Date.now()}-${idx}`;
      return p;
    });

    // Replace activities
    replaceActivities(parsed as any);

    res.json({ success: true, imported: parsed.length });
  } catch (error) {
    console.error('Error importing activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
