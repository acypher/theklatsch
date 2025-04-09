
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addArticle } from "@/lib/data";
import { toast } from "sonner";
import DraftManager from "@/components/article/DraftManager";
import ArticleForm from "@/components/article/ArticleForm";
import { 
  ArticleFormValues, 
  DRAFT_STORAGE_KEY, 
  articleFormSchema, 
  defaultFormValues 
} from "@/components/article/ArticleFormSchema";

const CreateArticleForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: defaultFormValues,
  });
  
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        form.reset(parsedDraft);
        toast.info("Your draft has been restored");
      }
    } catch (error) {
      console.error("Failed to parse saved draft", error);
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [form]);

  const saveDraft = (data: ArticleFormValues) => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save draft", error);
    }
  };

  const handleFormChange = () => {
    const values = form.getValues();
    saveDraft(values);
  };

  const clearDraft = () => {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    form.reset(defaultFormValues);
  };

  const onSubmit = async (data: ArticleFormValues) => {
    setIsSubmitting(true);

    try {
      const keywordsArray = data.keywords
        ? data.keywords
            .split(/\s+/)
            .filter(keyword => keyword.trim().length > 0)
        : [];

      const newArticle = await addArticle({
        title: data.title,
        description: data.description,
        author: data.author || "Anonymous",
        keywords: keywordsArray,
        imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
        sourceUrl: data.sourceUrl,
        more_content: data.more_content
      });

      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      
      toast.success("Article published successfully!");
      
      navigate(`/article/${newArticle.id}`);
    } catch (error) {
      toast.error("Failed to publish article. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <ArticleForm
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitButtonText="Publish Article"
      onChange={handleFormChange}
    >
      <DraftManager storageKey={DRAFT_STORAGE_KEY} clearDraft={clearDraft} />
    </ArticleForm>
  );
};

export default CreateArticleForm;
