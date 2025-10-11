import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getArticleById, deleteArticle } from "@/lib/data";
import { Article } from "@/lib/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import ArticleHeader from "./article/ArticleHeader";
import ArticleImage from "./article/ArticleImage";
import ArticleContent from "./article/ArticleContent";
import DeleteConfirmationDialog from "./article/DeleteConfirmationDialog";
import { getImageUrl } from "./article/ImageUtils";
import { initGifController } from '@/utils/gifController';
import { useArticleUpdates } from "@/hooks/useArticleUpdates";

interface ArticleDetailProps {
  article?: Article | null;
  loading?: boolean;
  currentIssue?: string;
}

const ArticleDetail = ({ article: propArticle, loading: propLoading, currentIssue }: ArticleDetailProps = {}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(propArticle || null);
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAuthenticated } = useAuth();
  const { markAsViewed } = useArticleUpdates();

  useEffect(() => {
    if (propArticle) {
      setArticle(propArticle);
      setLoading(false);
    }
  }, [propArticle]);

  useEffect(() => {
    const fetchArticle = async () => {
      if (propArticle) return;
      if (id) {
        try {
          setLoading(true);
          const fetchedArticle = await getArticleById(id);
          if (fetchedArticle) {
            setArticle(fetchedArticle);
            // Title is now managed by ArticleView component
          } else {
            toast.error("Article not found");
            navigate("/");
          }
        } catch (error) {
          toast.error("Failed to load article");
          navigate("/");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchArticle();
  }, [id, navigate, propArticle]);

  // Mark article as viewed when the article page loads
  useEffect(() => {
    if (article && isAuthenticated) {
      markAsViewed(article.id);
    }
  }, [article, isAuthenticated, markAsViewed]);

  useEffect(() => {
    if (article?.imageUrl?.toLowerCase().endsWith('.gif')) {
      // Initialize the GIF controller when the article loads
      const initGif = async () => {
        try {
          await initGifController();
        } catch (error) {
          console.error("Error initializing GIF controller:", error);
        }
      };
      
      initGif();
    }
  }, [article]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await deleteArticle(id);
      toast.success("Article deleted successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete article");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleNavigateBack = () => {
    // Save the current article ID to session storage before navigating
    if (article) {
      sessionStorage.setItem('lastViewedArticleId', article.id);
    }
    navigate("/");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-3/4"></div>
          <div className="h-4 bg-secondary rounded w-1/4"></div>
          <div className="h-64 bg-secondary rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-secondary rounded"></div>
            <div className="h-4 bg-secondary rounded"></div>
            <div className="h-4 bg-secondary rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Article not found</h2>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${article.private ? 'border-t-red-600 border-t-[6px]' : ''}`}>
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6" 
          onClick={handleNavigateBack}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to articles
        </Button>
        
        {article && (
          <>
            <ArticleHeader 
              article={article} 
              isAuthenticated={isAuthenticated} 
              onDeleteClick={() => setIsDeleteDialogOpen(true)}
              formatDate={formatDate}
            />
          </>
        )}
      </div>
      
      {article && (
        <>
          <ArticleImage 
            imageUrl={article.imageUrl} 
            sourceUrl={article.sourceUrl} 
            title={article.title}
            getImageUrl={getImageUrl}
          />
          
          <ArticleContent 
            description={article.description} 
            moreContent={article.more_content}
            summary={article.summary}
            sourceUrl={article.sourceUrl}
            onBackClick={handleNavigateBack}
          />

          {/* Delete confirmation dialog */}
          <DeleteConfirmationDialog 
            isOpen={isDeleteDialogOpen}
            title={article.title}
            isDeleting={isDeleting}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  );
};

export default ArticleDetail;
