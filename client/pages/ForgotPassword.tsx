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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50/50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="transition-all duration-300">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-500 hover:text-rocs-green mb-6 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot password?</h2>
          <p className="text-gray-600 mb-8">Enter the email used during registration and we'll send a reset link.</p>

          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
              {message.type === 'success' && <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className={`h-12 border-gray-200 focus:border-rocs-green focus:ring-rocs-green rounded-xl ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-rocs-green hover:bg-rocs-green/90 text-white font-bold rounded-xl shadow-lg shadow-rocs-green/20 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </div>
              ) : 'Send reset link'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
