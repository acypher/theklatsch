import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addArticle } from "@/lib/data";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import FormField from "@/components/article/FormField";
import DraftManager from "@/components/article/DraftManager";
import MarkdownEditor from "@/components/article/MarkdownEditor";
import { 
  ArticleFormValues, 
  DRAFT_STORAGE_KEY, 
  articleFormSchema, 
  defaultFormValues 
} from "@/components/article/ArticleFormSchema";
import {
  Form,
  FormControl,
  FormField as HookFormField,
  FormItem,
} from "@/components/ui/form";

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
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        onChange={handleFormChange} 
        className="space-y-6"
      >
        <DraftManager storageKey={DRAFT_STORAGE_KEY} clearDraft={clearDraft} />
        
        <HookFormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormField id="title" label="Title" required>
                <FormControl>
                  <Input 
                    id="title"
                    placeholder="Enter article title"
                    {...field} 
                  />
                </FormControl>
              </FormField>
            </FormItem>
          )}
        />
        
        <HookFormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormField id="description" label="Description" required>
                <FormControl>
                  <Textarea
                    id="description" 
                    placeholder="Write a short description of your article"
                    rows={4}
                    {...field} 
                  />
                </FormControl>
              </FormField>
            </FormItem>
          )}
        />
        
        <HookFormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormField id="author" label="Author">
                <FormControl>
                  <Input
                    id="author"
                    placeholder="Your name (optional)"
                    {...field} 
                  />
                </FormControl>
              </FormField>
            </FormItem>
          )}
        />
        
        <HookFormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormField 
                id="keywords" 
                label="Keywords (space separated)"
                description="Separate keywords with spaces"
              >
                <FormControl>
                  <Input
                    id="keywords"
                    placeholder="Web Development JavaScript Design"
                    {...field} 
                  />
                </FormControl>
              </FormField>
            </FormItem>
          )}
        />
        
        <HookFormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormField 
                id="imageUrl" 
                label="Image URL"
                description="Leave empty to use a default image"
              >
                <FormControl>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    {...field} 
                  />
                </FormControl>
              </FormField>
            </FormItem>
          )}
        />
        
        <HookFormField
          control={form.control}
          name="sourceUrl"
          render={({ field }) => (
            <FormItem>
              <FormField 
                id="sourceUrl" 
                label="Source URL"
              >
                <FormControl>
                  <Input
                    id="sourceUrl"
                    placeholder="https://example.com/your-article"
                    {...field} 
                  />
                </FormControl>
              </FormField>
            </FormItem>
          )}
        />
        
        <HookFormField
          control={form.control}
          name="more_content"
          render={({ field }) => (
            <FormItem>
              <FormField 
                id="more_content" 
                label="More Content (Markdown)"
                description="Use Markdown to format additional content"
              >
                <FormControl>
                  <MarkdownEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value || "")}
                    placeholder="Write additional content using Markdown..."
                  />
                </FormControl>
              </FormField>
            </FormItem>
          )}
        />
        
        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Publishing...
              </>
            ) : "Publish Article"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateArticleForm;
