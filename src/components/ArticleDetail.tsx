
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ArticleHeader from "./article-detail/ArticleHeader";
import ArticleContent from "./article-detail/ArticleContent";
import ImageDisplay from "./article-detail/ImageDisplay";
import ArticleDetailLoading from "./article-detail/ArticleDetailLoading";
import ArticleNotFound from "./article-detail/ArticleNotFound";
import { useArticleDetail } from "./article-detail/hooks/useArticleDetail";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const {
    article,
    loading,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    handleDelete
  } = useArticleDetail(id);

  if (loading) {
    return <ArticleDetailLoading />;
  }

  if (!article) {
    return <ArticleNotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ArticleHeader
        article={article}
        isAuthenticated={isAuthenticated}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        isDeleting={isDeleting}
        handleDelete={handleDelete}
      />
      
      <div className="mb-8">
        <ImageDisplay
          imageUrl={article.imageUrl}
          title={article.title}
          sourceUrl={article.sourceUrl}
        />
      </div>
      
      <ArticleContent
        description={article.description}
        moreContent={article.more_content}
      />
      
      <div className="mt-12">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to articles
        </Button>
      </div>
    </div>
  );
};

export default ArticleDetail;
