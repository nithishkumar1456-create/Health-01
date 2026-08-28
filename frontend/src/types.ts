export interface DoctorReview {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'client' | 'doctor' | 'admin' | 'support';
  avatar_url?: string;
  doctor_profile?: {
    specialization: string;
    registration_number: string;
    is_verified: boolean | 'pending';
    education?: string;
    title?: string;
    clinic_timings?: string;
    bio?: string;
    profile_detail?: string;
    reviews?: DoctorReview[];
  } | null;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  cover_image_url?: string;
  tags: string[]; // List of tags/tags
  status: 'draft' | 'published';
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  created_at: string;
}

export interface DoctorListing {
  id: number;
  name: string;
  facility_type: string; // e.g. "Clinic", "Hospital", "Specialty Center"
  specialization: string; // e.g. "Cardiology", "Dermatology", "Pediatrics"
  distance_km: number;
  status: 'unverified' | 'verified';
  phone: string;
  rating: number;
  review_count: number;
  about: string;
  address: string;
  latitude: number;
  longitude: number;
  claimed_by: number | null; // User ID of doctor who claimed it
  education?: string;
  title?: string;
  clinic_timings?: string;
  bio?: string;
  profile_detail?: string;
  reviews?: DoctorReview[];
}

export interface Booking {
  id: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export interface SupportIssue {
  id: string;
  title: string;
  description: string;
  category: 'Billing' | 'Technical' | 'Clinical' | 'Account' | 'Other';
  status: 'Open' | 'In Progress' | 'Resolved';
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface Queue {
  id: string | number;
  doctor: number; // Doctor ID (DoctorListing.id)
  doctor_name?: string;
  doctor_specialty?: string;
  date: string; // YYYY-MM-DD
  status: 'active' | 'paused' | 'closed';
  avg_consultation_minutes: number;
  current_token_number: number | null;
  pause_reason?: string | null;
  paused_at?: string | null;
  estimated_resume_at?: string | null;
  created_at?: string;
}

export interface QueueEntry {
  id: string | number;
  queue: string | number; // Queue ID
  queue_id?: string | number;
  doctor_id: number;
  client: number; // User ID
  client_name?: string;
  token_number: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  booked_at: string;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface QueueStatusResponse {
  queue_status: 'active' | 'paused' | 'closed';
  message?: string;
  estimated_resume_at?: string | null;
  token_number: number;
  people_ahead: number;
  estimated_wait_minutes: number;
  entry_status: 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  current_token_number?: number | null;
  doctor_name?: string;
  doctor_specialization?: string;
  clinic_name?: string;
}

