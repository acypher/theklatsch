
import KeywordBadge from "../KeywordBadge";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, ExternalLink } from "lucide-react";

interface ArticleCardFooterProps {
  keywords: string[];
  onCommentsClick: (e: React.MouseEvent) => void;
  onSummaryClick: (e: React.MouseEvent) => void;
  isLoading: boolean;
  hasError: boolean;
  commentCount: number;
  viewedCommentCount?: number;
  hasSummary: boolean;
  sourceUrl: string;
}

const ArticleCardFooter = ({
  keywords,
  onCommentsClick,
  onSummaryClick,
  isLoading,
  hasError,
  commentCount,
  viewedCommentCount,
  hasSummary,
  sourceUrl
}: ArticleCardFooterProps) => (
  <div className="space-y-3">
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <KeywordBadge key={index} keyword={keyword} />
      ))}
    </div>
    
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(sourceUrl, '_blank', 'noopener,noreferrer');
          }}
          className="flex items-center gap-1 text-xs"
        >
          <ExternalLink className="h-4 w-4" />
          Source
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onSummaryClick}
          className={`flex items-center gap-1 text-xs ${!hasSummary ? 'text-muted-foreground opacity-50' : ''}`}
        >
          <FileText className="h-4 w-4" />
          Summary
        </Button>
      </div>
      
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
