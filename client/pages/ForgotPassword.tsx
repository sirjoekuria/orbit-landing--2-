import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-rocs-green mb-2">Forgot password</h2>
        <p className="text-sm text-gray-600 mb-6">Enter the email used during registration and we'll send a reset link.</p>
        {message && <div className="mb-4 text-sm text-gray-700">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-rocs-green">
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      </div>
    </div>
  );
}
