import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Generic entity store interface
export interface EntityStore<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  add: (item: Omit<T, 'id' | 'trashed' | 'updatedAt' | 'isSynced'>) => Promise<void>;
  update: (id: string, updates: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setItems: (items: T[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Create a generic entity store factory
export function createEntityStore<T extends { id: string }>(
  name: string,
  initialItems: T[] = [],
): () => EntityStore<T> {
  return create<EntityStore<T>>()(
    devtools(
      (set, _get) => ({
        items: initialItems,
        isLoading: false,
        error: null,

        add: async itemData => {
          set({ isLoading: true, error: null });
          try {
            const newItem = {
              ...itemData,
              id: Date.now().toString(), // Temporary ID for local state
              trashed: false,
              updatedAt: new Date(),
              isSynced: false,
            } as unknown as T;

            set(state => ({
              items: [...state.items, newItem],
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to add item',
              isLoading: false,
            });
          }
        },

        update: async (id, updates) => {
          set({ isLoading: true, error: null });
          try {
            set(state => ({
              items: state.items.map(item =>
                item.id === id
                  ? { ...item, ...updates, updatedAt: new Date(), isSynced: false }
                  : item,
              ),
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update item',
              isLoading: false,
            });
          }
        },

        remove: async id => {
          set({ isLoading: true, error: null });
          try {
            set(state => ({
              items: state.items.filter(item => item.id !== id),
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to remove item',
              isLoading: false,
            });
          }
        },

        setItems: items => set({ items }),
        setLoading: isLoading => set({ isLoading }),
        setError: error => set({ error }),
        clearError: () => set({ error: null }),
      }),
      { name },
    ),
  );
}

// User type for authentication
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// Authentication store interface
export interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Create authentication store
export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, _get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email: string, _password: string) => {
        set({ isLoading: true, error: null });
        try {
          // This will be implemented with Supabase
          // For now, just simulate login
          const user = { id: '1', email, created_at: new Date().toISOString() };
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          // This will be implemented with Supabase
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false,
          });
        }
      },

      setUser: user => set({ user, isAuthenticated: !!user }),
      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),
      clearError: () => set({ error: null }),
    }),
    { name: 'auth-store' },
  ),
);
