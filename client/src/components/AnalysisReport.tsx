import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Target, 
  Lightbulb, 
  Wrench, 
  TestTube,
  Download,
  RefreshCw,
  Star,
  ArrowRight,
  ClipboardList,
  Zap,
  AlertCircle
} from "lucide-react";
import type { AIProjectAnalysis, Project } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { generateAIAnalysisPDF } from "@/lib/reportGenerator";

interface AnalysisReportProps {
  projectId: string;
  onExportPDF?: (analysis: AIProjectAnalysis) => void;
}

const phaseIcons = {
  1: Users,
  2: Target,
  3: Lightbulb,
  4: Wrench,
  5: TestTube,
};

const phaseColors = {
  1: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  2: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  3: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  4: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  5: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
};

export default function AnalysisReport({ projectId, onExportPDF }: AnalysisReportProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState<AIProjectAnalysis | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Fetch project data for PDF generation
  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/projects/${projectId}`, {});
      return await response.json();
    },
  });

  const generateAnalysis = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/ai-analysis`, {});
      return await response.json();
    },
    onSuccess: (data: AIProjectAnalysis) => {
      setAnalysis(data);
      toast({
        title: "Análise IA Gerada",
        description: "A análise inteligente do seu projeto foi gerada com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error generating analysis:', error);
      toast({
        title: "Erro na Análise",
        description: "Não foi possível gerar a análise IA. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const getMaturityColor = (score: number) => {
    if (score >= 8) return { bg: "bg-green-100", text: "text-green-700", progress: "bg-green-500" };
    if (score >= 6) return { bg: "bg-yellow-100", text: "text-yellow-700", progress: "bg-yellow-500" };
    if (score >= 4) return { bg: "bg-orange-100", text: "text-orange-700", progress: "bg-orange-500" };
    return { bg: "bg-red-100", text: "text-red-700", progress: "bg-red-500" };
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bom";
    if (score >= 40) return "Regular";
    return "Needs Improvement";
  };

  const handleGenerateAnalysis = () => {
    generateAnalysis.mutate();
  };

  const handleExportPDF = async () => {
    if (!analysis || !project) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para gerar PDF.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExportingPDF(true);
      
      const pdfUrl = await generateAIAnalysisPDF({
        project: project!,
        analysis,
        generatedAt: new Date(),
      });

      // Create download link
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `analise-ia-${project!.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up URL
      URL.revokeObjectURL(pdfUrl);
      
      toast({
        title: "PDF Gerado",
        description: "O relatório da análise IA foi baixado com sucesso.",
      });

      // Call external callback if provided
      if (onExportPDF) {
        onExportPDF(analysis);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro no PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Loading skeleton
  if (generateAnalysis.isPending) {
    return (
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initial state - no analysis generated yet
  if (!analysis) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Análise Inteligente IA</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Análise abrangente do seu projeto de Design Thinking
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Gere uma Análise IA Completa
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Nossa IA especializada analisará todo o seu projeto de Design Thinking, identificando 
              pontos fortes, oportunidades de melhoria e próximos passos recomendados.
            </p>
            <Button 
              onClick={handleGenerateAnalysis}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              data-testid="button-generate-analysis"
            >
              <Brain className="w-4 h-4 mr-2" />
              Gerar Análise IA
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Score de Maturidade</h4>
              <p className="text-sm text-muted-foreground">
                Avaliação geral do projeto (1-10)
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="font-medium mb-2">Pontos de Atenção</h4>
              <p className="text-sm text-muted-foreground">
                Áreas que precisam de melhorias
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">Recomendações</h4>
              <p className="text-sm text-muted-foreground">
                Próximos passos prioritários
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Analysis results display
  const maturityColors = getMaturityColor(analysis.maturityScore ?? 0);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Análise Inteligente IA</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Análise gerada em {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleGenerateAnalysis}
                disabled={generateAnalysis.isPending}
                data-testid="button-regenerate-analysis"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reagerar
              </Button>
              <Button 
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                data-testid="button-export-analysis-pdf"
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExportingPDF ? "Gerando PDF..." : "Exportar PDF"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Executive Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed" data-testid="text-executive-summary">
            {analysis.executiveSummary || 'Análise não disponível no momento.'}
          </p>
        </CardContent>
      </Card>

      {/* Maturity Score and Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Score de Maturidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`w-24 h-24 mx-auto rounded-full ${maturityColors.bg} flex items-center justify-center mb-3`}>
                <span className={`text-3xl font-bold ${maturityColors.text}`} data-testid="text-maturity-score">
                  {analysis.maturityScore ?? 0}
                </span>
              </div>
              <Progress 
                value={(analysis.maturityScore ?? 0) * 10} 
                className="w-full"
                data-testid="progress-maturity"
              />
              <p className={`text-sm mt-2 font-medium ${maturityColors.text}`}>
                {(analysis.maturityScore ?? 0) >= 8 ? 'Projeto Maduro' : 
                 (analysis.maturityScore ?? 0) >= 6 ? 'Projeto Desenvolvido' :
                 (analysis.maturityScore ?? 0) >= 4 ? 'Projeto em Desenvolvimento' : 'Projeto Inicial'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Consistência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score Geral</span>
                <Badge variant="secondary" data-testid="badge-consistency-score">
                  {analysis.consistency?.score ?? 0}%
                </Badge>
              </div>
              <Progress 
                value={analysis.consistency?.score ?? 0} 
                className="w-full"
                data-testid="progress-consistency"
              />
              <div className="space-y-2">
                {(analysis.consistency?.strengths || []).slice(0, 2).map((strength, index) => (
                  <div key={index} className="flex items-center text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    {strength}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Alinhamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Problema-Solução</span>
                  <span className="text-sm font-medium" data-testid="text-problem-solution-alignment">
                    {analysis.alignment?.problemSolutionAlignment ?? 0}%
                  </span>
                </div>
                <Progress 
                  value={analysis.alignment?.problemSolutionAlignment ?? 0} 
                  className="w-full h-2"
                  data-testid="progress-problem-solution"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Research-Insights</span>
                  <span className="text-sm font-medium" data-testid="text-research-insights-alignment">
                    {analysis.alignment?.researchInsightsAlignment ?? 0}%
                  </span>
                </div>
                <Progress 
                  value={analysis.alignment?.researchInsightsAlignment ?? 0} 
                  className="w-full h-2"
                  data-testid="progress-research-insights"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase Analysis Grid */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Análise por Fases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {(analysis.phaseAnalyses || []).map((phase) => {
              const PhaseIcon = phaseIcons[phase.phase as keyof typeof phaseIcons];
              const colors = phaseColors[phase.phase as keyof typeof phaseColors];
              
              return (
                <Card key={phase.phase} className={`${colors.border} border-2`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
                        <PhaseIcon className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm" data-testid={`text-phase-${phase.phase}-name`}>
                          {phase.phaseName}
                        </h4>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completude</span>
                        <span data-testid={`text-phase-${phase.phase}-completeness`}>
                          {phase.completeness}%
                        </span>
                      </div>
                      <Progress 
                        value={phase.completeness} 
                        className="h-1"
                        data-testid={`progress-phase-${phase.phase}-completeness`}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Qualidade</span>
                        <span data-testid={`text-phase-${phase.phase}-quality`}>
                          {phase.quality}%
                        </span>
                      </div>
                      <Progress 
                        value={phase.quality} 
                        className="h-1"
                        data-testid={`progress-phase-${phase.phase}-quality`}
                      />
                    </div>
                    {phase.strengths.length > 0 && (
                      <div className="text-xs">
                        <div className="flex items-center text-green-600 mb-1">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Pontos Fortes
                        </div>
                        <p className="text-muted-foreground">
                          {phase.strengths[0]}
                        </p>
                      </div>
                    )}
                    {phase.gaps.length > 0 && (
                      <div className="text-xs">
                        <div className="flex items-center text-orange-600 mb-1">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Gaps
                        </div>
                        <p className="text-muted-foreground">
                          {phase.gaps[0]}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights and Attention Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Insights Principais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analysis.overallInsights || []).map((insight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground" data-testid={`text-insight-${index}`}>
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Pontos de Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analysis.attentionPoints || []).map((point, index) => (
                <Alert key={index} className="py-3">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription data-testid={`text-attention-point-${index}`}>
                    {point}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowRight className="w-5 h-5 mr-2" />
            Recomendações Estratégicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                Ações Imediatas
              </h4>
              <div className="space-y-2">
                {(analysis.recommendations?.immediate || []).map((rec, index) => (
                  <div key={index} className="text-sm text-muted-foreground" data-testid={`text-immediate-${index}`}>
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                Curto Prazo
              </h4>
              <div className="space-y-2">
                {(analysis.recommendations?.shortTerm || []).map((rec, index) => (
                  <div key={index} className="text-sm text-muted-foreground" data-testid={`text-short-term-${index}`}>
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                Longo Prazo
              </h4>
              <div className="space-y-2">
                {(analysis.recommendations?.longTerm || []).map((rec, index) => (
                  <div key={index} className="text-sm text-muted-foreground" data-testid={`text-long-term-${index}`}>
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Next Steps */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Próximos Passos Prioritários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(analysis.priorityNextSteps || []).map((step, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-sm" data-testid={`text-next-step-${index}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}