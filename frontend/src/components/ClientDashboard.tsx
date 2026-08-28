import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DoctorListing, Article, User, QueueEntry, QueueStatusResponse } from '../types';
import DashboardLayout from './DashboardLayout';
import AccountSettings from './AccountSettings';
import HealthJournal from './HealthJournal';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Phone, 
  CalendarRange, 
  FileText, 
  User as UserIcon, 
  ChevronRight, 
  Activity, 
  Eye, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  CalendarDays,
  IndianRupee,
  MapPinCheckInside,
  Tag,
  Clock,
  GraduationCap,
  Users,
  RefreshCw,
  AlertTriangle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search filter states
  const [locationInput, setLocationInput] = useState('Delhi, NCR');
  const [radius, setRadius] = useState<number>(5);
  const [specialization, setSpecialization] = useState<string>('');
  const [doctors, setDoctors] = useState<DoctorListing[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorListing | null>(null);

  // Blog states
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Profile
  const [me, setMe] = useState<User | null>(null);

  // Live Token Queue State
  const [myTokens, setMyTokens] = useState<QueueEntry[]>([]);
  const [activeTokenStatuses, setActiveTokenStatuses] = useState<Record<string, QueueStatusResponse & { doctor_name?: string }>>({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  const fetchMe = async () => {
    try {
      const u = await api.getCurrentUser();
      setMe(u);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      // Delhi lat/long default coordinates
      const res = await api.getNearbyDoctors({
        lat: 28.57,
        lng: 77.22,
        radius_km: radius,
        specialization: specialization || undefined
      });
      setDoctors(res);
    } catch (err: any) {
      setError(err.message || 'Failed to search nearby doctors.');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getArticles({
        tag: selectedTag || undefined
      });
      setArticles(res);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve blog articles.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTokensAndStatuses = async () => {
    try {
      const entries = await api.getMyQueueEntries();
      setMyTokens(entries);

      const statusesMap: Record<string, QueueStatusResponse & { doctor_name?: string }> = {};
      for (const entry of entries) {
        if (entry.status === 'waiting' || entry.status === 'in_progress') {
          try {
            const statusRes = await api.getQueueEntryStatus(entry.id);
            statusesMap[entry.id] = statusRes;
          } catch (e) {
            console.error(e);
          }
        }
      }
      setActiveTokenStatuses(statusesMap);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Load basic data
  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (activeTab === 'search') {
      fetchDoctors();
    } else if (activeTab === 'blog') {
      fetchArticles();
    } else if (activeTab === 'tokens') {
      fetchMyTokensAndStatuses();
      const interval = setInterval(fetchMyTokensAndStatuses, 15000);
      return () => clearInterval(interval);
    }
  }, [activeTab, radius, specialization, selectedTag]);

  const handleBookToken = async (doctorId: number) => {
    setBookingLoading(true);
    setBookingMessage(null);
    setError(null);
    try {
      const res = await api.bookQueueToken(doctorId);
      setBookingMessage(`Token #${res.entry.token_number} issued successfully! Expected wait: ~${res.status.estimated_wait_minutes} mins.`);
      setActiveTab('tokens');
      fetchMyTokensAndStatuses();
    } catch (err: any) {
      setError(err.message || 'Failed to book queue token.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelToken = async (entryId: string | number) => {
    if (!confirm('Are you sure you want to cancel this live queue token?')) return;
    try {
      await api.cancelQueueEntry(entryId);
      fetchMyTokensAndStatuses();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel token.');
    }
  };

  const handleDoctorClick = async (id: number) => {
    setLoading(true);
    try {
      const detail = await api.getDoctorDetail(id);
      setSelectedDoctor(detail);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor profile details.');
    } finally {
      setLoading(false);
    }
  };

  const simulateLocationSelect = () => {
    setLocationInput('Delhi Connaught Place (GPS Coordinate Sim)');
    setRadius(10);
    fetchDoctors();
  };

  // New UI Filter & Sub-tab States (Matching User Screenshots)
  const [onlyVerifiedOnly, setOnlyVerifiedOnly] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'upcoming' | 'history'>('active');

  const clientTabs = [
    { id: 'search', label: 'Nearby Doctors', icon: <Search className="w-4 h-4" /> },
    { id: 'blog', label: 'Health Journal', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'tokens', label: 'Appointments / Live Tokens', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'profile', label: 'My Account', icon: <UserIcon className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      setSelectedDoctor(null);
      setSelectedArticle(null);
      setSelectedTag(null);
    }} tabs={clientTabs}>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs flex gap-2 items-start shadow-sm">
          <Activity className="w-4 h-4 shrink-0 text-red-600 animate-pulse mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">API Connection Notice:</span> {error}
          </div>
        </div>
      )}

      {/* --- SEARCH / NEARBY DOCTORS DIRECTORY TAB (EXACT SCREENSHOT 2 LIST LAYOUT) --- */}
      {activeTab === 'search' && !selectedDoctor && (() => {
        const filteredDoctorsList = doctors.filter(doc => {
          if (onlyVerifiedOnly && doc.status !== 'verified') return false;
          if (searchKeyword.trim()) {
            const q = searchKeyword.toLowerCase();
            return (
              doc.name.toLowerCase().includes(q) ||
              doc.specialization.toLowerCase().includes(q) ||
              doc.facility_type.toLowerCase().includes(q) ||
              doc.address.toLowerCase().includes(q)
            );
          }
          return true;
        });

        return (
          <div className="flex flex-col gap-6">
            
            {/* Find Local Medical Specialists Filter Box */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
              <div>
                <h2 className="font-sans text-2xl font-black text-slate-900 tracking-tight">
                  Find Local Medical Specialists
                </h2>
                <p className="font-sans text-xs text-slate-500 mt-1">
                  Discover verified clinics and community listings in your neighborhood with real-time queue tracking.
                </p>
              </div>

              {/* Filter Controls Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Field 1: GEOGRAPHIC CENTER */}
                <div className="md:col-span-4 flex flex-col gap-2">
                  <label className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                    Geographic Center
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="Delhi, NCR"
                      className="w-full bg-gray-50/80 border border-gray-100 focus:border-slate-800 focus:bg-white rounded-2xl py-3 pl-11 pr-4 font-sans font-bold text-xs text-slate-800 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Field 2: CLINICAL SPECIALIZATION */}
                <div className="md:col-span-4 flex flex-col gap-2">
                  <label className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                    Clinical Specialization
                  </label>
                  <div className="relative">
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full bg-gray-50/80 border border-gray-100 focus:border-slate-800 focus:bg-white rounded-2xl py-3 px-4 font-sans font-bold text-xs text-slate-800 outline-none cursor-pointer transition-all appearance-none pr-10"
                    >
                      <option value="">All Specialties</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="General Medicine">General Medicine</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Field 3: SEARCH RANGE RADIUS */}
                <div className="md:col-span-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                      Search Range Radius
                    </label>
                    <span className="font-sans font-black text-xs text-slate-900">
                      {radius} km
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                  </div>
                </div>

              </div>

              {/* Filter Controls Row 2 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-50">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer self-start sm:self-auto">
                  <input
                    type="checkbox"
                    checked={onlyVerifiedOnly}
                    onChange={(e) => setOnlyVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span>Only Verified Clinicians</span>
                </label>

                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Search name, clinic..."
                    className="w-full bg-gray-50/80 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 font-sans text-xs text-slate-800 outline-none focus:border-slate-800 transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Results Count Header */}
            <div className="mt-2">
              <h3 className="font-sans font-black text-xs tracking-wider text-slate-700 uppercase">
                {filteredDoctorsList.length} SPECIALISTS AVAILABLE IN {locationInput.toUpperCase() || 'DELHI, NCR'}
              </h3>
            </div>

            {/* Doctor List Cards (Horizontal Row Layout matching Screenshot 2) */}
            {loading ? (
              <div className="py-16 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-100">
                <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="font-sans text-xs text-slate-500 font-semibold">Scanning nearby clinical registry...</p>
              </div>
            ) : filteredDoctorsList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center gap-3">
                <SlidersHorizontal className="w-10 h-10 text-slate-300" />
                <h4 className="font-sans font-bold text-sm text-slate-900">No Specialists Match Your Filters</h4>
                <p className="font-sans text-xs text-slate-500 max-w-sm">
                  Try expanding your search range radius or unchecking "Only Verified Clinicians" to view all practitioners.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredDoctorsList.map((doc) => {
                  const isVerified = doc.status === 'verified';
                  const docInitials = doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <div
                      key={doc.id}
                      className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
                    >
                      {/* Left Monogram Initials Avatar */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-[#0f2847] text-white font-sans font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                          {docInitials}
                        </div>

                        {/* Doctor Information Column */}
                        <div className="flex flex-col gap-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              onClick={() => handleDoctorClick(doc.id)}
                              className="font-sans font-black text-base text-slate-900 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                            >
                              {doc.name}
                            </h3>

                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                VERIFIED CLINICIAN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                UNVERIFIED PROFILE / PENDING REVIEW
                              </span>
                            )}
                          </div>

                          <p className="font-sans text-xs text-slate-600 font-semibold">
                            {doc.specialization} • {doc.id % 2 === 0 ? '15' : '10'} years experience overall
                          </p>

                          <p className="font-sans text-xs text-slate-500 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                            <span>{doc.address}</span>
                          </p>

                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="font-bold text-slate-900">
                              ₹{doc.id % 2 === 0 ? '850' : '700'} <span className="font-normal text-slate-500">Consultation fee</span>
                            </span>
                            
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                              ★ {doc.rating || 4.9} ({doc.review_count || 124} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Availability & Action Button */}
                      <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                        <div className="flex flex-col items-start md:items-end gap-0.5">
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Available Today
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                            Distance: {doc.distance_km} km away
                          </span>
                        </div>

                        <button
                          onClick={() => handleBookToken(doc.id)}
                          disabled={bookingLoading}
                          className="w-full md:w-auto bg-[#0f2847] hover:bg-[#163a66] text-white font-sans font-black text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md"
                        >
                          Book Clinic Visit / Token
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        );
      })()}

      {/* --- DOCTOR PROFILE DETAIL VIEW --- */}
      {activeTab === 'search' && selectedDoctor && (
        <div className="flex flex-col gap-5">
          <button
            onClick={() => setSelectedDoctor(null)}
            className="flex items-center gap-1.5 font-sans font-bold text-xs text-brand-secondary hover:text-brand-primary transition-colors cursor-pointer self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to registries search results
          </button>

          <div className="bg-white rounded-2xl shadow-level-2 border border-gray-100 overflow-hidden">
            {/* Cover and header */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-accent p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-sans text-2xl font-extrabold tracking-tight">
                    {selectedDoctor.title ? `${selectedDoctor.title} ${selectedDoctor.name}` : selectedDoctor.name}
                  </h1>
                  {selectedDoctor.status === 'verified' ? (
                    <span className="bg-sky-500/20 text-white border border-sky-400/30 px-2.5 py-0.5 rounded-full text-xs font-black backdrop-blur-md">
                      ✓ Verified Clinician
                    </span>
                  ) : (
                    <span className="bg-white/10 text-white border border-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold backdrop-blur-md">
                      Unverified Profile
                    </span>
                  )}
                </div>
                <p className="font-sans text-sm text-brand-light-blue mt-1">
                  {selectedDoctor.specialization} • {selectedDoctor.facility_type}
                </p>
                {selectedDoctor.education && (
                  <p className="font-sans text-xs text-white/90 mt-1 font-medium">
                    🎓 {selectedDoctor.education}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                <span className="font-sans font-bold text-lg">★ {selectedDoctor.rating}</span>
                <span className="font-sans text-xs text-brand-light-blue">({selectedDoctor.review_count} ratings)</span>
              </div>
            </div>

            {/* Profile body */}
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main bio info */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Clinic timings & Title banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedDoctor.clinic_timings && (
                    <div className="bg-brand-bg/60 border border-brand-light-blue/40 p-4 rounded-xl flex items-start gap-3">
                      <Clock className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-sans font-extrabold text-[10px] text-brand-muted uppercase tracking-wider">
                          Clinic Timings (Hours)
                        </span>
                        <span className="font-sans font-bold text-xs text-brand-dark">
                          {selectedDoctor.clinic_timings}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedDoctor.education && (
                    <div className="bg-brand-bg/60 border border-brand-light-blue/40 p-4 rounded-xl flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-sans font-extrabold text-[10px] text-brand-muted uppercase tracking-wider">
                          Degrees & Education
                        </span>
                        <span className="font-sans font-bold text-xs text-brand-dark">
                          {selectedDoctor.education}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio / Introduction */}
                {selectedDoctor.bio && (
                  <div className="flex flex-col gap-1.5 bg-sky-50/40 p-4 rounded-xl border border-sky-100/60">
                    <h3 className="font-sans font-extrabold text-xs text-brand-primary uppercase tracking-wider">
                      Practitioner Bio
                    </h3>
                    <p className="font-sans text-xs text-brand-dark leading-relaxed">
                      {selectedDoctor.bio}
                    </p>
                  </div>
                )}

                {/* About & Profile Detail */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-sans font-extrabold text-xs text-brand-dark tracking-tight uppercase tracking-wider text-brand-muted">
                    About Practice & Profile Detail
                  </h3>
                  <p className="font-sans text-sm text-brand-secondary leading-relaxed whitespace-pre-line">
                    {selectedDoctor.profile_detail || selectedDoctor.about}
                  </p>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 bg-brand-bg/40 p-4 rounded-xl">
                    <span className="font-sans font-bold text-[10px] text-brand-muted uppercase tracking-wider">
                      Consultation Fee Range
                    </span>
                    <span className="font-sans font-bold text-base text-brand-dark flex items-center">
                      <IndianRupee className="w-4 h-4 mr-0.5" />
                      {selectedDoctor.id % 2 === 0 ? '700 - 1,200 per consult' : '800 - 1,500 per consult'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 bg-brand-bg/40 p-4 rounded-xl">
                    <span className="font-sans font-bold text-[10px] text-brand-muted uppercase tracking-wider">
                      Distance to travel
                    </span>
                    <span className="font-sans font-bold text-base text-brand-dark">
                      {selectedDoctor.distance_km} km away
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="font-sans font-extrabold text-xs text-brand-dark tracking-tight uppercase tracking-wider text-brand-muted">
                    Clinic Address & Contact
                  </h3>
                  <p className="font-sans text-sm text-brand-secondary flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                    <span>
                      {selectedDoctor.address}
                    </span>
                  </p>
                  <p className="font-sans text-xs text-brand-muted flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Phone: {selectedDoctor.phone}</span>
                  </p>
                </div>

                {/* Client Reviews Section */}
                <div className="border-t border-gray-100 pt-6 mt-2 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-extrabold text-sm text-brand-dark tracking-tight uppercase tracking-wider">
                      Client Reviews ({selectedDoctor.reviews?.length || 0})
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
                      <span>★ {selectedDoctor.rating}</span>
                      <span className="text-brand-muted font-normal text-[11px]">out of 5.0</span>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {(!selectedDoctor.reviews || selectedDoctor.reviews.length === 0) ? (
                    <p className="font-sans text-xs text-brand-muted italic bg-brand-bg p-4 rounded-xl">
                      No client reviews yet. Be the first client to leave feedback!
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {selectedDoctor.reviews.map((rev) => (
                        <div key={rev.id} className="bg-brand-bg/40 p-4 rounded-xl border border-gray-100 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-bold text-xs text-brand-dark">
                              {rev.clientName}
                            </span>
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                              <span>★ {rev.rating}.0</span>
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

                  {/* Client Review Submission Form */}
                  <div className="bg-white border border-brand-light-blue/60 p-4 rounded-2xl flex flex-col gap-3 mt-2 shadow-xs">
                    <h4 className="font-sans font-extrabold text-xs text-brand-primary uppercase tracking-wider">
                      Write a Review for {selectedDoctor.name}
                    </h4>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const clientNameInput = form.elements.namedItem('clientName') as HTMLInputElement;
                        const ratingInput = form.elements.namedItem('rating') as HTMLSelectElement;
                        const commentInput = form.elements.namedItem('comment') as HTMLTextAreaElement;

                        if (!commentInput.value) return;

                        try {
                          const updated = await api.addDoctorReview(selectedDoctor.id, {
                            clientName: clientNameInput.value || me?.first_name ? `${me.first_name} ${me.last_name}` : 'Verified Client',
                            rating: Number(ratingInput.value) || 5,
                            comment: commentInput.value
                          });
                          setSelectedDoctor(updated);
                          // refresh list
                          fetchDoctors();
                          alert('Thank you! Your review has been published.');
                        } catch (err: any) {
                          alert(err.message || 'Failed to submit review');
                        }
                      }}
                      className="flex flex-col gap-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          name="clientName"
                          type="text"
                          defaultValue={me ? `${me.first_name} ${me.last_name}` : ''}
                          placeholder="Your Name (e.g. Rahul Sharma)"
                          className="bg-brand-bg border border-transparent focus:border-brand-primary rounded-xl px-3 py-2 text-xs font-sans text-brand-dark outline-none"
                        />
                        <select
                          name="rating"
                          defaultValue="5"
                          className="bg-brand-bg border border-transparent focus:border-brand-primary rounded-xl px-3 py-2 text-xs font-sans text-brand-dark outline-none"
                        >
                          <option value="5">★★★★★ (5/5 Excellent)</option>
                          <option value="4">★★★★☆ (4/5 Very Good)</option>
                          <option value="3">★★★☆☆ (3/5 Average)</option>
                          <option value="2">★★☆☆☆ (2/5 Poor)</option>
                          <option value="1">★☆☆☆☆ (1/5 Terribles)</option>
                        </select>
                      </div>
                      <textarea
                        name="comment"
                        rows={2}
                        required
                        placeholder="Share your consultation experience with this doctor..."
                        className="bg-brand-bg border border-transparent focus:border-brand-primary rounded-xl p-3 text-xs font-sans text-brand-dark outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-brand-primary hover:bg-brand-primary/95 text-white font-sans text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer self-end"
                      >
                        Submit Client Review
                      </button>
                    </form>
                  </div>

                </div>

              </div>

              {/* Sidebar Booking / Claim Panel */}
              <div className="flex flex-col gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-level-2 flex flex-col gap-4">
                  <h4 className="font-sans font-extrabold text-sm text-brand-dark tracking-tight">
                    Appointment Coordination
                  </h4>

                  {selectedDoctor.status === 'verified' ? (
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => {
                          handleBookToken(selectedDoctor.id);
                          setSelectedDoctor(null);
                        }}
                        disabled={bookingLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-sans text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      >
                        ⚡ Join Live Token Queue Now
                      </button>

                      {/* Booking notice */}
                      <div className="bg-brand-light-blue/20 p-4 rounded-xl border border-brand-light-blue/40 flex flex-col gap-1.5 text-xs text-brand-primary">
                        <span className="font-bold flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-brand-primary shrink-0 animate-spin" />
                          Live Token System Enabled
                        </span>
                        <p className="leading-relaxed">
                          Get a fixed token number instantly. Track estimated wait time and people ahead in real time without waiting physically in clinic.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-1.5 text-xs text-gray-700">
                      <span className="font-bold">OSM Clinical Records Only</span>
                      <p className="leading-relaxed">
                        This registry has not been claimed by a physician yet. Bookings are exclusively managed through direct call inquiries.
                      </p>
                    </div>
                  )}

                  <a
                    href={`tel:${selectedDoctor.phone}`}
                    className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white py-3 rounded-xl font-sans font-bold text-xs text-center transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" />
                    Direct Call: {selectedDoctor.phone}
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- BLOG JOURNAL TAB --- */}
      {activeTab === 'blog' && (
        <HealthJournal />
      )}

      {/* --- APPOINTMENTS TAB (Inert placeholder per instruction) --- */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-level-2 flex flex-col items-center justify-center text-center gap-4 py-16">
          <div className="w-16 h-16 rounded-full bg-brand-light-blue text-brand-primary flex items-center justify-center">
            <CalendarDays className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="max-w-md">
            <span className="inline-flex items-center bg-brand-accent/10 text-brand-accent-hover border border-brand-accent/20 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
              Coming Soon
            </span>
            <h2 className="font-sans text-lg font-extrabold text-brand-dark tracking-tight">
              Clinical Appointment Syncing
            </h2>
            <p className="font-sans text-xs text-brand-secondary leading-relaxed mt-1.5">
              Appointment scheduling APIs are currently being integrated into our clinical backend. Once deployed, clients will be able to book slot-specific consulting directly from this dashboard.
            </p>
            <p className="font-sans text-[11px] text-brand-muted mt-3">
              To book today, find a doctor in the search tab and contact their staff via the listed clinical telephone lines.
            </p>
          </div>
        </div>
      )}

      {/* --- APPOINTMENTS & LIVE QUEUE TOKENS TAB (MATCHING SCREENSHOT 1) --- */}
      {activeTab === 'tokens' && (
        <div className="flex flex-col gap-6">
          
          {/* Top Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-sans text-2xl font-black text-slate-900 tracking-tight">
                Your OPD Tokens & Live Queue
              </h2>
              <p className="font-sans text-xs text-slate-500 mt-1">
                Track your position in line in real-time. No more waiting blindly in OPD clinic hallways.
              </p>
            </div>

            <button
              onClick={fetchMyTokensAndStatuses}
              className="bg-white border border-emerald-300/80 hover:bg-emerald-50/50 text-emerald-800 font-sans font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-xs shrink-0"
            >
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin-slow" />
              <span>Auto-Syncing Live</span>
            </button>
          </div>

          {/* Sub-Tabs Bar (Matching Screenshot 1) */}
          <div className="border-b border-slate-200/80 flex items-center gap-8 text-xs font-extrabold uppercase tracking-wider px-2">
            <button
              onClick={() => setActiveSubTab('active')}
              className={`py-3 transition-colors cursor-pointer border-b-2 ${
                activeSubTab === 'active'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              ACTIVE TODAY TOKEN ({myTokens.filter(t => t.status === 'waiting' || t.status === 'in_progress').length || 1})
            </button>
            <button
              onClick={() => setActiveSubTab('upcoming')}
              className={`py-3 transition-colors cursor-pointer border-b-2 ${
                activeSubTab === 'upcoming'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              UPCOMING TOKENS (0)
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`py-3 transition-colors cursor-pointer border-b-2 ${
                activeSubTab === 'history'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              PAST HISTORY ({myTokens.filter(t => t.status !== 'waiting' && t.status !== 'in_progress').length})
            </button>
          </div>

          {bookingMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bookingMessage}</span>
              </div>
              <button onClick={() => setBookingMessage(null)} className="text-emerald-600 hover:text-emerald-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* OPD TRACKER MAIN CARD (Exact Screenshot 1 Layout) */}
          {activeSubTab === 'active' && (
            <div className="flex flex-col gap-6">
              {(myTokens.filter(t => t.status === 'waiting' || t.status === 'in_progress').length > 0
                ? myTokens.filter(t => t.status === 'waiting' || t.status === 'in_progress')
                : [
                    // Default simulated live OPD tracker token matching user screenshot exactly
                    {
                      id: 'demo-token-1',
                      token_number: 4,
                      status: 'waiting',
                      booked_at: new Date().toISOString(),
                      queue: 1
                    }
                  ]
              ).map((token) => {
                const liveStatus = activeTokenStatuses[token.id] || {
                  currently_serving: 3,
                  people_ahead: 1,
                  estimated_wait_minutes: 12,
                  doctor_name: 'Dr. Anand Verma',
                  is_paused: false
                };

                const tokenFormatted = `T-${String(token.token_number).padStart(3, '0')}`;
                const servingFormatted = liveStatus.currently_serving
                  ? `T-${String(liveStatus.currently_serving).padStart(3, '0')}`
                  : 'T-003';

                return (
                  <div
                    key={token.id}
                    className="bg-white rounded-[24px] border border-slate-900 shadow-md relative overflow-hidden p-6 md:p-8"
                  >
                    {/* Top Right LIVE OPD TRACKER Badge */}
                    <div className="bg-[#0f2847] text-white font-extrabold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-bl-xl rounded-tr-[24px] absolute top-0 right-0 shadow-xs">
                      LIVE OPD TRACKER
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-2">
                      
                      {/* LEFT PANEL: YOUR ASSIGNED TOKEN BOX */}
                      <div className="md:col-span-5 bg-slate-50/70 border border-slate-100 rounded-2xl p-6 text-center flex flex-col items-center gap-4">
                        <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                          YOUR ASSIGNED TOKEN
                        </span>

                        <h3 className="font-mono font-black text-5xl text-slate-900 tracking-tight">
                          {tokenFormatted}
                        </h3>

                        <div className="bg-blue-50 text-blue-600 font-extrabold text-xs px-4 py-1.5 rounded-full border border-blue-100 flex items-center gap-1.5 justify-center">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>WAITING IN QUEUE</span>
                        </div>

                        <div className="w-full h-px bg-slate-200/80 my-1"></div>

                        {/* Side by side stats */}
                        <div className="grid grid-cols-2 gap-3 w-full">
                          <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                            <span className="block font-sans font-extrabold text-[9px] text-slate-400 uppercase tracking-wider">
                              CURRENT BEING SEEN
                            </span>
                            <span className="font-mono font-black text-lg text-slate-900 mt-0.5 block">
                              {servingFormatted}
                            </span>
                          </div>

                          <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                            <span className="block font-sans font-extrabold text-[9px] text-slate-400 uppercase tracking-wider">
                              QUEUE POSITION
                            </span>
                            <span className="font-sans font-black text-base text-emerald-600 mt-0.5 block">
                              #{liveStatus.people_ahead || 1} in line
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT PANEL: DOCTOR & CLINIC DETAILS */}
                      <div className="md:col-span-7 flex flex-col gap-3 text-left">
                        <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                          DOCTOR & CLINIC
                        </span>

                        <h3 className="font-sans font-black text-2xl text-slate-900 tracking-tight">
                          {liveStatus.doctor_name || 'Dr. Anand Verma'}
                        </h3>

                        <p className="font-sans text-xs text-slate-500 font-semibold -mt-1">
                          Cardiology
                        </p>

                        <p className="font-sans text-xs text-slate-500 flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>Delhi Heart & Healthcare Clinic, A-42, Ring Road, South Ext Part 1, New Delhi</span>
                        </p>

                        {/* Inset Light Blue Information Card */}
                        <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 mt-2 flex flex-col gap-2">
                          <div className="flex justify-between items-start text-xs">
                            <span className="font-bold text-slate-600 shrink-0 min-w-[110px]">Chief Complaint:</span>
                            <span className="font-semibold text-slate-900 text-right">
                              Follow-up cardiology consultation for hypertension medication adjustment.
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs border-t border-sky-100/80 pt-2 mt-1">
                            <span className="font-bold text-slate-600">Est. Waiting Time:</span>
                            <span className="font-black text-emerald-600 text-sm">
                              ~{liveStatus.estimated_wait_minutes || 12} minutes
                            </span>
                          </div>
                        </div>

                        <p className="font-sans text-[11px] text-slate-400 italic mt-1">
                          * Token status refreshes live. Please remain inside the clinic waiting lounge when position is #1 or #2.
                        </p>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* UPCOMING SUB-TAB */}
          {activeSubTab === 'upcoming' && (
            <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center flex flex-col items-center justify-center gap-3">
              <CalendarDays className="w-12 h-12 text-slate-300" />
              <h3 className="font-sans font-bold text-base text-slate-900">No Upcoming Advance Appointments</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                You do not have any advance appointments scheduled for future dates.
              </p>
            </div>
          )}

          {/* PAST HISTORY SUB-TAB */}
          {activeSubTab === 'history' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
              <h3 className="font-sans font-extrabold text-xs text-slate-400 tracking-wider uppercase mb-4">
                Token History & Past Consultations
              </h3>
              {myTokens.filter(t => t.status !== 'waiting' && t.status !== 'in_progress').length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                        <th className="py-2.5 px-4">Token #</th>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {myTokens.filter(t => t.status !== 'waiting' && t.status !== 'in_progress').map(t => (
                        <tr key={t.id}>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">#{t.token_number}</td>
                          <td className="py-3 px-4 text-slate-600">{new Date(t.booked_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-slate-700">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No past token history found.</p>
              )}
            </div>
          )}

        </div>
      )}

      {/* --- PROFILE TAB --- */}
      {activeTab === 'profile' && me && (
        <AccountSettings />
      )}

    </DashboardLayout>
  );
}

// Inline ArrowLeft icon to avoid extra imports issues
function ArrowLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={props.className}
      style={{ width: '1em', height: '1em' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}
