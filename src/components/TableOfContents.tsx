
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Article } from "@/lib/types";
import { BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import EditableMarkdown from "./EditableMarkdown";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useContentsHeight } from "@/hooks/useContentsHeight";
import ArticlesList from "./table-of-contents/ArticlesList";

interface TableOfContentsProps {
  articles: Article[];
  onArticleClick: (articleId: string) => void;
  className?: string;
  readArticles?: Set<string>;
  hideRead?: boolean;
  articlesWithUnreadComments?: Set<string>;
  onCommentsViewed?: (articleId: string) => void;
}

const TableOfContents = ({ 
  articles, 
  onArticleClick, 
  className,
  readArticles = new Set(),
  hideRead = false,
  articlesWithUnreadComments = new Set(),
  onCommentsViewed
}: TableOfContentsProps) => {
  const isMobile = useIsMobile();
  const maxHeight = useContentsHeight();
  const { recommendations, loading, isSaving, handleSaveRecommendations } = useRecommendations();

  // Filter articles if hideRead is true
  const displayArticles = hideRead 
    ? articles.filter(article => !readArticles.has(article.id))
    : articles;

  const recommendationsHeight = recommendations ? 120 : 0;
  const articlesListHeight = isMobile ? 250 : (maxHeight - recommendationsHeight - 60);

  return (
    <Card className={`h-full max-h-[600px] flex flex-col ${className || ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="h-5 w-5" />
          In This Issue
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-6 pt-0 flex flex-col">
        <ScrollArea 
          className="pr-4"
          style={{ height: articlesListHeight }}
        >
          <ArticlesList 
            articles={displayArticles}
            readArticles={readArticles}
            onArticleClick={onArticleClick}
            articlesWithUnreadComments={articlesWithUnreadComments}
            onCommentsViewed={onCommentsViewed}
          />
        </ScrollArea>
        
        {!loading && (
          <div className="mt-3 max-h-[120px] overflow-hidden">
            <ScrollArea className="h-[120px]">
              <EditableMarkdown 
                content={recommendations} 
                onSave={handleSaveRecommendations} 
                placeholder="Add recommendations here..."
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
