import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found. Using localStorage only.");
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Generate or retrieve session ID
export const getSessionId = (): string => {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("testing_session_id");

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("testing_session_id", sessionId);
  }

  return sessionId;
};

// Set session ID (for syncing across devices)
export const setSessionId = (sessionId: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("testing_session_id", sessionId);
};

// Check if Supabase is available
export const isSupabaseEnabled = (): boolean => {
  return supabase !== null;
};
