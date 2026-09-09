import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, type Profile } from '@/services/supabase';

type AuthUser = Profile;

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const mockUsers: Record<string, AuthUser> = {
  'student@demo.com': {
    id: 'demo-student',
    first_name: 'Alex',
    username: 'alex_student',
    email: 'student@demo.com',
    role: 'student',
    level: 'Grade 10',
    school: 'Demo High School',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'teacher@demo.com': {
    id: 'demo-teacher',
    first_name: 'Jordan',
    username: 'jordan_teacher',
    email: 'teacher@demo.com',
    role: 'teacher',
    level: null,
    school: 'Demo High School',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    username: string;
    role: 'student' | 'teacher';
    level?: string;
    school?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        if (USE_MOCKS) {
          const user = mockUsers[email];
          if (!user || password !== 'password123') {
            throw new Error('Invalid demo credentials. Use the demo buttons to fill in credentials.');
          }
          set({ user, isAuthenticated: true });
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) throw new Error('Profile not found');

        set({ user: profile as AuthUser, isAuthenticated: true });
      },

      register: async (data) => {
        if (USE_MOCKS) {
          const user: AuthUser = {
            id: `demo-${Date.now()}`,
            first_name: data.firstName,
            username: data.username,
            email: data.email,
            role: data.role,
            level: data.level ?? null,
            school: data.school ?? null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          set({ user, isAuthenticated: true });
          return;
        }

        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        if (!authData.user) throw new Error('Registration failed');

        const profile: Omit<Profile, 'created_at' | 'updated_at'> = {
          id: authData.user.id,
          first_name: data.firstName,
          username: data.username,
          email: data.email,
          role: data.role,
          level: data.level ?? null,
          school: data.school ?? null,
        };

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert(profile)
          .select('*')
          .maybeSingle();

        if (profileError) throw profileError;

        set({ user: profileData as AuthUser, isAuthenticated: true });
      },

      logout: async () => {
        if (!USE_MOCKS) {
          await supabase.auth.signOut();
        }
        set({ user: null, isAuthenticated: false });
      },

      refreshProfile: async () => {
        if (USE_MOCKS) {
          set({ isLoading: false });
          return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .maybeSingle();

        if (error || !profile) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        set({ user: profile as AuthUser, isAuthenticated: true, isLoading: false });
      },

      updateUser: (updates) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...updates } });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'mathmaster-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
