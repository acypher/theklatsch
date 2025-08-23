
import { Checkbox } from "@/components/ui/checkbox";
import { useArticleReads } from "@/hooks/useArticleReads";
import { useAuth } from "@/contexts/AuthContext";

interface ReadCheckboxProps {
  articleId: string;
}

const ReadCheckbox = ({ articleId }: ReadCheckboxProps) => {
  const { isAuthenticated } = useAuth();
  const { isRead, loading, toggleReadState } = useArticleReads(articleId);

  

  if (!isAuthenticated) return null;

  return (
    <div className="absolute top-2 right-2 z-10 w-4 h-4 flex items-center justify-center">
      <Checkbox 
        checked={isRead}
        disabled={loading}
        onCheckedChange={(checked) => {
          console.log(`Checkbox clicked - articleId: ${articleId}, new state: ${checked}`);
          if (typeof checked === 'boolean') {
            toggleReadState();
          }
        }}
      />
    </div>
  );
};

export default ReadCheckbox;
