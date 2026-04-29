const API_BASE = 'http://localhost:8080/api';

// JWT Token management
function getToken(): string | null {
  return localStorage.getItem('healthcloud_token');
}

function setToken(token: string) {
  localStorage.setItem('healthcloud_token', token);
}

export function clearToken() {
  localStorage.removeItem('healthcloud_token');
  localStorage.removeItem('healthcloud_user');
}

export function getStoredUser(): any | null {
  const user = localStorage.getItem('healthcloud_user');
  return user ? JSON.parse(user) : null;
}

function setStoredUser(user: any) {
  localStorage.setItem('healthcloud_user', JSON.stringify(user));
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// Helper: make authenticated request with JWT token
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

export const api = {
  // ====== Auth (Public - no token needed) ======
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      setStoredUser(data.user);
    }
    return data;
  },

  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      setStoredUser(data.user);
    }
    return data;
  },

  logout() {
    clearToken();
  },

  // ====== Protected endpoints (JWT token sent automatically) ======

  // Users
  async getUsers() {
    const res = await authFetch(`${API_BASE}/users`);
    return res.json();
  },

  async addUser(user: any) {
    const res = await authFetch(`${API_BASE}/users`, {
      method: 'POST',
      body: JSON.stringify(user),
    });
    return res.json();
  },

  // Dashboard
  async getDashboardStats() {
    const res = await authFetch(`${API_BASE}/dashboard/stats`);
    return res.json();
  },

  // Health Readings (Chart data)
  async getChartData(limit = 20) {
    const res = await authFetch(`${API_BASE}/readings/chart?limit=${limit}`);
    return res.json();
  },

  async addReading(reading: any) {
    const res = await authFetch(`${API_BASE}/readings`, {
      method: 'POST',
      body: JSON.stringify(reading),
    });
    return res.json();
  },

  // Alerts
  async getAlerts() {
    const res = await authFetch(`${API_BASE}/alerts`);
    return res.json();
  },

  async markAlertReviewed(id: number) {
    const res = await authFetch(`${API_BASE}/alerts/${id}/reviewed`, {
      method: 'PUT',
    });
    return res.json();
  },

  // Locations
  async getLocations(limit = 20) {
    const res = await authFetch(`${API_BASE}/locations?limit=${limit}`);
    return res.json();
  },

  async addLocation(location: any) {
    const res = await authFetch(`${API_BASE}/locations`, {
      method: 'POST',
      body: JSON.stringify(location),
    });
    return res.json();
  },
};
