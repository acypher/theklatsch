import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  currentQuery?: string;
}

const SearchBar = ({ 
  onSearch, 
  onClear, 
  placeholder = "Search articles by title, content, or keywords...",
  currentQuery = ""
}: SearchBarProps) => {
  const [query, setQuery] = useState(currentQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  return (
    <div className="p-2">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
      {currentQuery && (
        <div className="mt-2 text-sm text-muted-foreground">
          Showing results for: <span className="font-medium">"{currentQuery}"</span>
          <Button variant="link" size="sm" onClick={handleClear} className="ml-2 p-0 h-auto">
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;