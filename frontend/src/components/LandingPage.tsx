import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, decodeJWT, STORAGE_KEYS } from '../services/api';
import { Article, DoctorListing } from '../types';
import LogoIcon from './LogoIcon';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Users,
  Search,
  BookOpen,
  HeartPulse,
  Clock,
  Star,
  Award,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  MapPin,
  ArrowUpRight,
  FileText,
  Navigation,
  Phone,
  Building2,
  X,
  SlidersHorizontal,
  Filter
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [sampleSpecialists, setSampleSpecialists] = useState<DoctorListing[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Interactive matcher state
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Cardiology');
  const [matchedDoctor, setMatchedDoctor] = useState<DoctorListing | null>(null);

  // Public Doctor Search & Directory Widget States (Free for all visitors)
  const [geoCenter, setGeoCenter] = useState<string>('Delhi, NCR');
  const [specialization, setSpecialization] = useState<string>('All Specialties');
  const [radius, setRadius] = useState<number>(9);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState<string>('');
  const [publicDoctors, setPublicDoctors] = useState<DoctorListing[]>([]);
  const [publicDoctorsLoading, setPublicDoctorsLoading] = useState<boolean>(false);
  const [locationGetting, setLocationGetting] = useState<boolean>(false);
  const [selectedDoctorModal, setSelectedDoctorModal] = useState<DoctorListing | null>(null);

  const fetchPublicDoctors = async () => {
    setPublicDoctorsLoading(true);
    try {
      const specFilter = specialization === 'All Specialties' ? undefined : specialization;
      const res = await api.getNearbyDoctors({
        lat: 28.57,
        lng: 77.22,
        radius_km: radius,
        specialization: specFilter
      });
      setPublicDoctors(res);
    } catch (err) {
      console.error('Error loading public doctor listings', err);
    } finally {
      setPublicDoctorsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicDoctors();
  }, [specialization, radius]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setLocationGetting(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setGeoCenter(`${pos.coords.latitude.toFixed(2)}° N, ${pos.coords.longitude.toFixed(2)}° E (Current Location)`);
          setPublicDoctorsLoading(true);
          try {
            const specFilter = specialization === 'All Specialties' ? undefined : specialization;
            const res = await api.getNearbyDoctors({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              radius_km: radius,
              specialization: specFilter
            });
            setPublicDoctors(res);
          } catch (err) {
            console.error(err);
          } finally {
            setPublicDoctorsLoading(false);
            setLocationGetting(false);
          }
        },
        (err) => {
          console.error(err);
          setGeoCenter('Delhi, NCR (Default Location)');
          setLocationGetting(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const filteredPublicDoctors = publicDoctors.filter(doc => {
    if (!doctorSearchQuery.trim()) return true;
    const q = doctorSearchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.specialization.toLowerCase().includes(q) ||
      doc.facility_type.toLowerCase().includes(q) ||
      doc.address.toLowerCase().includes(q) ||
      (doc.about && doc.about.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Check active session
    const checkActiveSession = () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
          const decoded = decodeJWT(token);
          if (decoded) {
            setCurrentUser(decoded);
          }
        }
      } catch (err) {
        console.error('Session check failed', err);
      }
    };

    // Fetch latest published articles
    const fetchLatest = async () => {
      setArticlesLoading(true);
      try {
        const res = await api.getArticles();
        setFeaturedArticles(res.slice(0, 3));
      } catch (err) {
        console.error('Error loading landing page articles', err);
      } finally {
        setArticlesLoading(false);
      }
    };

    // Load sample doctors for recommendation
    const fetchDoctors = async () => {
      try {
        const res = await api.getNearbyDoctors({});
        setSampleSpecialists(res);
      } catch (err) {
        console.error('Error loading sample doctors', err);
      }
    };

    checkActiveSession();
    fetchLatest();
    fetchDoctors();
  }, []);

  // Update matcher recommendations when selected specialty changes
  useEffect(() => {
    if (sampleSpecialists.length > 0) {
      const match = sampleSpecialists.find(
        d => d.specialization.toLowerCase() === selectedSpecialty.toLowerCase()
      ) || sampleSpecialists[0];
      setMatchedDoctor(match);
    }
  }, [selectedSpecialty, sampleSpecialists]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark flex flex-col font-sans selection:bg-brand-primary/10 selection:text-brand-primary">
      
      {/* --- FLOATING HEADER NAVBAR --- */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100/60 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/15 transition-all group-hover:scale-105 active:scale-98 group-hover:rotate-12 duration-500">
              <LogoIcon className="w-6.5 h-6.5" />
            </div>
            <div>
              <span className="font-sans text-lg font-extrabold text-brand-dark tracking-tight">
                MediQ
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-brand-secondary">
            <a href="#find-doctors" className="hover:text-brand-primary transition-all text-brand-primary font-extrabold flex items-center gap-1">
              <Search className="w-3.5 h-3.5" />
              Find Doctors Free
            </a>
            <a href="#features" className="hover:text-brand-primary transition-all">Platform Benefits</a>
            <a href="#specialist-matcher" className="hover:text-brand-primary transition-all">Specialist Matcher</a>
            <a href="#how-it-works" className="hover:text-brand-primary transition-all">How It Works</a>
            <a href="#health-journal" className="hover:text-brand-primary transition-all">Health News</a>
          </div>

          {/* Desktop Right CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold font-sans text-brand-primary bg-brand-light-blue/50 hover:bg-brand-light-blue border border-brand-light-blue transition-all cursor-pointer shadow-xs"
            >
              Sign In
            </button>
            {currentUser ? (
              <button
                onClick={() => navigate(`/${currentUser.role}`)}
                className="bg-[#0f2847] hover:bg-[#163a66] text-white px-5 py-2.5 rounded-xl font-sans text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="bg-[#0f2847] hover:bg-[#163a66] text-white px-5 py-2.5 rounded-xl font-sans text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 bg-gradient-to-b from-white to-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Content Left */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            {/* Promo Tag */}
            <div className="inline-flex items-center gap-2 bg-brand-light-blue/50 text-brand-primary px-3 py-1.5 rounded-full text-[10px] font-bold font-sans self-start tracking-wide border border-brand-light-blue uppercase">
              <Activity className="w-3.5 h-3.5 text-brand-primary" />
              Verified Healthcare & Patient Queue Directory
            </div>

            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black text-brand-dark tracking-tight leading-[1.1]">
              Next-Gen Medical Hub, <br />
              <span className="text-brand-primary bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">Verified & Accessible.</span>
            </h1>

            <p className="font-sans text-sm sm:text-base text-brand-secondary leading-relaxed max-w-2xl">
              MediQ bridges patient-centric records, specialist physician registries, and expert health publishing. Browse peer-reviewed updates and locate certified clinics near you with state-of-the-art diagnostic standards.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3.5 mt-2">
              {currentUser ? (
                <>
                  <button
                    onClick={() => navigate(`/${currentUser.role}`)}
                    className="bg-brand-primary hover:bg-brand-primary/95 text-white px-7 py-3.5 rounded-xl font-sans text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all cursor-pointer"
                  >
                    Go to Your Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="#health-journal"
                    className="bg-white hover:bg-brand-light-blue/20 text-brand-dark border border-gray-200 px-7 py-3.5 rounded-xl font-sans text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                  >
                    Explore Wellness Columns
                  </a>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-brand-primary hover:bg-brand-primary/95 text-white px-7 py-3.5 rounded-xl font-sans text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all cursor-pointer"
                  >
                    Register as Client / Patient
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-white hover:bg-brand-light-blue/20 text-brand-dark border border-gray-200 px-7 py-3.5 rounded-xl font-sans text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    Explore Practitioner Hub
                  </button>
                </>
              )}
            </div>

            {/* Live Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-8 mt-4">
              <div>
                <p className="font-sans text-2xl sm:text-3xl font-black text-brand-primary">150+</p>
                <p className="font-sans text-[10px] uppercase font-bold text-brand-muted tracking-wider">Verified Doctors</p>
              </div>
              <div>
                <p className="font-sans text-2xl sm:text-3xl font-black text-brand-accent">2,400+</p>
                <p className="font-sans text-[10px] uppercase font-bold text-brand-muted tracking-wider">Patients Assisted</p>
              </div>
              <div>
                <p className="font-sans text-2xl sm:text-3xl font-black text-brand-dark">100%</p>
                <p className="font-sans text-[10px] uppercase font-bold text-brand-muted tracking-wider">License Integrity</p>
              </div>
            </div>

          </div>

          {/* Hero Visual Right */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Background gradient decorative glowing circles */}
              <div className="absolute -top-10 -left-10 w-44 h-44 bg-brand-primary/5 rounded-full filter blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-brand-accent/5 rounded-full filter blur-3xl"></div>

              {/* Main Visual Device Mockup Frame */}
              <div className="bg-white rounded-3xl border border-gray-100/80 p-6 shadow-level-3 relative z-10 flex flex-col gap-5">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="font-sans text-[10px] uppercase font-extrabold tracking-wide text-brand-muted">
                      Clinical Status Live
                    </span>
                  </div>
                  <span className="bg-brand-light-blue text-brand-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    MediQ Core
                  </span>
                </div>

                {/* Patient Telemetry Card */}
                <div className="bg-brand-bg/60 rounded-2xl p-4 border border-gray-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-sans text-[10px] text-brand-muted uppercase font-bold">Smart Patient Log</p>
                      <p className="font-sans text-xs font-extrabold text-brand-dark">Health Indicators</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-xs font-extrabold text-emerald-600">Optimal</p>
                    <p className="font-sans text-[10px] text-brand-secondary font-mono">Synced on-chain</p>
                  </div>
                </div>

                {/* Verified Doctor Card Component */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-level-2 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-light-blue text-brand-primary flex items-center justify-center font-sans font-black text-xs">
                        AV
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-sans text-xs font-extrabold text-brand-dark">Dr. Anand Verma</p>
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent fill-brand-accent/5" />
                        </div>
                        <p className="font-sans text-[10px] text-brand-muted">Senior Interventional Cardiologist</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold font-sans">
                      <Star className="w-3 h-3 fill-amber-500" />
                      4.9
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-sans border-t border-gray-50 pt-2.5 mt-1 text-brand-secondary">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-brand-muted" /> Sector 15, New Delhi
                    </span>
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-brand-primary text-white font-extrabold px-3 py-1.5 rounded-lg hover:bg-brand-primary/95 cursor-pointer border-none"
                    >
                      Verify License
                    </button>
                  </div>
                </div>

                {/* Security Badge Info */}
                <div className="bg-brand-accent/5 border border-brand-accent/15 rounded-2xl p-4 text-left">
                  <div className="flex gap-2.5 items-start">
                    <ShieldCheck className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-sans font-extrabold text-xs text-brand-dark">Medical Registry Standard</h4>
                      <p className="font-sans text-[10px] text-brand-secondary mt-0.5 leading-relaxed">
                        Every clinical specialist in the MediQ network is authenticated against registered central medical councils manually and audited on-chain.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* --- PUBLIC DOCTOR DISCOVERY WIDGET (FREE FOR ALL VISITORS) --- */}
      <section id="find-doctors" className="py-16 bg-gradient-to-b from-brand-bg to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          
          {/* Header Card (Matching User Screenshot) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100/90 shadow-level-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                  ✓ Free Public Access • Anyone Can Search
                </span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
                Find Local Medical Specialists
              </h2>
              <p className="font-sans text-xs sm:text-sm text-brand-secondary mt-1">
                Discover verified clinics and community listings in your neighborhood.
              </p>
            </div>

            <button
              onClick={handleUseMyLocation}
              disabled={locationGetting}
              className="bg-brand-light-blue/80 hover:bg-brand-light-blue text-brand-primary font-sans font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 border border-brand-light-blue transition-all cursor-pointer shadow-xs hover:shadow-sm shrink-0 disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 text-brand-primary ${locationGetting ? 'animate-spin' : ''}`} />
              <span>{locationGetting ? 'Locating...' : 'Use My Location'}</span>
            </button>
          </div>

          {/* Filter Bar Card (Matching User Screenshot) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100/90 shadow-level-2 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Field 1: GEOGRAPHIC CENTER */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="font-sans font-extrabold text-[10px] text-brand-muted uppercase tracking-wider">
                Geographic Center
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary" />
                <input
                  type="text"
                  value={geoCenter}
                  onChange={(e) => setGeoCenter(e.target.value)}
                  placeholder="e.g. Delhi, NCR"
                  className="w-full bg-gray-50/80 border border-gray-100 hover:border-brand-light-blue focus:border-brand-primary focus:bg-white rounded-2xl py-3 pl-11 pr-4 font-sans font-bold text-xs text-brand-dark transition-all outline-none"
                />
              </div>
            </div>

            {/* Field 2: CLINICAL SPECIALIZATION */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <label className="font-sans font-extrabold text-[10px] text-brand-muted uppercase tracking-wider">
                Clinical Specialization
              </label>
              <div className="relative">
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full bg-gray-50/80 border border-gray-100 hover:border-brand-light-blue focus:border-brand-primary focus:bg-white rounded-2xl py-3 px-4 font-sans font-bold text-xs text-brand-dark transition-all outline-none appearance-none cursor-pointer pr-10"
                >
                  <option value="All Specialties">All Specialties</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted text-[10px]">
                  ▼
                </div>
              </div>
            </div>

            {/* Field 3: SEARCH RANGE RADIUS */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-sans font-extrabold text-[10px] text-brand-muted uppercase tracking-wider">
                  Search Range Radius
                </label>
                <span className="font-sans font-black text-xs text-brand-primary bg-brand-light-blue/50 px-2.5 py-0.5 rounded-full">
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
                  className="w-full h-2 bg-brand-light-blue/40 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
              </div>
            </div>

          </div>

          {/* Quick Search & Count Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                value={doctorSearchQuery}
                onChange={(e) => setDoctorSearchQuery(e.target.value)}
                placeholder="Filter by name, clinic, or keyword..."
                className="w-full bg-white border border-gray-200/80 rounded-xl py-2.5 pl-10 pr-4 font-sans text-xs text-brand-dark outline-none focus:border-brand-primary transition-all"
              />
            </div>
            
            <p className="font-sans text-xs font-semibold text-brand-secondary">
              Showing <span className="font-bold text-brand-dark">{filteredPublicDoctors.length}</span> certified medical listing(s)
            </p>
          </div>

          {/* Public Doctors Results Grid */}
          {publicDoctorsLoading ? (
            <div className="py-16 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="font-sans font-semibold text-xs text-brand-secondary">Searching medical council registry...</p>
            </div>
          ) : filteredPublicDoctors.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="font-sans font-extrabold text-base text-brand-dark">No specialists found in range</h3>
              <p className="font-sans text-xs text-brand-secondary max-w-md">
                Try increasing the search range radius slider or selecting "All Specialties" to view all certified clinics in your region.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublicDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl p-6 border border-gray-100/90 shadow-sm hover:shadow-level-3 hover:border-brand-light-blue transition-all duration-300 flex flex-col justify-between gap-5 group"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-light-blue/70 text-brand-primary font-sans font-black text-sm flex items-center justify-center shadow-xs">
                          {doc.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-sans font-extrabold text-sm text-brand-dark group-hover:text-brand-primary transition-colors">
                              {doc.name}
                            </h3>
                            {doc.status === 'verified' ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-md font-extrabold border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded-md font-extrabold border border-amber-200">
                                Unverified
                              </span>
                            )}
                          </div>
                          <p className="font-sans text-xs text-brand-secondary mt-0.5 font-medium">
                            {doc.specialization} • {doc.facility_type}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rating & Distance Badges */}
                    <div className="flex items-center justify-between bg-brand-bg/50 rounded-xl p-2.5 text-xs">
                      <div className="flex items-center gap-1 font-bold text-amber-600 font-sans">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{doc.rating || 4.8}</span>
                        <span className="text-brand-muted text-[10px] font-normal">({doc.review_count || 35} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-brand-primary font-bold text-xs font-sans">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{doc.distance_km} km away</span>
                      </div>
                    </div>

                    {/* Address & Timings */}
                    <div className="flex flex-col gap-1.5 text-xs text-brand-secondary">
                      <p className="line-clamp-2 leading-relaxed flex items-start gap-1.5">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-brand-muted mt-0.5" />
                        <span>{doc.address}</span>
                      </p>
                      {doc.clinic_timings && (
                        <p className="flex items-center gap-1.5 text-[11px] text-brand-muted font-medium">
                          <Clock className="w-3.5 h-3.5 shrink-0 text-brand-muted" />
                          <span>{doc.clinic_timings}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 mt-1">
                    <button
                      onClick={() => setSelectedDoctorModal(doc)}
                      className="w-full bg-brand-bg hover:bg-brand-light-blue/50 text-brand-dark py-2.5 rounded-xl font-sans font-bold text-xs transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        if (currentUser) {
                          navigate('/client');
                        } else {
                          navigate('/login');
                        }
                      }}
                      className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white py-2.5 rounded-xl font-sans font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      Book Token
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* --- PUBLIC DOCTOR DETAIL MODAL --- */}
      {selectedDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-level-3 border border-gray-100 flex flex-col gap-6 relative">
            <button
              onClick={() => setSelectedDoctorModal(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <div className="w-16 h-16 rounded-2xl bg-brand-primary text-white font-sans font-black text-xl flex items-center justify-center shadow-md">
                {selectedDoctorModal.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-sans font-black text-xl text-brand-dark">{selectedDoctorModal.name}</h2>
                  {selectedDoctorModal.status === 'verified' && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Listing
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-brand-secondary mt-1">
                  {selectedDoctorModal.title || selectedDoctorModal.specialization} • {selectedDoctorModal.facility_type}
                </p>
                {selectedDoctorModal.education && (
                  <p className="font-sans text-xs font-semibold text-brand-primary mt-0.5">
                    🎓 {selectedDoctorModal.education}
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-4 text-xs font-sans text-brand-secondary">
              {selectedDoctorModal.about && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-brand-muted mb-1">About Practitioner</h4>
                  <p className="bg-brand-bg/60 rounded-2xl p-4 leading-relaxed text-brand-dark">
                    {selectedDoctorModal.about}
                  </p>
                </div>
              )}

              {selectedDoctorModal.profile_detail && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-brand-muted mb-1">Clinical Specialties & Services</h4>
                  <p className="bg-brand-bg/60 rounded-2xl p-4 leading-relaxed text-brand-dark">
                    {selectedDoctorModal.profile_detail}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-brand-dark text-xs">Clinic Address</p>
                    <p className="text-brand-secondary mt-0.5">{selectedDoctorModal.address}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-brand-dark text-xs">Operating Hours</p>
                    <p className="text-brand-secondary mt-0.5">{selectedDoctorModal.clinic_timings || '09:00 AM - 08:00 PM (Mon-Sat)'}</p>
                  </div>
                </div>
              </div>

              {selectedDoctorModal.phone && (
                <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-emerald-900">Direct Helpline: {selectedDoctorModal.phone}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">Available</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedDoctorModal(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-sans font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer border-none"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedDoctorModal(null);
                  if (currentUser) {
                    navigate('/client');
                  } else {
                    navigate('/login');
                  }
                }}
                className="bg-brand-primary hover:bg-brand-primary/95 text-white font-sans font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                Book Token / Appointment
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PLATFORM CAPABILITIES SECTION --- */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col gap-12">
          
          <div className="max-w-2xl mx-auto flex flex-col gap-2">
            <span className="font-sans text-[10px] uppercase font-black text-brand-accent tracking-widest">
              Uncompromising Standards
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark tracking-tight leading-tight">
              Designed for patients, doctors, and trust administrators.
            </h2>
            <p className="font-sans text-xs sm:text-sm text-brand-secondary">
              MediQ is built around a tripartite workflow allowing transparent verification, interactive bookings, and peer insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Feature 1 */}
            <div className="bg-brand-bg/50 border border-gray-100 p-6 rounded-3xl hover:bg-white hover:shadow-level-3 hover:border-brand-light-blue transition-all duration-300 group flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div className="h-44 w-full overflow-hidden rounded-2xl bg-gray-100 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80" 
                    alt="Verified Doctor Directory"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-brand-primary/90 text-white flex items-center justify-center backdrop-blur-md shadow-sm transition-all group-hover:scale-110">
                    <Stethoscope className="w-5 h-5 stroke-[2]" />
                  </div>
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-base text-brand-dark tracking-tight group-hover:text-brand-primary transition-colors">
                    Verified Doctor Directory
                  </h3>
                  <p className="font-sans text-xs text-brand-secondary mt-1.5 leading-relaxed">
                    Instantly browse and search highly specialized medical practitioners. Find clinics, check exact locations, medical specialization, and read verified reviews.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="font-sans text-xs font-bold text-brand-primary flex items-center gap-1 group-hover:underline cursor-pointer border-none bg-transparent outline-none p-0 text-left"
              >
                Search clinic directory
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 2 */}
            <div className="bg-brand-bg/50 border border-gray-100 p-6 rounded-3xl hover:bg-white hover:shadow-level-3 hover:border-brand-light-blue transition-all duration-300 group flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div className="h-44 w-full overflow-hidden rounded-2xl bg-gray-100 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80" 
                    alt="Clinical Wellness Columns"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-brand-accent/90 text-white flex items-center justify-center backdrop-blur-md shadow-sm transition-all group-hover:scale-110">
                    <BookOpen className="w-5 h-5 stroke-[2]" />
                  </div>
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-base text-brand-dark tracking-tight group-hover:text-brand-accent transition-colors">
                    Clinical Wellness Columns
                  </h3>
                  <p className="font-sans text-xs text-brand-secondary mt-1.5 leading-relaxed">
                    Peer-reviewed medical journals and wellness guidance written by our certified doctors directly. Stay informed on public health developments.
                  </p>
                </div>
              </div>
              <a 
                href="#health-journal"
                className="font-sans text-xs font-bold text-brand-accent flex items-center gap-1 group-hover:underline cursor-pointer text-left"
              >
                Read specialist articles
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Feature 3 */}
            <div className="bg-brand-bg/50 border border-gray-100 p-6 rounded-3xl hover:bg-white hover:shadow-level-3 hover:border-brand-light-blue transition-all duration-300 group flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div className="h-44 w-full overflow-hidden rounded-2xl bg-gray-100 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80" 
                    alt="On-Chain License Auditing"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-brand-accent/90 text-white flex items-center justify-center backdrop-blur-md shadow-sm transition-all group-hover:scale-110">
                    <ShieldCheck className="w-5 h-5 stroke-[2]" />
                  </div>
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-base text-brand-dark tracking-tight group-hover:text-brand-accent transition-colors">
                    On-Chain License Auditing
                  </h3>
                  <p className="font-sans text-xs text-brand-secondary mt-1.5 leading-relaxed">
                    Administrators verify registration numbers manually and publish certified keys. Experience real trust transparency with state credential syncs.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="font-sans text-xs font-bold text-brand-accent flex items-center gap-1 group-hover:underline cursor-pointer border-none bg-transparent outline-none p-0 text-left"
              >
                Explore compliance queue
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* --- INTERACTIVE SPECIALIST RECOMMENDATION MATCHER (NEW DETAILED ADDITION) --- */}
      <section id="specialist-matcher" className="py-20 bg-brand-bg/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Matcher Copy Left */}
          <div className="lg:col-span-6 flex flex-col gap-5 text-left">
            <div>
              <span className="font-sans text-[10px] uppercase font-black text-brand-primary tracking-widest">
                Interactive Diagnosis Helper
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark tracking-tight leading-tight mt-1">
                Looking for clinical experts? Match instantly.
              </h2>
            </div>
            
            <p className="font-sans text-xs sm:text-sm text-brand-secondary leading-relaxed">
              Select your required medical concern or specialty field below. Our algorithm instantly cross-references certified clinicians, showing you distances, verified rankings, and facility availability in real-time.
            </p>

            {/* Selector Pills */}
            <div className="flex flex-wrap gap-2 py-2">
              {['Cardiology', 'Dermatology', 'Pediatrics', 'General Medicine'].map((spec) => {
                const active = selectedSpecialty === spec;
                return (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`px-4 py-2.5 rounded-xl font-sans text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                      active
                        ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                        : 'bg-white border-gray-100 text-brand-secondary hover:bg-brand-bg hover:text-brand-dark'
                    }`}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-brand-secondary leading-relaxed">
                Matches are filtered against medical registration databases automatically. You can directly request telehealth booking or physical consultation after registering.
              </p>
            </div>
          </div>

          {/* Interactive Recommended Card Right */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-level-3 flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full filter blur-xl"></div>
              
              <div className="flex items-center justify-between">
                <span className="font-sans text-[10px] uppercase font-black tracking-wide text-brand-accent bg-brand-accent/5 px-2.5 py-1 rounded-full">
                  Verified Match Recommended
                </span>
                <span className="font-sans text-[11px] font-bold text-brand-muted font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-primary" /> Active Now
                </span>
              </div>

              {matchedDoctor ? (
                <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-light-blue text-brand-primary font-black font-sans text-base flex items-center justify-center shrink-0">
                      {matchedDoctor.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-base text-brand-dark flex items-center gap-1.5">
                        {matchedDoctor.name}
                        <CheckCircle2 className="w-4 h-4 text-brand-accent fill-brand-accent/5" />
                      </h4>
                      <p className="font-sans text-xs font-bold text-brand-primary">{matchedDoctor.specialization}</p>
                      <p className="font-sans text-[11px] text-brand-muted mt-0.5">{matchedDoctor.address}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-4 text-left">
                    <div>
                      <p className="font-sans text-[10px] text-brand-muted uppercase font-bold">Standard Distance</p>
                      <p className="font-sans text-sm font-black text-brand-dark mt-0.5">~1.2 Kilometers</p>
                    </div>
                    <div>
                      <p className="font-sans text-[10px] text-brand-muted uppercase font-bold">Licence Validity</p>
                      <p className="font-sans text-xs font-extrabold text-emerald-600 mt-0.5 uppercase tracking-wide">Approved & Audited</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate('/login')}
                      className="flex-1 bg-brand-primary hover:bg-brand-primary/95 text-white py-3 px-4 rounded-xl font-sans text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand-primary/10"
                    >
                      Book Clinic Appointment
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-brand-bg hover:bg-brand-light-blue/30 text-brand-secondary py-3 px-4 rounded-xl font-sans text-xs font-bold cursor-pointer border-none"
                    >
                      Direct Call Specialist
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-brand-muted font-sans text-xs">
                  Searching match directory...
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* --- HOW IT WORKS TIMELINE SECTION --- */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col gap-12">
          
          <div className="max-w-2xl mx-auto flex flex-col gap-2">
            <span className="font-sans text-[10px] uppercase font-black text-brand-accent tracking-widest">
              Unified Ecosystem
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark tracking-tight leading-tight">
              A transparent, three-step cycle.
            </h2>
            <p className="font-sans text-xs sm:text-sm text-brand-secondary">
              Understanding your journey based on platform permissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Step 1 */}
            <div className="flex flex-col gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-brand-primary text-white font-black text-xs font-sans flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="font-sans font-extrabold text-sm uppercase tracking-wide text-brand-dark">
                Registration & Audit
              </h3>
              <p className="font-sans text-xs text-brand-secondary leading-relaxed">
                Practitioners sign up and submit clinical licensing. Admins verify profiles manually to guarantee safety and prevent fake directories.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-brand-accent text-white font-black text-xs font-sans flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="font-sans font-extrabold text-sm uppercase tracking-wide text-brand-dark">
                Search & Consulting
              </h3>
              <p className="font-sans text-xs text-brand-secondary leading-relaxed">
                Clients easily find verified doctors, locate clinic branches, read columns in the Health Journal, and request offline appointments.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-brand-dark text-white font-black text-xs font-sans flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="font-sans font-extrabold text-sm uppercase tracking-wide text-brand-dark">
                Journal & Health Tracking
              </h3>
              <p className="font-sans text-xs text-brand-secondary leading-relaxed">
                Doctors publish peer health articles in the Medical Journal to advise on current wellness, while clients update personal diagnostic logs securely.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* --- HEALTH JOURNAL PREVIEW SECTION --- */}
      <section id="health-journal" className="py-20 bg-brand-bg/50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col gap-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
            <div className="max-w-2xl flex flex-col gap-2">
              <span className="font-sans text-[10px] uppercase font-black text-brand-primary tracking-widest">
                Clinical Health Journal
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark tracking-tight leading-tight">
                Latest Medical Columns & Wellness Guides
              </h2>
              <p className="font-sans text-xs sm:text-sm text-brand-secondary">
                Expert knowledge written directly by certified specialists within our practitioner registry.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="bg-white hover:bg-brand-light-blue/20 text-brand-primary border border-brand-light-blue px-5 py-3 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm self-start shrink-0"
            >
              Access Complete Journal
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Articles Grid Container */}
          {articlesLoading ? (
            <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="font-sans text-xs text-brand-secondary">Retrieving insights...</p>
            </div>
          ) : featuredArticles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center gap-3 w-full">
              <div className="p-4 bg-brand-bg rounded-full text-brand-secondary">
                <FileText className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h4 className="font-sans font-bold text-sm text-brand-dark">No Articles Published Currently</h4>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredArticles.map((art) => (
                <article 
                  key={art.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-level-2 border border-gray-100/80 flex flex-col justify-between hover:shadow-level-3 transition-all duration-300"
                >
                  {art.cover_image_url ? (
                    <div className="h-48 w-full overflow-hidden bg-brand-bg relative">
                      <img 
                        src={art.cover_image_url} 
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {art.tags.slice(0, 2).map(t => (
                          <span key={t} className="bg-brand-accent/15 text-brand-accent-hover px-2.5 py-0.5 rounded-full text-[9px] font-extrabold font-sans tracking-wide">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-brand-primary/10 to-brand-accent/5 flex items-center justify-center text-brand-primary relative">
                      <BookOpen className="w-10 h-10 stroke-[1.5] text-brand-primary/40" />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {art.tags.slice(0, 2).map(t => (
                          <span key={t} className="bg-brand-accent/15 text-brand-accent-hover px-2.5 py-0.5 rounded-full text-[9px] font-extrabold font-sans tracking-wide">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-5 flex-grow flex flex-col justify-between gap-5 text-left">
                    <div className="flex flex-col gap-2">
                      <span className="font-sans text-[9px] text-brand-muted uppercase tracking-wider font-extrabold">
                        Dr. {art.author.first_name} {art.author.last_name}
                      </span>
                      <h3 className="font-sans font-black text-base text-brand-dark leading-snug line-clamp-2 hover:text-brand-primary transition-colors">
                        {art.title}
                      </h3>
                      <p className="font-sans text-xs text-brand-secondary line-clamp-3">
                        {art.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-[10px] text-brand-muted font-sans">
                      <span>{new Date(art.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <button
                        onClick={() => navigate('/login')}
                        className="text-brand-primary font-bold hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent outline-none p-0"
                      >
                        Read Full Column
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="py-20 bg-brand-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full filter blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full filter blur-2xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col gap-6 relative z-10">
          <h2 className="font-sans text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Are you a Licensed Practitioner or Medical Clinic?
          </h2>
          <p className="font-sans text-sm text-brand-light-blue max-w-2xl mx-auto leading-relaxed">
            Join the MediQ registry today to manage your clinical roster, verify credentials transparency with administrations, and interact directly with patients.
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center mt-2">
            <button
              onClick={() => navigate('/register')}
              className="bg-brand-accent hover:bg-brand-accent-hover text-white px-7 py-3.5 rounded-xl font-sans text-xs font-extrabold shadow-md transition-all cursor-pointer border-none"
            >
              Apply to Practitioner Directory
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-7 py-3.5 rounded-xl font-sans text-xs font-extrabold transition-all cursor-pointer"
            >
              Sign In to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER SECTION --- */}
      <footer className="bg-brand-dark text-white py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white font-extrabold transition-all group-hover:scale-105 group-hover:rotate-12 duration-500">
                <LogoIcon className="w-5.5 h-5.5" />
              </div>
              <span className="font-sans text-base font-extrabold text-white tracking-tight">
                Medi<span className="text-brand-accent">Q</span> Hub
              </span>
            </div>
            <p className="font-sans text-[11px] text-brand-muted leading-relaxed">
              Transparent clinical coordination, verified practitioner directories, and expert health publishing. Audited manually, trust-synced.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-left">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-accent">For Clients</h4>
            <div className="flex flex-col gap-2 text-[11px] text-brand-muted">
              <a href="#specialist-matcher" className="hover:text-white transition-colors">Interactive Specialist Matcher</a>
              <button onClick={() => navigate('/login')} className="hover:text-white transition-colors text-left bg-transparent border-none p-0 outline-none">Find Local Clinics</button>
              <a href="#health-journal" className="hover:text-white transition-colors">Medical Wellness Columns</a>
              <button onClick={() => navigate('/register')} className="hover:text-white transition-colors text-left bg-transparent border-none p-0 outline-none font-bold text-brand-light-blue">Create Free Account</button>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-left">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-accent">For Specialists</h4>
            <div className="flex flex-col gap-2 text-[11px] text-brand-muted">
              <button onClick={() => navigate('/register')} className="hover:text-white transition-colors text-left bg-transparent border-none p-0 outline-none">Register Practitioner Profile</button>
              <button onClick={() => navigate('/login')} className="hover:text-white transition-colors text-left bg-transparent border-none p-0 outline-none">Verify Council Roster</button>
              <button onClick={() => navigate('/login')} className="hover:text-white transition-colors text-left bg-transparent border-none p-0 outline-none">Submit Clinical Column</button>
              <button onClick={() => navigate('/login')} className="hover:text-white transition-colors text-left bg-transparent border-none p-0 outline-none">Manage Clinic Appointments</button>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-left">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-brand-accent">Verification Security</h4>
            <p className="font-sans text-[11px] text-brand-muted leading-relaxed">
              MediQ enforces manual licensing lookup with administrative authorities. Practicing licenses are validated in real-time.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-brand-accent font-bold">
              <ShieldCheck className="w-4 h-4" /> On-Chain Sync Enabled
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-brand-muted font-sans">
          <p>© {new Date().getFullYear()} MediQ Clinical Hub Ecosystem. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Terms of Care</a>
            <a href="#" className="hover:text-white transition-colors">Data Privacy Charter</a>
            <a href="#" className="hover:text-white transition-colors">Verification Compliance</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
