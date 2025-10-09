import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Bike } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function RiderLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);

  function ForgotPasswordModal({ onClose }: { onClose?: () => void }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const submit = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        setMessage(data.message || 'If the email exists, a reset link has been sent.');
      } catch (err) {
        setMessage('Failed to send reset link. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-40" onClick={() => { setShowForgotModal(false); if (onClose) onClose(); }}></div>
        <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">Forgot password</h3>
          <p className="text-sm text-gray-600 mb-4">Enter the email used during registration and we'll send a reset link.</p>
          {message && <div className="mb-3 text-sm text-gray-700">{message}</div>}
          <div className="mb-3">
            <Label htmlFor="fp-email">Email address</Label>
            <Input id="fp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" className="px-4 py-2 rounded-md" onClick={() => { setShowForgotModal(false); if (onClose) onClose(); }}>Cancel</button>
            <Button type="button" onClick={submit} disabled={loading} className="bg-rocs-green">
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userType: 'rider' // Specify this is a rider login
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Verify this is actually a rider account
        if (result.user.userType !== 'rider') {
          throw new Error('This account is not registered as a rider. Please use the regular login page.');
        }
        
        // Store user session
        localStorage.setItem('user', JSON.stringify({
          id: result.user.id,
          name: result.user.fullName,
          email: result.user.email,
          userType: result.user.userType,
          isAuthenticated: true
        }));
        
        // Redirect to rider dashboard
        window.location.href = '/rider-dashboard';
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Invalid credentials');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rocs-green/10 to-rocs-yellow/10 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rocs-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-rocs-green mb-2">Rider Sign In</h1>
          <p className="text-gray-600">Access your Rocs Crew rider dashboard</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 pl-10"
                  placeholder="rider@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-rocs-green focus:ring-rocs-green border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-rocs-green hover:text-rocs-green-dark"
                >
                  Forgot password?
                </button>
              </div>

              {/* Forgot password modal */}
              {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} /> }
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-rocs-green hover:bg-rocs-green-dark text-white font-semibold py-3"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In as Rider
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Not a rider yet?{' '}
              <Link to="/signup" className="text-rocs-green hover:text-rocs-green-dark font-medium">
                Apply to join our team
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Other Options</p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/login"
                  className="text-rocs-green hover:text-rocs-green-dark text-sm font-medium"
                >
                  Customer Login
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/admin"
                  className="text-rocs-green hover:text-rocs-green-dark text-sm font-medium"
                >
                  Admin Access
                </Link>
              </div>
            </div>
          </div>

          {/* Rider Benefits Reminder */}
          <div className="mt-6 p-4 bg-rocs-green/5 rounded-lg">
            <h3 className="text-sm font-semibold text-rocs-green mb-2">Rider Benefits</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Flexible working hours</li>
              <li>• Competitive earnings per delivery</li>
              <li>• Weekly automated payments</li>
              <li>• Insurance coverage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
