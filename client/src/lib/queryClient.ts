import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Custom API error class that includes HTTP status code
export class ApiError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    console.log(`API Error: ${res.status} ${res.statusText} for ${res.url}`);
    
    let errorText = res.statusText;
    try {
      // Try to parse as JSON first for structured error messages
      const contentType = res.headers.get('content-type');
      console.log("Response content type:", contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const errorJson = await res.json();
        console.log("Error response JSON:", errorJson);
        errorText = errorJson.message || JSON.stringify(errorJson);
      } else {
        const textResponse = await res.text();
        console.log("Error response text:", textResponse);
        errorText = textResponse || res.statusText;
      }
    } catch (e) {
      console.error("Error parsing error response:", e);
      // If JSON parse fails, try to get text
      try {
        errorText = await res.text() || res.statusText;
      } catch (textError) {
        console.error("Error getting text from response:", textError);
        // If all fails, use status text
        errorText = res.statusText;
      }
    }
    
    console.error(`Throwing error with message: ${errorText}`);
    
    // Create a user-friendly error message
    let userFriendlyMessage = "Something went wrong. Please try again.";
    
    if (res.status === 401) {
      userFriendlyMessage = "You need to be logged in to access this resource.";
    } else if (res.status === 403) {
      userFriendlyMessage = "You don't have permission to access this resource.";
    } else if (res.status === 404) {
      userFriendlyMessage = "The requested resource was not found.";
    } else if (res.status === 500) {
      userFriendlyMessage = "Sorry, we're experiencing technical difficulties. Please try again later.";
    } else if (res.status === 503) {
      userFriendlyMessage = "Service temporarily unavailable. Please try again later.";
    }
    
    // Throw custom API error with status code
    throw new ApiError(userFriendlyMessage, res.status);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { responseType?: string }
): Promise<Response> {
  console.log(`Making ${method} request to ${url}`, data ? { dataPreview: data } : '(no data)');
  
  // Determine if we're in production for cross-origin cookie handling
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`Running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
  
  try {
    // Log all cookies before making the request
    console.log('Current cookies:', document.cookie);
    
    // Create headers object without using Headers constructor to avoid TypeScript issues
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      // Add cache control to prevent caching of authenticated requests
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache"
    };
    
    // Set fetch options with proper credentials
    const fetchOptions: RequestInit = {
      method,
      headers: headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Always include credentials for cookie auth
      mode: "cors", // Enable CORS for cross-origin requests
    };
    
    console.log('Fetch options:', fetchOptions);
    
    const res = await fetch(url, fetchOptions);
    
    // Log response details without accessing headers iterator
    console.log(`Received response:`, { 
      status: res.status, 
      statusText: res.statusText,
      // Only log specific important headers we care about
      headers: {
        'content-type': res.headers.get('content-type'),
        'set-cookie': res.headers.get('set-cookie'),
        'cache-control': res.headers.get('cache-control')
      }
    });
    
    // Check for Set-Cookie headers
    const cookies = res.headers.get('set-cookie');
    if (cookies) {
      console.log('Set-Cookie headers received:', cookies);
    }
    
    // Log all cookies after the response
    console.log('Cookies after response:', document.cookie);
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`Error in apiRequest to ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      console.log(`Fetching data from ${queryKey[0]}`);
      
      // Log all cookies before making the request
      console.log('Current cookies for query:', document.cookie);
      
      // Create headers object without using Headers constructor to avoid TypeScript issues
      const headers = {
        "Accept": "application/json",
        // Add cache control to prevent caching of authenticated requests
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      };

      const fetchOptions: RequestInit = {
        headers: headers,
        credentials: "include", // Always include credentials for cookie auth
        mode: "cors", // Enable CORS for cross-origin requests
      };
      
      console.log('Query fetch options:', fetchOptions);
      
      const res = await fetch(queryKey[0] as string, fetchOptions);
      
      console.log(`Response status for ${queryKey[0]}: ${res.status}`);
      // Log only specific response headers we're interested in
      console.log(`Response headers for ${queryKey[0]}:`, {
        'content-type': res.headers.get('content-type'),
        'set-cookie': res.headers.get('set-cookie'),
        'cache-control': res.headers.get('cache-control'),
        'etag': res.headers.get('etag'),
        'date': res.headers.get('date')
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Auth endpoint ${queryKey[0]} returned 401 - handling as null per config`);
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      console.log(`Successfully fetched data from ${queryKey[0]}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching from ${queryKey[0]}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
