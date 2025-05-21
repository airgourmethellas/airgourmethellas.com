import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient"; 

export default function EmergencyLogin() {
  const [username, setUsername] = useState("test");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First, try the test login endpoint
      try {
        console.log("Attempting emergency login with:", username);
        
        // Call our new emergency test login endpoint
        const response = await fetch('/api/login-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("Login successful:", userData);
          
          // Update the cached user data
          queryClient.setQueryData(["/api/user"], userData);
          
          toast({
            title: "Login Successful",
            description: "You are now logged in.",
          });
          
          // Redirect to home
          window.location.href = "/";
          return;
        }
        
        console.log("Test login failed, trying standard login...");
      } catch (error) {
        console.error("Error with test login:", error);
      }
      
      // If test login fails, try regular login
      const res = await apiRequest("POST", "/api/login", { username, password });
      
      if (!res.ok) {
        throw new Error(await res.text() || "Invalid username or password");
      }
      
      const userData = await res.json();
      
      // Update auth state
      queryClient.setQueryData(["/api/user"], userData);
      
      toast({
        title: "Login Successful",
        description: "You are now logged in.",
      });
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">Emergency Login</CardTitle>
          <CardDescription className="text-center">
            Use the pre-filled test credentials to login
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging In...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}