import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// For simplicity in this testing phase, we'll use a very basic password comparison
// This is NOT secure for production but will help us debug authentication issues

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Password handling with scrypt
// This is proper hashing for production use
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Advanced password comparison that supports both hashed and plaintext passwords
async function comparePasswords(supplied: string, stored: string) {
  console.log("Comparing passwords for:", { 
    suppliedLength: supplied.length,
    storedLength: stored.length,
    storedStartsWith: stored.substring(0, 10),
    isHashed: stored.includes('.')
  });
  
  // If the stored password contains a dot, it's likely a hash.salt format
  if (stored.includes('.')) {
    try {
      const [hashed, salt] = stored.split(".");
      const hashedBuf = Buffer.from(hashed, "hex");
      const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
      
      const result = timingSafeEqual(hashedBuf, suppliedBuf);
      console.log("Secure password comparison result:", result);
      return result;
    } catch (err) {
      console.error("Error in secure password comparison:", err);
      // Fall back to exact comparison if hash comparison fails
      return false;
    }
  } else {
    // For plaintext passwords (DEVELOPMENT ONLY)
    console.log("Plaintext password comparison");
    return supplied === stored;
  }
}

export function setupAuth(app: Express) {
  const isProduction = process.env.NODE_ENV === 'production';
  const useCustomDomain = isProduction && 
    (process.env.CUSTOM_DOMAIN === 'true' || process.env.CUSTOM_DOMAIN === '1');
  console.log(`Setting up auth in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode with custom domain: ${useCustomDomain}`);
  
  // Configure cookie settings based on environment
  const cookieSettings: session.CookieOptions = {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: false, // Set to false even in production for troubleshooting
    sameSite: 'lax' // Changed from 'none' to 'lax' for better compatibility
  };
  
  // If in Replit preview environment
  if (process.env.REPLIT_URL) {
    console.log(`Running in Replit preview: ${process.env.REPLIT_URL}`);
  }
  
  // If using a custom domain in production, set the domain for cookies
  if (isProduction && useCustomDomain) {
    // Target both www and non-www versions
    Object.assign(cookieSettings, {
      secure: true,
      sameSite: 'strict',
      domain: '.airgourmethellas.com' // Note the leading dot for subdomain coverage
    });
  }
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "sky-kitchen-secret-key",
    resave: false,
    saveUninitialized: true, // Changed to true to ensure session cookie is always sent
    store: storage.sessionStore,
    name: 'connect.sid', // Use default cookie name for consistency
    cookie: cookieSettings
  };
  
  console.log("Session settings:", {
    resave: sessionSettings.resave,
    saveUninitialized: sessionSettings.saveUninitialized,
    cookie: sessionSettings.cookie
  });

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Middleware to prevent caching for all auth-related endpoints
  const preventCache = (req: Request, res: Response, next: NextFunction) => {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    next();
  };
  
  // Apply the no-cache middleware to all auth routes
  app.use(['/api/login', '/api/logout', '/api/user', '/api/register', '/api/auth-check'], preventCache);

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register validation schema with additional constraints
  const registerSchema = insertUserSchema.extend({
    password: z.string().min(8, "Password must be at least 8 characters"),
    email: z.string().email("Invalid email format"),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("Registration attempt with data:", req.body);
      
      // Validate request data
      const { confirmPassword, ...userData } = registerSchema.parse(req.body);
      console.log("Validated registration data:", userData);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        console.log("Registration failed: Username already exists", userData.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      console.log("Creating new user:", userData.username);
      // Create new user with proper password hashing
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password), // Properly hash the password
      });
      console.log("User created successfully:", user);

      // Log the user in immediately
      req.login(user, (err) => {
        if (err) {
          console.error("Login after registration failed:", err);
          return next(err);
        }
        
        console.log("User logged in after registration");
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid registration data", errors: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/login", (req: Request, res: Response, next: NextFunction) => {
    console.log("Login attempt with:", req.body.username);
    console.log("Session before auth:", {
      id: req.sessionID,
      cookie: req.session?.cookie
    });
    
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        console.error("Login authentication error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Login failed - Invalid credentials for:", req.body.username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      console.log("Authentication successful for:", user.username);
      
      // Check if the user exists in database before login
      try {
        const dbUser = await storage.getUserByUsername(user.username);
        if (!dbUser) {
          console.error("User authenticated but not found in database:", user.username);
          return res.status(500).json({ message: "User record not found" });
        }
        
        console.log("User found in database:", dbUser.username);
      } catch (error) {
        console.error("Error retrieving user from database:", error);
      }
      
      req.login(user, async (err: any) => {
        if (err) {
          console.error("Session login error:", err);
          return next(err);
        }
        
        console.log("Login session established for:", user.username);
        console.log("Session after login:", {
          id: req.sessionID,
          user: req.user?.username,
          isAuthenticated: req.isAuthenticated()
        });
        
        try {
          console.log("Creating activity log for login");
          // Create activity log
          await storage.createActivityLog({
            userId: user.id,
            action: "user_login",
            details: `User ${user.username} logged in`
          });
          
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          
          // Send response with status and verbose success message
          res.status(200).json({
            ...userWithoutPassword,
            auth: {
              success: true,
              sessionId: req.sessionID
            }
          });
        } catch (error) {
          console.error("Error after successful login:", error);
          // Still return success even if activity log fails
          const { password, ...userWithoutPassword } = user;
          res.status(200).json({
            ...userWithoutPassword,
            auth: {
              success: true,
              sessionId: req.sessionID
            }
          });
        }
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      // Create activity log before logging out
      const userId = req.user.id;
      const username = req.user.username;
      
      storage.createActivityLog({
        userId,
        action: "user_logout",
        details: `User ${username} logged out`
      }).then(() => {
        req.logout((err: any) => {
          if (err) return next(err);
          res.status(200).json({ message: "Logged out successfully" });
        });
      }).catch(next);
    } else {
      res.status(200).json({ message: "No active session" });
    }
  });

  app.get("/api/user", (req: Request, res: Response) => {
    console.log("GET /api/user - isAuthenticated:", req.isAuthenticated());
    console.log("Session ID:", req.sessionID);
    console.log("Session:", req.session);
    console.log("Cookies:", req.headers.cookie);
    console.log("Cookie header information:", {
      cookieHeader: req.headers.cookie,
      cookieCount: req.headers.cookie ? req.headers.cookie.split(';').length : 0
    });
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        message: "Not authenticated",
        debug: {
          sessionId: req.sessionID,
          hasSession: !!req.session,
          cookies: req.headers.cookie || "none"
        }
      });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as Express.User;
    console.log("Returning authenticated user:", userWithoutPassword);
    res.json(userWithoutPassword);
  });
  
  // Auth check endpoint for debugging
  app.get("/api/auth-check", (req: Request, res: Response) => {
    console.log("Auth check:");
    console.log("- Session ID:", req.sessionID);
    console.log("- Is authenticated:", req.isAuthenticated());
    console.log("- Session:", req.session);
    console.log("- Cookies:", req.headers.cookie);
    
    res.json({
      authenticated: req.isAuthenticated(),
      sessionId: req.sessionID,
      hasSession: !!req.session,
      user: req.isAuthenticated() ? { 
        id: req.user?.id,
        username: req.user?.username,
        role: req.user?.role
      } : null
    });
  });
}
