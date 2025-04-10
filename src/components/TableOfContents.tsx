
import { useEffect, useState } from "react";
import { Article } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListOrdered, ScrollText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface TableOfContentsProps {
  articles: Article[];
}

const TableOfContents = ({ articles }: TableOfContentsProps) => {
  const [localArticles, setLocalArticles] = useState<Article[]>(articles);

  // Update local state when articles prop changes
  useEffect(() => {
    setLocalArticles(articles);
  }, [articles]);

  // Listen for real-time updates on articles table
  useEffect(() => {
    const channel = supabase
      .channel('article-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'articles'
        },
        (payload) => {
          console.log('Article change detected:', payload);
          
          // Process the change and update localArticles accordingly
          if (payload.eventType === 'UPDATE') {
            setLocalArticles(prevArticles => 
              prevArticles.map(article => 
                article.id === payload.new.id 
                  ? {...article, title: payload.new.title, displayPosition: payload.new.display_position}
                  : article
              ).sort((a, b) => (a.displayPosition || 999) - (b.displayPosition || 999))
            );
          }
        }
      )
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const scrollToArticle = (id: string) => {
    const articleElement = document.getElementById(`article-${id}`);
    if (articleElement) {
      // Add a small offset to account for any fixed headers
      const yOffset = -20;
      const y = articleElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">In This Issue</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {localArticles.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No articles in this issue</p>
          ) : (
            // Sort articles by display position before rendering
            [...localArticles]
              .sort((a, b) => (a.displayPosition || 999) - (b.displayPosition || 999))
              .map((article, index) => (
                <div key={article.id}>
                  {index > 0 && <Separator className="my-2" />}
                  <button 
                    onClick={() => scrollToArticle(article.id)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-1">
                        <ListOrdered className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm group-hover:text-primary transition-colors">
                        {article.title}
                      </p>
                    </div>
                  </button>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TableOfContents;
