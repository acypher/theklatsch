
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
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Issue, getAvailableIssues, setCurrentIssue } from "@/lib/data/issue/availableIssues";
import { BackIssue, getBackIssues } from "@/lib/data/issue/backIssues";
import { getLatestIssueText } from "@/lib/data/issue";
import { toast } from "sonner";
import ReadFilter from "./article/ReadFilter";

interface NavbarProps {
  onLogoClick?: () => void;
  currentIssue?: string;
  showReadFilter?: boolean;
  filterEnabled?: boolean;
  onFilterToggle?: (enabled: boolean) => void;
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
  const [backIssues, setBackIssues] = useState<BackIssue[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadIssues = async () => {
      const availableIssues = await getAvailableIssues();
      setIssues(availableIssues);
      
      const backIssuesData = await getBackIssues();
      console.log("Back issues loaded in Navbar:", backIssuesData);
      setBackIssues(backIssuesData);
    };
    
    loadIssues();
  }, []);
  
  const getUserInitials = () => {
    if (!user) return "?";
    
    console.log('User object:', user);
    console.log('Profile object:', profile);
    console.log('Email address:', user.email);
    
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
        window.location.reload();
      }
    } catch (error) {
      console.error("Error changing issue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackIssueSelect = async (backIssue: BackIssue) => {
    try {
      console.log("Selected back issue:", backIssue);
      const latestIssue = await getLatestIssueText();
      const success = await setCurrentIssue(latestIssue);
      
      if (success && backIssue.url) {
        window.open(backIssue.url, '_blank')?.focus();
        toast.success(`Opening ${backIssue.display_issue}`);
      } else {
        console.error("Failed to handle back issue or URL is missing:", backIssue);
        toast.error("Failed to open back issue");
      }
    } catch (error) {
      console.error("Error handling back issue selection:", error);
      toast.error("Failed to open back issue");
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
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Current Issues</DropdownMenuLabel>
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
                  </DropdownMenuGroup>
                  
                  {backIssues.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Back Issues</DropdownMenuLabel>
                        {backIssues.map((backIssue) => (
                          <DropdownMenuItem
                            key={`back-${backIssue.id}`}
                            className="cursor-pointer"
                            onClick={() => handleBackIssueSelect(backIssue)}
                          >
                            {backIssue.display_issue}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </Link>
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
