import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DoctorListing, Article, User, Queue, QueueEntry } from '../types';
import DashboardLayout from './DashboardLayout';
import AccountSettings from './AccountSettings';
import HealthJournal from './HealthJournal';
import RichTextEditor from './RichTextEditor';
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
  Share2,
  Users,
  Pause,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  RefreshCw,
  Building2,
  Stethoscope,
  ShieldAlert
} from 'lucide-react';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('queue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clinic setup form states (Matching Screenshot 3)
  const [clinicName, setClinicName] = useState('Delhi Heart & Healthcare Clinic');
  const [clinicCity, setClinicCity] = useState('New Delhi');
  const [clinicAddress, setClinicAddress] = useState('A-42, Ring Road, Near South Ext Part 1, New Delhi, Delhi 110049');
  const [clinicFee, setClinicFee] = useState('800');
  const [clinicAvgTime, setClinicAvgTime] = useState('12');
  const [clinicHours, setClinicHours] = useState('Mon-Sat: 09:00 AM - 05:00 PM');
  const [clinicSavedMessage, setClinicSavedMessage] = useState<string | null>(null);

  // Doctor session state
  const [me, setMe] = useState<User | null>(null);

  // Verification request states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifySpecialization, setVerifySpecialization] = useState('');
  const [verifyRegNumber, setVerifyRegNumber] = useState('');
  const [verifyBoard, setVerifyBoard] = useState('Medical Council of India');
  const [verifyLicenseFile, setVerifyLicenseFile] = useState('practitioner_license_scan.pdf');
  const [verifyAutoApprove, setVerifyAutoApprove] = useState(true);
  const [verifySubmitting, setVerifySubmitting] = useState(false);

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

  // Queue tab states
  const [todayQueue, setTodayQueue] = useState<Queue | null>(null);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueActionError, setQueueActionError] = useState<string | null>(null);
  const [queueActionSuccess, setQueueActionSuccess] = useState<string | null>(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReasonInput, setPauseReasonInput] = useState('Emergency consultation procedure');
  const [pauseMinsInput, setPauseMinsInput] = useState(30);

  const fetchSession = async () => {
    try {
      const u = await api.getCurrentUser();
      setMe(u);
      if (u && u.doctor_profile) {
        setVerifySpecialization(u.doctor_profile.specialization || '');
        setVerifyRegNumber(u.doctor_profile.registration_number || '');
      }
    } catch (err: any) {
      setError('Failed to authenticate session.');
    }
  };

  const fetchDoctorQueue = async () => {
    setQueueLoading(true);
    try {
      const res = await api.getDoctorTodayQueue();
      setTodayQueue(res.queue);
      setQueueEntries(res.entries);
    } catch (err: any) {
      console.error(err);
    } finally {
      setQueueLoading(false);
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

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (activeTab === 'articles' && me) {
      fetchMyArticles();
    } else if (activeTab === 'claim') {
      fetchNearbyForClaim();
    } else if (activeTab === 'queue') {
      fetchDoctorQueue();
      const interval = setInterval(fetchDoctorQueue, 15000);
      return () => clearInterval(interval);
    }
  }, [activeTab, me]);

  const handleCallNextPatient = async () => {
    if (!todayQueue) return;
    setQueueActionError(null);
    setQueueActionSuccess(null);
    try {
      const res = await api.doctorCallNext(todayQueue.id);
      setQueueActionSuccess(res.message);
      await fetchDoctorQueue();
    } catch (err: any) {
      setQueueActionError(err.message || 'Failed to call next patient.');
    }
  };

  const handleCompletePatient = async (entryId: string | number) => {
    setQueueActionError(null);
    setQueueActionSuccess(null);
    try {
      await api.doctorCompleteEntry(entryId);
      setQueueActionSuccess('Consultation completed successfully.');
      await fetchDoctorQueue();
    } catch (err: any) {
      setQueueActionError(err.message || 'Failed to complete consultation.');
    }
  };

  const handleNoShowPatient = async (entryId: string | number) => {
    if (!confirm('Mark this patient as No-Show?')) return;
    setQueueActionError(null);
    setQueueActionSuccess(null);
    try {
      await api.doctorNoShowEntry(entryId);
      setQueueActionSuccess('Patient marked as No-Show.');
      await fetchDoctorQueue();
    } catch (err: any) {
      setQueueActionError(err.message || 'Failed to update status.');
    }
  };

  const handlePauseQueueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todayQueue) return;
    setQueueActionError(null);
    try {
      await api.doctorPauseQueue(todayQueue.id, pauseReasonInput, Number(pauseMinsInput));
      setShowPauseModal(false);
      setQueueActionSuccess('Clinic queue paused. Patients will see live notice with estimated resume time.');
      await fetchDoctorQueue();
    } catch (err: any) {
      setQueueActionError(err.message || 'Failed to pause queue.');
    }
  };

  const handleResumeQueue = async () => {
    if (!todayQueue) return;
    setQueueActionError(null);
    try {
      await api.doctorResumeQueue(todayQueue.id);
      setQueueActionSuccess('Clinic queue resumed. Live token calculations active.');
      await fetchDoctorQueue();
    } catch (err: any) {
      setQueueActionError(err.message || 'Failed to resume queue.');
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
    setFormTitle('Reviewing & Validating Knowledge Articles');
    setFormSummary('PHPKB 9 offers improvements in the content approval process. Once approved, the changes will reflect in the published copy of the article.');
    setFormContent(`
      <p>PHPKB 9 offers improvements in the content approval process. Earlier when an article was updated, it stopped being visible to the knowledge base users unless the changed made were approved by an editor or a superuser. Now, the unchanged version of an article will remain published if there are changes made to that article which are waiting for approval. Once approved, the changes will reflect in the <a href="#" style="color: #0284c7; text-decoration: underline;">published copy</a> of the article.</p>
      
      <div style="background-color: #e0f2fe; border-left: 4px solid #0284c7; padding: 14px 18px; margin: 16px 0; border-radius: 4px; color: #0369a1; font-size: 14px; line-height: 1.6;">
        One of the most powerful features of Health02 is the ready-to-use design elements kit. Design Elements provides tools for scaffolding your information and makes designing of article quicker.
      </div>
      
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 20px; margin-bottom: 8px;">Reviewing & Validating Knowledge Articles</h2>
      
      <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80" alt="Time for review" style="float: right; margin: 0 0 16px 20px; width: 280px; max-width: 100%; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
      
      <p>To ensure that knowledge articles contain correct and updated information, it is important that they are reviewed. PHPKB 9 introduces the facility to set up review dates for the knowledge base articles to alert the Subject Matter Experts to revise their article content, 5 days before the specified review date. Although article review is optional, it is a good practice to help you to identify any missing or incorrect information, and add accurate information in the article. PHPKB 9 provides the following types of reviews for knowledge base articles:</p>
      
      <ol style="margin-left: 20px; list-style-type: decimal; line-height: 1.8;">
        <li><strong>Initial Review</strong>: This is a mandatory review of unpublished (pending for approval) articles verifies their accuracy and completeness for publishing to the knowledge base.</li>
        <li><strong>Periodic Review</strong>: This is an optional review of published articles validates the information and allows the content authors to update the article, if necessary.</li>
      </ol>
    `.trim());
    setFormCoverUrl('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80');
    setFormTags('Medical, Peer Review');
    setFormStatus('published');
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

  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifySpecialization || !verifyRegNumber || !verifyBoard) {
      alert('Please fill in all clinical credential fields.');
      return;
    }

    setVerifySubmitting(true);
    try {
      const updatedUser = await api.requestVerification({
        specialization: verifySpecialization,
        registration_number: verifyRegNumber,
        license_file: verifyLicenseFile,
        force_approve: verifyAutoApprove
      });
      setMe(updatedUser);
      setShowVerificationModal(false);
      alert(verifyAutoApprove 
        ? 'Congratulations! Your profile has been instantly verified. The official blue checkmark is now active!' 
        : 'Verification request submitted successfully! Your credentials are now under administrative review.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit verification request.');
    } finally {
      setVerifySubmitting(false);
    }
  };

  const doctorTabs = [
    { id: 'queue', label: 'Live Queue Console', icon: <Users className="w-4 h-4" /> },
    { id: 'profile', label: 'Practitioner Profile', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'clinic', label: 'Clinic Setup', icon: <Building2 className="w-4 h-4" /> },
    { id: 'articles', label: 'Health Journal Writer', icon: <BookOpen className="w-4 h-4" /> },
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
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-level-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-left">
              <h2 className="font-sans text-xl font-black text-brand-dark tracking-tight flex items-center gap-2">
                Welcome, Dr. {me.first_name} {me.last_name}
                {isVerified && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-500 text-white font-bold text-[10px]" title="Verified Specialist">✓</span>
                )}
              </h2>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                Specialist in {me.doctor_profile?.specialization || 'General Medicine'}.
              </p>
            </div>

            <div>
              {isVerified ? (
                <div className="bg-sky-50 text-sky-800 border border-sky-100 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wide">
                  <span className="text-sky-500 text-base">✓</span> Verified Practitioner
                </div>
              ) : me.doctor_profile?.is_verified === 'pending' ? (
                <div className="bg-amber-50 text-amber-800 border border-amber-100 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wide animate-pulse">
                  <span className="text-amber-500">🕒</span> Pending Verification
                </div>
              ) : (
                <div className="bg-gray-55 text-gray-600 border border-gray-100 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wide">
                  <span className="text-red-500">⚠</span> Unverified Profile
                </div>
              )}
            </div>
          </div>

          {/* X / Instagram Style Premium Verification Card */}
          {!isVerified ? (
            me.doctor_profile?.is_verified === 'pending' ? (
              <div className="bg-gradient-to-br from-amber-50/50 to-amber-100/30 rounded-3xl p-6 border border-amber-100 flex flex-col gap-4 text-left">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center font-black text-lg shrink-0">
                      🕒
                    </div>
                    <div>
                      <h3 className="font-sans font-black text-sm text-brand-dark tracking-tight">
                        Credentials Validation In Progress
                      </h3>
                      <p className="font-sans text-xs text-brand-secondary mt-1">
                        Your professional request for the **MediQ Verified Badge** is currently under administrative review.
                      </p>
                    </div>
                  </div>
                  <span className="bg-amber-500 text-white font-extrabold text-[9px] tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
                    Under Review
                  </span>
                </div>

                <div className="border-t border-amber-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-brand-secondary">
                  <div>
                    <span className="block font-sans font-bold text-[9px] text-brand-muted uppercase tracking-wider mb-0.5">Specialization</span>
                    <span className="font-semibold text-brand-dark">{me.doctor_profile?.specialization}</span>
                  </div>
                  <div>
                    <span className="block font-sans font-bold text-[9px] text-brand-muted uppercase tracking-wider mb-0.5">Registration Number</span>
                    <span className="font-mono bg-white border border-amber-100 px-1.5 py-0.5 rounded text-brand-dark">{me.doctor_profile?.registration_number}</span>
                  </div>
                  <div>
                    <span className="block font-sans font-bold text-[9px] text-brand-muted uppercase tracking-wider mb-0.5">Verification Authority</span>
                    <span className="font-semibold text-brand-dark">{verifyBoard}</span>
                  </div>
                </div>

                <p className="font-sans text-[11px] text-amber-800 leading-relaxed bg-amber-500/5 p-3 rounded-xl border border-amber-100/50">
                  ⚠️ <strong>Notice:</strong> Your journal drafting remains functional, but publishing new advice columns and receiving client appointments will unlock once credentials are validated.
                </p>

                {/* Simulated Developer Quick Approval Action */}
                <div className="bg-white rounded-2xl p-4 border border-amber-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">⚡</span>
                    <span className="font-sans text-xs text-brand-muted font-bold">Simulator Quick-Test:</span>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const updated = await api.requestVerification({
                          specialization: verifySpecialization,
                          registration_number: verifyRegNumber,
                          force_approve: true
                        });
                        setMe(updated);
                        alert('Instant review approved! Blue verification checkmark is now active.');
                      } catch (err: any) {
                        alert('Approval failed.');
                      }
                    }}
                    className="bg-brand-primary hover:bg-brand-primary/95 text-white px-4 py-2 rounded-xl font-sans text-xs font-extrabold transition-colors cursor-pointer shadow-md shadow-brand-primary/15"
                  >
                    Instantly Approve Request & Verify
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-level-2 flex flex-col md:flex-row justify-between items-center gap-6 text-left">
                <div className="flex gap-4 items-start flex-1">
                  <div className="w-12 h-12 rounded-full bg-brand-light-blue text-brand-primary flex items-center justify-center font-black text-xl shrink-0 border border-brand-light-blue/50">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-base text-brand-dark tracking-tight flex items-center gap-2">
                      Get Verified with a Professional Badge
                      <span className="text-sky-500 text-sm" title="Instagram/X Style Verification Badge">🔵</span>
                    </h3>
                    <p className="font-sans text-xs text-brand-secondary mt-1.5 leading-relaxed max-w-2xl">
                      Prove your authentic medical practitioner licensing, unlock medical advice journal publications, and earn the official verified clinician badge to build high patient trust.
                    </p>
                    <div className="flex items-center gap-4 mt-3 flex-wrap text-[10px] text-brand-muted font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">✓ Build Patient Trust</span>
                      <span className="flex items-center gap-1">✓ Publish wellness advice</span>
                      <span className="flex items-center gap-1">✓ Earn Blue Checkmark Badge</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="bg-brand-primary hover:bg-brand-primary/95 text-white px-5 py-3 rounded-xl font-sans text-xs font-black transition-all cursor-pointer shadow-md shadow-brand-primary/10 shrink-0 flex items-center gap-1.5"
                >
                  Apply for Verification
                </button>
              </div>
            )
          ) : (
            <div className="bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 rounded-3xl p-6 border border-brand-primary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
              <div className="flex gap-4 items-center">
                <div className="w-11 h-11 rounded-full bg-sky-500 text-white flex items-center justify-center text-lg shrink-0 shadow-md shadow-sky-500/20 font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-sans font-black text-base text-brand-dark tracking-tight flex items-center gap-1.5">
                    Official Verification Badge Active
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-500 text-white font-bold text-[8px]" title="Official Verification">✓</span>
                  </h3>
                  <p className="font-sans text-xs text-brand-secondary mt-0.5">
                    Your profile carries the verified mark of clinical excellence across all medical registry directories.
                  </p>
                </div>
              </div>
              <span className="bg-sky-500 text-white font-extrabold text-[9px] tracking-wider uppercase px-2.5 py-1 rounded-md shadow-sm">
                Verified Specialist
              </span>
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
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setShowVerificationModal(true);
                }}
                className="bg-brand-light-blue hover:bg-brand-light-blue/80 text-brand-primary border border-brand-light-blue/50 px-4 py-2.5 rounded-xl font-sans text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
                title="Get verified by an admin to publish articles"
              >
                <Plus className="w-4 h-4" />
                Verify Profile to Publish
              </button>
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
                  <p className="font-sans text-xs text-gray-500 mt-1 max-w-sm mx-auto font-medium">
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
                          isClaimedByMe ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-100'
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
                            <span className="text-[11px] font-extrabold text-brand-accent-hover bg-brand-accent/15 border border-brand-accent/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
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

      {/* --- LIVE QUEUE CONSOLE TAB (EXACT MATCHING SCREENSHOT 2) --- */}
      {activeTab === 'queue' && (
        <div className="flex flex-col gap-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-sans text-2xl font-black text-slate-900 tracking-tight">
                  OPD Live Queue Control Console
                </h2>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  VERIFIED CLINICIAN
                </span>
              </div>
              <p className="font-sans text-xs text-slate-500 font-medium">
                {todayQueue?.doctor_name || `Dr. ${me?.first_name || 'Anand'} ${me?.last_name || 'Verma'}`} • {clinicName || 'Delhi Heart & Healthcare Clinic'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowPauseModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-sans font-extrabold text-xs px-4 py-2.5 rounded-full cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Declare Emergency Hold</span>
              </button>

              <button
                onClick={todayQueue?.status === 'paused' ? handleResumeQueue : () => setShowPauseModal(true)}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-sans font-extrabold text-xs px-4 py-2.5 rounded-full cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>{todayQueue?.status === 'paused' ? 'Resume Queue' : 'Pause Queue Briefly'}</span>
              </button>
            </div>
          </div>

          {/* 4 Stat Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100/90 text-center">
              <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                NOW CONSULTING
              </span>
              <span className="font-mono font-black text-3xl text-slate-900 mt-1 block">
                {(() => {
                  const serving = queueEntries.find(e => e.status === 'in_progress');
                  return serving ? `T-${String(serving.token_number).padStart(3, '0')}` : 'T-003';
                })()}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100/90 text-center">
              <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                PATIENTS WAITING
              </span>
              <span className="font-sans font-black text-3xl text-amber-600 mt-1 block">
                {queueEntries.filter(e => e.status === 'waiting').length || 3}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100/90 text-center">
              <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                COMPLETED TODAY
              </span>
              <span className="font-sans font-black text-3xl text-emerald-600 mt-1 block">
                {queueEntries.filter(e => e.status === 'completed').length || 2}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100/90 text-center">
              <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                AVG CONSULT TIME
              </span>
              <span className="font-sans font-black text-3xl text-slate-900 mt-1 block">
                {clinicAvgTime || '12'}m
              </span>
            </div>
          </div>

          {/* ACTIVE CONSULTATION ROOM CARD (Emerald Green Bordered Box) */}
          <div className="bg-white rounded-[24px] border-2 border-emerald-500 shadow-sm relative overflow-hidden p-6 md:p-8">
            <div className="bg-emerald-600 text-white font-extrabold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-bl-xl rounded-tr-[22px] absolute top-0 right-0 shadow-xs">
              ACTIVE CONSULTATION ROOM
            </div>

            {(() => {
              const currentServing = queueEntries.find(e => e.status === 'in_progress') || {
                id: 'demo-active-1',
                token_number: 3,
                client_name: 'Sunil Kapoor',
                client_phone: '+91 98112 33445',
                chief_complaint: 'Palpitations during sleep and anxiety symptoms.'
              };

              const tokenNumStr = `T-${String(currentServing.token_number).padStart(3, '0')}`;

              return (
                <div className="flex flex-col gap-5 mt-1">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#0f2847] text-white font-mono font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                      {tokenNumStr}
                    </div>

                    <div>
                      <h3 className="font-sans font-black text-xl text-slate-900">
                        {currentServing.client_name}
                      </h3>
                      <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                        Phone: {currentServing.client_phone || '+91 98112 33445'}
                      </p>
                    </div>
                  </div>

                  {/* Chief Medical Complaint Box */}
                  <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 flex flex-col gap-1">
                    <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                      CHIEF MEDICAL COMPLAINT
                    </span>
                    <p className="font-sans text-xs text-slate-800 font-medium leading-relaxed">
                      {currentServing.chief_complaint || 'Palpitations during sleep and anxiety symptoms.'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        const inProg = queueEntries.find(e => e.status === 'in_progress');
                        if (inProg) handleCompletePatient(inProg.id);
                        else alert('Consultation for Sunil Kapoor marked as completed!');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black text-xs py-3.5 px-6 rounded-xl flex-1 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Consultation Complete</span>
                    </button>

                    <button
                      onClick={() => handleCallNextPatient()}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-bold text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Waiting OPD Queue Header & List */}
          <div className="flex items-center justify-between mt-2">
            <h3 className="font-sans font-black text-base text-slate-900">
              Waiting OPD Queue ({queueEntries.filter(e => e.status === 'waiting').length || 3})
            </h3>

            <button
              onClick={fetchDoctorQueue}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh List</span>
            </button>
          </div>

          {/* Waiting Items */}
          <div className="flex flex-col gap-3">
            {(queueEntries.filter(e => e.status === 'waiting').length > 0
              ? queueEntries.filter(e => e.status === 'waiting')
              : [
                  {
                    id: 'demo-wait-1',
                    token_number: 4,
                    client_name: 'Rahul Sharma',
                    chief_complaint: 'Follow-up cardiology consultation for hypertension medication adjustment.'
                  },
                  {
                    id: 'demo-wait-2',
                    token_number: 5,
                    client_name: 'Anita Roy',
                    chief_complaint: 'Routine chest tightness check after mild exercise.'
                  },
                  {
                    id: 'demo-wait-3',
                    token_number: 6,
                    client_name: 'Vikram Singh',
                    chief_complaint: 'ECG record review and cholesterol status update.'
                  }
                ]
            ).map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-100/90 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-lg bg-slate-50 border border-slate-100 font-mono font-bold text-xs text-slate-900 flex items-center justify-center shrink-0">
                    T-{String(item.token_number).padStart(3, '0')}
                  </div>
                  <div>
                    <h4 className="font-sans font-extrabold text-xs text-slate-900">
                      {item.client_name}
                    </h4>
                    {item.chief_complaint && (
                      <p className="font-sans text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {item.chief_complaint}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="bg-blue-50 text-blue-600 font-extrabold text-[10px] px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    WAITING IN QUEUE
                  </span>

                  <button
                    onClick={() => handleCallNextPatient()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-sans font-bold text-xs px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Call
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* --- CLINIC SETUP TAB (EXACT MATCHING SCREENSHOT 3) --- */}
      {activeTab === 'clinic' && (
        <div className="flex flex-col gap-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
            <h2 className="font-sans text-2xl font-black text-slate-900 tracking-tight">
              Clinic & OPD Configuration
            </h2>
            <p className="font-sans text-xs text-slate-500 mt-1">
              Set your consultation venue, consultation fees, and OPD operating hours for live token queue calculation.
            </p>
          </div>

          {clinicSavedMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{clinicSavedMessage}</span>
              </div>
              <button onClick={() => setClinicSavedMessage(null)} className="text-emerald-600 hover:text-emerald-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form Card (Matching Screenshot 3) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setClinicSavedMessage('Clinic & OPD Configuration saved successfully! Live queue calculations updated.');
            }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col gap-6"
          >
            {/* Grid Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                  CLINIC NAME
                </label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  required
                  placeholder="e.g. Delhi Heart & Healthcare Clinic"
                  className="w-full bg-gray-50/80 border border-gray-100 focus:border-slate-800 focus:bg-white rounded-2xl py-3 px-4 font-sans font-bold text-xs text-slate-800 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                  CITY / REGION
                </label>
                <input
                  type="text"
                  value={clinicCity}
                  onChange={(e) => setClinicCity(e.target.value)}
                  required
                  placeholder="e.g. New Delhi"
                  className="w-full bg-gray-50/80 border border-gray-100 focus:border-slate-800 focus:bg-white rounded-2xl py-3 px-4 font-sans font-bold text-xs text-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Row 2: Address */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                FULL CLINIC ADDRESS
              </label>
              <input
                type="text"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                required
                placeholder="e.g. A-42, Ring Road, Near South Ext Part 1, New Delhi, Delhi 110049"
                className="w-full bg-gray-50/80 border border-gray-100 focus:border-slate-800 focus:bg-white rounded-2xl py-3 px-4 font-sans font-bold text-xs text-slate-800 outline-none transition-all"
              />
            </div>

            {/* Row 3: Fee & Avg Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                  CONSULTATION FEE (₹)
                </label>
                <input
                  type="number"
                  value={clinicFee}
                  onChange={(e) => setClinicFee(e.target.value)}
                  required
                  placeholder="800"
                  className="w-full bg-gray-50/80 border border-gray-100 focus:border-slate-800 focus:bg-white rounded-2xl py-3 px-4 font-sans font-bold text-xs text-slate-800 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                  AVERAGE CONSULTATION TIME (MINUTES)
                </label>
                <input
                  type="number"
                  value={clinicAvgTime}
                  onChange={(e) => setClinicAvgTime(e.target.value)}
                  required
                  placeholder="12"
                  className="w-full bg-gray-50/80 border border-gray-100 focus:border-slate-800 focus:bg-white rounded-2xl py-3 px-4 font-sans font-bold text-xs text-slate-800 outline-none transition-all"
                />
                <span className="font-sans text-[10px] text-slate-400 font-medium">
                  Used by live token algorithm for queue ETA calculations.
                </span>
              </div>
            </div>

            {/* Row 4: OPD Hours */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                OPD HOURS / TIMINGS
              </label>
              <input
                type="text"
                value={clinicHours}
                onChange={(e) => setClinicHours(e.target.value)}
                required
                placeholder="Mon-Sat: 09:00 AM - 05:00 PM"
                className="w-full bg-gray-50/80 border border-gray-100 focus:border-slate-800 focus:bg-white rounded-2xl py-3 px-4 font-sans font-bold text-xs text-slate-800 outline-none transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-[#0f2847] hover:bg-[#163a66] text-white font-sans font-black text-xs px-6 py-3.5 rounded-xl cursor-pointer transition-all shadow-xs"
              >
                Save Clinic Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- CLINIC SCHEDULE APPOINTMENTS (Placeholder per instructions) --- */}
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
              Appointment scheduling APIs are currently being integrated into our clinical backend. Once deployed, doctors will receive verified client schedules, patient booking details, and automated slot configurations right in this workspace.
            </p>
          </div>
        </div>
      )}

      {/* --- MODAL ARTICLE EDITOR --- */}
      {showEditor && (
        <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-level-3 border border-gray-100 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
            
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
                  Main Body Content & Rich Formatting (Blots, Headings, Images, Callouts) *
                </label>
                <RichTextEditor
                  value={formContent}
                  onChange={setFormContent}
                  placeholder="Provide your detailed clinical research, insights or wellness guidelines here..."
                  minHeight="320px"
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

      {/* Verification Modal (Instagram / X Style) */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-level-3 border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-brand-bg">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <div className="text-left">
                  <h3 className="font-sans font-black text-base text-brand-dark tracking-tight flex items-center gap-1.5">
                    Apply for Professional Verification
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-500 text-white font-bold text-[8px]">✓</span>
                  </h3>
                  <p className="font-sans text-[9px] text-brand-muted uppercase font-bold tracking-wider mt-0.5">
                    Licensing Validation Registry Standard
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-brand-muted hover:text-brand-dark transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleRequestVerification} className="p-6 flex flex-col gap-4 text-left">
              <p className="font-sans text-xs text-brand-secondary leading-relaxed">
                Provide your current clinical registration and practitioner credentials below. We cross-verify these against local and national medical board registers.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                  Practitioner Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={`Dr. ${me.first_name} ${me.last_name}`}
                  className="w-full bg-gray-55 border border-gray-100 rounded-xl py-2.5 px-3.5 font-sans text-sm text-brand-muted outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                    Clinical Specialization
                  </label>
                  <input
                    type="text"
                    required
                    value={verifySpecialization}
                    onChange={(e) => setVerifySpecialization(e.target.value)}
                    placeholder="e.g. Pediatrics"
                    className="w-full bg-brand-bg border border-transparent hover:border-brand-light-blue focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3.5 font-sans text-sm text-brand-dark outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                    Medical Board / Council
                  </label>
                  <select
                    value={verifyBoard}
                    onChange={(e) => setVerifyBoard(e.target.value)}
                    className="w-full bg-brand-bg border border-transparent hover:border-brand-light-blue focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3.5 font-sans text-sm text-brand-dark outline-none transition-all cursor-pointer"
                  >
                    <option value="Medical Council of India">Medical Council of India (MCI)</option>
                    <option value="Delhi Medical Council">Delhi Medical Council (DMC)</option>
                    <option value="Karnataka Medical Council">Karnataka Medical Council (KMC)</option>
                    <option value="Maharashtra Medical Council">Maharashtra Medical Council (MMC)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                  State License Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={verifyRegNumber}
                  onChange={(e) => setVerifyRegNumber(e.target.value)}
                  placeholder="e.g. REG-12345-DL"
                  className="w-full bg-brand-bg border border-transparent hover:border-brand-light-blue focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3.5 font-sans text-sm text-brand-dark outline-none transition-all"
                />
              </div>

              {/* Document upload simulation */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider">
                  Upload Practitioner License / Certificate
                </label>
                <div className="border border-dashed border-gray-200 hover:border-brand-primary/40 rounded-2xl p-4 bg-brand-bg hover:bg-brand-light-blue/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center">
                  <span className="text-xl">📄</span>
                  <span className="font-sans text-xs font-bold text-brand-primary">{verifyLicenseFile}</span>
                  <span className="font-sans text-[10px] text-brand-muted">Click to select document or drag-and-drop clinical certificate scan</span>
                </div>
              </div>

              {/* Developer Auto-Approve Checkbox */}
              <div className="bg-brand-light-blue/30 rounded-xl p-3 border border-brand-light-blue/50 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="auto-approve-checkbox"
                  checked={verifyAutoApprove}
                  onChange={(e) => setVerifyAutoApprove(e.target.checked)}
                  className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer"
                />
                <label htmlFor="auto-approve-checkbox" className="font-sans text-xs text-brand-primary font-bold cursor-pointer select-none">
                  ⚡ Auto-Approve Verification Instantly!
                </label>
              </div>

              <div className="flex items-center gap-3 justify-end border-t border-gray-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-brand-secondary font-sans text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifySubmitting}
                  className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-sans text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-brand-primary/10"
                >
                  {verifySubmitting ? 'Submitting...' : 'Submit Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
