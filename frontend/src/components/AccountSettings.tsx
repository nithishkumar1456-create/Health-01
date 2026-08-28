import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, DoctorReview } from '../types';
import { User as UserIcon, Mail, Phone, ShieldCheck, Sparkles, AlertCircle, Save, CheckCircle, Upload, Camera, Trash2, GraduationCap, Award, Clock, FileText, Star, Stethoscope, MessageSquare } from 'lucide-react';

export default function AccountSettings() {
  const [user, setUser] = useState<User | null>(null);
  
  // 11 Fields
  const [firstName, setFirstName] = useState(''); // 1. First Name
  const [lastName, setLastName] = useState('');   // 2. Last Name
  const [email, setEmail] = useState('');         // 3. Email
  const [phone, setPhone] = useState('');         // 4. Phone No
  const [education, setEducation] = useState(''); // 5. Education (MBBS, MD, etc)
  const [title, setTitle] = useState('');         // 6. Title / Designation
  const [specialization, setSpecialization] = useState(''); // 7. Category / Specialization
  const [clinicTimings, setClinicTimings] = useState('');   // 8. Clinic Opening & Closing Timings
  const [bio, setBio] = useState('');             // 9. Bio
  const [profileDetail, setProfileDetail] = useState('');   // 10. Profile Detail
  const [reviews, setReviews] = useState<DoctorReview[]>([]); // 11. Client Reviews

  const [avatarUrl, setAvatarUrl] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      setAvatarUrl(u.avatar_url || '');

      if (u.role === 'doctor' && u.doctor_profile) {
        setSpecialization(u.doctor_profile.specialization || '');
        setRegistrationNumber(u.doctor_profile.registration_number || '');
        setEducation(u.doctor_profile.education || '');
        setTitle(u.doctor_profile.title || '');
        setClinicTimings(u.doctor_profile.clinic_timings || '');
        setBio(u.doctor_profile.bio || '');
        setProfileDetail(u.doctor_profile.profile_detail || '');
        setReviews(u.doctor_profile.reviews || []);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load user profile information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Selected image file is too large. Please select an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          setSuccessMsg('Local profile picture uploaded! Click "Save Account Updates" below to apply.');
          setTimeout(() => setSuccessMsg(null), 5000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setErrorMsg('Please fill out all required fields (First Name, Last Name, Email).');
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
        avatar_url: avatarUrl || undefined,
        specialization: user?.role === 'doctor' ? specialization : undefined,
        registration_number: user?.role === 'doctor' ? registrationNumber : undefined,
        education: user?.role === 'doctor' ? education : undefined,
        title: user?.role === 'doctor' ? title : undefined,
        clinic_timings: user?.role === 'doctor' ? clinicTimings : undefined,
        bio: user?.role === 'doctor' ? bio : undefined,
        profile_detail: user?.role === 'doctor' ? profileDetail : undefined,
      });
      setUser(updated);
      setSuccessMsg('Profile and doctor details updated successfully!');
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
        <div className="bg-brand-accent/10 border border-brand-accent/20 text-brand-accent-hover rounded-xl p-4 text-xs font-extrabold flex gap-2.5 items-start mb-6 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-brand-accent mt-0.5" />
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
          <div className="flex flex-col gap-5">
            <div className="bg-brand-bg/45 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-brand-light-blue/20">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover shadow-sm border border-brand-light-blue/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-primary text-white font-sans font-extrabold text-sm flex items-center justify-center shadow-sm uppercase shrink-0">
                    {firstName[0] || 'U'}{lastName[0] || ''}
                  </div>
                )}
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
                    <span className="inline-flex items-center gap-1.5 bg-brand-accent/10 text-brand-accent-hover border border-brand-accent/25 px-3 py-1 rounded-full text-[11px] font-extrabold">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
                      Verified Clinician Account
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-[11px] font-extrabold">
                      <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
                      Administrative Review Pending
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar Selection & Local File Upload */}
            <div className="bg-brand-bg/25 border border-brand-light-blue/20 rounded-2xl p-5 flex flex-col gap-4">
              <div>
                <h3 className="font-sans font-extrabold text-xs text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-brand-primary" />
                  Profile Picture Settings
                </h3>
                <p className="font-sans text-[11px] text-brand-secondary mt-0.5">
                  Add or change your profile picture directly from your local computer or phone.
                </p>
              </div>

              {/* Local File Upload Box */}
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative group shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Current avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-brand-primary/30 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-brand-light-blue text-brand-primary font-sans font-black text-xl flex items-center justify-center border-2 border-brand-primary/30">
                      {firstName[0] || 'U'}{lastName[0] || ''}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-grow text-center sm:text-left">
                  <span className="font-sans font-extrabold text-xs text-brand-dark">
                    Upload Photo from Local Storage
                  </span>
                  <p className="font-sans text-[11px] text-brand-muted">
                    Supports JPG, PNG, GIF or WEBP image files from your device.
                  </p>

                  <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap mt-1">
                    <label
                      htmlFor="local-avatar-input"
                      className="bg-brand-primary hover:bg-brand-primary/90 text-white font-sans text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Add Profile Pic from Local File
                    </label>
                    <input
                      id="local-avatar-input"
                      type="file"
                      accept="image/*"
                      onChange={handleLocalImageUpload}
                      className="hidden"
                    />

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="bg-gray-100 hover:bg-gray-200 text-brand-secondary font-sans text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        Remove Picture
                      </button>
                    )}
                  </div>
                </div>
              </div>


            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 1. First Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
              1. First Name *
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

          {/* 2. Last Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
              2. Last Name *
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

          {/* 3. Email */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
              3. Email Address *
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

          {/* 4. Phone No */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
              4. Phone No
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

        {/* Doctor specific professional fields */}
        {user?.role === 'doctor' && (
          <div className="border-t border-gray-100 pt-6 mt-2 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-brand-primary" />
              <h3 className="font-sans font-extrabold text-xs text-brand-primary uppercase tracking-wider">
                Clinician & Practice Details (Fields 5 - 10)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* 5. Education */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-brand-muted" />
                  5. Education (Degrees & Qualifications)
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. MBBS, MD (Cardiology), MS, DNB"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>

              {/* 6. Title */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-brand-muted" />
                  6. Title / Designation
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Specialized Surgeon, Senior Consultant"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>

              {/* 7. Category / Specialization */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-brand-muted" />
                  7. Category / Specialization *
                </label>
                <input
                  type="text"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Cardiology, Dermatology, Pediatrics"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>

              {/* 8. Timing of Opening and Closing Clinic */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-muted" />
                  8. Clinic Opening & Closing Hours
                </label>
                <input
                  type="text"
                  value={clinicTimings}
                  onChange={(e) => setClinicTimings(e.target.value)}
                  placeholder="e.g. 09:00 AM - 01:00 PM, 05:00 PM - 08:00 PM (Mon-Sat)"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>

            </div>

            {/* Registration number */}
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

            {/* 9. Bio */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-brand-muted" />
                9. Bio (Short Intro Summary)
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short bio introduce yourself to potential clients..."
                className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl p-3 font-sans text-xs text-brand-dark outline-none transition-all resize-y"
              />
            </div>

            {/* 10. Profile Detail */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-brand-muted" />
                10. Profile Detail (Clinical Background & Facilities)
              </label>
              <textarea
                rows={4}
                value={profileDetail}
                onChange={(e) => setProfileDetail(e.target.value)}
                placeholder="Detailed clinical experience, procedures offered, hospital equipment, sub-specialty interests..."
                className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl p-3 font-sans text-xs text-brand-dark outline-none transition-all resize-y"
              />
            </div>

            {/* 11. Review Given By the Client */}
            <div className="bg-brand-bg/30 border border-brand-light-blue/30 rounded-2xl p-5 flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-primary" />
                  <h4 className="font-sans font-extrabold text-xs text-brand-dark uppercase tracking-wider">
                    11. Reviews Given by Clients ({reviews.length})
                  </h4>
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>
                      {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} / 5.0
                    </span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="p-4 bg-white rounded-xl border border-gray-100 text-center font-sans text-xs text-brand-muted italic">
                  No client reviews received yet. Reviews submitted by patients will be displayed here automatically.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-sans font-extrabold text-xs text-brand-dark">
                          {rev.clientName}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{rev.rating}.0</span>
                          <span className="text-[10px] text-brand-muted font-normal ml-1">{rev.date}</span>
                        </div>
                      </div>
                      <p className="font-sans text-xs text-brand-secondary italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
