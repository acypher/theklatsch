import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ArticleList from "@/components/ArticleList";
import { getAllArticles, getArticlesByKeyword } from "@/lib/data";
import { Article } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const keywordFilter = searchParams.get("keyword");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [doorImageUrl, setDoorImageUrl] = useState<string | null>(null);
  
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
            A collaborative space for friends to share their thoughts, experiences and knowledge.
          </a>
        </header>
        
        <ArticleList 
          articles={articles} 
          selectedKeyword={keywordFilter} 
          onKeywordClear={handleClearKeyword}
          loading={loading}
        />

        {doorImageUrl && (
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
