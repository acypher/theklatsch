
import { Article } from "@/lib/types";
import ArticleCard from "./ArticleCard";
import TableOfContents from "./TableOfContents";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ArticleListProps {
  articles: Article[];
  selectedKeyword?: string | null;
  onKeywordClear?: () => void;
  loading?: boolean;
}

const ArticleList = ({ articles, selectedKeyword, onKeywordClear, loading = false }: ArticleListProps) => {
  const [localArticles, setLocalArticles] = useState<Article[]>(articles);

  // Update local state when articles prop changes
  useEffect(() => {
    setLocalArticles(articles);
  }, [articles]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading articles...</span>
      </div>
    );
  }

  // Sort articles by displayPosition to ensure consistency between TOC and article cards
  const sortedArticles = [...localArticles].sort((a, b) => (a.displayPosition || 999) - (b.displayPosition || 999));

  return (
    <div className="space-y-6">
      {selectedKeyword && (
        <div className="flex items-center gap-2">
          <p className="font-medium">Filtered by keyword:</p>
          <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm flex items-center gap-1">
            {selectedKeyword}
            <button 
              onClick={onKeywordClear} 
              className="ml-1 hover:bg-primary-foreground/20 rounded-full w-5 h-5 inline-flex items-center justify-center text-xs"
            >
              ×
            </button>
          </span>
        </div>
      )}
      
      {localArticles.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600">No articles found</h3>
          <p className="text-muted-foreground mt-2">Select a different month for the Issue</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Table of Contents card with a callback to update article order */}
            <div className="col-span-1 h-full">
              <TableOfContents 
                articles={localArticles} 
                onArticlesReordered={(updatedArticles) => setLocalArticles(updatedArticles)}
              />
            </div>
            
            {/* Article cards - using sortedArticles instead of articles */}
            {sortedArticles.map((article) => (
              <div key={article.id} id={`article-${article.id}`}>
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ArticleList;
