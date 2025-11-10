import type { AIProjectAnalysis, Project } from "@shared/schema";

interface ReportData {
  eventName: string;
  weekNumber: number;
  year: number;
  completionRate: number;
  teamEfficiency: number;
  budgetUsage: number;
  teamMembers: Array<{
    name: string;
    efficiency: number;
    tasksCompleted: number;
    tasksAssigned: number;
  }>;
  insights: Array<{
    type: string;
    title: string;
    description: string;
  }>;
}

interface AIAnalysisReportData {
  project: Project;
  analysis: AIProjectAnalysis;
  generatedAt: Date;
}

export async function generatePDFReport(data: ReportData): Promise<string> {
  // Dynamic import to avoid bundle size issues
  const jsPDF = (await import("jspdf")).default;
  
  const doc = new jsPDF();
  
  // Report Header
  doc.setFontSize(20);
  doc.text("Weekly Progress Report", 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Event: ${data.eventName}`, 20, 45);
  doc.text(`Week ${data.weekNumber}, ${data.year}`, 20, 55);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 65);
  
  // Key Metrics
  doc.setFontSize(16);
  doc.text("Key Metrics", 20, 85);
  
  doc.setFontSize(12);
  doc.text(`Completion Rate: ${data.completionRate}%`, 20, 100);
  doc.text(`Team Efficiency: ${data.teamEfficiency}%`, 20, 110);
  doc.text(`Budget Usage: $${data.budgetUsage.toLocaleString()}`, 20, 120);
  
  // Team Performance
  doc.setFontSize(16);
  doc.text("Team Performance", 20, 140);
  
  let yPos = 155;
  data.teamMembers.forEach((member) => {
    doc.setFontSize(12);
    doc.text(`${member.name}: ${member.efficiency}% (${member.tasksCompleted}/${member.tasksAssigned} tasks)`, 20, yPos);
    yPos += 10;
  });
  
  // AI Insights
  doc.setFontSize(16);
  doc.text("AI Insights", 20, yPos + 15);
  
  yPos += 30;
  data.insights.forEach((insight) => {
    doc.setFontSize(12);
    doc.text(`${insight.title}:`, 20, yPos);
    doc.setFontSize(10);
    
    // Wrap text for description
    const splitDescription = doc.splitTextToSize(insight.description, 170);
    doc.text(splitDescription, 20, yPos + 10);
    yPos += 10 + (splitDescription.length * 5) + 10;
  });
  
  // Generate blob URL
  const pdfBlob = doc.output("blob");
  return URL.createObjectURL(pdfBlob);
}

export async function generateCSVReport(data: ReportData): Promise<string> {
  const csvContent = [
    // Headers
    ["Metric", "Value"],
    ["Event Name", data.eventName],
    ["Week", data.weekNumber],
    ["Year", data.year],
    ["Completion Rate", `${data.completionRate}%`],
    ["Team Efficiency", `${data.teamEfficiency}%`],
    ["Budget Usage", `$${data.budgetUsage}`],
    [""],
    ["Team Member", "Efficiency", "Tasks Completed", "Tasks Assigned"],
    ...data.teamMembers.map(member => [
      member.name,
      `${member.efficiency}%`,
      member.tasksCompleted.toString(),
      member.tasksAssigned.toString()
    ]),
    [""],
    ["Insight Type", "Title", "Description"],
    ...data.insights.map(insight => [
      insight.type,
      insight.title,
      insight.description
    ])
  ];
  
  const csvString = csvContent.map(row => 
    row.map(cell => `"${cell}"`).join(",")
  ).join("\n");
  
  const blob = new Blob([csvString], { type: "text/csv" });
  return URL.createObjectURL(blob);
}

export async function generateAIAnalysisPDF(data: AIAnalysisReportData): Promise<string> {
  // Dynamic import to avoid bundle size issues
  const jsPDF = (await import("jspdf")).default;
  
  const doc = new jsPDF();
  const { analysis, project, generatedAt } = data;
  let yPos = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > 280) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Helper function to wrap text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const splitText = doc.splitTextToSize(text, maxWidth);
    doc.text(splitText, x, y);
    return splitText.length * (fontSize * 0.4); // Height of text block
  };

  // Logo will be added to all pages in the footer section

  doc.setFontSize(24);
  doc.setFont(undefined, "bold");
  doc.text("Análise Inteligente IA", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 15;
  doc.setFontSize(16);
  doc.text(`Projeto: ${project.name}`, 20, yPos);
  
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Gerado em: ${generatedAt.toLocaleDateString('pt-BR')}`, 20, yPos);
  doc.text(`Fase Atual: ${project.currentPhase}/5`, 120, yPos);

  // Executive Summary
  yPos += 20;
  checkPageBreak(40);
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Resumo Executivo", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 15;
  const summaryHeight = addWrappedText(analysis.executiveSummary, 20, yPos, 170, 12);
  yPos += summaryHeight + 10;

  // Maturity Score Section
  checkPageBreak(50);
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Score de Maturidade", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text(`Score Geral: ${analysis.maturityScore}/10`, 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 10;
  doc.setFontSize(12);
  const maturityLabel = analysis.maturityScore >= 8 ? 'Projeto Maduro' : 
                       analysis.maturityScore >= 6 ? 'Projeto Desenvolvido' :
                       analysis.maturityScore >= 4 ? 'Projeto em Desenvolvimento' : 'Projeto Inicial';
  doc.text(`Status: ${maturityLabel}`, 20, yPos);
  
  // Draw maturity score bar
  yPos += 15;
  const barWidth = 150;
  const barHeight = 8;
  const fillWidth = (analysis.maturityScore / 10) * barWidth;
  
  // Bar background
  doc.setFillColor(230, 230, 230);
  doc.rect(20, yPos, barWidth, barHeight, 'F');
  
  // Bar fill
  const color = analysis.maturityScore >= 8 ? [34, 197, 94] : 
                analysis.maturityScore >= 6 ? [234, 179, 8] :
                analysis.maturityScore >= 4 ? [249, 115, 22] : [239, 68, 68];
  doc.setFillColor(color[0], color[1], color[2]);
  doc.rect(20, yPos, fillWidth, barHeight, 'F');
  
  yPos += 20;

  // Consistency and Alignment Metrics
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Métricas de Qualidade", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 15;
  doc.setFontSize(12);
  doc.text(`Consistência: ${analysis.consistency.score}%`, 20, yPos);
  doc.text(`Alinhamento Problema-Solução: ${analysis.alignment.problemSolutionAlignment}%`, 120, yPos);
  
  yPos += 10;
  doc.text(`Alinhamento Research-Insights: ${analysis.alignment.researchInsightsAlignment}%`, 20, yPos);

  // Phase Analysis
  yPos += 20;
  checkPageBreak(80);
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Análise por Fases", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 15;
  
  analysis.phaseAnalyses.forEach((phase, index) => {
    checkPageBreak(35);
    
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(`Fase ${phase.phase}: ${phase.phaseName}`, 20, yPos);
    doc.setFont(undefined, "normal");
    
    yPos += 10;
    doc.setFontSize(11);
    doc.text(`Completude: ${phase.completeness}%`, 25, yPos);
    doc.text(`Qualidade: ${phase.quality}%`, 80, yPos);
    
    yPos += 8;
    if (phase.strengths.length > 0) {
      doc.text(`✓ Pontos Fortes: ${phase.strengths[0]}`, 25, yPos);
      yPos += 6;
    }
    
    if (phase.gaps.length > 0) {
      doc.text(`⚠ Gaps: ${phase.gaps[0]}`, 25, yPos);
      yPos += 6;
    }
    
    yPos += 8;
  });

  // Overall Insights
  yPos += 10;
  checkPageBreak(50);
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Insights Principais", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 15;
  doc.setFontSize(12);
  
  analysis.overallInsights.slice(0, 5).forEach((insight) => {
    checkPageBreak(15);
    doc.text("•", 20, yPos);
    const insightHeight = addWrappedText(insight, 27, yPos, 160, 11);
    yPos += Math.max(8, insightHeight + 3);
  });

  // Attention Points
  yPos += 15;
  checkPageBreak(50);
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Pontos de Atenção", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 15;
  doc.setFontSize(12);
  
  analysis.attentionPoints.slice(0, 5).forEach((point) => {
    checkPageBreak(15);
    doc.text("⚠", 20, yPos);
    const pointHeight = addWrappedText(point, 27, yPos, 160, 11);
    yPos += Math.max(8, pointHeight + 3);
  });

  // Recommendations
  yPos += 15;
  checkPageBreak(80);
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Recomendações Estratégicas", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 15;
  
  // Immediate actions
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Ações Imediatas", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 10;
  doc.setFontSize(11);
  analysis.recommendations.immediate.slice(0, 3).forEach((rec) => {
    checkPageBreak(12);
    doc.text("•", 22, yPos);
    const recHeight = addWrappedText(rec, 27, yPos, 160, 10);
    yPos += Math.max(7, recHeight + 2);
  });

  yPos += 8;
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Curto Prazo", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 10;
  doc.setFontSize(11);
  analysis.recommendations.shortTerm.slice(0, 3).forEach((rec) => {
    checkPageBreak(12);
    doc.text("•", 22, yPos);
    const recHeight = addWrappedText(rec, 27, yPos, 160, 10);
    yPos += Math.max(7, recHeight + 2);
  });

  yPos += 8;
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Longo Prazo", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 10;
  doc.setFontSize(11);
  analysis.recommendations.longTerm.slice(0, 3).forEach((rec) => {
    checkPageBreak(12);
    doc.text("•", 22, yPos);
    const recHeight = addWrappedText(rec, 27, yPos, 160, 10);
    yPos += Math.max(7, recHeight + 2);
  });

  // Priority Next Steps
  yPos += 15;
  checkPageBreak(50);
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Próximos Passos Prioritários", 20, yPos);
  doc.setFont(undefined, "normal");
  
  yPos += 15;
  doc.setFontSize(12);
  
  analysis.priorityNextSteps.slice(0, 5).forEach((step, index) => {
    checkPageBreak(15);
    doc.text(`${index + 1}.`, 20, yPos);
    const stepHeight = addWrappedText(step, 30, yPos, 155, 11);
    yPos += Math.max(10, stepHeight + 3);
  });

  // Add logo to all pages and footer
  const totalPages = doc.getNumberOfPages();
  
  // Load DTTools logo as base64
  const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAY8SURBVHgB7Z1NbBRVGMefdwuttFBaKFBKC1YqH1IQFYMHjdGDJh48eNCEgyQePHjw4MGDJw8ePHjw4MGDJw8ePHjw4MGDJw8ePHjw4MGDJw8ePHjw4MGDJw8ePHjw4MGDJ0/e/M/MzszszLuzs7PvzLz/5E22O7vtzrz/933f930fQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRBEBdQiCaurq21NTU0NdXV1jfX19Q11dXWNdXV1TXV1dU11dXVNdXV1LXV1dW11dXXtdXV1HXV1dZ11dXVddXV13XV1dT11dXU9dXV1vXV1db11dXV9dXV1A3V1dYN1dXVDdXV1w3V1dSN1dXWjdXV1Y3V1deN1dXUTdXV1k3V1dVN1dXXTdXV1M3V1dbN1dXVzdXV183V1dQt1dXULdXV1i3V1dUt1dXXLdXV1K3V1dav/AQcGBgZu3LjxwMDA7du3Hxw8ePCBrq6uBzo7Ox/o6Oh4oL29/YH29vYH2traHmhra3utra3ttba2ttfa2tpea2tre621tfW1lpaW15qbm19rbm5+rbm5+bXm5ubXmpubX2tubvlfU1PTay0tLa+1tLS81tLS8lpra+trbW1tr7W1tb3W3t7+Wnt7+2sdHR0PdHZ2PnDw4MEHBgYGHrh58+YDN2/evP/gwYP7Dx48uP/gwYP7Dx48uP/gwYP7Dx48uP/gwYP7Dx48uP/gwYP7Dx48uP/gwYP7Dx48uP/gwYP7Dx48uP/gwYP7Dx48uP/gwYP7Dx48uP/gwYP7Dx48uP/gwYP7d+7cuf/OnTv379y5c//OnTv3L1++fP/y5cv3L1++fP/y5cv3L1++fP/KlSv3r1y5cv/KlSv3r1y5cv/atWv3r127dv/atWv3r127dv/GjRv3b9y4cf/GjRv3b968ef/mzZv3b968ef/WrVv3b926df/WrVv3b926df/27dv3b9++ff/OnTv379y5c//u3bt3792799C9e/cevnfv3sP37t17+N69ew/fvXv34bt37z589+7dh+/evfvw3bt3H75z587Dd+7cefjOnTsP3759++Hbt28/fPv27Ydv3br18K1btx6+devWw7du3Xr41q1bD9+8efPhmzdvPnzz5s2Hb968+fCNGzce/vvvvx/+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//777//+++++//7779+/f//9999d//9999d//9999d//9999d//9999d//9999d//9999d//9999d//9999d//9999d//9999d//9999d//9999d//9999d//9999d//999999999999";
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    try {
      // Draw logo background circle
      doc.setFillColor(40, 116, 240); // DTTools blue
      doc.roundedRect(162, 16, 16, 12, 2, 2, 'F'); // x, y, width, height, rx, ry, style
      
      // Draw "DT" text inside circle
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("DT", 167, 25);
      
      // Draw "Tools" text next to circle
      doc.setTextColor(40, 116, 240); // Blue text
      doc.setFontSize(12);
      doc.text("Tools", 179, 25);
      
      // Reset colors
      doc.setTextColor(0, 0, 0); 
      doc.setFont("helvetica", "normal");
    } catch (error) {
      // Fallback to text logo if image fails
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 116, 240);
      doc.text("DTTools", 160, 25);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
    }
    
    // Footer text
    doc.setFontSize(10);
    doc.text(`Página ${i} de ${totalPages}`, 170, 290);
    doc.text("Gerado por DT Tools - Análise IA", 20, 290);
  }

  // Generate blob URL
  const pdfBlob = doc.output("blob");
  return URL.createObjectURL(pdfBlob);
}
