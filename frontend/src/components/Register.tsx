import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Activity, ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';
export default function Register() {
  const [role, setRole] = useState<'client' | 'doctor'>('client');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('Cardiology');
  const [regNumber, setRegNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username || !email || !password || !firstName || !lastName) {
      setError('Please complete all mandatory fields.');
      return;
    }

    if (role === 'doctor' && !regNumber) {
      setError('Please provide your medical council registration number.');
      return;
    }

    setLoading(true);

    try {
      await api.register({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        specialization: role === 'doctor' ? specialization : undefined,
        registration_number: role === 'doctor' ? regNumber : undefined
      });

      setSuccess('Account created successfully! Redirecting to login portal...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different username/email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-level-3 border border-gray-100 p-8 flex flex-col gap-5">
          
          <div className="flex items-center gap-2">
            <Link to="/login" className="p-1.5 rounded-lg hover:bg-brand-bg text-brand-secondary cursor-pointer transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="font-sans text-xs text-brand-muted font-semibold uppercase tracking-wider">Back to Login</span>
          </div>

          <div className="text-center md:text-left">
            <h1 className="font-sans text-2xl font-extrabold text-brand-dark tracking-tight">
              Create Your Account
            </h1>
            <p className="font-sans text-sm text-brand-secondary mt-1">
              Select your role below to begin registration.
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 bg-brand-bg p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setRole('client'); setError(null); }}
              className={`py-2.5 rounded-lg font-sans font-bold text-xs transition-all cursor-pointer ${
                role === 'client' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-secondary hover:text-brand-dark'
              }`}
            >
              🙋‍♂️ Client / Patient
            </button>
            <button
              type="button"
              onClick={() => { setRole('doctor'); setError(null); }}
              className={`py-2.5 rounded-lg font-sans font-bold text-xs transition-all cursor-pointer ${
                role === 'doctor' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-secondary hover:text-brand-dark'
              }`}
            >
              🩺 Doctor / Healthcare Specialist
            </button>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex gap-2 items-start">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex gap-2 items-start">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Common Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Rahul"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sharma"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="rahul_sharma"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 99999 11111"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
              />
            </div>

            {/* Doctor-Only Fields */}
            {role === 'doctor' && (
              <div className="bg-brand-light-blue/20 p-4 rounded-2xl flex flex-col gap-3.5 border border-brand-light-blue/40">
                <p className="font-sans font-bold text-xs text-brand-primary flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-brand-primary" />
                  Medical Credentials Verification
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                    Specialization
                  </label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-white border border-brand-light-blue focus:border-brand-primary rounded-xl py-2.5 px-3 font-sans text-sm text-brand-dark outline-none"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                    Medical Council Registration Number *
                  </label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder="e.g. REG-12345-DL"
                    className="w-full bg-white border border-brand-light-blue focus:border-brand-primary rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none"
                  />
                  <span className="font-sans text-[10px] text-brand-muted">
                    This registration number will be reviewed by platform system administrators.
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white py-3.5 rounded-xl font-sans font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating Credentials...' : 'Complete Registration'}
            </button>
          </form>

        </div>
      </div>

      <div className="py-4 text-center text-[11px] text-brand-muted border-t border-gray-100/30">
        HEALTH-02 Clinical Infrastructure • Secure JWT Standard
      </div>
    </div>
  );
}
