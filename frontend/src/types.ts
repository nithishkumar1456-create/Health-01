export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'client' | 'doctor' | 'admin';
  doctor_profile?: {
    specialization: string;
    registration_number: string;
    is_verified: boolean;
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
