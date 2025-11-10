import pptxgen from "pptxgenjs";
import { jsPDF } from "jspdf";
import { storage } from "./storage";
import type { 
  Project, 
  EmpathyMap, 
  Persona, 
  Interview, 
  Observation, 
  PovStatement, 
  HmwQuestion, 
  Idea, 
  Prototype, 
  TestPlan, 
  TestResult 
} from "@shared/schema";

export interface PPTXExportData {
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

export class PPTXService {
  private pres: pptxgen;

  constructor() {
    this.pres = new pptxgen();
    this.setupMasterSlide();
  }

  private setupMasterSlide() {
    // Define master slide for consistent branding
    this.pres.defineSlideMaster({
      title: "DTTools_MASTER",
      background: { color: "FFFFFF" },
      objects: [
        // Header with DTTools branding
        {
          rect: {
            x: 0, y: 0, w: "100%", h: 0.75,
            fill: { color: "1E40AF" }, // DTTools blue
          }
        },
        {
          text: {
            text: "DTTools - Design Thinking",
            options: {
              x: 0.5, y: 0.1, w: 8, h: 0.5,
              color: "FFFFFF",
              fontSize: 18,
              fontFace: "Arial",
              bold: true
            }
          }
        },
        // Footer
        {
          text: {
            text: "Gerado pelo DTTools • dttools.app",
            options: {
              x: 0.5, y: 6.8, w: 9, h: 0.3,
              color: "666666",
              fontSize: 10,
              fontFace: "Arial",
              align: "center"
            }
          }
        }
      ]
    });
  }

  private addTitleSlide(projectName: string, description: string = "") {
    const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
    
    slide.addText(projectName, {
      x: 1, y: 2, w: 8, h: 1.5,
      fontSize: 36,
      bold: true,
      color: "1E40AF",
      align: "center"
    });

    if (description) {
      slide.addText(description, {
        x: 1, y: 3.5, w: 8, h: 1,
        fontSize: 16,
        color: "333333",
        align: "center"
      });
    }

    slide.addText("Processo de Design Thinking", {
      x: 1, y: 4.5, w: 8, h: 0.8,
      fontSize: 14,
      color: "666666",
      align: "center",
      italic: true
    });

    // Add 5 phases overview
    const phases = ["Empatizar", "Definir", "Idear", "Prototipar", "Testar"];
    phases.forEach((phase, index) => {
      slide.addText(`${index + 1}. ${phase}`, {
        x: 1 + (index * 1.6), y: 5.5, w: 1.5, h: 0.5,
        fontSize: 12,
        color: "1E40AF",
        align: "center",
        bold: true
      });
    });
  }

  private addPhaseOverviewSlide(phase: number, title: string, description: string) {
    const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
    
    slide.addText(`Fase ${phase}: ${title}`, {
      x: 1, y: 1.2, w: 8, h: 1,
      fontSize: 28,
      bold: true,
      color: "1E40AF"
    });

    slide.addText(description, {
      x: 1, y: 2.5, w: 8, h: 1.5,
      fontSize: 16,
      color: "333333"
    });
  }

  private addEmpathyMapSlide(empathyMap: EmpathyMap) {
    const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
    
    slide.addText(`Mapa de Empatia: ${empathyMap.title}`, {
      x: 1, y: 1.2, w: 8, h: 0.8,
      fontSize: 24,
      bold: true,
      color: "1E40AF"
    });

    // Create empathy map quadrants
    const quadrants = [
      { title: "DIZ", data: empathyMap.says as string[], x: 1, y: 2.2, color: "E8F4FA" },
      { title: "PENSA", data: empathyMap.thinks as string[], x: 5, y: 2.2, color: "E2E6ED" },
      { title: "FAZ", data: empathyMap.does as string[], x: 1, y: 4.7, color: "FFFBEB" },
      { title: "SENTE", data: empathyMap.feels as string[], x: 5, y: 4.7, color: "FFF2EC" }
    ];

    quadrants.forEach(quadrant => {
      // Add quadrant background
      slide.addShape("rect", {
        x: quadrant.x, y: quadrant.y, w: 3.5, h: 2.2,
        fill: { color: quadrant.color },
        line: { color: "CCCCCC", width: 1 }
      });

      // Add quadrant title
      slide.addText(quadrant.title, {
        x: quadrant.x, y: quadrant.y + 0.1, w: 3.5, h: 0.4,
        fontSize: 14,
        bold: true,
        color: "333333",
        align: "center"
      });

      // Add quadrant items
      const items = quadrant.data.slice(0, 3); // Limit to 3 items per quadrant
      items.forEach((item, index) => {
        slide.addText(`• ${item}`, {
          x: quadrant.x + 0.2, y: quadrant.y + 0.6 + (index * 0.4), w: 3.1, h: 0.3,
          fontSize: 11,
          color: "333333"
        });
      });
    });
  }

