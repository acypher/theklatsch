
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">MyFriends</Link>
        <div className="flex items-center gap-4">
          <Button asChild variant="default">
            <Link to="/create" className="flex items-center gap-2">
              <PenLine size={18} />
              Write Article
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
