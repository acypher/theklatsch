

## Problem

The Edit page calls `getAllArticles()` on mount (line 51 of `EditArticleForm.tsx`) just to look up the article's `displayPosition`. That function triggers a chain of 3+ Supabase queries (`getCurrentIssue` → `getLatestIssue` → articles table), which is why the page takes ~15 seconds to load.

The `displayPosition` is already available on the single article returned by `getArticleById()`.

## Plan

**File: `src/components/EditArticleForm.tsx`**

1. Remove the `getAllArticles` import and call from the `useEffect` fetch.
2. Instead of searching all articles for the position, read `article.displayPosition` directly from the fetched article:
   ```
   const article = await getArticleById(id);
   setOriginalPosition(article.displayPosition || null);
   ```
3. Remove the `getAllArticles` import from the file entirely.

This is a single-file, ~5-line change that eliminates the expensive `getAllArticles` call and its cascading Supabase queries from the edit page load path.

