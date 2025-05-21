import { ErrorFallback } from "@/components/error-fallback";

export default function NotFound() {
  // Create a custom error for the 404 page
  const notFoundError = new Error("The page you're looking for cannot be found");
  
  return (
    <ErrorFallback 
      error={notFoundError} 
      resetErrorBoundary={() => window.location.href = '/'} 
    />
  );
}
