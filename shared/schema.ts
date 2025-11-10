import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core project entity
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("in_progress"), // in_progress, completed
  currentPhase: integer("current_phase").default(1), // 1-5 phases
  completionRate: real("completion_rate").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Phase 1: Empathize - Empathy Maps
export const empathyMaps = pgTable("empathy_maps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  says: jsonb("says").default([]), // Array of strings
  thinks: jsonb("thinks").default([]),
  does: jsonb("does").default([]),
  feels: jsonb("feels").default([]),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Phase 1: Empathize - Personas
export const personas = pgTable("personas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  age: integer("age"),
  occupation: text("occupation"),
  bio: text("bio"),
  goals: jsonb("goals").default([]),
  frustrations: jsonb("frustrations").default([]),
  motivations: jsonb("motivations").default([]),
  techSavviness: text("tech_savviness"), // low, medium, high
  avatar: text("avatar"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Phase 1: Empathize - User Interviews
export const interviews = pgTable("interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  participantName: text("participant_name").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration"), // minutes
  questions: jsonb("questions").default([]),
  responses: jsonb("responses").default([]),
  insights: text("insights"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Phase 1: Empathize - Field Observations
export const observations = pgTable("observations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  location: text("location").notNull(),
  context: text("context").notNull(),
  behavior: text("behavior").notNull(),
  insights: text("insights"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Phase 2: Define - POV Statements
export const povStatements = pgTable("pov_statements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  user: text("user").notNull(), // user description
  need: text("need").notNull(), // user need
  insight: text("insight").notNull(), // surprising insight
  statement: text("statement").notNull(), // complete POV statement
  priority: text("priority").default("medium"), // low, medium, high
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Phase 2: Define - How Might We questions
export const hmwQuestions = pgTable("hmw_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  question: text("question").notNull(),
  context: text("context"),
  challenge: text("challenge"),
  scope: text("scope").default("product"), // feature, product, service, experience, process
  priority: text("priority").default("medium"), // low, medium, high
  category: text("category"), // categorization
  votes: integer("votes").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Phase 3: Ideate - Ideas
export const ideas = pgTable("ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  // Legacy fields (kept for compatibility)
  feasibility: integer("feasibility"), // 1-5 scale - now maps to DVF Feasibility/Exequibilidade
  impact: integer("impact"), // 1-5 scale
  votes: integer("votes").default(0),
  // DVF (Desejabilidade, Viabilidade, Exequibilidade) System
  desirability: integer("desirability"), // 1-5 scale - user need satisfaction
  viability: integer("viability"), // 1-5 scale - business/profit potential  
  // feasibility already exists above - technical implementability
  confidenceLevel: integer("confidence_level"), // 1-5 scale - overall confidence
  dvfScore: real("dvf_score"), // Calculated: (desirability + viability + feasibility) / 3
  dvfAnalysis: text("dvf_analysis"), // Detailed justification for scores
  actionDecision: text("action_decision").default("evaluate"), // love_it, leave_it, change_it, evaluate
  // Priority and iteration fields
  priorityRank: integer("priority_rank"), // 1-n ranking based on DVF analysis
  iterationNotes: text("iteration_notes"), // Notes for "change_it" decisions
  status: text("status").default("idea"), // idea, selected, prototype, tested
  canvasData: jsonb("canvas_data"), // Fabric.js canvas data for drawings/sketches
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Phase 4: Prototype - Prototypes
export const prototypes = pgTable("prototypes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  ideaId: varchar("idea_id").references(() => ideas.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // paper, digital, physical, storyboard, canvas
  description: text("description").notNull(),
  materials: jsonb("materials").default([]),
  images: jsonb("images").default([]),
  canvasData: jsonb("canvas_data"), // Konva.js canvas data for interactive prototypes
  version: integer("version").default(1),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Canvas Drawings - For reusable sketches across phases
export const canvasDrawings = pgTable("canvas_drawings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  phase: integer("phase").notNull(), // 1-5 phases where this drawing is used
  canvasType: text("canvas_type").notNull(), // fabric, konva
  canvasData: jsonb("canvas_data").notNull(), // Canvas library data (Fabric.js or Konva.js)
  thumbnailData: text("thumbnail_data"), // Base64 encoded thumbnail for preview
  tags: jsonb("tags").default([]), // Tags for categorization
  isTemplate: boolean("is_template").default(false), // Can be used as a template
  parentId: varchar("parent_id"), // For drawing iterations - will be set to reference same table later
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Phase 5: Test - Test Plans
export const testPlans = pgTable("test_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  prototypeId: varchar("prototype_id").references(() => prototypes.id),
  name: text("name").notNull(),
  objective: text("objective").notNull(),
  methodology: text("methodology").notNull(),
  participants: integer("participants").notNull(),
  duration: integer("duration"), // minutes
  tasks: jsonb("tasks").default([]),
  metrics: jsonb("metrics").default([]),
  status: text("status").default("planned"), // planned, running, completed
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Phase 5: Test - Test Results
export const testResults = pgTable("test_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testPlanId: varchar("test_plan_id").references(() => testPlans.id).notNull(),
  participantId: text("participant_id").notNull(),
  taskResults: jsonb("task_results").default([]),
  feedback: text("feedback"),
  successRate: real("success_rate"),
  completionTime: integer("completion_time"), // minutes
  insights: text("insights"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// User Progress and Gamification
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  phase: integer("phase").notNull(), // 1-5
  completedTools: jsonb("completed_tools").default([]),
  badges: jsonb("badges").default([]),
  points: integer("points").default(0),
  timeSpent: integer("time_spent").default(0), // minutes
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Users for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  interests: jsonb("interests").default([]),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionPlanId: varchar("subscription_plan_id"),
  subscriptionStatus: text("subscription_status").default("active"), // active, canceled, expired, trialing
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Subscription Plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  priceMonthly: integer("price_monthly").notNull(), // in cents
  priceYearly: integer("price_yearly").notNull(), // in cents
  stripePriceIdMonthly: text("stripe_price_id_monthly"),
  stripePriceIdYearly: text("stripe_price_id_yearly"),
  maxProjects: integer("max_projects"), // null for unlimited
  maxPersonasPerProject: integer("max_personas_per_project"), // null for unlimited
  maxUsersPerTeam: integer("max_users_per_team"), // null for unlimited
  aiChatLimit: integer("ai_chat_limit"), // null for unlimited
  libraryArticlesCount: integer("library_articles_count"), // null for all articles
  features: jsonb("features").default([]), // Array of feature strings
  exportFormats: jsonb("export_formats").default([]), // Array of export formats (pdf, png, csv)
  hasCollaboration: boolean("has_collaboration").default(false),
  hasPermissionManagement: boolean("has_permission_management").default(false),
  hasSharedWorkspace: boolean("has_shared_workspace").default(false),
  hasCommentsAndFeedback: boolean("has_comments_and_feedback").default(false),
  hasSso: boolean("has_sso").default(false),
  hasCustomApi: boolean("has_custom_api").default(false),
  hasCustomIntegrations: boolean("has_custom_integrations").default(false),
  has24x7Support: boolean("has_24x7_support").default(false),
  order: integer("order").default(0), // for display ordering
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// User Subscriptions History
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  planId: varchar("plan_id").references(() => subscriptionPlans.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull(), // active, canceled, expired, trialing, incomplete
  billingPeriod: text("billing_period").notNull(), // monthly, yearly
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Articles for Design Thinking library
export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // empathize, define, ideate, prototype, test
  author: text("author").notNull(),
  description: text("description"),
  tags: jsonb("tags").default([]), // Array of tags
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
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

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  updatedAt: true,
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

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCanvasDrawingSchema = createInsertSchema(canvasDrawings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Profile update schema - excludes sensitive fields
export const updateProfileSchema = createInsertSchema(users).omit({
  id: true,
  username: true,
  password: true,
  role: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  subscriptionPlanId: true,
  subscriptionStatus: true,
  subscriptionEndDate: true,
  createdAt: true,
}).partial(); // Make all fields optional for partial updates

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

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;

export type CanvasDrawing = typeof canvasDrawings.$inferSelect;
export type InsertCanvasDrawing = z.infer<typeof insertCanvasDrawingSchema>;

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

// AI Analysis Types
export interface ProjectAnalysisData {
  project: Project;
  empathyMaps: EmpathyMap[];
  personas: Persona[];
  interviews: Interview[];
  observations: Observation[];
  povStatements: PovStatement[];
  hmwQuestions: HmwQuestion[];
  ideas: Idea[];
  prototypes: Prototype[];
  testPlans: TestPlan[];
  testResults: TestResult[];
}

export interface PhaseAnalysis {
  phase: number;
  phaseName: string;
  completeness: number;
  quality: number;
  insights: string[];
  gaps: string[];
  recommendations: string[];
  strengths: string[];
}

export interface AIProjectAnalysis {
  executiveSummary: string;
  maturityScore: number;
  overallInsights: string[];
  attentionPoints: string[];
  priorityNextSteps: string[];
  phaseAnalyses: PhaseAnalysis[];
  consistency: {
    score: number;
    issues: string[];
    strengths: string[];
  };
  alignment: {
    problemSolutionAlignment: number;
    researchInsightsAlignment: number;
    comments: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

// Kanban Phase Cards - Cards that can move between project phases
export const phaseCards = pgTable("phase_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  phase: integer("phase").notNull().default(1), // 1-5 phases (Empatizar, Definir, Idear, Prototipar, Testar)
  status: text("status").default("todo"), // todo, in_progress, done
  priority: text("priority").default("medium"), // low, medium, high
  assignee: text("assignee"), // Optional assignee
  tags: jsonb("tags").default([]), // Array of tags for categorization
  dueDate: timestamp("due_date"),
  position: integer("position").default(0), // Order within the phase column
  color: text("color").default("blue"), // Card color for visual organization
  attachments: jsonb("attachments").default([]), // File attachments metadata
  comments: jsonb("comments").default([]), // Comments/notes
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Benchmarking - Compare Design Thinking maturity across organizations
export const benchmarks = pgTable("benchmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  industry: text("industry").notNull(), // tech, healthcare, finance, retail, etc.
  companySize: text("company_size").notNull(), // startup, small, medium, large, enterprise
  maturityScores: jsonb("maturity_scores").default({}), // { empathize: 4, define: 3, ideate: 5, prototype: 2, test: 3 }
  benchmarkType: text("benchmark_type").notNull().default("industry"), // industry, internal, custom
  targetScores: jsonb("target_scores").default({}), // Goals for each phase
  improvementAreas: jsonb("improvement_areas").default([]), // Array of focus areas
  recommendations: jsonb("recommendations").default([]), // AI-generated suggestions
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Individual benchmark assessments
export const benchmarkAssessments = pgTable("benchmark_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  benchmarkId: varchar("benchmark_id").references(() => benchmarks.id).notNull(),
  phase: integer("phase").notNull(), // 1-5 for DT phases
  criteria: text("criteria").notNull(), // What is being assessed
  currentScore: real("current_score").notNull(), // 1-5 rating
  targetScore: real("target_score").notNull(), // Goal score
  industryAverage: real("industry_average"), // Benchmark comparison
  evidence: text("evidence"), // Supporting evidence for the score
  improvementPlan: text("improvement_plan"), // How to improve
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Insert schemas for benchmarking
export const insertBenchmarkSchema = createInsertSchema(benchmarks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBenchmarkAssessmentSchema = createInsertSchema(benchmarkAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert schemas for phase cards
export const insertPhaseCardSchema = createInsertSchema(phaseCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types for phase cards
export type PhaseCard = typeof phaseCards.$inferSelect;
export type InsertPhaseCard = z.infer<typeof insertPhaseCardSchema>;

// DVF Assessment - Desirability, Feasibility, Viability evaluation for ideas
export const dvfAssessments = pgTable("dvf_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  itemType: text("item_type").notNull(), // idea, prototype, solution, etc.
  itemId: varchar("item_id").notNull(), // Reference to the evaluated item
  itemName: text("item_name").notNull(),
  
  // Desirability - User desirability
  desirabilityScore: real("desirability_score").notNull().default(0), // 1-5 scale
  desirabilityEvidence: text("desirability_evidence"), // Supporting evidence
  userFeedback: text("user_feedback"), // Direct user feedback
  marketDemand: real("market_demand").default(0), // Market demand indicator
  
  // Feasibility - Technical feasibility  
  feasibilityScore: real("feasibility_score").notNull().default(0), // 1-5 scale
  feasibilityEvidence: text("feasibility_evidence"),
  technicalComplexity: text("technical_complexity"), // low, medium, high
  resourceRequirements: jsonb("resource_requirements").default([]), // Required resources
  timeToImplement: integer("time_to_implement"), // Estimated time in days
  
  // Viability - Economic viability
  viabilityScore: real("viability_score").notNull().default(0), // 1-5 scale  
  viabilityEvidence: text("viability_evidence"),
  businessModel: text("business_model"), // How it generates value
  costEstimate: real("cost_estimate"), // Implementation cost
  revenueProjection: real("revenue_projection"), // Expected revenue
  
  // Overall DVF analysis
  overallScore: real("overall_score").default(0), // Average of the three pillars
  recommendation: text("recommendation"), // proceed, modify, stop
  nextSteps: jsonb("next_steps").default([]), // Recommended actions
  risksIdentified: jsonb("risks_identified").default([]), // Potential risks
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Lovability Metrics - Emotional response and satisfaction tracking
export const lovabilityMetrics = pgTable("lovability_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  itemType: text("item_type").notNull(), // idea, prototype, solution
  itemId: varchar("item_id").notNull(), // Reference to the item being evaluated
  itemName: text("item_name").notNull(),
  
  // Core Metrics
  npsScore: real("nps_score").default(0), // -100 to 100
  satisfactionScore: real("satisfaction_score").default(0), // 0-10
  retentionRate: real("retention_rate").default(0), // 0-100%
  engagementTime: real("engagement_time").default(0), // minutes
  
  // Emotional Distribution
  emotionalDistribution: jsonb("emotional_distribution").default({}), // delight, satisfaction, neutral, frustration percentages
  
  // Feedback Analysis
  positiveComments: jsonb("positive_comments").default([]),
  negativeComments: jsonb("negative_comments").default([]),
  improvementSuggestions: jsonb("improvement_suggestions").default([]),
  
  // User Behavior
  userTestingSessions: integer("user_testing_sessions").default(0),
  completionRate: real("completion_rate").default(0), // 0-100%
  errorRate: real("error_rate").default(0), // 0-100%
  supportTickets: integer("support_tickets").default(0),
  
  // Qualitative Insights
  emotionalStory: text("emotional_story"),
  userPersonas: jsonb("user_personas").default([]),
  keyMoments: jsonb("key_moments").default([]),
  painPoints: jsonb("pain_points").default([]),
  
  // Overall Assessment
  lovabilityScore: real("lovability_score").default(0), // 0-10 calculated score
  recommendations: jsonb("recommendations").default([]),
  
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Project Analytics - Detailed usage and success metrics
export const projectAnalytics = pgTable("project_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  
  // Usage metrics
  totalTimeSpent: integer("total_time_spent").default(0), // minutes
  timePerPhase: jsonb("time_per_phase").default({}), // { phase1: 120, phase2: 90, ... }
  toolsUsed: jsonb("tools_used").default([]), // List of tools/features used
  toolUsageCount: jsonb("tool_usage_count").default({}), // Usage frequency per tool
  
  // Progress metrics
  completionRate: real("completion_rate").default(0), // 0-100%
  phasesCompleted: jsonb("phases_completed").default([]), // Which phases are done
  stageProgressions: integer("stage_progressions").default(0), // Times moved between phases
  iterationsCount: integer("iterations_count").default(0), // Number of iterations
  
  // Success indicators
  prototypesCreated: integer("prototypes_created").default(0),
  testsCompleted: integer("tests_completed").default(0),
  userFeedbackCollected: integer("user_feedback_collected").default(0),
  ideasGenerated: integer("ideas_generated").default(0),
  ideasImplemented: integer("ideas_implemented").default(0),
  
  // Team collaboration metrics
  teamSize: integer("team_size").default(1),
  collaborationEvents: integer("collaboration_events").default(0),
  meetingsHeld: integer("meetings_held").default(0),
  decisionsMade: integer("decisions_made").default(0),
  
  // Innovation metrics
  originalityScore: real("originality_score").default(0), // 1-10
  feasibilityScore: real("feasibility_score").default(0), // 1-10
  impactPotential: real("impact_potential").default(0), // 1-10
  marketFit: real("market_fit").default(0), // 1-10
  
  // Success metrics
  overallSuccess: real("overall_success").default(0), // 0-100%
  userSatisfaction: real("user_satisfaction").default(0), // 0-10
  goalAchievement: real("goal_achievement").default(0), // 0-100%
  innovationLevel: real("innovation_level").default(0), // 1-5
  
  // Key insights
  topPerformingTools: jsonb("top_performing_tools").default([]),
  timeBottlenecks: jsonb("time_bottlenecks").default([]),
  successFactors: jsonb("success_factors").default([]),
  improvementAreas: jsonb("improvement_areas").default([]),
  
  lastUpdated: timestamp("last_updated").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Competitive Analysis - External benchmarking data
export const competitiveAnalysis = pgTable("competitive_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  
  // Competitor info
  competitorName: text("competitor_name").notNull(), // Miro, Figma, Notion, etc.
  competitorType: text("competitor_type").notNull(), // direct, indirect, substitute
  marketPosition: text("market_position"), // leader, challenger, niche
  
  // Feature comparison
  features: jsonb("features").default({}), // Feature matrix comparison
  functionalGaps: jsonb("functional_gaps").default([]), // What they lack
  functionalOverages: jsonb("functional_overages").default([]), // What they overdo
  
  // Pricing comparison
  pricingModel: text("pricing_model"), // freemium, subscription, one-time
  pricePoints: jsonb("price_points").default([]), // Their pricing tiers
  valueProposition: text("value_proposition"), // Their main value prop
  
  // Market gaps
  underservedOutcomes: jsonb("underserved_outcomes").default([]), // Market gaps
  overservedOutcomes: jsonb("overserved_outcomes").default([]), // Overcomplicated areas
  
  // Our positioning
  ourAdvantages: jsonb("our_advantages").default([]), // Where we're better
  ourDisadvantages: jsonb("our_disadvantages").default([]), // Where we lack
  recommendations: jsonb("recommendations").default([]), // Strategic recommendations
  
  analysisDate: timestamp("analysis_date").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Project Backups - Automatic versioning and recovery
export const projectBackups = pgTable("project_backups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  
  // Backup metadata
  backupType: text("backup_type").notNull(), // auto, manual
  description: text("description"),
  
  // Project snapshot at backup time
  projectSnapshot: jsonb("project_snapshot").notNull(), // Complete project data
  
  // Statistics at backup time
  phaseSnapshot: integer("phase_snapshot"), // Current phase at backup
  completionSnapshot: real("completion_snapshot"), // Completion rate at backup
  itemCount: integer("item_count"), // Total items in backup
  
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Help/Wiki System - Knowledge base articles
export const helpArticles = pgTable("help_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  content: text("content").notNull(), // Markdown content
  category: text("category").notNull(), // inicio-rapido, fases, exportacao, etc
  subcategory: text("subcategory"), // Optional subcategory
  phase: integer("phase"), // 1-5 if related to specific DT phase
  tags: jsonb("tags").default([]), // Array of searchable tags
  searchKeywords: jsonb("search_keywords").default([]), // Keywords for search
  featured: boolean("featured").default(false), // Show in main help
  author: text("author").notNull().default("DTTools Team"), // Article author
  viewCount: integer("view_count").default(0),
  helpful: integer("helpful").default(0), // Helpful votes
  order: integer("order").default(0), // Display order within category
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Insert schemas for new tables
export const insertDvfAssessmentSchema = createInsertSchema(dvfAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLovabilityMetricSchema = createInsertSchema(lovabilityMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectAnalyticsSchema = createInsertSchema(projectAnalytics).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertCompetitiveAnalysisSchema = createInsertSchema(competitiveAnalysis).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  analysisDate: true,
});

// Export types for benchmarking
export type Benchmark = typeof benchmarks.$inferSelect;
export type InsertBenchmark = z.infer<typeof insertBenchmarkSchema>;

export type BenchmarkAssessment = typeof benchmarkAssessments.$inferSelect;
export type InsertBenchmarkAssessment = z.infer<typeof insertBenchmarkAssessmentSchema>;

// Export types for new benchmarking features
export type DvfAssessment = typeof dvfAssessments.$inferSelect;
export type InsertDvfAssessment = z.infer<typeof insertDvfAssessmentSchema>;

export type LovabilityMetric = typeof lovabilityMetrics.$inferSelect;
export type InsertLovabilityMetric = z.infer<typeof insertLovabilityMetricSchema>;

export type ProjectAnalytics = typeof projectAnalytics.$inferSelect;
export type InsertProjectAnalytics = z.infer<typeof insertProjectAnalyticsSchema>;

export type CompetitiveAnalysis = typeof competitiveAnalysis.$inferSelect;
export type InsertCompetitiveAnalysis = z.infer<typeof insertCompetitiveAnalysisSchema>;

export const insertProjectBackupSchema = createInsertSchema(projectBackups).omit({
  id: true,
  createdAt: true,
});

export type ProjectBackup = typeof projectBackups.$inferSelect;
export type InsertProjectBackup = z.infer<typeof insertProjectBackupSchema>;

export const insertHelpArticleSchema = createInsertSchema(helpArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  helpful: true,
});

export type HelpArticle = typeof helpArticles.$inferSelect;
export type InsertHelpArticle = z.infer<typeof insertHelpArticleSchema>;