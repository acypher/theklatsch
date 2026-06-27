import { createContext, useContext } from "react";

export interface CommentInfo {
  commentCount: number;
  viewedCommentCount: number;
}

export interface ArticleListData {
  /** Comment + viewed-comment counts, batch-fetched once for the whole list. */
  commentCounts: Record<string, CommentInfo>;
  /** Set of article IDs the current user has marked read (bulk-fetched once). */
  readArticles: Set<string>;
  /** Set of the current user's favorite article IDs (bulk-fetched once). */
  favorites: Set<string>;
  /** Measured height of a standard article card in the first grid row. */
  cardHeight: number;
  toggleRead: (articleId: string) => void;
  toggleFavorite: (articleId: string) => void;
}

const FALLBACK: ArticleListData = {
  commentCounts: {},
  readArticles: new Set(),
  favorites: new Set(),
  cardHeight: 380,
  toggleRead: () => {},
  toggleFavorite: () => {},
};

const ArticleListDataContext = createContext<ArticleListData | null>(null);

export const ArticleListDataProvider = ArticleListDataContext.Provider;

/**
 * Per-card data (comment counts, read state, favorite state) that is fetched
 * once at the list level and shared with every card. This avoids each card
 * issuing its own Supabase queries, which previously produced a burst of
 * ~6 requests per card on the home page.
 */
export const useArticleListData = (): ArticleListData => {
  return useContext(ArticleListDataContext) ?? FALLBACK;
};
