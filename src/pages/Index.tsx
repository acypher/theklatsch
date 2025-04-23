
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getCurrentIssue, getAllArticles } from "@/lib/data";
import ArticleList from "@/components/ArticleList";
import { Article } from "@/lib/types";
import { getMaintenanceMode } from "@/lib/data/maintenanceService";
import { useAuth } from "@/contexts/AuthContext";
import MaintenancePage from "@/components/maintenance/MaintenancePage";
import { useLogoUpload } from "@/hooks/useLogoUpload";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { supabase } from "@/integrations/supabase/client";
import { checkAndFixDisplayIssue } from "@/lib/data/issue/currentIssue"; // Add this import

const Index = () => {
  const [currentIssue, setCurrentIssue] = useState<string>("April 2025");
  const [showMaintenancePage, setShowMaintenancePage] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [issueWasFixed, setIssueWasFixed] = useState(false);
  const { isAuthenticated } = useAuth();
  const logoUrl = useLogoUpload();
  const { hideRead, updateHideRead } = useUserPreferences();
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true);
      try {
        const { data } = await supabase.auth.getSession();
        setIsAdmin(!!data.session);
        setCheckingAuth(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    const fetchReadArticles = async () => {
      if (!isAuthenticated) {
        setReadArticles(new Set());
        return;
      }
      
      try {
        const { data } = await supabase
          .from('article_reads')
          .select('article_id')
          .eq('read', true);
        
        if (data) {
          setReadArticles(new Set(data.map(item => item.article_id)));
        }
      } catch (error) {
        console.error('Error fetching read articles:', error);
      }
    };
    
    fetchReadArticles();
  }, [isAuthenticated]);

  useEffect(() => {
    const loadCurrentIssue = async () => {
      const issueData = await checkAndFixDisplayIssue();
      setCurrentIssue(issueData.text);
      setIssueWasFixed(issueData.wasFixed);
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

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar 
        onLogoClick={() => setShowMaintenancePage(false)} 
        currentIssue={currentIssue}
        showReadFilter={true}
        filterEnabled={hideRead}
        onFilterToggle={updateHideRead}
      />
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
        </header>
        
        {showMaintenancePage ? <MaintenancePage /> : (
          <>
            <div>
              <ArticleList 
                articles={articles} 
                loading={loading}
                readArticles={readArticles}
                hideRead={hideRead}
              />
            </div>
            
            <div className="mt-16 mb-8 flex flex-col items-center">
              <img 
                src="/lovable-uploads/17100c7f-adac-4287-bf4c-d08288a0c3f5.png" 
                alt="The Klatsch Storefront" 
                className="w-1/4 h-auto object-cover rounded-lg shadow-md max-w-[240px]"
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
