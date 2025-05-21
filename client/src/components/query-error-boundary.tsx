import { FetchError } from "@/components/fetch-error";
import ErrorBoundary from "@/components/error-boundary";
import { ReactNode } from "react";

interface QueryErrorBoundaryProps {
  children: ReactNode;
  error?: Error | null;
  isLoading?: boolean;
  retry?: () => void;
  loadingComponent?: ReactNode;
}

/**
 * A component that handles query errors and loading states in a consistent way
 * Perfect for wrapping components that use React Query
 */
export function QueryErrorBoundary({
  children,
  error,
  isLoading,
  retry,
  loadingComponent
}: QueryErrorBoundaryProps) {
  // If there's an error, show the FetchError component
  if (error) {
    return (
      <div className="w-full p-4 flex justify-center">
        <FetchError error={error} retry={retry} />
      </div>
    );
  }

  // If it's loading, show the loading component or a default spinner
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Otherwise, render the children inside an ErrorBoundary to catch runtime errors
  return <ErrorBoundary>{children}</ErrorBoundary>;
}