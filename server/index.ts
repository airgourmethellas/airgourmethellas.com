import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import { fileURLToPath } from "url";
import cors from 'cors';
import { config as buildConfig } from './build-config';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// CORS middleware - setup before other middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.airgourmethellas.com', 'https://airgourmethellas.com']
    : [/localhost:\d+$/, /\.replit\.app$/, process.env.REPLIT_URL || '', 'https://airgourmethellas.com', 'https://www.airgourmethellas.com'],
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"], // Add Stripe
      connectSrc: ["'self'", "https://www.airgourmethellas.com", "https://api.stripe.com"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "data:", "https:"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"], // For Stripe iframe
    }
  },
  crossOriginEmbedderPolicy: false, // Allow embedding from other domains
}));

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from client/public directory with build-safe path resolution
if (fs.existsSync(buildConfig.paths.public)) {
  app.use(express.static(buildConfig.paths.public));
} else {
  console.warn(`Public directory not found: ${buildConfig.paths.public}`);
}

// Log static file requests for debugging
app.use((req, res, next) => {
  if (req.path.includes('/logo.png')) {
    console.log(`Static file request for ${req.path}`);
  }
  next();
});

// Simple CORS configuration for development in Replit
app.use(cors({
  origin: true, // Allow requests from any origin
  credentials: true, // Allow credentials (cookies, authorization headers, etc)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['X-Requested-With', 'Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const isProduction = app.get("env") === "production";
  let server;
  
  // Check if we're using a custom domain
  const useCustomDomain = isProduction && 
    (process.env.CUSTOM_DOMAIN === 'true' || process.env.CUSTOM_DOMAIN === '1');
  
  // Configure redirects for the www.airgourmethellas.com domain if enabled
  if (useCustomDomain) {
    // Redirect non-www to www in production 
    app.use((req, res, next) => {
      const host = req.headers.host;
      if (host === 'airgourmethellas.com') {
        return res.redirect(301, `https://www.airgourmethellas.com${req.url}`);
      }
      next();
    });
    
    // Redirect HTTP to HTTPS in production
    app.use((req, res, next) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }
  
  // Register routes
  server = await registerRoutes(app);

  // Enhanced error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    
    // Create user-friendly error messages based on status code
    let userFriendlyMessage = "Something went wrong. Please try again later.";
    
    if (status === 400) {
      userFriendlyMessage = "The request couldn't be processed. Please check your information and try again.";
    } else if (status === 401) {
      userFriendlyMessage = "Please log in to continue.";
    } else if (status === 403) {
      userFriendlyMessage = "You don't have permission to access this resource.";
    } else if (status === 404) {
      userFriendlyMessage = "The requested resource was not found.";
    } else if (status === 409) {
      userFriendlyMessage = "There was a conflict with your request. The resource might already exist.";
    } else if (status === 422) {
      userFriendlyMessage = "The provided information is incomplete or invalid.";
    } else if (status === 429) {
      userFriendlyMessage = "Too many requests. Please try again later.";
    } else if (status >= 500) {
      userFriendlyMessage = "We're experiencing technical difficulties. Please try again later.";
    }
    
    // Add request info for better debugging
    const errorDetails = {
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      status,
      originalMessage: message
    };
    
    console.error("Error occurred:", errorDetails, err);
    
    // Only include technical details in development
    const responseBody = {
      message: userFriendlyMessage,
      ...(process.env.NODE_ENV === 'development' ? { 
        originalError: message,
        stack: err.stack,
        details: errorDetails
      } : {})
    };
    
    res.status(status).json(responseBody);
  });

  // Setup Vite for development or serve static files for production
  if (!isProduction) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // HTTPS configuration in production with custom domain
  let httpsServer;
  // ALWAYS serve the app on port 5000 (HTTP)
  const port = 5000;
  
  if (useCustomDomain && isProduction) {
    try {
      // Look for SSL certificates in expected locations
      const sslOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH || '/etc/ssl/private/airgourmethellas.key'),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH || '/etc/ssl/certs/airgourmethellas.crt'),
      };
      
      // Create HTTPS server on port 443 if SSL certs exist
      httpsServer = createHttpsServer(sslOptions, app);
      httpsServer.listen(443, () => {
        log('HTTPS server running on port 443');
      });
      
      // Also keep HTTP server for redirects
      server.listen({
        port,
        host: "0.0.0.0",
      }, () => {
        log(`HTTP server for redirects running on port ${port}`);
      });
    } catch (error) {
      console.error('Failed to start HTTPS server, falling back to HTTP:', error);
      // Fall back to HTTP if certificates aren't available
      server.listen({
        port,
        host: "0.0.0.0",
      }, () => {
        log(`HTTP server running on port ${port}`);
      });
    }
  } else {
    // Development mode or no custom domain: just use HTTP
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`HTTP server running on port ${port}`);
    });
  }
})();
