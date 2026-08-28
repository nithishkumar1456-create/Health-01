import { User, Article, DoctorListing, Booking, SupportIssue, Queue, QueueEntry, QueueStatusResponse } from '../types';

// Helper to check if backend is configured
const getApiBaseUrl = (): string => {
  return ((import.meta as any).env.VITE_API_BASE_URL || '').replace(/\/$/, '');
};

export const isRealBackendConfigured = (): boolean => {
  return !!getApiBaseUrl();
};

// Local storage keys for local simulation
const STORAGE_KEYS = {
  TOKEN: 'health02_token',
  REFRESH_TOKEN: 'health02_refresh',
  USER: 'health02_user',
  DOCTORS: 'health02_doctors_db',
  ARTICLES: 'health02_articles_db',
  BOOKINGS: 'health02_bookings_db',
  USERS: 'health02_users_db',
  ISSUES: 'health02_issues_db',
  QUEUES: 'health02_queues_db',
  QUEUE_ENTRIES: 'health02_queue_entries_db'
};

// Initial data for simulation
const INITIAL_DOCTORS_DB: DoctorListing[] = [
  {
    id: 1,
    name: 'Dr. Anand Verma',
    facility_type: 'Verma Heart & Healthcare',
    specialization: 'Cardiology',
    distance_km: 1.2,
    status: 'verified',
    phone: '+91 98765 43210',
    rating: 4.8,
    review_count: 124,
    about: 'Dr. Anand Verma is a senior consultant cardiologist with over 15 years of experience in preventive cardiology, heart failure management, and advanced clinical diagnostics.',
    address: 'A-42, Ring Road, near South Ext Part-1, New Delhi, Delhi 110049',
    latitude: 28.5726,
    longitude: 77.2208,
    claimed_by: 3, // claimed by doctor_verified user
    education: 'MBBS, MD (General Medicine), DM (Cardiology)',
    title: 'Senior Consultant Interventional Cardiologist',
    clinic_timings: '09:00 AM - 01:00 PM, 04:30 PM - 08:00 PM (Mon-Sat)',
    bio: 'Pioneer in preventive heart care with 15+ years of dedicated clinical practice and non-invasive diagnostic excellence.',
    profile_detail: 'Specialized in adult cardiology, heart rhythm disorders, lipid management, and non-invasive cardiac evaluation. Operates state-of-the-art ECHO, Holter, and stress test suites at Verma Heart & Healthcare.',
    reviews: [
      { id: 'rev-1', clientName: 'Amit Saxena', rating: 5, comment: 'Extremely attentive and reassuring doctor. Highly recommended for cardiac health.', date: '2026-07-10' },
      { id: 'rev-2', clientName: 'Sunita Kapoor', rating: 5, comment: 'Dr. Verma explained my ECG results clearly without rushing.', date: '2026-07-02' }
    ]
  },
  {
    id: 2,
    name: 'Dr. Priya Sharma',
    facility_type: 'Grace Skin Clinic',
    specialization: 'Dermatology',
    distance_km: 2.8,
    status: 'verified',
    phone: '+91 98111 22233',
    rating: 4.6,
    review_count: 85,
    about: 'Dr. Priya Sharma specializes in medical and aesthetic dermatology. She offers evidence-based treatment plans for pediatric skin care, hair restoration, and chronic skin conditions.',
    address: 'C-12, Sector 15, Vasundhara Enclave, Noida, UP 201301',
    latitude: 28.5850,
    longitude: 77.3100,
    claimed_by: null,
    education: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    title: 'Lead Aesthetic & Medical Dermatologist',
    clinic_timings: '10:00 AM - 02:00 PM, 05:00 PM - 08:30 PM (Mon-Sat)',
    bio: 'Dedicated skin care specialist combining clinical dermatology with aesthetic safety.',
    profile_detail: 'Grace Skin Clinic is fully equipped with FDA-approved laser systems, hair analysis scanners, and customized acne management programs.',
    reviews: [
      { id: 'rev-3', clientName: 'Meera Rao', rating: 5, comment: 'Great clinic environment and very effective skin treatment regimen.', date: '2026-06-28' }
    ]
  },
  {
    id: 3,
    name: 'Apollo Hospital & Diagnostics',
    facility_type: 'Hospital',
    specialization: 'Pediatrics',
    distance_km: 4.1,
    status: 'unverified',
    phone: '+91 11 4050 6070',
    rating: 4.2,
    review_count: 310,
    about: 'Sourced via OpenStreetMap. Comprehensive pediatric emergencies and specialist consulting department.',
    address: 'Pocket 1, Jasola Vihar, Shaheen Bagh, New Delhi, Delhi 110025',
    latitude: 28.5410,
    longitude: 77.2855,
    claimed_by: null,
    education: 'MD (Pediatrics), DNB (Neonatology)',
    title: 'Department Head & Senior Pediatrician',
    clinic_timings: '08:00 AM - 08:00 PM (Everyday)',
    bio: 'Multi-specialty hospital department serving emergency child care and vaccinations.',
    profile_detail: '24/7 Pediatric Emergency, NICU, PICU facilities with pediatric superspecialists on call.',
    reviews: [
      { id: 'rev-4', clientName: 'Rohan Malhotra', rating: 4, comment: 'Very prompt emergency pediatric response.', date: '2026-07-12' }
    ]
  },
  {
    id: 4,
    name: 'Fortis Escorts Medical Center',
    facility_type: 'Medical Center',
    specialization: 'Neurology',
    distance_km: 5.5,
    status: 'unverified',
    phone: '+91 11 2682 5000',
    rating: 4.4,
    review_count: 148,
    about: 'Sourced via OpenStreetMap. Specializing in advanced neuropathies and clinical EEG evaluations.',
    address: 'Okhla Road, Sukhdev Vihar, New Delhi, Delhi 110025',
    latitude: 28.5601,
    longitude: 77.2750,
    claimed_by: null,
    education: 'DM (Neurology), Fellowship in Neuro-Diagnostics',
    title: 'Consultant Neurophysiologist',
    clinic_timings: '09:00 AM - 05:00 PM (Mon-Fri)',
    bio: 'Comprehensive neurological diagnostic center.',
    profile_detail: 'Equipped with digital EEG, EMG, nerve conduction velocity testing, and stroke rehab units.',
    reviews: []
  },
  {
    id: 5,
    name: 'Dr. Rohan Mehra',
    facility_type: 'Max Healthcare',
    specialization: 'Neurology',
    distance_km: 3.5,
    status: 'verified',
    phone: '+91 99999 88888',
    rating: 4.9,
    review_count: 42,
    about: 'Dr. Rohan Mehra is a premier neurologist trained in cognitive disorders and neurodegenerative health protocols.',
    address: 'Press Enclave Road, Saket, New Delhi, Delhi 110017',
    latitude: 28.5286,
    longitude: 77.2112,
    claimed_by: null,
    education: 'MBBS, MD, DM (Neurology)',
    title: 'Senior Neurologist & Stroke Specialist',
    clinic_timings: '11:00 AM - 04:00 PM (Mon-Sat)',
    bio: 'Focused on headache management, epilepsy, and cognitive wellness.',
    profile_detail: 'Pioneer in outpatient memory clinics and migraine prevention protocols.',
    reviews: [
      { id: 'rev-5', clientName: 'Kavita Roy', rating: 5, comment: 'Dr. Mehra provided an accurate diagnosis after months of headache issues.', date: '2026-07-05' }
    ]
  },
  {
    id: 6,
    name: 'Starlight Kids Clinic',
    facility_type: 'Clinic',
    specialization: 'Pediatrics',
    distance_km: 0.8,
    status: 'unverified',
    phone: '+91 98333 44455',
    rating: 3.9,
    review_count: 19,
    about: 'Sourced via OpenStreetMap. Local clinic providing primary vaccines and child development screenings.',
    address: 'B-34, Block M, Greater Kailash-1, New Delhi, Delhi 110048',
    latitude: 28.5510,
    longitude: 77.2340,
    claimed_by: 2, // Claimed by Dr. unverified (Dr. Rakesh Patel)
    education: 'MBBS, DCH (Diploma in Child Health), DNB (Pediatrics)',
    title: 'Primary Care Pediatrician & Child Specialist',
    clinic_timings: '09:30 AM - 01:30 PM, 05:00 PM - 08:30 PM (Mon-Sat)',
    bio: 'Providing gentle and comprehensive health screenings for newborn and school-aged children.',
    profile_detail: 'Features vaccination cold-chain storage, growth milestone charting, and asthma nebulization care.',
    reviews: [
      { id: 'rev-6', clientName: 'Pooja Bhatia', rating: 4, comment: 'Clean pediatric clinic and warm staff.', date: '2026-07-01' }
    ]
  }
];

