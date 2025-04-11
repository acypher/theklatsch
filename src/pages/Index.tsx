
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getCurrentIssue, getAllArticles, checkAndFixDisplayIssue } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Image } from "lucide-react";
import ArticleList from "@/components/ArticleList";
import { Article } from "@/lib/types";
import { getMaintenanceMode } from "@/lib/data/maintenanceService";
import { updateSpecificArticle } from "@/lib/data/updateSpecificArticle";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [currentIssue, setCurrentIssue] = useState<string>("April 2025");
  const [showMaintenancePage, setShowMaintenancePage] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [issueWasFixed, setIssueWasFixed] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true);
      const { data } = await supabase.auth.getSession();
      setIsAdmin(!!data.session);
      setCheckingAuth(false);
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
      } catch (error) {
        console.error('Error with logo:', error);
      }
    };
    
    uploadLogo();
  }, []);

  const MaintenancePage = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        
        <h2 className="text-3xl font-bold mb-6">Lovable Trouble</h2>
        
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/a99bdae2-b16b-477b-87c2-37edc603881f.png" 
            alt="Person confused looking at computer with errors" 
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
        
        <p className="text-lg text-muted-foreground mt-6">
          We're currently experiencing some technical difficulties. 
          Our team is working hard to resolve the issue.
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar 
        onLogoClick={() => setShowMaintenancePage(false)} 
        currentIssue={currentIssue}
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
            <ArticleList 
              articles={articles} 
              loading={loading}
            />
            
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
