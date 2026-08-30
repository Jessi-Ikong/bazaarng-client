import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import AuthCard from '../../components/common/AuthCard';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      // Always show the same success state whether or not the email is
      // registered — the backend deliberately never reveals that, so the
      // frontend shouldn't undo that by branching on the response.
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Reset your password" subtitle="Enter your email and we'll send you a reset link.">
      {submitted ? (
        <div className="text-center">
          <p className="text-sm text-primary-700 mb-4">
            If an account exists for that email, a reset link has been sent. Check your inbox.
          </p>
          <Link to="/login" className="text-sm text-primary-600 font-medium">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs text-neutral-600 text-center mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>

          <p className="text-sm text-neutral-600 text-center mt-2">
            <Link to="/login" className="text-primary-600 font-medium">Back to login</Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
