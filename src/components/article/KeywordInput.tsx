
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useKeywordSuggestions } from "@/hooks/useKeywordSuggestions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface KeywordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const KeywordInput = ({ value, onChange, placeholder }: KeywordInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getSuggestions } = useKeywordSuggestions();

  // Parse current keywords from the space-separated string
  const currentKeywords = value
    .split(/\s+/)
    .filter(k => k.trim().length > 0);

  // Get suggestions based on current input
  const suggestions = getSuggestions(inputValue, currentKeywords);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim().toLowerCase();
    if (!trimmedKeyword) return;
    
    // Check if keyword already exists
    if (currentKeywords.map(k => k.toLowerCase()).includes(trimmedKeyword)) {
      setInputValue("");
      return;
    }

    const newKeywords = [...currentKeywords, trimmedKeyword].join(" ");
    onChange(newKeywords);
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeKeyword = (keywordToRemove: string) => {
    const newKeywords = currentKeywords
      .filter(k => k.toLowerCase() !== keywordToRemove.toLowerCase())
      .join(" ");
    onChange(newKeywords);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Check if user typed a space - add the current word as a keyword
    if (newValue.endsWith(" ")) {
      const word = newValue.trim();
      if (word) {
        addKeyword(word);
      }
    } else {
      setInputValue(newValue);
      setShowSuggestions(newValue.trim().length > 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addKeyword(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && currentKeywords.length > 0) {
      // Remove last keyword when backspacing on empty input
      removeKeyword(currentKeywords[currentKeywords.length - 1]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Display current keywords as badges */}
      {currentKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {currentKeywords.map((keyword, index) => (
            <Badge
              key={`${keyword}-${index}`}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input field */}
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => inputValue.trim() && setShowSuggestions(true)}
        placeholder={currentKeywords.length === 0 ? placeholder : "Add more keywords..."}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
          <Command>
            <CommandList>
              <CommandGroup heading="Existing keywords">
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => addKeyword(suggestion)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addKeyword(suggestion);
                    }}
                    className="cursor-pointer"
                  >
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};

export default KeywordInput;
