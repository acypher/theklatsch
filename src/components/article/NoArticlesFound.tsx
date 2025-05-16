
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface NoArticlesFoundProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

const NoArticlesFound = ({ 
  searchQuery = "",
  onClearSearch 
}: NoArticlesFoundProps) => {
  const isSearching = searchQuery.trim().length > 0;
  
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      {isSearching ? (
        <>
          <Search size={64} className="text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No articles found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            We couldn't find any articles matching "{searchQuery}".
            Try different keywords or clear your search.
          </p>
          {onClearSearch && (
            <Button variant="outline" onClick={onClearSearch}>
              <X size={16} className="mr-2" />
              Clear search
            </Button>
          )}
        </>
      ) : (
        <>
          <div className="mb-4 p-4 rounded-full bg-muted">
            <Search size={32} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No articles available</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            There are no articles in this issue yet. 
            Add new articles to get started!
          </p>
        </>
      )}
    </div>
  );
};

export default NoArticlesFound;
