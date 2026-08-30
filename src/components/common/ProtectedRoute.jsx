import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Usage: <ProtectedRoute roles={['vendor']}><VendorDashboard /></ProtectedRoute>
// Omit `roles` to just require any logged-in user.
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return null; // could render a spinner here later

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
