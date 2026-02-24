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
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { searchArticles } from "@/lib/search";
import { supabase } from "@/integrations/supabase/client";
import PasswordReset from "@/components/auth/PasswordReset";
import { searchArchives, ArchiveSearchResult } from "@/lib/data/archiveSearch";
import ArchiveSearchResults from "@/components/article/ArchiveSearchResults";

const INDEX_STATE_KEY = 'indexPageState';

const Index = () => {
  const [currentIssue, setCurrentIssue] = useState<string>("");
  const [showMaintenancePage, setShowMaintenancePage] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [wholeWords, setWholeWords] = useState(false);
  const articleListRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { readArticles, filterEnabled, setFilterEnabled } = useReadArticles(isAuthenticated, authLoading);
  const { allFavorites } = useArticleFavorites();
  const { preferences } = useUserPreferences();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [archiveResults, setArchiveResults] = useState<ArchiveSearchResult[]>([]);

  // Check if this is a password reset request
  const isPasswordReset = searchParams.has('access_token') && searchParams.has('refresh_token');

  // Restore saved state when navigating back from an article
  const restoredStateRef = useRef(false);
  const restoredIssueRef = useRef<string | null>(null);
  useEffect(() => {
    if (restoredStateRef.current) return;
    const saved = sessionStorage.getItem(INDEX_STATE_KEY);
    if (saved) {
      try {
        const state = JSON.parse(saved);
        sessionStorage.removeItem(INDEX_STATE_KEY);
        restoredStateRef.current = true;
        restoredIssueRef.current = state.currentIssue || null;
        if (state.articles?.length) setArticles(state.articles);
        if (state.currentIssue) setCurrentIssue(state.currentIssue);
        if (state.searchQuery !== undefined) setSearchQuery(state.searchQuery);
        if (state.wholeWords !== undefined) setWholeWords(state.wholeWords);
        if (state.archiveResults) setArchiveResults(state.archiveResults);
        // Restore read articles from cache to avoid flash while auth loads
        if (state.readArticleIds?.length) {
          setFilterEnabled(state.filterEnabled ?? filterEnabled);
          // We'll restore readArticles via a ref that useReadArticles can pick up
          sessionStorage.setItem('cachedReadArticles', JSON.stringify(state.readArticleIds));
        }
        setLoading(false);
        // Restore scroll position after DOM settles
        const scrollY = parseInt(sessionStorage.getItem('indexScrollY') || '0', 10);
        sessionStorage.removeItem('indexScrollY');
        if (scrollY > 0) {
          requestAnimationFrame(() => {
            setTimeout(() => window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior }), 50);
          });
        }
        return;
      } catch {
        sessionStorage.removeItem(INDEX_STATE_KEY);
      }
    }
  }, []);

  // If it's a password reset, show the password reset component
  if (isPasswordReset) {
    return <PasswordReset />;
  }

useEffect(() => {
  // Set the home page title
  console.log("Index: Setting title to 'The Klatsch'");
  document.title = "The Klatsch";

  const loadCurrentIssue = async () => {
    // DB is the source of truth for “latest/current issue” across browsers.
    const issueData = await getCurrentIssue();
    const dbIssue = issueData.text;

    // v2 persisted selection: only trust it if it was explicitly set by the user
    // (older builds wrote `selected_issue` without provenance; that value can be stale).
    const rawV2 = localStorage.getItem('selected_issue_v2');
    let userSelectedIssue: string | null = null;

    if (rawV2) {
      try {
        const parsed = JSON.parse(rawV2) as { issue?: unknown; source?: unknown };
        if (parsed?.source === 'user' && typeof parsed.issue === 'string' && parsed.issue.trim()) {
          userSelectedIssue = parsed.issue.trim();
        }
      } catch {
        // ignore malformed v2
      }
    }

    // Clean up legacy/stale keys so other browsers stop “sticking” to January.
    if (!userSelectedIssue) {
      localStorage.removeItem('selected_issue');
      localStorage.removeItem('selected_issue_v2');
    }

    const effectiveIssue = userSelectedIssue ?? dbIssue;

    // If restored state belongs to a different issue, fetch fresh data for the effective issue.
    if (restoredIssueRef.current && restoredIssueRef.current !== effectiveIssue) {
      restoredStateRef.current = false;
      setLoading(true);
    }

    setCurrentIssue(effectiveIssue);
  };

  loadCurrentIssue();
}, [isAuthenticated]);

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
  // Only fetch when we have a valid issue string AND we didn't restore from cache
  if (!currentIssue) return;
  if (restoredStateRef.current) return; // skip re-fetch when restoring from cache

  const fetchArticles = async () => {
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

  // Continuously save Index state to sessionStorage so it's ready if the user clicks an article
  useEffect(() => {
    if (loading || !currentIssue || !articles.length) return;
    const state = {
      articles, currentIssue, searchQuery, wholeWords, archiveResults,
      readArticleIds: Array.from(readArticles),
      filterEnabled
    };
    sessionStorage.setItem(INDEX_STATE_KEY, JSON.stringify(state));
  }, [articles, currentIssue, searchQuery, wholeWords, archiveResults, loading, readArticles, filterEnabled]);

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

    // Filter out "list" articles for authenticated users who have show_list_articles disabled
    if (isAuthenticated && !preferences.show_list_articles) {
      result = result.filter(article => !article.keywords.includes('list'));
    }

    // Then apply read filter if enabled (but not when showing favorites)
    if (filterEnabled && isAuthenticated && !showFavoritesOnly) {
      result = result.filter(article => !readArticles.has(article.id));
    }

    return result;
  }, [articles, allArticlesForSearch, searchQuery, wholeWords, filterEnabled, readArticles, isAuthenticated, showFavoritesOnly, allFavorites, preferences.show_list_articles]);

  // Search handlers
  const handleSearch = async (query: string, wholeWordsEnabled: boolean) => {
    setSearchQuery(query);
    setWholeWords(wholeWordsEnabled);
    // When starting a search, show all articles (not just unread)
    if (query.trim()) {
      setFilterEnabled(false);
      // Search archives too
      const archiveHits = await searchArchives(query);
      setArchiveResults(archiveHits);
    } else {
      setArchiveResults([]);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setWholeWords(false);
    setArchiveResults([]);
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
            {/* Archive search results */}
            {searchQuery && archiveResults.length > 0 && (
              <ArchiveSearchResults 
                results={archiveResults} 
                searchQuery={searchQuery} 
              />
            )}
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
