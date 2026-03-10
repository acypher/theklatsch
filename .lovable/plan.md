

## Diagnosis: Why Back-Navigation Is Slow

The root cause is **not** the article data — React Query already caches that. The bottleneck is the **`currentIssue` state**, which initializes as `""` on every remount of `Index`. Because `useArticles` has `enabled: !!currentIssue`, it won't return cached data until after the async `getCurrentIssue()` Supabase call completes. This means every back-navigation waits for a network round-trip before showing anything.

## Plan: Synchronous Issue Initialization

**The fix is simple**: cache `currentIssue` in `sessionStorage` so it's available synchronously on remount, allowing React Query to serve cached articles instantly.

### Changes to `src/pages/Index.tsx`

1. **Initialize `currentIssue` from sessionStorage** instead of `""`:
   ```ts
   const [currentIssue, setCurrentIssue] = useState<string>(
     () => sessionStorage.getItem('currentIssue') || ""
   );
   ```

2. **Persist `currentIssue` when it changes** — add a small effect:
   ```ts
   useEffect(() => {
     if (currentIssue) sessionStorage.setItem('currentIssue', currentIssue);
   }, [currentIssue]);
   ```

That's it. With this change:
- First visit: `currentIssue` starts empty, async fetch runs, articles load normally
- Back-navigation: `currentIssue` is instantly available from sessionStorage → `useArticles` immediately returns cached React Query data → page renders with zero delay
- The async `getCurrentIssue()` still runs in the background and updates the issue if it changed

No other files need to change. No HTML caching needed — the actual bottleneck was just a missing synchronous seed value for the issue string.

