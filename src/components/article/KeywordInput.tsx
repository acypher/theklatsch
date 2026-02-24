import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { useExistingKeywords } from "@/hooks/useExistingKeywords";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface KeywordInputProps {
  value: string;
  onChange: (value: string) => void;
}

const KeywordInput = ({ value, onChange }: KeywordInputProps) => {
  const { data: existingKeywords = [] } = useExistingKeywords();
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse space-separated string into array
  const selectedKeywords = value
    .split(" ")
    .map((k) => k.trim())
    .filter(Boolean);

  // Filter suggestions based on input
  const filteredKeywords = existingKeywords.filter(
    (keyword) =>
      keyword.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedKeywords.includes(keyword)
  );

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (trimmed && !selectedKeywords.includes(trimmed)) {
      const newKeywords = [...selectedKeywords, trimmed];
      onChange(newKeywords.join(" "));
    }
    setInputValue("");
    setIsOpen(false);
  };

  const removeKeyword = (keyword: string) => {
    const newKeywords = selectedKeywords.filter((k) => k !== keyword);
    onChange(newKeywords.join(" "));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === " " || e.key === "Enter") && inputValue.trim()) {
      e.preventDefault();
      addKeyword(inputValue);
    } else if (
      e.key === "Backspace" &&
      !inputValue &&
      selectedKeywords.length > 0
    ) {
      removeKeyword(selectedKeywords[selectedKeywords.length - 1]);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex flex-wrap gap-1.5 min-h-10 w-full rounded-md border border-input bg-background px-3 py-2",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        )}
      >
        {selectedKeywords.map((keyword) => (
          <span
            key={keyword}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
          >
            {keyword}
            <button
              type="button"
              onClick={() => removeKeyword(keyword)}
              className="hover:bg-primary/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay to allow dropdown click to register before committing
            setTimeout(() => {
              if (inputValue.trim()) {
                addKeyword(inputValue);
              }
            }, 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedKeywords.length === 0 ? "Type to search or add keywords..." : ""
          }
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>

      {isOpen && inputValue && filteredKeywords.length > 0 && (
        <div className="absolute z-50 w-full mt-1">
          <Command className="rounded-lg border bg-popover shadow-md">
            <CommandList>
              <CommandGroup heading="Existing keywords">
                {filteredKeywords.slice(0, 10).map((keyword) => (
                  <CommandItem
                    key={keyword}
                    value={keyword}
                    onSelect={() => addKeyword(keyword)}
                    className="cursor-pointer"
                  >
                    {keyword}
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
