import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg text-white">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <span className="text-dark-muted text-sm font-semibold">Verifying secure credentials...</span>
      </div>
    );
  }

  // User is not authenticated
  if (!user) {
    // If attempting to access an admin page, route back to admin login
    if (adminOnly) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Admin access check
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
