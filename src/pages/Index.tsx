
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ArticleList from "@/components/ArticleList";
import { getAllArticles, getArticlesByKeyword, updateArticlesOrder } from "@/lib/data";
import { Article } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ArticleArrangeList from "@/components/ArticleArrangeList";

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const keywordFilter = searchParams.get("keyword");
  const arrangeMode = searchParams.get("mode") === "arrange";
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [doorImageUrl, setDoorImageUrl] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const uploadLogo = async () => {
      try {
        const { data: existingFiles } = await supabase
          .storage
          .from('logos')
          .list();
        
        const logoExists = existingFiles?.some(file => file.name === 'klatsch-logo.png');
        
        if (!logoExists) {
          const response = await fetch('/klatsch-logo.png');
          const blob = await response.blob();
          
          const { error } = await supabase
            .storage
            .from('logos')
            .upload('klatsch-logo.png', blob);
            
          if (error) {
            console.error('Error uploading logo:', error);
          }
        }
        
        const { data: logoData } = supabase
          .storage
          .from('logos')
          .getPublicUrl('klatsch-logo.png');
        
        if (logoData) {
          setLogoUrl(logoData.publicUrl);
        }

        const { data: doorData } = supabase
          .storage
          .from('logos')
          .getPublicUrl('klatsch-door.png');
        
        if (doorData) {
          setDoorImageUrl(doorData.publicUrl);
        }
      } catch (error) {
        console.error('Error with logo:', error);
      }
    };
    
    uploadLogo();
  }, []);
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        if (keywordFilter) {
          const filteredArticles = await getArticlesByKeyword(keywordFilter);
          setArticles(filteredArticles);
        } else {
          const allArticles = await getAllArticles();
          setArticles(allArticles);
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        toast.error("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [keywordFilter]);

  const handleClearKeyword = () => {
    setSearchParams({});
  };

  const handleExitArrangeMode = () => {
    setSearchParams({});
  };

  const handleSaveOrder = async () => {
    const articlesWithPositions = articles.map((article, index) => ({
      id: article.id,
      position: index + 1
    }));
    
    console.log("Saving article order:", articlesWithPositions);
    
    const success = await updateArticlesOrder(articlesWithPositions);
    if (success) {
      toast.success("Article order saved successfully");
      handleExitArrangeMode();
    } else {
      toast.error("Failed to save article order");
    }
  };

  useEffect(() => {
    if (arrangeMode && !isAuthenticated) {
      setSearchParams({});
    }
  }, [arrangeMode, isAuthenticated, setSearchParams]);

  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          {logoUrl ? (
            <div className="flex justify-center mb-4">
              <img 
                src={logoUrl} 
                alt="The Klatsch" 
                className="h-20 md:h-24" 
              />
            </div>
          ) : (
            <h1 className="text-4xl font-bold mb-4">The Klatsch</h1>
          )}
          <a 
            href="subtitle" 
            id="subtitle"
            className="text-xl text-muted-foreground max-w-2xl mx-auto block"
          >
            {" "}
          </a>
        </header>
        
        {arrangeMode && isAuthenticated ? (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Arrange Articles</h2>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleExitArrangeMode}>
                  Cancel
                </Button>
                <Button onClick={handleSaveOrder}>
                  Save Order
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground mb-6">Drag and drop articles to rearrange them in your preferred order.</p>
            <ArticleArrangeList 
              articles={articles} 
              setArticles={setArticles}
            />
          </div>
        ) : (
          <ArticleList 
            articles={articles} 
            selectedKeyword={keywordFilter} 
            onKeywordClear={handleClearKeyword}
            loading={loading}
          />
        )}

        {doorImageUrl && !arrangeMode && (
          <div className="flex justify-center mt-16 mb-8">
            <img 
              src={doorImageUrl} 
              alt="Klatsch Door" 
              className="max-h-48 md:max-h-64" 
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
