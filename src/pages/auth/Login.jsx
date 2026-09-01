import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth';
import AuthCard from '../../components/common/AuthCard';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to continue to KoboBuy.">
      {location.state?.justReset && (
        <p className="text-sm text-primary-700 text-center mb-4">
          Password reset successfully — log in with your new password.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs text-neutral-600 text-center mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-xs text-neutral-600">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
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
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2 mt-4">
        <div className="flex-1 h-px bg-neutral-100" />
        <span className="text-[10px] text-neutral-400 uppercase">or</span>
        <div className="flex-1 h-px bg-neutral-100" />
      </div>

      <div className="flex justify-center mt-4">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google sign-in failed. Please try again.')}
        />
      </div>

      <p className="text-sm text-neutral-600 text-center mt-4">
        New here?{' '}
        <Link to="/register" className="text-primary-600 font-medium">
          Create an account
        </Link>
      </p>
      <p className="text-sm text-neutral-600 text-center mt-2">
        Want to sell?{' '}
        <Link
          to="/register-vendor"
          className="bg-accent-50 text-accent-600 text-xs px-2 py-1 rounded-md font-medium"
        >
          Register as a vendor
        </Link>
      </p>
    </AuthCard>
  );
}
