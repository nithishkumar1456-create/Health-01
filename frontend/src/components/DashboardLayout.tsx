import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { User } from '../types';
import LogoIcon from './LogoIcon';
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
    if (role === 'support') {
      return (
        <span className="inline-flex items-center bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
          SUPPORT
        </span>
      );
    }
    if (role === 'doctor') {
      const isVerified = user?.doctor_profile?.is_verified;
      return (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center bg-brand-accent/10 text-brand-accent-hover border border-brand-accent/25 px-2.5 py-0.5 rounded-full text-xs font-extrabold font-mono">
            DOCTOR
          </span>
          {isVerified ? (
            <span className="inline-flex items-center bg-brand-accent/15 text-brand-accent-hover border border-brand-accent/30 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
              VERIFIED
            </span>
          ) : (
            <span className="inline-flex items-center bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> PENDING
            </span>
          )}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center bg-brand-light-blue text-brand-primary border border-brand-light-blue/50 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
        Patient
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Universal Sticky App Bar */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 bg-opacity-95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <button
            id="logo-button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 hover:opacity-85 active:scale-98 transition-all cursor-pointer border-none bg-transparent p-0 outline-none text-left group"
            title="Redirect to Dashboard Home"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white transition-all group-hover:scale-105 group-hover:rotate-12 duration-500">
              <LogoIcon className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-base font-black text-brand-dark tracking-tight leading-none">
                MediQ
              </span>
            </div>
          </button>

          {/* User Controls */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover shadow-sm border border-brand-light-blue/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-light-blue text-brand-primary flex items-center justify-center font-extrabold text-xs shrink-0">
                    {user.first_name[0]}{user.last_name[0]}
                  </div>
                )}
                <div className="hidden md:flex flex-col items-start">
                  <span className="font-sans text-xs font-extrabold text-brand-dark leading-none">
                    {user.first_name} {user.last_name}
                  </span>
                  <div className="mt-1">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-100 hidden md:block"></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-brand-secondary hover:text-red-700 hover:bg-red-50 font-sans text-xs font-bold cursor-pointer transition-colors"
                title="Sign Out of Session"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Top Navigation Row - Mimicking Practo style horizontal navigation menu */}
      <div className="bg-white border-b border-gray-150 shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 w-full sm:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-xs font-extrabold tracking-tight transition-all cursor-pointer whitespace-nowrap border-none outline-none shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10'
                    : 'text-brand-secondary bg-transparent hover:bg-brand-bg hover:text-brand-dark'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {user && (
              <span className="text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">
                Console: {user.role} View
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Dashboard Container */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Workspace Area - Takes Full Width now that navigation is top-mounted! */}
        <main className="w-full flex flex-col gap-6">
          {children}
        </main>
      </div>
    </div>
  );
}
