import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { WifiOff, RefreshCw, AlertCircle, Send } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import LogoWithWhiteBg from "@/components/logo-with-white-bg";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function NetworkErrorPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isOffline, setIsOffline] = useState(false);
  const [errorReported, setErrorReported] = useState(false);
  
  useEffect(() => {
    // Check if the browser is online
    setIsOffline(!navigator.onLine);
    
    // Set up listeners for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  const reportIssue = () => {
    // In a real implementation, this would send error details to a backend
    setErrorReported(true);
    toast({
      title: "Error reported",
      description: "Thank you for reporting this issue. Our team has been notified.",
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="flex justify-center mb-6">
            <LogoWithWhiteBg width={200} />
          </div>
          
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            {isOffline ? (
              <AlertCircle className="h-8 w-8 text-amber-500" />
            ) : (
              <WifiOff className="h-8 w-8 text-amber-500" />
            )}
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isOffline ? "You're Offline" : "Connection Problem"}
          </h2>
          
          {isOffline ? (
            <p className="text-gray-600 mb-6">
              Your device isn't connected to the internet. Please check your connection and try again.
            </p>
          ) : (
            <>
              <p className="text-gray-600 mb-2">
                We're having trouble connecting to our servers. This could be due to:
              </p>
              
              <ul className="text-left text-gray-600 space-y-1 mb-6">
                <li className="flex items-start">
                  <span className="mr-2 text-amber-500">•</span>
                  Your internet connection
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-amber-500">•</span>
                  A temporary service outage
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-amber-500">•</span>
                  Server maintenance
                </li>
              </ul>
            </>
          )}
          
          <p className="text-gray-700 font-medium">
            Please check your connection and try again.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-center gap-3 pb-6">
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
          
          {!errorReported && (
            <Button variant="outline" onClick={reportIssue} className="gap-2">
              <Send className="h-4 w-4" />
              Report Issue
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}