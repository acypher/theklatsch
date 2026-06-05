const FORCE_RELOAD_KEY = 'klatsch-force-reload';

/**
 * Full document navigation followed by one reload on arrival.
 * Mimics clicking Cmd+R after landing — avoids slow first paint on SPA-heavy pages.
 */
export function hardNavigate(url: string): void {
  sessionStorage.setItem(FORCE_RELOAD_KEY, '1');
  window.location.href = url;
}

/** Call once before React mounts; returns true if a reload was triggered. */
export function consumeForcedReload(): boolean {
  if (sessionStorage.getItem(FORCE_RELOAD_KEY) === '1') {
    sessionStorage.removeItem(FORCE_RELOAD_KEY);
    return true;
  }
  return false;
}
