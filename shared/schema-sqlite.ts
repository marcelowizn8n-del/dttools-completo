import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core project entity
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("in_progress"), // in_progress, completed
  currentPhase: integer("current_phase").default(1), // 1-5 phases
  completionRate: real("completion_rate").default(0),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Users for authentication
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(), // hashed password
  role: text("role").notNull().default("user"), // admin, user
  company: text("company"),
  jobRole: text("job_role"),
  industry: text("industry"),
  experience: text("experience"),
  country: text("country"),
  state: text("state"),
  city: text("city"),
  zipCode: text("zip_code"),
  phone: text("phone"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  interests: text("interests", { mode: 'json' }).$type<string[]>().default([]),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionPlanId: text("subscription_plan_id"),
  subscriptionStatus: text("subscription_status").default("active"), // active, canceled, expired, trialing
  subscriptionEndDate: integer("subscription_end_date", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Phase 1: Empathize - Empathy Maps
export const empathyMaps = sqliteTable("empathy_maps", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  says: text("says", { mode: 'json' }).$type<string[]>().default([]),
  thinks: text("thinks", { mode: 'json' }).$type<string[]>().default([]),
  does: text("does", { mode: 'json' }).$type<string[]>().default([]),
  feels: text("feels", { mode: 'json' }).$type<string[]>().default([]),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Phase 1: Empathize - Personas
export const personas = sqliteTable("personas", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  age: integer("age"),
  occupation: text("occupation"),
  bio: text("bio"),
  goals: text("goals", { mode: 'json' }).$type<string[]>().default([]),
  frustrations: text("frustrations", { mode: 'json' }).$type<string[]>().default([]),
  motivations: text("motivations", { mode: 'json' }).$type<string[]>().default([]),
  techSavviness: text("tech_savviness"), // low, medium, high
  avatar: text("avatar"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Phase 1: Empathize - User Interviews
export const interviews = sqliteTable("interviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id).notNull(),
  participantName: text("participant_name").notNull(),
  date: integer("date", { mode: 'timestamp' }).notNull(),
  duration: integer("duration"), // minutes
  questions: text("questions", { mode: 'json' }).$type<string[]>().default([]),
  responses: text("responses", { mode: 'json' }).$type<string[]>().default([]),
  insights: text("insights"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Phase 1: Empathize - Field Observations
export const observations = sqliteTable("observations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id).notNull(),
  location: text("location").notNull(),
  context: text("context").notNull(),
  behavior: text("behavior").notNull(),
  insights: text("insights"),
  date: integer("date", { mode: 'timestamp' }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Phase 2: Define - POV Statements
export const povStatements = sqliteTable("pov_statements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id).notNull(),
  user: text("user").notNull(), // user description
  need: text("need").notNull(), // user need
  insight: text("insight").notNull(), // surprising insight
  statement: text("statement").notNull(), // complete POV statement
  priority: text("priority").default("medium"), // low, medium, high
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Phase 2: Define - How Might We questions
export const hmwQuestions = sqliteTable("hmw_questions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id).notNull(),
  question: text("question").notNull(),
  context: text("context"),
  challenge: text("challenge"),
  scope: text("scope").default("product"), // feature, product, service, experience, process
  priority: text("priority").default("medium"), // low, medium, high
  category: text("category"), // categorization
  votes: integer("votes").default(0),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Phase 3: Ideate - Ideas
export const ideas = sqliteTable("ideas", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  feasibility: integer("feasibility"), // 1-5 scale
  impact: integer("impact"), // 1-5 scale
  votes: integer("votes").default(0),
  desirability: integer("desirability"), // 1-5 scale
  viability: integer("viability"), // 1-5 scale
  confidenceLevel: integer("confidence_level"), // 1-5 scale
  dvfScore: real("dvf_score"), // Calculated score
  dvfAnalysis: text("dvf_analysis"), // Detailed justification
  actionDecision: text("action_decision").default("evaluate"), // love_it, leave_it, change_it, evaluate
  priorityRank: integer("priority_rank"), // 1-n ranking
  iterationNotes: text("iteration_notes"), // Notes for "change_it" decisions
  status: text("status").default("idea"), // idea, selected, prototype, tested
  canvasData: text("canvas_data", { mode: 'json' }), // Fabric.js canvas data
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Phase 4: Prototype - Prototypes
export const prototypes = sqliteTable("prototypes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id).notNull(),
  ideaId: text("idea_id").references(() => ideas.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // paper, digital, physical, storyboard, canvas
  description: text("description").notNull(),
  materials: text("materials", { mode: 'json' }).$type<string[]>().default([]),
  images: text("images", { mode: 'json' }).$type<string[]>().default([]),
  canvasData: text("canvas_data", { mode: 'json' }), // Konva.js canvas data
  version: integer("version").default(1),
  feedback: text("feedback"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Phase 5: Test - Test Plans
export const testPlans = sqliteTable("test_plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").references(() => projects.id).notNull(),
  prototypeId: text("prototype_id").references(() => prototypes.id),
  name: text("name").notNull(),
  objective: text("objective").notNull(),
  methodology: text("methodology").notNull(),
  participants: integer("participants").notNull(),
  duration: integer("duration"), // minutes
  tasks: text("tasks", { mode: 'json' }).$type<string[]>().default([]),
  metrics: text("metrics", { mode: 'json' }).$type<string[]>().default([]),
  status: text("status").default("planned"), // planned, running, completed
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Phase 5: Test - Test Results
export const testResults = sqliteTable("test_results", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  testPlanId: text("test_plan_id").references(() => testPlans.id).notNull(),
  participantId: text("participant_id").notNull(),
  taskResults: text("task_results", { mode: 'json' }).$type<string[]>().default([]),
  feedback: text("feedback"),
  successRate: real("success_rate"),
  completionTime: integer("completion_time"), // minutes
  insights: text("insights"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Articles for Design Thinking library
export const articles = sqliteTable("articles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // empathize, define, ideate, prototype, test
  author: text("author").notNull(),
  description: text("description"),
  tags: text("tags", { mode: 'json' }).$type<string[]>().default([]),
  published: integer("published", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmpathyMapSchema = createInsertSchema(empathyMaps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPersonaSchema = createInsertSchema(personas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInterviewSchema = createInsertSchema(interviews, {
  questions: z.array(z.string()).optional(),
  responses: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertObservationSchema = createInsertSchema(observations).omit({
  id: true,
  createdAt: true,
});

export const insertPovStatementSchema = createInsertSchema(povStatements).omit({
  id: true,
  createdAt: true,
});

export const insertHmwQuestionSchema = createInsertSchema(hmwQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertIdeaSchema = createInsertSchema(ideas).omit({
  id: true,
  createdAt: true,
});

export const insertPrototypeSchema = createInsertSchema(prototypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTestPlanSchema = createInsertSchema(testPlans).omit({
  id: true,
  createdAt: true,
});

export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type EmpathyMap = typeof empathyMaps.$inferSelect;
export type InsertEmpathyMap = z.infer<typeof insertEmpathyMapSchema>;

export type Persona = typeof personas.$inferSelect;
export type InsertPersona = z.infer<typeof insertPersonaSchema>;

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type Observation = typeof observations.$inferSelect;
export type InsertObservation = z.infer<typeof insertObservationSchema>;

export type PovStatement = typeof povStatements.$inferSelect;
export type InsertPovStatement = z.infer<typeof insertPovStatementSchema>;

export type HmwQuestion = typeof hmwQuestions.$inferSelect;
export type InsertHmwQuestion = z.infer<typeof insertHmwQuestionSchema>;

export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = z.infer<typeof insertIdeaSchema>;

export type Prototype = typeof prototypes.$inferSelect;
export type InsertPrototype = z.infer<typeof insertPrototypeSchema>;

export type TestPlan = typeof testPlans.$inferSelect;
export type InsertTestPlan = z.infer<typeof insertTestPlanSchema>;

export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

// Subscription Plans
export const subscriptionPlans = sqliteTable("subscription_plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  priceMonthly: integer("price_monthly").default(0),
  priceYearly: integer("price_yearly").default(0),
  features: text("features", { mode: 'json' }).$type<string[]>().default([]),
  maxProjects: integer("max_projects"),
  maxPersonasPerProject: integer("max_personas_per_project"),
  maxUsersPerTeam: integer("max_users_per_team"),
  aiChatLimit: integer("ai_chat_limit"),
  libraryArticlesCount: integer("library_articles_count"),
  hasCollaboration: integer("has_collaboration", { mode: 'boolean' }).default(false),
  exportFormats: text("export_formats", { mode: 'json' }).$type<string[]>().default([]),
  hasPermissionManagement: integer("has_permission_management", { mode: 'boolean' }).default(false),
  hasSharedWorkspace: integer("has_shared_workspace", { mode: 'boolean' }).default(false),
  hasCommentsAndFeedback: integer("has_comments_and_feedback", { mode: 'boolean' }).default(false),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

// User Subscriptions
export const userSubscriptions = sqliteTable("user_subscriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  planId: text("plan_id").notNull().references(() => subscriptionPlans.id),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull(),
  billingPeriod: text("billing_period").notNull(),
  currentPeriodStart: integer("current_period_start", { mode: 'timestamp' }),
  currentPeriodEnd: integer("current_period_end", { mode: 'timestamp' }),
  cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;




