

## Robust Front Page Loading and Instant Back-Navigation

### Problem

1. **"List" articles disappear** after returning from an article -- The `sessionStorage` caching/restoration system has race conditions between multiple effects (state restoration, issue loading, and article fetching). When conditions don't align perfectly, the restored articles can be cleared or the fetch can be skipped, causing "list" keyword articles to vanish.

2. **Back-navigation performance** -- `navigate("/")` does NOT cause a full browser reload (it's client-side React Router navigation). However, the `Index` component does unmount/remount, losing all React state. The current `sessionStorage`-based restoration is fragile and the root cause of bug #1.

### Solution: Replace sessionStorage caching with React Query

The project already has `@tanstack/react-query` installed with a `QueryClient` configured. React Query's cache persists across component unmount/remount cycles, making it the ideal replacement for the manual `sessionStorage` approach.

### What Changes

**Create two new hooks:**

- `src/hooks/useArticles.ts` -- Wraps `getAllArticles(issueText)` in `useQuery` with key `['articles', currentIssue]` and a generous `staleTime` (5 minutes). Returns cached data instantly on remount.

- `src/hooks/useAllArticlesForSearch.ts` -- Wraps the "fetch all articles" Supabase query in `useQuery` with key `['articles', 'all']`. Uses the shared `mapArticleFromDb` utility instead of the inline mapping currently in Index.tsx.

**Simplify `src/pages/Index.tsx`:**

- Replace manual `useState`/`useEffect` article fetching with the two new hooks
- Remove all `sessionStorage` state caching: the `INDEX_STATE_KEY`, `RESTORE_INDEX_STATE_KEY` constants, the restoration effect (lines 45-92), the continuous-save effect (lines 186-194), and both refs (`restoredStateRef`, `restoredIssueRef`)
- Remove `cachedReadArticles` sessionStorage usage
- Keep only lightweight scroll position save/restore via `sessionStorage` (`indexScrollY`): on mount, check for saved scroll position and restore it after articles render

**Simplify `src/components/ArticleCard.tsx`:**

- Remove the `restoreIndexState` flag setting on click (line 166)
- Keep only the `indexScrollY` scroll position save on click (line 168)

**Clean up `src/hooks/useReadArticles.ts`:**

- Remove the `cachedReadArticles` sessionStorage initialization (lines 12-18), replace with a plain `new Set()`

### Why This Works

- When a user clicks "Back to articles" and `navigate("/")` runs, `Index` remounts but `useQuery` returns the cached article data instantly -- no loading spinner, no flicker, no race conditions
- The "list" articles are always present because they come from the actual query result cached by React Query, not from a manually-serialized snapshot
- Fresh page loads work correctly because `useQuery` simply fetches from the database
- Search state (query text, whole words, archive results) resets on back-navigation, which is acceptable behavior; the article list itself is preserved

### Files to Create
- `src/hooks/useArticles.ts`
- `src/hooks/useAllArticlesForSearch.ts`

### Files to Modify
- `src/pages/Index.tsx`
- `src/components/ArticleCard.tsx`
- `src/hooks/useReadArticles.ts`

