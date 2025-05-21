import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import Header from "@/components/header";
import AirGourmetLogo from "@/components/AirGourmetLogo";
import LogoWithWhiteBg from "@/components/logo-with-white-bg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Redirect } from "wouter";
import { forceAuthRedirect, getHomePathForRole } from "@/lib/auth-helpers";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  // Login state is managed by the React Query mutations

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      phone: "",
      role: "client",
    },
  });

  function onLoginSubmit(data: LoginFormValues) {
    console.log("Login form submitted:", data.username);
    loginMutation.mutate(data, {
      onSuccess: (userData) => {
        console.log("Login successful in form handler:", userData);
        
        // Force a hard redirect after login (better for cookie handling)
        // Small delay to allow toast to display
        setTimeout(() => {
          console.log("Redirecting after successful login...");
          window.location.href = userData.role === 'admin' ? '/admin' : '/';
        }, 1000);
      },
      onError: (error) => {
        console.error("Login error in form handler:", error);
      }
    });
  }

  function onRegisterSubmit(data: RegisterFormValues) {
    registerMutation.mutate(data);
  }

  // Removed direct window.location.href usage in favor of Redirect component below

  // Add loading state to prevent page flicker during authentication
  const [pageLoading, setPageLoading] = useState(true);
  
  useEffect(() => {
    // Short timeout to prevent UI flicker during authentication check
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Redirect if already logged in
  if (user) {
    return <Redirect to={user.role === "admin" ? "/admin" : "/"} />;
  }
  
  // Show loading spinner while authentication check is in progress
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Logo removed as requested */}
      
      {/* Left side: Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            {/* Secure Login Instructions */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded relative mb-4" role="alert">
              <div className="font-medium">Air Gourmet Hellas Portal</div>
              <p className="text-sm mt-1">
                Welcome to the secure login portal. Please enter your credentials to access the system.
              </p>
            </div>
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-2">
                  <LogoWithWhiteBg width={280} />
                </div>
                <CardTitle className="text-center">{t('auth.loginTitle')}</CardTitle>
                <CardDescription className="text-center">
                  {t('auth.loginDescription')}
                </CardDescription>
                <div className="mt-4 flex justify-center">
                  <Button variant="secondary" onClick={() => {
                    window.location.href = "/simple-login";
                  }}>
                    Quick Login (Test User)
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.username')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('auth.usernamePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.password')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder={t('auth.passwordPlaceholder')} 
                                {...field} 
                              />
                              <button 
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                  <Eye className="h-5 w-5" aria-hidden="true" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('auth.loggingIn')}
                        </>
                      ) : t('auth.login')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col items-center space-y-2">
                <div className="flex justify-center text-sm text-muted-foreground">
                  {t('auth.noAccount')}
                  <Button variant="link" onClick={() => setActiveTab("register")}>
                    {t('auth.register')}
                  </Button>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Button variant="outline" asChild className="w-full">
                    <a href="/menu">{t('auth.browseMenu')}</a>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <a 
                      href="https://www.airgourmet.gr" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      Visit Our Website
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-2">
                  <LogoWithWhiteBg width={280} />
                </div>
                <CardTitle className="text-center">{t('auth.registerTitle')}</CardTitle>
                <CardDescription className="text-center">
                  {t('auth.registerDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.firstName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('auth.firstNamePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.lastName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('auth.lastNamePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t('auth.emailPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.company')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('auth.companyPlaceholder')} {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.phone')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('auth.phonePlaceholder')} {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.username')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('auth.chooseUsername')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.password')}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showRegisterPassword ? "text" : "password"} 
                                  placeholder={t('auth.createPassword')} 
                                  {...field} 
                                />
                                <button 
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                >
                                  {showRegisterPassword ? (
                                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                                  ) : (
                                    <Eye className="h-5 w-5" aria-hidden="true" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"} 
                                  placeholder={t('auth.confirmPasswordPlaceholder')} 
                                  {...field} 
                                />
                                <button 
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                                  ) : (
                                    <Eye className="h-5 w-5" aria-hidden="true" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('auth.creatingAccount')}
                        </>
                      ) : t('auth.createAccount')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col items-center space-y-2">
                <div className="flex justify-center text-sm text-muted-foreground">
                  {t('auth.haveAccount')}
                  <Button variant="link" onClick={() => setActiveTab("login")}>
                    {t('auth.login')}
                  </Button>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Button variant="outline" asChild className="w-full">
                    <a href="/menu">{t('auth.browseMenu')}</a>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <a 
                      href="https://www.airgourmet.gr" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      Visit Our Website
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Right side: Hero */}
      <div className="flex-1 bg-primary-600 p-12 flex flex-col justify-center relative overflow-hidden hidden md:flex mt-20">
        <div className="relative z-10 text-white space-y-6 max-w-lg mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-white/90 p-1 rounded">
              <Header showWelcome={false} />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold">Premium Catering for Private Aviation</h2>
          
          <p className="text-lg opacity-90">
            Air Gourmet Hellas provides world-class catering services for private jets,
            with customized menus, dietary options, and seamless delivery.
          </p>
          
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-3">Streamlined Ordering Platform</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 flex-shrink-0 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Easy flight-specific ordering</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 flex-shrink-0 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Specialized menus with dietary options</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 flex-shrink-0 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Order templates for frequent flights</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 flex-shrink-0 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Real-time order tracking and updates</span>
              </li>
            </ul>
            <div className="mt-4">
              <Button asChild variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/40">
                <a href="/menu">Explore Our Full Menu</a>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-700 to-primary-500 opacity-50"></div>
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary-400 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300 rounded-full filter blur-3xl opacity-20 transform translate-y-1/2 -translate-x-1/3"></div>
      </div>
    </div>
  );
}