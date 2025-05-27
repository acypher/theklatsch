
import { useState, useEffect } from 'react';
import { Article } from "@/lib/types";
import { ARTICLE_UPDATED_EVENT } from "../EditArticleForm";

interface ArticlesListProps {
  articles: Article[];
  allArticles: Article[]; // Need this to know the original position of each article
  readArticles: Set<string>;
  onArticleClick: (articleId: string) => void;
  commentCounts?: {[articleId: string]: {commentCount: number, viewedCommentCount: number}};
  onCommentsStateChanged?: () => void; // New callback for comment state changes
  maxHeight?: string; // Allow configurable max height
}

const ArticlesList = ({ 
  articles, 
  allArticles, 
  readArticles, 
  onArticleClick, 
  commentCounts = {},
  onCommentsStateChanged,
  maxHeight = "250px" // Default height if not specified
}: ArticlesListProps) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [readTimestamps, setReadTimestamps] = useState<{[articleId: string]: string}>({});
  const [editedAfterReadArticles, setEditedAfterReadArticles] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    console.log("ArticlesList - Filtered articles:", articles.map(a => a.id));
    console.log("ArticlesList - All articles:", allArticles.map(a => a.id));
    
    // Call onCommentsStateChanged whenever commentCounts changes
    if (onCommentsStateChanged) {
      onCommentsStateChanged();
    }
  }, [articles, allArticles, commentCounts, onCommentsStateChanged]);

  // Listen for read state changes to track when articles are marked as read
  useEffect(() => {
    const handleReadStateChange = (e: CustomEvent) => {
      const { articleId, read } = e.detail;
      
      if (read) {
        // Store the timestamp when the article was marked as read
        setReadTimestamps(prev => ({
          ...prev,
          [articleId]: new Date().toISOString()
        }));
      } else {
        // Remove timestamp when article is unmarked as read
        setReadTimestamps(prev => {
          const newTimestamps = { ...prev };
          delete newTimestamps[articleId];
          return newTimestamps;
        });
        
        // Also remove from edited after read set
        setEditedAfterReadArticles(prev => {
          const newSet = new Set(prev);
          newSet.delete(articleId);
          return newSet;
        });
      }
    };

    window.addEventListener('article-read-state-changed' as any, handleReadStateChange);
    
    return () => {
      window.removeEventListener('article-read-state-changed' as any, handleReadStateChange);
    };
  }, []);

  // Listen for article updates to immediately highlight them if they were read
  useEffect(() => {
    const handleArticleUpdated = (e: CustomEvent) => {
      const { articleId } = e.detail;
      
      // Check if this article is marked as read
      if (readArticles.has(articleId)) {
        // Add it to the edited after read set
        setEditedAfterReadArticles(prev => new Set(prev).add(articleId));
      }
    };

    window.addEventListener(ARTICLE_UPDATED_EVENT as any, handleArticleUpdated);
    
    return () => {
      window.removeEventListener(ARTICLE_UPDATED_EVENT as any, handleArticleUpdated);
    };
  }, [readArticles]);

  // Check for edited articles when articles or read state changes
  useEffect(() => {
    const checkEditedArticles = () => {
      const newEditedSet = new Set<string>();
      
      allArticles.forEach(article => {
        if (readArticles.has(article.id)) {
          const readTimestamp = readTimestamps[article.id];
          if (readTimestamp) {
            // Use updatedAt if available, otherwise fall back to createdAt
            const articleUpdateTime = article.updatedAt || article.createdAt;
            const articleUpdated = new Date(articleUpdateTime);
            const markedAsRead = new Date(readTimestamp);
            
            if (articleUpdated > markedAsRead) {
              newEditedSet.add(article.id);
            }
          }
        }
      });
      
      setEditedAfterReadArticles(newEditedSet);
    };
    
    checkEditedArticles();
  }, [allArticles, readArticles, readTimestamps]);
  
  const handleItemClick = (articleId: string) => {
    setActiveItem(articleId);
    onArticleClick(articleId);
  };

  return (
    <div style={{ height: maxHeight }} className="overflow-auto h-full">
      <ul className="space-y-2">
        {articles.map((article) => {
          const isArticleRead = readArticles.has(article.id);
          const wasEditedAfterRead = editedAfterReadArticles.has(article.id);
          
          // Find the actual position in the full list of articles (not just the filtered ones)
          const originalPosition = allArticles.findIndex(a => a.id === article.id);
          // Display the position + 1 (for 1-based numbering)
          const displayNumber = originalPosition !== -1 ? originalPosition + 1 : 0;
          
          // Check for unread comments
          const counts = commentCounts[article.id] || { commentCount: 0, viewedCommentCount: 0 };
          const hasUnreadComments = counts.viewedCommentCount < counts.commentCount;

          return (
            <li 
              key={article.id}
              className={`cursor-pointer transition-colors ${
                activeItem === article.id
                  ? "text-primary font-medium"
                  : isArticleRead 
                  ? "text-muted-foreground/50 hover:text-muted-foreground"
                  : "text-foreground hover:text-primary"
              }`}
            >
              <button
                className="text-left w-full text-sm flex items-start gap-2"
                onClick={() => handleItemClick(article.id)}
                aria-current={activeItem === article.id ? "true" : undefined}
              >
                {hasUnreadComments ? (
                  <span 
                    className="bg-yellow-300 text-black rounded-full px-2 font-medium min-w-6 flex items-center justify-center"
                    title="You have unread comments!"
                  >
                    {displayNumber}.
                  </span>
                ) : (
                  <span 
                    className={`font-medium min-w-6 flex items-center justify-center ${isArticleRead ? "text-muted-foreground/50" : "text-muted-foreground"}`}
                  >
                    {displayNumber}.
                  </span>
                )}
                <span 
                  className={`${
                    isArticleRead ? "text-muted-foreground/50" : ""
                  } ${
                    wasEditedAfterRead ? "bg-yellow-300 text-black px-1 rounded" : ""
                  }`}
                  title={wasEditedAfterRead ? "This article was edited after you marked it as read" : undefined}
                >
                  {article.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ArticlesList;
