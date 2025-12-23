import React, { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getCurrentIssue, getAllArticles } from "@/lib/data";
import ArticleList from "@/components/ArticleList";
import { Article } from "@/lib/types";
import { getMaintenanceMode } from "@/lib/data/maintenanceService";
import { useAuth } from "@/contexts/AuthContext";
import { HomeLogo } from "@/components/home/HomeLogo";
import { MaintenancePage } from "@/components/home/MaintenancePage";
import { StorefrontImage } from "@/components/home/StorefrontImage";
import { useReadArticles } from "@/hooks/useReadArticles";
import { useArticleFavorites } from "@/hooks/useArticleFavorites";
import { searchArticles } from "@/lib/search";
import { supabase } from "@/integrations/supabase/client";
import PasswordReset from "@/components/auth/PasswordReset";

const Index = () => {
  const [currentIssue, setCurrentIssue] = useState<string>(() => {
    return localStorage.getItem('selected_issue') || "April 2025";
  });
  const [showMaintenancePage, setShowMaintenancePage] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [wholeWords, setWholeWords] = useState(false);
  const articleListRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { readArticles, filterEnabled, setFilterEnabled } = useReadArticles(isAuthenticated);
  const { allFavorites } = useArticleFavorites();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Check if this is a password reset request
  const isPasswordReset = searchParams.has('access_token') && searchParams.has('refresh_token');

  // If it's a password reset, show the password reset component
  if (isPasswordReset) {
    return <PasswordReset />;
  }

useEffect(() => {
  // Set the home page title
  console.log("Index: Setting title to 'The Klatsch'");
  document.title = "The Klatsch";

  const loadCurrentIssue = async () => {
    // Prefer locally selected issue (works for signed-in and signed-out users)
    const stored = localStorage.getItem('selected_issue');
    if (stored) {
      setCurrentIssue(stored);
      return;
    }

    const issueData = await getCurrentIssue();
    setCurrentIssue(issueData.text);
  };

  loadCurrentIssue();
}, []);

  // Additional effect to ensure title is always correct on this page
  useEffect(() => {
    console.log("Index: Ensuring title remains 'The Klatsch'");
    document.title = "The Klatsch";
  }, [location]);

  // Effect to set title when component mounts or updates
  useEffect(() => {
    console.log("Index: Setting title on component update");
    document.title = "The Klatsch";
  });

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
      const articlesData = await getAllArticles(currentIssue);
      setArticles(articlesData);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchArticles();
}, [currentIssue]);

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
              sourceUrl: article.sourceurl || '', // Using sourceurl instead of url
              private: article.private || false,
              summary: article.summary || ''
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

    // Apply favorites filter first if enabled
    if (showFavoritesOnly && isAuthenticated) {
      result = allArticlesForSearch.filter(article => allFavorites.has(article.id));
      // Sort favorites by creation date, most recent first
      result = result.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    } else if (searchQuery.trim()) {
      // Apply search filter - search across ALL articles, not just current issue
      result = searchArticles(allArticlesForSearch, searchQuery, { wholeWords });
      // Sort search results by creation date, most recent first
      result = result.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
    } else {
      // If no search query or favorites filter, use current issue articles
      result = articles;
    }

    // Then apply read filter if enabled (but not when showing favorites)
    if (filterEnabled && isAuthenticated && !showFavoritesOnly) {
      result = result.filter(article => !readArticles.has(article.id));
    }

    return result;
  }, [articles, allArticlesForSearch, searchQuery, wholeWords, filterEnabled, readArticles, isAuthenticated, showFavoritesOnly, allFavorites]);

  // Search handlers
  const handleSearch = (query: string, wholeWordsEnabled: boolean) => {
    setSearchQuery(query);
    setWholeWords(wholeWordsEnabled);
    // When starting a search, show all articles (not just unread)
    if (query.trim()) {
      setFilterEnabled(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setWholeWords(false);
  };

  const handleKeywordClick = (keyword: string) => {
    handleSearch(`key:${keyword}`, false);
  };

  const handleFavoritesToggle = () => {
    setShowFavoritesOnly(prev => !prev);
    // When enabling favorites, disable read filter and clear search
    if (!showFavoritesOnly) {
      setFilterEnabled(false);
      handleClearSearch();
    }
  };

  console.log("Index - All articles:", articles.map(a => a.id));
  console.log("Index - Filtered articles:", filteredArticles.map(a => a.id));


  return (
    <div className="min-h-screen">
      <Navbar 
        onLogoClick={() => setShowMaintenancePage(false)} 
        currentIssue={currentIssue}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        searchQuery={searchQuery}
        wholeWords={wholeWords}
        onWholeWordsChange={setWholeWords}
        showFavoritesOnly={showFavoritesOnly}
        onFavoritesToggle={handleFavoritesToggle}
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
                onKeywordClick={handleKeywordClick}
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
