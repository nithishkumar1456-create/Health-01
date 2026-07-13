import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DoctorListing, Article, User } from '../types';
import DashboardLayout from './DashboardLayout';
import AccountSettings from './AccountSettings';
import { 
  Shield, 
  Users, 
  FileText, 
  Search, 
  SlidersHorizontal, 
  CheckCircle, 
  Trash2, 
  AlertTriangle, 
  Plus, 
  X, 
  Eye, 
  Edit3, 
  MapPin, 
  IndianRupee,
  Activity,
  HeartPulse,
  BookOpen,
  UserPlus,
  User as UserIcon
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('queue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification lists state
  const [claimedListings, setClaimedListings] = useState<DoctorListing[]>([]);
  const [unverifiedDoctors, setUnverifiedDoctors] = useState<User[]>([]);

  // Directory moderation state
  const [directoryListings, setDirectoryListings] = useState<DoctorListing[]>([]);
  const [dirSearch, setDirSearch] = useState('');

  // Blog moderation state
  const [blogArticles, setBlogArticles] = useState<Article[]>([]);
  const [blogSearch, setBlogSearch] = useState('');

  // Admin Article Composer
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('published');

  // User Accounts state variables
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);

  // Form states for manual user creation
  const [newUserRole, setNewUserRole] = useState<'client' | 'doctor' | 'admin'>('client');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('General Medicine');
  const [newRegNumber, setNewRegNumber] = useState('');

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchVerificationQueues();
    } else if (activeTab === 'directory') {
      fetchDirectory();
    } else if (activeTab === 'blog') {
      fetchBlogArticles();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchVerificationQueues = async () => {
    setLoading(true);
    setError(null);
    
    // 1. Fetch claimed listings (expected to 404/fail until directory service is added)
    try {
      const list = await api.getNearbyDoctors({ lat: 28.57, lng: 77.22, radius_km: 25 });
      setClaimedListings(list.filter(d => d.status === 'unverified' && d.claimed_by !== null));
    } catch (err: any) {
      console.warn("Claimed listings API is currently unavailable (known gap):", err);
      setClaimedListings([]);
    }

    // 2. Fetch unverified doctor accounts from backend
    try {
      const unverifiedDocs = await api.getAllUsers({ role: 'doctor', verified: false });
      setUnverifiedDoctors(unverifiedDocs);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve administrative doctor queue.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectory = async () => {
    setLoading(true);
    setError(null);
    try {
      /* 
         ADMIN NOTE:
         In production, we would want a `/api/doctors/nearby/` with radius_km omitted or a custom `/api/doctors/` 
         admin moderator listing endpoint. We query with a large radius to simulate comprehensive coverage.
      */
      const list = await api.getNearbyDoctors({ lat: 28.57, lng: 77.22, radius_km: 50 });
      setDirectoryListings(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      // Admins fetch ALL blog articles (published and drafts by anyone)
      const res = await api.getArticles();
      setBlogArticles(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load journal listings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getAllUsers();
      setUsersList(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load user directories.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.adminCreateUser({
        username: newUsername,
        email: newEmail,
        first_name: newFirstName,
        last_name: newLastName,
        phone: newPhone || undefined,
        role: newUserRole,
        specialization: newUserRole === 'doctor' ? newSpecialization : undefined,
        registration_number: newUserRole === 'doctor' ? newRegNumber : undefined
      });
      alert(`Successfully registered manually created ${newUserRole}!`);
      setShowUserModal(false);
      
      // Reset form
      setNewUsername('');
      setNewEmail('');
      setNewFirstName('');
      setNewLastName('');
      setNewPhone('');
      setNewSpecialization('General Medicine');
      setNewRegNumber('');
      
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to manually add user.');
    }
  };

  // VERIFICATION ACTIONS
  const handleVerifyAccount = async (userId: number) => {
    setError(null);
    try {
      await api.verifyDoctorAccount(userId);
      alert('Doctor credentials verified successfully!');
      fetchVerificationQueues();
    } catch (err: any) {
      setError(err.message || 'Failed to verify account.');
    }
  };

  const handleVerifyListing = async (listingId: number) => {
    setError(null);
    try {
      await api.verifyDoctorListing(listingId);
      alert('Clinical directory listing verified successfully!');
      fetchVerificationQueues();
    } catch (err: any) {
      setError(err.message || 'Failed to verify listing.');
    }
  };

  // DELETION MODERATIONS
  const handleDeleteListing = async (id: number) => {
    if (!confirm('Are you sure you want to delete this directory listing? This action is irreversible.')) return;
    try {
      await api.deleteDoctorListing(id);
      fetchDirectory();
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing.');
    }
  };

  const handleDeleteArticle = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.deleteArticle(slug);
      fetchBlogArticles();
    } catch (err: any) {
      alert(err.message || 'Failed to delete article.');
    }
  };

  // ADMIN ARTICLE COMPOSER
  const openNewEditor = () => {
    setEditingArticle(null);
    setFormTitle('');
    setFormSummary('');
    setFormContent('');
    setFormCoverUrl('');
    setFormTags('Wellness, Editorial');
    setFormStatus('published');
    setShowEditor(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSummary || !formContent) {
      alert('Please fill out all required fields.');
      return;
    }

    const tagsArr = formTags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      await api.createArticle({
        title: formTitle,
        summary: formSummary,
        content: formContent,
        cover_image_url: formCoverUrl || undefined,
        tags: tagsArr,
        status: formStatus
      });
      setShowEditor(false);
      fetchBlogArticles();
    } catch (err: any) {
      alert(err.message || 'Failed to save article.');
    }
  };

  const adminTabs = [
    { id: 'queue', label: 'Verification Queue', icon: <Shield className="w-4 h-4" /> },
    { id: 'directory', label: 'Directory Moderation', icon: <Users className="w-4 h-4" /> },
    { id: 'blog', label: 'Blog Moderation', icon: <FileText className="w-4 h-4" /> },
    { id: 'users', label: 'User Directory', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'profile', label: 'My Account', icon: <UserIcon className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} tabs={adminTabs}>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs flex gap-2 items-start">
          <Activity className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* --- VERIFICATION QUEUES TAB --- */}
      {activeTab === 'queue' && (
        <div className="flex flex-col gap-6">
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-level-2">
            <h2 className="font-sans text-xl font-extrabold text-brand-dark tracking-tight">
              Clinical Verification Queue
            </h2>
            <p className="font-sans text-xs text-brand-secondary mt-0.5">
              Approve pending doctor account registrations and claimed OpenStreetMap clinical directory listings.
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="font-sans text-xs text-brand-secondary">Compiling verification lists...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              
              {/* Doctor Registrations */}
              <div className="flex flex-col gap-3">
                <h3 className="font-sans font-extrabold text-sm text-brand-dark tracking-tight">
                  Doctor Account Registrations ({unverifiedDoctors.length})
                </h3>

                {unverifiedDoctors.length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl text-center border border-gray-100 text-xs text-brand-muted">
                    No doctor accounts awaiting licensing review.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unverifiedDoctors.map((doc) => (
                      <div key={doc.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-level-2 flex flex-col justify-between gap-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-sans font-extrabold text-base text-brand-dark tracking-tight">
                            Dr. {doc.first_name} {doc.last_name}
                          </span>
                          <p className="font-sans text-xs text-brand-secondary font-semibold">
                            Specialty: {doc.doctor_profile?.specialization}
                          </p>
                          <p className="font-sans text-xs text-brand-muted">
                            Licensing ID: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px]">{doc.doctor_profile?.registration_number}</code>
                          </p>
                        </div>

                        <button
                          onClick={() => handleVerifyAccount(doc.id)}
                          className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Verify & Activate License
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Claimed Directory Listings */}
              <div className="flex flex-col gap-3">
                <h3 className="font-sans font-extrabold text-sm text-brand-dark tracking-tight">
                  Claimed Directory Listings ({claimedListings.length})
                </h3>

                {claimedListings.length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl text-center border border-gray-100 text-xs text-brand-muted">
                    No claimed directory listings awaiting verification.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {claimedListings.map((listing) => (
                      <div key={listing.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-level-2 flex flex-col justify-between gap-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-sans font-extrabold text-base text-brand-dark tracking-tight">
                            {listing.name}
                          </span>
                          <p className="font-sans text-xs text-brand-primary font-semibold">
                            {listing.specialization} • {listing.facility_type}
                          </p>
                          <p className="font-sans text-xs text-brand-secondary">
                            Address: {listing.address}
                          </p>
                          <span className="font-sans text-[11px] text-teal-700 font-bold">
                            Claimed by User ID: #{listing.claimed_by}
                          </span>
                        </div>

                        <button
                          onClick={() => handleVerifyListing(listing.id)}
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve Directory Listing
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* --- DIRECTORY MODERATION TAB --- */}
      {activeTab === 'directory' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-level-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-sans text-xl font-extrabold text-brand-dark tracking-tight">
                Clinical Directory Moderation
              </h2>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                Browse and remove invalid or duplicate clinic listings.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-level-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted" />
              <input
                type="text"
                value={dirSearch}
                onChange={(e) => setDirSearch(e.target.value)}
                placeholder="Search by facility name, address, or specialization..."
                className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 pl-11 pr-4 font-sans text-sm text-brand-dark outline-none transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="font-sans text-xs text-brand-secondary">Scanning databases...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {directoryListings
                .filter(d => d.name.toLowerCase().includes(dirSearch.toLowerCase()) || d.address.toLowerCase().includes(dirSearch.toLowerCase()))
                .map((doc) => (
                  <div key={doc.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-level-2 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-sans font-extrabold text-base text-brand-dark tracking-tight">
                          {doc.name}
                        </span>
                        {doc.status === 'verified' ? (
                          <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full text-[9px] font-bold">
                            VERIFIED
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full text-[9px] font-bold">
                            UNVERIFIED
                          </span>
                        )}
                      </div>

                      <p className="font-sans text-xs font-bold text-brand-primary">
                        {doc.specialization} • {doc.facility_type}
                      </p>
                      
                      <p className="font-sans text-xs text-brand-secondary mt-1 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                        <span>{doc.address}</span>
                      </p>
                    </div>

                    <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                      <span className="font-sans text-[11px] text-brand-muted">
                        Phone: {doc.phone}
                      </span>

                      <button
                        onClick={() => handleDeleteListing(doc.id)}
                        className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

        </div>
      )}

      {/* --- BLOG JOURNAL MODERATION TAB --- */}
      {activeTab === 'blog' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-level-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-sans text-xl font-extrabold text-brand-dark tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-primary" />
                Blog Moderation Board
              </h2>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                See drafts and published health articles by any practitioner.
              </p>
            </div>

            <button
              onClick={openNewEditor}
              className="bg-brand-primary hover:bg-brand-primary/95 text-white px-4 py-2.5 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              Compose Admin Article
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-level-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted" />
              <input
                type="text"
                value={blogSearch}
                onChange={(e) => setBlogSearch(e.target.value)}
                placeholder="Search articles by title, tags or author name..."
                className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 pl-11 pr-4 font-sans text-sm text-brand-dark outline-none transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="font-sans text-xs text-brand-secondary">Retrieving full publication archives...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogArticles
                .filter(a => a.title.toLowerCase().includes(blogSearch.toLowerCase()) || a.author.first_name.toLowerCase().includes(blogSearch.toLowerCase()))
                .map((art) => (
                  <div key={art.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-level-2 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        {art.status === 'published' ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[9px] font-bold">
                            PUBLISHED
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full text-[9px] font-bold">
                            DRAFT
                          </span>
                        )}
                        <span className="font-sans text-[10px] text-brand-muted font-bold uppercase">
                          BY DR. {art.author.first_name} {art.author.last_name}
                        </span>
                      </div>

                      <h3 className="font-sans font-extrabold text-base text-brand-dark tracking-tight leading-snug">
                        {art.title}
                      </h3>

                      <p className="font-sans text-xs text-brand-secondary line-clamp-2">
                        {art.summary}
                      </p>
                    </div>

                    <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                      <div className="flex gap-1">
                        {art.tags.slice(0, 2).map(t => (
                          <span key={t} className="bg-brand-bg text-brand-secondary px-2 py-0.5 rounded text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleDeleteArticle(art.slug)}
                        className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

        </div>
      )}

      {/* --- MODAL ARTICLE EDITOR --- */}
      {showEditor && (
        <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-level-3 border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-sans font-extrabold text-base text-brand-dark tracking-tight">
                Compose Admin Editorial Article
              </h3>
              <button
                onClick={() => setShowEditor(false)}
                className="p-1.5 rounded-full hover:bg-brand-bg text-brand-secondary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Scroll Container */}
            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto flex-grow flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Health Updates from the System Admin Office"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                  Brief Summary / Abstract *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="A concise summary of the updates shared in this administrative notice."
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formCoverUrl}
                  onChange={(e) => setFormCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Editorial, Clinic Updates"
                    className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                    Article Status / Visibility
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'draft' | 'published')}
                    className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3 font-sans text-sm text-brand-dark outline-none transition-all"
                  >
                    <option value="draft">Save as Draft (Private)</option>
                    <option value="published">Publish (Public View)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-grow">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                  Main Body Content *
                </label>
                <textarea
                  required
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Provide your administrative review or update here..."
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 font-sans text-sm text-brand-dark outline-none transition-all resize-y min-h-[160px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end border-t border-gray-55 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="bg-brand-bg hover:bg-brand-light-blue/50 text-brand-secondary px-5 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primary/95 text-white px-6 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Save Publication
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-level-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-sans text-xl font-extrabold text-brand-dark tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-primary" />
                User Account Management
              </h2>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                Browse all registered practitioner, administrative, and client accounts, or register new ones.
              </p>
            </div>

            <button
              onClick={() => {
                setNewUserRole('client');
                setShowUserModal(true);
              }}
              className="bg-brand-primary hover:bg-brand-primary/95 text-white px-4 py-2.5 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              Add New User Account
            </button>
          </div>

          {/* Search Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-brand-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                placeholder="Search users by name, email, or username..."
                className="w-full bg-white border border-gray-100 focus:border-brand-primary rounded-xl py-2.5 pl-10 pr-4 font-sans text-xs text-brand-dark outline-none shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Users List Grid */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="font-sans text-xs text-brand-secondary">Retrieving user accounts...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-level-1 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-brand-bg/50 text-[10px] uppercase font-bold text-brand-secondary font-sans tracking-wider">
                      <th className="py-4 px-6">User</th>
                      <th className="py-4 px-6">Contact / Email</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Specialty / Reg No</th>
                      <th className="py-4 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-sans text-xs">
                    {usersList
                      .filter(u => {
                        const q = usersSearch.toLowerCase();
                        return (
                          u.username.toLowerCase().includes(q) ||
                          u.email.toLowerCase().includes(q) ||
                          `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
                          u.role.toLowerCase().includes(q)
                        );
                      })
                      .map((u) => {
                        return (
                          <tr key={u.id} className="hover:bg-brand-bg/25 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-brand-light-blue text-brand-primary font-bold flex items-center justify-center shrink-0">
                                  {u.first_name[0]}{u.last_name[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-brand-dark">{u.first_name} {u.last_name}</p>
                                  <p className="text-[10px] text-brand-muted font-mono">@{u.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-brand-dark">{u.email}</p>
                              <p className="text-[10px] text-brand-secondary">{u.phone || 'N/A'}</p>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold font-sans ${
                                u.role === 'admin'
                                  ? 'bg-amber-100 text-amber-800'
                                  : u.role === 'doctor'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}>
                                {u.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {u.role === 'doctor' ? (
                                <div>
                                  <p className="text-brand-dark font-medium">{u.doctor_profile?.specialization}</p>
                                  <p className="text-[10px] font-mono text-brand-secondary">{u.doctor_profile?.registration_number}</p>
                                </div>
                              ) : (
                                <span className="text-brand-muted">-</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- ADD USER MODAL PANEL --- */}
      {showUserModal && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-sans font-extrabold text-base text-brand-dark tracking-tight flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-primary" />
                Register New User Account
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-secondary hover:text-brand-dark transition-all cursor-pointer border-none bg-transparent outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                  Account Role / Access Permission *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['client', 'doctor', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setNewUserRole(role)}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold font-sans transition-all capitalize ${
                        newUserRole === role
                          ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                          : 'bg-brand-bg border-transparent text-brand-secondary hover:bg-brand-light-blue/20 hover:text-brand-dark'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="e.g. Anand"
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
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="e.g. Verma"
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
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. anand_verma@gmail.com"
                  className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                    Choose Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. dr_anand"
                    className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                    Telephone / Mobile
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                  />
                </div>
              </div>

              {newUserRole === 'doctor' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-brand-bg rounded-2xl border border-gray-100 animate-in slide-in-from-top-4 duration-200">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                      Medical Specialty *
                    </label>
                    <select
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-brand-primary rounded-xl py-2.5 px-3 font-sans text-xs text-brand-dark outline-none"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Oncology">Oncology</option>
                      <option value="Neurology">Neurology</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans font-bold text-[10px] text-brand-secondary uppercase tracking-wider">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      required={newUserRole === 'doctor'}
                      value={newRegNumber}
                      onChange={(e) => setNewRegNumber(e.target.value)}
                      placeholder="e.g. REG-4491-DEL"
                      className="w-full bg-white border border-gray-200 focus:border-brand-primary rounded-xl py-2.5 px-4 font-sans text-sm text-brand-dark outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <p className="text-[10px] text-brand-muted leading-relaxed">
                * Simulated notice: Manually registered accounts are auto-active and can be used to log in immediately with the specified email or username.
              </p>

              <div className="flex gap-2 justify-end border-t border-gray-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="bg-brand-bg hover:bg-brand-light-blue/50 text-brand-secondary px-5 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primary/95 text-white px-6 py-2.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer shadow-sm border-none"
                >
                  Create User Account
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <AccountSettings />
      )}

    </DashboardLayout>
  );
}
