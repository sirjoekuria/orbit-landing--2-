import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import { LogIn, Mail, Lock, Eye, EyeOff, Bike, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, forgotPasswordSchema } from '../../shared/validation';
import { z } from 'zod';
import { useAuth } from '../lib/AuthContext';

type LoginFormValues = z.infer<typeof loginSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function RiderLogin() {
  const { login: authLogin, user: authUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in and redirect
  useEffect(() => {
    if (authUser) {
      navigate(authUser.userType === 'rider' ? '/rider-dashboard' : '/book-delivery');
    }
  }, [navigate, authUser]);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  function ForgotPasswordModal({ onClose }: { onClose?: () => void }) {
    const {
      register,
      handleSubmit: handleForgotSubmit,
      formState: { errors: forgotErrors },
    } = useForm<ForgotPasswordFormValues>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: {
        email: ''
      }
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const onSubmitForgot = async (data: ForgotPasswordFormValues) => {
      setLoading(true);
      setMessage(null);
      try {
        const csrfRes = await fetch(`${API_BASE_URL}/api/csrf-token`, { credentials: 'include' });
        const { token } = await csrfRes.json();

        const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': token
          },
          body: JSON.stringify(data),
          credentials: 'include'
        });
        const result = await res.json();
        setMessage(result.message || 'If the email exists, a reset link has been sent.');
      } catch (err) {
        setMessage('Failed to send reset link. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowForgotModal(false); if (onClose) onClose(); }}></div>
        <div className="bg-white rounded-2xl shadow-xl p-8 z-10 w-full max-w-md relative">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Forgot Password</h3>
          <p className="text-sm text-gray-600 mb-6">Enter the email used during registration and we'll send a reset link.</p>

          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleForgotSubmit(onSubmitForgot)} className="space-y-6">
            <div>
              <Label htmlFor="fp-email">Email Address</Label>
              <Input
                id="fp-email"
                type="email"
                {...register('email')}
                className={`mt-1 h-11 ${forgotErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="your.email@example.com"
              />
              {forgotErrors.email && <p className="mt-1 text-xs text-red-600">{forgotErrors.email.message}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => { setShowForgotModal(false); if (onClose) onClose(); }}
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-rocs-green hover:bg-rocs-green/90 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-rocs-green/20"
              >
                {loading ? 'Sending...' : 'Send Link'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);

    try {
      const csrfRes = await fetch(`${API_BASE_URL}/api/csrf-token`, { credentials: 'include' });

      if (!csrfRes.ok) {
        throw new Error('Server connection failed. Ensure the server or tunnel is running.');
      }

      let token = '';
      try {
        const csrfData = await csrfRes.json();
        token = csrfData.token;
      } catch (e) {
        throw new Error('Invalid API response. Ensure the backend URL is correctly configured.');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': token
        },
        body: JSON.stringify({
          ...data,
          userType: 'rider'
        }),
      });

      let result;
      let errorData;

      try {
        if (response.ok) {
          result = await response.json();
        } else {
          errorData = await response.json();
        }
      } catch (e) {
        throw new Error('Invalid API response format. Ensure the backend URL is properly configured and the tunnel is reachable.');
      }

      if (response.ok) {
        if (result.user.userType !== 'rider' && result.user.user_type !== 'rider') {
          throw new Error('This account is not registered as a rider.');
        }

        authLogin(result.user);
        navigate('/rider-dashboard');
      } else {
        throw new Error(errorData?.error || 'Login failed');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rocs-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rocs-green/30">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rider Portal</h1>
          <p className="text-gray-600">Secure access to your dashboard</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sm:p-10 border border-gray-100">
          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold mb-1.5 block">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`pl-11 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white transition-all ${errors.email ? 'border-red-500 ring-red-500' : 'focus:ring-rocs-green'}`}
                  placeholder="rider@example.com"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs font-medium text-red-600 pl-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm font-bold text-rocs-green hover:text-rocs-green/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`pl-11 pr-11 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white transition-all ${errors.password ? 'border-red-500 ring-red-500' : 'focus:ring-rocs-green'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs font-medium text-red-600 pl-1">{errors.password.message}</p>}
            </div>


            <div className="text-[11px] text-gray-400 text-center px-4 leading-relaxed">
              By signing in, you agree to our{" "}
              <Link to="/terms" className="text-rocs-green hover:underline font-bold">Terms of Service</Link> and{" "}
              <Link to="/privacy" className="text-rocs-green hover:underline font-bold">Privacy Policy</Link>.
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-rocs-green hover:bg-rocs-green/90 text-white font-bold text-lg rounded-2xl shadow-lg shadow-rocs-green/30 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-3 font-medium">Not a rider yet?</p>
            <Link
              to="/signup?type=rider"
              className="inline-flex items-center justify-center gap-2 text-rocs-green font-extrabold hover:text-rocs-green/80 transition-colors group"
            >
              <User className="w-4 h-4" />
              <span>Apply to Join the Crew</span>
              <Bike className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