  private addPersonasSlide(personas: Persona[]) {
    const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
    
    slide.addText("Personas do Projeto", {
      x: 1, y: 1.2, w: 8, h: 0.8,
      fontSize: 24,
      bold: true,
      color: "1E40AF"
    });

    personas.slice(0, 2).forEach((persona, index) => {
      const xPos = index === 0 ? 1 : 5;
      
      // Persona card background
      slide.addShape("rect", {
        x: xPos, y: 2.2, w: 3.5, h: 4,
        fill: { color: "F8F9FA" },
        line: { color: "CCCCCC", width: 1 }
      });

      // Persona name and details
      slide.addText(persona.name, {
        x: xPos + 0.2, y: 2.4, w: 3.1, h: 0.5,
        fontSize: 16,
        bold: true,
        color: "1E40AF"
      });

      slide.addText(`${persona.age} anos • ${persona.occupation}`, {
        x: xPos + 0.2, y: 2.9, w: 3.1, h: 0.3,
        fontSize: 12,
        color: "666666"
      });

      if (persona.bio) {
        slide.addText(persona.bio.slice(0, 150) + "...", {
          x: xPos + 0.2, y: 3.3, w: 3.1, h: 1,
          fontSize: 10,
          color: "333333"
        });
      }

      // Goals
      if (persona.goals && Array.isArray(persona.goals) && persona.goals.length > 0) {
        slide.addText("Objetivos:", {
          x: xPos + 0.2, y: 4.5, w: 3.1, h: 0.3,
          fontSize: 11,
          bold: true,
          color: "1E40AF"
        });

        (persona.goals as string[]).slice(0, 2).forEach((goal, goalIndex) => {
          slide.addText(`• ${goal}`, {
            x: xPos + 0.2, y: 4.8 + (goalIndex * 0.3), w: 3.1, h: 0.25,
            fontSize: 9,
            color: "333333"
          });
        });
      }
    });
  }

  private addIdeasSlide(ideas: Idea[]) {
    const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
    
    slide.addText("Ideias Geradas", {
      x: 1, y: 1.2, w: 8, h: 0.8,
      fontSize: 24,
      bold: true,
      color: "1E40AF"
    });

    // Sort ideas by DVF score (highest first)
    const sortedIdeas = ideas.sort((a, b) => (b.dvfScore || 0) - (a.dvfScore || 0)).slice(0, 5);

    sortedIdeas.forEach((idea, index) => {
      const yPos = 2.2 + (index * 0.9);
      
      // Idea background
      slide.addShape("rect", {
        x: 1, y: yPos, w: 8, h: 0.8,
        fill: { color: index < 3 ? "E8F5E8" : "F8F9FA" },
        line: { color: "CCCCCC", width: 1 }
      });

      // Idea title
      slide.addText(idea.title, {
        x: 1.2, y: yPos + 0.1, w: 5, h: 0.3,
        fontSize: 12,
        bold: true,
        color: "1E40AF"
      });

      // DVF Score
      if (idea.dvfScore) {
        slide.addText(`DVF: ${idea.dvfScore.toFixed(1)}/5`, {
          x: 6.5, y: yPos + 0.1, w: 1.5, h: 0.3,
          fontSize: 11,
          bold: true,
          color: idea.dvfScore >= 3.5 ? "22C55E" : idea.dvfScore >= 2.5 ? "F59E0B" : "EF4444"
        });
      }

      // Action decision
      if (idea.actionDecision && idea.actionDecision !== "evaluate") {
        const actionColors = {
          love_it: "22C55E",
          change_it: "F59E0B", 
          leave_it: "EF4444"
        };
        const actionTexts = {
          love_it: "💚 AMAR",
          change_it: "🔄 MUDAR",
          leave_it: "❌ DEIXAR"
        };

        slide.addText(actionTexts[idea.actionDecision as keyof typeof actionTexts] || "", {
          x: 8, y: yPos + 0.1, w: 1, h: 0.3,
          fontSize: 10,
          bold: true,
          color: actionColors[idea.actionDecision as keyof typeof actionColors] || "666666"
        });
      }

      // Description
      slide.addText(idea.description.slice(0, 80) + "...", {
        x: 1.2, y: yPos + 0.4, w: 6.6, h: 0.3,
        fontSize: 10,
        color: "333333"
      });
    });
  }

  private addDVFAnalysisSlide(ideas: Idea[]) {
    const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
    
    slide.addText("Análise DVF - Benchmarking", {
      x: 1, y: 1.2, w: 8, h: 0.8,
      fontSize: 24,
      bold: true,
      color: "1E40AF"
    });

    // Calculate averages
    const validIdeas = ideas.filter(idea => idea.dvfScore);
    if (validIdeas.length === 0) return;

    const avgDesirability = validIdeas.reduce((sum, idea) => sum + (idea.desirability || 0), 0) / validIdeas.length;
    const avgViability = validIdeas.reduce((sum, idea) => sum + (idea.viability || 0), 0) / validIdeas.length;
    const avgFeasibility = validIdeas.reduce((sum, idea) => sum + (idea.feasibility || 0), 0) / validIdeas.length;
    const avgDVF = validIdeas.reduce((sum, idea) => sum + (idea.dvfScore || 0), 0) / validIdeas.length;

    // DVF Metrics
    const metrics = [
      { label: "Desejabilidade", value: avgDesirability, color: "22C55E" },
      { label: "Viabilidade", value: avgViability, color: "3B82F6" },
      { label: "Exequibilidade", value: avgFeasibility, color: "8B5CF6" }
    ];

    slide.addText("Métricas Médias do Projeto:", {
      x: 1, y: 2.2, w: 8, h: 0.5,
      fontSize: 16,
      bold: true,
      color: "333333"
    });

    metrics.forEach((metric, index) => {
      const yPos = 2.8 + (index * 0.8);
      
      // Metric label
      slide.addText(metric.label, {
        x: 1, y: yPos, w: 2, h: 0.4,
        fontSize: 14,
        color: "333333"
      });

      // Progress bar background
      slide.addShape("rect", {
        x: 3.5, y: yPos + 0.05, w: 4, h: 0.3,
        fill: { color: "E5E7EB" },
        line: { color: "D1D5DB", width: 1 }
      });

      // Progress bar fill
      slide.addShape("rect", {
        x: 3.5, y: yPos + 0.05, w: (metric.value / 5) * 4, h: 0.3,
        fill: { color: metric.color },
        line: { width: 0 }
      });

      // Score text
      slide.addText(`${metric.value.toFixed(1)}/5`, {
        x: 7.8, y: yPos, w: 1, h: 0.4,
        fontSize: 12,
        bold: true,
        color: metric.color
      });
    });

    // Overall DVF Score
    slide.addText("Pontuação DVF Geral:", {
      x: 1, y: 5.5, w: 3, h: 0.5,
      fontSize: 16,
      bold: true,
      color: "1E40AF"
    });

    slide.addText(`${avgDVF.toFixed(1)}/5`, {
      x: 4, y: 5.5, w: 1.5, h: 0.5,
      fontSize: 24,
      bold: true,
      color: avgDVF >= 3.5 ? "22C55E" : avgDVF >= 2.5 ? "F59E0B" : "EF4444"
    });

    // Industry comparison (mock data for demo)
    slide.addText("vs. Média da Indústria: 3.2/5", {
      x: 6, y: 5.5, w: 2.5, h: 0.5,
      fontSize: 12,
      color: "666666"
    });
  }

