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
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-green-600 mb-4">
          Order Created Successfully!
        </h3>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-semibold text-gray-800">{orderCreated}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-semibold text-gray-800 capitalize">
                {paymentDetails?.method === "paypal"
                  ? "PayPal"
                  : "Cash on Delivery"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-semibold text-gray-800">
                KES {estimatedPrice?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p
                className={`font-semibold ${paymentDetails?.status === "completed" ? "text-green-600" : "text-orange-600"}`}
              >
                {paymentDetails?.status === "completed"
                  ? "Paid"
                  : "Pending (Pay on Delivery)"}
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          You can track your order using the order ID on our tracking page.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() =>
              (window.location.href = `/tracking?id=${orderCreated}`)
            }
            className="bg-rocs-green hover:bg-rocs-green-dark"
          >
            Track Order
          </Button>
          <Button
            onClick={resetForm}
            variant="outline"
            className="border-rocs-green text-rocs-green hover:bg-rocs-green hover:text-white"
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
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-rocs-green mb-4">
            Complete Your Payment
          </h2>
          <p className="text-gray-600">
            Choose your preferred payment method to confirm your delivery order
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Order Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Customer:</p>
              <p className="font-semibold">{formData.customerName}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone:</p>
              <p className="font-semibold">{formData.customerPhone}</p>
            </div>
            <div>
              <p className="text-gray-600">From:</p>
              <p className="font-semibold">{formData.pickup}</p>
            </div>
            <div>
              <p className="text-gray-600">To:</p>
              <p className="font-semibold">{formData.delivery}</p>
            </div>
            <div>
              <p className="text-gray-600">Distance:</p>
              <p className="font-semibold">{distance} km</p>
            </div>
            <div>
              <p className="text-gray-600">Total Cost:</p>
              <p className="font-semibold text-rocs-green text-lg">
                KES {estimatedPrice?.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep("details")}
            className="mt-4 text-rocs-green hover:text-rocs-green-dark underline text-sm"
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
    <div className="bg-[#0a110d] w-full">
      {/* Progress Pill Tabs */}
      <div className="flex bg-[#1c2c1a] rounded-full p-1 mb-8">
        <div
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-full cursor-pointer transition-all ${currentStep === "details"
            ? "bg-gradient-to-r from-[#eab308] to-[#9a6b0c] text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]"
            : "text-[#8b9d93] hover:text-white"
            }`}
          onClick={() => setCurrentStep("details")}
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${currentStep === "details" ? "border-black" : "border-[#8b9d93]"}`}>
            {currentStep === "details" && <div className="w-2 h-2 bg-black rounded-full" />}
          </div>
          <span className="font-bold text-sm">Order Details</span>
        </div>
        <div
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-full cursor-not-allowed transition-all ${currentStep === "payment"
            ? "bg-gradient-to-r from-[#eab308] to-[#9a6b0c] text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]"
            : "text-[#8b9d93]"
            }`}
        >
          <span className="font-bold text-sm opacity-50">Payment</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-[#112417] border border-[#eab308] rounded-2xl p-6 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
          <h3 className="text-lg font-bold text-white mb-4">
            Customer Information
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName" className="text-white text-sm mb-1.5 block">
                Full Name <span className="text-[#eab308]">*</span>
              </Label>
              <Input
                id="customerName"
                name="customerName"
                type="text"
                required
                value={formData.customerName}
                onChange={handleInputChange}
                className="bg-transparent border-[#8b9d93]/40 text-white focus:border-[#eab308] rounded-lg h-11"
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail" className="text-white text-sm mb-1.5 block">
                Email Address <span className="text-[#eab308]">*</span>
              </Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                required
                value={formData.customerEmail}
                onChange={handleInputChange}
                className="bg-transparent border-[#8b9d93]/40 text-white focus:border-[#eab308] rounded-lg h-11"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone" className="text-white text-sm mb-1.5 block">
                Phone Number <span className="text-[#eab308]">*</span>
              </Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                required
                value={formData.customerPhone}
                onChange={handleInputChange}
                className="bg-transparent border-[#8b9d93]/40 text-white focus:border-[#eab308] rounded-lg h-11"
                placeholder="+254 7XX XXX XXX"
              />
            </div>
          </div>

          {/* Saved Addresses Option */}
          <div className="flex items-center space-x-3 mt-4">
            <input
              type="checkbox"
              id="saveAddresses"
              checked={saveAddresses}
              onChange={(e) => setSaveAddresses(e.target.checked)}
              className="w-4 h-4 text-[#eab308] bg-transparent border-[#eab308] rounded focus:ring-[#eab308] focus:ring-offset-[#112417]"
            />
            <Label htmlFor="saveAddresses" className="text-sm text-[#8b9d93] cursor-pointer">
              Save these addresses for future deliveries
            </Label>
          </div>
        </div>

        {/* Location Selection */}
        <div className="bg-[#112417] border border-[#eab308] rounded-2xl p-6 shadow-[0_0_15px_rgba(234,179,8,0.1)] relative">
          <h3 className="text-lg font-bold text-white mb-4">
            Select Pickup & Drop-off Locations
          </h3>
          <SimpleMapboxLocationPicker
            onLocationSelect={handleLocationSelect}
            onDistanceCalculated={handleDistanceCalculated}
          />
        </div>

        {/* Package Information */}
        <div className="bg-[#112417] border border-[#eab308] rounded-2xl p-6 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
          <h3 className="text-lg font-bold text-white mb-4">
            Package Information
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="packageDetails" className="text-white text-sm mb-1.5 block">
                Package Details <span className="text-[#eab308]">*</span>
              </Label>
              <Textarea
                id="packageDetails"
                name="packageDetails"
                required
                value={formData.packageDetails}
                onChange={handleInputChange}
                rows={3}
                className="bg-transparent border-[#8b9d93]/40 text-white focus:border-[#eab308] rounded-lg resize-none placeholder:text-gray-500"
                placeholder="Describe your package (type, size, weight, etc.)"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-white text-sm mb-1.5 block">
                Special Instructions (Optional)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="bg-transparent border-[#8b9d93]/40 text-white focus:border-[#eab308] rounded-lg resize-none placeholder:text-gray-500"
                placeholder="Any special handling instructions"
              />
            </div>
          </div>
        </div>

        {/* Price Calculation Summary - Modified for Dark Theme */}
        {estimatedPrice && (
          <div className="bg-[#112417] border border-[#eab308]/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Delivery Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">
                  {distance?.toFixed(1)} km
                </div>
                <div className="text-xs text-[#8b9d93] uppercase tracking-wider font-bold">Distance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {duration ? Math.round(duration) : "--"} min
                </div>
                <div className="text-xs text-[#8b9d93] uppercase tracking-wider font-bold">Est. Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#eab308]">
                  KES {estimatedPrice?.toLocaleString()}
                </div>
                <div className="text-xs text-[#8b9d93] uppercase tracking-wider font-bold">Total Cost</div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
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
            className="w-full bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-bold h-14 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.3)] text-lg transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Creating Order...
              </span>
            ) : (
              "Create Order"
            )}
          </Button>

          {estimatedPrice && (
            <p className="text-xs text-[#8b9d93] text-center mt-4">
              By placing this order, you agree to pay KES {estimatedPrice} upon
              delivery
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
