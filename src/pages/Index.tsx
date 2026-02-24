import React, { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getCurrentIssue } from "@/lib/data";
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
import PasswordReset from "@/components/auth/PasswordReset";
import { searchArchives, ArchiveSearchResult } from "@/lib/data/archiveSearch";
import ArchiveSearchResults from "@/components/article/ArchiveSearchResults";
import { useArticles } from "@/hooks/useArticles";
import { useAllArticlesForSearch } from "@/hooks/useAllArticlesForSearch";

const Index = () => {
  const [currentIssue, setCurrentIssue] = useState<string>("");
  const [showMaintenancePage, setShowMaintenancePage] = useState(false);
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

  // React Query hooks for articles
  const { articles, isLoading: articlesLoading } = useArticles(currentIssue);
  const { allArticlesForSearch } = useAllArticlesForSearch();
  const loading = !currentIssue || articlesLoading;

  // Check if this is a password reset request
  const isPasswordReset = searchParams.has('access_token') && searchParams.has('refresh_token');

  // Restore scroll position on mount
  useEffect(() => {
    const scrollY = parseInt(sessionStorage.getItem('indexScrollY') || '0', 10);
    if (scrollY > 0) {
      sessionStorage.removeItem('indexScrollY');
      // Wait for articles to render before restoring scroll
      if (!loading && articles.length > 0) {
        requestAnimationFrame(() => {
          setTimeout(() => window.scrollTo({ top: scrollY, behavior: 'instant' as ScrollBehavior }), 50);
        });
      }
    }
  }, [loading, articles.length]);

  useEffect(() => {
    document.title = "The Klatsch";

    const loadCurrentIssue = async () => {
      const issueData = await getCurrentIssue();
      const dbIssue = issueData.text;

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

      if (!userSelectedIssue) {
        localStorage.removeItem('selected_issue');
        localStorage.removeItem('selected_issue_v2');
      }

      const effectiveIssue = userSelectedIssue ?? dbIssue;
      setCurrentIssue(effectiveIssue);
    };

    loadCurrentIssue();
  }, [isAuthenticated]);

  useEffect(() => {
    document.title = "The Klatsch";
  }, [location]);

  useEffect(() => {
    const loadMaintenanceMode = async () => {
      const mode = await getMaintenanceMode();
      setShowMaintenancePage(mode === "maintenance");
    };
    loadMaintenanceMode();
  }, []);

  // Filter articles for display
  const filteredArticles = React.useMemo(() => {
    let result: Article[];

    if (showFavoritesOnly && isAuthenticated) {
      result = allArticlesForSearch.filter(article => allFavorites.has(article.id));
      result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (searchQuery.trim()) {
      result = searchArticles(allArticlesForSearch, searchQuery, { wholeWords });
      result = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      result = articles;
    }

    if (isAuthenticated && !preferences.show_list_articles) {
      result = result.filter(article => !article.keywords.includes('list'));
    }

    if (filterEnabled && isAuthenticated && !showFavoritesOnly) {
      result = result.filter(article => !readArticles.has(article.id));
    }

    return result;
  }, [articles, allArticlesForSearch, searchQuery, wholeWords, filterEnabled, readArticles, isAuthenticated, showFavoritesOnly, allFavorites, preferences.show_list_articles]);

  const handleSearch = async (query: string, wholeWordsEnabled: boolean) => {
    setSearchQuery(query);
    setWholeWords(wholeWordsEnabled);
    if (query.trim()) {
      setFilterEnabled(false);
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
    if (!showFavoritesOnly) {
      setFilterEnabled(false);
      handleClearSearch();
    }
  };

  if (isPasswordReset) {
    return <PasswordReset />;
  }

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
