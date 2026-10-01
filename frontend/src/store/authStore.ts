// import { create } from 'zustand';
// import { authEndpoints } from '../api/endpoints';
// import type { User, LoginData, RegisterData } from '../types';

// interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string | null;
//   login: (data: LoginData) => Promise<void>;
//   register: (data: RegisterData) => Promise<void>;
//   logout: () => void;
//   fetchUser: () => Promise<void>;
//   clearError: () => void;
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   isAuthenticated: false,
//   isLoading: false,
//   error: null,

//   login: async (data: LoginData) => {
//     set({ isLoading: true, error: null });
//     try {
//       const response = await authEndpoints.login(data);
//       localStorage.setItem('access_token', response.data.access_token);
//       set({ isAuthenticated: true, isLoading: false });
//       // Fetch user data after login
//       const userResponse = await authEndpoints.me();
//       set({ user: userResponse.data, isLoading: false });
//     } catch (error: any) {
//       set({
//         error: error.response?.data?.detail || 'Login failed',
//         isLoading: false,
//       });
//       throw error;
//     }
//   },

//   register: async (data: RegisterData) => {
//     set({ isLoading: true, error: null });
//     try {
//       const response = await authEndpoints.register(data);
//       localStorage.setItem('access_token', response.data.access_token);
//       const userResponse = await authEndpoints.me();
//       set({ user: userResponse.data, isAuthenticated: true, isLoading: false });
//     } catch (error: any) {
//       set({
//         error: error.response?.data?.detail || 'Registration failed',
//         isLoading: false,
//       });
//       throw error;
//     }
//   },

//   logout: () => {
//     localStorage.removeItem('access_token');
//     set({ user: null, isAuthenticated: false });
//   },

//   fetchUser: async () => {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       set({ isAuthenticated: false });
//       return;
//     }
//     try {
//       const response = await authEndpoints.me();
//       set({ user: response.data, isAuthenticated: true });
//     } catch (error) {
//       localStorage.removeItem('access_token');
//       set({ user: null, isAuthenticated: false });
//     }
//   },

//   clearError: () => set({ error: null }),
// }));

import { create } from 'zustand';
import { authEndpoints } from '../api/endpoints';
import type { User, LoginData, RegisterData } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authEndpoints.login(data);
      localStorage.setItem('access_token', response.data.access_token);
      
      // Убрали лишний await, так как set синхронный
      set({ isAuthenticated: true, isLoading: false });
      
      // Fetch user data after login
      const userResponse = await authEndpoints.me();
      set({ user: userResponse.data, isLoading: false });
    } catch (error: any) {
      // Если упало на этапе me(), очищаем токен и сбрасываем состояние
      localStorage.removeItem('access_token');
      set({
        error: error.response?.data?.detail || 'Login failed',
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authEndpoints.register(data);
      localStorage.setItem('access_token', response.data.access_token);
      
      const userResponse = await authEndpoints.me();
      set({ user: userResponse.data, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      // Аналогично чистим токен и сбрасываем состояние при ошибке
      localStorage.removeItem('access_token');
      set({
        error: error.response?.data?.detail || 'Registration failed',
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    try {
      const response = await authEndpoints.me();
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));