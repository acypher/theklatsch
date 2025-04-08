
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { user, profile, updateProfile, profileLoading } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      await updateProfile({ display_name: displayName });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
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
          
          <form onSubmit={handleSubmit}>
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
                  value={profile?.username || ""} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Username was set during registration
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your preferred display name"
                />
                <p className="text-xs text-muted-foreground">
                  This is the name that will be displayed to other users
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !displayName.trim()}
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
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
};

export default Profile;
