import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ArticleDetail from "@/components/ArticleDetail";
import { getCurrentIssue } from "@/lib/data/issue/currentIssue";
import { getArticleById } from "@/lib/data";
import { Article } from "@/lib/types";

const ArticleView = () => {
  const { id } = useParams<{ id: string }>();
  const [currentIssue, setCurrentIssue] = useState<string>("May 2025");
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Save scroll position before navigating to article
    sessionStorage.setItem('scrollPosition', window.scrollY.toString());
    
    const loadCurrentIssue = async () => {
      const issueData = await getCurrentIssue();
      if (issueData?.text) {
        setCurrentIssue(issueData.text);
      }
    };
    
    loadCurrentIssue();
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      if (id) {
        try {
          const articleData = await getArticleById(id);
          if (articleData) {
            setArticle(articleData);
            
            // Update page title using the article title from h1 content
            document.title = articleData.title;
            
            // Update or create Open Graph meta tags
            updateMetaTags(articleData);
          }
        } catch (error) {
          console.error("Error fetching article for meta tags:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchArticle();
    
    // Clean up meta tags when unmounting
    return () => {
      // Reset title
      document.title = "Tech Magazine";
      
      // Remove Open Graph meta tags
      const metaTags = document.querySelectorAll('meta[property^="og:"]');
      metaTags.forEach(tag => tag.remove());
    };
  }, [id]);

  const updateMetaTags = (article: Article) => {
    // Helper function to create or update meta tags
    const setMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };
    
    // Get the full URL for the image
    const fullImageUrl = new URL("/lovable-uploads/17100c7f-adac-4287-bf4c-d08288a0c3f5.png", window.location.origin).href;
    
    // Set Open Graph tags
    setMetaTag('og:title', article.title);
    setMetaTag('og:description', article.description);
    setMetaTag('og:type', 'article');
    setMetaTag('og:image', fullImageUrl);
    setMetaTag('og:url', window.location.href);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentIssue={currentIssue} />
      <main className="prose prose-lg max-w-none pb-12 markdown-content-container flex-grow overflow-y-auto">
        <ArticleDetail article={article} loading={loading} currentIssue={currentIssue} />
      </main>
      
      {/* Add styles to properly isolate markdown content and ensure titles render correctly */}
      <style>{`
        .markdown-content-container {
          isolation: isolate;
        }
        
        /* Fix heading margins in markdown content */
        .prose-headings h1, 
        .prose-headings h2, 
        .prose-headings h3, 
        .prose-headings h4, 
        .prose-headings h5, 
        .prose-headings h6 {
          margin: 0;
          line-height: 1.3;
        }
        
        /* Remove extra paragraph margins in markdown headings */
        .prose-headings p {
          margin: 0;
        }
        
        /* Ensure content is scrollable */
        html, body {
          height: 100%;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default ArticleView;
