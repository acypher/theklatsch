import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getCurrentIssue, getAllArticles, checkAndFixDisplayIssue } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import ArticleList from "@/components/ArticleList";
import { Article } from "@/lib/types";

const Index = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [currentIssue, setCurrentIssue] = useState<string>("April 2025");
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

  return (
    <div>
      <Navbar onLogoClick={() => {}} />
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
          <p 
            id="subtitle"
            className="text-xl text-muted-foreground max-w-2xl mx-auto block"
          >
            {currentIssue}
            {issueWasFixed && isAdmin && (
              <span className="text-sm text-green-500 ml-2">(Fixed)</span>
            )}
          </p>
        </header>
        
        <ArticleList 
          articles={articles} 
          loading={loading}
        />
      </main>
    </div>
  );
};

export default Index;