  private addSummarySlide(project: Project, data: any) {
    const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
    
    slide.addText("Resumo do Projeto", {
      x: 1, y: 1.2, w: 8, h: 0.8,
      fontSize: 28,
      bold: true,
      color: "1E40AF"
    });

    slide.addText(project.name, {
      x: 1, y: 2, w: 8, h: 0.5,
      fontSize: 20,
      bold: true,
      color: "333333"
    });

    if (project.description) {
      slide.addText(project.description, {
        x: 1, y: 2.6, w: 8, h: 0.6,
        fontSize: 12,
        color: "666666"
      });
    }

    // Project metrics in a nice layout
    const metrics = [
      { label: "Fase Atual", value: `${project.currentPhase}/5` },
      { label: "Progresso", value: `${project.completionRate || 0}%` },
      { label: "Mapas de Empatia", value: data.empathyMaps.length.toString() },
      { label: "Personas", value: data.personas.length.toString() },
      { label: "Entrevistas", value: data.interviews.length.toString() },
      { label: "Ideias", value: data.ideas.length.toString() },
      { label: "Protótipos", value: data.prototypes.length.toString() },
      { label: "Testes", value: data.testResults.length.toString() }
    ];

    // Create metrics grid
    metrics.forEach((metric, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const xPos = 1 + (col * 2);
      const yPos = 3.5 + (row * 0.8);

      // Metric box
      slide.addShape("rect", {
        x: xPos, y: yPos, w: 1.8, h: 0.6,
        fill: { color: "F8F9FA" },
        line: { color: "E5E7EB", width: 1 }
      });

      // Metric value (large)
      slide.addText(metric.value, {
        x: xPos + 0.1, y: yPos + 0.05, w: 1.6, h: 0.3,
        fontSize: 16,
        bold: true,
        color: "1E40AF",
        align: "center"
      });

      // Metric label (small)
      slide.addText(metric.label, {
        x: xPos + 0.1, y: yPos + 0.35, w: 1.6, h: 0.2,
        fontSize: 8,
        color: "666666",
        align: "center"
      });
    });

    // DVF Analysis if available
    if (data.ideas.length > 0) {
      const validIdeas = data.ideas.filter((idea: any) => idea.dvfScore);
      if (validIdeas.length > 0) {
        const avgDVF = validIdeas.reduce((sum: number, idea: any) => sum + (idea.dvfScore || 0), 0) / validIdeas.length;
        
        slide.addText("Análise DVF Geral:", {
          x: 1, y: 5.5, w: 3, h: 0.4,
          fontSize: 14,
          bold: true,
          color: "1E40AF"
        });

        slide.addText(`${avgDVF.toFixed(1)}/5`, {
          x: 4, y: 5.5, w: 1.5, h: 0.4,
          fontSize: 20,
          bold: true,
          color: avgDVF >= 3.5 ? "22C55E" : avgDVF >= 2.5 ? "F59E0B" : "EF4444"
        });

        slide.addText("vs. Média da Indústria: 3.2/5", {
          x: 6, y: 5.5, w: 2.5, h: 0.4,
          fontSize: 11,
          color: "666666"
        });
      }
    }

    // Date and time
    slide.addText(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, {
      x: 1, y: 6.2, w: 8, h: 0.3,
      fontSize: 10,
      color: "999999",
      italic: true
    });
  }

