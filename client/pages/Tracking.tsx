import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import { Helmet } from 'react-helmet-async';
import {
  Printer,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Star,
  MapPin,
  Clock
} from 'lucide-react';
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";

const Receipt = ({ order }: { order: any }) => {
  if (!order) return null;
  return (
    <div className="hidden print:block p-8 max-w-2xl mx-auto border bg-white text-black" id="printable-receipt">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-rocs-green">Rocs Crew Delivery Receipt</h2>
        <p className="text-gray-500">Fast & Affordable Delivery</p>
      </div>
      <div className="flex justify-between mb-8 pb-4 border-b">
        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold">Order Details</p>
          <p className="font-bold">#{order.id}</p>
          <p className="text-sm">{new Date().toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase font-semibold">Customer</p>
          <p className="font-bold">{order.customerName}</p>
          <p className="text-sm">{order.customerPhone}</p>
        </div>
      </div>
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Pickup</p>
            <p className="text-sm font-medium">{order.pickup}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Delivery</p>
            <p className="text-sm font-medium">{order.delivery}</p>
          </div>
        </div>
      </div>
      <div className="border-t pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm">Distance</span>
          <span className="text-sm">{order.distance} km</span>
        </div>
        <div className="flex justify-between text-xl font-bold border-t mt-4 pt-4">
          <span>Total Cost</span>
          <span>KES {order.cost?.toLocaleString()}</span>
        </div>
      </div>
      <div className="mt-12 text-center text-[10px] text-gray-400 space-y-1">
        <p>Thank you for choosing Rocs Crew!</p>
        <p>Contact: +254 700 898 950 | Kuriajoe85@gmail.com</p>
        <p>This is a computer-generated receipt.</p>
      </div>
    </div>
  );
};

export default function Tracking() {
  const { toast } = useToast();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [trackingId, setTrackingId] = useState(id || "");
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);

  const fetchOrder = useCallback(async (id: string, silent = false) => {
    if (!silent) setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/track/${id.trim()}`);

      if (response.ok) {
        const data = await response.json();
        setOrderData(data.order);
        setLastUpdated(new Date());
      } else if (response.status === 404) {
        setError("Order not found. Please check your tracking ID and try again.");
        stopAutoRefresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to track order. Please try again.");
      }
    } catch (error) {
      console.error("Tracking error:", error);
      if (!silent) setError("Network error. Please check your connection and try again.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAutoRefreshing(false);
  };

  const startAutoRefresh = (id: string) => {
    stopAutoRefresh();
    setAutoRefreshing(true);
    intervalRef.current = setInterval(() => fetchOrder(id, true), 10000);
  };

  useEffect(() => {
    if (orderData?.currentStatus === 'delivered') {
      stopAutoRefresh();
    }
  }, [orderData?.currentStatus]);

  useEffect(() => {
    return () => stopAutoRefresh();
  }, []);

  useEffect(() => {
    const paramId = id || searchParams.get("id");
    if (paramId) {
      setTrackingId(paramId);
      fetchOrder(paramId);
      startAutoRefresh(paramId);
    }
  }, [id, searchParams, fetchOrder]);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setOrderData(null);
    await fetchOrder(trackingId);
    startAutoRefresh(trackingId);
  };

  const submitRating = () => {
    toast({
      title: "Thank you for your feedback!",
      description: `You rated your experience ${ratingValue} stars.`,
      action: <CheckCircle2 className="text-green-500" />,
    });
    setRatingSubmitted(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const statusOrder = ["pending", "confirmed", "picked_up", "in_transit", "delivered"];
    const stepIndex = statusOrder.indexOf(stepKey);
    const currentIndex = statusOrder.indexOf(currentStatus);
    return stepIndex <= currentIndex;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Track Order {id ? `#${id}` : ''} | Rocs Crew</title>
        <meta name="description" content="Track your Rocs Crew package in real-time." />
      </Helmet>

      {/* Hero Section */}
      <section className="py-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-rocs-green mb-4">Track Your Order</h1>
              <p className="text-lg text-gray-600">Enter your tracking ID to see real-time updates on your delivery</p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div>
                  <label htmlFor="trackingId" className="block text-rocs-green font-semibold mb-2">Tracking ID</label>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <input
                        id="trackingId"
                        type="text"
                        placeholder="Enter your tracking ID (e.g., RC-2024-001)"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-rocs-green"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !trackingId.trim()}
                      className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "Tracking..." : "Track Order"}
                    </button>
                  </div>
                </div>
              </form>
              {lastUpdated && (
                <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  {autoRefreshing && orderData?.currentStatus !== 'delivered' && (
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  )}
                  Last updated: {lastUpdated.toLocaleTimeString('en-KE')}
                  {autoRefreshing && orderData?.currentStatus !== 'delivered' && ' · Auto-refreshing every 10s'}
                </p>
              )}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
                <strong>Try these sample tracking IDs:</strong> RC-2024-001, RC-2024-002
              </div>
            </div>

            {/* Order Details */}
            {orderData && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-rocs-green mb-4">Order Details</h3>
                      <div className="space-y-3">
                        <div><span className="text-sm font-medium text-gray-600">Order ID:</span><p className="text-gray-800">{orderData.id}</p></div>
                        <div><span className="text-sm font-medium text-gray-600">Customer:</span><p className="text-gray-800">{orderData.customerName}</p></div>
                        <div><span className="text-sm font-medium text-gray-600">Phone:</span><p className="text-gray-800">{orderData.customerPhone}</p></div>
                        <div><span className="text-sm font-medium text-gray-600">Distance:</span><p className="text-gray-800">{orderData.distance} km</p></div>
                        <div><span className="text-sm font-medium text-gray-600">Cost:</span><p className="text-gray-800 font-semibold">KES {orderData.cost.toLocaleString()}</p></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-rocs-green mb-4">Delivery Information</h3>
                      <div className="space-y-3">
                        <div><span className="text-sm font-medium text-gray-600">Pickup:</span><p className="text-gray-800">{orderData.pickup}</p></div>
                        <div><span className="text-sm font-medium text-gray-600">Delivery:</span><p className="text-gray-800">{orderData.delivery}</p></div>
                        <div><span className="text-sm font-medium text-gray-600">Order Date:</span><p className="text-gray-800">{formatDate(orderData.createdAt)}</p></div>
                        <div><span className="text-sm font-medium text-gray-600">Estimated:</span><p className="text-gray-800">{formatDate(orderData.estimatedDelivery)}</p></div>
                        {orderData.riderName && (
                          <>
                            <div><span className="text-sm font-medium text-gray-600">Rider:</span><p className="text-gray-800">{orderData.riderName}</p></div>
                            <div><span className="text-sm font-medium text-gray-600">Phone:</span><p className="text-gray-800">{orderData.riderPhone}</p></div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-xl font-semibold text-rocs-green mb-6">Delivery Progress</h3>
                  <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-rocs-green to-rocs-green-dark text-white flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Current Status</h4>
                      <p className="text-sm opacity-90">{orderData.currentStatus.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div className="text-2xl">
                      {orderData.currentStatus === 'delivered' ? '🎉' : '🚚'}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {[
                      { key: "pending", label: "Order Received", icon: "📋" },
                      { key: "confirmed", label: "Order Confirmed", icon: "✅" },
                      { key: "picked_up", label: "Package Picked Up", icon: "📦" },
                      { key: "in_transit", label: "In Transit", icon: "🚚" },
                      { key: "delivered", label: "Delivered", icon: "🎉" },
                    ].map((step, index) => {
                      const isCompleted = getStepStatus(step.key, orderData.currentStatus);
                      const isCurrent = step.key === orderData.currentStatus;
                      return (
                        <div key={step.key} className="flex items-start">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isCompleted ? "bg-rocs-green text-white" : isCurrent ? "bg-rocs-yellow text-gray-800" : "bg-gray-200 text-gray-500"}`}>
                            {isCompleted ? "✓" : step.icon}
                          </div>
                          <div className="ml-4">
                            <h4 className={`font-semibold ${isCompleted ? "text-gray-800" : isCurrent ? "text-rocs-green" : "text-gray-500"}`}>{step.label}</h4>
                            {isCompleted && orderData.statusHistory?.find((h: any) => h.status === step.key) && (
                              <p className="text-xs text-gray-400">{formatDate(orderData.statusHistory.find((h: any) => h.status === step.key).timestamp)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-8">
                    <Button variant="outline" size="sm" onClick={() => window.print()} className="items-center gap-2">
                      <Printer className="w-4 h-4" /> Print Receipt
                    </Button>
                    <Button onClick={() => navigate('/book-delivery')} className="bg-rocs-green hover:bg-rocs-green-dark text-white">
                      Book Another Delivery
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Rating Prompt Overlay */}
      {orderData?.currentStatus === 'delivered' && !ratingSubmitted && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl max-w-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Package Delivered! 🎉</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">How was your experience with Rocs Crew? Please rate your rider.</p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    setRatingValue(star);
                    submitRating();
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star className={`w-8 h-8 ${star <= ratingValue ? 'fill-rocs-yellow text-rocs-yellow' : 'text-zinc-300'}`} />
                </button>
              ))}
            </div>
            <button onClick={() => setRatingSubmitted(true)} className="text-xs text-zinc-400 hover:text-zinc-600 block mx-auto underline">Maybe later</button>
          </div>
        </div>
      )}

      <Receipt order={orderData} />
    </div>
  );
}
