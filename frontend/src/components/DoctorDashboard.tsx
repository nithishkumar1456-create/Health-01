import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DoctorListing, Article, User } from '../types';
import DashboardLayout from './DashboardLayout';
import AccountSettings from './AccountSettings';
import HealthJournal from './HealthJournal';
import { 
  Plus, 
  FileText, 
  Search, 
  SlidersHorizontal, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  X, 
  Eye, 
  BookOpen, 
  MapPin, 
  ChevronRight,
  Sparkles,
  CalendarDays,
  IndianRupee,
  Share2
} from 'lucide-react';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Doctor session state
  const [me, setMe] = useState<User | null>(null);

  // Directory claim search states
  const [claimSearch, setClaimSearch] = useState('');
  const [nearbyUnclaimed, setNearbyUnclaimed] = useState<DoctorListing[]>([]);
  const [claimLoading, setClaimLoading] = useState(false);

  // Article lists states
  const [myArticles, setMyArticles] = useState<Article[]>([]);
  
  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  
  // Article form inputs
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('draft');

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (activeTab === 'articles' && me) {
      fetchMyArticles();
    } else if (activeTab === 'claim') {
      fetchNearbyForClaim();
    }
  }, [activeTab, me]);

  const fetchSession = async () => {
    try {
      const u = await api.getCurrentUser();
      setMe(u);
    } catch (err: any) {
      setError('Failed to authenticate session.');
    }
  };

  const fetchMyArticles = async () => {
    if (!me) return;
    setLoading(true);
    try {
      const res = await api.getArticles({ author: me.id });
      setMyArticles(res);
    } catch (err: any) {
      setError('Could not retrieve your publications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyForClaim = async () => {
    setLoading(true);
    try {
      // Find nearby to let them claim theirs
      const res = await api.getNearbyDoctors({ lat: 28.57, lng: 77.22, radius_km: 15 });
      setNearbyUnclaimed(res);
    } catch (err: any) {
      setError('Failed to load listings for claiming.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id: number) => {
    setClaimLoading(true);
    setError(null);
    try {
      await api.claimDoctorListing(id);
      alert('Listing claimed successfully! It will now appear in your profile queue for administrative verification.');
      fetchNearbyForClaim();
      fetchSession();
    } catch (err: any) {
      setError(err.message || 'Listing claim failed.');
    } finally {
      setClaimLoading(false);
    }
  };

  const openNewEditor = () => {
    setEditingArticle(null);
    setFormTitle('');
    setFormSummary('');
    setFormContent('');
    setFormCoverUrl('');
    setFormTags('Wellness, Health');
    setFormStatus('draft');
    setShowEditor(true);
  };

  const openEditEditor = (art: Article) => {
    setEditingArticle(art);
    setFormTitle(art.title);
    setFormSummary(art.summary);
    setFormContent(art.content);
    setFormCoverUrl(art.cover_image_url || '');
    setFormTags(art.tags.join(', '));
    setFormStatus(art.status);
    setShowEditor(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSummary || !formContent) {
      alert('Please fill out all required article fields.');
      return;
    }

    const tagsArr = formTags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      if (editingArticle) {
        await api.updateArticle(editingArticle.slug, {
          title: formTitle,
          summary: formSummary,
          content: formContent,
          cover_image_url: formCoverUrl || undefined,
          tags: tagsArr,
          status: formStatus
        });
      } else {
        await api.createArticle({
          title: formTitle,
          summary: formSummary,
          content: formContent,
          cover_image_url: formCoverUrl || undefined,
          tags: tagsArr,
          status: formStatus
        });
      }
      setShowEditor(false);
      fetchMyArticles();
    } catch (err: any) {
      alert(err.message || 'Failed to save article.');
    }
  };

  const handleDeleteArticle = async (slug: string) => {
    if (!confirm('Are you absolutely sure you want to delete this article?')) return;
    try {
      await api.deleteArticle(slug);
      fetchMyArticles();
    } catch (err: any) {
      alert(err.message || 'Failed to delete article.');
    }
  };

  const doctorTabs = [
    { id: 'profile', label: 'My Account', icon: <Activity className="w-4 h-4" /> },
    { id: 'articles', label: 'My Articles', icon: <FileText className="w-4 h-4" /> },
    { id: 'blog', label: 'Health Journal', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'claim', label: 'Claim Clinic Listing', icon: <Search className="w-4 h-4" /> },
    { id: 'appointments', label: 'Clinic Schedule', icon: <Clock className="w-4 h-4" /> },
  ];

  const isVerified = me?.doctor_profile?.is_verified === true;

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} tabs={doctorTabs}>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs flex gap-2 items-start">
          <Activity className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* --- DOCTOR PROFILE VIEW --- */}
      {activeTab === 'profile' && me && (
        <div className="flex flex-col gap-6">
          
          {/* Welcome Banner */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-level-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-sans text-xl font-extrabold text-brand-dark tracking-tight">
                Welcome, Dr. {me.first_name} {me.last_name}
              </h2>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                Specialist in {me.doctor_profile?.specialization || 'General Medicine'}.
              </p>
            </div>

            <div>
              {isVerified ? (
                <div className="bg-teal-50 text-teal-800 border border-teal-200 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  Clinical Credentials Active & Verified
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Credentials Review Pending Approval
                </div>
              )}
            </div>
          </div>

          {/* Verification Warning Box */}
          {!isVerified && (
            <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200 text-xs text-amber-800 flex flex-col gap-2 shadow-sm">
              <span className="font-sans font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Administrative Credentials Audit In Progress
              </span>
              <p className="leading-relaxed">
                To prevent clinical identity fraud, some capabilities of your doctor account are locked until verified by an administrator:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-1 font-sans">
                <li>Creating and publishing health journal articles (New Article button is disabled).</li>
                <li>Receiving electronic booking request coordination lists.</li>
              </ul>
              <p className="font-sans font-semibold mt-1">
                License Registration: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">{me.doctor_profile?.registration_number}</code>
              </p>
            </div>
          )}

          {/* Credentials Card Details */}
          <AccountSettings />

        </div>
      )}

      {/* --- MY ARTICLES TAB --- */}
      {activeTab === 'articles' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-level-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-sans text-xl font-extrabold text-brand-dark tracking-tight">
                Health Journal Publications
              </h2>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                Manage your columns, reviews, and healthcare guides on our peer journal.
              </p>
            </div>

            {/* Gated New Article Button */}
            {isVerified ? (
              <button
                onClick={openNewEditor}
                className="bg-brand-primary hover:bg-brand-primary/95 text-white px-4 py-2.5 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                Write New Article
              </button>
            ) : (
              <div className="bg-gray-100 border border-gray-200 text-gray-400 px-4 py-2.5 rounded-xl font-sans text-xs font-bold select-none cursor-not-allowed text-center" title="Get verified by an admin to publish articles">
                Write New Article (Gated)
              </div>
            )}
          </div>

          {/* List of articles */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100">
              <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="font-sans text-xs text-brand-secondary">Retrieving your portfolio...</p>
            </div>
          ) : myArticles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
              <div className="p-4 bg-brand-bg rounded-full text-brand-secondary">
                <FileText className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-brand-dark">No Articles Authored</h4>
                {isVerified ? (
                  <p className="font-sans text-xs text-brand-muted mt-1 max-w-sm mx-auto">
                    You have not written any wellness or medical columns yet. Click the "Write New Article" button above to publish your first draft!
                  </p>
                ) : (
                  <p className="font-sans text-xs text-amber-700/80 mt-1 max-w-sm mx-auto font-medium">
                    Please await system administrative license verification. Once verified, you will be authorized to publish medical advice and wellness articles.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myArticles.map((art) => (
                <div 
                  key={art.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-level-2 hover:border-brand-primary/10 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-2 items-center flex-wrap">
                        {art.status === 'published' ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase">
                            Published
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase">
                            Draft
                          </span>
                        )}
                        <span className="font-sans text-[10px] text-brand-muted">
                          {new Date(art.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      
                      <h3 className="font-sans font-extrabold text-base text-brand-dark tracking-tight leading-snug">
                        {art.title}
                      </h3>
                      
                      <p className="font-sans text-xs text-brand-secondary line-clamp-2">
                        {art.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {art.tags.slice(0, 2).map(t => (
                        <span key={t} className="bg-brand-bg text-brand-secondary px-2 py-0.5 rounded-md text-[10px] font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditEditor(art)}
                        className="p-2 text-brand-primary bg-brand-light-blue/40 hover:bg-brand-primary hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(art.slug)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- CLAIM CLINIC LISTING TAB --- */}
      {activeTab === 'claim' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-level-2">
            <h2 className="font-sans text-xl font-extrabold text-brand-dark tracking-tight">
              Claim Your OpenStreetMap Registry
            </h2>
            <p className="font-sans text-xs text-brand-secondary mt-0.5">
              Found your clinic or hospital in our nearby directory search? Claim it to connect your personal doctor profile!
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-level-2 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-muted" />
              <input
                type="text"
                value={claimSearch}
                onChange={(e) => setClaimSearch(e.target.value)}
                placeholder="Search by facility name or specialty..."
                className="w-full bg-brand-bg border border-transparent focus:border-brand-primary focus:bg-white rounded-xl py-2.5 pl-11 pr-4 font-sans text-sm text-brand-dark outline-none transition-all"
              />
            </div>
          </div>

          {/* Directory candidates */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-extrabold text-sm text-brand-dark tracking-tight">
              Nearby Clinic Registries Matching Your Range
            </h3>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100">
                <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="font-sans text-xs text-brand-secondary">Locating unclaimed facilities...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nearbyUnclaimed
                  .filter(d => d.name.toLowerCase().includes(claimSearch.toLowerCase()) || d.specialization.toLowerCase().includes(claimSearch.toLowerCase()))
                  .map((doc) => {
                    const isClaimedByMe = doc.claimed_by === me?.id;
                    const isClaimedByOther = doc.claimed_by !== null && doc.claimed_by !== me?.id;

                    return (
                      <div 
                        key={doc.id}
                        className={`bg-white rounded-2xl p-5 border shadow-level-2 transition-all flex flex-col justify-between gap-4 ${
                          isClaimedByMe ? 'border-teal-500 bg-teal-50/10' : 'border-gray-100'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-sans font-extrabold text-base text-brand-dark tracking-tight">
                              {doc.name}
                            </span>
                            <span className="bg-brand-bg text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                              {doc.distance_km} km away
                            </span>
                          </div>

                          <p className="font-sans text-xs font-bold text-brand-primary">
                            {doc.specialization} • {doc.facility_type}
                          </p>

                          <p className="font-sans text-xs text-brand-secondary flex items-start gap-1.5 mt-1">
                            <MapPin className="w-4 h-4 text-brand-muted shrink-0" />
                            <span>{doc.address}</span>
                          </p>
                        </div>

                        <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                          <span className="font-sans text-[11px] text-brand-muted">
                            Phone: {doc.phone}
                          </span>

                          {isClaimedByMe ? (
                            <span className="text-[11px] font-bold text-teal-700 bg-teal-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                              ✓ Claimed By You
                            </span>
                          ) : isClaimedByOther ? (
                            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                              Claimed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleClaim(doc.id)}
                              disabled={claimLoading}
                              className="bg-brand-primary hover:bg-brand-primary/95 text-white font-sans text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            >
                              This is me / Claim Listing
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- CLINIC SCHEDULE APPOINTMENTS (Placeholder per instructions) --- */}
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
              Appointment scheduling APIs are currently being integrated into our clinical backend. Once deployed, doctors will receive verified client schedules, patient booking details, and automated slot configurations right in this workspace.
            </p>
          </div>
        </div>
      )}

      {/* --- MODAL ARTICLE EDITOR --- */}
      {showEditor && (
        <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-level-3 border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-sans font-extrabold text-base text-brand-dark tracking-tight">
                {editingArticle ? 'Edit Article Draft' : 'Compose Peer Review Article'}
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
                  placeholder="e.g. Advancements in Preventative Pediatric Cardiology"
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
                  placeholder="A concise, high-level summary of the medical insights shared in this publication."
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
                    placeholder="Pediatrics, Clinical, Care"
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
                  Main Body Content (Markdown Supported) *
                </label>
                <textarea
                  required
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Provide your detailed clinical research, insights or wellness guidelines here..."
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

      {activeTab === 'blog' && (
        <HealthJournal />
      )}

    </DashboardLayout>
  );
}

// Simple Inline ArrowLeft icon
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
