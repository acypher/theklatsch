
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export type Profile = {
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
  resetPassword: (email: string) => Promise<{
    error: Error | null;
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

  // Cache management
  const CACHE_KEY = 'auth_profile_cache';
  
  const getCachedProfile = (): Profile | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const setCachedProfile = (profile: Profile | null) => {
    if (profile) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  };

  const fetchProfile = async (userId: string, forceRefresh: boolean = false) => {
    // Check cache first unless forcing refresh
    if (!forceRefresh) {
      const cachedProfile = getCachedProfile();
      if (cachedProfile && cachedProfile.id === userId) {
        setProfile(cachedProfile);
        setProfileLoading(false);
        return;
      }
    }

    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        const profileData: Profile = {
          id: data.id,
          username: data.username,
          display_name: data.display_name || null,
          avatar_url: data.avatar_url
        };
        setProfile(profileData);
        setCachedProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error && data.session) {
        navigate("/");
      }
      
      return { data: data.session, error };
    } catch (error) {
      console.error("Error during sign in:", error);
      return { data: null, error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (!error && data.session) {
        navigate("/");
      }
      
      return { data: data.session, error };
    } catch (error) {
      console.error("Error during sign up:", error);
      return { data: null, error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setCachedProfile(null); // Clear cache on sign out
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error("User not authenticated"), data: null };
    }

    try {
      if (updates.username !== undefined && !updates.username?.trim()) {
        throw new Error("Username cannot be empty");
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .maybeSingle(); // Using maybeSingle instead of single

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile: Profile = {
        id: data.id,
        username: data.username,
        display_name: data.display_name || null,
        avatar_url: data.avatar_url
      };
      
      setProfile(updatedProfile);
      setCachedProfile(updatedProfile); // Update cache when profile is updated
      toast.success("Profile updated successfully");
      return { error: null, data: updatedProfile };
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      return { error: error as Error, data: null };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      
      if (error) {
        toast.error("Failed to send reset email: " + error.message);
        return { error };
      }
      
      toast.success("Password reset email sent! Check your inbox.");
      return { error: null };
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Failed to send reset email");
      return { error: error as Error };
    }
  };

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
      resetPassword,
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
