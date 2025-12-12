import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
// export interface User {
//     id: number;
//     email: string;
//     user_metadata?: { name?: string; avatar_url?: string };
//     app_metadata?: any;
//     confirmed_at?: string;
//     created_at?: string;
//     token?: string;
//   }
  
//   interface UserState {
//     user: User | null;
//     loading: boolean;
//     error: Error | null;
//     fetchUser: () => Promise<void>;
//     setUser: (user: User | null) => void;
//   }

const clientStorage = {
    getItem: (name) => (typeof window !== 'undefined' ? localStorage.getItem(name) : null),
    setItem: (name, value) => {
      if (typeof window !== 'undefined') localStorage.setItem(name, value);
    },
    removeItem: (name) => {
      if (typeof window !== 'undefined') localStorage.removeItem(name);
    },
  };
  const useUserStore = create()(
    persist(
      (set) => ({
        user: null,
        loading: false,
        error: null,
        fetchUser: async () => {
          try {
            set({ loading: true });
            const response = await fetch('/api/user');
            if (!response.ok) throw new Error('Failed to fetch user');
            const user = await response.json();
            set({ user, error: null });
          } catch (err) {
            set({ error: err  instanceof Error ? err : new Error('Unknown error') });
          } finally {
            set({ loading: false });
          }
        },
        setUser: (user) => set({ user }),
      }),
      { name: 'agentok-user-storage', storage: createJSONStorage(() => clientStorage) }
    )
  );
  export default useUserStore