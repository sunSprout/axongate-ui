import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/api';
import { authApi } from '../api';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const response: any = await authApi.login({ username, password });
          // Support both legacy token-based and cookie-session responses
          if (response && response.token && response.user) {
            const { token, user } = response;
            localStorage.setItem('token', token);
            set({ token, user, isAuthenticated: true });
            return;
          }

          // Cookie-session shape: { user_id, username, role, message }
          if (response && (response.user_id || response.username)) {
            const user: User = {
              id: Number.parseInt(response.user_id, 10) || 0,
              username: response.username,
              role: response.role,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as User;
            set({ token: null, user, isAuthenticated: true });
            return;
          }

          throw new Error('Unexpected login response');
        } catch (error) {
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      checkAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
          set({ 
            token, 
            isAuthenticated: true 
          });
        } else {
          set({ 
            token: null, 
            isAuthenticated: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user 
      }),
    }
  )
);
