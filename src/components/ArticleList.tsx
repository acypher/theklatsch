
import { useState } from "react";
import { Article } from "@/lib/types";
import ArticleCard from "./ArticleCard";

interface ArticleListProps {
  articles: Article[];
  selectedKeyword?: string | null;
  onKeywordClear?: () => void;
}

const ArticleList = ({ articles, selectedKeyword, onKeywordClear }: ArticleListProps) => {
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
      
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600">No articles found</h3>
          <p className="text-muted-foreground mt-2">Try a different keyword or add a new article</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleList;
