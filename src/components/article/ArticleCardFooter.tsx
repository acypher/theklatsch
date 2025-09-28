
import KeywordBadge from "../KeywordBadge";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText } from "lucide-react";

interface ArticleCardFooterProps {
  keywords: string[];
  onCommentsClick: (e: React.MouseEvent) => void;
  onSummaryClick: (e: React.MouseEvent) => void;
  isLoading: boolean;
  hasError: boolean;
  commentCount: number;
  viewedCommentCount?: number;
  hasSummary: boolean;
}

const ArticleCardFooter = ({
  keywords,
  onCommentsClick,
  onSummaryClick,
  isLoading,
  hasError,
  commentCount,
  viewedCommentCount,
  hasSummary
}: ArticleCardFooterProps) => (
  <div className="space-y-3">
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <KeywordBadge key={index} keyword={keyword} />
      ))}
    </div>
    
    <div className="flex justify-between items-center">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onSummaryClick}
        className={`flex items-center gap-1 text-xs ${!hasSummary ? 'text-muted-foreground opacity-50' : ''}`}
        disabled={!hasSummary}
      >
        <FileText className="h-4 w-4" />
        Summary
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onCommentsClick}
        className="flex items-center gap-1 text-xs"
        title={hasError ? "Error loading comment count" : ""}
      >
        <MessageSquare className="h-4 w-4" />
        {!isLoading && !hasError && commentCount > 0 ? (
          viewedCommentCount !== undefined ? (
            <span>
              Comments {viewedCommentCount < commentCount ? (
                <span className="bg-yellow-300 text-black px-1 rounded">{viewedCommentCount}/{commentCount}</span>
              ) : (
                `${viewedCommentCount}/${commentCount}`
              )}
            </span>
          ) : (
            <span>Comments {commentCount}</span>
          )
        ) : (
          <span>Comments</span>
        )}
      </Button>
    </div>
  </div>
);

export default ArticleCardFooter;
