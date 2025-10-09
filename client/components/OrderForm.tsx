import { useState, useCallback } from "react";
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
      alert("Please calculate the price first");
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

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Order created successfully:", result.order);
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
      alert("Error creating order. Please try again.");
      setCurrentStep("details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
    alert(error.message || "Payment failed. Please try again.");
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
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-rocs-green mb-4">
          Book Your Delivery
        </h2>
        <p className="text-gray-600">
          Fill in the details below to create your delivery order
        </p>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mt-6 space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "details" ? "bg-rocs-green text-white" : "bg-rocs-green text-white"}`}
            >
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-rocs-green">
              Order Details
            </span>
          </div>

          <div className="w-8 h-0.5 bg-gray-300"></div>

          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "payment" ? "bg-rocs-green text-white" : "bg-gray-300 text-gray-500"}`}
            >
              <CreditCard className="w-4 h-4" />
            </div>
            <span
              className={`text-sm font-medium ${currentStep === "payment" ? "text-rocs-green" : "text-gray-500"}`}
            >
              Payment
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customerName" className="text-gray-700">
                Full Name *
              </Label>
              <Input
                id="customerName"
                name="customerName"
                type="text"
                required
                value={formData.customerName}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail" className="text-gray-700">
                Email Address *
              </Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                required
                value={formData.customerEmail}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone" className="text-gray-700">
                Phone Number *
              </Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                required
                value={formData.customerPhone}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="+254 7XX XXX XXX"
              />
            </div>
          </div>
        </div>

        {/* Location Selection */}
        <div>
          <SimpleMapboxLocationPicker
            onLocationSelect={handleLocationSelect}
            onDistanceCalculated={handleDistanceCalculated}
          />
        </div>

        {/* Package Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Package Information
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="packageDetails" className="text-gray-700">
                Package Details *
              </Label>
              <Textarea
                id="packageDetails"
                name="packageDetails"
                required
                value={formData.packageDetails}
                onChange={handleInputChange}
                rows={3}
                className="mt-1"
                placeholder="Describe your package (type, size, weight, etc.)"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-gray-700">
                Special Instructions (Optional)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="mt-1"
                placeholder="Any special handling instructions"
              />
            </div>
          </div>
        </div>

        {/* Price Calculation */}
        {estimatedPrice && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Delivery Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-rocs-green">
                  {distance?.toFixed(1)} km
                </div>
                <div className="text-sm text-gray-600">Distance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-rocs-green">
                  {duration ? Math.round(duration) : "--"} min
                </div>
                <div className="text-sm text-gray-600">Est. Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-rocs-yellow">
                  KES {estimatedPrice?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center pt-6">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !estimatedPrice ||
              !pickupLocation ||
              !dropoffLocation
            }
            className="bg-rocs-green hover:bg-rocs-green-dark text-white px-8 py-3 text-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Order...
              </span>
            ) : (
              "Create Order"
            )}
          </Button>

          {estimatedPrice && (
            <p className="text-sm text-gray-600 mt-4">
              By placing this order, you agree to pay KES {estimatedPrice} upon
              delivery
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
