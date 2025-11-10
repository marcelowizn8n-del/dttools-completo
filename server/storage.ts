import { 
  type Project, type InsertProject,
  type EmpathyMap, type InsertEmpathyMap,
  type Persona, type InsertPersona,
  type Interview, type InsertInterview,
  type Observation, type InsertObservation,
  type PovStatement, type InsertPovStatement,
  type HmwQuestion, type InsertHmwQuestion,
  type Idea, type InsertIdea,
  type Prototype, type InsertPrototype,
  type TestPlan, type InsertTestPlan,
  type TestResult, type InsertTestResult,
  type UserProgress, type InsertUserProgress,
  type User, type InsertUser,
  type Article, type InsertArticle,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type UserSubscription, type InsertUserSubscription,
  type CanvasDrawing, type InsertCanvasDrawing,
  type PhaseCard, type InsertPhaseCard,
  type Benchmark, type InsertBenchmark,
  type BenchmarkAssessment, type InsertBenchmarkAssessment,
  type DvfAssessment, type InsertDvfAssessment,
  type LovabilityMetric, type InsertLovabilityMetric,
  type ProjectAnalytics, type InsertProjectAnalytics,
  type CompetitiveAnalysis, type InsertCompetitiveAnalysis,
  type ProjectBackup, type InsertProjectBackup,
  type HelpArticle, type InsertHelpArticle,
  projects, empathyMaps, personas, interviews, observations,
  povStatements, hmwQuestions, ideas, prototypes, testPlans, testResults,
  userProgress, users, articles, subscriptionPlans, userSubscriptions,
  canvasDrawings, phaseCards, benchmarks, benchmarkAssessments,
  dvfAssessments, lovabilityMetrics, projectAnalytics, competitiveAnalysis,
  projectBackups, helpArticles
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Phase 1: Empathize
  getEmpathyMaps(projectId: string): Promise<EmpathyMap[]>;
  createEmpathyMap(empathyMap: InsertEmpathyMap): Promise<EmpathyMap>;
  updateEmpathyMap(id: string, empathyMap: Partial<InsertEmpathyMap>): Promise<EmpathyMap | undefined>;
  deleteEmpathyMap(id: string): Promise<boolean>;

  getPersonas(projectId: string): Promise<Persona[]>;
  createPersona(persona: InsertPersona): Promise<Persona>;
  updatePersona(id: string, persona: Partial<InsertPersona>): Promise<Persona | undefined>;
  deletePersona(id: string): Promise<boolean>;

  getInterviews(projectId: string): Promise<Interview[]>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: string, interview: Partial<InsertInterview>): Promise<Interview | undefined>;
  deleteInterview(id: string): Promise<boolean>;

  getObservations(projectId: string): Promise<Observation[]>;
  createObservation(observation: InsertObservation): Promise<Observation>;
  updateObservation(id: string, observation: Partial<InsertObservation>): Promise<Observation | undefined>;
  deleteObservation(id: string): Promise<boolean>;

  // Phase 2: Define
  getPovStatements(projectId: string): Promise<PovStatement[]>;
  getPovStatement(id: string): Promise<PovStatement | undefined>;
  createPovStatement(pov: InsertPovStatement): Promise<PovStatement>;
  updatePovStatement(id: string, pov: Partial<InsertPovStatement>): Promise<PovStatement | undefined>;
  deletePovStatement(id: string): Promise<boolean>;

  getHmwQuestions(projectId: string): Promise<HmwQuestion[]>;
  getHmwQuestion(id: string): Promise<HmwQuestion | undefined>;
  createHmwQuestion(hmw: InsertHmwQuestion): Promise<HmwQuestion>;
  updateHmwQuestion(id: string, hmw: Partial<InsertHmwQuestion>): Promise<HmwQuestion | undefined>;
  deleteHmwQuestion(id: string): Promise<boolean>;

  // Phase 3: Ideate
  getIdeas(projectId: string): Promise<Idea[]>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  updateIdea(id: string, idea: Partial<InsertIdea>): Promise<Idea | undefined>;
  deleteIdea(id: string): Promise<boolean>;

  // Phase 4: Prototype
  getPrototypes(projectId: string): Promise<Prototype[]>;
  createPrototype(prototype: InsertPrototype): Promise<Prototype>;
  updatePrototype(id: string, prototype: Partial<InsertPrototype>): Promise<Prototype | undefined>;
  deletePrototype(id: string): Promise<boolean>;

  // Phase 5: Test
  getTestPlans(projectId: string): Promise<TestPlan[]>;
  createTestPlan(testPlan: InsertTestPlan): Promise<TestPlan>;
  updateTestPlan(id: string, testPlan: Partial<InsertTestPlan>): Promise<TestPlan | undefined>;

  getTestResults(testPlanId: string): Promise<TestResult[]>;
  createTestResult(testResult: InsertTestResult): Promise<TestResult>;

  // User Progress
  getUserProgress(userId: string, projectId: string): Promise<UserProgress | undefined>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;

  // Analytics
  getProjectStats(projectId: string): Promise<{
    totalTools: number;
    completedTools: number;
    currentPhase: number;
    completionRate: number;
  }>;

  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Articles
  getArticles(): Promise<Article[]>;
  getArticlesByCategory(category: string): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<boolean>;

  // Canvas Drawings
  getCanvasDrawings(projectId: string): Promise<CanvasDrawing[]>;
  getCanvasDrawing(id: string): Promise<CanvasDrawing | undefined>;
  createCanvasDrawing(drawing: InsertCanvasDrawing): Promise<CanvasDrawing>;
  updateCanvasDrawing(id: string, drawing: Partial<InsertCanvasDrawing>): Promise<CanvasDrawing | undefined>;
  deleteCanvasDrawing(id: string): Promise<boolean>;

  // Phase Cards (Kanban)
  getPhaseCards(projectId: string): Promise<PhaseCard[]>;
  getPhaseCard(id: string): Promise<PhaseCard | undefined>;
  createPhaseCard(card: InsertPhaseCard): Promise<PhaseCard>;
  updatePhaseCard(id: string, card: Partial<InsertPhaseCard>): Promise<PhaseCard | undefined>;
  deletePhaseCard(id: string): Promise<boolean>;

  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: string, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: string): Promise<boolean>;

  // User Subscriptions
  getUserSubscriptions(userId: string): Promise<UserSubscription[]>;
  getUserActiveSubscription(userId: string): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: string, subscription: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;
  cancelUserSubscription(id: string): Promise<boolean>;

  // Benchmarking
  getBenchmarks(projectId: string): Promise<Benchmark[]>;
  getBenchmark(id: string): Promise<Benchmark | undefined>;
  createBenchmark(benchmark: InsertBenchmark): Promise<Benchmark>;
  updateBenchmark(id: string, benchmark: Partial<InsertBenchmark>): Promise<Benchmark | undefined>;
  deleteBenchmark(id: string): Promise<boolean>;

  getBenchmarkAssessments(benchmarkId: string): Promise<BenchmarkAssessment[]>;
  createBenchmarkAssessment(assessment: InsertBenchmarkAssessment): Promise<BenchmarkAssessment>;
  updateBenchmarkAssessment(id: string, assessment: Partial<InsertBenchmarkAssessment>): Promise<BenchmarkAssessment | undefined>;
  deleteBenchmarkAssessment(id: string): Promise<boolean>;

  // DVF Assessment - Desirability, Feasibility, Viability
  getDvfAssessments(projectId: string): Promise<DvfAssessment[]>;
  getDvfAssessment(id: string): Promise<DvfAssessment | undefined>;
  createDvfAssessment(assessment: InsertDvfAssessment): Promise<DvfAssessment>;
  updateDvfAssessment(id: string, assessment: Partial<InsertDvfAssessment>): Promise<DvfAssessment | undefined>;
  deleteDvfAssessment(id: string): Promise<boolean>;

  // Lovability Metrics
  getLovabilityMetrics(projectId: string): Promise<LovabilityMetric[]>;
  getLovabilityMetric(id: string): Promise<LovabilityMetric | undefined>;
  createLovabilityMetric(metric: InsertLovabilityMetric): Promise<LovabilityMetric>;
  updateLovabilityMetric(id: string, metric: Partial<InsertLovabilityMetric>): Promise<LovabilityMetric | undefined>;
  deleteLovabilityMetric(id: string): Promise<boolean>;

  // Project Analytics
  getProjectAnalytics(projectId: string): Promise<ProjectAnalytics | undefined>;
  createProjectAnalytics(analytics: InsertProjectAnalytics): Promise<ProjectAnalytics>;
  updateProjectAnalytics(id: string, analytics: Partial<InsertProjectAnalytics>): Promise<ProjectAnalytics | undefined>;

  // Competitive Analysis
  getCompetitiveAnalyses(projectId: string): Promise<CompetitiveAnalysis[]>;
  getCompetitiveAnalysis(id: string): Promise<CompetitiveAnalysis | undefined>;
  createCompetitiveAnalysis(analysis: InsertCompetitiveAnalysis): Promise<CompetitiveAnalysis>;
  updateCompetitiveAnalysis(id: string, analysis: Partial<InsertCompetitiveAnalysis>): Promise<CompetitiveAnalysis | undefined>;
  deleteCompetitiveAnalysis(id: string): Promise<boolean>;

  // Project Backups
  createProjectBackup(projectId: string, backupType: 'auto' | 'manual', description?: string): Promise<any>;
  getProjectBackups(projectId: string): Promise<any[]>;
  getProjectBackup(id: string): Promise<any | undefined>;
  restoreProjectBackup(backupId: string): Promise<boolean>;
  deleteProjectBackup(id: string): Promise<boolean>;

  // Help Articles
  getHelpArticles(): Promise<any[]>;
  getHelpArticleBySlug(slug: string): Promise<any | undefined>;
  searchHelpArticles(searchTerm: string): Promise<any[]>;
  incrementHelpArticleViews(id: string): Promise<any | undefined>;
  incrementHelpArticleHelpful(id: string): Promise<any | undefined>;
  createHelpArticle(article: any): Promise<any>;
  updateHelpArticle(id: string, article: any): Promise<any | undefined>;
  deleteHelpArticle(id: string): Promise<boolean>;
}

