
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ArticleDetail from "@/components/ArticleDetail";
import { getCurrentIssue } from "@/lib/data/issue/currentIssue";

const ArticleView = () => {
  const [currentIssue, setCurrentIssue] = useState<string>("May 2025");
  
  useEffect(() => {
    const loadCurrentIssue = async () => {
      const issueData = await getCurrentIssue();
      if (issueData?.text) {
        setCurrentIssue(issueData.text);
      }
    };
    
    loadCurrentIssue();
  }, []);

  return (
    <div>
      <Navbar currentIssue={currentIssue} />
      <main className="prose prose-lg max-w-none pb-12 markdown-content-container">
        <ArticleDetail />
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
      `}</style>
    </div>
  );
};

export default ArticleView;
