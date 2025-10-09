import { useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface PayPalPaymentProps {
  amount: number;
  currency?: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    paypal: any;
  }
}

export default function PayPalPayment({ 
  amount, 
  currency = "USD", 
  onSuccess, 
  onError, 
  onCancel,
  disabled = false 
}: PayPalPaymentProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayPalSDK = () => {
      // Check if PayPal SDK is already loaded
      if (window.paypal) {
        setIsSDKReady(true);
        setIsLoading(false);
        return;
      }

      // Get PayPal Client ID from environment or use the live one we configured
      const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID ||
                            'AbS0oMjeCgXXVlxSbht7O4brye9TacLSKMb3CzD8arBLdizO_QzgI9n6U3mBBxYwWAn4rX4lgAzSMkUu';

      // Create script element for PayPal SDK
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=${currency}`;
      script.async = true;

      script.onload = () => {
        setIsSDKReady(true);
        setIsLoading(false);
      };

      script.onerror = () => {
        setError('Failed to load PayPal SDK');
        setIsLoading(false);
      };

      document.body.appendChild(script);

      return () => {
        // Cleanup script if component unmounts
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    };

    loadPayPalSDK();
  }, [currency]);

  useEffect(() => {
    if (isSDKReady && paypalRef.current && window.paypal && amount > 0) {
      // Clear any existing PayPal buttons
      paypalRef.current.innerHTML = '';

      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount.toFixed(2),
                currency_code: currency
              },
              description: 'Rocs Crew Motorcycle Delivery Service'
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const details = await actions.order.capture();
            onSuccess(details);
          } catch (error) {
            onError(error);
          }
        },
        onError: (error: any) => {
          console.error('PayPal Error:', error);
          onError(error);
        },
        onCancel: (data: any) => {
          console.log('PayPal payment cancelled:', data);
          if (onCancel) {
            onCancel();
          }
        },
        style: {
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          layout: 'vertical',
          height: 45
        }
      }).render(paypalRef.current);
    }
  }, [isSDKReady, amount, currency, onSuccess, onError, onCancel]);

  if (disabled) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
        <div className="text-gray-500 mb-2">PayPal Payment</div>
        <div className="text-sm text-gray-400">Complete order details to enable payment</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-rocs-green" />
        <div className="text-gray-600">Loading PayPal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
        <div className="text-red-700 font-medium">PayPal Error</div>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-center mb-4">
        <div className="text-lg font-semibold text-gray-800">Pay with PayPal</div>
        <div className="text-2xl font-bold text-rocs-green">
          {currency} {amount.toFixed(2)}
        </div>
      </div>
      
      <div ref={paypalRef} className="paypal-button-container">
        {/* PayPal buttons will be rendered here */}
      </div>
      
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Secure payment powered by PayPal</span>
        </div>
      </div>
    </div>
  );
}
