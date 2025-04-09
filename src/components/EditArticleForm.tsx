
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getArticleById } from "@/lib/data";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import FormField from "@/components/article/FormField";
import MarkdownEditor from "@/components/article/MarkdownEditor";
import ImageUploader from "@/components/article/ImageUploader";
import { 
  ArticleFormValues, 
  articleFormSchema, 
  defaultFormValues 
} from "@/components/article/ArticleFormSchema";
import {
  Form,
  FormControl,
  FormField as HookFormField,
  FormItem,
} from "@/components/ui/form";
import { updateArticle } from "@/lib/data";

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

  const handleImageUpload = (imageUrl: string) => {
    form.setValue('imageUrl', imageUrl);
  };

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
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6"
      >
        <HookFormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormField id="title" label="Title" required description="Use Markdown to format your title">
                <FormControl>
                  <MarkdownEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value || "")}
                    placeholder="Enter article title"
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
              <FormField id="description" label="Description" required description="Use Markdown to format your description">
                <FormControl>
                  <MarkdownEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value || "")}
                    placeholder="Write a short description of your article"
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
                label="Article Image"
                description="Upload an image or provide an image URL"
              >
                <div className="flex space-x-4 items-center">
                  <FormControl>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      {...field} 
                    />
                  </FormControl>
                  <ImageUploader onImageUpload={handleImageUpload} />
                </div>
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
        
        <div className="pt-4 flex gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(`/article/${id}`)} 
            className="w-full"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Updating...
              </>
            ) : "Update Article"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditArticleForm;
