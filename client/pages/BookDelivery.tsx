import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/ui/button';
import OrderForm from '../components/OrderForm';

export default function BookDelivery() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Store intended path for redirect after login
    localStorage.setItem('intendedPath', '/book-delivery');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not logged in, show signup/login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-16 transition-colors duration-300">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card rounded-3xl shadow-xl border border-border p-8 text-center backdrop-blur-sm">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <Package className="w-8 h-8 text-primary-foreground" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-4">
              Sign In Required
            </h1>

            <p className="text-muted-foreground mb-8">
              You need to create an account or sign in to book a delivery with Rocs Crew.
            </p>

            <div className="space-y-4">
              <Link to="/signup">
                <Button className="w-full bg-primary hover:bg-primary-foreground hover:text-primary font-semibold py-3 rounded-xl transition-all">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </Button>
              </Link>

              <Link to="/login">
                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 rounded-xl transition-all"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                New to Rocs Crew? Create an account to:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
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
    <div className="min-h-screen bg-background py-16 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">
              Book Your Delivery
            </h1>
          </div>
          <OrderForm />
        </div>
      </div>
    </div>
  );
}
