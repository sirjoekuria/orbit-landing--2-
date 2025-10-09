// Rider Activity Tracking System
// This tracks all rider activities and links them to earnings for accountability

export interface RiderActivity {
  id: string;
  riderId: string;
  riderName: string;
  type: 'order_assigned' | 'pickup_completed' | 'delivery_completed' | 'payment_received' | 'status_change' | 'earnings_added' | 'login' | 'logout';
  orderId?: string;
  description: string;
  amount?: number;
  commission?: number;
  netEarning?: number;
  location?: string;
  timestamp: string;
  metadata?: {
    customerName?: string;
    customerPhone?: string;
    pickupLocation?: string;
    deliveryLocation?: string;
    paymentMethod?: string;
    previousStatus?: string;
    newStatus?: string;
    balanceChange?: number;
    newBalance?: number;
  };
}

import fs from 'fs';
import path from 'path';

// In-memory storage for activities (persisted to disk in server/data/activities.json)
let riderActivities: RiderActivity[] = [];
let activityIdCounter = 1;

const ACTIVITIES_FILE = path.join(process.cwd(), 'server', 'data', 'activities.json');

function loadActivitiesFromFile() {
  try {
    if (!fs.existsSync(ACTIVITIES_FILE)) return [];
    const raw = fs.readFileSync(ACTIVITIES_FILE, 'utf-8');
    const arr = JSON.parse(raw || '[]');
    return arr as RiderActivity[];
  } catch (e) {
    console.error('Failed to load activities from file:', e);
    return [];
  }
}

function saveActivitiesToFile() {
  try {
    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(riderActivities, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save activities to file:', e);
  }
}

// Initialize from disk (no sample/test data)
riderActivities = loadActivitiesFromFile();
activityIdCounter = riderActivities.length ? (Math.max(...riderActivities.map(a => {
  const m = a.id?.match(/ACT-(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
})) + 1) : 1;

// Log a new rider activity
export const logRiderActivity = (activity: Omit<RiderActivity, 'id' | 'timestamp'>): RiderActivity => {
  const newActivity: RiderActivity = {
    ...activity,
    id: `ACT-${activityIdCounter.toString().padStart(3, '0')}`,
    timestamp: new Date().toISOString()
  };

  riderActivities.unshift(newActivity); // Add to beginning for newest first
  activityIdCounter++;

  // persist
  saveActivitiesToFile();

  console.log(`📝 Rider Activity Logged: ${newActivity.riderName} - ${newActivity.description}`);

  return newActivity;
};

// Get all activities for a specific rider
export const getRiderActivities = (riderId: string): RiderActivity[] => {
  return riderActivities.filter(activity => activity.riderId === riderId);
};

// Get all activities
export const getAllRiderActivities = (): RiderActivity[] => {
  return riderActivities;
};

// Get activities by type
export const getActivitiesByType = (type: RiderActivity['type']): RiderActivity[] => {
  return riderActivities.filter(activity => activity.type === type);
};

// Get activities for a specific order
export const getOrderActivities = (orderId: string): RiderActivity[] => {
  return riderActivities.filter(activity => activity.orderId === orderId);
};

// Get activities within a date range
export const getActivitiesInRange = (startDate: Date, endDate: Date): RiderActivity[] => {
  return riderActivities.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    return activityDate >= startDate && activityDate <= endDate;
  });
};

// Get earnings-related activities for a rider
export const getRiderEarningsActivities = (riderId: string): RiderActivity[] => {
  return riderActivities.filter(activity => 
    activity.riderId === riderId && 
    (activity.type === 'delivery_completed' || activity.type === 'payment_received' || activity.type === 'earnings_added')
  );
};

// Calculate total earnings from activities
export const calculateTotalEarningsFromActivities = (riderId: string): {
  totalEarned: number;
  totalPaid: number;
  currentBalance: number;
  deliveryCount: number;
} => {
  const earningsActivities = getRiderEarningsActivities(riderId);
  
  let totalEarned = 0;
  let totalPaid = 0;
  let deliveryCount = 0;

  earningsActivities.forEach(activity => {
    if (activity.type === 'delivery_completed' && activity.netEarning) {
      totalEarned += activity.netEarning;
      deliveryCount++;
    } else if (activity.type === 'payment_received' && activity.amount) {
      totalPaid += activity.amount;
    }
  });

  return {
    totalEarned,
    totalPaid,
    currentBalance: totalEarned - totalPaid,
    deliveryCount
  };
};

// Helper function to format activity description with more details
export const getDetailedActivityDescription = (activity: RiderActivity): string => {
  const baseDesc = activity.description;
  
  switch (activity.type) {
    case 'delivery_completed':
      return `${baseDesc} | Earned: KES ${activity.netEarning?.toFixed(2)} (after 20% commission)`;
    case 'payment_received':
      return `${baseDesc} | Balance reduced by KES ${activity.amount?.toFixed(2)}`;
    case 'order_assigned':
      return `${baseDesc} | Route: ${activity.metadata?.pickupLocation} → ${activity.metadata?.deliveryLocation}`;
    case 'pickup_completed':
      return `${baseDesc} | Next: Deliver to ${activity.metadata?.deliveryLocation}`;
    default:
      return baseDesc;
  }
};

// Get activity statistics
export const replaceActivities = (newActivities: RiderActivity[]) => {
  riderActivities = newActivities || [];
  activityIdCounter = riderActivities.length ? (Math.max(...riderActivities.map(a => {
    const m = a.id?.match(/ACT-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  })) + 1) : 1;
  saveActivitiesToFile();
};

export const deleteActivityById = (id: string): boolean => {
  const idx = riderActivities.findIndex(a => a.id === id);
  if (idx === -1) return false;
  riderActivities.splice(idx, 1);
  saveActivitiesToFile();
  return true;
};

export const getActivityStats = (): {
  totalActivities: number;
  todayActivities: number;
  weekActivities: number;
  deliveriesCompleted: number;
  paymentsProcessed: number;
  activeRiders: number;
} => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayActivities = riderActivities.filter(a => new Date(a.timestamp) >= todayStart).length;
  const weekActivities = riderActivities.filter(a => new Date(a.timestamp) >= weekStart).length;
  const deliveriesCompleted = riderActivities.filter(a => a.type === 'delivery_completed').length;
  const paymentsProcessed = riderActivities.filter(a => a.type === 'payment_received').length;
  
  const activeRiders = new Set(
    riderActivities
      .filter(a => new Date(a.timestamp) >= weekStart)
      .map(a => a.riderId)
  ).size;

  return {
    totalActivities: riderActivities.length,
    todayActivities,
    weekActivities,
    deliveriesCompleted,
    paymentsProcessed,
    activeRiders
  };
};
