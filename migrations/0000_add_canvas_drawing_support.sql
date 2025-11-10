CREATE TABLE "articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"author" text NOT NULL,
	"description" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"published" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "canvas_drawings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"phase" integer NOT NULL,
	"canvas_type" text NOT NULL,
	"canvas_data" jsonb NOT NULL,
	"thumbnail_data" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_template" boolean DEFAULT false,
	"parent_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "empathy_maps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"title" text NOT NULL,
	"says" jsonb DEFAULT '[]'::jsonb,
	"thinks" jsonb DEFAULT '[]'::jsonb,
	"does" jsonb DEFAULT '[]'::jsonb,
	"feels" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hmw_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"question" text NOT NULL,
	"context" text,
	"challenge" text,
	"scope" text DEFAULT 'product',
	"priority" text DEFAULT 'medium',
	"category" text,
	"votes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"feasibility" integer,
	"impact" integer,
	"votes" integer DEFAULT 0,
	"status" text DEFAULT 'idea',
	"canvas_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"participant_name" text NOT NULL,
	"date" timestamp NOT NULL,
	"duration" integer,
	"questions" jsonb DEFAULT '[]'::jsonb,
	"responses" jsonb DEFAULT '[]'::jsonb,
	"insights" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "observations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"location" text NOT NULL,
	"context" text NOT NULL,
	"behavior" text NOT NULL,
	"insights" text,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"name" text NOT NULL,
	"age" integer,
	"occupation" text,
	"bio" text,
	"goals" jsonb DEFAULT '[]'::jsonb,
	"frustrations" jsonb DEFAULT '[]'::jsonb,
	"motivations" jsonb DEFAULT '[]'::jsonb,
	"tech_savviness" text,
	"avatar" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pov_statements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"user" text NOT NULL,
	"need" text NOT NULL,
	"insight" text NOT NULL,
	"statement" text NOT NULL,
	"priority" text DEFAULT 'medium',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"current_phase" integer DEFAULT 1,
	"completion_rate" real DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prototypes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"idea_id" varchar,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"materials" jsonb DEFAULT '[]'::jsonb,
	"images" jsonb DEFAULT '[]'::jsonb,
	"canvas_data" jsonb,
	"version" integer DEFAULT 1,
	"feedback" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"price_monthly" integer NOT NULL,
	"price_yearly" integer NOT NULL,
	"stripe_price_id_monthly" text,
	"stripe_price_id_yearly" text,
	"max_projects" integer,
	"max_personas_per_project" integer,
	"max_users_per_team" integer,
	"ai_chat_limit" integer,
	"library_articles_count" integer,
	"features" jsonb DEFAULT '[]'::jsonb,
	"export_formats" jsonb DEFAULT '[]'::jsonb,
	"has_collaboration" boolean DEFAULT false,
	"has_permission_management" boolean DEFAULT false,
	"has_shared_workspace" boolean DEFAULT false,
	"has_comments_and_feedback" boolean DEFAULT false,
	"has_sso" boolean DEFAULT false,
	"has_custom_api" boolean DEFAULT false,
	"has_custom_integrations" boolean DEFAULT false,
	"has_24x7_support" boolean DEFAULT false,
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"prototype_id" varchar,
	"name" text NOT NULL,
	"objective" text NOT NULL,
	"methodology" text NOT NULL,
	"participants" integer NOT NULL,
	"duration" integer,
	"tasks" jsonb DEFAULT '[]'::jsonb,
	"metrics" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'planned',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_results" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_plan_id" varchar NOT NULL,
	"participant_id" text NOT NULL,
	"task_results" jsonb DEFAULT '[]'::jsonb,
	"feedback" text,
	"success_rate" real,
	"completion_time" integer,
	"insights" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"project_id" varchar NOT NULL,
	"phase" integer NOT NULL,
	"completed_tools" jsonb DEFAULT '[]'::jsonb,
	"badges" jsonb DEFAULT '[]'::jsonb,
	"points" integer DEFAULT 0,
	"time_spent" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"stripe_subscription_id" text,
	"status" text NOT NULL,
	"billing_period" text NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"company" text,
	"job_role" text,
	"industry" text,
	"experience" text,
	"country" text,
	"state" text,
	"city" text,
	"zip_code" text,
	"phone" text,
	"bio" text,
	"profile_picture" text,
	"interests" jsonb DEFAULT '[]'::jsonb,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_plan_id" varchar,
	"subscription_status" text DEFAULT 'active',
	"subscription_end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "canvas_drawings" ADD CONSTRAINT "canvas_drawings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canvas_drawings" ADD CONSTRAINT "canvas_drawings_parent_id_canvas_drawings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."canvas_drawings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empathy_maps" ADD CONSTRAINT "empathy_maps_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hmw_questions" ADD CONSTRAINT "hmw_questions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personas" ADD CONSTRAINT "personas_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pov_statements" ADD CONSTRAINT "pov_statements_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prototypes" ADD CONSTRAINT "prototypes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prototypes" ADD CONSTRAINT "prototypes_idea_id_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_plans" ADD CONSTRAINT "test_plans_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_plans" ADD CONSTRAINT "test_plans_prototype_id_prototypes_id_fk" FOREIGN KEY ("prototype_id") REFERENCES "public"."prototypes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_test_plan_id_test_plans_id_fk" FOREIGN KEY ("test_plan_id") REFERENCES "public"."test_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;