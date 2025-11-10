import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import ConnectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDefaultData } from "./storage";
import { execSync } from "child_process";
import fs from "fs/promises";
import path from "path";

// Build version v8.0.0-AUTO-SYNC - Production asset sync implemented
const BUILD_VERSION = "v8.0.0-AUTO-SYNC";

// Extend session data type
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      username: string;
      role: string;
      createdAt: Date;
    };
  }
}

// Create session store - use PostgreSQL in production, memory in development
const MemStore = MemoryStore(session);
const PgStore = ConnectPgSimple(session);

const app = express();

// Trust proxy for secure cookies behind load balancer
app.set('trust proxy', 1);

// Add CORS headers for external browser access
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow specific origins when using credentials
  const allowedOrigins = [
    'https://dttools.app',
    'https://66duqmzd.up.railway.app',
    'http://localhost:5000',
    'http://localhost:5173'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Increase limits for image uploads (base64 encoded images can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Validate required environment variables
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}

// Session configuration
const isProduction = process.env.NODE_ENV === 'production';
const sessionStore = isProduction && process.env.DATABASE_URL ? 
  new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: 'user_sessions'
  }) : 
  new MemStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });

app.use(session({
  name: 'dttools.session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: 'auto', // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isProduction ? 'lax' : 'none' // Lax for production, none for development
  }
}));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static('public/uploads'));

// Servir arquivos estáticos da pasta public (downloads, etc.)
app.use(express.static('server/public'));

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
  // Run database migration in production
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    try {
      log('Running database migration...');
      execSync('npm run db:push', { stdio: 'inherit' });
      log('✅ Database migration completed');
    } catch (error) {
      log('❌ Database migration failed:', String(error));
      // Continue anyway - tables might already exist
    }
  }

  const server = await registerRoutes(app);

  // Initialize default data (admin user, subscription plans, etc.)
  await initializeDefaultData();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const isDevelopment = process.env.NODE_ENV !== 'production';
  log(`Environment check: NODE_ENV=${process.env.NODE_ENV}, isDevelopment=${isDevelopment}`);
  
  if (isDevelopment) {
    log('Setting up Vite development server');
    await setupVite(app, server);
  } else {
    // Sync build assets from dist/public to server/public before serving
    log('Syncing build assets to server/public...');
    const distPath = path.resolve(import.meta.dirname, '..', 'dist', 'public');
    const serverPublicPath = path.resolve(import.meta.dirname, 'public');
    
    try {
      // Check if dist/public exists
      await fs.access(distPath);
      
      // Ensure server/public directory exists
      await fs.mkdir(serverPublicPath, { recursive: true });
      
      // Copy all files from dist/public to server/public
      const files = await fs.readdir(distPath, { withFileTypes: true });
      for (const file of files) {
        const srcPath = path.join(distPath, file.name);
        const destPath = path.join(serverPublicPath, file.name);
        
        if (file.isDirectory()) {
          // Recursively copy directories
          await fs.cp(srcPath, destPath, { recursive: true, force: true });
        } else {
          // Copy individual files
          await fs.copyFile(srcPath, destPath);
        }
      }
      
      log('✅ Build assets synced successfully');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        log('⚠️  dist/public not found - run npm run build first');
      } else {
        log('❌ Failed to sync build assets:', String(error));
      }
    }
    
    log('Setting up static file serving for production');
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
