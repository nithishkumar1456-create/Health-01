import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, decodeJWT } from '../services/api';
import { Activity, Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { access } = await api.login(username, password);
      const decoded = decodeJWT(access);

      if (decoded) {
        if (decoded.role === 'admin') {
          navigate('/admin');
        } else if (decoded.role === 'doctor') {
          navigate('/doctor');
        } else {
          navigate('/client');
        }
      } else {
        setError('Failed to authenticate token role claims.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      {/* Main Login Frame */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-level-3 border border-gray-100 p-8 flex flex-col gap-6">
          
          {/* Brand Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-light-blue text-brand-primary mb-3">
              <Activity className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="font-sans text-2xl font-extrabold text-brand-dark tracking-tight">
              HEALTH-02 Portal
            </h1>
            <p className="font-sans text-sm text-brand-secondary mt-1">
              Verify your credentials to manage clinical and directory logs.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex gap-2 items-start">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. client@health02.com"
                  className="w-full bg-brand-bg border border-transparent hover:border-brand-light-blue focus:border-brand-primary focus:bg-white rounded-xl py-3 pl-11 pr-4 font-sans text-sm text-brand-dark transition-all outline-none"
                  id="login-username-input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-brand-bg border border-transparent hover:border-brand-light-blue focus:border-brand-primary focus:bg-white rounded-xl py-3 pl-11 pr-4 font-sans text-sm text-brand-dark transition-all outline-none"
                  id="login-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white py-3.5 rounded-xl font-sans font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              id="login-submit-btn"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Fill Assistant */}
          <div className="border-t border-gray-100 pt-5">
            <p className="font-sans font-bold text-[10px] text-brand-muted uppercase tracking-wider text-center mb-3">
              Quick Role-Testing Panel
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('client_1', 'clientpass')}
                className="bg-brand-bg hover:bg-brand-light-blue/50 text-brand-secondary text-xs font-semibold py-2 px-3 rounded-lg text-left truncate cursor-pointer transition-colors"
              >
                🙋‍♂️ Client Portal
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('dr_verified', 'docpass')}
                className="bg-brand-bg hover:bg-brand-light-blue/50 text-brand-secondary text-xs font-semibold py-2 px-3 rounded-lg text-left truncate cursor-pointer transition-colors"
              >
                🩺 Verified Doctor
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('dr_unverified', 'docpass')}
                className="bg-brand-bg hover:bg-brand-light-blue/50 text-brand-secondary text-xs font-semibold py-2 px-3 rounded-lg text-left truncate cursor-pointer transition-colors"
              >
                ⚠️ Pending Doctor
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'adminpass')}
                className="bg-brand-bg hover:bg-brand-light-blue/50 text-brand-secondary text-xs font-semibold py-2 px-3 rounded-lg text-left truncate cursor-pointer transition-colors"
              >
                🛡️ System Admin
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="text-center pt-2 border-t border-gray-100/50">
            <span className="font-sans text-xs text-brand-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-primary font-bold hover:underline">
                Create Account
              </Link>
            </span>
          </div>

        </div>
      </div>

      {/* Humble Footer */}
      <div className="py-4 text-center text-[11px] text-brand-muted border-t border-gray-100/30">
        HEALTH-02 Clinical Infrastructure • Secure JWT Standard
      </div>
    </div>
  );
}
