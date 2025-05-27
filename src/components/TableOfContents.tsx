
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Article } from "@/lib/types";
import { BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import EditableMarkdown from "./EditableMarkdown";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useContentsHeight } from "@/hooks/useContentsHeight";
import ArticlesList from "./table-of-contents/ArticlesList";
import ReadFilter from "./article/ReadFilter";
import { useEffect, useState } from "react";
import { getCurrentIssue } from "@/lib/data";

interface TableOfContentsProps {
  articles: Article[];
  allArticles: Article[]; // The complete list of articles for reference
  onArticleClick: (articleId: string) => void;
  className?: string;
  readArticles?: Set<string>;
  hideRead?: boolean;
  commentCounts?: {[articleId: string]: {commentCount: number, viewedCommentCount: number}};
  filterEnabled?: boolean;
  onFilterToggle?: (checked: boolean) => void;
  currentIssue?: string;
}

const TableOfContents = ({ 
  articles, 
  allArticles, 
  onArticleClick, 
  className,
  readArticles = new Set(),
  hideRead = false,
  commentCounts = {},
  filterEnabled = false,
  onFilterToggle,
  currentIssue: propCurrentIssue,
}: TableOfContentsProps) => {
  const isMobile = useIsMobile();
  const maxHeight = useContentsHeight();
  const [issueKey, setIssueKey] = useState<string | undefined>(undefined);
  const [hasUnreadComments, setHasUnreadComments] = useState(false);
  
  // Initialize issue key for recommendations based on currentIssue prop
  useEffect(() => {
    if (propCurrentIssue) {
      setIssueKey(`recommendations_${propCurrentIssue}`);
    } else {
      const fetchCurrentIssue = async () => {
        const issueData = await getCurrentIssue();
        if (issueData?.text) {
          setIssueKey(`recommendations_${issueData.text}`);
        }
      };
      
      fetchCurrentIssue();
    }
  }, [propCurrentIssue]);

  // Check for unread comments in all articles (not just filtered ones)
  useEffect(() => {
    // Check if any article in the commentCounts has unread comments
    const checkForUnreadComments = () => {
      for (const articleId in commentCounts) {
        const counts = commentCounts[articleId];
        if (counts.viewedCommentCount < counts.commentCount) {
          return true;
        }
      }
      return false;
    };
    
    // Set hasUnreadComments based on the check
    setHasUnreadComments(checkForUnreadComments());
  }, [commentCounts]);

  // Only call useRecommendations once we have an issue key
  const { recommendations, loading, isSaving, handleSaveRecommendations } = 
    useRecommendations(issueKey);

  // Filter articles if hideRead is true
  const displayArticles = hideRead 
    ? articles.filter(article => !readArticles.has(article.id))
    : articles;

  // Event handler for filter toggle that will ensure we recalculate hasUnreadComments
  const handleFilterToggle = (checked: boolean) => {
    // First update the filter state
    if (onFilterToggle) {
      onFilterToggle(checked);
    }
    
    // Then recalculate hasUnreadComments based on commentCounts
    const hasAnyUnreadComments = Object.values(commentCounts).some(
      counts => counts.viewedCommentCount < counts.commentCount
    );
    
    setHasUnreadComments(hasAnyUnreadComments);
  };

  // Calculate the space distribution between articles and recommendations
  const hasRecommendations = !loading && recommendations && recommendations.trim().length > 0;

  // Calculate heights based on maxHeight
  const headerHeight = 56; // Approximate height of the card header
  const contentAreaHeight = maxHeight - headerHeight;
  const articleListHeight = hasRecommendations ? `${Math.floor(contentAreaHeight * 0.7)}px` : '100%';
  const recommendationsHeight = hasRecommendations ? `${Math.floor(contentAreaHeight * 0.3)}px` : '0';

  return (
    <Card 
      className={`${className || ""} relative`} 
      style={{ height: `${maxHeight}px`, maxHeight: `${maxHeight}px`, display: 'flex', flexDirection: 'column' }}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center text-xl whitespace-nowrap">
            <span className={`flex items-center justify-center ${hasUnreadComments ? 'bg-yellow-300 rounded-full p-1' : ''}`}>
              <BookOpen className="h-5 w-5 flex-shrink-0" />
            </span>
            <span className="ml-2">In This Issue</span>
          </CardTitle>
          {onFilterToggle && (
            <ReadFilter
              enabled={filterEnabled}
              onToggle={handleFilterToggle}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-6 pt-0 flex flex-col" style={{ height: `calc(100% - ${headerHeight}px)` }}>
        <div className="flex-grow overflow-hidden" style={{ height: articleListHeight }}>
          <ArticlesList 
            articles={displayArticles}
            allArticles={allArticles}
            readArticles={readArticles}
            onArticleClick={onArticleClick}
            commentCounts={commentCounts}
            maxHeight="100%"
            onCommentsStateChanged={() => {
              // Recalculate hasUnreadComments when comment state changes
              const hasAnyUnreadComments = Object.values(commentCounts).some(
                counts => counts.viewedCommentCount < counts.commentCount
              );
              setHasUnreadComments(hasAnyUnreadComments);
            }}
          />
        </div>
        
        {!loading && issueKey && hasRecommendations && (
          <div className="mt-3 overflow-hidden border-t border-border pt-3" style={{ height: recommendationsHeight }}>
            <ScrollArea className="h-full">
              <EditableMarkdown 
                content={recommendations} 
                onSave={handleSaveRecommendations} 
                placeholder="Add editor's comments here..."
                disabled={isSaving}
              />
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TableOfContents;
