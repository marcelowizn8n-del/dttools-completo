// Use SQLite for database (PostgreSQL support can be added later if needed)
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from "@shared/schema-sqlite";

// Initialize SQLite database
const sqlite = new Database('dev.db');
const db = drizzle(sqlite, { schema });

// Create tables from schema if they don't exist
try {
  // Check if tables exist
  const tables = sqlite.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all() as Array<{ name: string }>;
  
  const tableNames = tables.map(t => t.name);
  
  if (tableNames.length === 0 || !tableNames.includes('users')) {
    console.log('📦 Creating database tables...');
    // Try to run migrations first
    try {
      migrate(db, { migrationsFolder: './migrations' });
      console.log('✅ Database migrations completed');
    } catch (migrationError) {
      // If migrations fail, create tables manually using SQL from migrations
      console.log('⚠️  Creating tables manually...');
      const migrationSQL = sqlite.prepare(`
        SELECT sql FROM sqlite_master 
        WHERE type='table' AND name='users'
      `).get();
      
      if (!migrationSQL) {
        // Read migration file and execute
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const migrationFile = path.join(process.cwd(), 'migrations', '0000_add_canvas_drawing_support.sql');
          const migrationContent = await fs.readFile(migrationFile, 'utf-8');
          // Execute each CREATE TABLE statement
          const statements = migrationContent.split('--> statement-breakpoint').filter(s => s.trim().startsWith('CREATE TABLE'));
          for (const stmt of statements) {
            const cleanStmt = stmt.replace(/CREATE TABLE\s+"?(\w+)"?/gi, 'CREATE TABLE IF NOT EXISTS $1');
            sqlite.exec(cleanStmt);
          }
          console.log('✅ Tables created from migration file');
        } catch (err) {
          console.warn('⚠️  Could not read migration file, tables will be created on first use');
        }
      }
    }
  } else {
    console.log('✅ Database tables already exist');
  }
} catch (error) {
  console.warn('⚠️  Could not check/create tables:', error);
}

export { db };
