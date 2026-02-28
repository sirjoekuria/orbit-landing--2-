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
              <Lock className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Forgot password?</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">Enter the email used during registration and we'll send a reset link.</p>
          </div>

          {message && (
            <div className={`mb-8 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success'
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-destructive/10 text-destructive border border-destructive/20'
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
              <Label htmlFor="email" className="text-foreground/80 text-xs font-medium uppercase tracking-wider ml-1">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className={`h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-secondary focus:ring-1 focus:ring-secondary rounded-2xl transition-all ${errors.email ? 'border-destructive/50' : ''
                  }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400 ml-1">{errors.email.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-secondary to-rocs-green-dark hover:brightness-110 text-secondary-foreground font-bold text-lg rounded-2xl shadow-lg transition-all active:scale-[0.98]"
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
