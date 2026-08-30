import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import AuthCard from '../../components/common/AuthCard';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      navigate('/login', { state: { justReset: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-xs text-neutral-600 text-center mb-1">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs text-neutral-600 text-center mb-1">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <div className="flex justify-center pt-1">
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-6 rounded-lg bg-primary-900 text-white text-sm font-medium whitespace-nowrap hover:bg-primary-800 disabled:opacity-60 transition"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </div>

        <p className="text-sm text-neutral-600 text-center mt-2">
          <Link to="/login" className="text-primary-600 font-medium">Back to login</Link>
        </p>
      </form>
    </AuthCard>
  );
}
