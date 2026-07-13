import { User, Article, DoctorListing, Booking } from '../types';

// Helper to check if backend is configured
const getApiBaseUrl = (): string => {
  return ((import.meta as any).env.VITE_API_BASE_URL || '').replace(/\/$/, '');
};

export const isRealBackendConfigured = (): boolean => {
  return !!getApiBaseUrl();
};

const STORAGE_KEYS = {
  TOKEN: 'health02_token',
  REFRESH_TOKEN: 'health02_refresh',
  USER: 'health02_user',
};

// Simple JWT decoder helper
export const decodeJWT = (token: string): { role: 'client' | 'doctor' | 'admin'; is_verified?: boolean; sub?: string; username?: string; email?: string; exp?: number } | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (e) {
    console.error('Failed decoding JWT token', e);
    return null;
  }
};

class ApiService {
  private async getValidToken(): Promise<string | null> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!token) return null;

    try {
      const decoded = decodeJWT(token);
      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        // If token expires in less than 30 seconds, refresh it
        if (decoded.exp - currentTime < 30) {
          if (refreshToken) {
            const data = await this.refreshToken(refreshToken);
            return data.access;
          }
        }
      }
    } catch (e) {
      console.error("Error checking or refreshing token:", e);
    }
    return token;
  }

  async refreshToken(refresh: string): Promise<{ access: string }> {
    const url = `${getApiBaseUrl()}/api/auth/refresh/`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh })
    });
    if (!res.ok) {
      throw new Error('Refresh token invalid or expired');
    }
    const data = await res.json();
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.access);
    if (data.refresh) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
    }
    return data;
  }

  // Base request handler
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (path !== '/api/auth/login/' && path !== '/api/auth/refresh/' && path !== '/api/accounts/register/') {
      try {
        await this.getValidToken();
      } catch (err) {
        console.error("Auto token refresh failed:", err);
        this.logout();
        throw new Error("Session expired. Please log in again.");
      }
    }

    const url = `${getApiBaseUrl()}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        // Intercept 401 and try auto-refresh and retry
        if (res.status === 401 && path !== '/api/auth/login/' && path !== '/api/auth/refresh/' && path !== '/api/accounts/register/') {
          const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          if (refreshToken) {
            try {
              const newTokens = await this.refreshToken(refreshToken);
              const retryHeaders = {
                ...headers,
                'Authorization': `Bearer ${newTokens.access}`
              };
              const retryRes = await fetch(url, { ...options, headers: retryHeaders });
              if (retryRes.ok) {
                if (retryRes.status === 204) return {} as T;
                return await retryRes.json() as T;
              }
            } catch (refreshErr) {
              console.error("401 intercept token refresh failed:", refreshErr);
              this.logout();
              throw new Error("Session expired. Please log in again.");
            }
          }
        }

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
    const tokens = await this.request<{ access: string; refresh: string }>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username: usernameOrEmail, password })
    });
    localStorage.setItem(STORAGE_KEYS.TOKEN, tokens.access);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
    
    // Fetch and store the user object
    const user = await this.getCurrentUser();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    return tokens;
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
    return this.request<User>('/api/accounts/register/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ADMIN ACTION: Manually create a user
  async adminCreateUser(data: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: 'client' | 'doctor' | 'admin';
    specialization?: string;
    registration_number?: string;
  }): Promise<User> {
    return this.request<User>('/api/accounts/register/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ADMIN ACTION: Retrieve all registered users
  async getAllUsers(params?: { role?: string; verified?: boolean }): Promise<User[]> {
    let query = '';
    if (params?.role) query += `role=${params.role}`;
    if (params?.verified !== undefined) query += `${query ? '&' : ''}verified=${params.verified}`;
    if (query) query = '?' + query;
    return this.request<User[]>(`/api/accounts/users/${query}`);
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/accounts/me/');
  }

  // ADMIN ACTION: Verify doctor account
  async verifyDoctorAccount(userId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/accounts/doctors/${userId}/verify/`, {
      method: 'POST'
    });
  }

  // BLOG API
  async getArticles(params?: { author?: number | string; tag?: string }): Promise<Article[]> {
    let query = '';
    if (params?.author) query += `author=${params.author}`;
    if (params?.tag) query += `${query ? '&' : ''}tag=${encodeURIComponent(params.tag)}`;
    if (query) query = '?' + query;
    const res = await this.request<any[]>(`/api/blog/articles/${query}`);
    return res.map(art => ({
      ...art,
      tags: typeof art.tags === 'string'
        ? art.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : (Array.isArray(art.tags) ? art.tags : [])
    }));
  }

  async getArticleBySlug(slug: string): Promise<Article> {
    const art = await this.request<any>(`/api/blog/articles/${slug}/`);
    return {
      ...art,
      tags: typeof art.tags === 'string'
        ? art.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : (Array.isArray(art.tags) ? art.tags : [])
    };
  }

  async createArticle(data: Omit<Article, 'id' | 'slug' | 'author' | 'created_at'>): Promise<Article> {
    const payload = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags
    };
    const art = await this.request<any>('/api/blog/articles/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return {
      ...art,
      tags: typeof art.tags === 'string'
        ? art.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : (Array.isArray(art.tags) ? art.tags : [])
    };
  }

  async updateArticle(slug: string, data: Partial<Omit<Article, 'id' | 'slug' | 'author' | 'created_at'>>): Promise<Article> {
    const payload = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags
    };
    const art = await this.request<any>(`/api/blog/articles/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return {
      ...art,
      tags: typeof art.tags === 'string'
        ? art.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : (Array.isArray(art.tags) ? art.tags : [])
    };
  }

  async deleteArticle(slug: string): Promise<void> {
    return this.request<void>(`/api/blog/articles/${slug}/`, {
      method: 'DELETE'
    });
  }

  // DIRECTORY/DOCTORS API
  async getNearbyDoctors(params: { lat?: number; lng?: number; radius_km?: number; specialization?: string }): Promise<DoctorListing[]> {
    let query = '';
    if (params.lat !== undefined) query += `lat=${params.lat}`;
    if (params.lng !== undefined) query += `&lng=${params.lng}`;
    if (params.radius_km !== undefined) query += `&radius_km=${params.radius_km}`;
    if (params.specialization) query += `&specialization=${encodeURIComponent(params.specialization)}`;
    if (query) query = '?' + query;
    return this.request<DoctorListing[]>(`/api/doctors/nearby/${query}`);
  }

  async getDoctorDetail(id: number): Promise<DoctorListing> {
    return this.request<DoctorListing>(`/api/doctors/${id}/`);
  }

  async claimDoctorListing(id: number): Promise<DoctorListing> {
    return this.request<DoctorListing>(`/api/doctors/${id}/claim/`, {
      method: 'POST'
    });
  }

  async verifyDoctorListing(id: number): Promise<DoctorListing> {
    return this.request<DoctorListing>(`/api/doctors/${id}/verify/`, {
      method: 'POST'
    });
  }

  async deleteDoctorListing(id: number): Promise<void> {
    return this.request<void>(`/api/doctors/${id}/`, {
      method: 'DELETE'
    });
  }

  // UPDATE PROFILE API FOR ALL ROLES
  async updateProfile(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    specialization?: string;
    registration_number?: string;
  }): Promise<User> {
    return this.request<User>('/api/accounts/profile/', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
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
