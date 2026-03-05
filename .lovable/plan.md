

## Problem Analysis

Two issues need fixing:

### 1. KeywordInput race condition
When typing "cry" and clicking "crypto" from the dropdown, the `onBlur` handler fires first (when focus leaves the input), waits 150ms, then commits the partial text "cry". The dropdown's `onSelect` fires too late to prevent this.

**Fix**: Add a `skipBlurCommitRef` flag. Set it to `true` on `onMouseDown` of dropdown items, and check it in the `onBlur` handler to skip committing the partial text.

### 2. Front page stuck on "Loading articles"
The `getCurrentIssue()` function in `currentIssue.ts` makes multiple sequential Supabase calls: first `display_issue`, then `getLatestIssue()` (which queries `latest_issue`), and potentially `updateDisplayIssue()` (3 more writes) if the current issue is behind the latest. This waterfall blocks `setCurrentIssue()` in Index.tsx, which keeps `loading = true` and shows the spinner.

Additionally, the `HomeLogo` component fetches from Supabase storage on every mount (listing files, checking existence, getting public URL), which can delay rendering and cause the banner to appear without its background while loading.

**Fix**:
- Optimize `getCurrentIssue()` by fetching `display_issue` and `latest_issue` in parallel instead of sequentially
- In `HomeLogo`, hardcode the known public URL instead of fetching/checking storage on every mount

## Technical Changes

### File 1: `src/components/article/KeywordInput.tsx`
- Add `useRef` for `skipBlurCommitRef` (boolean)
- On dropdown `CommandItem`, add `onMouseDown` that sets `skipBlurCommitRef.current = true`
- In `onBlur` handler, check `skipBlurCommitRef.current` — if true, reset it and skip committing

### File 2: `src/lib/data/issue/currentIssue.ts`
- Fetch `display_issue` and call `getLatestIssue()` in parallel using `Promise.all` instead of sequentially

### File 3: `src/components/home/HomeLogo.tsx`
- Replace the storage list/upload/getPublicUrl logic with a hardcoded URL to the known logo, eliminating the async fetch entirely

