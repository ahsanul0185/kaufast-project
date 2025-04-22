import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Hash password with salt
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare provided password with stored hashed password
async function comparePasswords(supplied: string, stored: string) {
  console.log('Comparing passwords (debug only)');
  console.log('Supplied password length:', supplied.length);
  console.log('Stored password format:', stored.includes('.') ? 'Valid (contains salt)' : 'Invalid (no salt)');
  
  try {
    const [hashed, salt] = stored.split(".");
    console.log('Salt extracted:', !!salt);
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    const result = timingSafeEqual(hashedBuf, suppliedBuf);
    console.log('Password comparison result:', result);
    return result;
  } catch (error) {
    console.error('Error in password comparison:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Create session settings
  const sessionSettings: session.SessionOptions = {
    secret: "inmobi-secret-fixed-key-2025", // Using a fixed secret for now instead of env variable
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: false, // Set to false for development (no HTTPS)
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    }
  };
  
  console.log('Session configuration loaded');

  // Trust proxy and set up session middleware
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up passport local strategy
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

  // Serialize and deserialize user for session
  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: any, done) => {
    try {
      // Ensure id is a number
      const userId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      if (isNaN(userId)) {
        return done(new Error('Invalid user ID'), null);
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });

  // API Routes for Authentication
  
  // Register new user
  app.post("/api/register", async (req, res, next) => {
    try {
      console.log('Registration attempt for:', req.body.username);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log('Username already exists:', req.body.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create new user with hashed password
      console.log('Creating new user with data:', { 
        ...req.body, 
        password: '********' // Don't log the password
      });
      
      const hashedPassword = await hashPassword(req.body.password);
      console.log('Password hashed. Creating user...');
      
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });
      
      console.log('User created:', user.id, user.username);

      // Log in the new user automatically
      req.login(user, (err) => {
        if (err) {
          console.error('Auto-login after registration failed:', err);
          return next(err);
        }
        console.log('Auto-login after registration successful');
        res.status(201).json(user);
      });
    } catch (error) {
      console.error('Registration error:', error);
      next(error);
    }
  });

  // Login user
  app.post("/api/login", async (req, res, next) => {
    console.log('Login attempt:', req.body.username);
    
    try {
      // Direct approach - find user and check password manually
      const user = await storage.getUserByUsername(req.body.username);
      
      if (!user) {
        console.log('User not found:', req.body.username);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const passwordMatches = await comparePasswords(req.body.password, user.password);
      console.log('Password match result:', passwordMatches);
      
      if (!passwordMatches) {
        console.log('Password mismatch for:', req.body.username);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Manually log in the user
      req.login(user, (err) => {
        if (err) {
          console.error('Session creation error:', err);
          return next(err);
        }
        
        console.log('Login successful for:', user.username);
        console.log('User data:', { ...user, password: '[REDACTED]' });
        
        // Successfully logged in
        res.status(200).json(user);
      });
    } catch (error) {
      console.error('Login error:', error);
      next(error);
    }
  });

  // Logout user
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}