  private addFinalControlsSlide() {
    const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
    
    slide.addText("Apresentação Concluída", {
      x: 1, y: 2, w: 8, h: 1,
      fontSize: 32,
      bold: true,
      color: "1E40AF",
      align: "center"
    });

    slide.addText("Parabéns! Você completou sua jornada de Design Thinking.", {
      x: 1, y: 3, w: 8, h: 0.6,
      fontSize: 16,
      color: "333333",
      align: "center"
    });

    slide.addText("Use os controles abaixo para salvar ou fechar esta apresentação:", {
      x: 1, y: 3.8, w: 8, h: 0.4,
      fontSize: 12,
      color: "666666",
      align: "center"
    });

    // Save button
    slide.addShape("rect", {
      x: 2.5, y: 4.5, w: 2, h: 0.8,
      fill: { color: "22C55E" },
      line: { width: 0 }
    });

    slide.addText("💾 SALVAR", {
      x: 2.5, y: 4.7, w: 2, h: 0.4,
      fontSize: 14,
      bold: true,
      color: "FFFFFF",
      align: "center"
    });

    slide.addText("Baixar apresentação", {
      x: 2.5, y: 5, w: 2, h: 0.3,
      fontSize: 10,
      color: "FFFFFF",
      align: "center"
    });

    // Close button
    slide.addShape("rect", {
      x: 5.5, y: 4.5, w: 2, h: 0.8,
      fill: { color: "EF4444" },
      line: { width: 0 }
    });

    slide.addText("✖️ FECHAR", {
      x: 5.5, y: 4.7, w: 2, h: 0.4,
      fontSize: 14,
      bold: true,
      color: "FFFFFF",
      align: "center"
    });

    slide.addText("Sair da apresentação", {
      x: 5.5, y: 5, w: 2, h: 0.3,
      fontSize: 10,
      color: "FFFFFF",
      align: "center"
    });

    // Instructions
    slide.addText("💡 Dica: Para usar os controles, clique nos botões durante a apresentação ou use as teclas de atalho.", {
      x: 1, y: 5.8, w: 8, h: 0.4,
      fontSize: 10,
      color: "666666",
      align: "center",
      italic: true
    });

    // Footer with next steps
    slide.addText("Próximos Passos:", {
      x: 1, y: 6.4, w: 8, h: 0.3,
      fontSize: 12,
      bold: true,
      color: "1E40AF",
      align: "center"
    });

    slide.addText("• Continue iterando suas ideias • Implemente os protótipos • Colete mais feedback dos usuários", {
      x: 1, y: 6.7, w: 8, h: 0.3,
      fontSize: 10,
      color: "333333",
      align: "center"
    });
  }

