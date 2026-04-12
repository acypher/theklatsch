
import KeywordBadge from "../KeywordBadge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink } from "lucide-react";

interface ArticleCardFooterProps {
  keywords: string[];
  onCommentsClick: (e: React.MouseEvent) => void;
  isLoading: boolean;
  hasError: boolean;
  commentCount: number;
  viewedCommentCount?: number;
  sourceUrl: string;
  onKeywordClick?: (keyword: string) => void;
  openerLetters: string[];
}

const ArticleCardFooter = ({
  keywords,
  onCommentsClick,
  isLoading,
  hasError,
  commentCount,
  viewedCommentCount,
  sourceUrl,
  onKeywordClick,
  openerLetters
}: ArticleCardFooterProps) => (
  <div className="space-y-3">
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <KeywordBadge 
          key={index} 
          keyword={keyword}
          onClick={() => {
            onKeywordClick?.(keyword);
          }}
        />
      ))}
    </div>
    
    <div className="flex justify-between items-center">
      <div className="flex gap-2 items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (sourceUrl) {
              window.open(sourceUrl, '_blank', 'noopener,noreferrer');
            }
          }}
          disabled={!sourceUrl}
          className={`flex items-center gap-1 text-xs ${!sourceUrl ? 'text-muted-foreground opacity-50 cursor-not-allowed' : ''}`}
        >
          <ExternalLink className="h-4 w-4" />
          Source
        </Button>
        {openerLetters.map((letter) => (
          <span
            key={letter}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs font-semibold"
          >
            {letter}
          </span>
        ))}
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
