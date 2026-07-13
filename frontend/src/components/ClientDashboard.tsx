import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DoctorListing, Article, User } from '../types';
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
  Tag
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

  // Load basic data
  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (activeTab === 'search') {
      fetchDoctors();
    } else if (activeTab === 'blog') {
      fetchArticles();
    }
  }, [activeTab, radius, specialization, selectedTag]);

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

  const clientTabs = [
    { id: 'search', label: 'Nearby Doctors', icon: <Search className="w-4 h-4" /> },
    { id: 'blog', label: 'Health Journal', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <CalendarRange className="w-4 h-4" /> },
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

      {/* --- SEARCH / DIRECTORY TAB --- */}
      {activeTab === 'search' && !selectedDoctor && (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-level-2 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-sans text-xl font-extrabold text-brand-dark tracking-tight">
                Find Local Medical Specialists
              </h2>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                Discover verified clinics and community listings in your neighborhood.
              </p>
            </div>
            <button
              onClick={simulateLocationSelect}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-light-blue text-brand-primary hover:bg-brand-primary hover:text-white font-sans text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0 self-start md:self-auto"
            >
              <MapPin className="w-4 h-4" />
              Use My Location
            </button>
          </div>

          {/* Filter Bar Grid */}
          <div className="bg-white rounded-2xl p-5 shadow-level-2 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Input */}
            <div className="flex flex-col gap-1.5">
              <span className="font-sans font-bold text-[10px] text-brand-muted uppercase tracking-wider">
                Geographic Center
              </span>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted" />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="City, landmark, or coordinates"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 pl-10 pr-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>
            </div>

            {/* Specialization Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="font-sans font-bold text-[10px] text-brand-muted uppercase tracking-wider">
                Clinical Specialization
              </span>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3 font-sans text-sm text-brand-dark outline-none cursor-pointer transition-all"
              >
                <option value="">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Neurology">Neurology</option>
              </select>
            </div>

            {/* Radius Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="font-sans font-bold text-[10px] text-brand-muted uppercase tracking-wider">
                  Search Range Radius
                </span>
                <span className="font-sans font-bold text-xs text-brand-primary">{radius} km</span>
              </div>
              <div className="flex items-center gap-3 py-1.5">
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-2 bg-brand-light-blue rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-extrabold text-sm text-brand-dark tracking-tight">
              Nearby Physicians & Clinics ({doctors.length})
            </h3>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100">
                <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="font-sans text-xs text-brand-secondary font-semibold">Scanning nearby registries...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="p-4 bg-brand-bg rounded-full text-brand-secondary">
                  <SlidersHorizontal className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-brand-dark">No Doctors Found</h4>
                  <p className="font-sans text-xs text-brand-muted mt-1 max-w-sm mx-auto">
                    There are no medical listings matching your specialization or range filters. Try increasing the search range radius.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doc) => {
                  const isVerified = doc.status === 'verified';
                  return (
                    <div 
                      key={doc.id}
                      className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-brand-primary/20 hover:shadow-level-2 transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-sans font-extrabold text-base text-brand-dark tracking-tight">
                              {doc.name}
                            </span>
                            {isVerified ? (
                              <span className="inline-flex items-center bg-teal-50 text-teal-800 border border-teal-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                ✓ Verified Clinic
                              </span>
                            ) : (
                              <span className="inline-flex items-center bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                ⚠ OSM Listing (Call only)
                              </span>
                            )}
                          </div>
                          
                          <p className="font-sans text-xs font-bold text-brand-primary mt-1">
                            {doc.specialization} • {doc.facility_type}
                          </p>
                          <p className="font-sans text-xs text-brand-muted flex items-center gap-1 mt-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {doc.address}
                          </p>
                        </div>
                        
                        <div className="bg-brand-bg px-2.5 py-1 rounded-xl text-right shrink-0">
                          <span className="font-sans font-bold text-xs text-brand-primary">{doc.distance_km} km</span>
                          <span className="block font-sans text-[9px] text-brand-muted uppercase tracking-wider">Away</span>
                        </div>
                      </div>

                      {/* Info & Rating */}
                      <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-brand-secondary">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-500">★ {doc.rating || '4.5'}</span>
                          <span className="text-brand-muted">({doc.review_count || '12'} reviews)</span>
                        </div>
                        <span className="font-sans font-bold text-brand-dark flex items-center">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {doc.id % 2 === 0 ? '700 - 1,200' : '800 - 1,500'}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <a 
                          href={`tel:${doc.phone}`}
                          className="w-full flex items-center justify-center gap-1.5 bg-brand-bg hover:bg-brand-light-blue/40 text-brand-primary border border-transparent hover:border-brand-light-blue py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call Clinic
                        </a>

                        <button
                          onClick={() => handleDoctorClick(doc.id)}
                          className="w-full flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary/95 text-white py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer shadow-sm"
                        >
                          View Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
                <div className="flex items-center gap-2">
                  <h1 className="font-sans text-2xl font-extrabold tracking-tight">
                    {selectedDoctor.name}
                  </h1>
                  {selectedDoctor.status === 'verified' ? (
                    <span className="bg-white/20 text-white px-2.5 py-0.5 rounded-full text-xs font-bold backdrop-blur-md">
                      ✓ Verified Clinic
                    </span>
                  ) : (
                    <span className="bg-amber-400/30 text-amber-200 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-xs font-bold backdrop-blur-md">
                      ⚠ OpenStreetMap Listing
                    </span>
                  )}
                </div>
                <p className="font-sans text-sm text-brand-light-blue mt-1">
                  {selectedDoctor.specialization} • {selectedDoctor.facility_type}
                </p>
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
                <div className="flex flex-col gap-2">
                  <h3 className="font-sans font-extrabold text-sm text-brand-dark tracking-tight uppercase tracking-wider text-brand-muted">
                    About Professional Practice
                  </h3>
                  <p className="font-sans text-sm text-brand-secondary leading-relaxed whitespace-pre-line">
                    {selectedDoctor.about}
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
                  <h3 className="font-sans font-extrabold text-sm text-brand-dark tracking-tight uppercase tracking-wider text-brand-muted">
                    Clinic Address
                  </h3>
                  <p className="font-sans text-sm text-brand-secondary flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                    <span>
                      {selectedDoctor.address}
                    </span>
                  </p>
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
                      {/* Booking inert notice */}
                      <div className="bg-brand-light-blue/20 p-4 rounded-xl border border-brand-light-blue/40 flex flex-col gap-1.5 text-xs text-brand-primary">
                        <span className="font-bold flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-brand-primary shrink-0 animate-spin" />
                          Booking Engine Coming Soon
                        </span>
                        <p className="leading-relaxed">
                          We are actively working on automated appointment synchronization. Please call the clinic directly to coordinate bookings.
                        </p>
                      </div>

                      {/* Visibly placeholder disabled book button */}
                      <button
                        disabled
                        className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-sans font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2 border border-gray-200"
                      >
                        <CalendarDays className="w-4 h-4" />
                        Book Appointment (Placeholder)
                      </button>
                    </div>
                  ) : (
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex flex-col gap-1.5 text-xs text-amber-800">
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
            <span className="inline-flex items-center bg-teal-50 text-teal-800 border border-teal-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
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
