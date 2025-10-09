import { useState } from 'react';
import { Search, Package, MapPin, Clock, CheckCircle, Truck, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface TrackingStatus {
  status: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered';
  timestamp: string;
  description: string;
}

interface OrderData {
  id: string;
  customerName: string;
  customerPhone: string;
  pickup: string;
  delivery: string;
  distance: number;
  cost: number;
  currentStatus: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered';
  createdAt: string;
  estimatedDelivery: string;
  riderName?: string;
  riderPhone?: string;
  statusHistory: TrackingStatus[];
}

const trackingSteps = [
  { key: 'pending', label: 'Order Received', icon: Package },
  { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'picked_up', label: 'Package Picked Up', icon: User },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin }
];

export default function OrderTracking() {
  const [trackingId, setTrackingId] = useState('');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setIsLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await fetch(`/api/orders/track/${trackingId}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrderData(data.order);
      } else if (response.status === 404) {
        setError('Order not found. Please check your tracking ID and try again.');
      } else {
        setError('Unable to fetch order details. Please try again later.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const stepIndex = trackingSteps.findIndex(step => step.key === stepKey);
    const currentIndex = trackingSteps.findIndex(step => step.key === currentStatus);
    
    if (stepIndex <= currentIndex) return 'completed';
    if (stepIndex === currentIndex + 1) return 'current';
    return 'pending';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-rocs-green mb-4">
              Track Your Order
            </h1>
            <p className="text-lg text-gray-600">
              Enter your tracking ID to see real-time updates on your delivery
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div>
                <Label htmlFor="trackingId" className="text-rocs-green font-semibold">
                  Tracking ID
                </Label>
                <div className="flex space-x-4 mt-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      id="trackingId"
                      type="text"
                      placeholder="Enter your tracking ID (e.g., RC-2024-001)"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-rocs-green"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !trackingId.trim()}
                    className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 px-8"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800 mr-2"></div>
                        Tracking...
                      </span>
                    ) : (
                      'Track Order'
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          {/* Order Details */}
          {orderData && (
            <div className="space-y-8">
              {/* Order Info Card */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-rocs-green mb-4">Order Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Order ID:</span>
                        <p className="text-gray-800">{orderData.id}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Customer:</span>
                        <p className="text-gray-800">{orderData.customerName}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                        <p className="text-gray-800">{orderData.customerPhone}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Distance:</span>
                        <p className="text-gray-800">{orderData.distance} km</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Cost:</span>
                        <p className="text-gray-800 font-semibold">KES {orderData.cost.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-rocs-green mb-4">Delivery Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Pickup Location:</span>
                        <p className="text-gray-800">{orderData.pickup}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Delivery Location:</span>
                        <p className="text-gray-800">{orderData.delivery}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Order Date:</span>
                        <p className="text-gray-800">{formatDate(orderData.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Estimated Delivery:</span>
                        <p className="text-gray-800">{formatDate(orderData.estimatedDelivery)}</p>
                      </div>
                      {orderData.riderName && (
                        <>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Rider:</span>
                            <p className="text-gray-800">{orderData.riderName}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Rider Phone:</span>
                            <p className="text-gray-800">{orderData.riderPhone}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking Progress */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-rocs-green mb-6">Delivery Progress</h3>
                
                <div className="relative">
                  {trackingSteps.map((step, index) => {
                    const status = getStepStatus(step.key, orderData.currentStatus);
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.key} className="flex items-center mb-8 last:mb-0">
                        {/* Connector Line */}
                        {index < trackingSteps.length - 1 && (
                          <div className="absolute left-6 w-0.5 h-16 bg-gray-200 top-12 transform -translate-x-0.5" 
                               style={{ top: `${(index + 1) * 4}rem` }} />
                        )}
                        
                        {/* Step Icon */}
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                          status === 'completed' ? 'bg-rocs-green text-white' :
                          status === 'current' ? 'bg-rocs-yellow text-gray-800' :
                          'bg-gray-200 text-gray-400'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>

                        {/* Step Content */}
                        <div className="ml-6 flex-1">
                          <h4 className={`font-semibold ${
                            status === 'completed' || status === 'current' ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </h4>
                          
                          {/* Status Timestamp */}
                          {orderData.statusHistory.find(h => h.status === step.key) && (
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDate(orderData.statusHistory.find(h => h.status === step.key)!.timestamp)}
                            </p>
                          )}

                          {status === 'current' && (
                            <p className="text-sm text-rocs-yellow mt-1 font-medium">In Progress</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status History */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-rocs-green mb-6">Status History</h3>
                <div className="space-y-4">
                  {orderData.statusHistory.map((status, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-rocs-green" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{status.description}</p>
                        <p className="text-sm text-gray-600">{formatDate(status.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