  async generateProjectPPTX(projectId: string): Promise<Buffer> {
    try {
      // Fetch all project data
      const project = await storage.getProject(projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      const empathyMaps = await storage.getEmpathyMaps(projectId);
      const personas = await storage.getPersonas(projectId);
      const interviews = await storage.getInterviews(projectId);
      const observations = await storage.getObservations(projectId);
      const povStatements = await storage.getPovStatements(projectId);
      const hmwQuestions = await storage.getHmwQuestions(projectId);
      const ideas = await storage.getIdeas(projectId);
      const prototypes = await storage.getPrototypes(projectId);
      const testPlans = await storage.getTestPlans(projectId);
      const testResults = await storage.getTestResults(projectId);

      // Build presentation
      this.addTitleSlide(project.name, project.description || "");

      // Phase 1: Empathize
      if (empathyMaps.length > 0 || personas.length > 0) {
        this.addPhaseOverviewSlide(1, "Empatizar", "Compreenda profundamente seus usuários através de pesquisas, entrevistas e observações.");
        
        empathyMaps.forEach(empathyMap => {
          this.addEmpathyMapSlide(empathyMap);
        });

        if (personas.length > 0) {
          this.addPersonasSlide(personas);
        }

        // Add interviews slide if any
        if (interviews.length > 0) {
          const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
          slide.addText("Entrevistas Realizadas", {
            x: 1, y: 1.2, w: 8, h: 0.8,
            fontSize: 24,
            bold: true,
            color: "1E40AF"
          });

          interviews.slice(0, 3).forEach((interview, index) => {
            const yPos = 2.2 + (index * 1.5);
            
            slide.addText(`${index + 1}. ${interview.participantName}`, {
              x: 1, y: yPos, w: 8, h: 0.4,
              fontSize: 14,
              bold: true,
              color: "1E40AF"
            });

            slide.addText(`Duração: ${interview.duration || 'N/A'} min`, {
              x: 1, y: yPos + 0.4, w: 8, h: 0.3,
              fontSize: 11,
              color: "666666"
            });

            if (interview.insights) {
              slide.addText(`Insights: ${interview.insights.slice(0, 100)}...`, {
                x: 1, y: yPos + 0.7, w: 8, h: 0.6,
                fontSize: 10,
                color: "333333"
              });
            }
          });
        }

        // Add observations slide if any
        if (observations.length > 0) {
          const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
          slide.addText("Observações de Campo", {
            x: 1, y: 1.2, w: 8, h: 0.8,
            fontSize: 24,
            bold: true,
            color: "1E40AF"
          });

          observations.slice(0, 4).forEach((observation, index) => {
            const yPos = 2.2 + (index * 1.2);
            
            slide.addText(`${index + 1}. ${observation.location}`, {
              x: 1, y: yPos, w: 8, h: 0.4,
              fontSize: 14,
              bold: true,
              color: "1E40AF"
            });

            if (observation.behavior) {
              slide.addText(`Comportamento: ${observation.behavior.slice(0, 120)}...`, {
                x: 1, y: yPos + 0.4, w: 8, h: 0.6,
                fontSize: 10,
                color: "333333"
              });
            }
          });
        }
      }

      // Phase 2: Define
      if (povStatements.length > 0 || hmwQuestions.length > 0) {
        this.addPhaseOverviewSlide(2, "Definir", "Defina claramente o problema e crie declarações de ponto de vista focadas.");
        
        // Add POV statements slide
        if (povStatements.length > 0) {
          const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
          slide.addText("Declarações POV", {
            x: 1, y: 1.2, w: 8, h: 0.8,
            fontSize: 24,
            bold: true,
            color: "1E40AF"
          });

          povStatements.slice(0, 3).forEach((pov, index) => {
            const yPos = 2.2 + (index * 1.5);
            slide.addText(pov.statement, {
              x: 1, y: yPos, w: 8, h: 1,
              fontSize: 12,
              color: "333333"
            });
          });
        }

        // Add HMW questions slide
        if (hmwQuestions.length > 0) {
          const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
          slide.addText("Como Podemos (HMW)", {
            x: 1, y: 1.2, w: 8, h: 0.8,
            fontSize: 24,
            bold: true,
            color: "1E40AF"
          });

          hmwQuestions.slice(0, 5).forEach((hmw, index) => {
            const yPos = 2.2 + (index * 0.9);
            slide.addText(`${index + 1}. ${hmw.question}`, {
              x: 1, y: yPos, w: 8, h: 0.8,
              fontSize: 12,
              color: "333333"
            });
          });
        }
      }

      // Phase 3: Ideate
      if (ideas.length > 0) {
        this.addPhaseOverviewSlide(3, "Idear", "Gere uma ampla gama de ideias criativas através de brainstorming estruturado.");
        this.addIdeasSlide(ideas);
        this.addDVFAnalysisSlide(ideas);
      }

      // Phase 4: Prototype
      if (prototypes.length > 0) {
        this.addPhaseOverviewSlide(4, "Prototipar", "Construa protótipos rápidos e baratos para testar suas melhores ideias.");
        
        const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
        slide.addText("Protótipos Criados", {
          x: 1, y: 1.2, w: 8, h: 0.8,
          fontSize: 24,
          bold: true,
          color: "1E40AF"
        });

        prototypes.slice(0, 3).forEach((prototype, index) => {
          const yPos = 2.2 + (index * 1.2);
          slide.addText(`${prototype.name} (${prototype.type})`, {
            x: 1, y: yPos, w: 8, h: 0.4,
            fontSize: 14,
            bold: true,
            color: "1E40AF"
          });
          
          if (prototype.description) {
            slide.addText(prototype.description.slice(0, 100) + "...", {
              x: 1, y: yPos + 0.4, w: 8, h: 0.6,
              fontSize: 11,
              color: "333333"
            });
          }
        });
      }

      // Phase 5: Test
      if (testPlans.length > 0 || testResults.length > 0) {
        this.addPhaseOverviewSlide(5, "Testar", "Teste seus protótipos com usuários reais e colete feedback valioso.");
        
        if (testResults.length > 0) {
          const slide = this.pres.addSlide({ masterName: "DTTools_MASTER" });
          slide.addText("Resultados dos Testes", {
            x: 1, y: 1.2, w: 8, h: 0.8,
            fontSize: 24,
            bold: true,
            color: "1E40AF"
          });

          testResults.slice(0, 2).forEach((result, index) => {
            const yPos = 2.2 + (index * 2);
            slide.addText(`Teste ID: ${result.participantId}`, {
              x: 1, y: yPos, w: 8, h: 0.4,
              fontSize: 14,
              bold: true,
              color: "1E40AF"
            });

            if (result.insights) {
              slide.addText(result.insights.slice(0, 150) + "...", {
                x: 1, y: yPos + 0.5, w: 8, h: 1,
                fontSize: 11,
                color: "333333"
              });
            }
          });
        }
      }

      // Add summary and final slide
      this.addSummarySlide(project, {
        empathyMaps,
        personas,
        interviews,
        observations,
        povStatements,
        hmwQuestions,
        ideas,
        prototypes,
        testPlans,
        testResults
      });
      
      this.addFinalControlsSlide();

      // Generate buffer
      const buffer = await this.pres.write({ outputType: "nodebuffer" }) as Buffer;
      return buffer;

    } catch (error) {
      console.error("Error generating PPTX:", error);
      throw new Error("Failed to generate PPTX presentation");
    }
  }

  async generateProjectPDF(projectId: string): Promise<Buffer> {
    try {
      // Fetch all project data
      const project = await storage.getProject(projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      const empathyMaps = await storage.getEmpathyMaps(projectId);
      const personas = await storage.getPersonas(projectId);
      const interviews = await storage.getInterviews(projectId);
      const observations = await storage.getObservations(projectId);
      const povStatements = await storage.getPovStatements(projectId);
      const hmwQuestions = await storage.getHmwQuestions(projectId);
      const ideas = await storage.getIdeas(projectId);
      const prototypes = await storage.getPrototypes(projectId);
      const testPlans = await storage.getTestPlans(projectId);
      const testResults = await storage.getTestResults(projectId);

      // Create PDF document
      const doc = new jsPDF();
      let yPosition = 20;

      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }
        
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        const lines = doc.splitTextToSize(text, 170);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * (fontSize / 2.5) + 5;
      };

      const addSectionHeader = (title: string) => {
        yPosition += 10;
        addText(title, 16, true);
        yPosition += 5;
      };

      // Title page
      doc.setFillColor(30, 64, 175); // DTTools blue
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("DTTools - Design Thinking", 105, 20, { align: "center" });
      
      doc.setFontSize(18);
      doc.text(project.name, 105, 30, { align: "center" });

      doc.setTextColor(0, 0, 0);
      yPosition = 60;

      if (project.description) {
        addText(`Descrição: ${project.description}`, 14);
      }

      addText(`Data de criação: ${project.createdAt ? new Date(project.createdAt).toLocaleDateString('pt-BR') : 'N/A'}`, 12);
      addText(`Fase atual: ${project.currentPhase}/5`, 12);
      addText(`Progresso: ${project.completionRate || 0}%`, 12);

      // Phase 1: Empathize
      if (empathyMaps.length > 0 || personas.length > 0 || interviews.length > 0) {
        addSectionHeader("FASE 1: EMPATIZAR");
        addText("Compreenda profundamente seus usuários através de pesquisas, entrevistas e observações.");

        // Empathy Maps
        if (empathyMaps.length > 0) {
          addText("Mapas de Empatia:", 14, true);
          empathyMaps.forEach((empathyMap, index) => {
            addText(`${index + 1}. ${empathyMap.title}`, 12, true);
            
            if (empathyMap.says && Array.isArray(empathyMap.says)) {
              addText(`Diz: ${(empathyMap.says as string[]).join(", ")}`, 10);
            }
            if (empathyMap.thinks && Array.isArray(empathyMap.thinks)) {
              addText(`Pensa: ${(empathyMap.thinks as string[]).join(", ")}`, 10);
            }
            if (empathyMap.does && Array.isArray(empathyMap.does)) {
              addText(`Faz: ${(empathyMap.does as string[]).join(", ")}`, 10);
            }
            if (empathyMap.feels && Array.isArray(empathyMap.feels)) {
              addText(`Sente: ${(empathyMap.feels as string[]).join(", ")}`, 10);
            }
            yPosition += 5;
          });
        }

        // Personas
        if (personas.length > 0) {
          addText("Personas:", 14, true);
          personas.forEach((persona, index) => {
            addText(`${index + 1}. ${persona.name}`, 12, true);
            addText(`${persona.age} anos • ${persona.occupation}`, 10);
            if (persona.bio) {
              addText(`Bio: ${persona.bio}`, 10);
            }
            if (persona.goals && Array.isArray(persona.goals)) {
              addText(`Objetivos: ${(persona.goals as string[]).join(", ")}`, 10);
            }
            yPosition += 5;
          });
        }

        // Interviews
        if (interviews.length > 0) {
          addText("Entrevistas:", 14, true);
          interviews.forEach((interview, index) => {
            addText(`${index + 1}. ${interview.participantName}`, 12, true);
            if (interview.insights) {
              addText(`Insights: ${interview.insights}`, 10);
            }
          });
        }
      }

      // Phase 2: Define
      if (povStatements.length > 0 || hmwQuestions.length > 0) {
        addSectionHeader("FASE 2: DEFINIR");
        addText("Defina claramente o problema e crie declarações de ponto de vista focadas.");

        if (povStatements.length > 0) {
          addText("Declarações POV:", 14, true);
          povStatements.forEach((pov, index) => {
            addText(`${index + 1}. ${pov.statement}`, 10);
          });
        }

        if (hmwQuestions.length > 0) {
          addText("Como Podemos (HMW):", 14, true);
          hmwQuestions.forEach((hmw, index) => {
            addText(`${index + 1}. ${hmw.question}`, 10);
          });
        }
      }

      // Phase 3: Ideate
      if (ideas.length > 0) {
        addSectionHeader("FASE 3: IDEAR");
        addText("Gere uma ampla gama de ideias criativas através de brainstorming estruturado.");

        // Sort ideas by DVF score
        const sortedIdeas = ideas.sort((a, b) => (b.dvfScore || 0) - (a.dvfScore || 0));

        addText("Ideias Geradas:", 14, true);
        sortedIdeas.forEach((idea, index) => {
          addText(`${index + 1}. ${idea.title}`, 12, true);
          addText(`Descrição: ${idea.description}`, 10);
          
          if (idea.dvfScore) {
            addText(`Pontuação DVF: ${idea.dvfScore.toFixed(1)}/5`, 10);
            addText(`- Desejabilidade: ${idea.desirability || 0}/5`, 9);
            addText(`- Viabilidade: ${idea.viability || 0}/5`, 9);
            addText(`- Exequibilidade: ${idea.feasibility || 0}/5`, 9);
          }

          if (idea.actionDecision && idea.actionDecision !== "evaluate") {
            const actionTexts = {
              love_it: "💚 AMAR",
              change_it: "🔄 MUDAR",
              leave_it: "❌ DEIXAR"
            };
            addText(`Decisão: ${actionTexts[idea.actionDecision as keyof typeof actionTexts] || idea.actionDecision}`, 10);
          }
          yPosition += 5;
        });

        // DVF Analysis
        const validIdeas = ideas.filter(idea => idea.dvfScore);
        if (validIdeas.length > 0) {
          addText("Análise DVF - Métricas do Projeto:", 14, true);
          
          const avgDesirability = validIdeas.reduce((sum, idea) => sum + (idea.desirability || 0), 0) / validIdeas.length;
          const avgViability = validIdeas.reduce((sum, idea) => sum + (idea.viability || 0), 0) / validIdeas.length;
          const avgFeasibility = validIdeas.reduce((sum, idea) => sum + (idea.feasibility || 0), 0) / validIdeas.length;
          const avgDVF = validIdeas.reduce((sum, idea) => sum + (idea.dvfScore || 0), 0) / validIdeas.length;

          addText(`Desejabilidade Média: ${avgDesirability.toFixed(1)}/5`, 12);
          addText(`Viabilidade Média: ${avgViability.toFixed(1)}/5`, 12);
          addText(`Exequibilidade Média: ${avgFeasibility.toFixed(1)}/5`, 12);
          addText(`Pontuação DVF Geral: ${avgDVF.toFixed(1)}/5`, 12, true);
          addText(`vs. Média da Indústria: 3.2/5`, 10);
        }
      }

      // Phase 4: Prototype
      if (prototypes.length > 0) {
        addSectionHeader("FASE 4: PROTOTIPAR");
        addText("Construa protótipos rápidos e baratos para testar suas melhores ideias.");

        addText("Protótipos Criados:", 14, true);
        prototypes.forEach((prototype, index) => {
          addText(`${index + 1}. ${prototype.name} (${prototype.type})`, 12, true);
          if (prototype.description) {
            addText(`Descrição: ${prototype.description}`, 10);
          }
          if (prototype.materials) {
            addText(`Materiais: ${prototype.materials}`, 10);
          }
          yPosition += 5;
        });
      }

      // Phase 5: Test
      if (testPlans.length > 0 || testResults.length > 0) {
        addSectionHeader("FASE 5: TESTAR");
        addText("Teste seus protótipos com usuários reais e colete feedback valioso.");

        if (testPlans.length > 0) {
          addText("Planos de Teste:", 14, true);
          testPlans.forEach((plan, index) => {
            addText(`${index + 1}. ${plan.objective}`, 12, true);
            if (plan.methodology) {
              addText(`Metodologia: ${plan.methodology}`, 10);
            }
          });
        }

        if (testResults.length > 0) {
          addText("Resultados dos Testes:", 14, true);
          testResults.forEach((result, index) => {
            addText(`${index + 1}. Participante: ${result.participantId}`, 12, true);
            if (result.insights) {
              addText(`Insights: ${result.insights}`, 10);
            }
            if (result.feedback) {
              addText(`Feedback: ${result.feedback}`, 10);
            }
          });
        }
      }

      // Footer
      yPosition += 20;
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setTextColor(100, 100, 100);
      addText("Gerado pelo DTTools • dttools.app", 10);
      addText(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 10);

      // Convert to buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      return pdfBuffer;

    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF document");
    }
  }

