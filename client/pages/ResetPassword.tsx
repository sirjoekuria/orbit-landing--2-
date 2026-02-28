import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '../../shared/validation';
import { z } from 'zod';

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromQuery = searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      token: tokenFromQuery,
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    if (tokenFromQuery) setValue('token', tokenFromQuery);
  }, [tokenFromQuery, setValue]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setMessage(null);
    setLoading(true);
    try {
      const csrfRes = await fetch(`${API_BASE_URL}/api/csrf-token`, { credentials: 'include' });
      const { token: csrfToken } = await csrfRes.json();

      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({ token: data.token, newPassword: data.newPassword }),
        credentials: 'include'
      });
      const result = await res.json();
      if (res.ok) {
        setMessage({ text: 'Password updated successfully. Redirecting to login...', type: 'success' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ text: result.error || 'Failed to reset password.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Failed to reset password. Try again later.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-card rounded-[2.5rem] shadow-2xl border border-border p-10 backdrop-blur-sm">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-secondary mb-8 group transition-colors font-medium font-outfit"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>

          <div className="mb-8">
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 border border-secondary/20">
              <CheckCircle2 className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Reset password</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">Choose a strong new password for your account.</p>
          </div>

          {message && (
            <div className={`mb-8 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success'
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
            {(!tokenFromQuery || message?.type === 'error') && (
              <div className="space-y-2">
                <Label htmlFor="token" className="text-foreground/80 text-xs font-medium uppercase tracking-wider ml-1">Reset Token</Label>
                <Input
                  id="token"
                  {...register('token')}
                  className={`h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-1 focus:ring-secondary rounded-2xl transition-all ${errors.token ? 'border-destructive/50' : ''
                    }`}
                  placeholder="Paste your token here"
                />
                {errors.token && <p className="text-xs text-red-400 ml-1">{errors.token.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" name="password" className="text-foreground/80 text-xs font-medium uppercase tracking-wider ml-1">New password</Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register('newPassword')}
                  className={`h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-1 focus:ring-secondary rounded-2xl transition-all ${errors.newPassword ? 'border-destructive/50' : ''
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-400 ml-1">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-foreground/80 text-xs font-medium uppercase tracking-wider ml-1">Confirm password</Label>
              <Input
                id="confirm"
                type={showPassword ? "text" : "password"}
                {...register('confirmPassword')}
                className={`h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-1 focus:ring-secondary rounded-2xl transition-all ${errors.confirmPassword ? 'border-destructive/50' : ''
                  }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-xs text-red-400 ml-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-secondary to-rocs-green-dark hover:brightness-110 text-secondary-foreground font-bold text-lg rounded-2xl shadow-lg transition-all active:scale-[0.98] mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Updating...
                </div>
              ) : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
