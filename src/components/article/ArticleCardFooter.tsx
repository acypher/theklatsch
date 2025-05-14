
import KeywordBadge from "../KeywordBadge";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

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
}: ArticleCardFooterProps) => {
  // Determine if there are unread comments
  const hasUnreadComments = 
    !isLoading && 
    !hasError && 
    commentCount > 0 && 
    viewedCommentCount !== undefined && 
    viewedCommentCount < commentCount;

  return (
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
        className={cn(
          "flex items-center gap-1 text-xs",
          hasUnreadComments ? "bg-[#FEF7CD] hover:bg-[#FEF7CD]/90" : ""
        )}
        title={hasError ? "Error loading comment count" : hasUnreadComments ? "You have unread comments!" : ""}
      >
        <MessageSquare className="h-4 w-4" />
        {!isLoading && !hasError && commentCount > 0 ? (
          viewedCommentCount !== undefined ? (
            <span>Comments {viewedCommentCount}/{commentCount}</span>
          ) : (
            <span>Comments {commentCount}</span>
          )
        ) : (
          <span>Comments</span>
        )}
      </Button>
    </div>
  );
};

export default ArticleCardFooter;
