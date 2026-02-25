import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL, apiFetch } from '../lib/api';
import { LogIn, Mail, Lock, Eye, EyeOff, User, Bike } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, forgotPasswordSchema } from '../../shared/validation';
import { z } from 'zod';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../hooks/use-toast';
import { triggerHaptic } from '../lib/mobileUtils';

type LoginFormValues = z.infer<typeof loginSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function Login() {
  const { login: authLogin, user: authUser } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState<'customer' | 'rider'>('customer');
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();

  // Check if user is already logged in and redirect
  useEffect(() => {
    if (authUser && authUser.isAuthenticated) {
      // User is already logged in, redirect based on type
      if (authUser.userType === 'rider') {
        navigate('/rider-dashboard');
      } else {
        navigate('/book-delivery');
      }
    }
  }, [navigate, authUser]);

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setValue('email', savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  function ForgotPasswordModal({ onClose }: { onClose?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const {
      register,
      handleSubmit: handleFpSubmit,
      formState: { errors }
    } = useForm<ForgotPasswordFormValues>({
      resolver: zodResolver(forgotPasswordSchema),
      mode: 'onChange',
      defaultValues: { email: '' }
    });

    const submit = async (data: ForgotPasswordFormValues) => {
      setLoading(true);
      setMessage(null);
      try {
        const csrfRes = await apiFetch(`${API_BASE_URL}/api/csrf-token`);
        const { token } = await csrfRes.json();

        const res = await apiFetch(`${API_BASE_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': token
          },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        toast({
          title: "Email Sent",
          description: result.message || 'If the email exists, a reset link has been sent.',
        });
        setMessage(result.message || 'If the email exists, a reset link has been sent.');
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to send reset link. Try again later.",
          variant: "destructive",
        });
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
          {message && <div className={`mb-3 text-sm font-medium ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</div>}
          <form onSubmit={handleFpSubmit(submit)}>
            <div className="mb-3">
              <Label htmlFor="fp-email">Email address</Label>
              <Input
                id="fp-email"
                type="email"
                {...register('email')}
                className={`mt-1 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" className="px-4 py-2 rounded-md" onClick={() => { setShowForgotModal(false); if (onClose) onClose(); }}>Cancel</button>
              <Button type="submit" disabled={loading} className="bg-rocs-green">
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Removed handleInputChange as react-hook-form handles it

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const csrfRes = await apiFetch(`${API_BASE_URL}/api/csrf-token`, {
        credentials: 'include',
        signal: controller.signal
      });
      const { token } = await csrfRes.json();

      const response = await apiFetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': token
        },
        body: JSON.stringify({
          ...data,
          userType: userType === 'rider' ? 'rider' : undefined
        }),
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        if (userType === 'rider' && result.user.userType !== 'rider') {
          throw new Error('This account is not registered as a rider. Please select Customer or sign up as a rider.');
        }

        if (rememberMe) {
          localStorage.setItem('rememberedEmail', data.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        authLogin(result.user);

        const intendedPath = localStorage.getItem('intendedPath') || '/book-delivery';
        localStorage.removeItem('intendedPath');
        navigate(result.user.userType === 'rider' ? '/rider-dashboard' : intendedPath);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Invalid credentials');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      let errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      if (error instanceof Error && error.name === 'AbortError') {
        errorMessage = "Connection timed out. Ensure your phone and PC are on the same Wi-Fi and Windows Firewall isn't blocking port 3001.";
      }
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rocs-green rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-rocs-green mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Rocs Crew account</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* User Type Selection */}
          <div className="mb-6">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setUserType('customer')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${userType === 'customer'
                  ? 'bg-white text-rocs-green shadow-sm'
                  : 'text-gray-600 hover:text-rocs-green'
                  }`}
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('rider')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${userType === 'rider'
                  ? 'bg-white text-rocs-green shadow-sm'
                  : 'text-gray-600 hover:text-rocs-green'
                  }`}
              >
                <Bike className="w-4 h-4" />
                <span className="font-medium">Rider</span>
              </button>
            </div>
          </div>
          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email username"
                  {...register('email')}
                  className={`mt-1 pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={`mt-1 pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-rocs-green focus:ring-rocs-green border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button type="button" onClick={() => setShowForgotModal(true)} className="text-rocs-green hover:text-rocs-green-dark">Forgot your password?</button>
              </div>

              {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
            </div>


            <div className="text-xs text-gray-500 text-center">
              By signing in, you agree to our{" "}
              <Link to="/terms" className="text-rocs-green hover:underline font-medium">Terms of Service</Link> and{" "}
              <Link to="/privacy" className="text-rocs-green hover:underline font-medium">Privacy Policy</Link>.
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => triggerHaptic()}
              className="w-full h-12 bg-rocs-green hover:bg-rocs-green-dark text-white font-bold rounded-xl shadow-lg shadow-rocs-green/20 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In as {userType === 'rider' ? 'Rider' : 'Customer'}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Don't have an account?</p>
              <div className="flex justify-center">
                <Link
                  to="/signup"
                  className="text-rocs-green hover:text-rocs-green-dark text-sm font-medium"
                >
                  {userType === 'rider' ? 'Join as Rider' : 'Sign up as Customer'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
