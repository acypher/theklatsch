
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PenLine, LogOut, LogIn, MoveHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavbarProps {
  onLogoClick?: () => void;
  currentIssue?: string;
}

const Navbar = ({ onLogoClick, currentIssue }: NavbarProps) => {
  const { user, signOut } = useAuth();
  
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
              <span 
                id="currentIssue" 
                className="text-2xl font-bold text-primary ml-2"
              >
                {currentIssue}
              </span>
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
