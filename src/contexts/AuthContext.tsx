
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, username: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{
    error: Error | null;
    data: Profile | null;
  }>;
  loading: boolean;
  profileLoading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch profile if user is logged in
        if (currentSession?.user) {
          fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && data.session) {
      navigate("/");
    }
    
    return { data: data.session, error };
  };

  const signUp = async (email: string, password: string, username: string) => {
    // Use emailRedirectTo: undefined to disable email confirmation
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: undefined,
      },
    });
    
    if (!error && data.session) {
      navigate("/");
    }
    
    return { data: data.session, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error("User not authenticated"), data: null };
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data as Profile);
      toast.success("Profile updated successfully");
      return { error: null, data: data as Profile };
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      return { error: error as Error, data: null };
    }
  };

  // Calculate isAuthenticated based on user presence
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile,
      signIn, 
      signUp, 
      signOut,
      updateProfile,
      loading,
      profileLoading,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
