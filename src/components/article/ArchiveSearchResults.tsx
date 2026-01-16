import React from "react";
import { ExternalLink, Archive } from "lucide-react";
import { ArchiveSearchResult } from "@/lib/data/archiveSearch";
import { Card, CardContent } from "@/components/ui/card";

interface ArchiveSearchResultsProps {
  results: ArchiveSearchResult[];
  searchQuery: string;
}

const ArchiveSearchResults = ({ results, searchQuery }: ArchiveSearchResultsProps) => {
  if (results.length === 0) {
    return null;
  }

  const handleClick = (url: string, query: string) => {
    // Use Text Fragments API to highlight and scroll to matching text
    // Find the first search term to use for the fragment
    const terms = query.trim().split(/\s+/).filter(t => t.length > 0);
    const firstTerm = terms[0] || '';
    
    // Encode the search term for the URL fragment
    const textFragment = firstTerm ? `#:~:text=${encodeURIComponent(firstTerm)}` : '';
    
    window.open(url + textFragment, '_blank');
  };

  // Highlight search terms in the snippet
  const highlightSnippet = (snippet: string, query: string) => {
    if (!query.trim()) return snippet;
    
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    let highlighted = snippet;
    
    terms.forEach(term => {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>');
    });
    
    return highlighted;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Archive className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">
          Archive Results ({results.length})
        </h3>
      </div>
      <div className="grid gap-2">
        {results.map((result) => (
          <Card 
            key={result.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors border-dashed"
            onClick={() => handleClick(result.url, searchQuery)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{result.display_issue}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  </div>
                  <p 
                    className="text-xs text-muted-foreground line-clamp-2"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightSnippet(result.snippet, searchQuery) 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ArchiveSearchResults;
