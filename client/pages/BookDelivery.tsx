import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, LogIn, Package } from 'lucide-react';
import OrderForm from '../components/OrderForm';
import { Button } from '../components/ui/button';

export default function BookDelivery() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for logged in user
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    
    // Store intended path for redirect after login
    localStorage.setItem('intendedPath', '/book-delivery');
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rocs-green"></div>
      </div>
    );
  }

  // If user is not logged in, show signup/login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-rocs-green rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Sign In Required
            </h1>
            
            <p className="text-gray-600 mb-8">
              You need to create an account or sign in to book a delivery with Rocs Crew.
            </p>

            <div className="space-y-4">
              <Link to="/signup">
                <Button className="w-full bg-rocs-green hover:bg-rocs-green-dark text-white font-semibold py-3">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </Button>
              </Link>
              
              <Link to="/login">
                <Button 
                  variant="outline" 
                  className="w-full border-rocs-green text-rocs-green hover:bg-rocs-green hover:text-white font-semibold py-3"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                New to Rocs Crew? Create an account to:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Track your deliveries in real-time</li>
                <li>• Save delivery addresses</li>
                <li>• View order history</li>
                <li>• Get exclusive offers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in, show the order form
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-rocs-green mb-2">
              Book Your Delivery
            </h1>
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold text-rocs-green">{user.name}</span>!
            </p>
          </div>
          <OrderForm />
        </div>
      </div>
    </div>
  );
}
