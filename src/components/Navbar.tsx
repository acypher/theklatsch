import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PenLine, LogOut, LogIn, ChevronDown, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Issue, getAvailableIssues, setCurrentIssue } from "@/lib/data/issue/availableIssues";
import { toast } from "sonner";
import ReadFilter from "./article/ReadFilter";
import { supabase } from "@/integrations/supabase/client";

interface NavbarProps {
  onLogoClick?: () => void;
  currentIssue?: string;
  showReadFilter?: boolean;
  filterEnabled?: boolean;
  onFilterToggle?: (enabled: boolean) => void;
}

interface BackIssue {
  id: number;
  display_issue: string | null;
  url: string | null;
}

const Navbar = ({ 
  onLogoClick, 
  currentIssue, 
  showReadFilter = false,
  filterEnabled = false,
  onFilterToggle 
}: NavbarProps) => {
  const { user, profile, signOut } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [backIssues, setBackIssues] = useState<BackIssue[]>([]);
  const [loadingArchives, setLoadingArchives] = useState(false);
  
  useEffect(() => {
    const loadIssues = async () => {
      const availableIssues = await getAvailableIssues();
      setIssues(availableIssues);
    };
    
    loadIssues();
  }, []);
  
  const getUserInitials = () => {
    if (!user) return "?";
    
    console.log('User object:', user);
    console.log('Profile object:', profile);
    console.log('Email address:', user.email);
    
    // Use display_name from profile if available
    if (profile?.display_name) {
      const nameParts = profile.display_name.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return profile.display_name.substring(0, 2).toUpperCase();
    }
    
    // Fallback to email if no display name
    if (user.email) {
      // If email contains a dot, use first letter of each part before the @ symbol
      const emailParts = user.email.split('@')[0].split('.');
      if (emailParts.length >= 2) {
        return `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase();
      }
      // Otherwise use first two letters of email
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return "??";
  };

  const handleLogoClick = (event: React.MouseEvent) => {
    if (onLogoClick) {
      event.preventDefault();
      onLogoClick();
    }
  };

  const handleIssueChange = async (issueText: string) => {
    setLoading(true);
    try {
      const success = await setCurrentIssue(issueText);
      if (success) {
        toast.success(`Switched to ${issueText}`);
        // Reload the page to reflect the change
        window.location.reload();
      }
    } catch (error) {
      console.error("Error changing issue:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBackIssues = async () => {
      try {
        const { data, error } = await supabase
          .from('back_issues')
          .select('id, display_issue, url')
          .order('id', { ascending: false });

        if (error) {
          throw error;
        }

        setBackIssues(data || []);
      } catch (error) {
        console.error("Error fetching back issues:", error);
        toast.error("Failed to load archives");
      }
    };

    if (user) {
      fetchBackIssues();
    }
  }, [user]);

  const handleArchiveClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.warning("No URL available for this archive");
    }
  };

  return (
    <nav className="border-b shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="text-2xl font-bold text-primary flex items-center gap-2"
            onClick={handleLogoClick}
          >
            The Klatsch
            {currentIssue && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    id="currentIssue" 
                    className="text-2xl font-bold text-primary ml-2 flex items-center"
                    disabled={loading}
                  >
                    {currentIssue}
                    <ChevronDown className="h-5 w-5 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-background">
                  {issues.length > 0 ? (
                    issues.map((issue) => (
                      <DropdownMenuItem
                        key={`${issue.month}-${issue.year}`}
                        className="cursor-pointer"
                        onClick={() => handleIssueChange(issue.text)}
                      >
                        {issue.text}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>No issues available</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </Link>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  id="archivesButton" 
                  className="text-base font-semibold text-muted-foreground ml-2 flex items-center"
                  disabled={loadingArchives}
                >
                  Archives
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-background">
                {backIssues.length > 0 ? (
                  backIssues.map((issue) => (
                    <DropdownMenuItem
                      key={issue.id}
                      className="cursor-pointer"
                      onClick={() => handleArchiveClick(issue.url)}
                    >
                      {issue.display_issue || `Archive ${issue.id}`}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No archives available</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {showReadFilter && user && onFilterToggle && (
            <ReadFilter 
              enabled={filterEnabled} 
              onToggle={onFilterToggle}
            />
          )}
          {user ? (
            <>
              <Button asChild variant="default">
                <Link to="/create" className="flex items-center gap-2">
                  <PenLine size={18} />
                  Write Article
                </Link>
              </Button>
              
              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Avatar className="h-8 w-8 cursor-pointer">
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {profile?.display_name || user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild variant="default">
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn size={18} />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
