import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  ProfileDB, 
  GroupDB, 
  getProfile,
  getUserGroups,
  signOut as dbSignOut
} from '@/lib/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileDB | null;
  groups: GroupDB[];
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  refreshGroups: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileDB | null>(null);
  const [groups, setGroups] = useState<GroupDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await getProfile(user.id);
    if (data) setProfile(data);
  };

  const refreshGroups = async () => {
    if (!user) return;
    const { data } = await getUserGroups(user.id);
    if (data) setGroups(data);
  };

  const logout = async () => {
    await dbSignOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setGroups([]);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer data fetching with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            getProfile(session.user.id).then(({ data }) => {
              if (data) setProfile(data);
            });
            getUserGroups(session.user.id).then(({ data }) => {
              if (data) setGroups(data);
            });
          }, 0);
        } else {
          setProfile(null);
          setGroups([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          getProfile(session.user.id),
          getUserGroups(session.user.id)
        ]).then(([profileResult, groupsResult]) => {
          if (profileResult.data) setProfile(profileResult.data);
          if (groupsResult.data) setGroups(groupsResult.data);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      groups,
      isLoading,
      isAuthenticated,
      refreshProfile,
      refreshGroups,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