const INITIAL_ISSUES_DB: SupportIssue[] = [
  {
    id: 'TKT-9011',
    title: 'Dr. Rakesh Patel profile verification request',
    description: 'Dr. Rakesh Patel registered a new pending doctor account and uploaded his clinical license REG-55231-UN. Please verify the validity of this state registry.',
    category: 'Account',
    status: 'Open',
    userEmail: 'doctor_unverified@health02.com',
    createdAt: '2026-07-18T10:30:00Z',
    updatedAt: '2026-07-18T10:30:00Z'
  },
  {
    id: 'TKT-8240',
    title: 'Booking payment integration failure',
    description: 'A transaction for booking consultation was debited twice on customer end. Decoupled diagnostic webhook logs suggest duplicate requests.',
    category: 'Billing',
    status: 'In Progress',
    userEmail: 'client@health02.com',
    createdAt: '2026-07-19T08:15:00Z',
    updatedAt: '2026-07-19T14:45:00Z'
  },
  {
    id: 'TKT-7712',
    title: 'Vitals tracking sync delay on iOS client app',
    description: 'Clients are reporting that smartwatch sync with MediQ Clinical Hub takes up to 4 minutes to update heart rate charts.',
    category: 'Technical',
    status: 'Open',
    userEmail: 'client@health02.com',
    createdAt: '2026-07-19T12:00:00Z',
    updatedAt: '2026-07-19T12:00:00Z'
  },
  {
    id: 'TKT-1049',
    title: 'Corrected credentials for Dr. Priya Grace Skin Clinic',
    description: 'Dr. Priya requested support to update her clinical listing specialization from Dermatology to Medical Cosmetology.',
    category: 'Clinical',
    status: 'Resolved',
    userEmail: 'priya_sharma@health02.com',
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-07-16T17:30:00Z'
  }
];

const INITIAL_ARTICLES_DB: Article[] = [
  {
    id: 1,
    slug: 'future-of-cardiology-ai',
    title: 'The Future of Cardiology: AI and Wearable Tech',
    summary: 'Explore how AI-integrated smartwatches are shifting cardiology from reactive treatments to preventive care blueprints.',
    content: 'Clinical trials are demonstrating extraordinary accuracy in detecting irregular heart patterns weeks in advance. By mapping real-time photoplethysmography (PPG) waves from standard commercial wearables directly to deep-learning models, researchers can flag subclinical atrial fibrillation. \n\n### Why Wearables Matter\nModern patients are actively deploying custom health monitoring blueprints to coordinate with their clinical cardiologists. This permits longitudinal tracking outside traditional hospital settings, saving diagnostic effort and capturing rare paroxysmal events that would be missed in a standard 12-lead ECG session.\n\n### A Partnership with Specialists\nWhile algorithms offer high sensitivity, true clinical precision relies on specialist verification. A doctor\'s interpretation of the longitudinal charts guarantees that medical history, stress factors, and specific cardiac parameters are properly accounted for.',
    cover_image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    tags: ['Cardiology', 'Technology', 'Self-Care'],
    status: 'published',
    author: {
      id: 3,
      username: 'anand_verma',
      first_name: 'Anand',
      last_name: 'Verma',
      avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150&h=150'
    },
    created_at: '2026-07-01T10:00:00Z'
  },
  {
    id: 2,
    slug: 'managing-seasonal-eczema-tips',
    title: 'Clinical Guide: Managing Seasonal Eczema Flares',
    summary: 'Evidence-based strategies for maintaining epidermal moisture barriers during extreme Indian summers.',
    content: 'With seasonal shifts in humidity and high heat index levels, patients with atopic dermatitis face recurrent epidermal micro-fissuring.\n\n### The Golden Rule of Hydration\nApply thick ceramide-based emollients within three minutes of bathing. This locks in interstitial water molecules before evaporation occurs.\n\n### Ingredients to Avoid\nAvoid soaps containing sodium lauryl sulfate (SLS), which strip the lipid bilayer. Opt for clinical syndet bars instead. If erythema persists, consult a dermatologist for low-potency topical immunomodulators.',
    cover_image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800',
    tags: ['Dermatology', 'Summer Care'],
    status: 'published',
    author: {
      id: 5,
      username: 'priya_sharma',
      first_name: 'Priya',
      last_name: 'Sharma',
      avatar_url: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150&h=150'
    },
    created_at: '2026-07-05T14:30:00Z'
  },
  {
    id: 3,
    slug: 'draft-pediatric-immunization-advances',
    title: '[Draft] Recent Advances in Pediatric Immunization Protocols',
    summary: 'A comprehensive medical review of next-generation combination vaccines and secondary pediatric defense strategies.',
    content: 'This draft explores combinations that minimize pediatric injection distress. Reductions in structural adjuvants are proving equally immunogenic.',
    cover_image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    tags: ['Pediatrics', 'Vaccines'],
    status: 'draft',
    author: {
      id: 2,
      username: 'doctor_unverified',
      first_name: 'Rakesh',
      last_name: 'Patel',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150'
    },
    created_at: '2026-07-09T09:15:00Z'
  }
];

// Seed storage helper
const seedDb = () => {
  if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS_DB));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ARTICLES)) {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES_DB));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }
};

seedDb();

// State helpers for local database
const getLocalDoctors = (): DoctorListing[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCTORS) || '[]');
const saveLocalDoctors = (docs: DoctorListing[]) => localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(docs));

const getLocalArticles = (): Article[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '[]');
const saveLocalArticles = (arts: Article[]) => localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(arts));

