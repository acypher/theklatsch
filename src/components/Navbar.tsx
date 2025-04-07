
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PenLine, LogOut, LogIn, MoveHorizontal, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Issue, getAvailableIssues, setCurrentIssue } from "@/lib/data/issue/availableIssues";
import { toast } from "sonner";

interface NavbarProps {
  onLogoClick?: () => void;
  currentIssue?: string;
}

const Navbar = ({ onLogoClick, currentIssue }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadIssues = async () => {
      const availableIssues = await getAvailableIssues();
      setIssues(availableIssues);
    };
    
    loadIssues();
  }, []);
  
  const getUserInitials = () => {
    if (!user) return "?";
    const email = user.email || "";
    return email.substring(0, 2).toUpperCase();
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
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button asChild variant="outline">
                <Link to="/?mode=arrange" className="flex items-center gap-2">
                  <MoveHorizontal size={18} />
                  Arrange
                </Link>
              </Button>
              
              <Button asChild variant="default">
                <Link to="/create" className="flex items-center gap-2">
                  <PenLine size={18} />
                  Write Article
                </Link>
              </Button>
              
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user.email}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button variant="ghost" size="icon" onClick={signOut}>
                  <LogOut size={18} />
                </Button>
              </div>
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
