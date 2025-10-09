import { useState } from "react";
import {
  CreditCard,
  Banknote,
  Shield,
  ArrowRight,
  Smartphone,
} from "lucide-react";
import PayPalPayment from "./PayPalPayment";
import CashOnDelivery from "./CashOnDelivery";
import MpesaPayment from "./MpesaPayment";
import MpesaManual from "./MpesaManual";

interface PaymentSelectionProps {
  amount: number;
  currency?: string;
  onPaymentSuccess: (paymentDetails: any) => void;
  onPaymentError: (error: any) => void;
  disabled?: boolean;
}

type PaymentMethod = "paypal" | "mpesa" | "mpesa-manual" | "cash" | null;

export default function PaymentSelection({
  amount,
  currency = "KES",
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}: PaymentSelectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayPalSuccess = (details: any) => {
    setIsProcessing(false);
    onPaymentSuccess({
      method: "paypal",
      transactionId: details.id,
      status: "completed",
      amount: amount,
      currency: currency,
      details: details,
    });
  };

  const handlePayPalError = (error: any) => {
    setIsProcessing(false);
    onPaymentError({
      method: "paypal",
      error: error,
      message: "PayPal payment failed. Please try again.",
    });
  };

  const handleMpesaSuccess = (details: any) => {
    setIsProcessing(false);
    onPaymentSuccess({
      method: "mpesa",
      transactionId: details.transactionId,
      status: details.status,
      amount: amount,
      currency: currency,
      details: details.details,
    });
  };

  const handleMpesaError = (error: any) => {
    setIsProcessing(false);
    onPaymentError({
      method: "mpesa",
      error: error,
      message: "M-Pesa payment failed. Please try again.",
    });
  };

  const handleMpesaManualConfirm = () => {
    setIsProcessing(true);
    // Simulate confirmation process
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess({
        method: "mpesa-manual",
        transactionId: `MT-${Date.now()}`,
        status: "pending_verification",
        amount: amount,
        currency: currency,
        details: {
          paymentMethod: "M-Pesa Till Payment",
          tillNumber: "5056903",
          note: "Payment made via M-Pesa Till - Awaiting verification",
        },
      });
    }, 1000);
  };

  const handleCashConfirm = () => {
    setIsProcessing(true);
    // Simulate confirmation process
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess({
        method: "cash",
        transactionId: `COD-${Date.now()}`,
        status: "pending",
        amount: amount,
        currency: currency,
        details: {
          paymentMethod: "Cash on Delivery",
          note: "Payment will be collected upon delivery",
        },
      });
    }, 1000);
  };

  // Convert KES to USD for PayPal (approximate conversion)
  const paypalAmount = currency === "KES" ? amount / 130 : amount; // Rough KES to USD conversion
  const paypalCurrency = currency === "KES" ? "USD" : currency;

  if (disabled) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 text-center">
        <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-500 mb-2">
          Payment Options
        </h3>
        <p className="text-gray-400">
          Complete your order details to see payment options
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      {!selectedMethod && (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-rocs-green mb-2">
              Choose Payment Method
            </h3>
            <p className="text-gray-600">
              Select how you'd like to pay for your delivery
            </p>
            <div className="text-xl font-semibold text-gray-800 mt-4">
              Total: {currency} {amount.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* M-Pesa STK Push Option */}
            <div
              onClick={() => setSelectedMethod("mpesa")}
              className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  M-Pesa STK
                </h4>
                <p className="text-gray-600 mb-3 text-sm">Pay via STK Push</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center justify-center space-x-1">
                    <span>✓</span>
                    <span>Instant payment</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <span>✓</span>
                    <span>No till number needed</span>
                  </div>
                </div>
                <div className="mt-3 text-green-600 font-medium text-sm">
                  Pay {currency} {amount.toLocaleString()}
                </div>
                <div className="mt-2 flex items-center justify-center text-rocs-green font-medium text-sm">
                  <span>Select M-Pesa</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>

            {/* M-Pesa Manual Till Option */}
            <div
              onClick={() => setSelectedMethod("mpesa-manual")}
              className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-sm">Till</span>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  Lipa na M-Pesa
                </h4>
                <p className="text-gray-600 mb-3 text-sm">Till No: 5056903</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center justify-center space-x-1">
                    <span>✓</span>
                    <span>Pay from any phone</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <span>✓</span>
                    <span>Step-by-step guide</span>
                  </div>
                </div>
                <div className="mt-3 text-green-600 font-medium text-sm">
                  Pay {currency} {amount.toLocaleString()}
                </div>
                <div className="mt-2 flex items-center justify-center text-rocs-green font-medium text-sm">
                  <span>Select Till Payment</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>

            {/* PayPal Option */}
            <div
              onClick={() => setSelectedMethod("paypal")}
              className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">PayPal</h4>
                <p className="text-gray-600 mb-3 text-sm">
                  International cards
                </p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center justify-center space-x-1">
                    <span>✓</span>
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <span>✓</span>
                    <span>Secure & encrypted</span>
                  </div>
                </div>
                <div className="mt-3 text-blue-600 font-medium text-sm">
                  Pay ~${paypalAmount.toFixed(2)} USD
                </div>
                <div className="mt-2 flex items-center justify-center text-rocs-green font-medium text-sm">
                  <span>Select PayPal</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>

            {/* Cash on Delivery Option */}
            <div
              onClick={() => setSelectedMethod("cash")}
              className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-rocs-green hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-rocs-green rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  Cash on Delivery
                </h4>
                <p className="text-gray-600 mb-3 text-sm">Pay when delivered</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center justify-center space-x-1">
                    <span>✓</span>
                    <span>No advance payment</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <span>✓</span>
                    <span>Pay cash or M-Pesa</span>
                  </div>
                </div>
                <div className="mt-3 text-rocs-green font-medium text-sm">
                  Pay {currency} {amount.toLocaleString()} on delivery
                </div>
                <div className="mt-2 flex items-center justify-center text-rocs-green font-medium text-sm">
                  <span>Select Cash</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Payment Method */}
      {selectedMethod && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-rocs-green">
              {selectedMethod === "paypal" && "PayPal Payment"}
              {selectedMethod === "mpesa" && "M-Pesa STK Push"}
              {selectedMethod === "mpesa-manual" && "Lipa na M-Pesa"}
              {selectedMethod === "cash" && "Cash on Delivery"}
            </h3>
            <button
              onClick={() => setSelectedMethod(null)}
              className="text-gray-500 hover:text-gray-700 underline"
              disabled={isProcessing}
            >
              Change Payment Method
            </button>
          </div>

          {selectedMethod === "mpesa" && (
            <MpesaPayment
              amount={amount}
              currency={currency}
              onSuccess={handleMpesaSuccess}
              onError={handleMpesaError}
              onCancel={() => setSelectedMethod(null)}
              disabled={isProcessing}
            />
          )}

          {selectedMethod === "mpesa-manual" && (
            <MpesaManual
              amount={amount}
              currency={currency}
              onConfirm={handleMpesaManualConfirm}
              disabled={isProcessing}
            />
          )}

          {selectedMethod === "paypal" && (
            <PayPalPayment
              amount={paypalAmount}
              currency={paypalCurrency}
              onSuccess={handlePayPalSuccess}
              onError={handlePayPalError}
              onCancel={() => setSelectedMethod(null)}
              disabled={isProcessing}
            />
          )}

          {selectedMethod === "cash" && (
            <CashOnDelivery
              amount={amount}
              currency={currency}
              onConfirm={handleCashConfirm}
              disabled={isProcessing}
            />
          )}
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-500" />
          <span>All payments are secure and protected</span>
        </div>
      </div>
    </div>
  );
}
