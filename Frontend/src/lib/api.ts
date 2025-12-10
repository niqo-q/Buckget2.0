/**
 * API Client for BuckGet Backend
 * Handles all HTTP requests with JWT authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Token storage
let accessToken: string | null = localStorage.getItem('buckget_token');

export function setToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('buckget_token', token);
  } else {
    localStorage.removeItem('buckget_token');
  }
}

export function getToken(): string | null {
  return accessToken;
}

export function isAuthenticated(): boolean {
  return !!accessToken;
}

// HTTP client with auth header
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    setToken(null);
    window.location.href = '/';
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============== Auth API ==============

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  ic_number?: string;
  phone?: string;
  hourly_rate: number;
  current_available: number;
  total_saved: number;
  is_active: boolean;
  role_id?: string;
  created_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  ic_number?: string;
  phone?: string;
  hourly_rate?: number;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    setToken(data.access_token);
    return data;
  },

  async register(data: RegisterData): Promise<User> {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async me(): Promise<User> {
    return request('/api/auth/me');
  },

  logout() {
    setToken(null);
  },
};

// ============== Users API ==============

export const usersApi = {
  async list(skip = 0, limit = 100): Promise<User[]> {
    return request(`/api/users?skip=${skip}&limit=${limit}`);
  },

  async get(id: string): Promise<User> {
    return request(`/api/users/${id}`);
  },

  async create(data: RegisterData): Promise<User> {
    return request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    return request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return request(`/api/users/${id}`, { method: 'DELETE' });
  },
};

// ============== Buckets API ==============

export interface Bucket {
  id: string;
  user_id: string;
  name: string;
  target: number;
  current: number;
  icon: string;
  color: string;
  created_at: string;
}

export interface CreateBucketData {
  name: string;
  target: number;
  current?: number;
  icon?: string;
  color?: string;
}

export const bucketsApi = {
  async list(): Promise<Bucket[]> {
    return request('/api/buckets');
  },

  async get(id: string): Promise<Bucket> {
    return request(`/api/buckets/${id}`);
  },

  async create(data: CreateBucketData): Promise<Bucket> {
    return request('/api/buckets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<CreateBucketData>): Promise<Bucket> {
    return request(`/api/buckets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return request(`/api/buckets/${id}`, { method: 'DELETE' });
  },

  async addMoney(id: string, amount: number): Promise<Bucket> {
    return request(`/api/buckets/${id}/add-money?amount=${amount}`, {
      method: 'POST',
    });
  },
};

// ============== Transactions API ==============

export interface Transaction {
  id: string;
  user_id: string;
  type: 'unlock' | 'stash' | 'transfer';
  amount: number;
  description?: string;
  bucket_id?: string;
  created_at: string;
}

export interface SplitFundsData {
  get_amount: number;
  save_amount: number;
  bucket_id?: string;
}

export const transactionsApi = {
  async list(skip = 0, limit = 50, type?: string): Promise<Transaction[]> {
    let url = `/api/transactions?skip=${skip}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    return request(url);
  },

  async get(id: string): Promise<Transaction> {
    return request(`/api/transactions/${id}`);
  },

  async create(data: { type: string; amount: number; description?: string; bucket_id?: string }): Promise<Transaction> {
    return request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async split(data: SplitFundsData): Promise<{ success: boolean; new_available: number; new_total_saved: number }> {
    return request('/api/transactions/split', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async addWages(hours: number): Promise<{ success: boolean; amount_added: number; new_available: number }> {
    return request(`/api/transactions/add-wages?hours=${hours}`, {
      method: 'POST',
    });
  },
};

// ============== Roles API ==============

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  created_at: string;
}

export const rolesApi = {
  async list(): Promise<Role[]> {
    return request('/api/roles');
  },

  async get(id: string): Promise<Role> {
    return request(`/api/roles/${id}`);
  },

  async create(data: { name: string; permissions: string[] }): Promise<Role> {
    return request('/api/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: { name?: string; permissions?: string[] }): Promise<Role> {
    return request(`/api/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return request(`/api/roles/${id}`, { method: 'DELETE' });
  },
};

// ============== Settings API ==============

export interface UserSettings {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  theme: string;
  language: string;
  tier: string;
  save_percentage: number;
}

export const settingsApi = {
  async get(): Promise<UserSettings> {
    return request('/api/settings');
  },

  async update(data: Partial<UserSettings>): Promise<UserSettings> {
    return request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============== AI Agent API ==============

export interface AIResponse {
  reply: string;
  action?: {
    type: string;
    get?: number;
    save?: number;
  };
}

export const aiAgentApi = {
  async query(message: string): Promise<AIResponse> {
    return request('/api/ai-agent/query', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  async history(limit = 10): Promise<{ message: string; response: string; created_at: string }[]> {
    return request(`/api/ai-agent/history?limit=${limit}`);
  },
};

