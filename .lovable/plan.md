

## Summary

Add a new `article_opens` table to track when users click on article cards, then display A/M/D letters in the article card footer showing which of the 3 special users have opened that article. Also remove the Summary button.

## Special Users

Based on the database:
- **A** = Allen Cypher (`2bb88f42-cf99-452d-9062-1900683c8ecb`)
- **M** = Max (`1a617016-b826-467f-9e52-fa65f1b63766`)
- **D** = 文字化け (`fb45f412-c52b-40b7-88b5-7cb86dac3e77`)

## Steps

### 1. Create `article_opens` table (migration)

```sql
CREATE TABLE public.article_opens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  user_id uuid NOT NULL,
  opened_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_id, user_id)
);

ALTER TABLE public.article_opens ENABLE ROW LEVEL SECURITY;

-- Everyone can read opens (needed to display A/M/D on cards)
CREATE POLICY "Anyone authenticated can view article opens"
  ON public.article_opens FOR SELECT TO authenticated
  USING (true);

-- Users can insert their own opens
CREATE POLICY "Users can insert their own opens"
  ON public.article_opens FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own opens (to refresh timestamp)
CREATE POLICY "Users can update their own opens"
  ON public.article_opens FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
```

### 2. Record opens when clicking article cards

In `ArticleCard.tsx`, inside the `Link`'s `onClick` handler (where `sessionStorage.setItem('indexScrollY', ...)` already runs), add an upsert to `article_opens` for the current user.

### 3. Create a hook `useArticleOpens`

A new hook that fetches article opens for the 3 special user IDs across all displayed articles in a single batch query. Returns a map of `articleId -> Set<userId>`. The hook will map user IDs to letters (A, M, D) using a hardcoded constant.

### 4. Pass opener letters into ArticleCardFooter

- Remove the `Summary` button and related props (`onSummaryClick`, `hasSummary`).
- Add a new `openerLetters` prop (e.g., `string[]` like `["A", "M"]`).
- Render the letters right after the Source button as small styled badges.

### 5. Wire it up in the parent

In `Index.tsx` (or wherever `ArticleCard` is rendered in a list), call `useArticleOpens` with the list of article IDs, then pass the computed letters down to each `ArticleCard`.

Alternatively, each `ArticleCard` can fetch its own opens for just the 3 special users (simpler, only 3 rows max per query).

### 6. Clean up SummaryDialog references

Remove the `SummaryDialog` import and state from `ArticleCard.tsx` since Summary is being removed from the footer. The summary data itself stays in the database.

## Technical Details

- The 3 special user IDs will be stored as a constant in a shared file (e.g., `src/lib/specialUsers.ts`).
- The `article_opens` upsert uses `ON CONFLICT (article_id, user_id)` to update `opened_at` on repeat visits.
- Each `ArticleCard` will query opens for its own article filtered to just the 3 special user IDs — this is lightweight (at most 3 rows).
- Letters are only shown for users *other than the current viewer* who created the article — actually, re-reading the requirement: letters show which special users have opened it, regardless of who created it. At most 2 letters appear because the current user (one of the 3) wouldn't see their own letter, only the other two.

