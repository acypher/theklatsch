import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addArticle } from "@/lib/data";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const DRAFT_STORAGE_KEY = "article_draft";

const CreateArticleForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => {
    try {
      const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        toast.info("Your draft has been restored");
        return parsedDraft;
      }
    } catch (error) {
      console.error("Failed to parse saved draft", error);
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    
    return {
      title: "",
      description: "",
      author: "",
      keywords: "",
      imageUrl: "",
      sourceUrl: ""
    };
  });

  const saveDraft = (data: typeof formData) => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save draft", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    saveDraft(updatedData);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.title || !formData.description || !formData.author) {
        toast.error("Please fill out all required fields.");
        setIsSubmitting(false);
        return;
      }

      const keywordsArray = formData.keywords
        .split(",")
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);

      const newArticle = await addArticle({
        title: formData.title,
        description: formData.description,
        author: formData.author,
        keywords: keywordsArray,
        imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
        sourceUrl: formData.sourceUrl
      });

      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      
      toast.success("Article published successfully!");
      
      navigate(`/article/${newArticle.id}`);
    } catch (error) {
      toast.error("Failed to publish article. Please try again.");
      setIsSubmitting(false);
    }
  };

  const clearDraft = () => {
    if (confirm("Are you sure you want to clear your draft?")) {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      setFormData({
        title: "",
        description: "",
        author: "",
        keywords: "",
        imageUrl: "",
        sourceUrl: ""
      });
      toast.success("Draft cleared successfully");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={clearDraft} 
          className="text-sm"
        >
          Clear Draft
        </Button>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter article title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Write a short description of your article"
          rows={4}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="author">Author *</Label>
        <Input
          id="author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          placeholder="Your name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="keywords">Keywords (comma separated)</Label>
        <Input
          id="keywords"
          name="keywords"
          value={formData.keywords}
          onChange={handleChange}
          placeholder="Web Development, JavaScript, Design"
        />
        <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-xs text-muted-foreground">Leave empty to use a default image</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sourceUrl">Source URL</Label>
        <Input
          id="sourceUrl"
          name="sourceUrl"
          value={formData.sourceUrl}
          onChange={handleChange}
          placeholder="https://example.com/your-article"
        />
      </div>
      
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
  );
};

export default CreateArticleForm;
