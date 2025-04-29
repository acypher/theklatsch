
import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { getCurrentIssue, getAllArticles, checkAndFixDisplayIssue } from "@/lib/data";
import ArticleList from "@/components/ArticleList";
import { Article } from "@/lib/types";
import { getMaintenanceMode } from "@/lib/data/maintenanceService";
import { useAuth } from "@/contexts/AuthContext";
import { HomeLogo } from "@/components/home/HomeLogo";
import { MaintenancePage } from "@/components/home/MaintenancePage";
import { StorefrontImage } from "@/components/home/StorefrontImage";
import { useReadArticles } from "@/hooks/useReadArticles";

const Index = () => {
  const [currentIssue, setCurrentIssue] = useState<string>("April 2025");
  const [showMaintenancePage, setShowMaintenancePage] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const articleListRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  
  const { readArticles, filterEnabled, setFilterEnabled } = useReadArticles(isAuthenticated);

  useEffect(() => {
    const loadCurrentIssue = async () => {
      const issueData = await checkAndFixDisplayIssue();
      setCurrentIssue(issueData.text);
    };
    
    loadCurrentIssue();
  }, []);
  
  useEffect(() => {
    const loadMaintenanceMode = async () => {
      const mode = await getMaintenanceMode();
      setShowMaintenancePage(mode === "maintenance");
    };
    
    loadMaintenanceMode();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const articlesData = await getAllArticles();
        setArticles(articlesData);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = React.useMemo(() => {
    if (!filterEnabled || !isAuthenticated) return articles;
    return articles.filter(article => !readArticles.has(article.id));
  }, [articles, filterEnabled, readArticles, isAuthenticated]);

  return (
    <div className="min-h-screen">
      <Navbar 
        onLogoClick={() => setShowMaintenancePage(false)} 
        currentIssue={currentIssue}
        showReadFilter={true}
        filterEnabled={filterEnabled}
        onFilterToggle={setFilterEnabled}
      />
      <main className="container mx-auto px-4 py-8">
        <HomeLogo />
        
        {showMaintenancePage ? (
          <MaintenancePage />
        ) : (
          <>
            <div ref={articleListRef}>
              <ArticleList 
                articles={filteredArticles} 
                loading={loading}
                readArticles={readArticles}
                hideRead={filterEnabled}
              />
            </div>
            <StorefrontImage />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
