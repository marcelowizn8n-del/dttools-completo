// Script to create SQLite tables from schema
import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';

const db = new Database('dev.db');

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS "projects" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "current_phase" INTEGER DEFAULT 1,
    "completion_rate" REAL DEFAULT 0,
    "created_at" INTEGER,
    "updated_at" INTEGER
  );

  CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "company" TEXT,
    "job_role" TEXT,
    "industry" TEXT,
    "experience" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "zip_code" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "profile_picture" TEXT,
    "interests" TEXT DEFAULT '[]',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "subscription_plan_id" TEXT,
    "subscription_status" TEXT DEFAULT 'active',
    "subscription_end_date" INTEGER,
    "created_at" INTEGER
  );

  CREATE TABLE IF NOT EXISTS "empathy_maps" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "says" TEXT DEFAULT '[]',
    "thinks" TEXT DEFAULT '[]',
    "does" TEXT DEFAULT '[]',
    "feels" TEXT DEFAULT '[]',
    "created_at" INTEGER,
    "updated_at" INTEGER,
    FOREIGN KEY("project_id") REFERENCES "projects"("id")
  );

  CREATE TABLE IF NOT EXISTS "personas" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "occupation" TEXT,
    "bio" TEXT,
    "goals" TEXT DEFAULT '[]',
    "frustrations" TEXT DEFAULT '[]',
    "motivations" TEXT DEFAULT '[]',
    "tech_savviness" TEXT,
    "avatar" TEXT,
    "created_at" INTEGER,
    "updated_at" INTEGER,
    FOREIGN KEY("project_id") REFERENCES "projects"("id")
  );

  CREATE TABLE IF NOT EXISTS "interviews" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "participant_name" TEXT NOT NULL,
    "date" INTEGER NOT NULL,
    "duration" INTEGER,
    "questions" TEXT DEFAULT '[]',
    "responses" TEXT DEFAULT '[]',
    "insights" TEXT,
    "created_at" INTEGER,
    FOREIGN KEY("project_id") REFERENCES "projects"("id")
  );

  CREATE TABLE IF NOT EXISTS "observations" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "behavior" TEXT NOT NULL,
    "insights" TEXT,
    "date" INTEGER NOT NULL,
    "created_at" INTEGER,
    FOREIGN KEY("project_id") REFERENCES "projects"("id")
  );

  CREATE TABLE IF NOT EXISTS "pov_statements" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "need" TEXT NOT NULL,
    "insight" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "priority" TEXT DEFAULT 'medium',
    "created_at" INTEGER,
    FOREIGN KEY("project_id") REFERENCES "projects"("id")
  );

  CREATE TABLE IF NOT EXISTS "hmw_questions" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "context" TEXT,
    "challenge" TEXT,
    "scope" TEXT DEFAULT 'product',
    "priority" TEXT DEFAULT 'medium',
    "category" TEXT,
    "votes" INTEGER DEFAULT 0,
    "created_at" INTEGER,
    FOREIGN KEY("project_id") REFERENCES "projects"("id")
  );

  CREATE TABLE IF NOT EXISTS "ideas" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "feasibility" INTEGER,
    "impact" INTEGER,
    "votes" INTEGER DEFAULT 0,
    "status" TEXT DEFAULT 'idea',
    "canvas_data" TEXT,
    "created_at" INTEGER,
    FOREIGN KEY("project_id") REFERENCES "projects"("id")
  );

  CREATE TABLE IF NOT EXISTS "prototypes" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fidelity" TEXT DEFAULT 'low',
    "status" TEXT DEFAULT 'draft',
    "canvas_data" TEXT,
    "created_at" INTEGER,
    "updated_at" INTEGER,
    FOREIGN KEY("project_id") REFERENCES "projects"("id")
  );

  CREATE TABLE IF NOT EXISTS "test_plans" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "prototype_id" TEXT,
    "title" TEXT NOT NULL,
    "objectives" TEXT,
    "tasks" TEXT DEFAULT '[]',
    "participants" TEXT DEFAULT '[]',
    "criteria" TEXT,
    "created_at" INTEGER,
    FOREIGN KEY("project_id") REFERENCES "projects"("id"),
    FOREIGN KEY("prototype_id") REFERENCES "prototypes"("id")
  );

  CREATE TABLE IF NOT EXISTS "test_results" (
    "id" TEXT PRIMARY KEY,
    "test_plan_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "task_results" TEXT DEFAULT '[]',
    "feedback" TEXT,
    "success_rate" REAL,
    "completion_time" INTEGER,
    "insights" TEXT,
    "created_at" INTEGER,
    FOREIGN KEY("test_plan_id") REFERENCES "test_plans"("id")
  );

  CREATE TABLE IF NOT EXISTS "subscription_plans" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "price_monthly" INTEGER DEFAULT 0,
    "price_yearly" INTEGER DEFAULT 0,
    "features" TEXT DEFAULT '[]',
    "max_projects" INTEGER,
    "max_personas_per_project" INTEGER,
    "max_users_per_team" INTEGER,
    "ai_chat_limit" INTEGER,
    "library_articles_count" INTEGER,
    "has_collaboration" INTEGER DEFAULT 0,
    "export_formats" TEXT DEFAULT '[]',
    "has_permission_management" INTEGER DEFAULT 0,
    "has_shared_workspace" INTEGER DEFAULT 0,
    "has_comments_and_feedback" INTEGER DEFAULT 0,
    "is_active" INTEGER DEFAULT 1,
    "created_at" INTEGER,
    "updated_at" INTEGER
  );

  CREATE TABLE IF NOT EXISTS "user_subscriptions" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "stripe_subscription_id" TEXT,
    "status" TEXT NOT NULL,
    "billing_period" TEXT NOT NULL,
    "current_period_start" INTEGER,
    "current_period_end" INTEGER,
    "cancel_at_period_end" INTEGER DEFAULT 0,
    "created_at" INTEGER,
    "updated_at" INTEGER,
    FOREIGN KEY("user_id") REFERENCES "users"("id"),
    FOREIGN KEY("plan_id") REFERENCES "subscription_plans"("id")
  );

  CREATE TABLE IF NOT EXISTS "articles" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT DEFAULT '[]',
    "published" INTEGER DEFAULT 1,
    "created_at" INTEGER,
    "updated_at" INTEGER
  );
`);

console.log('✅ Database tables created successfully!');
db.close();

