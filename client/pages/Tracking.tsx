import { useState } from "react";

export default function Tracking() {
  const [trackingId, setTrackingId] = useState("");
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setIsLoading(true);
    setError("");
    setOrderData(null);

    try {
      const response = await fetch(`/api/orders/track/${trackingId.trim()}`);

      if (response.ok) {
        const data = await response.json();
        setOrderData(data.order);
      } else if (response.status === 404) {
        setError(
          "Order not found. Please check your tracking ID and try again.",
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to track order. Please try again.");
      }
    } catch (error) {
      console.error("Tracking error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
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
    const statusOrder = [
      "pending",
      "confirmed",
      "picked_up",
      "in_transit",
      "delivered",
    ];
    const stepIndex = statusOrder.indexOf(stepKey);
    const currentIndex = statusOrder.indexOf(currentStatus);
    return stepIndex <= currentIndex;
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
                <label
                  htmlFor="trackingId"
                  className="block text-rocs-green font-semibold mb-2"
                >
                  Tracking ID
                </label>
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

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
              <strong>Try these sample tracking IDs:</strong> RC-2024-001,
              RC-2024-002
              <p className="text-sm mt-1">
                These are demo orders with real tracking data.
              </p>
            </div>
          </div>

          {/* Order Details */}
          {orderData && (
            <div className="space-y-8">
              {/* Order Info Card */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-rocs-green mb-4">
                      Order Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Order ID:
                        </span>
                        <p className="text-gray-800">{orderData.id}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Customer:
                        </span>
                        <p className="text-gray-800">
                          {orderData.customerName}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Phone:
                        </span>
                        <p className="text-gray-800">
                          {orderData.customerPhone}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Distance:
                        </span>
                        <p className="text-gray-800">{orderData.distance} km</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Cost:
                        </span>
                        <p className="text-gray-800 font-semibold">
                          KES {orderData.cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-rocs-green mb-4">
                      Delivery Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Pickup Location:
                        </span>
                        <p className="text-gray-800">{orderData.pickup}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Delivery Location:
                        </span>
                        <p className="text-gray-800">{orderData.delivery}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Order Date:
                        </span>
                        <p className="text-gray-800">
                          {formatDate(orderData.createdAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Estimated Delivery:
                        </span>
                        <p className="text-gray-800">
                          {formatDate(orderData.estimatedDelivery)}
                        </p>
                      </div>
                      {orderData.riderName && (
                        <>
                          <div>
                            <span className="text-sm font-medium text-gray-600">
                              Rider:
                            </span>
                            <p className="text-gray-800">
                              {orderData.riderName}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">
                              Rider Phone:
                            </span>
                            <p className="text-gray-800">
                              {orderData.riderPhone}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Progress */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-rocs-green mb-6">
                  Delivery Progress
                </h3>

                {/* Current Status Banner */}
                <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-rocs-green to-rocs-green-dark text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Current Status</h4>
                      <p className="text-sm opacity-90">
                        {orderData.currentStatus === "pending" &&
                          "Order received and being processed"}
                        {orderData.currentStatus === "confirmed" &&
                          "Order confirmed and rider assigned"}
                        {orderData.currentStatus === "picked_up" &&
                          "Package picked up and on the way"}
                        {orderData.currentStatus === "in_transit" &&
                          "Package is in transit to destination"}
                        {orderData.currentStatus === "delivered" &&
                          "Package delivered successfully"}
                      </p>
                    </div>
                    <div className="text-2xl">
                      {orderData.currentStatus === "pending" && "📋"}
                      {orderData.currentStatus === "confirmed" && "✅"}
                      {orderData.currentStatus === "picked_up" && "📦"}
                      {orderData.currentStatus === "in_transit" && "🚚"}
                      {orderData.currentStatus === "delivered" && "🎉"}
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="space-y-4">
                  {[
                    {
                      key: "pending",
                      label: "Order Received",
                      description: "Your order has been received and confirmed",
                      icon: "📋",
                    },
                    {
                      key: "confirmed",
                      label: "Order Confirmed",
                      description: `Rider assigned${orderData.riderName ? ": " + orderData.riderName : ""}`,
                      icon: "✅",
                    },
                    {
                      key: "picked_up",
                      label: "Package Picked Up",
                      description: `Package collected from ${orderData.pickup}`,
                      icon: "📦",
                    },
                    {
                      key: "in_transit",
                      label: "In Transit",
                      description: "Your package is on the way to destination",
                      icon: "🚚",
                    },
                    {
                      key: "delivered",
                      label: "Delivered",
                      description: `Package delivered to ${orderData.delivery}`,
                      icon: "🎉",
                    },
                  ].map((step, index) => {
                    const isCompleted = getStepStatus(
                      step.key,
                      orderData.currentStatus,
                    );
                    const isCurrent = step.key === orderData.currentStatus;

                    return (
                      <div key={step.key} className="flex items-start">
                        {/* Connector Line */}
                        {index > 0 && (
                          <div className="absolute left-4 w-0.5 h-6 bg-gray-200 -mt-6"></div>
                        )}

                        {/* Status Icon */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCompleted
                              ? "bg-rocs-green text-white"
                              : isCurrent
                                ? "bg-rocs-yellow text-gray-800"
                                : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {isCompleted ? "✓" : step.icon}
                        </div>

                        {/* Status Content */}
                        <div className="ml-4 flex-1">
                          <h4
                            className={`font-semibold ${
                              isCompleted
                                ? "text-gray-800"
                                : isCurrent
                                  ? "text-rocs-green"
                                  : "text-gray-500"
                            }`}
                          >
                            {step.label}
                          </h4>
                          <p
                            className={`text-sm ${
                              isCompleted
                                ? "text-gray-600"
                                : isCurrent
                                  ? "text-rocs-green"
                                  : "text-gray-400"
                            }`}
                          >
                            {step.description}
                          </p>

                          {/* Show timestamp for completed steps */}
                          {orderData.statusHistory &&
                            orderData.statusHistory.find(
                              (h: any) => h.status === step.key,
                            ) && (
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(
                                  orderData.statusHistory.find(
                                    (h: any) => h.status === step.key,
                                  ).timestamp,
                                )}
                              </p>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Estimated Delivery Time */}
                {orderData.estimatedDelivery &&
                  orderData.currentStatus !== "delivered" && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          ⏰
                        </div>
                        <div className="ml-3">
                          <h4 className="font-semibold text-blue-800">
                            Estimated Delivery
                          </h4>
                          <p className="text-sm text-blue-600">
                            {formatDate(orderData.estimatedDelivery)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
