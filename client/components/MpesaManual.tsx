import { useState } from "react";
import { CheckCircle, Copy, Smartphone, ArrowRight, Clock } from "lucide-react";

interface MpesaManualProps {
  amount: number;
  currency?: string;
  onConfirm: () => void;
  disabled?: boolean;
}

export default function MpesaManual({
  amount,
  currency = "KES",
  onConfirm,
  disabled = false,
}: MpesaManualProps) {
  const [copied, setCopied] = useState(false);
  const tillNumber = "5056903";

  const copyTillNumber = () => {
    navigator.clipboard.writeText(tillNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        <div className="text-lg font-semibold text-gray-800">
          Lipa na M-Pesa
        </div>
        <div className="text-2xl font-bold text-rocs-green">
          {currency} {amount.toLocaleString()}
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-green-800 mb-4 flex items-center">
          <Smartphone className="w-5 h-5 mr-2" />
          M-Pesa Payment Instructions
        </h4>

        <div className="space-y-3 text-sm text-green-700">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            <div>
              <div className="font-medium">Go to M-Pesa Menu</div>
              <div className="text-green-600">
                On your phone, dial *334# or use M-Pesa app
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            <div>
              <div className="font-medium">Select "Lipa na M-Pesa"</div>
              <div className="text-green-600">
                Choose option 4 - Lipa na M-Pesa
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
            <div>
              <div className="font-medium">Select "Buy Goods and Services"</div>
              <div className="text-green-600">
                Choose option 2 - Buy Goods and Services
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              4
            </span>
            <div>
              <div className="font-medium">Enter Till Number</div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="bg-white border border-green-300 rounded px-3 py-2 font-mono text-lg font-bold text-green-800">
                  {tillNumber}
                </div>
                <button
                  onClick={copyTillNumber}
                  className="bg-green-600 text-white px-3 py-2 rounded text-xs hover:bg-green-700 transition-colors flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              5
            </span>
            <div>
              <div className="font-medium">Enter Amount</div>
              <div className="text-green-600">
                Enter{" "}
                <strong>
                  {currency} {amount.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              6
            </span>
            <div>
              <div className="font-medium">Enter Your M-Pesa PIN</div>
              <div className="text-green-600">
                Complete the transaction with your PIN
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Till Number Highlight */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white mb-6">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">
            🏪 Rocs Crew Till Number
          </div>
          <div className="text-3xl font-bold mb-2 tracking-wider">
            {tillNumber}
          </div>
          <div className="text-green-100 text-sm">
            Copy this number to your M-Pesa
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-2">
          <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-yellow-800">
            <div className="font-medium text-sm">Important Notes:</div>
            <ul className="text-xs mt-1 space-y-1">
              <li>• You'll receive an M-Pesa confirmation SMS</li>
              <li>• Save the M-Pesa transaction code for your records</li>
              <li>• Payment verification may take 1-2 minutes</li>
              <li>• Contact us if you don't receive confirmation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={disabled}
        className="w-full bg-rocs-green text-white py-3 px-4 rounded-lg font-medium hover:bg-rocs-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        <span>I've Sent the M-Pesa Payment</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="mt-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Secured by Safaricom M-Pesa</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          For support: Call/WhatsApp +254 712 345 678
        </div>
      </div>
    </div>
  );
}
