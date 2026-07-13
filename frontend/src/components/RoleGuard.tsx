import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, decodeJWT } from '../services/api';
import { User } from '../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('client' | 'doctor' | 'admin')[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        // Clear tokens if auth check fails
        api.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-sans font-semibold text-brand-secondary text-sm">Verifying Session Security...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> go to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but unauthorized role -> redirect to their correct portal
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'client') {
      return <Navigate to="/client" replace />;
    } else if (user.role === 'doctor') {
      return <Navigate to="/doctor" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  // All checks pass
  return <>{children}</>;
}
