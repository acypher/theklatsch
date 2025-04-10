
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getAllArticles } from "@/lib/data";
import { updateArticlesOrder } from "@/lib/data/article/specialOperations";
import { Article } from "@/lib/types";
import ArticleArrangeList from "@/components/ArticleArrangeList";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, Save } from "lucide-react";

const ArrangeArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const articlesData = await getAllArticles();
        // Sort by current display position
        const sortedArticles = articlesData.sort((a, b) => 
          (a.displayPosition || 999) - (b.displayPosition || 999)
        );
        setArticles(sortedArticles);
      } catch (error) {
        console.error("Error fetching articles:", error);
        toast.error("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      // Create an array of objects with id and position
      const articlesOrder = articles.map((article, index) => ({
        id: article.id,
        position: index + 1
      }));

      // Call the API to update the order
      const success = await updateArticlesOrder(articlesOrder);
      
      if (success) {
        toast.success("Article order updated successfully");
        // Update local state to reflect new positions
        const updatedArticles = articles.map((article, index) => ({
          ...article,
          displayPosition: index + 1
        }));
        setArticles(updatedArticles);
      } else {
        toast.error("Failed to update article order");
      }
    } catch (error) {
      console.error("Error saving article order:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSheet = () => {
    setOpen(false);
    // Navigate back to home page
    window.location.href = "/";
  };

  return (
    <div>
      <Navbar />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl" onCloseAutoFocus={handleCloseSheet}>
          <SheetHeader>
            <SheetTitle>Arrange Articles</SheetTitle>
            <SheetDescription>
              Drag and drop articles to change their display order
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-250px)] mt-6 pr-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading articles...</span>
              </div>
            ) : (
              <>
                <ArticleArrangeList 
                  articles={articles} 
                  setArticles={setArticles} 
                />
                
                <div className="mt-6 flex justify-end sticky bottom-0 bg-background pt-4">
                  <Button 
                    onClick={handleSaveOrder}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Order
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ArrangeArticles;