  async generateProjectMarkdown(projectId: string): Promise<string> {
    try {
      // Fetch all project data
      const project = await storage.getProject(projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      const empathyMaps = await storage.getEmpathyMaps(projectId);
      const personas = await storage.getPersonas(projectId);
      const interviews = await storage.getInterviews(projectId);
      const observations = await storage.getObservations(projectId);
      const povStatements = await storage.getPovStatements(projectId);
      const hmwQuestions = await storage.getHmwQuestions(projectId);
      const ideas = await storage.getIdeas(projectId);
      const prototypes = await storage.getPrototypes(projectId);
      const testPlans = await storage.getTestPlans(projectId);
      const testResults = await storage.getTestResults(projectId);

      let markdown = "";

      // Title and Header
      markdown += `# ${project.name}\n\n`;
      markdown += `> **Projeto de Design Thinking**  \n`;
      markdown += `> Gerado pelo [DTTools](https://dttools.app) • ${new Date().toLocaleDateString('pt-BR')}\n\n`;
      
      markdown += `---\n\n`;

      // Project overview
      markdown += `## 📋 Visão Geral do Projeto\n\n`;
      markdown += `**Descrição:** ${project.description}\n\n`;
      markdown += `**Status:** ${project.status}\n\n`;
      markdown += `**Fase atual:** ${project.currentPhase}\n\n`;
      markdown += `**Taxa de conclusão:** ${project.completionRate}%\n\n`;

      markdown += `---\n\n`;

      // Phase 1: Empatizar
      markdown += `## 🤝 Fase 1: Empatizar\n\n`;

      if (empathyMaps.length > 0) {
        markdown += `### 🗺️ Mapas de Empatia\n\n`;
        empathyMaps.forEach((map, index) => {
          markdown += `#### ${index + 1}. ${map.title}\n\n`;
          markdown += `**O que diz:**\n`;
          if (Array.isArray(map.says)) {
            map.says.forEach(item => markdown += `- ${item}\n`);
          }
          markdown += `\n**O que pensa:**\n`;
          if (Array.isArray(map.thinks)) {
            map.thinks.forEach(item => markdown += `- ${item}\n`);
          }
          markdown += `\n**O que faz:**\n`;
          if (Array.isArray(map.does)) {
            map.does.forEach(item => markdown += `- ${item}\n`);
          }
          markdown += `\n**O que sente:**\n`;
          if (Array.isArray(map.feels)) {
            map.feels.forEach(item => markdown += `- ${item}\n`);
          }
          markdown += `\n`;
        });
      }

      if (personas.length > 0) {
        markdown += `### 👤 Personas\n\n`;
        personas.forEach((persona, index) => {
          markdown += `#### ${index + 1}. ${persona.name}\n\n`;
          markdown += `- **Idade:** ${persona.age} anos\n`;
          markdown += `- **Ocupação:** ${persona.occupation}\n`;
          if (persona.bio) markdown += `- **Bio:** ${persona.bio}\n`;
          if (persona.goals) markdown += `- **Objetivos:** ${persona.goals}\n`;
          if (persona.frustrations) markdown += `- **Frustrações:** ${persona.frustrations}\n`;
          if (persona.motivations) markdown += `- **Motivações:** ${persona.motivations}\n`;
          if (persona.techSavviness) markdown += `- **Nível técnico:** ${persona.techSavviness}\n`;
          markdown += `\n`;
        });
      }

      if (interviews.length > 0) {
        markdown += `### 🎤 Entrevistas\n\n`;
        interviews.forEach((interview, index) => {
          markdown += `#### ${index + 1}. ${interview.participantName}\n\n`;
          markdown += `- **Data:** ${interview.date}\n`;
          if (interview.duration) markdown += `- **Duração:** ${interview.duration} minutos\n`;
          if (interview.questions) markdown += `- **Perguntas:** ${interview.questions}\n`;
          if (interview.responses) markdown += `- **Respostas:** ${interview.responses}\n`;
          if (interview.insights) markdown += `- **Insights:** ${interview.insights}\n`;
          markdown += `\n`;
        });
      }

      if (observations.length > 0) {
        markdown += `### 👀 Observações\n\n`;
        observations.forEach((obs, index) => {
          markdown += `#### ${index + 1}. ${obs.location}\n\n`;
          markdown += `- **Data:** ${obs.date}\n`;
          if (obs.context) markdown += `- **Contexto:** ${obs.context}\n`;
          if (obs.behavior) markdown += `- **Comportamento:** ${obs.behavior}\n`;
          if (obs.insights) markdown += `- **Insights:** ${obs.insights}\n`;
          markdown += `\n`;
        });
      }

      // Phase 2: Definir
      markdown += `## 🎯 Fase 2: Definir\n\n`;

      if (povStatements.length > 0) {
        markdown += `### 📝 Declarações de Ponto de Vista (POV)\n\n`;
        povStatements.forEach((pov, index) => {
          markdown += `#### ${index + 1}. ${pov.user}\n\n`;
          markdown += `> **${pov.user}** precisa **${pov.need}** porque **${pov.insight}**.\n\n`;
        });
      }

      if (hmwQuestions.length > 0) {
        markdown += `### ❓ Perguntas "Como Podemos" (HMW)\n\n`;
        hmwQuestions.forEach((hmw, index) => {
          markdown += `${index + 1}. **${hmw.question}**`;
          if (hmw.category) markdown += ` *(${hmw.category})*`;
          markdown += `\n`;
        });
        markdown += `\n`;
      }

      // Phase 3: Idear
      markdown += `## 💡 Fase 3: Idear\n\n`;

      if (ideas.length > 0) {
        markdown += `### 🚀 Ideias Geradas\n\n`;
        ideas.forEach((idea, index) => {
          markdown += `#### ${index + 1}. ${idea.title}\n\n`;
          markdown += `${idea.description}\n\n`;
          if (idea.category) markdown += `**Categoria:** ${idea.category}\n\n`;
          
          // DVF Scores if available
          if (idea.feasibility || idea.impact || idea.desirability) {
            markdown += `**Avaliação DVF:**\n`;
            if (idea.desirability) markdown += `- Desejabilidade: ${idea.desirability}/10\n`;
            if (idea.feasibility) markdown += `- Viabilidade: ${idea.feasibility}/10\n`;
            if (idea.impact) markdown += `- Exequibilidade: ${idea.impact}/10\n`;
            markdown += `\n`;
          }
        });
      }

      // Phase 4: Prototipar
      markdown += `## 🔧 Fase 4: Prototipar\n\n`;

      if (prototypes.length > 0) {
        markdown += `### 🛠️ Protótipos Desenvolvidos\n\n`;
        prototypes.forEach((prototype, index) => {
          markdown += `#### ${index + 1}. ${prototype.name}\n\n`;
          markdown += `${prototype.description}\n\n`;
          if (prototype.type) markdown += `**Tipo:** ${prototype.type}\n\n`;
          if (prototype.materials && Array.isArray(prototype.materials)) {
            markdown += `**Materiais:**\n`;
            prototype.materials.forEach(material => markdown += `- ${material}\n`);
            markdown += `\n`;
          }
          if (prototype.feedback) markdown += `**Feedback:** ${prototype.feedback}\n\n`;
        });
      }

      // Phase 5: Testar
      markdown += `## 🧪 Fase 5: Testar\n\n`;

      if (testPlans.length > 0) {
        markdown += `### 📋 Planos de Teste\n\n`;
        testPlans.forEach((plan, index) => {
          markdown += `#### ${index + 1}. ${plan.name}\n\n`;
          if (plan.objective) markdown += `**Objetivo:** ${plan.objective}\n\n`;
          if (plan.methodology) markdown += `**Metodologia:** ${plan.methodology}\n\n`;
          if (plan.participants) markdown += `**Participantes:** ${plan.participants}\n\n`;
          if (plan.duration) markdown += `**Duração:** ${plan.duration} dias\n\n`;
        });
      }

      if (testResults.length > 0) {
        markdown += `### 📊 Resultados dos Testes\n\n`;
        testResults.forEach((result, index) => {
          markdown += `#### ${index + 1}. ${result.participantId}\n\n`;
          if (result.feedback) markdown += `**Feedback:** ${result.feedback}\n\n`;
          if (result.insights) markdown += `**Insights:** ${result.insights}\n\n`;
          if (result.successRate) markdown += `**Taxa de sucesso:** ${result.successRate}%\n\n`;
        });
      }

      // Footer
      markdown += `---\n\n`;
      markdown += `*Relatório gerado pelo **DTTools** - Plataforma de Design Thinking*  \n`;
      markdown += `*Acesse: [dttools.app](https://dttools.app)*  \n`;
      markdown += `*Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}*\n`;

      return markdown;

    } catch (error) {
      console.error("Error generating Markdown:", error);
      throw new Error("Failed to generate Markdown document");
    }
  }
}