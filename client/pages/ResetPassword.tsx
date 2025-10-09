import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromQuery = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (tokenFromQuery) setToken(tokenFromQuery);
  }, [tokenFromQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!token) return setMessage('Missing token');
    if (password.length < 6) return setMessage('Password must be at least 6 characters');
    if (password !== confirm) return setMessage('Passwords do not match');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password updated successfully. You can now log in.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setMessage(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setMessage('Failed to reset password. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-rocs-green mb-2">Reset password</h2>
        <p className="text-sm text-gray-600 mb-4">Set a new password for your account.</p>

        {message && <div className="mb-4 text-sm text-gray-700">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="token">Token</Label>
            <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1" />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-rocs-green">
            {loading ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
