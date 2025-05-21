import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { forceAuthRedirect, getHomePathForRole } from "./auth-helpers";
import { FetchError } from "@/components/fetch-error";
import ErrorBoundary from "@/components/error-boundary";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading, error } = useAuth();
  
  // Parse the path to handle param generation correctly
  const routePath = path || "/";
  
  return (
    <Route path={routePath}>
      {(params) => {
        console.log(`ProtectedRoute (${routePath}):`, { 
          isLoading, 
          isAuthenticated: !!user,
          userRole: user?.role,
          params
        });
        
        // Show loader during authentication check
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        // Show error if authentication fails with an error
        if (error) {
          return (
            <div className="flex items-center justify-center min-h-screen p-4">
              <FetchError 
                error={error} 
                retry={() => window.location.reload()}
              />
            </div>
          );
        }

        // Handle unauthenticated users
        if (!user) {
          console.log("Not authenticated, redirecting to /auth");
          // Use a hard redirect instead of SPA navigation for better cookie handling
          // This ensures the authentication cookies are properly applied
          forceAuthRedirect('/auth');
          return (
            <div className="flex items-center justify-center min-h-screen">
              <p className="text-muted-foreground">Redirecting to login...</p>
            </div>
          );
        }

        // Route to admin dashboard if admin role accessing client routes
        if (user.role === "admin" && !routePath.startsWith("/admin")) {
          console.log("Admin accessing client route, redirecting to /admin");
          forceAuthRedirect('/admin');
          return (
            <div className="flex items-center justify-center min-h-screen">
              <p className="text-muted-foreground">Redirecting to admin dashboard...</p>
            </div>
          );
        }

        // Route to client home if client tries to access admin routes
        if (user.role === "client" && routePath.startsWith("/admin")) {
          console.log("Client accessing admin route, redirecting to /");
          forceAuthRedirect('/');
          return (
            <div className="flex items-center justify-center min-h-screen">
              <p className="text-muted-foreground">Redirecting to home...</p>
            </div>
          );
        }

        console.log(`Rendering component for ${routePath} with params:`, params);
        // Wrap the component with ErrorBoundary for catching runtime errors
        return (
          <ErrorBoundary>
            <Component />
          </ErrorBoundary>
        );
      }}
    </Route>
  );
}
