

## Problem

When navigating back from an article to the home page, the "read" checkboxes show a "disallowed" cursor/tooltip because they remain permanently disabled.

**Root cause** in `useArticleReads.ts` line 19:

```typescript
if (!user || !isMounted.current || initialFetchDone.current) return;
```

When the component mounts, `loading` starts as `true`. If `user` is still `null` (auth session restoring), `fetchReadState` returns early **without ever setting `loading = false`**. The checkbox stays `disabled={loading}` forever, showing the browser's native "not-allowed" cursor.

Even when `user` later becomes available, the effect doesn't re-run because the `initialFetchDone` ref blocks it (though on a fresh mount it should be `false`). The primary issue is the early return when `!user` skips the `finally` block that sets `loading = false`.

## Fix

**File: `src/hooks/useArticleReads.ts`**

1. When `user` is null, explicitly set `loading = false` so the checkbox isn't stuck disabled.
2. Remove the `initialFetchDone` guard from the early-return that skips the loading reset, or restructure so loading is always resolved.

```typescript
useEffect(() => {
  const fetchReadState = async () => {
    if (!user) {
      setLoading(false);  // Don't leave checkbox disabled while auth loads
      return;
    }
    if (!isMounted.current || initialFetchDone.current) return;
    // ... rest unchanged
  };
  fetchReadState();
  // ...
}, [user, articleId]);
```

This ensures that when auth is still loading (user is null), the checkbox renders as enabled (unchecked) rather than disabled with a "disallowed" tooltip. Once user resolves, the effect re-runs and fetches the actual read state.

## Technical Details

- The Radix `CheckboxPrimitive.Root` with `disabled` renders `cursor: not-allowed` and shows a browser tooltip "disallowed" on hover
- The auth context restores asynchronously after navigation; during that window, `user` is null
- This is the same class of bug as the auth-loading-state guards already applied elsewhere