// Database implementation using PostgreSQL via Drizzle ORM
export class DatabaseStorage implements IStorage {
  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Users
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Articles
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    return await db.select().from(articles)
      .where(eq(articles.category, category))
      .orderBy(desc(articles.createdAt));
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updatedArticle] = await db.update(articles)
      .set({ ...article, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return updatedArticle;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Phase 1: Empathize
  async getEmpathyMaps(projectId: string): Promise<EmpathyMap[]> {
    return await db.select().from(empathyMaps)
      .where(eq(empathyMaps.projectId, projectId))
      .orderBy(desc(empathyMaps.createdAt));
  }

  async createEmpathyMap(empathyMap: InsertEmpathyMap): Promise<EmpathyMap> {
    const [newMap] = await db.insert(empathyMaps).values(empathyMap).returning();
    return newMap;
  }

  async updateEmpathyMap(id: string, empathyMap: Partial<InsertEmpathyMap>): Promise<EmpathyMap | undefined> {
    const [updatedMap] = await db.update(empathyMaps)
      .set({ ...empathyMap, updatedAt: new Date() })
      .where(eq(empathyMaps.id, id))
      .returning();
    return updatedMap;
  }

  async deleteEmpathyMap(id: string): Promise<boolean> {
    const result = await db.delete(empathyMaps).where(eq(empathyMaps.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getPersonas(projectId: string): Promise<Persona[]> {
    return await db.select().from(personas)
      .where(eq(personas.projectId, projectId))
      .orderBy(desc(personas.createdAt));
  }

  async createPersona(persona: InsertPersona): Promise<Persona> {
    const [newPersona] = await db.insert(personas).values(persona).returning();
    return newPersona;
  }

  async updatePersona(id: string, persona: Partial<InsertPersona>): Promise<Persona | undefined> {
    const [updatedPersona] = await db.update(personas)
      .set({ ...persona, updatedAt: new Date() })
      .where(eq(personas.id, id))
      .returning();
    return updatedPersona;
  }

  async deletePersona(id: string): Promise<boolean> {
    const result = await db.delete(personas).where(eq(personas.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getInterviews(projectId: string): Promise<Interview[]> {
    return await db.select().from(interviews)
      .where(eq(interviews.projectId, projectId))
      .orderBy(desc(interviews.createdAt));
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const [newInterview] = await db.insert(interviews).values(interview).returning();
    return newInterview;
  }

  async updateInterview(id: string, interview: Partial<InsertInterview>): Promise<Interview | undefined> {
    const [updatedInterview] = await db.update(interviews)
      .set(interview)
      .where(eq(interviews.id, id))
      .returning();
    return updatedInterview;
  }

  async deleteInterview(id: string): Promise<boolean> {
    const result = await db.delete(interviews).where(eq(interviews.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getObservations(projectId: string): Promise<Observation[]> {
    return await db.select().from(observations)
      .where(eq(observations.projectId, projectId))
      .orderBy(desc(observations.createdAt));
  }

  async createObservation(observation: InsertObservation): Promise<Observation> {
    const [newObservation] = await db.insert(observations).values(observation).returning();
    return newObservation;
  }

  async updateObservation(id: string, observation: Partial<InsertObservation>): Promise<Observation | undefined> {
    const [updatedObservation] = await db.update(observations)
      .set(observation)
      .where(eq(observations.id, id))
      .returning();
    return updatedObservation;
  }

  async deleteObservation(id: string): Promise<boolean> {
    const result = await db.delete(observations).where(eq(observations.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Phase 2: Define
  async getPovStatements(projectId: string): Promise<PovStatement[]> {
    return await db.select().from(povStatements)
      .where(eq(povStatements.projectId, projectId))
      .orderBy(desc(povStatements.createdAt));
  }

  async getPovStatement(id: string): Promise<PovStatement | undefined> {
    const [statement] = await db.select().from(povStatements).where(eq(povStatements.id, id));
    return statement;
  }

  async createPovStatement(pov: InsertPovStatement): Promise<PovStatement> {
    const [newStatement] = await db.insert(povStatements).values(pov).returning();
    return newStatement;
  }

  async updatePovStatement(id: string, pov: Partial<InsertPovStatement>): Promise<PovStatement | undefined> {
    const [updatedStatement] = await db.update(povStatements)
      .set(pov)
      .where(eq(povStatements.id, id))
      .returning();
    return updatedStatement;
  }

  async deletePovStatement(id: string): Promise<boolean> {
    const result = await db.delete(povStatements).where(eq(povStatements.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getHmwQuestions(projectId: string): Promise<HmwQuestion[]> {
    return await db.select().from(hmwQuestions)
      .where(eq(hmwQuestions.projectId, projectId))
      .orderBy(desc(hmwQuestions.createdAt));
  }

  async getHmwQuestion(id: string): Promise<HmwQuestion | undefined> {
    const [question] = await db.select().from(hmwQuestions).where(eq(hmwQuestions.id, id));
    return question;
  }

  async createHmwQuestion(hmw: InsertHmwQuestion): Promise<HmwQuestion> {
    const [newQuestion] = await db.insert(hmwQuestions).values(hmw).returning();
    return newQuestion;
  }

  async updateHmwQuestion(id: string, hmw: Partial<InsertHmwQuestion>): Promise<HmwQuestion | undefined> {
    const [updatedQuestion] = await db.update(hmwQuestions)
      .set(hmw)
      .where(eq(hmwQuestions.id, id))
      .returning();
    return updatedQuestion;
  }

  async deleteHmwQuestion(id: string): Promise<boolean> {
    const result = await db.delete(hmwQuestions).where(eq(hmwQuestions.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Phase 3: Ideate
  async getIdeas(projectId: string): Promise<Idea[]> {
    return await db.select().from(ideas)
      .where(eq(ideas.projectId, projectId))
      .orderBy(desc(ideas.createdAt));
  }

  async createIdea(idea: InsertIdea): Promise<Idea> {
    const [newIdea] = await db.insert(ideas).values(idea).returning();
    return newIdea;
  }

  async updateIdea(id: string, idea: Partial<InsertIdea>): Promise<Idea | undefined> {
    const [updatedIdea] = await db.update(ideas)
      .set(idea)
      .where(eq(ideas.id, id))
      .returning();
    return updatedIdea;
  }

  async deleteIdea(id: string): Promise<boolean> {
    const result = await db.delete(ideas).where(eq(ideas.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Phase 4: Prototype
  async getPrototypes(projectId: string): Promise<Prototype[]> {
    return await db.select().from(prototypes)
      .where(eq(prototypes.projectId, projectId))
      .orderBy(desc(prototypes.createdAt));
  }

  async createPrototype(prototype: InsertPrototype): Promise<Prototype> {
    const [newPrototype] = await db.insert(prototypes).values(prototype).returning();
    return newPrototype;
  }

  async updatePrototype(id: string, prototype: Partial<InsertPrototype>): Promise<Prototype | undefined> {
    const [updatedPrototype] = await db.update(prototypes)
      .set(prototype)
      .where(eq(prototypes.id, id))
      .returning();
    return updatedPrototype;
  }

  async deletePrototype(id: string): Promise<boolean> {
    const result = await db.delete(prototypes).where(eq(prototypes.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Phase 5: Test
  async getTestPlans(projectId: string): Promise<TestPlan[]> {
    return await db.select().from(testPlans)
      .where(eq(testPlans.projectId, projectId))
      .orderBy(desc(testPlans.createdAt));
  }

  async createTestPlan(testPlan: InsertTestPlan): Promise<TestPlan> {
    const [newPlan] = await db.insert(testPlans).values(testPlan).returning();
    return newPlan;
  }

  async updateTestPlan(id: string, testPlan: Partial<InsertTestPlan>): Promise<TestPlan | undefined> {
    const [updatedPlan] = await db.update(testPlans)
      .set(testPlan)
      .where(eq(testPlans.id, id))
      .returning();
    return updatedPlan;
  }

  async getTestResults(testPlanId: string): Promise<TestResult[]> {
    return await db.select().from(testResults)
      .where(eq(testResults.testPlanId, testPlanId))
      .orderBy(desc(testResults.createdAt));
  }

  async createTestResult(testResult: InsertTestResult): Promise<TestResult> {
    const [newResult] = await db.insert(testResults).values(testResult).returning();
    return newResult;
  }

  // User Progress
  async getUserProgress(userId: string, projectId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.projectId, projectId)));
    return progress;
  }

  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserProgress(progress.userId, progress.projectId);
    if (existing) {
      const [updated] = await db.update(userProgress)
        .set({ ...progress, updatedAt: new Date() })
        .where(and(eq(userProgress.userId, progress.userId), eq(userProgress.projectId, progress.projectId)))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userProgress).values(progress).returning();
      return created;
    }
  }

  // Analytics
  async getProjectStats(projectId: string): Promise<{
    totalTools: number;
    completedTools: number;
    currentPhase: number;
    completionRate: number;
  }> {
    // Basic implementation - can be enhanced with more sophisticated logic
    const project = await this.getProject(projectId);
    return {
      totalTools: 15, // Total tools across all 5 phases
      completedTools: 0, // Would count actual completed tools
      currentPhase: project?.currentPhase || 1,
      completionRate: project?.completionRate || 0,
    };
  }

  // Canvas Drawings
  async getCanvasDrawings(projectId: string): Promise<CanvasDrawing[]> {
    return await db.select().from(canvasDrawings)
      .where(eq(canvasDrawings.projectId, projectId))
      .orderBy(desc(canvasDrawings.createdAt));
  }

  async getCanvasDrawing(id: string): Promise<CanvasDrawing | undefined> {
    const [drawing] = await db.select().from(canvasDrawings).where(eq(canvasDrawings.id, id));
    return drawing;
  }

  async createCanvasDrawing(drawing: InsertCanvasDrawing): Promise<CanvasDrawing> {
    const [newDrawing] = await db.insert(canvasDrawings).values(drawing).returning();
    return newDrawing;
  }

  async updateCanvasDrawing(id: string, drawing: Partial<InsertCanvasDrawing>): Promise<CanvasDrawing | undefined> {
    const [updatedDrawing] = await db.update(canvasDrawings)
      .set({ ...drawing, updatedAt: new Date() })
      .where(eq(canvasDrawings.id, id))
      .returning();
    return updatedDrawing;
  }

  async deleteCanvasDrawing(id: string): Promise<boolean> {
    const result = await db.delete(canvasDrawings).where(eq(canvasDrawings.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Phase Cards (Kanban)
  async getPhaseCards(projectId: string): Promise<PhaseCard[]> {
    return await db.select().from(phaseCards)
      .where(eq(phaseCards.projectId, projectId))
      .orderBy(desc(phaseCards.createdAt));
  }

  async getPhaseCard(id: string): Promise<PhaseCard | undefined> {
    const [card] = await db.select().from(phaseCards).where(eq(phaseCards.id, id));
    return card;
  }

  async createPhaseCard(card: InsertPhaseCard): Promise<PhaseCard> {
    const [newCard] = await db.insert(phaseCards).values(card).returning();
    return newCard;
  }

  async updatePhaseCard(id: string, card: Partial<InsertPhaseCard>): Promise<PhaseCard | undefined> {
    const [updatedCard] = await db.update(phaseCards)
      .set({ ...card, updatedAt: new Date() })
      .where(eq(phaseCards.id, id))
      .returning();
    return updatedCard;
  }

  async deletePhaseCard(id: string): Promise<boolean> {
    const result = await db.delete(phaseCards).where(eq(phaseCards.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).orderBy(desc(subscriptionPlans.createdAt));
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, name));
    return plan;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }

  async updateSubscriptionPlan(id: string, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [updatedPlan] = await db.update(subscriptionPlans)
      .set(plan)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updatedPlan;
  }

  async deleteSubscriptionPlan(id: string): Promise<boolean> {
    const result = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return (result.rowCount || 0) > 0;
  }

  // User Subscriptions
  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    return await db.select().from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(userSubscriptions.createdAt));
  }

  async getUserActiveSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db.select().from(userSubscriptions)
      .where(and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, 'active')
      ));
    return subscription;
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const [newSubscription] = await db.insert(userSubscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateUserSubscription(id: string, subscription: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const [updatedSubscription] = await db.update(userSubscriptions)
      .set(subscription)
      .where(eq(userSubscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  async cancelUserSubscription(id: string): Promise<boolean> {
    const result = await db.update(userSubscriptions)
      .set({ status: 'cancelled' })
      .where(eq(userSubscriptions.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Benchmarking
  async getBenchmarks(projectId: string): Promise<Benchmark[]> {
    return await db.select().from(benchmarks)
      .where(eq(benchmarks.projectId, projectId))
      .orderBy(desc(benchmarks.createdAt));
  }

  async getBenchmark(id: string): Promise<Benchmark | undefined> {
    const [benchmark] = await db.select().from(benchmarks).where(eq(benchmarks.id, id));
    return benchmark;
  }

  async createBenchmark(benchmark: InsertBenchmark): Promise<Benchmark> {
    const [newBenchmark] = await db.insert(benchmarks).values(benchmark).returning();
    return newBenchmark;
  }

  async updateBenchmark(id: string, benchmark: Partial<InsertBenchmark>): Promise<Benchmark | undefined> {
    const [updatedBenchmark] = await db.update(benchmarks)
      .set(benchmark)
      .where(eq(benchmarks.id, id))
      .returning();
    return updatedBenchmark;
  }

  async deleteBenchmark(id: string): Promise<boolean> {
    const result = await db.delete(benchmarks).where(eq(benchmarks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getBenchmarkAssessments(benchmarkId: string): Promise<BenchmarkAssessment[]> {
    return await db.select().from(benchmarkAssessments)
      .where(eq(benchmarkAssessments.benchmarkId, benchmarkId))
      .orderBy(desc(benchmarkAssessments.createdAt));
  }

  async createBenchmarkAssessment(assessment: InsertBenchmarkAssessment): Promise<BenchmarkAssessment> {
    const [newAssessment] = await db.insert(benchmarkAssessments).values(assessment).returning();
    return newAssessment;
  }

  async updateBenchmarkAssessment(id: string, assessment: Partial<InsertBenchmarkAssessment>): Promise<BenchmarkAssessment | undefined> {
    const [updatedAssessment] = await db.update(benchmarkAssessments)
      .set(assessment)
      .where(eq(benchmarkAssessments.id, id))
      .returning();
    return updatedAssessment;
  }

  async deleteBenchmarkAssessment(id: string): Promise<boolean> {
    const result = await db.delete(benchmarkAssessments).where(eq(benchmarkAssessments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // DVF Assessment - Desirability, Feasibility, Viability
  async getDvfAssessments(projectId: string): Promise<DvfAssessment[]> {
    return await db.select().from(dvfAssessments)
      .where(eq(dvfAssessments.projectId, projectId))
      .orderBy(desc(dvfAssessments.createdAt));
  }

  async getDvfAssessment(id: string): Promise<DvfAssessment | undefined> {
    const [assessment] = await db.select().from(dvfAssessments).where(eq(dvfAssessments.id, id));
    return assessment;
  }

  async createDvfAssessment(assessment: InsertDvfAssessment): Promise<DvfAssessment> {
    const [newAssessment] = await db.insert(dvfAssessments).values(assessment).returning();
    return newAssessment;
  }

  async updateDvfAssessment(id: string, assessment: Partial<InsertDvfAssessment>): Promise<DvfAssessment | undefined> {
    const [updatedAssessment] = await db.update(dvfAssessments)
      .set({ ...assessment, updatedAt: new Date() })
      .where(eq(dvfAssessments.id, id))
      .returning();
    return updatedAssessment;
  }

  async deleteDvfAssessment(id: string): Promise<boolean> {
    const result = await db.delete(dvfAssessments).where(eq(dvfAssessments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Lovability Metrics
  async getLovabilityMetrics(projectId: string): Promise<LovabilityMetric[]> {
    return await db.select().from(lovabilityMetrics)
      .where(eq(lovabilityMetrics.projectId, projectId))
      .orderBy(desc(lovabilityMetrics.createdAt));
  }

  async getLovabilityMetric(id: string): Promise<LovabilityMetric | undefined> {
    const [metric] = await db.select().from(lovabilityMetrics).where(eq(lovabilityMetrics.id, id));
    return metric;
  }

  async createLovabilityMetric(metric: InsertLovabilityMetric): Promise<LovabilityMetric> {
    const [newMetric] = await db.insert(lovabilityMetrics).values(metric).returning();
    return newMetric;
  }

  async updateLovabilityMetric(id: string, metric: Partial<InsertLovabilityMetric>): Promise<LovabilityMetric | undefined> {
    const [updatedMetric] = await db.update(lovabilityMetrics)
      .set({ ...metric, updatedAt: new Date() })
      .where(eq(lovabilityMetrics.id, id))
      .returning();
    return updatedMetric;
  }

  async deleteLovabilityMetric(id: string): Promise<boolean> {
    const result = await db.delete(lovabilityMetrics).where(eq(lovabilityMetrics.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Project Analytics
  async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics | undefined> {
    const [analytics] = await db.select().from(projectAnalytics)
      .where(eq(projectAnalytics.projectId, projectId));
    return analytics;
  }

  async createProjectAnalytics(analytics: InsertProjectAnalytics): Promise<ProjectAnalytics> {
    const [newAnalytics] = await db.insert(projectAnalytics).values(analytics).returning();
    return newAnalytics;
  }

  async updateProjectAnalytics(id: string, analytics: Partial<InsertProjectAnalytics>): Promise<ProjectAnalytics | undefined> {
    const [updatedAnalytics] = await db.update(projectAnalytics)
      .set({ ...analytics, lastUpdated: new Date() })
      .where(eq(projectAnalytics.id, id))
      .returning();
    return updatedAnalytics;
  }

  // Competitive Analysis
  async getCompetitiveAnalyses(projectId: string): Promise<CompetitiveAnalysis[]> {
    return await db.select().from(competitiveAnalysis)
      .where(eq(competitiveAnalysis.projectId, projectId))
      .orderBy(desc(competitiveAnalysis.createdAt));
  }

  async getCompetitiveAnalysis(id: string): Promise<CompetitiveAnalysis | undefined> {
    const [analysis] = await db.select().from(competitiveAnalysis).where(eq(competitiveAnalysis.id, id));
    return analysis;
  }

  async createCompetitiveAnalysis(analysis: InsertCompetitiveAnalysis): Promise<CompetitiveAnalysis> {
    const [newAnalysis] = await db.insert(competitiveAnalysis).values(analysis).returning();
    return newAnalysis;
  }

  async updateCompetitiveAnalysis(id: string, analysis: Partial<InsertCompetitiveAnalysis>): Promise<CompetitiveAnalysis | undefined> {
    const [updatedAnalysis] = await db.update(competitiveAnalysis)
      .set({ ...analysis, updatedAt: new Date() })
      .where(eq(competitiveAnalysis.id, id))
      .returning();
    return updatedAnalysis;
  }

  async deleteCompetitiveAnalysis(id: string): Promise<boolean> {
    const result = await db.delete(competitiveAnalysis).where(eq(competitiveAnalysis.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Project Backups
  async createProjectBackup(projectId: string, backupType: 'auto' | 'manual', description?: string): Promise<ProjectBackup> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get all project data
    const [empathyMapsData, personasData, interviewsData, observationsData, 
           povStatementsData, hmwQuestionsData, ideasData, prototypesData, 
           testPlansData] = await Promise.all([
      this.getEmpathyMaps(projectId),
      this.getPersonas(projectId),
      this.getInterviews(projectId),
      this.getObservations(projectId),
      this.getPovStatements(projectId),
      this.getHmwQuestions(projectId),
      this.getIdeas(projectId),
      this.getPrototypes(projectId),
      this.getTestPlans(projectId),
    ]);

    const projectSnapshot = {
      project,
      empathyMaps: empathyMapsData,
      personas: personasData,
      interviews: interviewsData,
      observations: observationsData,
      povStatements: povStatementsData,
      hmwQuestions: hmwQuestionsData,
      ideas: ideasData,
      prototypes: prototypesData,
      testPlans: testPlansData,
    };

    const totalItems = empathyMapsData.length + personasData.length + interviewsData.length + 
                      observationsData.length + povStatementsData.length + hmwQuestionsData.length +
                      ideasData.length + prototypesData.length + testPlansData.length;

    const [backup] = await db.insert(projectBackups).values({
      projectId,
      backupType,
      description,
      projectSnapshot,
      phaseSnapshot: project.currentPhase,
      completionSnapshot: project.completionRate,
      itemCount: totalItems,
    }).returning();

    return backup;
  }

  async getProjectBackups(projectId: string): Promise<ProjectBackup[]> {
    return await db.select().from(projectBackups)
      .where(eq(projectBackups.projectId, projectId))
      .orderBy(desc(projectBackups.createdAt));
  }

  async getProjectBackup(id: string): Promise<ProjectBackup | undefined> {
    const [backup] = await db.select().from(projectBackups).where(eq(projectBackups.id, id));
    return backup;
  }

  async restoreProjectBackup(backupId: string): Promise<boolean> {
    const backup = await this.getProjectBackup(backupId);
    if (!backup || !backup.projectSnapshot) {
      return false;
    }

    const snapshot = backup.projectSnapshot as any;
    const projectId = backup.projectId;

    // Delete existing project data
    await Promise.all([
      db.delete(empathyMaps).where(eq(empathyMaps.projectId, projectId)),
      db.delete(personas).where(eq(personas.projectId, projectId)),
      db.delete(interviews).where(eq(interviews.projectId, projectId)),
      db.delete(observations).where(eq(observations.projectId, projectId)),
      db.delete(povStatements).where(eq(povStatements.projectId, projectId)),
      db.delete(hmwQuestions).where(eq(hmwQuestions.projectId, projectId)),
      db.delete(ideas).where(eq(ideas.projectId, projectId)),
      db.delete(prototypes).where(eq(prototypes.projectId, projectId)),
      db.delete(testPlans).where(eq(testPlans.projectId, projectId)),
    ]);

    // Restore project data
    await this.updateProject(projectId, {
      name: snapshot.project.name,
      description: snapshot.project.description,
      status: snapshot.project.status,
      currentPhase: snapshot.project.currentPhase,
      completionRate: snapshot.project.completionRate,
    });

    // Restore all data (remove IDs to let DB generate new ones)
    if (snapshot.empathyMaps?.length > 0) {
      await db.insert(empathyMaps).values(
        snapshot.empathyMaps.map((em: any) => {
          const { id, createdAt, updatedAt, ...rest } = em;
          return rest;
        })
      );
    }
    if (snapshot.personas?.length > 0) {
      await db.insert(personas).values(
        snapshot.personas.map((p: any) => {
          const { id, createdAt, updatedAt, ...rest } = p;
          return rest;
        })
      );
    }
    if (snapshot.interviews?.length > 0) {
      await db.insert(interviews).values(
        snapshot.interviews.map((i: any) => {
          const { id, createdAt, ...rest } = i;
          return rest;
        })
      );
    }
    if (snapshot.observations?.length > 0) {
      await db.insert(observations).values(
        snapshot.observations.map((o: any) => {
          const { id, createdAt, ...rest } = o;
          return rest;
        })
      );
    }
    if (snapshot.povStatements?.length > 0) {
      await db.insert(povStatements).values(
        snapshot.povStatements.map((p: any) => {
          const { id, createdAt, ...rest } = p;
          return rest;
        })
      );
    }
    if (snapshot.hmwQuestions?.length > 0) {
      await db.insert(hmwQuestions).values(
        snapshot.hmwQuestions.map((h: any) => {
          const { id, createdAt, ...rest } = h;
          return rest;
        })
      );
    }
    if (snapshot.ideas?.length > 0) {
      await db.insert(ideas).values(
        snapshot.ideas.map((idea: any) => {
          const { id, createdAt, ...rest } = idea;
          return rest;
        })
      );
    }
    if (snapshot.prototypes?.length > 0) {
      await db.insert(prototypes).values(
        snapshot.prototypes.map((p: any) => {
          const { id, createdAt, ...rest } = p;
          return rest;
        })
      );
    }
    if (snapshot.testPlans?.length > 0) {
      await db.insert(testPlans).values(
        snapshot.testPlans.map((t: any) => {
          const { id, createdAt, ...rest } = t;
          return rest;
        })
      );
    }

    return true;
  }

  async deleteProjectBackup(id: string): Promise<boolean> {
    const result = await db.delete(projectBackups).where(eq(projectBackups.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Help Articles
  async getHelpArticles(): Promise<HelpArticle[]> {
    return await db.select().from(helpArticles).orderBy(desc(helpArticles.order), desc(helpArticles.createdAt));
  }

  async getHelpArticleBySlug(slug: string): Promise<HelpArticle | undefined> {
    const [article] = await db.select().from(helpArticles).where(eq(helpArticles.slug, slug));
    return article;
  }

  async searchHelpArticles(searchTerm: string): Promise<HelpArticle[]> {
    const lowerSearch = searchTerm.toLowerCase();
    const allArticles = await db.select().from(helpArticles);
    
    // Filter articles by title, content, tags, or keywords
    return allArticles.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(lowerSearch);
      const contentMatch = article.content.toLowerCase().includes(lowerSearch);
      const tagsMatch = article.tags && JSON.stringify(article.tags).toLowerCase().includes(lowerSearch);
      const keywordsMatch = article.searchKeywords && JSON.stringify(article.searchKeywords).toLowerCase().includes(lowerSearch);
      
      return titleMatch || contentMatch || tagsMatch || keywordsMatch;
    });
  }

  async incrementHelpArticleViews(id: string): Promise<HelpArticle | undefined> {
    const [article] = await db.select().from(helpArticles).where(eq(helpArticles.id, id));
    if (!article) return undefined;
    
    const [updated] = await db.update(helpArticles)
      .set({ viewCount: (article.viewCount || 0) + 1 })
      .where(eq(helpArticles.id, id))
      .returning();
    
    return updated;
  }

  async incrementHelpArticleHelpful(id: string): Promise<HelpArticle | undefined> {
    const [article] = await db.select().from(helpArticles).where(eq(helpArticles.id, id));
    if (!article) return undefined;
    
    const [updated] = await db.update(helpArticles)
      .set({ helpful: (article.helpful || 0) + 1 })
      .where(eq(helpArticles.id, id))
      .returning();
    
    return updated;
  }

  async createHelpArticle(article: any): Promise<HelpArticle> {
    const [newArticle] = await db.insert(helpArticles).values(article).returning();
    return newArticle;
  }

  async updateHelpArticle(id: string, article: any): Promise<HelpArticle | undefined> {
    const [updated] = await db.update(helpArticles)
      .set({ ...article, updatedAt: new Date() })
      .where(eq(helpArticles.id, id))
      .returning();
    return updated;
  }

  async deleteHelpArticle(id: string): Promise<boolean> {
    const result = await db.delete(helpArticles).where(eq(helpArticles.id, id));
    return (result.rowCount || 0) > 0;
  }
}

// Use DatabaseStorage in production, keep reference to blueprint:javascript_database integration
export const storage = new DatabaseStorage();

// Initialize default admin user and sample data
export async function initializeDefaultData() {
  try {
    // Check if admin user exists
    const adminUser = await storage.getUserByUsername('dttools.app@gmail.com');
    
    if (!adminUser) {
      // Create admin user with proper password hash
      const hashedPassword = await bcrypt.hash('Gulex0519!@', 10);
      await storage.createUser({
        username: 'dttools.app@gmail.com',
        email: 'dttools.app@gmail.com',
        name: 'DTTools Admin',
        password: hashedPassword,
        role: 'admin',
        company: 'DTTools',
        jobRole: 'Administrator',
        industry: 'Design Thinking',
        experience: 'expert',
        country: 'Brasil',
        state: 'SP',
        city: 'São Paulo'
      });
      console.log('✅ Admin user created successfully');
    }

    // Initialize subscription plans
    const existingPlans = await storage.getSubscriptionPlans();
    if (existingPlans.length === 0) {
      await storage.createSubscriptionPlan({
        name: 'Free',
        displayName: 'Plano Gratuito',
        description: 'Plan gratuito com recursos básicos',
        priceMonthly: 0,
        priceYearly: 0,
        features: ['3 projetos', 'Ferramentas básicas', 'Suporte por email'],
        maxProjects: 3,
        isActive: true
      });

      await storage.createSubscriptionPlan({
        name: 'Pro',
        displayName: 'Plano Pro',
        description: 'Plan profissional com recursos avançados',
        priceMonthly: 2990, // in cents
        priceYearly: 29900, // in cents
        features: ['Projetos ilimitados', 'Todas as ferramentas', 'Análise AI', 'Suporte prioritário'],
        maxProjects: -1, // unlimited
        isActive: true
      });

      await storage.createSubscriptionPlan({
        name: 'Enterprise',
        displayName: 'Plano Enterprise',
        description: 'Plan empresarial com recursos completos',
        priceMonthly: 9990, // in cents
        priceYearly: 99900, // in cents
        features: ['Tudo do Pro', 'Time ilimitado', 'Suporte dedicado', 'Treinamentos'],
        maxProjects: -1, // unlimited
        isActive: true
      });
      console.log('✅ Subscription plans created');
    }

    // Create sample project for admin user if no projects exist
    const adminUserFinal = await storage.getUserByUsername('dttools.app@gmail.com');
    if (adminUserFinal) {
      const existingProjects = await storage.getProjects();
      if (existingProjects.length === 0) {
        await storage.createProject({
          name: 'App de Delivery Sustentável',
          description: 'Projeto para criar um aplicativo de delivery focado em sustentabilidade e impacto social',
          currentPhase: 1,
          status: 'in_progress'
        });
        console.log('✅ Sample project created');
      }
    }

  } catch (error) {
    console.error('❌ Error initializing default data:', error);
  }
}