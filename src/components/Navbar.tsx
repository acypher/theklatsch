
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PenLine, LogOut, LogIn, MoveHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import IssueSelector from "@/components/IssueSelector";
import { useState, useEffect } from "react";
import { getCurrentIssue } from "@/lib/data";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const [currentIssue, setCurrentIssue] = useState<{ month: number; year: number } | null>(null);
  
  useEffect(() => {
    const fetchCurrentIssue = async () => {
      const issue = await getCurrentIssue();
      setCurrentIssue(issue);
    };
    
    fetchCurrentIssue();
  }, []);
  
  const getUserInitials = () => {
    if (!user) return "?";
    const email = user.email || "";
    return email.substring(0, 2).toUpperCase();
  };

  const handleIssueChange = (month: number, year: number) => {
    // This will be called when the issue is changed in the dropdown
    setCurrentIssue({ month, year });
  };

  return (
    <nav className="border-b shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-primary">The Klatsch</Link>
          
          {currentIssue && (
            <div className="w-auto">
              <IssueSelector onIssueChange={handleIssueChange} />
            </div>
          )}
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
