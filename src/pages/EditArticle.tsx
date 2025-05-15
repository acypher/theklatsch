
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import EditArticleForm from "@/components/EditArticleForm";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { updateSpecificArticle } from "@/lib/data/updateSpecificArticle";
import { toast } from "sonner";

const EditArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleUpdateArticle = async () => {
    try {
      toast.info("Updating article with latest issue data...");
      await updateSpecificArticle();
      toast.success("Article updated successfully!");
      // Refresh the page to show updated data
      navigate(0);
    } catch (error) {
      toast.error("Failed to update article.");
      console.error("Error updating article:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h1 className="text-3xl font-bold mb-2">Edit Article</h1>
            <div className="flex gap-2 mb-4 sm:mb-0">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/article/${id}`)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateArticle}
                className="gap-2"
              >
                <Save size={16} />
                Save Changes
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mb-8">
            Update your article details below.
          </p>
          <EditArticleForm />
        </div>
      </main>
    </div>
  );
};

export default EditArticle;
