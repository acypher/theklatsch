
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { getArticleById, updateArticle } from "@/lib/data";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import ArticleForm from "@/components/article/ArticleForm";
import { 
  ArticleFormValues, 
  articleFormSchema, 
  defaultFormValues 
} from "@/components/article/ArticleFormSchema";

const EditArticleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: defaultFormValues,
  });
  
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const article = await getArticleById(id);
        
        if (!article) {
          toast.error("Article not found");
          navigate("/");
          return;
        }
        
        const keywordsString = article.keywords.join(' ');
        
        form.reset({
          title: article.title,
          description: article.description,
          author: article.author,
          keywords: keywordsString,
          imageUrl: article.imageUrl,
          sourceUrl: article.sourceUrl || "",
          more_content: article.more_content || ""
        });
      } catch (error) {
        toast.error("Failed to load article");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArticle();
  }, [id, navigate, form]);

  const onSubmit = async (data: ArticleFormValues) => {
    if (!id) return;
    
    setIsSubmitting(true);

    try {
      const keywordsArray = data.keywords
        ? data.keywords
            .split(/\s+/)
            .filter(keyword => keyword.trim().length > 0)
        : [];

      await updateArticle(id, {
        title: data.title,
        description: data.description,
        author: data.author || "Anonymous",
        keywords: keywordsArray,
        imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
        sourceUrl: data.sourceUrl,
        more_content: data.more_content
      });
      
      toast.success("Article updated successfully!");
      navigate(`/article/${id}`);
    } catch (error) {
      toast.error("Failed to update article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ArticleForm
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitButtonText="Update Article"
    >
      <div className="mb-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate(`/article/${id}`)} 
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </ArticleForm>
  );
};

export default EditArticleForm;
