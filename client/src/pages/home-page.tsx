import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Menu, Plane, Eye, EyeOff, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function HomePage() {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginData)
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        alert('Login failed');
      }
    } catch (error) {
      alert('Login error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Large Prominent Logo */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div style={{
                backgroundColor: '#ffffff',
                display: 'inline-block',
                boxShadow: 'none',
                border: 'none',
                outline: 'none',
                padding: '20px',
                borderRadius: '16px',
                overflow: 'hidden'
              }}>
                <img 
                  src="/logo.png" 
                  alt="Air Gourmet Hellas Logo" 
                  style={{
                    width: '350px',
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    border: '0',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
              </div>
            </div>
            <p className="text-gray-600 text-lg">Premium Flight Catering Services</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-4 mb-8">
            <Link href="/menu">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                <Menu className="mr-2 h-5 w-5" />
                View Our Menu
              </Button>
            </Link>
            
            <a 
              href="https://www.airgourmet.gr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button size="lg" variant="outline" className="w-full text-lg py-3">
                <ExternalLink className="mr-2 h-5 w-5" />
                Visit airgourmet.gr
              </Button>
            </a>
          </div>

          {/* Login Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-xl">Staff Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData(prev => ({...prev, username: e.target.value}))}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Right Side - Blue Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 items-center justify-center">
        <div className="max-w-lg text-center">
          <Plane className="h-20 w-20 mx-auto mb-8 text-blue-200" />
          <h2 className="text-4xl font-bold mb-6">Excellence in Flight Catering</h2>
          <p className="text-lg mb-8 text-blue-100">
            Serving premium aviation catering services across Thessaloniki (SKG) and Mykonos (JMK). 
            Experience unparalleled quality and service for your flight operations.
          </p>
          <div className="space-y-4 text-blue-100">
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
              <span className="text-lg">Premium Quality Ingredients</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
              <span className="text-lg">24/7 Service Availability</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
              <span className="text-lg">Certified Aviation Standards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}