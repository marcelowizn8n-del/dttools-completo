import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Extend Request interface to include subscription info
declare module 'express-serve-static-core' {
  interface Request {
    subscription?: {
      plan: any;
      limits: {
        maxProjects: number | null;
        maxPersonasPerProject: number | null;
        maxUsersPerTeam: number | null;
        aiChatLimit: number | null;
        libraryArticlesCount: number | null;
        canCollaborate: boolean;
        canExportPDF: boolean;
        canExportPNG: boolean;
        canExportCSV: boolean;
        hasPermissionManagement: boolean;
        hasSharedWorkspace: boolean;
        hasCommentsAndFeedback: boolean;
      };
    };
  }
}

// Middleware to load user subscription and enforce limits
export async function loadUserSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.id) {
    // User not authenticated - apply free plan limits
    const freePlan = await storage.getSubscriptionPlanByName("free");
    if (freePlan) {
      req.subscription = {
        plan: freePlan,
        limits: {
          maxProjects: freePlan.maxProjects,
          maxPersonasPerProject: freePlan.maxPersonasPerProject,
          maxUsersPerTeam: freePlan.maxUsersPerTeam,
          aiChatLimit: freePlan.aiChatLimit,
          libraryArticlesCount: freePlan.libraryArticlesCount,
          canCollaborate: freePlan.hasCollaboration ?? false,
          canExportPDF: (Array.isArray(freePlan.exportFormats) ? freePlan.exportFormats.includes("pdf") : false),
          canExportPNG: (Array.isArray(freePlan.exportFormats) ? freePlan.exportFormats.includes("png") : false),
          canExportCSV: (Array.isArray(freePlan.exportFormats) ? freePlan.exportFormats.includes("csv") : false),
          hasPermissionManagement: freePlan.hasPermissionManagement ?? false,
          hasSharedWorkspace: freePlan.hasSharedWorkspace ?? false,
          hasCommentsAndFeedback: freePlan.hasCommentsAndFeedback ?? false,
        }
      };
    }
    return next();
  }

  try {
    // Get user's active subscription
    const userSubscription = await storage.getUserActiveSubscription(req.user.id);
    let plan;

    if (userSubscription) {
      plan = await storage.getSubscriptionPlan(userSubscription.planId);
    } else {
      // No active subscription - default to free plan
      plan = await storage.getSubscriptionPlanByName("free");
    }

    if (plan) {
      req.subscription = {
        plan,
        limits: {
          maxProjects: plan.maxProjects,
          maxPersonasPerProject: plan.maxPersonasPerProject,
          maxUsersPerTeam: plan.maxUsersPerTeam,
          aiChatLimit: plan.aiChatLimit,
          libraryArticlesCount: plan.libraryArticlesCount,
          canCollaborate: plan.hasCollaboration ?? false,
          canExportPDF: (Array.isArray(plan.exportFormats) ? plan.exportFormats.includes("pdf") : false),
          canExportPNG: (Array.isArray(plan.exportFormats) ? plan.exportFormats.includes("png") : false),
          canExportCSV: (Array.isArray(plan.exportFormats) ? plan.exportFormats.includes("csv") : false),
          hasPermissionManagement: plan.hasPermissionManagement ?? false,
          hasSharedWorkspace: plan.hasSharedWorkspace ?? false,
          hasCommentsAndFeedback: plan.hasCommentsAndFeedback ?? false,
        }
      };
    }

    next();
  } catch (error) {
    console.error("Error loading user subscription:", error);
    next(error);
  }
}

// Middleware to check project creation limits
export async function checkProjectLimit(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.id || !req.subscription?.limits) {
    return next();
  }

  const maxProjects = req.subscription.limits.maxProjects;
  if (maxProjects === null) {
    // Unlimited projects
    return next();
  }

  try {
    const projects = await storage.getProjects();
    const userProjects = projects.filter(p => {
      // Note: In a real app, you'd track project ownership
      // For now, we'll just count all projects for simplicity
      return true;
    });

    if (userProjects.length >= maxProjects) {
      return res.status(403).json({
        error: "Project limit reached",
        message: `Your plan allows up to ${maxProjects} projects. Upgrade to create more projects.`,
        upgrade_required: true
      });
    }

    next();
  } catch (error) {
    console.error("Error checking project limit:", error);
    next(error);
  }
}

// Middleware to check persona creation limits
export async function checkPersonaLimit(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.id || !req.subscription?.limits) {
    return next();
  }

  const maxPersonas = req.subscription.limits.maxPersonasPerProject;
  if (maxPersonas === null) {
    // Unlimited personas
    return next();
  }

  const projectId = req.params.projectId;
  if (!projectId) {
    return next();
  }

  try {
    const personas = await storage.getPersonas(projectId);

    if (personas.length >= maxPersonas) {
      return res.status(403).json({
        error: "Persona limit reached",
        message: `Your plan allows up to ${maxPersonas} personas per project. Upgrade to create more personas.`,
        upgrade_required: true
      });
    }

    next();
  } catch (error) {
    console.error("Error checking persona limit:", error);
    next(error);
  }
}

