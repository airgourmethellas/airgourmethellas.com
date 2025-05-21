import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Server, WifiOff, RefreshCw, AlertTriangle, Lock, FileQuestion } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { ApiError } from "@/lib/queryClient";

interface FetchErrorProps {
  error?: Error;
  retry?: () => void;
  statusCode?: number;
}

export function FetchError({ error, retry, statusCode }: FetchErrorProps) {
  const { t } = useLanguage();
  
  // Determine the status code either from props or from ApiError
  const errorStatusCode = statusCode || (error instanceof ApiError ? error.statusCode : undefined);
  
  // Determine the error type based on status code or error message
  let title = "Something went wrong";
  let message = error?.message || "We couldn't complete your request. Please try again.";
  let Icon = AlertTriangle;
  
  // Select icon based on error type
  if (errorStatusCode === 404 || error?.message?.includes('not found')) {
    title = "Resource not found";
    Icon = FileQuestion;
  } else if (errorStatusCode === 403 || error?.message?.includes('permission')) {
    title = "Access denied";
    Icon = Lock;
  } else if (errorStatusCode === 401 || error?.message?.includes('login')) {
    title = "Authentication required";
    Icon = Lock;
  } else if (error?.message?.includes('network') || error?.message?.includes('offline') || 
             error?.message?.includes('internet') || error?.message?.includes('connection')) {
    title = "Connection problem";
    Icon = WifiOff;
  } else if (errorStatusCode === 500 || error?.message?.includes('server')) {
    title = "Server error";
    Icon = Server;
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-md border-opacity-50">
      <CardContent className="pt-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        
        {/* Show original error message in development mode only */}
        {process.env.NODE_ENV === 'development' && error && error.message !== message && (
          <div className="p-3 bg-gray-100 rounded-md w-full mt-2 mb-4 text-left">
            <p className="text-sm font-medium text-gray-900">Original error (development only):</p>
            <p className="text-xs text-gray-700 break-words">{error.message}</p>
          </div>
        )}
      </CardContent>
      {retry && (
        <CardFooter className="flex justify-center pb-6">
          <Button onClick={retry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}