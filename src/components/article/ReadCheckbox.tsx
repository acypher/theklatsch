
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useArticleListData } from "./ArticleListDataContext";

interface ReadCheckboxProps {
  articleId: string;
}

const ReadCheckbox = ({ articleId }: ReadCheckboxProps) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { readArticles, toggleRead } = useArticleListData();

  // Don't hide while auth is still loading - prevents flash on back navigation
  if (!authLoading && !isAuthenticated) return null;

  const isRead = readArticles.has(articleId);

  return (
    <div className="absolute top-2 right-2 z-10 w-4 h-4 flex items-center justify-center">
      <Checkbox 
        checked={isRead}
        onCheckedChange={(checked) => {
          if (typeof checked === 'boolean') {
            toggleRead(articleId);
          }
        }}
      />
    </div>
  );
};

export default ReadCheckbox;
