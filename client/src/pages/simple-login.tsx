import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LogoWithWhiteBg from "@/components/logo-with-white-bg";
import { queryClient } from "@/lib/queryClient";

export default function SimpleLogin() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      // Use a direct fetch to our emergency login endpoint
      const response = await fetch('/api/login-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'test', 
          password: 'password' 
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      console.log("Login successful:", userData);
      
      // Update cached user data
      queryClient.setQueryData(['/api/user'], userData);
      
      toast({
        title: "Login Successful",
        description: "Redirecting to home page..."
      });
      
      // Redirect using a hard navigation for better cookie handling
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <LogoWithWhiteBg width={200} />
          </div>
          <CardTitle className="text-2xl">Quick Login</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-gray-600">
            Click the button below to instantly sign in as the test user
          </p>
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
            <p className="font-medium">Test Account Information</p>
            <p className="text-sm mt-1">Username: test</p>
            <p className="text-sm">Password: password</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging In...
              </>
            ) : (
              <>
                Login Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      <div className="mt-4">
        <Button variant="link" onClick={() => window.location.href = '/auth'}>
          Return to regular login
        </Button>
      </div>
    </div>
  );
}