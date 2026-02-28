import { useState, useCallback, useEffect } from "react";
import { API_BASE_URL } from '../lib/api';
import {
  MapPin,
  Calculator,
  Package,
  User,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import PaymentSelection from "./PaymentSelection";
import SimpleMapboxLocationPicker from "./SimpleMapboxLocationPicker";
import { useToast } from "../hooks/use-toast";
import { triggerHaptic } from "../lib/mobileUtils";

const PRICE_PER_KM = 30;
const MINIMUM_PRICE = 200;

interface Location {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface OrderFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickup: string;
  delivery: string;
  packageDetails: string;
  notes?: string;
}

export default function OrderForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    pickup: "",
    delivery: "",
    packageDetails: "",
    notes: "",
  });
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "details" | "payment" | "completed"
  >("details");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState<string | null>(null);
  const [saveAddresses, setSaveAddresses] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSelect = useCallback(
    (pickup: Location, dropoff: Location) => {
      setPickupLocation(pickup);
      setDropoffLocation(dropoff);
      setFormData((prev) => ({
        ...prev,
        pickup: pickup.address,
        delivery: dropoff.address,
      }));
    },
    [],
  );

  const handleDistanceCalculated = useCallback(
    (calculatedDistance: number, calculatedDuration: number) => {
      setDistance(calculatedDistance);
      setDuration(calculatedDuration);

      // Calculate base price
      const basePrice = calculatedDistance * PRICE_PER_KM;

      // Apply minimum price
      const priceWithMinimum = Math.max(basePrice, MINIMUM_PRICE);

      // Round to nearest 10
      const finalPrice = Math.round(priceWithMinimum / 10) * 10;

      setEstimatedPrice(finalPrice);
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distance || !estimatedPrice) {
      toast({
        title: "Incomplete Details",
        description: "Please calculate the price by selecting both pickup and delivery locations first.",
        variant: "destructive",
      });
      return;
    }

    // Move to payment step
    setCurrentStep("payment");
  };

  const handlePaymentSuccess = async (payment: any) => {
    setPaymentDetails(payment);
    setIsSubmitting(true);

    try {
      const orderData = {
        ...formData,
        distance,
        cost: estimatedPrice,
        paymentMethod: payment.method,
        paymentStatus: payment.status,
        transactionId: payment.transactionId,
        timestamp: new Date().toISOString(),
      };

      const csrfRes = await fetch(`${API_BASE_URL}/api/csrf-token`);
      const { token: csrfToken } = await csrfRes.json();

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Order created successfully:", result.order);

        // Save addresses if requested
        if (saveAddresses && pickupLocation && dropoffLocation) {
          try {
            const saved = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
            const newAddresses = [...saved];

            // Avoid duplicates
            if (!saved.some((a: any) => a.address === pickupLocation.address)) {
              newAddresses.push({ name: pickupLocation.name || 'Pickup Location', address: pickupLocation.address, type: 'pickup' });
            }
            if (!saved.some((a: any) => a.address === dropoffLocation.address)) {
              newAddresses.push({ name: dropoffLocation.name || 'Dropoff Location', address: dropoffLocation.address, type: 'delivery' });
            }

            localStorage.setItem('savedAddresses', JSON.stringify(newAddresses.slice(-10))); // Keep last 10
          } catch (e) {
            console.error('Failed to save addresses', e);
          }
        }

        toast({
          title: "Order Created!",
          description: `Your order ${result.order.id} has been placed successfully.`,
        });
        setOrderCreated(result.order.id);
        setCurrentStep("completed");
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Order creation failed:", errorData);
        throw new Error(errorData.error || "Failed to create order");
      }
    } catch (error) {
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Error creating order. Please try again.",
        variant: "destructive",
      });
      setCurrentStep("details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
    toast({
      title: "Payment Error",
      description: error.message || "Payment failed. Please try again.",
      variant: "destructive",
    });
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      pickup: "",
      delivery: "",
      packageDetails: "",
      notes: "",
    });
    setPickupLocation(null);
    setDropoffLocation(null);
    setDistance(null);
    setEstimatedPrice(null);
    setDuration(null);
    setCurrentStep("details");
    setPaymentDetails(null);
    setOrderCreated(null);
  };

  if (currentStep === "completed" && orderCreated) {
    return (
      <div className="bg-card rounded-3xl shadow-xl border border-border p-8 text-center backdrop-blur-sm transition-colors duration-300">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <Package className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-bold text-primary mb-4">
          Order Created Successfully!
        </h3>

        <div className="bg-muted/50 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-outfit">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-semibold text-foreground">{orderCreated}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-semibold text-foreground capitalize">
                {paymentDetails?.method === "paypal"
                  ? "PayPal"
                  : "Cash on Delivery"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-semibold text-foreground">
                KES {estimatedPrice?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <p
                className={`font-semibold ${paymentDetails?.status === "completed" ? "text-primary" : "text-orange-500"}`}
              >
                {paymentDetails?.status === "completed"
                  ? "Paid"
                  : "Pending (Pay on Delivery)"}
              </p>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-6 font-outfit">
          You can track your order using the order ID on our tracking page.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() =>
              (window.location.href = `/tracking?id=${orderCreated}`)
            }
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
          >
            Track Order
          </Button>
          <Button
            onClick={resetForm}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold rounded-xl"
          >
            Create Another Order
          </Button>
        </div>
      </div>
    );
  }

  // Payment step
  if (currentStep === "payment") {
    return (
      <div className="bg-card rounded-3xl shadow-xl border border-border p-8 backdrop-blur-sm transition-colors duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Complete Your Payment
          </h2>
          <p className="text-muted-foreground font-outfit">
            Choose your preferred payment method to confirm your delivery order
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-muted/50 rounded-2xl p-6 mb-8 font-outfit">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Order Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Customer:</p>
              <p className="font-semibold text-foreground">{formData.customerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone:</p>
              <p className="font-semibold text-foreground">{formData.customerPhone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">From:</p>
              <p className="font-semibold text-foreground">{formData.pickup}</p>
            </div>
            <div>
              <p className="text-muted-foreground">To:</p>
              <p className="font-semibold text-foreground">{formData.delivery}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Distance:</p>
              <p className="font-semibold text-foreground">{distance} km</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Cost:</p>
              <p className="font-semibold text-primary text-lg">
                KES {estimatedPrice?.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep("details")}
            className="mt-4 text-primary hover:underline text-sm font-medium"
          >
            ← Edit Order Details
          </button>
        </div>

        <PaymentSelection
          amount={estimatedPrice || 0}
          currency="KES"
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          disabled={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="bg-background w-full transition-colors duration-300">
      {/* Progress Pill Tabs */}
      <div className="flex bg-muted rounded-full p-1 mb-10 transition-colors">
        <div
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-full cursor-pointer transition-all duration-300 ${currentStep === "details"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
            }`}
          onClick={() => setCurrentStep("details")}
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${currentStep === "details" ? "border-primary-foreground" : "border-muted-foreground"}`}>
            {currentStep === "details" && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
          </div>
          <span className="font-bold text-sm tracking-wide">Order Details</span>
        </div>
        <div
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-full cursor-not-allowed transition-all ${currentStep === "payment"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground/50"
            }`}
        >
          <span className="font-bold text-sm tracking-wide">Payment</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl backdrop-blur-sm transition-colors">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            Customer Information
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName" className="text-foreground/80 text-xs font-medium uppercase tracking-wider ml-1 mb-1.5 block">
                Full Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="customerName"
                name="customerName"
                type="text"
                required
                value={formData.customerName}
                onChange={handleInputChange}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/30 focus:border-primary rounded-xl h-12 px-4 transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail" className="text-foreground/80 text-xs font-medium uppercase tracking-wider ml-1 mb-1.5 block">
                Email Address <span className="text-primary">*</span>
              </Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                required
                value={formData.customerEmail}
                onChange={handleInputChange}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/30 focus:border-primary rounded-xl h-12 px-4 transition-all"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone" className="text-foreground/80 text-xs font-medium uppercase tracking-wider ml-1 mb-1.5 block">
                Phone Number <span className="text-primary">*</span>
              </Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                required
                value={formData.customerPhone}
                onChange={handleInputChange}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/30 focus:border-primary rounded-xl h-12 px-4 transition-all"
                placeholder="+254 7XX XXX XXX"
              />
            </div>
          </div>

          {/* Saved Addresses Option */}
          <div className="flex items-center space-x-3 mt-6 p-3 bg-muted/30 rounded-xl border border-border/50">
            <input
              type="checkbox"
              id="saveAddresses"
              checked={saveAddresses}
              onChange={(e) => setSaveAddresses(e.target.checked)}
              className="w-4 h-4 text-primary bg-muted border-border rounded focus:ring-primary focus:ring-offset-background"
            />
            <Label htmlFor="saveAddresses" className="text-sm text-muted-foreground cursor-pointer font-outfit">
              Save these addresses for future deliveries
            </Label>
          </div>
        </div>

        {/* Location Selection */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl backdrop-blur-sm relative transition-colors">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            Select Pickup & Drop-off Locations
          </h3>
          <SimpleMapboxLocationPicker
            onLocationSelect={handleLocationSelect}
            onDistanceCalculated={handleDistanceCalculated}
          />
        </div>

        {/* Package Information */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl backdrop-blur-sm transition-colors">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            Package Information
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="packageDetails" className="text-foreground/80 text-xs font-medium uppercase tracking-wider ml-1 mb-1.5 block">
                Package Details <span className="text-primary">*</span>
              </Label>
              <Textarea
                id="packageDetails"
                name="packageDetails"
                required
                value={formData.packageDetails}
                onChange={handleInputChange}
                rows={3}
                className="bg-muted/50 border-border text-foreground focus:border-primary rounded-xl resize-none placeholder:text-muted-foreground/30 px-4 py-3 transition-all"
                placeholder="Describe your package (type, size, weight, etc.)"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-foreground/80 text-xs font-medium uppercase tracking-wider ml-1 mb-1.5 block">
                Special Instructions (Optional)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="bg-muted/50 border-border text-foreground focus:border-primary rounded-xl resize-none placeholder:text-muted-foreground/30 px-4 py-3 transition-all"
                placeholder="Any special handling instructions"
              />
            </div>
          </div>
        </div>

        {/* Price Calculation Summary */}
        {estimatedPrice && (
          <div className="bg-card border border-primary/20 rounded-3xl p-8 shadow-xl transition-colors font-outfit">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calculator className="w-4 h-4 text-primary" />
              </div>
              Delivery Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="text-2xl font-bold text-foreground">
                  {distance?.toFixed(1)} km
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Distance</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                <div className="text-2xl font-bold text-foreground">
                  {duration ? Math.round(duration) : "--"} min
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Est. Time</div>
              </div>
              <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <div className="text-3xl font-bold text-primary">
                  KES {estimatedPrice?.toLocaleString()}
                </div>
                <div className="text-xs text-primary/70 uppercase tracking-widest font-bold mt-1">Total Cost</div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-8">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !estimatedPrice ||
              !pickupLocation ||
              !dropoffLocation
            }
            onClick={() => {
              triggerHaptic();
            }}
            className="w-full bg-gradient-to-r from-primary to-rocs-green-dark hover:brightness-110 text-primary-foreground font-bold h-16 rounded-2xl shadow-xl text-xl transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-foreground mr-3"></div>
                Creating Order...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Package className="w-6 h-6" />
                CREATE ORDER
              </span>
            )}
          </Button>

          {estimatedPrice && (
            <p className="text-xs text-muted-foreground text-center mt-6 font-outfit italic">
              By placing this order, you agree to pay KES {estimatedPrice} upon
              delivery
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
