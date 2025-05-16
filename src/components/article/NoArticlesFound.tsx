
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

interface NoArticlesFoundProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

const NoArticlesFound = ({ searchQuery, onClearSearch }: NoArticlesFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No articles found</h3>
      
      {searchQuery ? (
        <>
          <p className="text-muted-foreground mb-4">
            No articles match "{searchQuery}"
          </p>
          {onClearSearch && (
            <Button onClick={onClearSearch} variant="outline">
              Clear search
            </Button>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">
          There are no articles to display.
        </p>
      )}
    </div>
  );
};

export default NoArticlesFound;
