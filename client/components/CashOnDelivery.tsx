import { Banknote, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface CashOnDeliveryProps {
  amount: number;
  currency?: string;
  onConfirm: () => void;
  disabled?: boolean;
}

export default function CashOnDelivery({ 
  amount, 
  currency = "KES", 
  onConfirm,
  disabled = false 
}: CashOnDeliveryProps) {
  
  if (disabled) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
        <div className="text-gray-500 mb-2">Cash on Delivery</div>
        <div className="text-sm text-gray-400">Complete order details to enable payment</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-rocs-green rounded-full mb-4">
          <Banknote className="w-8 h-8 text-white" />
        </div>
        <div className="text-lg font-semibold text-gray-800 mb-2">Cash on Delivery</div>
        <div className="text-2xl font-bold text-rocs-green">
          {currency} {amount.toLocaleString()}
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4 mb-6">
        <div className="bg-rocs-yellow-light rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-rocs-green mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Payment on Delivery</h4>
              <p className="text-sm text-gray-600">
                Pay {currency} {amount.toLocaleString()} in cash when your package is delivered to your location.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800 mb-1">What's Included</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time tracking of your delivery</li>
                <li>• Professional motorcycle rider</li>
                <li>• Insurance coverage for your package</li>
                <li>• SMS updates on delivery status</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Important Notes</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Please have exact change ready</li>
                <li>• Payment required before package handover</li>
                <li>• Mobile money (M-Pesa) also accepted</li>
                <li>• Receipt will be provided upon payment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={onConfirm}
        className="w-full bg-rocs-green hover:bg-rocs-green-dark text-white font-semibold py-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
      >
        <Banknote className="w-5 h-5" />
        <span>Confirm Cash on Delivery</span>
      </button>

      {/* Security Note */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Secure and reliable delivery service</span>
        </div>
      </div>
    </div>
  );
}
