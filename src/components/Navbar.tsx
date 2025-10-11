
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PenLine, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Issue, getAvailableIssues, setCurrentIssue } from "@/lib/data/issue/availableIssues";
import { toast } from "sonner";
import ReadFilter from "./article/ReadFilter";
import { supabase } from "@/integrations/supabase/client";
import UserMenu from "./navbar/UserMenu";
import IssueSelector from "./navbar/IssueSelector";
import ArchivesMenu from "./navbar/ArchivesMenu";
import SearchBar from "./SearchBar";

interface NavbarProps {
  onLogoClick?: () => void;
  currentIssue?: string;
  showReadFilter?: boolean;
  filterEnabled?: boolean;
  onFilterToggle?: (enabled: boolean) => void;
  onSearch?: (query: string) => void;
  onClearSearch?: () => void;
  searchQuery?: string;
}

const Navbar = ({ 
  onLogoClick, 
  currentIssue, 
  showReadFilter = false,
  filterEnabled = false,
  onFilterToggle,
  onSearch,
  onClearSearch,
  searchQuery = ""
}: NavbarProps) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [backIssues, setBackIssues] = useState<any[]>([]);
  const [loadingArchives, setLoadingArchives] = useState(false);
  
  const hideWriteButton = location.pathname.startsWith('/article') || location.pathname.startsWith('/edit-article');

  useEffect(() => {
    const loadIssues = async () => {
      const availableIssues = await getAvailableIssues();
      setIssues(availableIssues);
    };
    loadIssues();
  }, []);

  const getUserInitials = () => {
    if (!user) return "?";
    
    if (profile?.display_name) {
      const nameParts = profile.display_name.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return profile.display_name.substring(0, 2).toUpperCase();
    }
    
    if (user.email) {
      const emailParts = user.email.split('@')[0].split('.');
      if (emailParts.length >= 2) {
        return `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase();
      }
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
      
      // Simple reload without verification to avoid interference
      // The setCurrentIssue function handles the database updates
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } else {
      toast.error("Failed to change issue");
    }
  } catch (error) {
    console.error("Error changing issue:", error);
    toast.error("Failed to change issue");
  } finally {
    setLoading(false);
  }
};



  
  const handleArchiveClick = (archiveIssue: string | null) => {
    if (archiveIssue) {
      // Treat archives like issue changes instead of opening URLs
      handleIssueChange(archiveIssue);
    } else {
      toast.warning("No issue information available for this archive");
    }
  };

  useEffect(() => {
    const fetchBackIssues = async () => {
      setLoadingArchives(true);
      try {
        const { data, error } = await supabase
          .from('back_issues')
          .select('id, display_issue, url')
          .order('id', { ascending: false });

        if (error) throw error;
        setBackIssues(data || []);
      } catch (error) {
        console.error("Error fetching back issues:", error);
        toast.error("Failed to load archives");
      } finally {
        setLoadingArchives(false);
      }
    };

    fetchBackIssues();
  }, []); // Removed the user dependency to load archives for all users

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
              <IssueSelector 
                currentIssue={currentIssue}
                issues={issues}
                loading={loading}
                onIssueChange={handleIssueChange}
              />
            )}
          </Link>
          
          {/* Removed the user condition to show archives to all users */}
            <ArchivesMenu 
              backIssues={backIssues}
              loadingArchives={loadingArchives}
            />
        </div>
        
        <div className="flex items-center gap-4">
          {onSearch && onClearSearch && (
            <div className={`${user ? 'flex-1 max-w-lg' : 'max-w-md'}`}>
              <SearchBar
                onSearch={onSearch}
                onClear={onClearSearch}
                currentQuery={searchQuery}
                placeholder="Search articles..."
              />
            </div>
          )}
          {showReadFilter && user && onFilterToggle && (
            <ReadFilter 
              enabled={filterEnabled} 
              onToggle={onFilterToggle}
            />
          )}
          {user ? (
            <>
              {!hideWriteButton && (
                <Button asChild variant="default">
                  <Link to="/create" className="flex items-center gap-2">
                    <PenLine size={18} />
                    Write Article
                  </Link>
                </Button>
              )}
              
              <UserMenu
                profile={profile}
                userEmail={user.email}
                getUserInitials={getUserInitials}
                signOut={signOut}
              />
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
