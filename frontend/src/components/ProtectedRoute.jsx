import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from './Login';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const [session, setSession] = useState(undefined);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => {
      setSession(getSession());
      setChecking(false);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
