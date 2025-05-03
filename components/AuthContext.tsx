"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// Define context type
interface AuthContextType {
  session: any; // Replace 'any' with Session type from @supabase/supabase-js if available
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add type for props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<any>(null); // Use Session type here too
  const supabase = useRef(createSupabaseBrowserClient()).current;

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
    // Get initial session
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ session }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 