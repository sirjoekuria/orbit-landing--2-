import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import { Helmet } from 'react-helmet-async';
import {
  Printer,
  CheckCircle2,
  Star,
  MapPin,
  Clock,
  ScanLine,
  ArrowRight,
  Info,
  ChevronRight
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
    <div className="min-h-screen bg-[#0a110d] text-white flex flex-col pt-10">
      <Helmet>
        <title>Track Order {id ? `#${id}` : ''} | Rocs Crew</title>
        <meta name="description" content="Track your Rocs Crew package in real-time." />
      </Helmet>

      {/* Main Content Area */}
      <section className="flex-1 w-full max-w-lg mx-auto px-4 pb-20">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Track Your Order</h1>
          <p className="text-sm md:text-base text-[#8b9d93] max-w-xs mx-auto">
            Enter your tracking ID below to see real-time updates on your delivery.
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="bg-[#112417] rounded-[2rem] p-6 shadow-2xl border border-white/5 mb-10">
          <form onSubmit={handleTrackOrder} className="flex flex-col space-y-6">
            <div>
              <label htmlFor="trackingId" className="block text-[#eab308] font-bold text-xs tracking-widest uppercase mb-3">
                Tracking ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ScanLine className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="trackingId"
                  type="text"
                  placeholder="e.g., RC-2024-001"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#0a110d] text-white border border-white/10 rounded-2xl focus:outline-none focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] placeholder-gray-600 transition-all font-medium text-[15px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !trackingId.trim()}
              className="w-full bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-bold text-lg py-4 rounded-full transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Tracking...
                </span>
              ) : (
                <>
                  <span>Track Order</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Sample IDs Block */}
          <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/5 flex items-start space-x-3">
            <Info className="w-5 h-5 text-[#8b9d93] shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-white font-medium mb-3">Try sample tracking IDs:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTrackingId("RC-2024-001")}
                  className="px-4 py-2 bg-[#1a3824] hover:bg-[#204a2e] text-[#8b9d93] hover:text-white rounded-full transition-colors border border-white/10"
                >
                  RC-2024-001
                </button>
                <button
                  onClick={() => setTrackingId("RC-2024-002")}
                  className="px-4 py-2 bg-[#1a3824] hover:bg-[#204a2e] text-[#8b9d93] hover:text-white rounded-full transition-colors border border-white/10"
                >
                  RC-2024-002
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* Order Details - Conditionally Rendered */}
        {orderData ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Real Order Results translated to Dark Theme */}
            <div className="bg-[#112417] rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white tracking-wide">Order Details</h3>
                {autoRefreshing && orderData?.currentStatus !== 'delivered' && (
                  <div className="flex items-center text-xs text-[#eab308]">
                    <span className="w-2 h-2 rounded-full bg-[#eab308] animate-pulse mr-2" />
                    Live
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm p-4 bg-[#0a110d] rounded-2xl border border-white/5 mb-6">
                <div><span className="text-[#8b9d93] block text-xs uppercase tracking-wider mb-1">Order ID</span><span className="font-semibold">{orderData.id}</span></div>
                <div><span className="text-[#8b9d93] block text-xs uppercase tracking-wider mb-1">Cost</span><span className="font-semibold text-[#eab308]">KES {orderData.cost.toLocaleString()}</span></div>
                <div><span className="text-[#8b9d93] block text-xs uppercase tracking-wider mb-1">Pickup</span><span className="block truncate">{orderData.pickup}</span></div>
                <div><span className="text-[#8b9d93] block text-xs uppercase tracking-wider mb-1">Delivery</span><span className="block truncate">{orderData.delivery}</span></div>
              </div>

              <h4 className="font-bold text-white mb-4">Delivery Progress</h4>
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r border border-[#eab308]/30 from-[#eab308]/20 to-[#ca8a04]/10 text-white flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#eab308]">Current Status</h4>
                  <p className="text-sm font-medium">{orderData.currentStatus.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div className="text-3xl drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                  {orderData.currentStatus === 'delivered' ? '🎉' : '🚚'}
                </div>
              </div>

              <div className="space-y-6 pl-2 relative border-l-2 border-white/10 ml-4 pb-4">
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
                    <div key={step.key} className="flex items-start relative">
                      <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-4 border-[#112417] ${isCompleted ? (isCurrent ? "bg-[#eab308] shadow-[0_0_10px_rgba(234,179,8,0.8)] scale-125" : "bg-[#8b9d93]") : "bg-[#1a3824]"}`}></div>
                      <div className="ml-2">
                        <h4 className={`font-semibold ${isCompleted ? (isCurrent ? "text-[#eab308]" : "text-white") : "text-gray-600"}`}>{step.label}</h4>
                        {isCompleted && orderData.statusHistory?.find((h: any) => h.status === step.key) && (
                          <p className="text-[11px] text-[#8b9d93] mt-1">{formatDate(orderData.statusHistory.find((h: any) => h.status === step.key).timestamp)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="items-center justify-center gap-2 border-white/20 text-[#8b9d93] hover:text-white hover:bg-white/10 w-full sm:w-auto">
                  <Printer className="w-4 h-4" /> Print Receipt
                </Button>
                <Button onClick={() => navigate('/book-delivery')} className="bg-[#1a3824] hover:bg-[#204a2e] text-white w-full sm:w-auto">
                  Book Another Delivery
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Recent Searches - Static Mock Section shown when no active search */
          <div className="mt-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-xl tracking-tight">Recent Searches</h3>
              <button className="text-[#eab308] text-sm font-bold hover:text-[#ca8a04] transition-colors">
                Clear All
              </button>
            </div>

            <div className="bg-[#112417] rounded-3xl p-5 border border-white/5 flex items-center justify-between group hover:border-white/20 transition-colors cursor-pointer" onClick={() => {
              setTrackingId("RC-2023-884");
              setTimeout(() => {
                document.getElementById('trackingId')?.focus();
              }, 100);
            }}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-[#1a3824] flex items-center justify-center border border-white/5 shrink-0 group-hover:bg-[#204a2e] transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-0.5">RC-2023-884</h4>
                  <p className="text-[#8b9d93] text-sm font-medium">Delivered · Yesterday</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </div>
        )}
      </section>

      {/* Rating Prompt Overlay */}
      {orderData?.currentStatus === 'delivered' && !ratingSubmitted && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-[calc(100%-3rem)] mx-auto w-full sm:w-auto">
          <div className="bg-[#112417] border border-[#eab308]/30 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2">Package Delivered! 🎉</h3>
            <p className="text-sm text-[#8b9d93] mb-4">How was your experience with Rocs Crew? Please rate your rider.</p>
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
                  <Star className={`w-8 h-8 ${star <= ratingValue ? 'fill-[#eab308] text-[#eab308] drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'text-gray-600'}`} />
                </button>
              ))}
            </div>
            <button onClick={() => setRatingSubmitted(true)} className="text-xs text-gray-500 hover:text-white block mx-auto underline">Maybe later</button>
          </div>
        </div>
      )}

      <Receipt order={orderData} />
    </div>
  );
}
