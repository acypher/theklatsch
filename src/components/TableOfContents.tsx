
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

  // Only call useRecommendations once we have an issue key
  const { recommendations, loading, isSaving, handleSaveRecommendations } = 
    useRecommendations(issueKey);

  // Filter articles if hideRead is true
  const displayArticles = hideRead 
    ? articles.filter(article => !readArticles.has(article.id))
    : articles;

  const recommendationsHeight = recommendations ? 120 : 0;
  const articlesListHeight = isMobile ? 250 : (maxHeight - recommendationsHeight - 60);

  return (
    <Card className={`h-full max-h-[600px] flex flex-col ${className || ""}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center text-xl whitespace-nowrap">
            <BookOpen className="h-5 w-5 flex-shrink-0" />
            <span className="ml-2">In This Issue</span>
          </CardTitle>
          {onFilterToggle && (
            <ReadFilter
              enabled={filterEnabled}
              onToggle={onFilterToggle}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-6 pt-0 flex flex-col">
        <ScrollArea 
          className="pr-4"
          style={{ height: articlesListHeight }}
        >
          <ArticlesList 
            articles={displayArticles}
            allArticles={allArticles}
            readArticles={readArticles}
            onArticleClick={onArticleClick}
            commentCounts={commentCounts}
          />
        </ScrollArea>
        
        {!loading && issueKey && (
          <div className="mt-3 max-h-[120px] overflow-hidden">
            <ScrollArea className="h-[120px]">
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
