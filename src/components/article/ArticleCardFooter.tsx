
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
}: ArticleCardFooterProps) => {
  // Determine if there are unread comments for yellow style.
  const hasUnreadComments =
    viewedCommentCount !== undefined &&
    commentCount > 0 &&
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
        className="flex items-center gap-1 text-xs"
        title={hasError ? "Error loading comment count" : ""}
        data-has-unread-comments={hasUnreadComments ? "true" : undefined}
        style={
          hasUnreadComments
            ? { background: "#FEF7CD", color: "#533D00", borderRadius: 6 }
            : undefined
        }
      >
        <MessageSquare className="h-4 w-4" />
        {!isLoading && !hasError && commentCount > 0 ? (
          viewedCommentCount !== undefined ? (
            <span>
              Comments{" "}
              <span
                className={hasUnreadComments ? "font-semibold" : ""}
                style={
                  hasUnreadComments
                    ? { background: "none", color: "#533D00" }
                    : {}
                }
              >
                {viewedCommentCount}/{commentCount}
              </span>
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
};

export default ArticleCardFooter;
