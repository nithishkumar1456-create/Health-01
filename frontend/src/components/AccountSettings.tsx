import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { User as UserIcon, Mail, Phone, ShieldCheck, Sparkles, AlertCircle, Save, CheckCircle } from 'lucide-react';

export default function AccountSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const u = await api.getCurrentUser();
      setUser(u);
      setFirstName(u.first_name);
      setLastName(u.last_name);
      setEmail(u.email);
      setPhone(u.phone || '');
      if (u.role === 'doctor' && u.doctor_profile) {
        setSpecialization(u.doctor_profile.specialization);
        setRegistrationNumber(u.doctor_profile.registration_number);
      }
    } catch (err: any) {
      setErrorMsg('Failed to fetch profile settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updated = await api.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || undefined,
        specialization: user?.role === 'doctor' ? specialization : undefined,
        registration_number: user?.role === 'doctor' ? registrationNumber : undefined
      });
      setUser(updated);
      setSuccessMsg('Account details updated successfully! Please reload or navigate around to see updates applied.');
      // Dismiss success msg after 5s
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update account settings.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-sans text-xs text-brand-secondary font-semibold">Retrieving your profile settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-level-2 p-6 md:p-8">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-gray-50 pb-5 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-light-blue text-brand-primary flex items-center justify-center">
          <UserIcon className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="font-sans text-lg font-extrabold text-brand-dark tracking-tight">
            Account Credentials & Settings
          </h2>
          <p className="font-sans text-xs text-brand-secondary mt-0.5">
            Modify your personal demographics, communication lines, and verified clinician parameters.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-teal-50 border border-teal-200 text-teal-850 rounded-xl p-4 text-xs font-semibold flex gap-2.5 items-start mb-6 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-teal-600 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs font-semibold flex gap-2.5 items-start mb-6 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Profile Card Summary */}
        {user && (
          <div className="bg-brand-bg/45 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-brand-light-blue/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-primary text-white font-sans font-extrabold text-sm flex items-center justify-center shadow-sm uppercase">
                {firstName[0] || 'U'}{lastName[0] || ''}
              </div>
              <div className="text-center sm:text-left">
                <p className="font-sans text-sm font-extrabold text-brand-dark">
                  {firstName} {lastName}
                </p>
                <span className="inline-flex text-[10px] bg-white border border-gray-150 px-2 py-0.5 rounded-md font-bold text-brand-muted uppercase tracking-wider mt-1">
                  Role: {user.role}
                </span>
              </div>
            </div>

            {user.role === 'doctor' && (
              <div className="text-center sm:text-right">
                {user.doctor_profile?.is_verified ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Clinician Account
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-[11px] font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Administrative Review Pending
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* First Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
              First Name *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 pl-10 pr-4 font-sans text-sm text-brand-dark outline-none transition-all"
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
              Last Name *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 pl-10 pr-4 font-sans text-sm text-brand-dark outline-none transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 pl-10 pr-4 font-sans text-sm text-brand-dark outline-none transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 99999 99999"
                className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 pl-10 pr-4 font-sans text-sm text-brand-dark outline-none transition-all"
              />
            </div>
          </div>

        </div>

        {/* Doctor specific fields */}
        {user?.role === 'doctor' && (
          <div className="border-t border-gray-100 pt-6 mt-2 flex flex-col gap-5">
            <h3 className="font-sans font-extrabold text-xs text-brand-primary uppercase tracking-wider">
              Professional Clinician Licenses
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Specialization */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                  Specialization *
                </label>
                <input
                  type="text"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Cardiology, Dermatology"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>

              {/* Registration Number */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                  Medical Council Registration ID *
                </label>
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. REG-10294-M"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark font-mono outline-none transition-all"
                />
              </div>

            </div>
          </div>
        )}

        {/* Submit */}
        <div className="border-t border-gray-100 pt-5 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-primary hover:bg-brand-primary/95 text-white font-sans text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving Credentials...' : 'Save Account Updates'}
          </button>
        </div>

      </form>

    </div>
  );
}
