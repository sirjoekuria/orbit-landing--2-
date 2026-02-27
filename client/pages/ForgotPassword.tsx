import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '../../shared/validation';
import { z } from 'zod';

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
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

      if (res.ok) {
        setMessage({
          text: result.message || 'If the email exists, a reset link has been sent.',
          type: 'success'
        });
      } else {
        setMessage({
          text: result.error || 'Something went wrong. Please try again.',
          type: 'error'
        });
      }
    } catch (err) {
      setMessage({
        text: 'Failed to send reset link. Try again later.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a110d] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rocs-green/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#eab308]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-[#112417] rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 p-10 backdrop-blur-sm">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-[#8b9d93] hover:text-[#eab308] mb-8 group transition-colors font-medium font-outfit"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>

          <div className="mb-8">
            <div className="w-16 h-16 bg-[#eab308]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#eab308]/20">
              <Lock className="w-8 h-8 text-[#eab308]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Forgot password?</h2>
            <p className="text-[#8b9d93] text-sm leading-relaxed">Enter the email used during registration and we'll send a reset link.</p>
          </div>

          {message && (
            <div className={`mb-8 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success'
                ? 'bg-rocs-green/10 text-rocs-green border border-rocs-green/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              ) : (
                <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">!</div>
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-white/80 text-xs font-medium uppercase tracking-wider ml-1">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className={`h-14 bg-[#0a110d]/50 border-white/10 text-white placeholder:text-white/20 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] rounded-2xl transition-all ${errors.email ? 'border-red-500/50' : ''
                  }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400 ml-1">{errors.email.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Processing...
                </div>
              ) : 'Send Reset Link'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
