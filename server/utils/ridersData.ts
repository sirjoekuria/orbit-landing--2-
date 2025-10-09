// Riders Data Utility
// Provides functions to get rider data for automated payments

// This would typically import from your main riders data source
// For now, we'll create a simple interface to the riders data

interface RiderData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  currentBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  status: string;
  isActive: boolean;
}

// In production, this would connect to your database
// For now, we'll use the same data structure as the riders route
let ridersData: RiderData[] = [];

// Get all riders
export const getAllRiders = (): RiderData[] => {
  return ridersData;
};

// Get riders with balance for automated payments
export const getRidersWithBalance = (): RiderData[] => {
  return ridersData.filter(rider => 
    rider.status === 'approved' && 
    rider.isActive && 
    rider.currentBalance > 0
  );
};

// Get specific rider by ID
export const getRiderById = (riderId: string): RiderData | null => {
  return ridersData.find(rider => rider.id === riderId) || null;
};

// Update rider balance (after payment)
export const updateRiderBalance = (riderId: string, newBalance: number, withdrawnAmount: number): boolean => {
  const riderIndex = ridersData.findIndex(rider => rider.id === riderId);
  
  if (riderIndex === -1) {
    return false;
  }
  
  const rider = ridersData[riderIndex];
  rider.currentBalance = newBalance;
  rider.totalWithdrawn = (rider.totalWithdrawn || 0) + withdrawnAmount;
  
  console.log(`💳 Updated rider ${rider.fullName}: Balance = KES ${newBalance}, Total Withdrawn = KES ${rider.totalWithdrawn}`);
  
  return true;
};

// Add earnings to rider (when delivery is completed)
export const addRiderEarnings = (riderId: string, earnings: number): boolean => {
  const riderIndex = ridersData.findIndex(rider => rider.id === riderId);
  
  if (riderIndex === -1) {
    return false;
  }
  
  const rider = ridersData[riderIndex];
  rider.currentBalance = (rider.currentBalance || 0) + earnings;
  rider.totalEarnings = (rider.totalEarnings || 0) + earnings;
  
  console.log(`💰 Added earnings to ${rider.fullName}: +KES ${earnings}, New Balance = KES ${rider.currentBalance}`);
  
  return true;
};

// Get rider balance summary
export const getRiderBalanceSummary = () => {
  const ridersWithBalance = getRidersWithBalance();
  
  const summary = {
    totalRiders: ridersData.length,
    activeRiders: ridersData.filter(r => r.isActive && r.status === 'approved').length,
    ridersWithBalance: ridersWithBalance.length,
    totalPendingBalance: ridersWithBalance.reduce((sum, rider) => sum + rider.currentBalance, 0),
    averageBalance: ridersWithBalance.length > 0 
      ? ridersWithBalance.reduce((sum, rider) => sum + rider.currentBalance, 0) / ridersWithBalance.length 
      : 0,
    highestBalance: Math.max(...ridersWithBalance.map(r => r.currentBalance), 0),
    lowestBalance: ridersWithBalance.length > 0 
      ? Math.min(...ridersWithBalance.map(r => r.currentBalance)) 
      : 0
  };
  
  return summary;
};

// Validate rider for withdrawal
export const validateRiderForWithdrawal = (riderId: string): {
  valid: boolean;
  rider?: RiderData;
  error?: string;
} => {
  const rider = getRiderById(riderId);
  
  if (!rider) {
    return { valid: false, error: 'Rider not found' };
  }
  
  if (rider.status !== 'approved') {
    return { valid: false, error: 'Rider not approved for withdrawals' };
  }
  
  if (!rider.isActive) {
    return { valid: false, error: 'Rider account is not active' };
  }
  
  if (rider.currentBalance <= 0) {
    return { valid: false, error: 'No balance available for withdrawal' };
  }
  
  return { valid: true, rider };
};

// Get payment statistics
export const getPaymentStatistics = () => {
  const all = getAllRiders();
  const withBalance = getRidersWithBalance();
  
  return {
    riders: {
      total: all.length,
      approved: all.filter(r => r.status === 'approved').length,
      active: all.filter(r => r.isActive).length,
      withBalance: withBalance.length
    },
    balances: {
      totalPending: withBalance.reduce((sum, r) => sum + r.currentBalance, 0),
      totalEarnings: all.reduce((sum, r) => sum + (r.totalEarnings || 0), 0),
      totalWithdrawn: all.reduce((sum, r) => sum + (r.totalWithdrawn || 0), 0),
      averagePending: withBalance.length > 0 
        ? withBalance.reduce((sum, r) => sum + r.currentBalance, 0) / withBalance.length 
        : 0
    },
    eligible: {
      forAutoPay: withBalance.filter(r => r.currentBalance > 0).length,
      forWithdrawal: withBalance.filter(r => r.currentBalance >= 50).length // Minimum 50 for withdrawal
    }
  };
};

// Mock function to simulate updating rider data from main riders system
export const syncRiderData = async (): Promise<void> => {
  // In production, this would fetch latest data from the main riders database
  console.log('🔄 Syncing rider data for payment processing...');
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('✅ Rider data synced successfully');
};
