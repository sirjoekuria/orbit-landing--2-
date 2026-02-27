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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setShowForgotModal(false); if (onClose) onClose(); }}></div>
        <div className="bg-[#112417] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 p-8 z-10 w-full max-w-md animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#eab308]/20 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#eab308]" />
            </div>
            <h3 className="text-xl font-bold text-white">Forgot password</h3>
          </div>
          <p className="text-[#8b9d93] mb-6">Enter the email used during registration and we'll send a reset link.</p>

          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.includes('Failed') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-rocs-green/10 text-rocs-green border border-rocs-green/20'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleFpSubmit(submit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fp-email" className="text-white/80 text-xs font-medium uppercase tracking-wider">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b9d93]" />
                <Input
                  id="fp-email"
                  type="email"
                  {...register('email')}
                  className={`h-12 pl-11 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-xl transition-all ${errors.email ? 'border-red-500/50' : ''}`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="flex-1 h-12 rounded-xl text-white font-medium hover:bg-white/5 transition-colors border border-white/5"
                onClick={() => { setShowForgotModal(false); if (onClose) onClose(); }}
              >
                Cancel
              </button>
              <Button type="submit" disabled={loading} className="flex-1 h-12 bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                {loading ? 'Sending...' : 'Send link'}
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
        throw new Error(errorData?.error || 'Invalid credentials');
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
    <div className="min-h-screen bg-[#0a110d] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rocs-green/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#eab308]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-[#eab308] to-[#ca8a04] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <LogIn className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-[#8b9d93] text-lg">Sign in to your Rocs Crew account</p>
        </div>

        <div className="bg-[#112417] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 p-10 backdrop-blur-sm">
          {/* User Type Selection */}
          <div className="mb-10">
            <div className="flex rounded-2xl bg-[#0a110d]/50 p-1.5 border border-white/5">
              <button
                type="button"
                onClick={() => setUserType('customer')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 ${userType === 'customer'
                  ? 'bg-gradient-to-r from-[#eab308] to-[#ca8a04] text-black shadow-lg'
                  : 'text-[#8b9d93] hover:text-white'
                  }`}
              >
                <User className="w-4 h-4" />
                <span className="font-bold">Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('rider')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 ${userType === 'rider'
                  ? 'bg-gradient-to-r from-[#eab308] to-[#ca8a04] text-black shadow-lg'
                  : 'text-[#8b9d93] hover:text-white'
                  }`}
              >
                <Bike className="w-4 h-4" />
                <span className="font-bold">Rider</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9d93] group-focus-within:text-[#eab308] transition-colors w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email username"
                  {...register('email')}
                  className={`h-14 pl-12 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all ${errors.email ? 'border-red-500/50' : ''}`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b9d93] group-focus-within:text-[#eab308] transition-colors w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={`h-14 pl-12 pr-12 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all ${errors.password ? 'border-red-500/50' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b9d93] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400 ml-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center group cursor-pointer">
                <div className="relative flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 bg-[#0a110d]/80 border-white/10 rounded text-[#eab308] focus:ring-[#eab308] focus:ring-offset-0"
                  />
                </div>
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#8b9d93] group-hover:text-white transition-colors cursor-pointer font-medium font-outfit">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button type="button" onClick={() => setShowForgotModal(true)} className="text-[#eab308] hover:text-[#ca8a04] font-bold transition-colors">Forgot password?</button>
              </div>

              {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
            </div>


            <div className="text-[11px] text-[#8b9d93] text-center px-4">
              By signing in, you agree to our{" "}
              <Link to="/terms" className="text-[#eab308] hover:underline font-bold transition-colors">Terms</Link> and{" "}
              <Link to="/privacy" className="text-[#eab308] hover:underline font-bold transition-colors">Privacy Policy</Link>.
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => triggerHaptic()}
              className="w-full h-14 bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mr-3"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="w-5 h-5 mr-3" />
                  Sign In as {userType === 'rider' ? 'Rider' : 'Customer'}
                </span>
              )}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5">
            <div className="text-center">
              <p className="text-[#8b9d93] text-sm mb-4 font-outfit">Don't have an account?</p>
              <div className="flex justify-center">
                <Link
                  to="/signup"
                  className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all border border-white/5 active:scale-[0.98]"
                >
                  {userType === 'rider' ? 'JOIN AS RIDER' : 'CREATE CUSTOMER ACCOUNT'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
