import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Phone,
  User,
  ArrowLeft,
  Calculator
} from 'lucide-react';

// Mock rider data - in production this would come from authentication
const mockRider = {
  id: 'RD-001',
  fullName: 'John Mwangi',
  phone: '+254 712 345 678',
  email: 'john.mwangi@example.com',
  currentBalance: 2480,
  totalEarnings: 15680,
  totalWithdrawn: 13200
};

export default function RiderWithdrawal() {
  const [rider] = useState(mockRider);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawalFee, setWithdrawalFee] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  // Calculate withdrawal fee
  useEffect(() => {
    const amount = parseFloat(withdrawalAmount) || 0;
    if (amount > 0) {
      const fee = amount < 1000 ? 20 : 50;
      setWithdrawalFee(fee);
      setNetAmount(amount - fee);
    } else {
      setWithdrawalFee(0);
      setNetAmount(0);
    }
  }, [withdrawalAmount]);

  // Sample recent requests
  useEffect(() => {
    setRecentRequests([
      {
        id: 'WR-001',
        amount: 1200,
        fee: 50,
        netAmount: 1150,
        status: 'approved',
        requestedAt: '2024-01-15T10:30:00Z',
        processedAt: '2024-01-15T14:20:00Z'
      },
      {
        id: 'WR-002',
        amount: 800,
        fee: 20,
        netAmount: 780,
        status: 'pending',
        requestedAt: '2024-01-14T16:45:00Z'
      }
    ]);
  }, []);

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawalAmount);
    
    if (!amount || amount <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }

    if (amount > rider.currentBalance) {
      alert('Insufficient balance for withdrawal');
      return;
    }

    if (netAmount <= 0) {
      alert('Withdrawal amount too small after deducting fees');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`✅ Withdrawal Request Submitted Successfully!\n\nAmount: KES ${amount.toLocaleString()}\nFee: KES ${withdrawalFee}\nNet Amount: KES ${netAmount.toLocaleString()}\n\nYour request will be processed within 24 hours.`);
      
      // Reset form
      setWithdrawalAmount('');
      setNotes('');
      
      // Add to recent requests
      const newRequest = {
        id: `WR-${Date.now()}`,
        amount,
        fee: withdrawalFee,
        netAmount,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        notes
      };
      
      setRecentRequests([newRequest, ...recentRequests]);
      
    } catch (error) {
      alert('Failed to submit withdrawal request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.history.back()}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-rocs-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">RC</span>
              </div>
              <h1 className="text-xl font-bold text-rocs-green">Withdrawal Request</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Balance</div>
              <div className="text-lg font-bold text-rocs-green">KES {rider.currentBalance.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <DollarSign className="w-6 h-6 text-rocs-green" />
                <h2 className="text-xl font-semibold text-gray-900">Request Early Withdrawal</h2>
              </div>

              {/* Rider Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Rider Name</div>
                      <div className="font-medium">{rider.fullName}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Phone Number</div>
                      <div className="font-medium">{rider.phone}</div>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleWithdrawal} className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Amount (KES)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="amount"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      min="1"
                      max={rider.currentBalance}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rocs-green text-lg"
                      placeholder="Enter amount to withdraw"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Calculator className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum withdrawal: KES {rider.currentBalance.toLocaleString()}
                  </p>
                </div>

                {/* Fee Calculation */}
                {withdrawalAmount && parseFloat(withdrawalAmount) > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-medium text-blue-800 mb-3">Withdrawal Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Requested Amount:</span>
                        <span className="font-medium text-blue-900">KES {parseFloat(withdrawalAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">
                          Withdrawal Fee ({parseFloat(withdrawalAmount) < 1000 ? 'Below KES 1,000' : 'KES 1,000+'}):</span>
                        <span className="font-medium text-red-600">-KES {withdrawalFee}</span>
                      </div>
                      <div className="border-t border-blue-200 pt-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-800">Net Amount You'll Receive:</span>
                          <span className="font-bold text-green-600 text-lg">KES {netAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Early Withdrawal (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rocs-green resize-none"
                    placeholder="e.g., Emergency medical expenses, motorcycle maintenance..."
                  />
                </div>

                {/* Fee Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Withdrawal Fee Information:</p>
                      <ul className="space-y-1">
                        <li>• Withdrawals below KES 1,000: KES 20 fee</li>
                        <li>• Withdrawals KES 1,000 and above: KES 50 fee</li>
                        <li>• Fees are automatically deducted from your withdrawal amount</li>
                        <li>• Regular automated payments at 23:00 have no fees</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || netAmount <= 0}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    loading || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || netAmount <= 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-rocs-green text-white hover:bg-rocs-green-dark'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Submit Withdrawal Request</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Current Balance</div>
                  <div className="text-2xl font-bold text-rocs-green">KES {rider.currentBalance.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Earnings</div>
                  <div className="text-lg font-semibold text-gray-900">KES {rider.totalEarnings.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Withdrawn</div>
                  <div className="text-lg font-semibold text-gray-900">KES {rider.totalWithdrawn.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
              <div className="space-y-3">
                {recentRequests.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent withdrawal requests</p>
                ) : (
                  recentRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">KES {request.amount.toLocaleString()}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <div>Fee: KES {request.fee} • Net: KES {request.netAmount.toLocaleString()}</div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(request.requestedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-3">
                Contact support for assistance with withdrawals or account issues.
              </p>
              <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
