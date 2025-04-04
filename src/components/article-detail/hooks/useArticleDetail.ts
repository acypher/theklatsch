
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Article } from "@/lib/types";
import { getArticleById, deleteArticle } from "@/lib/data";
import { toast } from "sonner";

export const useArticleDetail = (id: string | undefined) => {
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (id) {
        try {
          setLoading(true);
          const fetchedArticle = await getArticleById(id);
          if (fetchedArticle) {
            setArticle(fetchedArticle);
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
  }, [id, navigate]);

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

  return {
    article,
    loading,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    handleDelete
  };
};
