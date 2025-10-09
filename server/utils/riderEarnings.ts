// Utility functions for rider earnings management
// This allows shared access to rider data between routes

// Import the riders array from the riders route
// Note: In production, this would be a database operation

let riders: any[] = [];

// Initialize riders array (this should match the riders.ts file)
const initializeRiders = () => {
  if (riders.length === 0) {
    riders = [
      {
        id: 'RD-001',
        fullName: 'John Mwangi',
        email: 'john.mwangi@example.com',
        phone: '+254 712 345 678',
        nationalId: '12345678',
        motorcycle: 'Honda CB 150R, 2020',
        experience: '3-5 years',
        area: 'Westlands',
        motivation: 'I want to earn extra income and provide excellent delivery service to customers.',
        status: 'approved',
        rating: 4.8,
        totalDeliveries: 156,
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        currentBalance: 12480, // KES
        totalEarnings: 24960, // KES
        totalWithdrawn: 12480, // KES
        lastWithdrawal: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        earnings: []
      },
      {
        id: 'RD-002',
        fullName: 'Peter Kimani',
        email: 'peter.kimani@example.com',
        phone: '+254 700 123 456',
        nationalId: '87654321',
        motorcycle: 'Yamaha YBR 125, 2019',
        experience: '5+ years',
        area: 'CBD',
        motivation: 'I have extensive experience in Nairobi and want to help businesses with reliable delivery.',
        status: 'approved',
        rating: 4.9,
        totalDeliveries: 203,
        joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        currentBalance: 8960, // KES
        totalEarnings: 32480, // KES
        totalWithdrawn: 23520, // KES
        lastWithdrawal: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        earnings: []
      }
    ];
  }
};

// Find rider by name (for backward compatibility with orders that only have name)
export const findRiderByName = (riderName: string) => {
  initializeRiders();
  return riders.find(r => r.fullName === riderName || r.fullName.includes(riderName));
};

// Find rider by ID
export const findRiderById = (riderId: string) => {
  initializeRiders();
  return riders.find(r => r.id === riderId);
};

// Add earning to a rider
export const addEarningToRider = (riderId: string, orderData: {
  orderId: string;
  orderAmount: number;
  deliveryDate: string;
}) => {
  initializeRiders();
  
  const riderIndex = riders.findIndex(r => r.id === riderId);
  if (riderIndex === -1) {
    return { success: false, error: 'Rider not found' };
  }

  const rider = riders[riderIndex];

  // Calculate commission (20% to company, 80% to rider)
  const commission = orderData.orderAmount * 0.20;
  const riderEarning = orderData.orderAmount * 0.80;

  // Create earning record
  const earning = {
    orderId: orderData.orderId,
    amount: orderData.orderAmount,
    commission,
    riderEarning,
    deliveryDate: orderData.deliveryDate,
    status: 'pending'
  };

  // Update rider data
  if (!rider.earnings) rider.earnings = [];
  rider.earnings.push(earning);

  rider.currentBalance = (rider.currentBalance || 0) + riderEarning;
  rider.totalEarnings = (rider.totalEarnings || 0) + riderEarning;
  rider.totalDeliveries = (rider.totalDeliveries || 0) + 1;

  return {
    success: true,
    earning,
    newBalance: rider.currentBalance,
    totalEarnings: rider.totalEarnings,
    rider: {
      id: rider.id,
      fullName: rider.fullName,
      email: rider.email
    }
  };
};

// Get rider details for earnings
export const getRiderEarningsData = (riderId: string) => {
  initializeRiders();
  
  const rider = riders.find(r => r.id === riderId);
  if (!rider) {
    return null;
  }

  return {
    riderId: rider.id,
    fullName: rider.fullName,
    email: rider.email,
    currentBalance: rider.currentBalance || 0,
    totalEarnings: rider.totalEarnings || 0,
    totalWithdrawn: rider.totalWithdrawn || 0,
    lastWithdrawal: rider.lastWithdrawal,
    earnings: rider.earnings || [],
    totalDeliveries: rider.totalDeliveries || 0,
    rating: rider.rating || 0
  };
};
