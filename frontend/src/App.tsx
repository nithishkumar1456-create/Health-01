import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import RoleGuard from './components/RoleGuard';
import ClientDashboard from './components/ClientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import { useEffect, useState } from 'react';
import { api, decodeJWT, STORAGE_KEYS } from './services/api';

function HomeRedirect() {
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState('/login');

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
          const decoded = decodeJWT(token);
          if (decoded) {
            if (decoded.role === 'admin') setTarget('/admin');
            else if (decoded.role === 'doctor') setTarget('/doctor');
            else setTarget('/client');
          }
        }
      } catch (e) {
        setTarget('/login');
      } finally {
        setLoading(false);
      }
    };
    checkRedirect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Client protected portal */}
        <Route
          path="/client"
          element={
            <RoleGuard allowedRoles={['client']}>
              <ClientDashboard />
            </RoleGuard>
          }
        />

        {/* Doctor protected portal */}
        <Route
          path="/doctor"
          element={
            <RoleGuard allowedRoles={['doctor']}>
              <DoctorDashboard />
            </RoleGuard>
          }
        />

        {/* Admin protected portal */}
        <Route
          path="/admin"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleGuard>
          }
        />

        {/* Root Fallback */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
