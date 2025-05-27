
import { useState, useEffect } from 'react';
import { Article } from "@/lib/types";

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
      }
    };

    window.addEventListener('article-read-state-changed' as any, handleReadStateChange);
    
    return () => {
      window.removeEventListener('article-read-state-changed' as any, handleReadStateChange);
    };
  }, []);
  
  const handleItemClick = (articleId: string) => {
    setActiveItem(articleId);
    onArticleClick(articleId);
  };

  // Helper function to check if an article was edited after being marked as read
  const isEditedAfterRead = (article: Article) => {
    const readTimestamp = readTimestamps[article.id];
    if (!readTimestamp || !readArticles.has(article.id)) {
      return false;
    }
    
    // Compare the article's updated timestamp with when it was marked as read
    const articleUpdated = new Date(article.createdAt);
    const markedAsRead = new Date(readTimestamp);
    
    return articleUpdated > markedAsRead;
  };

  return (
    <div style={{ height: maxHeight }} className="overflow-auto h-full">
      <ul className="space-y-2">
        {articles.map((article) => {
          const isArticleRead = readArticles.has(article.id);
          const wasEditedAfterRead = isEditedAfterRead(article);
          
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
                    wasEditedAfterRead ? "bg-blue-200 px-1 rounded" : ""
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
