interface UserAction {
  action: string;
  context: Record<string, any>;
  timestamp: Date;
}

interface LearningPattern {
  pattern: string;
  confidence: number;
  frequency: number;
  lastOccurrence: Date;
}

export class AILearningEngine {
  private patterns: Map<string, LearningPattern> = new Map();
  
  constructor() {
    this.loadPatternsFromStorage();
  }
  
  private loadPatternsFromStorage() {
    try {
      const stored = localStorage.getItem("ai_learning_patterns");
      if (stored) {
        const patterns = JSON.parse(stored);
        this.patterns = new Map(Object.entries(patterns));
      }
    } catch (error) {
      console.warn("Failed to load AI learning patterns:", error);
    }
  }
  
  private savePatternsToStorage() {
    try {
      const patternsObject = Object.fromEntries(this.patterns);
      localStorage.setItem("ai_learning_patterns", JSON.stringify(patternsObject));
    } catch (error) {
      console.warn("Failed to save AI learning patterns:", error);
    }
  }
  
  public learnFromAction(action: UserAction) {
    const patternKey = this.generatePatternKey(action);
    const existing = this.patterns.get(patternKey);
    
    if (existing) {
      existing.frequency += 1;
      existing.lastOccurrence = action.timestamp;
      existing.confidence = Math.min(existing.confidence + 0.1, 1.0);
    } else {
      this.patterns.set(patternKey, {
        pattern: patternKey,
        confidence: 0.1,
        frequency: 1,
        lastOccurrence: action.timestamp,
      });
    }
    
    this.savePatternsToStorage();
  }
  
  private generatePatternKey(action: UserAction): string {
    const timeOfDay = action.timestamp.getHours();
    const dayOfWeek = action.timestamp.getDay();
    
    return `${action.action}_${dayOfWeek}_${Math.floor(timeOfDay / 6)}`;
  }
  
  public generateInsights(): Array<{
    type: string;
    title: string;
    description: string;
    confidence: number;
  }> {
    const insights = [];
    
    // Time-based patterns
    const morningActions = Array.from(this.patterns.values())
      .filter(p => p.pattern.includes("_0")) // 0-6 AM
      .sort((a, b) => b.frequency - a.frequency);
      
    if (morningActions.length > 0 && morningActions[0].frequency > 5) {
      insights.push({
        type: "pattern",
        title: "Morning Activity Pattern",
        description: `You're most productive in the morning. ${morningActions[0].frequency} actions detected in early hours.`,
        confidence: morningActions[0].confidence,
      });
    }
    
    // Frequency-based insights
    const frequentPatterns = Array.from(this.patterns.values())
      .filter(p => p.frequency > 10)
      .sort((a, b) => b.frequency - a.frequency);
      
    if (frequentPatterns.length > 0) {
      insights.push({
        type: "trend",
        title: "Workflow Optimization",
        description: `You frequently perform similar actions. Consider automating these workflows.`,
        confidence: frequentPatterns[0].confidence,
      });
    }
    
    // Risk detection based on patterns
    const recentPatterns = Array.from(this.patterns.values())
      .filter(p => Date.now() - p.lastOccurrence.getTime() < 24 * 60 * 60 * 1000);
      
    if (recentPatterns.length < 3) {
      insights.push({
        type: "risk",
        title: "Low Activity Alert",
        description: "Reduced activity detected. Consider checking project status and team engagement.",
        confidence: 0.7,
      });
    }
    
    return insights.slice(0, 5); // Return top 5 insights
  }
  
  public getRecommendations(): Array<{
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
  }> {
    const recommendations = [];
    
    // Check for common report generation times
    const reportGeneration = Array.from(this.patterns.values())
      .filter(p => p.pattern.includes("generate_report"));
      
    if (reportGeneration.length > 0) {
      const mostCommon = reportGeneration.sort((a, b) => b.frequency - a.frequency)[0];
      recommendations.push({
        title: "Automate Report Generation",
        description: "Consider setting up automated weekly reports based on your usage patterns.",
        priority: "medium" as const,
      });
    }
    
    return recommendations;
  }
}

export const aiLearning = new AILearningEngine();
