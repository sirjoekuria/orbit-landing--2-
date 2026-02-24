import { useState } from "react";
import { API_BASE_URL } from '../lib/api';
import {
  CheckCircle,
  AlertCircle,
  Loader,
  Phone,
  Smartphone,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MpesaPaymentProps {
  amount: number;
  currency?: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export default function MpesaPayment({
  amount,
  currency = "KES",
  onSuccess,
  onError,
  onCancel,
  disabled = false,
}: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"phone" | "processing" | "waiting" | "success">("phone");

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format as Kenyan number
    if (digits.startsWith("254")) {
      return digits.slice(0, 12);
    } else if (digits.startsWith("0")) {
      return "254" + digits.slice(1, 10);
    } else if (digits.startsWith("7") || digits.startsWith("1")) {
      return "254" + digits.slice(0, 9);
    }

    return digits.slice(0, 9);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const isValidPhone = () => {
    return phoneNumber.length >= 12 && phoneNumber.startsWith("254");
  };

  const handleMpesaPayment = async () => {
    if (!isValidPhone()) {
      onError({
        method: "mpesa",
        error: "Invalid phone number",
        message: "Please enter a valid Kenyan phone number",
      });
      return;
    }

    setIsProcessing(true);
    setStep("processing");

    try {
      // 1. Fetch CSRF token
      const csrfRes = await fetch(`${API_BASE_URL}/api/csrf-token`);
      const { token: csrfToken } = await csrfRes.json();

      // 2. Initiate STK Push
      const response = await fetch(`${API_BASE_URL}/api/payments/mpesa/stkpush`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          amount: amount,
          orderId: `ORD-${Date.now()}` // Ideally this should be passed from props
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate M-Pesa payment");
      }

      setStep("waiting");

      // 2. Start Polling for status
      const pollingInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${API_BASE_URL}/api/payments/mpesa/status/${data.checkoutRequestId}`);
          const statusData = await statusResponse.json();

          if (statusData.status === "completed") {
            clearInterval(pollingInterval);
            setIsProcessing(false);
            setStep("success");

            setTimeout(() => {
              onSuccess({
                method: "mpesa",
                transactionId: statusData.transactionId,
                status: "completed",
                amount: amount,
                currency: currency,
                phoneNumber: phoneNumber,
                details: {
                  paymentMethod: "M-Pesa STK Push",
                  phoneNumber: phoneNumber,
                  transactionCode: statusData.transactionId,
                },
              });
            }, 3000); // Show success UI for 3 seconds
          } else if (statusData.status === "failed") {
            clearInterval(pollingInterval);
            setIsProcessing(false);
            setStep("phone");
            onError({
              method: "mpesa",
              error: statusData.message,
              message: statusData.message || "M-Pesa payment failed. Please try again.",
            });
          }
        } catch (pollError) {
          console.error("Polling error:", pollError);
        }
      }, 3000); // Poll every 3 seconds

      // Timeout after 60 seconds
      setTimeout(() => {
        clearInterval(pollingInterval);
        if (isProcessing && step === "waiting") {
          setIsProcessing(false);
          setStep("phone");
          onError({
            method: "mpesa",
            error: "timeout",
            message: "Payment verification timed out. If you paid, please contact support with your receipt.",
          });
        }
      }, 60000);

    } catch (error: any) {
      setIsProcessing(false);
      setStep("phone");
      onError({
        method: "mpesa",
        error: error,
        message: error.message || "M-Pesa payment failed. Please try again.",
      });
    }
  };

  if (disabled) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
        <div className="text-gray-500 mb-2">M-Pesa Payment</div>
        <div className="text-sm text-gray-400">
          Complete order details to enable payment
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        <div className="text-lg font-semibold text-gray-800">
          Pay with M-Pesa
        </div>
        <div className="text-2xl font-bold text-rocs-green">
          {currency} {amount.toLocaleString()}
        </div>
      </div>

      {step === "phone" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              M-Pesa Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="e.g., 0712345678"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                maxLength={12}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your Safaricom M-Pesa number (07XX XXX XXX)
            </p>
          </div>

          <button
            onClick={handleMpesaPayment}
            disabled={!isValidPhone() || isProcessing}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send STK Push to +{phoneNumber || "Your Phone"}
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {step === "processing" && (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <div className="text-lg font-medium text-gray-800 mb-2">
            Sending STK Push...
          </div>
          <div className="text-gray-600">
            Please wait while we initiate the payment
          </div>
        </div>
      )}

      {step === "waiting" && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Smartphone className="w-8 h-8 text-green-600 animate-pulse" />
          </div>
          <div className="text-lg font-medium text-gray-800 mb-2">
            Check Your Phone
          </div>
          <div className="text-gray-600 mb-4">
            STK Push sent to <strong>+{phoneNumber}</strong>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="text-green-800 font-medium text-sm">
              📱 Enter your M-Pesa PIN on your phone to complete the payment
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Payment will be processed automatically once you confirm on your
            phone
          </div>
        </div>
      )}

      <AnimatePresence>
        {step === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-center py-8 absolute inset-0 bg-white flex flex-col items-center justify-center z-10 rounded-lg"
          >
            {/* Confetti-like particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  x: Math.cos(i * 30 * Math.PI / 180) * 100,
                  y: Math.sin(i * 30 * Math.PI / 180) * 100
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#22c55e', '#eab308', '#3b82f6', '#ef4444'][i % 4],
                  zIndex: -1
                }}
              />
            ))}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-800 mb-1"
            >
              Payment Successful!
            </motion.h3>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600"
            >
              Your order is being processed
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Secured by Safaricom M-Pesa</span>
        </div>
      </div>
    </div>
  );
}
