import { create } from 'zustand';
import { loginAPI, registerAPI, validateTokenAPI, type LoginResponse } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  branch?: string;
  admissionNumber?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  /** Login with college email and password via backend API */
  login: (email: string, password: string) => Promise<void>;

  /** Register a new student account */
  register: (name: string, email: string, password: string) => Promise<void>;

  /** Validate stored token on app startup (splash screen) */
  validateToken: () => Promise<boolean>;

  /** Logout and clear stored token */
  logout: () => void;

  /** Clear any error messages */
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response: LoginResponse = await loginAPI(email, password);
      
      localStorage.setItem('auth_token', response.token);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.message || 'Login failed. Please try again.',
        isAuthenticated: false,
      });
      throw err;
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response: LoginResponse = await registerAPI(name, email, password);
      
      localStorage.setItem('auth_token', response.token);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.message || 'Registration failed. Please try again.',
      });
      throw err;
    }
  },

  validateToken: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return false;
    }

    try {
      const response = await validateTokenAPI();
      if (response.valid) {
        set({
          user: response.user,
          isAuthenticated: true,
          token,
        });
        return true;
      }
      // Token invalid
      localStorage.removeItem('auth_token');
      set({ isAuthenticated: false, user: null, token: null });
      return false;
    } catch {
      // Network error or token invalid — treat as logged out
      localStorage.removeItem('auth_token');
      set({ isAuthenticated: false, user: null, token: null });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
