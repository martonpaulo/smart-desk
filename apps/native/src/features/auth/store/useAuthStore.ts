import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { supabase, handleSupabaseError } from 'src/config/supabase';
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
} from 'src/features/auth/types/AuthTypes';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, _get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        try {
          if (credentials.password !== credentials.confirmPassword) {
            throw new Error('Passwords do not match');
          }

          const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signOut();

          if (error) {
            throw new Error(handleSupabaseError(error));
          }

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user: User | null) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setError: (error: string | null) => set({ error }),

      initialize: async () => {
        set({ isLoading: true });
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          set({
            user: session?.user || null,
            isAuthenticated: !!session?.user,
            isLoading: false,
          });

          // Listen for auth changes
          supabase.auth.onAuthStateChange((event, session) => {
            set({
              user: session?.user || null,
              isAuthenticated: !!session?.user,
            });
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Initialization failed',
            isLoading: false,
          });
        }
      },
    }),
    { name: 'auth-store' }
  )
);
