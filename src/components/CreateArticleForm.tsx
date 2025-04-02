
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addArticle } from "@/lib/data";
import { toast } from "sonner";

const CreateArticleForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    keywords: "",
    imageUrl: "",
    sourceUrl: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.author) {
        toast.error("Please fill out all required fields.");
        setIsSubmitting(false);
        return;
      }

      // Process keywords into an array
      const keywordsArray = formData.keywords
        .split(",")
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);

      // Add the new article
      const newArticle = addArticle({
        title: formData.title,
        description: formData.description,
        author: formData.author,
        keywords: keywordsArray,
        imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b", // Default image
        sourceUrl: formData.sourceUrl
      });

      toast.success("Article published successfully!");
      
      // Redirect to the new article page
      navigate(`/article/${newArticle.id}`);
    } catch (error) {
      toast.error("Failed to publish article. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          {isSubmitting ? "Publishing..." : "Publish Article"}
        </Button>
      </div>
    </form>
  );
};

export default CreateArticleForm;
