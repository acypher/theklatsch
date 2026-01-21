import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserPreferences } from "@/hooks/useUserPreferences";

const Profile = () => {
  const { user, profile, updateProfile, profileLoading } = useAuth();
  const { preferences, loading: preferencesLoading, updatePreferences } = useUserPreferences();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Local state for preferences (only saved on "Save Changes")
  const [localAutoMarkRead, setLocalAutoMarkRead] = useState(preferences.auto_mark_read);
  const [localShowListArticles, setLocalShowListArticles] = useState(preferences.show_list_articles);
  
  const navigate = useNavigate();

  // Sync local state when data loads
  useEffect(() => {
    setLocalAutoMarkRead(preferences.auto_mark_read);
    setLocalShowListArticles(preferences.show_list_articles);
  }, [preferences]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
    }
  }, [profile]);

  const handleCancel = () => {
    // Reset all local state to original values
    setDisplayName(profile?.display_name || "");
    setUsername(profile?.username || "");
    setLocalAutoMarkRead(preferences.auto_mark_read);
    setLocalShowListArticles(preferences.show_list_articles);
    setNewPassword("");
    setConfirmPassword("");
    navigate("/");
  };

  useEffect(() => {
    if (user && !profile && !profileLoading) {
      setIsCreatingProfile(true);
      createProfileForUser().catch(console.error);
    }
  }, [user, profile, profileLoading]);

  const createProfileForUser = async () => {
    if (!user) return;
    
    try {
      const { data, error: checkError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking profile:", checkError);
        toast.error("Error checking profile");
        return;
      }
      
      if (data) {
        return;
      }
      
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: null,
          display_name: null,
          avatar_url: null
        });
      
      if (error) {
        console.error("Error creating profile:", error);
        toast.error("Error creating profile");
        return;
      }
      
      toast.success("Profile created successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error in createProfileForUser:", error);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSubmitting(true);
    
    try {
      // Save profile info
      await updateProfile({ 
        display_name: displayName,
        username: username 
      });

      // Save reading preferences only if changed
      const preferencesChanged = 
        localAutoMarkRead !== preferences.auto_mark_read ||
        localShowListArticles !== preferences.show_list_articles;
      
      if (preferencesChanged) {
        await updatePreferences({
          auto_mark_read: localAutoMarkRead,
          show_list_articles: localShowListArticles,
        });
      }

      // Update password if changed
      if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          toast.error("Passwords do not match");
          setIsSubmitting(false);
          return;
        }
        
        if (newPassword.length < 6) {
          toast.error("Password must be at least 6 characters long");
          setIsSubmitting(false);
          return;
        }
        
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) {
          toast.error("Failed to update password: " + error.message);
          setIsSubmitting(false);
          return;
        }
        
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading || isCreatingProfile || preferencesLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">{isCreatingProfile ? "Creating your profile..." : "Loading..."}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container max-w-3xl py-10">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={user?.email || ""} 
                disabled 
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
              <p className="text-xs text-muted-foreground">
                This is your unique username
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name (or Initials)</Label>
              <Input 
                id="displayName" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your preferred display name or initials"
              />
              <p className="text-xs text-muted-foreground">
                This is the name or initials that will be displayed to other users
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Reading Preferences</CardTitle>
            <CardDescription>Manage how articles are marked as read</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto-mark-read"
                  checked={localAutoMarkRead}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      setLocalAutoMarkRead(checked);
                    }
                  }}
                />
                <Label htmlFor="auto-mark-read" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Automatically mark opened articles as read
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, articles will be automatically marked as read when you open them. You can still manually mark articles using the checkbox on each article card.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="show-list-articles"
                  checked={localShowListArticles}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      setLocalShowListArticles(checked);
                    }
                  }}
                />
                <Label htmlFor="show-list-articles" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Show 'list' articles
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, articles with the 'list' keyword will be shown with every issue. These are recurring reference articles that appear across all monthly issues.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password"
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom action buttons */}
        <div className="mt-6 flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAll}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Profile;
