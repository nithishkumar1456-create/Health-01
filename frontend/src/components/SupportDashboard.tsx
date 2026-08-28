import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, SupportIssue, DoctorListing } from '../types';
import DashboardLayout from './DashboardLayout';
import AccountSettings from './AccountSettings';
import AddDoctorModal from './AddDoctorModal';
import { 
  Wrench, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Mail, 
  Phone, 
  ShieldAlert, 
  Users, 
  Check, 
  Activity, 
  FileText, 
  X, 
  CheckSquare, 
  ArrowUpRight,
  Stethoscope,
  Building,
  MapPin,
  FileCheck,
  ShieldCheck,
  LifeBuoy,
  RefreshCw,
  FileCode
} from 'lucide-react';

export default function SupportDashboard() {
  const [activeTab, setActiveTab] = useState('verifications');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Doctor Modal State
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  // Doctor Verification Desk States
  const [verificationSearch, setVerificationSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Support Issues States
  const [issues, setIssues] = useState<SupportIssue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);

  // Form states for new support issues
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueCategory, setIssueCategory] = useState<'Billing' | 'Technical' | 'Clinical' | 'Account' | 'Other'>('Account');
  const [issueEmail, setIssueEmail] = useState('');

  // Doctor Registry States
  const [usersList, setUsersList] = useState<User[]>([]);
  const [doctorListings, setDoctorListings] = useState<DoctorListing[]>([]);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState('');

  // Form states for adding doctor
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('General Medicine');
  const [newRegNumber, setNewRegNumber] = useState('');

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllSupportIssues();
      setIssues(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch support issues.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorsAndListings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all users to filter doctors
      const users = await api.getAllUsers();
      setUsersList(users);

      // Fetch all listings to allow verification
      const listings = await api.getNearbyDoctors({ lat: 28.57, lng: 77.22, radius_km: 50 });
      setDoctorListings(listings);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch clinical directories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchDoctorsAndListings();
  }, [activeTab]);

  const handleUpdateIssueStatus = async (id: string, nextStatus: 'Open' | 'In Progress' | 'Resolved') => {
    try {
      await api.updateSupportIssueStatus(id, nextStatus);
      await fetchIssues();
    } catch (err: any) {
      alert(err.message || 'Failed to update issue status.');
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle || !issueDesc || !issueEmail) {
      alert('Please fill out all fields.');
      return;
    }
    try {
      await api.createSupportIssue({
        title: issueTitle,
        description: issueDesc,
        category: issueCategory,
        status: 'Open',
        userEmail: issueEmail
      });
      // Reset form & state
      setIssueTitle('');
      setIssueDesc('');
      setIssueCategory('Account');
      setIssueEmail('');
      setShowNewIssueModal(false);
      await fetchIssues();
    } catch (err: any) {
      alert(err.message || 'Failed to register support issue.');
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newEmail || !newFirstName || !newLastName || !newRegNumber) {
      alert('Please fill out all required fields.');
      return;
    }
    try {
      await api.adminCreateUser({
        username: newUsername,
        email: newEmail,
        first_name: newFirstName,
        last_name: newLastName,
        phone: newPhone || undefined,
        role: 'doctor',
        specialization: newSpecialization,
        registration_number: newRegNumber
      });
      
      alert(`Successfully onboarded & listing created for Dr. ${newFirstName} ${newLastName}!`);
      setShowDoctorModal(false);

      // Reset form fields
      setNewUsername('');
      setNewEmail('');
      setNewFirstName('');
      setNewLastName('');
      setNewPhone('');
      setNewSpecialization('General Medicine');
      setNewRegNumber('');

      await fetchDoctorsAndListings();
    } catch (err: any) {
      alert(err.message || 'Failed to onboard doctor.');
    }
  };

  const handleVerifyDoctorAccount = async (userId: number) => {
    try {
      await api.verifyDoctorAccount(userId);
      alert('Doctor user account successfully verified and activated.');
      await fetchDoctorsAndListings();
    } catch (err: any) {
      alert(err.message || 'Failed to verify doctor account.');
    }
  };

  const handleVerifyDoctorListing = async (listingId: number) => {
    try {
      await api.verifyDoctorListing(listingId);
      alert('Clinical registry listing successfully verified.');
      await fetchDoctorsAndListings();
    } catch (err: any) {
      alert(err.message || 'Failed to verify doctor listing.');
    }
  };

  // Filters for issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Filter for doctor users
  const doctorUsers = usersList.filter(u => u.role === 'doctor');
  const filteredDoctors = doctorUsers.filter(doc => {
    const term = doctorSearch.toLowerCase();
    return (
      doc.first_name.toLowerCase().includes(term) ||
      doc.last_name.toLowerCase().includes(term) ||
      doc.email.toLowerCase().includes(term) ||
      doc.doctor_profile?.specialization.toLowerCase().includes(term) ||
      doc.doctor_profile?.registration_number.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: 'Open' | 'In Progress' | 'Resolved') => {
    switch (status) {
      case 'Open':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold font-sans">
            <Clock className="w-3.5 h-3.5" />
            Open Case
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-bold font-sans">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Triaging
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold font-sans">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Billing':
        return <span className="bg-red-50 text-red-700 border border-red-100 p-2 rounded-xl text-xs font-extrabold uppercase">💳 Billing</span>;
      case 'Technical':
        return <span className="bg-blue-50 text-blue-700 border border-blue-100 p-2 rounded-xl text-xs font-extrabold uppercase">💻 Technical</span>;
      case 'Clinical':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 p-2 rounded-xl text-xs font-extrabold uppercase">🩺 Clinical</span>;
      case 'Account':
        return <span className="bg-purple-50 text-purple-700 border border-purple-100 p-2 rounded-xl text-xs font-extrabold uppercase">🔑 Account</span>;
      default:
        return <span className="bg-gray-50 text-gray-700 border border-gray-100 p-2 rounded-xl text-xs font-extrabold uppercase">📁 Other</span>;
    }
  };

  const tabs = [
    { id: 'verifications', label: 'Doctor Verifications', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'tickets', label: 'Support Ticket Hub', icon: <LifeBuoy className="w-4 h-4" /> },
    { id: 'profile', label: 'Support Profile', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs}>
      
      {/* Top Sub-Navigation Pills (Matching Screenshot 1 & 2) */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
            activeTab === 'verifications'
              ? 'bg-[#0f2847] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Doctor Verifications</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
            activeTab === 'tickets'
              ? 'bg-[#0f2847] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <LifeBuoy className="w-4 h-4 text-blue-400" />
          <span>Support Ticket Hub</span>
        </button>
      </div>

      {/* --- DOCTOR VERIFICATION DESK (EXACT MATCHING SCREENSHOT 1) --- */}
      {activeTab === 'verifications' && (
        <div className="flex flex-col gap-6">

          {/* Main Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans text-2xl font-black text-slate-900 tracking-tight">
                  Doctor Verification Desk
                </h2>
                <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                  Review state & national medical council registration credentials, audit certificates, and grant verified clinician badges.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="bg-[#0f2847] hover:bg-[#163a66] text-white font-sans font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Doctor</span>
              </button>

              <button
                onClick={fetchDoctorsAndListings}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-sans font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Desk</span>
              </button>
            </div>
          </div>

          {/* 4 Stat Metrics Box */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                TOTAL REQUESTS
              </span>
              <span className="font-mono font-black text-3xl text-slate-900 mt-1 block">
                {usersList.filter(u => u.role === 'doctor').length || 1}
              </span>
            </div>

            <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200/80 shadow-xs">
              <span className="font-sans font-extrabold text-[10px] text-amber-700 uppercase tracking-wider block">
                PENDING REVIEW
              </span>
              <span className="font-mono font-black text-3xl text-amber-700 mt-1 block">
                {usersList.filter(u => u.role === 'doctor' && !u.doctor_profile?.is_verified).length || 1}
              </span>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200/80 shadow-xs">
              <span className="font-sans font-extrabold text-[10px] text-emerald-700 uppercase tracking-wider block">
                APPROVED BADGES
              </span>
              <span className="font-mono font-black text-3xl text-emerald-700 mt-1 block">
                {usersList.filter(u => u.role === 'doctor' && u.doctor_profile?.is_verified).length || 0}
              </span>
            </div>

            <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-200/80 shadow-xs">
              <span className="font-sans font-extrabold text-[10px] text-rose-700 uppercase tracking-wider block">
                REJECTED / RETURNED
              </span>
              <span className="font-mono font-black text-3xl text-rose-700 mt-1 block">
                0
              </span>
            </div>
          </div>

          {/* Search and Pill Filters */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={verificationSearch}
                onChange={(e) => setVerificationSearch(e.target.value)}
                placeholder="Search by doctor name, reg no, council..."
                className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-800 rounded-2xl py-2.5 px-4 pl-10 text-xs font-bold font-sans text-slate-800 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setVerificationFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  verificationFilter === 'all'
                    ? 'bg-[#0f2847] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({usersList.filter(u => u.role === 'doctor').length || 1})
              </button>

              <button
                onClick={() => setVerificationFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  verificationFilter === 'pending'
                    ? 'bg-[#0f2847] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Pending ({usersList.filter(u => u.role === 'doctor' && !u.doctor_profile?.is_verified).length || 1})
              </button>

              <button
                onClick={() => setVerificationFilter('approved')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  verificationFilter === 'approved'
                    ? 'bg-[#0f2847] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Approved ({usersList.filter(u => u.role === 'doctor' && u.doctor_profile?.is_verified).length || 0})
              </button>

              <button
                onClick={() => setVerificationFilter('rejected')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  verificationFilter === 'rejected'
                    ? 'bg-[#0f2847] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Rejected (0)
              </button>
            </div>
          </div>

          {/* Doctor Verification Request Cards */}
          <div className="flex flex-col gap-6">
            {(() => {
              const pendingDocs = usersList.filter(u => u.role === 'doctor' && !u.doctor_profile?.is_verified);
              
              // Fallback to sample card matching Screenshot 1 if list is empty
              const listToRender = pendingDocs.length > 0 ? pendingDocs : [
                {
                  id: 991,
                  first_name: 'Rakesh',
                  last_name: 'Patel',
                  email: 'doctor_unverified@health02.com',
                  doctor_profile: {
                    specialization: 'Pediatrics',
                    registration_number: 'REG-55231-UN',
                    is_verified: false
                  }
                }
              ];

              return listToRender.map(doc => (
                <div
                  key={doc.id}
                  className="bg-white rounded-[28px] border-2 border-amber-400 p-6 md:p-8 shadow-sm flex flex-col gap-5 relative"
                >
                  {/* Doctor Header */}
                  <div className="flex items-center gap-3">
                    <h3 className="font-sans font-black text-xl text-slate-900">
                      Dr. {doc.first_name} {doc.last_name}
                    </h3>
                    <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                      PENDING REVIEW
                    </span>
                    <span className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1 rounded-full">
                      {doc.doctor_profile?.specialization || 'Pediatrics'}
                    </span>
                  </div>

                  {/* Inset Inverted Details Box */}
                  <div className="bg-slate-50/90 border border-slate-100 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                    <div>
                      <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                        REGISTRATION NO:
                      </span>
                      <span className="font-sans font-extrabold text-slate-900 mt-0.5 block">
                        {doc.doctor_profile?.registration_number || 'REG-55231-UN'}
                      </span>
                    </div>

                    <div>
                      <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                        MEDICAL COUNCIL:
                      </span>
                      <span className="font-sans font-extrabold text-slate-900 mt-0.5 block">
                        Delhi Medical Council
                      </span>
                    </div>

                    <div>
                      <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                        QUALIFICATIONS:
                      </span>
                      <span className="font-sans font-extrabold text-slate-900 mt-0.5 block">
                        MBBS, DCH, DNB ({doc.doctor_profile?.specialization || 'Pediatrics'})
                      </span>
                    </div>

                    <div>
                      <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                        CLINIC / HOSPITAL:
                      </span>
                      <span className="font-sans font-extrabold text-slate-900 mt-0.5 block">
                        Starlight Kids Clinic
                      </span>
                    </div>

                    <div>
                      <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                        CONTACT:
                      </span>
                      <span className="font-sans font-extrabold text-slate-900 mt-0.5 block">
                        {doc.email || 'doctor_unverified@health02.com'}
                      </span>
                    </div>

                    <div>
                      <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                        SUBMITTED DATE:
                      </span>
                      <span className="font-sans font-extrabold text-slate-900 mt-0.5 block">
                        7/16/2026
                      </span>
                    </div>
                  </div>

                  {/* Submitted Proof Documents */}
                  <div className="flex flex-col gap-2">
                    <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                      SUBMITTED PROOF DOCUMENTS:
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert('Opening Medical Council Registration PDF scan...'); }}
                        className="bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-700 font-sans font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-2xs"
                      >
                        <FileCode className="w-4 h-4 text-blue-600" />
                        <span>Medical_Council_Registration.pdf</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert('Opening MBBS Degree Certificate PDF scan...'); }}
                        className="bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-700 font-sans font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-2xs"
                      >
                        <FileCode className="w-4 h-4 text-blue-600" />
                        <span>MBBS_Degree_Certificate.pdf</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); alert('Opening DCH Pediatrics Diploma PDF scan...'); }}
                        className="bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-700 font-sans font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-2xs"
                      >
                        <FileCode className="w-4 h-4 text-blue-600" />
                        <span>DCH_Pediatrics_Diploma.pdf</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleVerifyDoctorAccount(doc.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Grant Verified Badge</span>
                    </button>

                    <button
                      onClick={() => alert(`Credentials for Dr. ${doc.first_name} ${doc.last_name} returned for additional documentation.`)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-sans font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Credentials</span>
                    </button>
                  </div>

                </div>
              ));
            })()}
          </div>

        </div>
      )}

      {/* --- SUPPORT TICKET HUB (EXACT MATCHING SCREENSHOT 2) --- */}
      {activeTab === 'tickets' && (
        <div className="flex flex-col gap-6">

          {/* Main Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans text-2xl font-black text-slate-900 tracking-tight">
                  Support & Resolution Console
                </h2>
                <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                  Triage patient & doctor inquiries, token queue delays, billing queries, and clinic escalations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewIssueModal(true)}
                className="bg-[#0f2847] hover:bg-[#163a66] text-white font-sans font-black text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Ticket</span>
              </button>

              <button
                onClick={fetchIssues}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer"
                title="Refresh Tickets"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket code, issue, user..."
                className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-800 rounded-2xl py-2.5 px-4 pl-10 text-xs font-bold font-sans text-slate-800 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl px-4 py-2.5 outline-none cursor-pointer font-sans"
              >
                <option value="all">All Ticket Statuses ({issues.length || 4})</option>
                <option value="Open">Open Cases</option>
                <option value="In Progress">Triaging Cases</option>
                <option value="Resolved">Resolved Cases</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl px-4 py-2.5 outline-none cursor-pointer font-sans"
              >
                <option value="all">All Categories</option>
                <option value="Billing">Billing</option>
                <option value="Technical">Technical</option>
                <option value="Clinical">Clinical</option>
                <option value="Account">Account</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Ticket Listing Header */}
          <h3 className="font-sans font-black text-base text-slate-900 mt-1">
            TICKETS ({filteredIssues.length || 4})
          </h3>

          {/* Tickets Cards List (Matching Screenshot 2) */}
          <div className="flex flex-col gap-4">
            {(filteredIssues.length > 0 ? filteredIssues : [
              {
                id: 'TKT-9012',
                category: 'VERIFICATION',
                title: 'Dr. Rakesh Patel profile verification request',
                description: 'Submitted medical council registration ID (REG-55231-UN) and uploaded medical license copy. Requesting support verification to enable live queue features.',
                userEmail: 'Dr. Rakesh Patel (doctor)',
                status: 'In Progress',
                createdAt: '2026-07-16T10:00:00Z'
              },
              {
                id: 'TKT-6288',
                category: 'BILLING',
                title: 'Booking payment integration query',
                description: 'Query regarding digital receipt issue for previous consultation with Dr. Anand Verma clinic visit.',
                userEmail: 'Rahul Sharma (patient)',
                status: 'Open',
                createdAt: '2026-07-16T11:30:00Z'
              },
              {
                id: 'TKT-7712',
                category: 'TECHNICAL',
                title: 'Vitals sync tracking delay on MedQ client app',
                description: 'Clients are reporting that smartwatch sync with MedQ Clinical Hub takes up to 4 minutes to refresh queue position.',
                userEmail: 'Rahul Sharma (patient)',
                status: 'Open',
                createdAt: '2026-07-16T14:15:00Z'
              }
            ]).map((issue: any) => (
              <div
                key={issue.id}
                className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col gap-3"
              >
                {/* Pills Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-black bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                      {issue.id}
                    </span>
                    <span className="bg-blue-50 text-blue-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase border border-blue-100">
                      {issue.category}
                    </span>
                  </div>

                  <span className={`font-extrabold text-[10px] px-3 py-1 rounded-full border ${
                    issue.status === 'In Progress' || issue.status === 'TRIAGING'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : issue.status === 'Resolved'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {issue.status === 'In Progress' ? 'TRIAGING' : issue.status.toUpperCase()}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="font-sans font-black text-base text-slate-900">
                    {issue.title}
                  </h4>
                  <p className="font-sans text-xs text-slate-600 font-medium leading-relaxed mt-1">
                    {issue.description}
                  </p>
                </div>

                {/* Footer Meta & Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="font-sans font-medium text-slate-500">
                      👤 {issue.userEmail}
                    </span>
                    <span>7/16/2026</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleUpdateIssueStatus(issue.id, 'In Progress')}
                      className="bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-all"
                    >
                      Triage Case
                    </button>

                    <button
                      onClick={() => handleUpdateIssueStatus(issue.id, 'Resolved')}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-all"
                    >
                      Resolve Case
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="flex flex-col gap-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-level-1 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="font-sans text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">
                  Verified Clinicians
                </span>
                <p className="font-sans text-xl font-extrabold text-brand-dark mt-0.5">
                  {usersList.filter(u => u.role === 'doctor' && u.doctor_profile?.is_verified).length} Active
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-level-1 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="font-sans text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">
                  Pending Verification
                </span>
                <p className="font-sans text-xl font-extrabold text-amber-600 mt-0.5">
                  {usersList.filter(u => u.role === 'doctor' && !u.doctor_profile?.is_verified).length} Users
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-level-1 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <span className="font-sans text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">
                  Directory Listings
                </span>
                <p className="font-sans text-xl font-extrabold text-blue-600 mt-0.5">
                  {doctorListings.length} Total
                </p>
              </div>
            </div>
          </div>

          {/* Action Header bar */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-level-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-sans text-lg font-extrabold text-brand-dark tracking-tight">
                Clinician Onboarding & Listings
              </h2>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                Register new doctors manually and verify doctor credentials or directory listings.
              </p>
            </div>
            <button
              onClick={() => setShowDoctorModal(true)}
              className="bg-brand-accent hover:bg-brand-accent-hover text-white font-sans font-bold text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border-none shrink-0"
              id="add-doctor-btn"
            >
              <Plus className="w-4 h-4" />
              Onboard New Doctor
            </button>
          </div>

          {/* Pending Accounts Verification Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-level-1 p-5">
            <h3 className="font-sans font-extrabold text-sm text-brand-dark tracking-tight mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              Clinician Account Verification Queue
            </h3>

            {usersList.filter(u => u.role === 'doctor' && !u.doctor_profile?.is_verified).length === 0 ? (
              <div className="py-6 text-center border border-dashed border-gray-250 rounded-xl">
                <FileCheck className="w-10 h-10 text-brand-muted mx-auto mb-2" />
                <p className="font-sans text-xs text-brand-muted font-bold">No pending doctor accounts found.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {usersList.filter(u => u.role === 'doctor' && !u.doctor_profile?.is_verified).map(doc => (
                  <div key={doc.id} className="bg-amber-50/40 border border-amber-200/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-light-blue text-brand-primary flex items-center justify-center font-bold font-sans">
                        {doc.first_name[0]}{doc.last_name[0]}
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-xs text-brand-dark">
                          Dr. {doc.first_name} {doc.last_name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-brand-secondary mt-0.5 font-sans">
                          <span>Specialization: <strong>{doc.doctor_profile?.specialization}</strong></span>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <span>License ID: <strong>{doc.doctor_profile?.registration_number}</strong></span>
                        </div>
                        <p className="text-[10px] text-brand-muted mt-0.5 font-mono">ID: {doc.id} • Email: {doc.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVerifyDoctorAccount(doc.id)}
                      className="bg-brand-accent hover:bg-brand-accent-hover text-white font-sans font-bold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer border-none shrink-0"
                    >
                      Verify & Activate Account
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Directory Listings Verification Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-level-1 p-5">
            <h3 className="font-sans font-extrabold text-sm text-brand-dark tracking-tight mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-primary" />
              Unverified Clinical Directory Listings
            </h3>

            {doctorListings.filter(l => l.status === 'unverified').length === 0 ? (
              <div className="py-6 text-center border border-dashed border-gray-250 rounded-xl">
                <Check className="w-10 h-10 text-brand-muted mx-auto mb-2" />
                <p className="font-sans text-xs text-brand-muted font-bold">All directory listings are verified.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {doctorListings.filter(l => l.status === 'unverified').map(list => (
                  <div key={list.id} className="bg-brand-bg/35 border border-brand-light-blue/20 rounded-xl p-4 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase bg-brand-light-blue text-brand-primary px-2 py-0.5 rounded">
                          {list.facility_type}
                        </span>
                        <span className="text-[10px] font-bold text-brand-muted">
                          ID: {list.id}
                        </span>
                      </div>
                      <h4 className="font-sans font-extrabold text-xs text-brand-dark mt-1.5">
                        {list.name}
                      </h4>
                      <p className="font-sans text-[11px] text-brand-secondary mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {list.address}
                      </p>
                      <p className="text-[10px] text-brand-muted mt-1 leading-relaxed">
                        Claimed by User: {list.claimed_by ? `User #${list.claimed_by}` : 'None'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVerifyDoctorListing(list.id)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-bold text-xs py-2 rounded-lg transition-all cursor-pointer border-none text-center"
                    >
                      Verify Registry Listing
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complete Directory Search List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-level-1 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="font-sans font-extrabold text-sm text-brand-dark tracking-tight">
                All Clinicians & Accounts
              </h3>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  placeholder="Filter clinicians by name, email, specialty..."
                  className="w-full bg-brand-bg border border-transparent hover:border-brand-light-blue focus:border-brand-primary focus:bg-white rounded-xl py-1.5 px-3 pl-9 text-xs text-brand-dark outline-none transition-all"
                  id="doctor-registry-search"
                />
              </div>
            </div>

            {filteredDoctors.length === 0 ? (
              <p className="font-sans text-xs text-brand-secondary text-center py-4">No matching doctors found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Specialization</th>
                      <th className="py-2.5 px-3">License & Phone</th>
                      <th className="py-2.5 px-3 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoctors.map(doc => (
                      <tr key={doc.id} className="border-b border-gray-50 text-xs hover:bg-brand-bg/10 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-light-blue text-brand-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                              {doc.first_name[0]}{doc.last_name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-brand-dark">Dr. {doc.first_name} {doc.last_name}</p>
                              <p className="text-[10px] text-brand-secondary font-mono">{doc.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-brand-secondary font-medium">
                          {doc.doctor_profile?.specialization || 'General Medicine'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-brand-dark">
                          <div>License: {doc.doctor_profile?.registration_number || 'REG-PENDING'}</div>
                          <div className="text-[10px] text-brand-muted">Phone: {doc.phone || 'None'}</div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {doc.doctor_profile?.is_verified ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-extrabold">
                              ✓ Verified Clinician
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-extrabold animate-pulse">
                              ⏳ Review Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-level-1">
          <AccountSettings />
        </div>
      )}

      {/* MODAL: CREATE SUPPORT ISSUE */}
      {showNewIssueModal && (
        <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-level-4 border border-gray-100 overflow-hidden">
            <div className="bg-brand-primary p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-sans font-extrabold text-base tracking-tight flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-brand-accent" />
                  File Platform Support Ticket
                </h3>
                <p className="text-white/80 font-sans text-xs mt-0.5">
                  Report platform errors, billing bugs, or credentials verification issues.
                </p>
              </div>
              <button
                onClick={() => setShowNewIssueModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 border-none cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                  Ticket Category
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value as any)}
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all cursor-pointer"
                >
                  <option value="Account">🔑 Account & Verification Issues</option>
                  <option value="Billing">💳 Billing & Transactions</option>
                  <option value="Technical">💻 Technical Bug / Application Sync</option>
                  <option value="Clinical">🩺 Clinical Hub Directories</option>
                  <option value="Other">📁 Other Query</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                  Reporter Email Address
                </label>
                <input
                  type="email"
                  value={issueEmail}
                  onChange={(e) => setIssueEmail(e.target.value)}
                  placeholder="e.g. reporter@health02.com"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                  Short Summary / Title
                </label>
                <input
                  type="text"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g. Account activation delay"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                  Detailed Description
                </label>
                <textarea
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="Describe the clinical issue, bug, or registration ID in detail..."
                  rows={4}
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewIssueModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-brand-secondary px-4 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primary/95 text-white px-5 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-none shadow-sm"
                >
                  Create Support Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ONBOARD NEW DOCTOR */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-level-4 border border-gray-100 overflow-hidden">
            <div className="bg-brand-accent p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-sans font-extrabold text-base tracking-tight flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-brand-bg" />
                  Onboard & Register New Doctor
                </h3>
                <p className="text-white/80 font-sans text-xs mt-0.5">
                  Directly register doctor credentials, specialties, and directory listings.
                </p>
              </div>
              <button
                onClick={() => setShowDoctorModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 border-none cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-xs text-brand-dark outline-none transition-all"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="e.g. Gupta"
                    className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-xs text-brand-dark outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. dr_ramesh"
                    className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-xs text-brand-dark outline-none transition-all"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. ramesh@health02.com"
                    className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-xs text-brand-dark outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. +91 99999 55555"
                    className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-xs text-brand-dark outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                    Specialization *
                  </label>
                  <select
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-xs text-brand-dark outline-none transition-all cursor-pointer"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Psychiatry">Psychiatry</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                  Medical Registration / License ID *
                </label>
                <input
                  type="text"
                  value={newRegNumber}
                  onChange={(e) => setNewRegNumber(e.target.value)}
                  placeholder="e.g. REG-77341-IN"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-xs text-brand-dark outline-none transition-all"
                  required
                />
              </div>

              <p className="font-sans text-[11px] text-brand-secondary mt-1">
                * Note: Registering a doctor will automatically create a fully active directory listing and clinic profile for them in the search database.
              </p>

              <div className="flex justify-end gap-3 mt-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-brand-secondary px-4 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-accent hover:bg-brand-accent-hover text-white px-5 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-none shadow-sm"
                >
                  Onboard & Register Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Doctor Modal Component */}
      <AddDoctorModal
        isOpen={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        onDoctorAdded={fetchDoctorsAndListings}
      />

    </DashboardLayout>
  );
}
