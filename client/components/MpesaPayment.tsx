import { useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Loader,
  Phone,
  Smartphone,
} from "lucide-react";

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
  const [step, setStep] = useState<"phone" | "processing" | "waiting">("phone");

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
      // Simulate M-Pesa STK Push API call
      // In production, this would call your M-Pesa integration
      setTimeout(() => {
        setStep("waiting");

        // Simulate user checking phone and entering PIN
        setTimeout(() => {
          setIsProcessing(false);

          // Simulate successful payment
          onSuccess({
            method: "mpesa",
            transactionId: `MP${Date.now()}`,
            status: "completed",
            amount: amount,
            currency: currency,
            phoneNumber: phoneNumber,
            details: {
              paymentMethod: "M-Pesa STK Push",
              phoneNumber: phoneNumber,
              transactionCode: `NLJ7RT${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            },
          });
        }, 8000); // 8 seconds to simulate user entering PIN
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      onError({
        method: "mpesa",
        error: error,
        message: "M-Pesa payment failed. Please try again.",
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

      <div className="mt-6 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Secured by Safaricom M-Pesa</span>
        </div>
      </div>
    </div>
  );
}
