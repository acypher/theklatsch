import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchBarProps {
  onSearch: (query: string, wholeWords: boolean) => void;
  onClear: () => void;
  placeholder?: string;
  currentQuery?: string;
  wholeWords?: boolean;
  onWholeWordsChange?: (wholeWords: boolean) => void;
}

const SearchBar = ({ 
  onSearch, 
  onClear, 
  placeholder = "Search articles by title, content, or keywords...",
  currentQuery = "",
  wholeWords = false,
  onWholeWordsChange
}: SearchBarProps) => {
  const [query, setQuery] = useState(currentQuery);
  const [localWholeWords, setLocalWholeWords] = useState(wholeWords);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), localWholeWords);
    }
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  const handleWholeWordsChange = (checked: boolean) => {
    setLocalWholeWords(checked);
    onWholeWordsChange?.(checked);
    if (query.trim()) {
      onSearch(query.trim(), checked);
    }
  };

  return (
    <div id="searchBox" className="p-2 space-y-2">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 z-10"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-4 bg-background" align="start">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="wholeWords" 
                    checked={localWholeWords}
                    onCheckedChange={handleWholeWordsChange}
                  />
                  <Label htmlFor="wholeWords" className="text-sm cursor-pointer">
                    Match whole words only
                  </Label>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                  <div className="font-medium mb-1">Search tips:</div>
                  <div>💡 Use <code className="bg-muted px-1 rounded">key:word</code> to search only keywords</div>
                  <div>💡 Use <code className="bg-muted px-1 rounded">"exact phrase"</code> to search for exact phrases</div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Search className="absolute left-9 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`pl-16 pr-10 ${query ? 'border-2 ring-2' : ''}`}
            style={query ? { borderColor: '#FAEBD7', ['--tw-ring-color' as any]: '#FAEBD7' } : {}}
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
        <div className="text-sm text-muted-foreground">
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