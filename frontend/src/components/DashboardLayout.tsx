import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { User } from '../types';
import { Activity, LogOut, Shield, User as UserIcon, BookOpen, AlertTriangle } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { id: string; label: string; icon: React.ReactNode }[];
}

export default function DashboardLayout({ children, activeTab, setActiveTab, tabs }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        api.logout();
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const getRoleBadge = (role?: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
          <Shield className="w-3.5 h-3.5" />
          ADMIN
        </span>
      );
    }
    if (role === 'doctor') {
      const isVerified = user?.doctor_profile?.is_verified;
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
            🩺 DOCTOR
          </span>
          {isVerified ? (
            <span className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
              ✓ VERIFIED
            </span>
          ) : (
            <span className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> PENDING
            </span>
          )}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-brand-light-blue text-brand-primary border border-brand-light-blue/50 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
        🙋 Client
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Universal Sticky App Bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 bg-opacity-95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <button
            id="logo-button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-85 active:scale-98 transition-all cursor-pointer border-none bg-transparent p-0 outline-none text-left"
            title="Redirect to Dashboard Home"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-light-blue text-brand-primary flex items-center justify-center">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-sm font-extrabold text-brand-primary tracking-tight leading-none">
                HEALTH-02
              </span>
              <span className="font-sans text-[10px] text-brand-secondary tracking-wider font-semibold uppercase">
                Clinical Hub
              </span>
            </div>
          </button>

          {/* User Controls & Desktop Navigation */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="font-sans text-sm font-bold text-brand-dark">
                  {user.first_name} {user.last_name}
                </span>
                <div className="mt-0.5">
                  {getRoleBadge(user.role)}
                </div>
              </div>

              <div className="w-px h-8 bg-gray-100 hidden md:block"></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-brand-secondary hover:text-red-700 hover:bg-red-50 font-sans text-sm font-semibold cursor-pointer transition-colors"
                title="Sign Out of Session"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Primary Dashboard Container */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Dynamic Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-level-2 border border-gray-100 flex flex-col gap-1.5">
            <p className="font-sans font-bold text-[10px] text-brand-muted uppercase tracking-wider px-3 mb-2">
              Navigation Menu
            </p>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-sans text-sm font-bold text-left transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-brand-secondary hover:bg-brand-bg hover:text-brand-dark'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Profile Card */}
          {user && (
            <div className="bg-white rounded-2xl p-4 shadow-level-2 border border-gray-100 md:hidden flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-light-blue text-brand-primary flex items-center justify-center font-bold">
                  {user.first_name[0]}{user.last_name[0]}
                </div>
                <div>
                  <p className="font-sans font-bold text-sm text-brand-dark">
                    {user.first_name} {user.last_name}
                  </p>
                  <div className="mt-0.5">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Workspace Area */}
        <main className="flex-grow flex flex-col gap-6">
          {children}
        </main>

      </div>
    </div>
  );
}
