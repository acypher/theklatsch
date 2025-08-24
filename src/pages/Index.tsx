import React, { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getCurrentIssue, getAllArticles, checkAndFixDisplayIssue } from "@/lib/data";
import ArticleList from "@/components/ArticleList";
import SearchBar from "@/components/SearchBar";
import { Article } from "@/lib/types";
import { getMaintenanceMode } from "@/lib/data/maintenanceService";
import { useAuth } from "@/contexts/AuthContext";
import { HomeLogo } from "@/components/home/HomeLogo";
import { MaintenancePage } from "@/components/home/MaintenancePage";
import { StorefrontImage } from "@/components/home/StorefrontImage";
import { useReadArticles } from "@/hooks/useReadArticles";
import { searchArticles } from "@/lib/search";
import { supabase } from "@/integrations/supabase/client";
import { mapArticleFromDb } from "@/lib/data/utils";
import { LogoUploader } from "@/components/LogoUploader";
import TableOfContents from "@/components/TableOfContents"; //Import TableOfContents Component
import PasswordReset from "@/components/auth/PasswordReset";

const Index = () => {
  const [currentIssue, setCurrentIssue] = useState<string>("April 2025");
  const [showMaintenancePage, setShowMaintenancePage] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const articleListRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { readArticles, filterEnabled, setFilterEnabled } = useReadArticles(isAuthenticated);

  // Check if this is a password reset request
  const isPasswordReset = searchParams.has('access_token') && searchParams.has('refresh_token');

  // If it's a password reset, show the password reset component
  if (isPasswordReset) {
    return <PasswordReset />;
  }

  useEffect(() => {
    // Set the home page title
    document.title = "The Klatsch";
    
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

  // Effect to restore scroll position after article view
  useEffect(() => {
    const restoreScrollPosition = () => {
      const lastViewedArticleId = sessionStorage.getItem('lastViewedArticleId');

      if (lastViewedArticleId) {
        // Wait for articles to load and DOM to be ready
        setTimeout(() => {
          const articleElement = document.querySelector(`[data-article-id="${lastViewedArticleId}"]`);

          if (articleElement) {
            const navbar = document.querySelector('nav');
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const extraPadding = 20;
            const yOffset = -(navbarHeight + extraPadding);

            const y = articleElement.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({
              top: y,
              behavior: 'smooth'
            });

            // Clear the saved article ID after scrolling
            sessionStorage.removeItem('lastViewedArticleId');
          }
        }, 100);
      }
    };

    restoreScrollPosition();
  }, [articles, location]);

  // Store all articles without issue filtering for search
  const [allArticlesForSearch, setAllArticlesForSearch] = useState<Article[]>([]);

  // Fetch all articles for search (without issue filtering)
  useEffect(() => {
    const fetchAllArticlesForSearch = async () => {
      try {
        const { data: allArticles, error } = await supabase
          .from('articles')
          .select('*')
          .eq('deleted', false)
          .order('display_position', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        if (allArticles) {
          const mappedArticles = allArticles.map(article => {
            return {
              id: article.id,
              title: article.title || '',
              description: article.description || '',
              more_content: article.more_content || '',
              imageUrl: article.imageurl || '',
              month: article.month || '',
              year: article.year || '',
              keywords: article.keywords || [],
              author: article.author || '',
              createdAt: article.created_at,
              updatedAt: article.created_at, // Using created_at since updated_at doesn't exist
              displayPosition: article.display_position || 0,
              deleted: article.deleted || false,
              sourceUrl: article.sourceurl || '' // Using sourceurl instead of url
            };
          });

          if (mappedArticles.length > 0) {
            console.log("=== ARTICLE MAPPING DEBUG ===");
            console.log("First mapped article:", mappedArticles[0]);
            console.log("=== END DEBUG ===");
          }
          setAllArticlesForSearch(mappedArticles);
        }
      } catch (error) {
        console.error("Error fetching all articles for search:", error);
      }
    };

    fetchAllArticlesForSearch();
  }, []);

  // Filter articles for display, but keep the full list for reference
  const filteredArticles = React.useMemo(() => {
    let result: Article[];

    // Apply search filter first - search across ALL articles, not just current issue
    if (searchQuery.trim()) {
      result = searchArticles(allArticlesForSearch, searchQuery);
    } else {
      // If no search query, use current issue articles
      result = articles;
    }

    // Then apply read filter if enabled
    if (filterEnabled && isAuthenticated) {
      result = result.filter(article => !readArticles.has(article.id));
    }

    return result;
  }, [articles, allArticlesForSearch, searchQuery, filterEnabled, readArticles, isAuthenticated]);

  // Search handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  console.log("Index - All articles:", articles.map(a => a.id));
  console.log("Index - Filtered articles:", filteredArticles.map(a => a.id));

  const [hideRead, setHideRead] = useState(false);
  const [commentCounts, setCommentCounts] = useState({});
  const [displayIssue, setDisplayIssue] = useState("April 2025");

    // Example handler (replace with your actual implementation)
    const handleArticleClick = (articleId: string) => {
      console.log(`Article clicked: ${articleId}`);
    };


  return (
    <div className="min-h-screen">
      <Navbar 
        onLogoClick={() => setShowMaintenancePage(false)} 
        currentIssue={currentIssue}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        searchQuery={searchQuery}
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
                allArticles={articles}
                loading={loading}
                readArticles={readArticles}
                hideRead={filterEnabled}
                filterEnabled={filterEnabled}
                onFilterToggle={setFilterEnabled}
                currentIssue={currentIssue}
                searchQuery={searchQuery}
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
