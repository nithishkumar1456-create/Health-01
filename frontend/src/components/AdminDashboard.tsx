import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DoctorListing, Article, User } from '../types';
import DashboardLayout from './DashboardLayout';
import AccountSettings from './AccountSettings';
import AddDoctorModal from './AddDoctorModal';
import { 
  Shield, 
  Users, 
  FileText, 
  Search, 
  SlidersHorizontal, 
  CheckCircle, 
  CheckCircle2,
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
  User as UserIcon,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Award,
  Building
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Doctor Modal state
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

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

  // User Accounts & Doctor Roster state variables
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [rosterSearch, setRosterSearch] = useState('');
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

  const fetchVerificationQueues = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getNearbyDoctors({ lat: 28.57, lng: 77.22, radius_km: 25 });
      setClaimedListings(list.filter(d => d.status === 'unverified' && d.claimed_by !== null));

      const localUsersStr = localStorage.getItem('health02_users_db') || '[]';
      const localUsers: User[] = JSON.parse(localUsersStr);
      setUnverifiedDoctors(localUsers.filter(u => u.role === 'doctor' && u.doctor_profile?.is_verified === false));
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve administrative queues.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectory = async () => {
    setLoading(true);
    setError(null);
    try {
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

  useEffect(() => {
    fetchUsers();
    fetchDirectory();
    if (activeTab === 'queue') {
      fetchVerificationQueues();
    } else if (activeTab === 'blog') {
      fetchBlogArticles();
    }
  }, [activeTab]);

  const handleToggleDoctorVerification = async (userId: number, currentVerifiedStatus: boolean) => {
    try {
      const localUsersStr = localStorage.getItem('health02_users_db') || '[]';
      const localUsers: User[] = JSON.parse(localUsersStr);
      const updated = localUsers.map((u: User) => {
        if (u.id === userId && u.doctor_profile) {
          return {
            ...u,
            doctor_profile: {
              ...u.doctor_profile,
              is_verified: !currentVerifiedStatus
            }
          };
        }
        return u;
      });
      localStorage.setItem('health02_users_db', JSON.stringify(updated));

      if (!currentVerifiedStatus) {
        await api.verifyDoctorAccount(userId);
      }

      await fetchUsers();
      await fetchDirectory();
      alert(`Doctor verification status successfully updated to ${!currentVerifiedStatus ? 'VERIFIED' : 'UNVERIFIED'}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update verification status.');
    }
  };

  const handleUpdateUserRole = (userId: number, newRole: 'client' | 'doctor' | 'admin' | 'support') => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    const localUsersStr = localStorage.getItem('health02_users_db') || '[]';
    const localUsers: User[] = JSON.parse(localUsersStr);
    const updated = localUsers.map((u: User) => u.id === userId ? { ...u, role: newRole } : u);
    localStorage.setItem('health02_users_db', JSON.stringify(updated));
  };

  const handleRemoveUser = (userId: number, name: string) => {
    if (!confirm(`Are you sure you want to remove account for ${name}?`)) return;
    setUsersList(prev => prev.filter(u => u.id !== userId));
    const localUsersStr = localStorage.getItem('health02_users_db') || '[]';
    const localUsers: User[] = JSON.parse(localUsersStr);
    const updated = localUsers.filter((u: User) => u.id !== userId);
    localStorage.setItem('health02_users_db', JSON.stringify(updated));
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

  const handleVerifyAccount = async (userId: number) => {
    setError(null);
    try {
      await api.verifyDoctorAccount(userId);
      alert('Doctor credentials verified successfully!');
      fetchVerificationQueues();
      fetchUsers();
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
      fetchDirectory();
    } catch (err: any) {
      setError(err.message || 'Failed to verify listing.');
    }
  };

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
    { id: 'users', label: 'Admin Hub & Users', icon: <Shield className="w-4 h-4" /> },
    { id: 'roster', label: 'Doctor Roster', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'queue', label: 'Verification Queue', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'directory', label: 'Directory Moderation', icon: <Users className="w-4 h-4" /> },
    { id: 'blog', label: 'Blog Moderation', icon: <FileText className="w-4 h-4" /> },
    { id: 'profile', label: 'My Account', icon: <UserIcon className="w-4 h-4" /> },
  ];

  // Default initial users matching Screenshot 3
  const seedUsersList: any[] = [
    { id: 101, first_name: 'Rahul', last_name: 'Sharma', email: 'client@health02.com', role: 'client', accountId: 'pat-1' },
    { id: 3, first_name: 'Dr. Anand', last_name: 'Verma', email: 'anand.verma@health02.com', role: 'doctor', accountId: 'doc-1', specialization: 'Cardiology', reg_no: 'REG-10924-ND', verified: true },
    { id: 5, first_name: 'Dr. Priya', last_name: 'Sharma', email: 'priya.sharma@health02.com', role: 'doctor', accountId: 'doc-2', specialization: 'Dermatology', reg_no: 'REG-88412-UP', verified: true },
    { id: 2, first_name: 'Dr. Rakesh', last_name: 'Patel', email: 'doctor_unverified@health02.com', role: 'doctor', accountId: 'doc-3', specialization: 'Pediatrics', reg_no: 'REG-55231-UN', verified: false },
    { id: 50, first_name: 'Support Team', last_name: 'Agent', email: 'support@health02.com', role: 'support', accountId: 'sup-1' },
    { id: 99, first_name: 'Vikram', last_name: 'Singh', email: 'admin@health02.com', role: 'admin', accountId: 'adm-1' }
  ];

  const currentUsers = usersList.length > 0 ? usersList : seedUsersList;

  // Master Doctor Roster list matching Screenshot 4
  const masterDoctorList = [
    {
      id: 3,
      name: 'Dr. Anand Verma',
      specialty: 'Cardiology',
      qualifications: 'MBBS, MD (Cardiology), FACC',
      clinic: 'Delhi Heart & Healthcare Clinic',
      fee: '₹800 • 12m consult',
      reg_number: 'REG-10924-ND',
      is_verified: true
    },
    {
      id: 5,
      name: 'Dr. Priya Sharma',
      specialty: 'Dermatology',
      qualifications: 'MBBS, MD (Dermatology & Cosmetology)',
      clinic: 'Grace Skin & Laser Clinic',
      fee: '₹800 • 12m consult',
      reg_number: 'REG-88412-UP',
      is_verified: true
    },
    {
      id: 2,
      name: 'Dr. Rakesh Patel',
      specialty: 'Pediatrics',
      qualifications: 'MBBS, DCH, DNB (Pediatrics)',
      clinic: 'Starlight Kids Clinic',
      fee: '₹800 • 12m consult',
      reg_number: 'REG-55231-UN',
      is_verified: false
    },
    {
      id: 12,
      name: 'Dr. Rohan Mehra',
      specialty: 'Neurology',
      qualifications: 'MBBS, DM (Neurology)',
      clinic: 'Medicity Neurology Center',
      fee: '₹800 • 12m consult',
      reg_number: 'REG-77123-DL',
      is_verified: true
    }
  ];

  // Merge dynamic users into roster
  const allDoctorUsers = currentUsers.filter(u => u.role === 'doctor');
  const renderedRoster = masterDoctorList.map(mDoc => {
    const matchedUser = allDoctorUsers.find(u => u.id === mDoc.id || u.email.toLowerCase().includes(mDoc.name.toLowerCase().split(' ')[1]?.toLowerCase() || ''));
    if (matchedUser && matchedUser.doctor_profile) {
      return {
        ...mDoc,
        is_verified: matchedUser.doctor_profile.is_verified === true
      };
    }
    return mDoc;
  });

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} tabs={adminTabs}>
      
      {/* Top Sub-Navigation Pills matching Screenshots 3 & 4 */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#0f2847] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Admin Hub & Users</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-[#0f2847] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-blue-400" />
          <span>Doctor Roster</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs flex gap-2 items-start mb-4">
          <Activity className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* --- ADMIN HUB & USERS TAB (EXACT MATCHING SCREENSHOT 3) --- */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-6">

          {/* Main Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#0f2847] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-sans text-2xl font-black text-slate-900 tracking-tight">
                  Platform Administration Console
                </h2>
                <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                  Global system management, role access controls, user provisioning, and metric telemetry.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="bg-[#0f2847] hover:bg-[#163a66] text-white font-sans font-black text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Doctor</span>
            </button>
          </div>

          {/* 4 Stat Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <span className="font-sans font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                TOTAL ACCOUNTS
              </span>
              <span className="font-mono font-black text-3xl text-slate-900 mt-1 block">
                {currentUsers.length || 6}
              </span>
            </div>

            <div className="bg-emerald-50/40 rounded-2xl p-5 border border-emerald-100 shadow-xs">
              <span className="font-sans font-extrabold text-[10px] text-emerald-700 uppercase tracking-wider block">
                PATIENTS
              </span>
              <span className="font-mono font-black text-3xl text-emerald-700 mt-1 block">
                {currentUsers.filter(u => u.role === 'client').length || 1}
              </span>
            </div>

            <div className="bg-blue-50/40 rounded-2xl p-5 border border-blue-100 shadow-xs">
              <span className="font-sans font-extrabold text-[10px] text-blue-700 uppercase tracking-wider block">
                DOCTORS REGISTERED
              </span>
              <span className="font-mono font-black text-3xl text-blue-700 mt-1 block">
                {currentUsers.filter(u => u.role === 'doctor').length || 3}
              </span>
            </div>

            <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-100 shadow-xs">
              <span className="font-sans font-extrabold text-[10px] text-amber-700 uppercase tracking-wider block">
                SUPPORT AGENTS
              </span>
              <span className="font-mono font-black text-3xl text-amber-700 mt-1 block">
                {currentUsers.filter(u => u.role === 'support').length || 1}
              </span>
            </div>
          </div>

          {/* User Account Management Header & Filters */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="font-sans font-black text-lg text-slate-900">
                User Account Management
              </h3>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    placeholder="Search user or email..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl py-2 px-3 pl-9 font-sans text-xs text-slate-800 outline-none transition-all"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl px-3 py-2 outline-none cursor-pointer font-sans shrink-0"
                >
                  <option value="all">All Roles</option>
                  <option value="client">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="support">Support</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Table Matching Screenshot 3 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 font-sans tracking-wider">
                    <th className="py-3 px-4">USER</th>
                    <th className="py-3 px-4">EMAIL</th>
                    <th className="py-3 px-4">CURRENT ROLE</th>
                    <th className="py-3 px-4">ACCOUNT ID</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {currentUsers
                    .filter(u => {
                      const q = usersSearch.toLowerCase();
                      const matchesQuery = 
                        u.email.toLowerCase().includes(q) ||
                        `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(q) ||
                        (u.username && u.username.toLowerCase().includes(q));
                      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
                      return matchesQuery && matchesRole;
                    })
                    .map((u, idx) => {
                      const fullName = u.first_name ? `${u.role === 'doctor' ? 'Dr. ' : ''}${u.first_name} ${u.last_name || ''}` : u.username;
                      const accountId = u.accountId || (u.role === 'client' ? `pat-${idx+1}` : u.role === 'doctor' ? `doc-${idx}` : u.role === 'support' ? 'sup-1' : 'adm-1');
                      
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-4 font-black text-slate-900">
                            {fullName}
                          </td>
                          <td className="py-4 px-4 text-slate-600 font-medium">
                            {u.email}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              u.role === 'client'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.role === 'doctor'
                                ? 'bg-blue-100 text-blue-800'
                                : u.role === 'support'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {u.role === 'client' ? 'PATIENT' : u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-slate-400 text-[11px]">
                            {accountId}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <select
                                value={u.role === 'client' ? 'Patient' : u.role === 'doctor' ? 'Doctor' : u.role === 'support' ? 'Support' : 'Admin'}
                                onChange={(e) => {
                                  const val = e.target.value.toLowerCase();
                                  const roleVal = val === 'patient' ? 'client' : val as any;
                                  handleUpdateUserRole(u.id, roleVal);
                                }}
                                className="bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer font-sans"
                              >
                                <option value="Patient">Patient</option>
                                <option value="Doctor">Doctor</option>
                                <option value="Support">Support</option>
                                <option value="Admin">Admin</option>
                              </select>

                              <button
                                onClick={() => handleRemoveUser(u.id, fullName)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* --- DOCTOR MASTER ROSTER TAB (EXACT MATCHING SCREENSHOT 4) --- */}
      {activeTab === 'roster' && (
        <div className="flex flex-col gap-6">

          {/* Main Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans text-2xl font-black text-slate-900 tracking-tight">
                  Doctor Master Roster
                </h2>
                <p className="font-sans text-xs text-slate-500 font-medium mt-0.5">
                  Oversee practitioner accounts, state medical council licenses, and verification status overrides.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Search doctor, specialty..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-800 rounded-xl py-2 px-3 pl-9 font-sans text-xs text-slate-800 outline-none transition-all"
                />
              </div>

              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="bg-[#0f2847] hover:bg-[#163a66] text-white font-sans font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Doctor</span>
              </button>
            </div>
          </div>

          {/* Roster Table Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-5">
            <h3 className="font-sans font-black text-base text-slate-900">
              Registered Practitioners ({renderedRoster.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 font-sans tracking-wider">
                    <th className="py-3 px-4">DOCTOR NAME</th>
                    <th className="py-3 px-4">SPECIALTY & QUALIFICATIONS</th>
                    <th className="py-3 px-4">CLINIC & FEE</th>
                    <th className="py-3 px-4">REG NUMBER</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">VERIFICATION CONTROL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {renderedRoster
                    .filter(doc => {
                      const q = rosterSearch.toLowerCase();
                      return (
                        doc.name.toLowerCase().includes(q) ||
                        doc.specialty.toLowerCase().includes(q) ||
                        doc.clinic.toLowerCase().includes(q) ||
                        doc.reg_number.toLowerCase().includes(q)
                      );
                    })
                    .map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-5 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-black text-slate-900 text-sm">
                              {doc.name}
                            </span>
                            {doc.is_verified ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                VERIFIED CLINICIAN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                UNVERIFIED PROFILE / PENDING REVIEW
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-5 px-4">
                          <p className="font-bold text-slate-900">{doc.specialty}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{doc.qualifications}</p>
                        </td>

                        <td className="py-5 px-4">
                          <p className="font-bold text-slate-900">{doc.clinic}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{doc.fee}</p>
                        </td>

                        <td className="py-5 px-4 font-mono font-bold text-slate-700 text-[11px]">
                          {doc.reg_number}
                        </td>

                        <td className="py-5 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                            doc.is_verified
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {doc.is_verified ? 'VERIFIED' : 'UNVERIFIED'}
                          </span>
                        </td>

                        <td className="py-5 px-4 text-right">
                          <button
                            onClick={() => handleToggleDoctorVerification(doc.id, doc.is_verified)}
                            className={`font-sans font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer ${
                              doc.is_verified
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            {doc.is_verified ? 'Revoke Verified Badge' : 'Grant Verified Badge'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>

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
              Approve pending doctor account registrations and claimed directory listings.
            </p>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {directoryListings
              .filter(d => d.name.toLowerCase().includes(dirSearch.toLowerCase()) || d.address.toLowerCase().includes(dirSearch.toLowerCase()))
              .map((doc) => (
                <div key={doc.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-level-2 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-sans font-extrabold text-base text-brand-dark tracking-tight">
                      {doc.name}
                    </span>
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
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
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
            </div>
            <button
              onClick={openNewEditor}
              className="bg-brand-primary hover:bg-brand-primary/95 text-white px-4 py-2.5 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              Compose Admin Article
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogArticles.map((art) => (
              <div key={art.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-level-2 flex flex-col justify-between gap-4">
                <div>
                  <h3 className="font-sans font-extrabold text-base text-brand-dark tracking-tight leading-snug">
                    {art.title}
                  </h3>
                  <p className="font-sans text-xs text-brand-secondary line-clamp-2 mt-1">
                    {art.summary}
                  </p>
                </div>
                <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                  <button
                    onClick={() => handleDeleteArticle(art.slug)}
                    className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- PROFILE TAB --- */}
      {activeTab === 'profile' && (
        <AccountSettings />
      )}

      {/* Add Doctor Shared Modal */}
      <AddDoctorModal
        isOpen={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        onDoctorAdded={() => {
          fetchUsers();
          fetchDirectory();
        }}
      />

    </DashboardLayout>
  );
}
