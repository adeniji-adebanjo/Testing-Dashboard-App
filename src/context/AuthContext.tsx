"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  AuthUser,
  getCurrentUser,
  signIn as authSignIn,
  signOut as authSignOut,
  onAuthStateChange,
  demoSignIn,
} from "@/lib/auth";
import { isSupabaseEnabled } from "@/lib/supabase";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isExecutive: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  demoLogin: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to get current user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes if Supabase is enabled
    if (isSupabaseEnabled()) {
      const { unsubscribe } = onAuthStateChange((newUser) => {
        setUser(newUser);
      });

      return () => unsubscribe();
    }
  }, []);

  const signIn = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const { user: authUser, error } = await authSignIn(email, password);

        if (error) {
          return { success: false, error };
        }

        setUser(authUser);
        return { success: true };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authSignOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const demoLogin = useCallback((email: string) => {
    const demoUser = demoSignIn(email);
    setUser(demoUser);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isExecutive: user?.isExecutive ?? false,
    signIn,
    signOut,
    demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
