/**
 * API Service Layer for the Mobile App.
 * Handles all HTTP communication with the Spring Boot backend.
 * 
 * Features:
 * - JWT token injection in headers
 * - Auto retry on failure
 * - Error handling
 * - Base URL configuration
 */
import { Capacitor } from '@capacitor/core';

// Backend base URL — Production (Render) or Local development
const RENDER_URL = 'https://final-year-project-1lcx.onrender.com/api/mobile';
const LOCAL_URL = 'http://localhost:8080/api/mobile';

// Use production URL by default, switch to LOCAL_URL for local development
const API_BASE_URL = RENDER_URL;

/**
 * Get stored JWT token from localStorage.
 */
function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Make an authenticated API request with automatic JWT injection and retry logic.
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = 2
): Promise<T> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle token expiration
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        // Force redirect to login
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (error: any) {
      // Don't retry on auth errors
      if (error.message?.includes('Session expired')) throw error;
      
      // Retry on network errors
      if (attempt < retries && (error.name === 'TypeError' || error.message?.includes('fetch'))) {
        console.warn(`API request failed (attempt ${attempt + 1}/${retries + 1}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      
      throw error;
    }
  }

  throw new Error('Request failed after all retries');
}

// ==================== AUTH APIs ====================

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    branch?: string;
    admissionNumber?: string;
  };
}

/**
 * Student Login
 */
export async function loginAPI(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Student Registration
 */
export async function registerAPI(name: string, email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * Validate existing JWT token (splash screen check)
 */
export async function validateTokenAPI(): Promise<{ valid: boolean; user: LoginResponse['user'] }> {
  return apiRequest('/auth/validate');
}

// ==================== HEALTH DATA APIs ====================

export interface HealthDataItem {
  heartRate: number;
  steps: number;
  timestamp: number;
  temperature?: number;
  spo2?: number;
}

/**
 * Batch upload health readings from smartwatch
 */
export async function batchUploadHealthData(items: HealthDataItem[]): Promise<{ saved: number; alertsGenerated: number }> {
  return apiRequest('/health-data', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

/**
 * Get latest vitals for dashboard
 */
export async function getLatestVitals(): Promise<{
  heartRate: number;
  steps: number;
  temperature: number;
  spo2: number;
  lastUpdated: string | null;
}> {
  return apiRequest('/health-data/latest');
}

/**
 * Get health history with period filter
 */
export async function getHealthHistory(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<Array<{
  date?: string;
  label: string;
  avgHeartRate: number;
  totalSteps: number;
}>> {
  return apiRequest(`/health-data/history?period=${period}`);
}

/**
 * Get dashboard summary stats
 */
export async function getHealthSummary(): Promise<{
  todayAvgHeartRate: number;
  todaySteps: number;
  totalReadings: number;
  lastSyncTime: string | null;
}> {
  return apiRequest('/health-data/summary');
}

// ==================== PROFILE APIs ====================

export interface ProfileData {
  id: number;
  name: string;
  email: string;
  branch?: string;
  admissionNumber?: string;
  emergencyContact?: string;
  status: string;
  role: string;
  createdAt: string;
}

/**
 * Get student profile
 */
export async function getProfile(): Promise<ProfileData> {
  return apiRequest('/profile');
}

/**
 * Update student profile
 */
export async function updateProfile(data: Partial<Pick<ProfileData, 'name' | 'branch' | 'admissionNumber' | 'emergencyContact'>>): Promise<{ message: string }> {
  return apiRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ==================== ALERT APIs ====================

export interface AlertData {
  id: number;
  userId: number;
  userName: string;
  type: string;
  severity: string;
  message: string;
  reviewed: boolean;
  createdAt: string;
}

/**
 * Get student's alerts
 */
export async function getAlerts(): Promise<AlertData[]> {
  return apiRequest('/alerts');
}

/**
 * Get unread alert count
 */
export async function getUnreadAlertCount(): Promise<{ unreadCount: number }> {
  return apiRequest('/alerts/unread');
}