// Middleware to check AI chat limits
export async function checkAIChatLimit(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.id || !req.subscription?.limits) {
    return next();
  }

  const aiChatLimit = req.subscription.limits.aiChatLimit;
  if (aiChatLimit === null) {
    // Unlimited AI chat
    return next();
  }

  try {
    // Note: In a real app, you'd track AI chat usage per month
    // For now, we'll just proceed - implement actual tracking in production
    const currentMonthUsage = 0; // Placeholder

    if (currentMonthUsage >= aiChatLimit) {
      return res.status(403).json({
        error: "AI chat limit reached",
        message: `Your plan allows up to ${aiChatLimit} AI messages per month. Upgrade for unlimited access.`,
        upgrade_required: true
      });
    }

    next();
  } catch (error) {
    console.error("Error checking AI chat limit:", error);
    next(error);
  }
}

// Middleware to check export feature access
export function checkExportAccess(format: 'pdf' | 'png' | 'csv') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.subscription?.limits) {
      return next();
    }

    const canExport = format === 'pdf' ? req.subscription.limits.canExportPDF :
                      format === 'png' ? req.subscription.limits.canExportPNG :
                      format === 'csv' ? req.subscription.limits.canExportCSV : false;

    if (!canExport) {
      return res.status(403).json({
        error: "Export feature not available",
        message: `${format.toUpperCase()} export is not available in your current plan. Upgrade to access this feature.`,
        upgrade_required: true
      });
    }

    next();
  };
}

// Middleware to check collaboration features
export async function checkCollaborationAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.subscription?.limits) {
    return next();
  }

  if (!req.subscription.limits.canCollaborate) {
    return res.status(403).json({
      error: "Collaboration not available",
      message: "Real-time collaboration is not available in your current plan. Upgrade to Team or Enterprise plan.",
      upgrade_required: true
    });
  }

  next();
}

// Get current subscription info for frontend
export async function getSubscriptionInfo(req: Request, res: Response) {
  if (!req.user?.id) {
    const freePlan = await storage.getSubscriptionPlanByName("free");
    return res.json({
      plan: freePlan,
      limits: freePlan ? {
        maxProjects: freePlan.maxProjects,
        maxPersonasPerProject: freePlan.maxPersonasPerProject,
        maxUsersPerTeam: freePlan.maxUsersPerTeam,
        aiChatLimit: freePlan.aiChatLimit,
        libraryArticlesCount: freePlan.libraryArticlesCount,
        canCollaborate: freePlan.hasCollaboration ?? false,
        canExportPDF: (Array.isArray(freePlan.exportFormats) ? freePlan.exportFormats.includes("pdf") : false),
        canExportPNG: (Array.isArray(freePlan.exportFormats) ? freePlan.exportFormats.includes("png") : false),
        canExportCSV: (Array.isArray(freePlan.exportFormats) ? freePlan.exportFormats.includes("csv") : false),
        hasPermissionManagement: freePlan.hasPermissionManagement ?? false,
        hasSharedWorkspace: freePlan.hasSharedWorkspace ?? false,
        hasCommentsAndFeedback: freePlan.hasCommentsAndFeedback ?? false,
      } : null,
      usage: {
        projects: 0,
        aiChatThisMonth: 0,
      }
    });
  }

  try {
    const userSubscription = await storage.getUserActiveSubscription(req.user.id);
    let plan;

    if (userSubscription) {
      plan = await storage.getSubscriptionPlan(userSubscription.planId);
    } else {
      plan = await storage.getSubscriptionPlanByName("free");
    }

    // Calculate current usage
    const projects = await storage.getProjects();
    const userProjects = projects.filter(p => true); // Simplified for demo

    res.json({
      plan,
      subscription: userSubscription,
      limits: plan ? {
        maxProjects: plan.maxProjects,
        maxPersonasPerProject: plan.maxPersonasPerProject,
        maxUsersPerTeam: plan.maxUsersPerTeam,
        aiChatLimit: plan.aiChatLimit,
        libraryArticlesCount: plan.libraryArticlesCount,
        canCollaborate: plan.hasCollaboration ?? false,
        canExportPDF: (Array.isArray(plan.exportFormats) ? plan.exportFormats.includes("pdf") : false),
        canExportPNG: (Array.isArray(plan.exportFormats) ? plan.exportFormats.includes("png") : false),
        canExportCSV: (Array.isArray(plan.exportFormats) ? plan.exportFormats.includes("csv") : false),
        hasPermissionManagement: plan.hasPermissionManagement ?? false,
        hasSharedWorkspace: plan.hasSharedWorkspace ?? false,
        hasCommentsAndFeedback: plan.hasCommentsAndFeedback ?? false,
      } : null,
      usage: {
        projects: userProjects.length,
        aiChatThisMonth: 0, // Placeholder
      }
    });
  } catch (error) {
    console.error("Error getting subscription info:", error);
    res.status(500).json({ error: "Failed to get subscription info" });
  }
}