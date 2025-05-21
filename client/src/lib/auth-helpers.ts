/**
 * Helper functions for authentication-related redirects and flow control
 */

/**
 * Forces a full page refresh/redirect to ensure cookies are properly handled
 * Unlike the SPA navigation, this ensures a fresh HTTP request with cookies
 * @param path The destination path
 * @param delay Optional delay before redirect (ms)
 */
export function forceAuthRedirect(path: string, delay: number = 0): void {
  if (delay > 0) {
    setTimeout(() => {
      window.location.href = path;
    }, delay);
  } else {
    window.location.href = path;
  }
}

/**
 * Determines the correct redirect path based on user role
 * @param role User role (admin, client, etc)
 * @returns The appropriate home path
 */
export function getHomePathForRole(role?: string): string {
  if (role === 'admin') {
    return '/admin';
  }
  return '/';
}

/**
 * Logs out the user with a full page redirect
 * This issues a POST to /api/logout and then redirects to login page
 */
export async function performLogout(): Promise<void> {
  try {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Always redirect to auth page after logout attempt
    forceAuthRedirect('/auth');
  }
}