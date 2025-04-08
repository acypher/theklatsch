
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
      
      {/* Add styles to properly isolate markdown content */}
      <style>{`
        .markdown-content-container {
          isolation: isolate;
        }
      `}</style>
    </div>
  );
};

export default ArticleView;
