
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ArticleList from "@/components/ArticleList";
import { getAllArticles, getArticlesByKeyword } from "@/lib/data";
import { Article } from "@/lib/types";

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const keywordFilter = searchParams.get("keyword");
  
  useEffect(() => {
    // Filter articles by keyword if a filter is active
    if (keywordFilter) {
      setArticles(getArticlesByKeyword(keywordFilter));
    } else {
      setArticles(getAllArticles());
    }
  }, [keywordFilter]);

  const handleClearKeyword = () => {
    setSearchParams({});
  };

  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">MyFriends Articles</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A collaborative space for friends to share their thoughts, experiences and knowledge.
          </p>
        </header>
        
        <ArticleList 
          articles={articles} 
          selectedKeyword={keywordFilter} 
          onKeywordClear={handleClearKeyword}
        />
      </main>
    </div>
  );
};

export default Index;
