import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
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
      const csrfRes = await fetch('/api/csrf-token');
      const { token: csrfToken } = await csrfRes.json();

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({ token: data.token, newPassword: data.newPassword }),
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50/50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-500 hover:text-rocs-green mb-6 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to login
        </Link>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset password</h2>
        <p className="text-gray-600 mb-8">Choose a strong new password for your account.</p>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-5">
          {(!tokenFromQuery || message?.type === 'error') && (
            <div className="space-y-2">
              <Label htmlFor="token" className="text-sm font-semibold text-gray-700">Reset Token</Label>
              <Input
                id="token"
                {...register('token')}
                className={`h-12 border-gray-200 focus:border-rocs-green focus:ring-rocs-green rounded-xl ${errors.token ? 'border-red-500' : ''}`}
                placeholder="Paste your token here"
              />
              {errors.token && <p className="text-xs text-red-500">{errors.token.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" name="password" className="text-sm font-semibold text-gray-700">New password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register('newPassword')}
                className={`h-12 border-gray-200 focus:border-rocs-green focus:ring-rocs-green rounded-xl ${errors.newPassword ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-sm font-semibold text-gray-700">Confirm password</Label>
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              {...register('confirmPassword')}
              className={`h-12 border-gray-200 focus:border-rocs-green focus:ring-rocs-green rounded-xl ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-rocs-green hover:bg-rocs-green/90 text-white font-bold rounded-xl shadow-lg shadow-rocs-green/20 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </div>
            ) : 'Update password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