// JWT decoder helper
export const decodeJWT = (token: string): { role: 'client' | 'doctor' | 'admin' | 'support'; is_verified?: boolean; sub?: string; username?: string; email?: string } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed decoding token', e);
    return null;
  }
};

const createMockJWT = (user: any): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: String(user.id),
    username: user.username,
    email: user.email,
    role: user.role,
    is_verified: user.role === 'doctor' ? !!user.doctor_profile?.is_verified : undefined
  }));
  const signature = 'simulated_signature';
  return `${header}.${payload}.${signature}`;
};

// API Class wrapping fetch
class ApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Base request handler
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${getApiBaseUrl()}${path}`;
    const headers = { ...this.getHeaders(), ...options.headers };
    
    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { detail: res.statusText };
        }
        throw new Error(errorData.detail || errorData.error || `Request failed with status ${res.status}`);
      }
      if (res.status === 204) return {} as T;
      return await res.json() as T;
    } catch (err: any) {
      console.error(`API Error on ${path}:`, err);
      throw err;
    }
  }

  // AUTH API
  async login(usernameOrEmail: string, password: string): Promise<{ access: string; refresh: string }> {
    if (isRealBackendConfigured()) {
      const data = await this.request<{ access: string; refresh: string }>('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username: usernameOrEmail, password })
      });
      if (data.access) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.access);
      }
      if (data.refresh) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
      }
      try {
        const user = await this.getCurrentUser();
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } catch (err) {
        console.error('Failed to fetch user profile after login:', err);
      }
      return data;
    }

    // SIMULATION MODE
    // Hardcoded test roles
    let mockUser: User | null = null;
    if (usernameOrEmail === 'client@health02.com') {
      mockUser = {
        id: 101,
        username: 'client_user',
        email: 'client@health02.com',
        first_name: 'Rahul',
        last_name: 'Sharma',
        phone: '+91 99999 11111',
        role: 'client'
      };
    } else if (usernameOrEmail === 'doctor_unverified@health02.com') {
      mockUser = {
        id: 2,
        username: 'doctor_unverified',
        email: 'doctor_unverified@health02.com',
        first_name: 'Rakesh',
        last_name: 'Patel',
        phone: '+91 98333 44455',
        role: 'doctor',
        doctor_profile: {
          specialization: 'Pediatrics',
          registration_number: 'REG-55231-UN',
          is_verified: false,
          education: 'MBBS, DCH, DNB (Pediatrics)',
          title: 'Primary Care Pediatric Specialist',
          clinic_timings: '09:30 AM - 01:30 PM, 05:00 PM - 08:30 PM (Mon-Sat)',
          bio: 'Providing gentle and comprehensive health screenings for newborn and school-aged children.',
          profile_detail: 'Features vaccination cold-chain storage, growth milestone charting, and pediatric emergency support.',
          reviews: [
            { id: 'rev-6', clientName: 'Pooja Bhatia', rating: 4, comment: 'Clean pediatric clinic and warm staff.', date: '2026-07-01' }
          ]
        }
      };
    } else if (usernameOrEmail === 'doctor_verified@health02.com') {
      mockUser = {
        id: 3,
        username: 'anand_verma',
        email: 'doctor_verified@health02.com',
        first_name: 'Anand',
        last_name: 'Verma',
        phone: '+91 98765 43210',
        role: 'doctor',
        doctor_profile: {
          specialization: 'Cardiology',
          registration_number: 'REG-10948-V',
          is_verified: true,
          education: 'MBBS, MD (General Medicine), DM (Cardiology)',
          title: 'Senior Consultant Interventional Cardiologist',
          clinic_timings: '09:00 AM - 01:00 PM, 04:30 PM - 08:00 PM (Mon-Sat)',
          bio: 'Pioneer in preventive heart care with 15+ years of dedicated clinical practice and non-invasive diagnostic excellence.',
          profile_detail: 'Specialized in adult cardiology, heart rhythm disorders, lipid management, and non-invasive cardiac evaluation. Operates state-of-the-art ECHO, Holter, and stress test suites at Verma Heart & Healthcare.',
          reviews: [
            { id: 'rev-1', clientName: 'Amit Saxena', rating: 5, comment: 'Extremely attentive and reassuring doctor. Highly recommended for cardiac health.', date: '2026-07-10' },
            { id: 'rev-2', clientName: 'Sunita Kapoor', rating: 5, comment: 'Dr. Verma explained my ECG results clearly without rushing.', date: '2026-07-02' }
          ]
        }
      };
    } else if (usernameOrEmail === 'admin@health02.com') {
      mockUser = {
        id: 99,
        username: 'admin_user',
        email: 'admin@health02.com',
        first_name: 'Vikram',
        last_name: 'Singh',
        role: 'admin'
      };
    } else if (usernameOrEmail === 'support@health02.com') {
      mockUser = {
        id: 50,
        username: 'support_team',
        email: 'support@health02.com',
        first_name: 'Support',
        last_name: 'Team',
        role: 'support',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150'
      };
    } else {
      // Create ad-hoc client or check registered local user
      const localUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const found = localUsers.find((u: User) => u.email === usernameOrEmail || u.username === usernameOrEmail);
      if (found) {
        mockUser = found;
      } else {
        throw new Error('Invalid credentials. Try: client@health02.com, doctor_verified@health02.com, support@health02.com, or admin@health02.com');
      }
    }

    const access = createMockJWT(mockUser);
    const refresh = 'simulated_refresh_token';
    localStorage.setItem(STORAGE_KEYS.TOKEN, access);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
    return { access, refresh };
  }

  async register(data: {
    username: string;
    email: string;
    password?: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: 'client' | 'doctor';
    specialization?: string;
    registration_number?: string;
  }): Promise<User> {
    if (isRealBackendConfigured()) {
      return this.request<User>('/api/accounts/register/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    // SIMULATION
    const id = Math.floor(Math.random() * 10000) + 200;
    const isDoctor = data.role === 'doctor';
    const mockUser: User = {
      id,
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      role: data.role,
      doctor_profile: isDoctor ? {
        specialization: data.specialization || 'General',
        registration_number: data.registration_number || 'REG-PENDING',
        is_verified: false
      } : null
    };

    // Save user to local list
    const localUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    localUsers.push(mockUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(localUsers));

    return mockUser;
  }

  // ADMIN ACTION: Manually create a user (doctor, admin, client)
  async adminCreateUser(data: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: 'client' | 'doctor' | 'admin' | 'support';
    specialization?: string;
    registration_number?: string;
    medical_council?: string;
    qualifications?: string;
    clinic_name?: string;
    consultation_fee?: string;
    is_verified?: boolean;
  }): Promise<User> {
    if (isRealBackendConfigured()) {
      return this.request<User>('/api/accounts/admin/create-user/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    // SIMULATION
    const id = Math.floor(Math.random() * 10000) + 500;
    const isDoctor = data.role === 'doctor';
    const isVerifiedStatus = data.is_verified !== undefined ? data.is_verified : true;

    const mockUser: User = {
      id,
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      role: data.role,
      doctor_profile: isDoctor ? {
        specialization: data.specialization || 'General',
        registration_number: data.registration_number || 'REG-PENDING',
        is_verified: isVerifiedStatus,
        education: data.qualifications || 'MBBS',
        title: `Consultant ${data.specialization || 'Practitioner'}`
      } : null
    };

    const localUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    localUsers.push(mockUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(localUsers));

    // For doctors, also auto-create a doctor listing in the registry
    if (isDoctor) {
      const localDoctors = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCTORS) || '[]');
      const newDoctorListing: DoctorListing = {
        id: Math.floor(Math.random() * 100000),
        name: `Dr. ${data.first_name} ${data.last_name}`,
        specialization: data.specialization || 'General Medicine',
        facility_type: data.clinic_name || 'Clinic',
        distance_km: 1.2,
        address: data.clinic_name ? `${data.clinic_name}, Sector 15, New Delhi` : 'Clinical Hub Center, Sector 15, New Delhi',
        phone: data.phone || '+91 99999 12345',
        status: isVerifiedStatus ? 'verified' : 'unverified',
        rating: 4.9,
        review_count: 1,
        about: 'Specialist practitioner registered and verified via administrative console.',
        education: data.qualifications || 'MBBS',
        latitude: 28.57,
        longitude: 77.22,
        claimed_by: mockUser.id
      };
      localDoctors.unshift(newDoctorListing);
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(localDoctors));
    }

    return mockUser;
  }

  // ADMIN ACTION: Retrieve all registered users
  async getAllUsers(): Promise<User[]> {
    if (isRealBackendConfigured()) {
      return this.request<User[]>('/api/accounts/admin/users/');
    }

    // SIMULATION
    const localUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const seeded = [
      {
        id: 101,
        username: 'client_user',
        email: 'client@health02.com',
        first_name: 'Rahul',
        last_name: 'Sharma',
        phone: '+91 99999 11111',
        role: 'client'
      },
      {
        id: 2,
        username: 'doctor_unverified',
        email: 'doctor_unverified@health02.com',
        first_name: 'Rakesh',
        last_name: 'Patel',
        phone: '+91 98333 44455',
        role: 'doctor',
        doctor_profile: {
          specialization: 'Pediatrics',
          registration_number: 'REG-55231-UN',
          is_verified: false
        }
      },
      {
        id: 3,
        username: 'anand_verma',
        email: 'doctor_verified@health02.com',
        first_name: 'Anand',
        last_name: 'Verma',
        phone: '+91 98765 43210',
        role: 'doctor',
        doctor_profile: {
          specialization: 'Cardiology',
          registration_number: 'REG-10948-V',
          is_verified: true
        }
      },
      {
        id: 99,
        username: 'admin_user',
        email: 'admin@health02.com',
        first_name: 'Vikram',
        last_name: 'Singh',
        role: 'admin'
      }
    ] as User[];

    const all = [...localUsers];
    seeded.forEach(su => {
      if (!all.some(u => u.id === su.id || u.username === su.username || u.email === su.email)) {
        all.push(su);
      }
    });

    return all;
  }

  async getCurrentUser(): Promise<User> {
    if (isRealBackendConfigured()) {
      return this.request<User>('/api/accounts/me/');
    }

    // SIMULATION
    const uStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!uStr) throw new Error('Unauthenticated');
    return JSON.parse(uStr) as User;
  }

  // ADMIN ACTION: Verify doctor account
  async verifyDoctorAccount(userId: number): Promise<{ success: boolean }> {
    if (isRealBackendConfigured()) {
      return this.request<{ success: boolean }>(`/api/accounts/doctors/${userId}/verify/`, {
        method: 'POST'
      });
    }

    // SIMULATION
    const localUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const updatedUsers = localUsers.map((u: User) => {
      if (u.id === userId && u.doctor_profile) {
        return { ...u, doctor_profile: { ...u.doctor_profile, is_verified: true } };
      }
      return u;
    });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    // Also update logged-in session user if same
    const curUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (curUser) {
      const parsed = JSON.parse(curUser) as User;
      if (parsed.id === userId && parsed.doctor_profile) {
        parsed.doctor_profile.is_verified = true;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
      }
    }
    return { success: true };
  }

  // BLOG API
  async getArticles(params?: { author?: number | string; tag?: string }): Promise<Article[]> {
    if (isRealBackendConfigured()) {
      let query = '';
      if (params?.author) query += `?author=${params.author}`;
      if (params?.tag) query += `${query ? '&' : '?'}tag=${params.tag}`;
      const res = await this.request<any[]>(`/api/blog/articles/${query}`);
      return res.map(a => ({
        ...a,
        tags: Array.isArray(a.tags) ? a.tags : (typeof a.tags === 'string' ? a.tags.split(',').map((t: string) => t.trim()) : [])
      }));
    }

    // SIMULATION
    let articles = getLocalArticles();
    const activeUserStr = localStorage.getItem(STORAGE_KEYS.USER);
    const activeUser = activeUserStr ? (JSON.parse(activeUserStr) as User) : null;

    // Filter rules based on role and query
    if (params?.author) {
      const authorId = Number(params.author);
      articles = articles.filter(a => a.author.id === authorId);
    } else {
      // Non-author queries or directory list:
      // Client role sees only published
      // Doctor role sees only published, plus their own drafts
      // Admin sees ALL articles including everyone's drafts
      if (!activeUser || activeUser.role === 'client') {
        articles = articles.filter(a => a.status === 'published');
      } else if (activeUser.role === 'doctor') {
        articles = articles.filter(a => a.status === 'published' || a.author.id === activeUser.id);
      } else if (activeUser.role === 'admin') {
        // sees everything
      }
    }

    if (params?.tag) {
      const filterTag = params.tag.toLowerCase();
      articles = articles.filter(a => a.tags.some(t => t.toLowerCase() === filterTag));
    }

    return articles;
  }

  async getArticleBySlug(slug: string): Promise<Article> {
    if (isRealBackendConfigured()) {
      return this.request<Article>(`/api/blog/articles/${slug}/`);
    }

    // SIMULATION
    const list = getLocalArticles();
    const found = list.find(a => a.slug === slug);
    if (!found) throw new Error('Article not found');
    return found;
  }

  async createArticle(data: Omit<Article, 'id' | 'slug' | 'author' | 'created_at'>): Promise<Article> {
    if (isRealBackendConfigured()) {
      return this.request<Article>('/api/blog/articles/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    // SIMULATION
    const activeUser = await this.getCurrentUser();
    const id = Math.floor(Math.random() * 100000);
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const newArticle: Article = {
      id,
      slug,
      ...data,
      author: {
        id: activeUser.id,
        username: activeUser.username,
        first_name: activeUser.first_name,
        last_name: activeUser.last_name,
        avatar_url: activeUser.avatar_url
      },
      created_at: new Date().toISOString()
    };

    const articles = getLocalArticles();
    articles.unshift(newArticle);
    saveLocalArticles(articles);
    return newArticle;
  }

  async updateArticle(slug: string, data: Partial<Omit<Article, 'id' | 'slug' | 'author' | 'created_at'>>): Promise<Article> {
    if (isRealBackendConfigured()) {
      return this.request<Article>(`/api/blog/articles/${slug}/`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    }

    // SIMULATION
    const articles = getLocalArticles();
    const idx = articles.findIndex(a => a.slug === slug);
    if (idx === -1) throw new Error('Article not found');

    const updated = { ...articles[idx], ...data } as Article;
    articles[idx] = updated;
    saveLocalArticles(articles);
    return updated;
  }

  async deleteArticle(slug: string): Promise<void> {
    if (isRealBackendConfigured()) {
      return this.request<void>(`/api/blog/articles/${slug}/`, {
        method: 'DELETE'
      });
    }

    // SIMULATION
    const articles = getLocalArticles();
    const filtered = articles.filter(a => a.slug !== slug);
    saveLocalArticles(filtered);
  }

  // DIRECTORY/DOCTORS API
  async getNearbyDoctors(params: { lat?: number; lng?: number; radius_km?: number; specialization?: string }): Promise<DoctorListing[]> {
    if (isRealBackendConfigured()) {
      let query = '';
      if (params.lat !== undefined) query += `lat=${params.lat}`;
      if (params.lng !== undefined) query += `&lng=${params.lng}`;
      if (params.radius_km !== undefined) query += `&radius_km=${params.radius_km}`;
      if (params.specialization) query += `&specialization=${encodeURIComponent(params.specialization)}`;
      if (query) query = '?' + query;
      return this.request<DoctorListing[]>(`/api/doctors/nearby/${query}`);
    }

    // SIMULATION
    let docs = getLocalDoctors();

    if (params.specialization) {
      const spec = params.specialization.toLowerCase();
      docs = docs.filter(d => d.specialization.toLowerCase() === spec);
    }
    
    // Simulate radius filtering if radius is specified
    if (params.radius_km !== undefined) {
      docs = docs.filter(d => d.distance_km <= (params.radius_km || 10));
    }

    return docs;
  }

  async getDoctorDetail(id: number): Promise<DoctorListing> {
    if (isRealBackendConfigured()) {
      return this.request<DoctorListing>(`/api/doctors/${id}/`);
    }

    // SIMULATION
    const docs = getLocalDoctors();
    const found = docs.find(d => d.id === id);
    if (!found) throw new Error('Doctor listing not found');
    return found;
  }

  async claimDoctorListing(id: number): Promise<DoctorListing> {
    if (isRealBackendConfigured()) {
      return this.request<DoctorListing>(`/api/doctors/${id}/claim/`, {
        method: 'POST'
      });
    }

    // SIMULATION
    const activeUser = await this.getCurrentUser();
    const docs = getLocalDoctors();
    const idx = docs.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Listing not found');
    
    if (docs[idx].claimed_by) {
      throw new Error('This listing has already been claimed by another physician');
    }

    docs[idx].claimed_by = activeUser.id;
    saveLocalDoctors(docs);
    return docs[idx];
  }

  async verifyDoctorListing(id: number): Promise<DoctorListing> {
    if (isRealBackendConfigured()) {
      return this.request<DoctorListing>(`/api/doctors/${id}/verify/`, {
        method: 'POST'
      });
    }

    // SIMULATION
    const docs = getLocalDoctors();
    const idx = docs.findIndex(d => d.id === id);
    if (idx === -1) throw new Error('Listing not found');

    docs[idx].status = 'verified';
    saveLocalDoctors(docs);
    return docs[idx];
  }

  async deleteDoctorListing(id: number): Promise<void> {
    if (isRealBackendConfigured()) {
      return this.request<void>(`/api/doctors/${id}/`, {
        method: 'DELETE'
      });
    }

    // SIMULATION
    const docs = getLocalDoctors();
    const filtered = docs.filter(d => d.id !== id);
    saveLocalDoctors(filtered);
  }

  // UPDATE PROFILE API FOR ALL ROLES
  async updateProfile(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    specialization?: string;
    registration_number?: string;
    education?: string;
    title?: string;
    clinic_timings?: string;
    bio?: string;
    profile_detail?: string;
  }): Promise<User> {
    if (isRealBackendConfigured()) {
      return this.request<User>('/api/accounts/profile/', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }

    // SIMULATION
    const uStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!uStr) throw new Error('Unauthenticated');
    const currentUser = JSON.parse(uStr) as User;

    const updatedUser: User = {
      ...currentUser,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      avatar_url: data.avatar_url,
    };

    if (currentUser.role === 'doctor') {
      const existingProfile = currentUser.doctor_profile || {
        specialization: data.specialization || 'General Physician',
        registration_number: data.registration_number || 'REG-PENDING',
        is_verified: false
      };
      updatedUser.doctor_profile = {
        ...existingProfile,
        specialization: data.specialization || existingProfile.specialization,
        registration_number: data.registration_number || existingProfile.registration_number,
        education: data.education !== undefined ? data.education : existingProfile.education,
        title: data.title !== undefined ? data.title : existingProfile.title,
        clinic_timings: data.clinic_timings !== undefined ? data.clinic_timings : existingProfile.clinic_timings,
        bio: data.bio !== undefined ? data.bio : existingProfile.bio,
        profile_detail: data.profile_detail !== undefined ? data.profile_detail : existingProfile.profile_detail,
      };

      // Also synchronize this doctor's corresponding DoctorListing if claimed or matching name
      const localDoctors = getLocalDoctors();
      let matched = false;
      const updatedDoctors = localDoctors.map((doc: DoctorListing) => {
        if (doc.claimed_by === currentUser.id || doc.name.includes(currentUser.last_name)) {
          matched = true;
          return {
            ...doc,
            name: `Dr. ${data.first_name} ${data.last_name}`,
            phone: data.phone || doc.phone,
            specialization: data.specialization || doc.specialization,
            education: data.education !== undefined ? data.education : doc.education,
            title: data.title !== undefined ? data.title : doc.title,
            clinic_timings: data.clinic_timings !== undefined ? data.clinic_timings : doc.clinic_timings,
            bio: data.bio !== undefined ? data.bio : doc.bio,
            profile_detail: data.profile_detail !== undefined ? data.profile_detail : doc.profile_detail,
            about: data.bio || data.profile_detail || doc.about
          };
        }
        return doc;
      });
      if (matched) {
        saveLocalDoctors(updatedDoctors);
      }
    }

    // Update in STORAGE_KEYS.USER
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

    // Also update in STORAGE_KEYS.USERS list if it exists
    const localUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const updatedUsers = localUsers.map((u: User) => {
      if (u.id === currentUser.id) {
        return updatedUser;
      }
      return u;
    });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    return updatedUser;
  }

  // ADD A CLIENT REVIEW FOR A DOCTOR LISTING
  async addDoctorReview(doctorId: number, review: { clientName: string; rating: number; comment: string }): Promise<DoctorListing> {
    if (isRealBackendConfigured()) {
      return this.request<DoctorListing>(`/api/doctors/${doctorId}/reviews/`, {
        method: 'POST',
        body: JSON.stringify(review)
      });
    }

    // SIMULATION
    const docs = getLocalDoctors();
    const idx = docs.findIndex(d => d.id === doctorId);
    if (idx === -1) throw new Error('Doctor listing not found');

    const newRev = {
      id: `rev-${Date.now()}`,
      clientName: review.clientName || 'Anonymous Client',
      rating: review.rating,
      comment: review.comment,
      date: new Date().toISOString().split('T')[0]
    };

    const existingReviews = docs[idx].reviews || [];
    const updatedReviews = [newRev, ...existingReviews];
    const newCount = updatedReviews.length;
    const avgRating = Number((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1));

    docs[idx].reviews = updatedReviews;
    docs[idx].review_count = newCount;
    docs[idx].rating = avgRating;

    saveLocalDoctors(docs);

    // If claimed by a user, update that user's doctor_profile.reviews too
    if (docs[idx].claimed_by) {
      const uStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (uStr) {
        const u = JSON.parse(uStr) as User;
        if (u.id === docs[idx].claimed_by && u.doctor_profile) {
          u.doctor_profile.reviews = updatedReviews;
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
        }
      }
    }

    return docs[idx];
  }

  // REQUEST DOCTOR VERIFICATION
  async requestVerification(data: { specialization: string; registration_number: string; license_file?: string; force_approve?: boolean }): Promise<User> {
    if (isRealBackendConfigured()) {
      return this.request<User>('/api/accounts/doctors/verify-request/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    // SIMULATION
    const uStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!uStr) throw new Error('Unauthenticated');
    const currentUser = JSON.parse(uStr) as User;

    if (currentUser.doctor_profile) {
      currentUser.doctor_profile.specialization = data.specialization;
      currentUser.doctor_profile.registration_number = data.registration_number;
      currentUser.doctor_profile.is_verified = data.force_approve ? true : 'pending';
    }

    // Update in STORAGE_KEYS.USER
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));

    // Also update in STORAGE_KEYS.USERS list if it exists
    const localUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const updatedUsers = localUsers.map((u: User) => {
      if (u.id === currentUser.id) {
        return currentUser;
      }
      return u;
    });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    // Also update this doctor's corresponding DoctorListing if found
    const localDoctors = getLocalDoctors();
    const updatedDoctors = localDoctors.map((doc: DoctorListing) => {
      if (doc.claimed_by === currentUser.id || doc.name.includes(currentUser.last_name)) {
        return {
          ...doc,
          status: (data.force_approve ? 'verified' : doc.status) as 'verified' | 'unverified',
          specialization: data.specialization,
        };
      }
      return doc;
    });
    saveLocalDoctors(updatedDoctors);

    // Also create a support ticket for administrative review of verification
    if (!data.force_approve) {
      const issues = await this.getAllSupportIssues();
      const newIssue: SupportIssue = {
        id: `TKT-${Math.floor(Math.random() * 9000) + 1000}`,
        title: `Dr. ${currentUser.first_name} ${currentUser.last_name} license verification request`,
        description: `Physician has requested a verified profile checkmark. Spec: ${data.specialization}, License: ${data.registration_number}. Document uploaded: ${data.license_file || 'license_scan.pdf'}`,
        category: 'Account',
        status: 'Open',
        userEmail: currentUser.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      issues.unshift(newIssue);
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    }

    return currentUser;
  }

  // SUPPORT ISSUES API
  async getAllSupportIssues(): Promise<SupportIssue[]> {
    if (isRealBackendConfigured()) {
      return this.request<SupportIssue[]>('/api/support/issues/');
    }

    // SIMULATION
    let issuesStr = localStorage.getItem(STORAGE_KEYS.ISSUES);
    if (!issuesStr) {
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(INITIAL_ISSUES_DB));
      return INITIAL_ISSUES_DB;
    }
    return JSON.parse(issuesStr) as SupportIssue[];
  }

  async createSupportIssue(data: Omit<SupportIssue, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportIssue> {
    if (isRealBackendConfigured()) {
      return this.request<SupportIssue>('/api/support/issues/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }

    // SIMULATION
    const issues = await this.getAllSupportIssues();
    const newIssue: SupportIssue = {
      ...data,
      id: `TKT-${Math.floor(Math.random() * 9000) + 1000}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    issues.unshift(newIssue);
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    return newIssue;
  }

  async updateSupportIssueStatus(id: string, status: 'Open' | 'In Progress' | 'Resolved'): Promise<SupportIssue> {
    if (isRealBackendConfigured()) {
      return this.request<SupportIssue>(`/api/support/issues/${id}/status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }

    // SIMULATION
    const issues = await this.getAllSupportIssues();
    let updatedIssue: SupportIssue | null = null;
    const updatedIssues = issues.map(issue => {
      if (issue.id === id) {
        updatedIssue = {
          ...issue,
          status,
          updatedAt: new Date().toISOString()
        };
        return updatedIssue;
      }
      return issue;
    });

    if (!updatedIssue) {
      throw new Error(`Issue ${id} not found.`);
    }

    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(updatedIssues));
    return updatedIssue;
  }

  // ==========================================
  // PATIENT QUEUE / TOKEN SYSTEM API
  // ==========================================

  private getTodayDateStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  private computeQueueStatusResponse(
    entry: QueueEntry,
    queue: Queue,
    allEntries: QueueEntry[],
    doctorListing?: DoctorListing
  ): QueueStatusResponse {
    const peopleAheadCount = allEntries.filter(
      e => String(e.queue) === String(queue.id) &&
           (e.status === 'waiting' || e.status === 'in_progress') &&
           e.token_number < entry.token_number &&
           String(e.id) !== String(entry.id)
    ).length;

    const estimatedWaitMins = peopleAheadCount * (queue.avg_consultation_minutes || 15);

    if (queue.status === 'paused') {
      return {
        queue_status: 'paused',
        message: queue.pause_reason 
          ? `Doctor is currently unavailable (${queue.pause_reason}). We'll update you when they resume.`
          : "Doctor is currently unavailable (emergency/break). We'll update you when they resume.",
        estimated_resume_at: queue.estimated_resume_at,
        token_number: entry.token_number,
        people_ahead: peopleAheadCount,
        estimated_wait_minutes: estimatedWaitMins,
        entry_status: entry.status,
        current_token_number: queue.current_token_number,
        doctor_name: doctorListing?.name || queue.doctor_name,
        doctor_specialization: doctorListing?.specialization || queue.doctor_specialty,
        clinic_name: doctorListing?.facility_type
      };
    }

    return {
      queue_status: queue.status,
      token_number: entry.token_number,
      people_ahead: peopleAheadCount,
      estimated_wait_minutes: estimatedWaitMins,
      entry_status: entry.status,
      current_token_number: queue.current_token_number,
      doctor_name: doctorListing?.name || queue.doctor_name,
      doctor_specialization: doctorListing?.specialization || queue.doctor_specialty,
      clinic_name: doctorListing?.facility_type
    };
  }

  private getQueuesDB(): Queue[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEUES);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* fallback */ }
    }
    const today = this.getTodayDateStr();
    const initialQueues: Queue[] = [
      {
        id: 'q-1-today',
        doctor: 1,
        doctor_name: 'Dr. Anand Verma',
        doctor_specialty: 'Cardiology',
        date: today,
        status: 'active',
        avg_consultation_minutes: 15,
        current_token_number: 2,
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.QUEUES, JSON.stringify(initialQueues));
    return initialQueues;
  }

  private saveQueuesDB(queues: Queue[]) {
    localStorage.setItem(STORAGE_KEYS.QUEUES, JSON.stringify(queues));
  }

  private getQueueEntriesDB(): QueueEntry[] {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEUE_ENTRIES);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* fallback */ }
    }
    const today = this.getTodayDateStr();
    const initialEntries: QueueEntry[] = [
      {
        id: 'qe-101',
        queue: 'q-1-today',
        doctor_id: 1,
        client: 101,
        client_name: 'Rohan Malhotra',
        token_number: 1,
        status: 'completed',
        booked_at: new Date(Date.now() - 3600000).toISOString(),
        started_at: new Date(Date.now() - 3000000).toISOString(),
        completed_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'qe-102',
        queue: 'q-1-today',
        doctor_id: 1,
        client: 102,
        client_name: 'Sunita Kapoor',
        token_number: 2,
        status: 'in_progress',
        booked_at: new Date(Date.now() - 2400000).toISOString(),
        started_at: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: 'qe-103',
        queue: 'q-1-today',
        doctor_id: 1,
        client: 4,
        client_name: 'Meera Rao (You)',
        token_number: 3,
        status: 'waiting',
        booked_at: new Date(Date.now() - 1200000).toISOString()
      },
      {
        id: 'qe-104',
        queue: 'q-1-today',
        doctor_id: 1,
        client: 104,
        client_name: 'Amit Saxena',
        token_number: 4,
        status: 'waiting',
        booked_at: new Date(Date.now() - 600000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.QUEUE_ENTRIES, JSON.stringify(initialEntries));
    return initialEntries;
  }

  private saveQueueEntriesDB(entries: QueueEntry[]) {
    localStorage.setItem(STORAGE_KEYS.QUEUE_ENTRIES, JSON.stringify(entries));
  }

  // API Call: Book a Token for a Doctor
  async bookQueueToken(doctorId: number): Promise<{ entry: QueueEntry; status: QueueStatusResponse }> {
    if (isRealBackendConfigured()) {
      return this.request<{ entry: QueueEntry; status: QueueStatusResponse }>('/api/queue/book/', {
        method: 'POST',
        body: JSON.stringify({ doctor_id: doctorId })
      });
    }

    // SIMULATION
    const doctor = (await this.getNearbyDoctors({ lat: 28.57, lng: 77.22, radius_km: 100 })).find(d => d.id === doctorId);
    if (!doctor) {
      throw new Error(`Doctor #${doctorId} not found.`);
    }
    if (doctor.status !== 'verified') {
      throw new Error("Doctor is unverified and call-only. Live queue booking is not available.");
    }

    const currentUser = await this.getCurrentUser();
    const today = this.getTodayDateStr();
    
    let queues = this.getQueuesDB();
    let queue = queues.find(q => q.doctor === doctorId && q.date === today);

    if (!queue) {
      queue = {
        id: `q-${doctorId}-${today}`,
        doctor: doctorId,
        doctor_name: doctor.name,
        doctor_specialty: doctor.specialization,
        date: today,
        status: 'active',
        avg_consultation_minutes: 15,
        current_token_number: null,
        created_at: new Date().toISOString()
      };
      queues.push(queue);
      this.saveQueuesDB(queues);
    }

    let entries = this.getQueueEntriesDB();
    let existingEntry = entries.find(
      e => String(e.queue) === String(queue!.id) && e.client === currentUser.id && (e.status === 'waiting' || e.status === 'in_progress')
    );

    if (existingEntry) {
      const status = this.computeQueueStatusResponse(existingEntry, queue, entries, doctor);
      return { entry: existingEntry, status };
    }

    const existingTokens = entries.filter(e => String(e.queue) === String(queue!.id)).map(e => e.token_number);
    const nextToken = existingTokens.length > 0 ? Math.max(...existingTokens) + 1 : 1;

    const newEntry: QueueEntry = {
      id: `qe-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      queue: queue.id,
      doctor_id: doctorId,
      client: currentUser.id,
      client_name: `${currentUser.first_name || currentUser.username} ${currentUser.last_name || ''}`.trim() || 'Patient',
      token_number: nextToken,
      status: 'waiting',
      booked_at: new Date().toISOString()
    };

    entries.push(newEntry);
    this.saveQueueEntriesDB(entries);

    const status = this.computeQueueStatusResponse(newEntry, queue, entries, doctor);
    return { entry: newEntry, status };
  }

  // API Call: Get Live Queue Entry Status
  async getQueueEntryStatus(entryId: string | number): Promise<QueueStatusResponse & { entry: QueueEntry; queue: Queue }> {
    if (isRealBackendConfigured()) {
      return this.request<QueueStatusResponse & { entry: QueueEntry; queue: Queue }>(`/api/queue/entries/${entryId}/status/`);
    }

    // SIMULATION
    const entries = this.getQueueEntriesDB();
    const entry = entries.find(e => String(e.id) === String(entryId));
    if (!entry) {
      throw new Error(`Queue entry #${entryId} not found.`);
    }

    const queues = this.getQueuesDB();
    const queue = queues.find(q => String(q.id) === String(entry.queue));
    if (!queue) {
      throw new Error(`Queue for entry #${entryId} not found.`);
    }

    const doctor = (await this.getNearbyDoctors({ lat: 28.57, lng: 77.22, radius_km: 100 })).find(d => d.id === entry.doctor_id);
    const computedStatus = this.computeQueueStatusResponse(entry, queue, entries, doctor);

    return {
      ...computedStatus,
      entry,
      queue
    };
  }

  // API Call: Cancel Token
  async cancelQueueEntry(entryId: string | number): Promise<{ message: string; entry: QueueEntry }> {
    if (isRealBackendConfigured()) {
      return this.request<{ message: string; entry: QueueEntry }>(`/api/queue/entries/${entryId}/cancel/`, {
        method: 'POST'
      });
    }

    // SIMULATION
    const entries = this.getQueueEntriesDB();
    const entryIndex = entries.findIndex(e => String(e.id) === String(entryId));
    if (entryIndex === -1) {
      throw new Error(`Queue entry #${entryId} not found.`);
    }

    if (entries[entryIndex].status !== 'waiting') {
      throw new Error(`Token #${entries[entryIndex].token_number} is already ${entries[entryIndex].status} and cannot be cancelled.`);
    }

    entries[entryIndex] = {
      ...entries[entryIndex],
      status: 'cancelled'
    };

    this.saveQueueEntriesDB(entries);
    return {
      message: `Token #${entries[entryIndex].token_number} cancelled successfully.`,
      entry: entries[entryIndex]
    };
  }

  // API Call: Get My Queue Entries (Client)
  async getMyQueueEntries(): Promise<QueueEntry[]> {
    if (isRealBackendConfigured()) {
      return this.request<QueueEntry[]>('/api/queue/my-entries/');
    }

    // SIMULATION
    const currentUser = await this.getCurrentUser();
    const entries = this.getQueueEntriesDB();
    return entries.filter(e => e.client === currentUser.id).sort((a, b) => new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime());
  }

  // API Call: Get Today's Queue for Doctor
  async getDoctorTodayQueue(doctorId?: number): Promise<{ queue: Queue; entries: QueueEntry[] }> {
    if (isRealBackendConfigured()) {
      const query = doctorId ? `?doctor_id=${doctorId}` : '';
      return this.request<{ queue: Queue; entries: QueueEntry[] }>(`/api/queue/doctor/today/${query}`);
    }

    // SIMULATION
    const currentUser = await this.getCurrentUser();
    const doctors = await this.getNearbyDoctors({ lat: 28.57, lng: 77.22, radius_km: 100 });
    
    let docObj = doctorId ? doctors.find(d => d.id === doctorId) : doctors.find(d => d.claimed_by === currentUser.id);
    if (!docObj) {
      docObj = doctors[0];
    }

    const today = this.getTodayDateStr();
    let queues = this.getQueuesDB();
    let queue = queues.find(q => q.doctor === docObj!.id && q.date === today);

    if (!queue) {
      queue = {
        id: `q-${docObj.id}-${today}`,
        doctor: docObj.id,
        doctor_name: docObj.name,
        doctor_specialty: docObj.specialization,
        date: today,
        status: 'active',
        avg_consultation_minutes: 15,
        current_token_number: null,
        created_at: new Date().toISOString()
      };
      queues.push(queue);
      this.saveQueuesDB(queues);
    }

    const allEntries = this.getQueueEntriesDB();
    const entries = allEntries
      .filter(e => String(e.queue) === String(queue!.id))
      .sort((a, b) => a.token_number - b.token_number);

    return { queue, entries };
  }

  // API Call: Doctor Call Next Patient
  async doctorCallNext(queueId: string | number): Promise<{ message: string; entry: QueueEntry }> {
    if (isRealBackendConfigured()) {
      return this.request<{ message: string; entry: QueueEntry }>('/api/queue/doctor/call-next/', {
        method: 'POST',
        body: JSON.stringify({ queue_id: queueId })
      });
    }

    // SIMULATION
    let queues = this.getQueuesDB();
    const qIndex = queues.findIndex(q => String(q.id) === String(queueId));
    if (qIndex === -1) {
      throw new Error(`Queue #${queueId} not found.`);
    }

    let entries = this.getQueueEntriesDB();
    const queueEntries = entries.filter(e => String(e.queue) === String(queueId));

    const activeInProgress = queueEntries.find(e => e.status === 'in_progress');
    if (activeInProgress) {
      throw new Error(`Token #${activeInProgress.token_number} (${activeInProgress.client_name}) is currently in progress. Please complete or mark as no-show before calling next.`);
    }

    const waitingEntries = queueEntries.filter(e => e.status === 'waiting').sort((a, b) => a.token_number - b.token_number);
    if (waitingEntries.length === 0) {
      throw new Error('No patients currently waiting in the queue.');
    }

    const nextEntry = waitingEntries[0];
    const entryIdx = entries.findIndex(e => String(e.id) === String(nextEntry.id));
    
    entries[entryIdx] = {
      ...entries[entryIdx],
      status: 'in_progress',
      started_at: new Date().toISOString()
    };

    queues[qIndex] = {
      ...queues[qIndex],
      current_token_number: nextEntry.token_number
    };

    this.saveQueuesDB(queues);
    this.saveQueueEntriesDB(entries);

    return {
      message: `Token #${nextEntry.token_number} (${nextEntry.client_name}) called into consultation!`,
      entry: entries[entryIdx]
    };
  }

  // API Call: Doctor Complete Entry
  async doctorCompleteEntry(entryId: string | number): Promise<QueueEntry> {
    if (isRealBackendConfigured()) {
      return this.request<QueueEntry>(`/api/queue/entries/${entryId}/complete/`, {
        method: 'POST'
      });
    }

    // SIMULATION
    let entries = this.getQueueEntriesDB();
    const idx = entries.findIndex(e => String(e.id) === String(entryId));
    if (idx === -1) {
      throw new Error(`Queue entry #${entryId} not found.`);
    }

    if (entries[idx].status !== 'in_progress') {
      throw new Error(`Entry #${entryId} is not currently in progress.`);
    }

    entries[idx] = {
      ...entries[idx],
      status: 'completed',
      completed_at: new Date().toISOString()
    };

    this.saveQueueEntriesDB(entries);
    return entries[idx];
  }

  // API Call: Doctor Mark No-Show Entry
  async doctorNoShowEntry(entryId: string | number): Promise<QueueEntry> {
    if (isRealBackendConfigured()) {
      return this.request<QueueEntry>(`/api/queue/entries/${entryId}/no-show/`, {
        method: 'POST'
      });
    }

    // SIMULATION
    let entries = this.getQueueEntriesDB();
    const idx = entries.findIndex(e => String(e.id) === String(entryId));
    if (idx === -1) {
      throw new Error(`Queue entry #${entryId} not found.`);
    }

    entries[idx] = {
      ...entries[idx],
      status: 'no_show',
      completed_at: new Date().toISOString()
    };

    this.saveQueueEntriesDB(entries);
    return entries[idx];
  }

  // API Call: Doctor Pause Queue
  async doctorPauseQueue(queueId: string | number, reason: string, estimatedResumeMinutes?: number): Promise<Queue> {
    if (isRealBackendConfigured()) {
      return this.request<Queue>('/api/queue/doctor/pause/', {
        method: 'POST',
        body: JSON.stringify({ queue_id: queueId, reason, estimated_resume_minutes: estimatedResumeMinutes })
      });
    }

    // SIMULATION
    let queues = this.getQueuesDB();
    const idx = queues.findIndex(q => String(q.id) === String(queueId));
    if (idx === -1) {
      throw new Error(`Queue #${queueId} not found.`);
    }

    const now = new Date();
    let estimatedResumeAt: string | null = null;
    if (estimatedResumeMinutes) {
      estimatedResumeAt = new Date(now.getTime() + estimatedResumeMinutes * 60000).toISOString();
    }

    queues[idx] = {
      ...queues[idx],
      status: 'paused',
      pause_reason: reason || 'Emergency/Break',
      paused_at: now.toISOString(),
      estimated_resume_at: estimatedResumeAt
    };

    this.saveQueuesDB(queues);
    return queues[idx];
  }

  // API Call: Doctor Resume Queue
  async doctorResumeQueue(queueId: string | number): Promise<Queue> {
    if (isRealBackendConfigured()) {
      return this.request<Queue>('/api/queue/doctor/resume/', {
        method: 'POST',
        body: JSON.stringify({ queue_id: queueId })
      });
    }

    // SIMULATION
    let queues = this.getQueuesDB();
    const idx = queues.findIndex(q => String(q.id) === String(queueId));
    if (idx === -1) {
      throw new Error(`Queue #${queueId} not found.`);
    }

    queues[idx] = {
      ...queues[idx],
      status: 'active',
      pause_reason: null,
      paused_at: null,
      estimated_resume_at: null
    };

    this.saveQueuesDB(queues);
    return queues[idx];
  }

  // Logout clean up helper
  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

export const api = new ApiService();
export { STORAGE_KEYS };
