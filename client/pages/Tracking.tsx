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
  ChevronRight,
  Package
} from 'lucide-react';
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";

const Receipt = ({ order }: { order: any }) => {
  if (!order) return null;
  return (
    <div className="hidden print:block p-8 max-w-2xl mx-auto border bg-card text-foreground" id="printable-receipt">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-rocs-green">Rocs Crew Delivery Receipt</h2>
        <p className="text-muted-foreground">Fast & Affordable Delivery</p>
      </div>
      <div className="flex justify-between mb-8 pb-4 border-b">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Order Details</p>
          <p className="font-bold">#{order.id}</p>
          <p className="text-sm">{new Date().toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase font-semibold">Customer</p>
          <p className="font-bold">{order.customerName}</p>
          <p className="text-sm">{order.customerPhone}</p>
        </div>
      </div>
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Pickup</p>
            <p className="text-sm font-medium">{order.pickup}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Delivery</p>
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
      <div className="mt-12 text-center text-[10px] text-muted-foreground space-y-1">
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
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-10 transition-colors duration-300">
      <Helmet>
        <title>Track Order {id ? `#${id}` : ''} | Rocs Crew</title>
        <meta name="description" content="Track your Rocs Crew package in real-time." />
      </Helmet>

      {/* Main Content Area */}
      <section className="flex-1 w-full max-w-lg mx-auto px-4 pb-20">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">Track Your Order</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xs mx-auto font-outfit">
            Enter your tracking ID below to see real-time updates on your delivery.
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="bg-card rounded-[2.5rem] p-8 shadow-2xl border border-border mb-10 backdrop-blur-sm">
          <form onSubmit={handleTrackOrder} className="flex flex-col space-y-6">
            <div>
              <label htmlFor="trackingId" className="block text-primary font-bold text-xs tracking-widest uppercase mb-3 ml-1">
                Tracking ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ScanLine className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="trackingId"
                  type="text"
                  placeholder="e.g., RC-2024-001"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-muted/50 text-foreground border border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/30 transition-all font-medium text-[15px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !trackingId.trim()}
              className="w-full bg-gradient-to-r from-primary to-rocs-green-dark hover:brightness-110 text-primary-foreground font-bold text-lg py-4 rounded-full transition-all shadow-xl disabled:opacity-50 disabled:shadow-none flex items-center justify-center space-x-2"
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
          <div className="mt-8 p-4 rounded-2xl border border-border bg-muted/30 flex items-start space-x-3">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm font-outfit">
              <p className="text-foreground font-medium mb-3">Try sample tracking IDs:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setTrackingId("RC-2024-001")}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors border border-primary/20"
                >
                  RC-2024-001
                </button>
                <button
                  onClick={() => setTrackingId("RC-2024-002")}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors border border-primary/20"
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
            <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-2xl transition-colors">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-foreground tracking-wide flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  Order Details
                </h3>
                {autoRefreshing && orderData?.currentStatus !== 'delivered' && (
                  <div className="flex items-center text-xs text-primary font-bold bg-primary/10 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
                    Live
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm p-6 bg-muted/50 rounded-2xl border border-border/50 mb-8 font-outfit">
                <div><span className="text-muted-foreground block text-[10px] uppercase tracking-widest font-bold mb-1">Order ID</span><span className="font-semibold text-foreground">{orderData.id}</span></div>
                <div><span className="text-muted-foreground block text-[10px] uppercase tracking-widest font-bold mb-1">Cost</span><span className="font-semibold text-primary">KES {orderData.cost.toLocaleString()}</span></div>
                <div className="col-span-2 border-t border-border/30 pt-4"><span className="text-muted-foreground block text-[10px] uppercase tracking-widest font-bold mb-1">Pickup</span><span className="block truncate text-foreground">{orderData.pickup}</span></div>
                <div className="col-span-2 border-t border-border/30 pt-4"><span className="text-muted-foreground block text-[10px] uppercase tracking-widest font-bold mb-1">Delivery</span><span className="block truncate text-foreground">{orderData.delivery}</span></div>
              </div>

              <h4 className="font-bold text-foreground mb-4 font-outfit">Delivery Progress</h4>
              <div className="mb-8 p-6 rounded-2xl border border-primary/20 bg-primary/10 text-foreground flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-bold text-primary uppercase text-xs tracking-widest">Current Status</h4>
                  <p className="text-lg font-extrabold text-foreground mt-1">{orderData.currentStatus.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div className="text-4xl drop-shadow-md">
                  {orderData.currentStatus === 'delivered' ? '🎉' : '🚚'}
                </div>
              </div>

              <div className="space-y-8 pl-4 relative border-l-2 border-border/50 ml-4 pb-4">
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
                      <div className={`absolute -left-[1.65rem] top-1 w-5 h-5 rounded-full border-4 border-card ${isCompleted ? (isCurrent ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-125" : "bg-primary/60") : "bg-muted"}`}></div>
                      <div className="ml-4 font-outfit">
                        <h4 className={`font-bold ${isCompleted ? (isCurrent ? "text-primary text-base" : "text-foreground") : "text-muted-foreground/50"}`}>{step.label}</h4>
                        {isCompleted && orderData.statusHistory?.find((h: any) => h.status === step.key) && (
                          <p className="text-[11px] text-muted-foreground mt-1 font-medium italic">{formatDate(orderData.statusHistory.find((h: any) => h.status === step.key).timestamp)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="items-center justify-center gap-2 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 w-full sm:w-auto rounded-xl h-11 transition-all">
                  <Printer className="w-4 h-4" /> Print Receipt
                </Button>
                <Button onClick={() => navigate('/book-delivery')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold w-full sm:w-auto rounded-xl h-11 transition-all shadow-md">
                  Book Another Delivery
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Recent Searches - Static Mock Section shown when no active search */
          <div className="mt-8 animate-in fade-in duration-500 font-outfit">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-foreground font-bold text-xl tracking-tight">Recent Searches</h3>
              <button className="text-primary text-sm font-bold hover:underline transition-colors">
                Clear All
              </button>
            </div>

            <div className="bg-card rounded-3xl p-6 border border-border flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer shadow-lg" onClick={() => {
              setTrackingId("RC-2023-884");
              setTimeout(() => {
                document.getElementById('trackingId')?.focus();
              }, 100);
            }}>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center border border-border shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                  <CheckCircle2 className="w-8 h-8 text-rocs-green" />
                </div>
                <div>
                  <h4 className="text-foreground font-extrabold text-lg mb-0.5">RC-2023-884</h4>
                  <p className="text-muted-foreground text-sm font-medium">Delivered · Yesterday</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
            </div>
          </div>
        )}
      </section>

      {/* Rating Prompt Overlay */}
      {orderData?.currentStatus === 'delivered' && !ratingSubmitted && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-[calc(100%-3rem)] mx-auto w-full sm:w-auto font-outfit">
          <div className="bg-card border border-primary/20 rounded-3xl p-8 shadow-2xl max-w-sm backdrop-blur-md">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">Package Delivered! <span className="text-2xl">🎉</span></h3>
            <p className="text-sm text-muted-foreground mb-6">How was your experience with Rocs Crew? Please rate your rider.</p>
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    setRatingValue(star);
                    submitRating();
                  }}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star className={`w-10 h-10 ${star <= ratingValue ? 'fill-primary text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'text-muted/30'}`} />
                </button>
              ))}
            </div>
            <button onClick={() => setRatingSubmitted(true)} className="text-xs text-muted-foreground hover:text-foreground block mx-auto underline italic">Maybe later</button>
          </div>
        </div>
      )}

      <Receipt order={orderData} />
    </div>
  );
}
