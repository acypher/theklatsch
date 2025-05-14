
import KeywordBadge from "../KeywordBadge";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface ArticleCardFooterProps {
  keywords: string[];
  onCommentsClick: (e: React.MouseEvent) => void;
  isLoading: boolean;
  hasError: boolean;
  commentCount: number;
  viewedCommentCount?: number;
}

const ArticleCardFooter = ({
  keywords,
  onCommentsClick,
  isLoading,
  hasError,
  commentCount,
  viewedCommentCount
}: ArticleCardFooterProps) => (
  <div className="flex justify-between items-center">
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <KeywordBadge key={index} keyword={keyword} />
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
);

export default ArticleCardFooter;
