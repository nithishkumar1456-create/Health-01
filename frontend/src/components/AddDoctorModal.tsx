import React, { useState } from 'react';
import { api } from '../services/api';
import { X, UserPlus, Stethoscope, ShieldCheck, Award, Building, DollarSign, FileText, CheckCircle2, Clock } from 'lucide-react';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDoctorAdded: () => void;
}

export default function AddDoctorModal({ isOpen, onClose, onDoctorAdded }: AddDoctorModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [medicalCouncil, setMedicalCouncil] = useState('Delhi Medical Council');
  const [qualifications, setQualifications] = useState('MBBS, MD');
  const [clinicName, setClinicName] = useState('');
  const [consultationFee, setConsultationFee] = useState('800');
  const [isVerified, setIsVerified] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !registrationNumber) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rawUser = username.trim() || `${firstName}_${lastName}_${Math.floor(Math.random() * 1000)}`;
      const generatedUsername = rawUser.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');

      await api.adminCreateUser({
        username: generatedUsername,
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
        role: 'doctor',
        specialization,
        registration_number: registrationNumber,
        medical_council: medicalCouncil,
        qualifications,
        clinic_name: clinicName || `${lastName} Medical Clinic`,
        consultation_fee: consultationFee ? `₹${consultationFee}` : '₹800',
        is_verified: isVerified
      });

      // Reset form
      setFirstName('');
      setLastName('');
      setUsername('');
      setEmail('');
      setPhone('');
      setSpecialization('General Medicine');
      setRegistrationNumber('');
      setMedicalCouncil('Delhi Medical Council');
      setQualifications('MBBS, MD');
      setClinicName('');
      setConsultationFee('800');
      setIsVerified(true);

      onDoctorAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add doctor to the master roster.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0f2847] px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center border border-white/10 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-black text-lg text-white tracking-tight">
                Add Doctor Account & Master Roster Listing
              </h3>
              <p className="font-sans text-xs text-slate-300 font-medium">
                Provision practitioner credentials, state medical council licenses, and status.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
            <X className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Scroll Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow flex flex-col gap-5">
          
          {/* Practitioner Personal Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserPlus className="w-4 h-4 text-[#0f2847]" />
              <span className="font-sans font-black text-xs text-slate-800 uppercase tracking-wider">
                Practitioner Personal Info
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-sans font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Rohan"
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0f2847] rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-sans font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Mehra"
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0f2847] rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 sm:col-span-1">
                <label className="font-sans font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="rohan_mehra (optional)"
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0f2847] rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-1">
                <label className="font-sans font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohan.mehra@health02.com"
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0f2847] rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-1">
                <label className="font-sans font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 99999 88888"
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0f2847] rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Medical Credentials & Specialty */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Award className="w-4 h-4 text-[#0f2847]" />
              <span className="font-sans font-black text-xs text-slate-800 uppercase tracking-wider">
                Medical Specialty & Council Registration
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-sans font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  Specialization *
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0f2847] rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="ENT">ENT</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-sans font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="REG-77123-DL"
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0f2847] rounded-xl py-2.5 px-3.5 text-xs font-bold font-mono text-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-sans font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  State Medical Council
                </label>
                <input
                  type="text"
                  value={medicalCouncil}
                  onChange={(e) => setMedicalCouncil(e.target.value)}
                  placeholder="Delhi Medical Council"
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0f2847] rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-sans font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  Qualifications
                </label>
                <input
                  type="text"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="MBBS, MD, DM (Neurology)"
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0f2847] rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Practice & Clinic Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-[#0f2847]" />
              <span className="font-sans font-black text-xs text-slate-800 uppercase tracking-wider">
                Clinic / Hospital & Fee Setup
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-sans font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  Clinic / Hospital Name
                </label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="e.g. Medicity Neurology Center"
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0f2847] rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-sans font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  placeholder="800"
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0f2847] rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Verification Status Toggle */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {isVerified ? <ShieldCheck className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-sans font-black text-xs text-slate-900">
                  {isVerified ? 'Grant Verified Clinician Badge Immediately' : 'Set as Pending Verification Review'}
                </p>
                <p className="font-sans text-[11px] text-slate-500">
                  {isVerified
                    ? 'Doctor will be active with verified status in master roster & support desk.'
                    : 'Doctor account will appear in the verification review queue for credential check.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsVerified(!isVerified)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isVerified ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isVerified ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-sans font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0f2847] hover:bg-[#163a66] text-white font-sans font-black text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Onboarding Doctor...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Onboard Doctor</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
