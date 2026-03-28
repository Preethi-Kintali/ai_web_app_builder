import { useEffect } from 'react';

/**
 * Custom hook to definitively lock the browser's navigation arrows (Back/Forward).
 * This version uses the industry-standard "Force Forward" pattern:
 * 1. On initial mount, it pushes a single dummy state to the history stack.
 * 2. When the user clicks the browser's 'Back' arrow, it triggers 'popstate'.
 * 3. Our listener instantly calls 'window.history.go(1)', which tells the browser 
 *    to immediately move forward by one step, keeping the user on the current page.
 * 
 * Crucially, by NOT dependency-tracking 'location.pathname', we avoid creating
 * a recursive or deep history stack that would crash the browser protocol.
 */
export function useNavigationLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    // Push exactly one dummy state to the stack on mount.
    // This provides a buffer so that a "Back" click has a "Forward" step to return to.
    window.history.pushState(null, null, window.location.href);

    const handlePopState = (event) => {
      // Re-push and move forward immediately without causing heavy reloads or crashes.
      window.history.go(1);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled]); // Only run on mount or when enabled changes
}
