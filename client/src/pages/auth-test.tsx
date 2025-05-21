import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function AuthTest() {
  const { user, isLoading, loginMutation } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authStatus, setAuthStatus] = useState<"unknown" | "authenticated" | "not-authenticated">("unknown");
  const [authDetails, setAuthDetails] = useState<any>(null);
  const { toast } = useToast();
  
  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Function to test authentication
  const checkAuthStatus = async () => {
    setIsCheckingAuth(true);
    
    try {
      const response = await fetch('/api/auth-check', {
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      const data = await response.json();
      console.log("Auth check result:", data);
      
      setAuthDetails(data);
      setAuthStatus(data.authenticated ? "authenticated" : "not-authenticated");
      
    } catch (error) {
      console.error("Error checking auth status:", error);
      setAuthStatus("not-authenticated");
      toast({
        title: "Auth Check Failed",
        description: "Could not verify authentication status",
        variant: "destructive"
      });
    } finally {
      setIsCheckingAuth(false);
    }
  };
  
  // Test login function
  const handleTestLogin = async () => {
    try {
      await loginMutation.mutateAsync({
        username: "admin",
        password: "admin123"
      });
      
      toast({
        title: "Login Successful",
        description: "You are now logged in as admin",
      });
      
      // Check auth again after login
      checkAuthStatus();
      
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Could not log in with test credentials",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Authentication Test Page</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Auth Status Card */}
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">Authentication Status</h3>
              
              {isCheckingAuth ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Checking authentication status...
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    {authStatus === "authenticated" ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                        <span className="text-green-600 font-medium">Authenticated</span>
                      </>
                    ) : authStatus === "not-authenticated" ? (
                      <>
                        <XCircle className="h-6 w-6 text-red-500" />
                        <span className="text-red-600 font-medium">Not Authenticated</span>
                      </>
                    ) : (
                      <span className="text-yellow-600 font-medium">Status Unknown</span>
                    )}
                  </div>
                  
                  {authDetails && (
                    <div className="bg-slate-50 p-4 rounded-md text-sm font-mono overflow-x-auto">
                      <pre>{JSON.stringify(authDetails, null, 2)}</pre>
                    </div>
                  )}
                </>
              )}
              
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={checkAuthStatus}
                  variant="outline"
                  disabled={isCheckingAuth}
                >
                  {isCheckingAuth && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Check Again
                </Button>
                
                <Button 
                  onClick={handleTestLogin}
                  disabled={loginMutation.isPending || isCheckingAuth}
                >
                  {loginMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Test Login
                </Button>
              </div>
            </div>
            
            {/* Current User Info */}
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">User from Auth Context</h3>
              
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading user data...
                </div>
              ) : user ? (
                <div className="bg-slate-50 p-4 rounded-md text-sm font-mono overflow-x-auto">
                  <pre>{JSON.stringify(user, null, 2)}</pre>
                </div>
              ) : (
                <p className="text-muted-foreground">No user is currently authenticated</p>
              )}
            </div>
            
            {/* Cookie Debug Info */}
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-4">Cookie Information</h3>
              
              <div className="bg-slate-50 p-4 rounded-md text-sm font-mono overflow-x-auto">
                <pre>{document.cookie || "No cookies found"}</pre>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Note: HttpOnly cookies are not visible here, but they may still be present
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}