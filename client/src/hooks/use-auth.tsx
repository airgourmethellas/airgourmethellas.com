import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// User type without password for client-side usage
// Modifying created field to accept string for API responses
type UserWithoutPassword = Omit<SelectUser, 'password'> & {
  created: Date | string;
};

type AuthContextType = {
  user: UserWithoutPassword | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<UserWithoutPassword, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<UserWithoutPassword, Error, RegisterData>;
};

type LoginData = Pick<InsertUser, "username" | "password">;
type RegisterData = InsertUser & { confirmPassword: string };

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<Omit<SelectUser, 'password'> | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log("Attempting login with:", credentials.username);
        
        const res = await apiRequest("POST", "/api/login", credentials);
        
        if (!res.ok) {
          console.error(`Login failed with status ${res.status}`);
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Authentication failed with status ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Login response data:", data);
        
        // Verify we got user data back
        if (!data.id || !data.username) {
          console.error("Login response missing user data:", data);
          throw new Error("Invalid response from server. Please try again.");
        }
        
        // Immediately verify authentication worked by fetching user data
        try {
          console.log("Verifying authentication with /api/auth-check");
          const authCheckRes = await apiRequest("GET", "/api/auth-check");
          const authCheckData = await authCheckRes.json();
          console.log("Auth check result:", authCheckData);
          
          if (!authCheckData.authenticated) {
            console.error("Authentication failed verification:", authCheckData);
            throw new Error("Authentication session not established. Please try again.");
          }
        } catch (verifyError) {
          console.error("Auth verification error:", verifyError);
          // Allow login to proceed anyway - this is just diagnostic
        }
        
        return data as UserWithoutPassword;
      } catch (error: any) {
        console.error("Login error:", error);
        // Provide more helpful error message
        const errorMessage = error?.message || "Unable to connect to authentication service. Please try again.";
        throw new Error(errorMessage);
      }
    },
    onSuccess: (user: UserWithoutPassword) => {
      console.log("Setting user data in query cache");
      queryClient.setQueryData(["/api/user"], user);
      
      // Invalidate the user query to force a fresh fetch from server
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Force a full page reload to ensure cookies are properly applied
      // This is a more reliable approach than trying to handle cookie state in SPA
      console.log("Forcing page reload to apply authentication cookies");
      setTimeout(() => {
        window.location.href = user.role === 'admin' ? '/admin' : '/';
      }, 500);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login mutation error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      try {
        console.log("Attempting registration for:", credentials.username);
        
        const res = await apiRequest("POST", "/api/register", credentials);
        const data = await res.json();
        console.log("Registration successful:", data);
        // Server removes password before sending
        return data as UserWithoutPassword;
      } catch (error: any) {
        console.error("Registration error:", error);
        // Provide more helpful error message
        let errorMessage = error?.message || "Unable to create account. Please try again.";
        if (errorMessage.includes("already exists")) {
          errorMessage = "This username is already taken. Please choose another one.";
        }
        throw new Error(errorMessage);
      }
    },
    onSuccess: (user: UserWithoutPassword) => {
      console.log("Registration successful, setting user data");
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to Air Gourmet Hellas, ${user.firstName}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration mutation error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log("Attempting logout");
        await apiRequest("POST", "/api/logout");
        console.log("Logout successful");
      } catch (error) {
        console.error("Logout error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Clearing user data from query cache");
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      console.error("Logout mutation error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create the context value with properly typed user
  const contextValue: AuthContextType = {
    user: user ?? null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
