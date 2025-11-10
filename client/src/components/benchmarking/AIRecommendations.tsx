import { useState } from "react";
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Loader2,
  BookOpen,
  Zap,
  Award,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIRecommendationsProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

interface AIRecommendationsData {
  overallAssessment: string;
  keyInsights: string[];
  actionableRecommendations: string[];
  competitiveAdvantages: string[];
  improvementAreas: string[];
  nextSteps: string[];
}

interface AIResponse {
  success: boolean;
  data: {
    projectInfo: {
      name: string;
      description?: string;
    };
    dataCollected: {
      dvfAssessments: number;
      lovabilityMetrics: number;
      projectAnalytics: number;
      competitiveAnalyses: number;
    };
    recommendations: AIRecommendationsData;
  };
}

export default function AIRecommendationsComponent({
  projectId,
  projectName,
  onClose
}: AIRecommendationsProps) {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<AIRecommendationsData | null>(null);
  const [dataCollected, setDataCollected] = useState<any>(null);

  // Generate AI recommendations mutation
  const generateRecommendationsMutation = useMutation<AIResponse, Error, void>({
    mutationFn: async () => {
      try {
        const response = await apiRequest("POST", `/api/benchmarking/ai-recommendations/${projectId}`, {});
        console.log('AI Recommendations API Response:', response);
        return response as unknown as AIResponse;
      } catch (err) {
        console.error('API Request failed:', err);
        throw err;
      }
    },
    onSuccess: (response: AIResponse) => {
      console.log('AI Recommendations Success:', response);
      
      // Check if response indicates missing data
      if (!response || !response.success) {
        const errorMsg = "Dados insuficientes para análise. Adicione avaliações DVF, métricas de Lovability, Analytics ou Análise Competitiva antes de gerar recomendações.";
        console.error('Missing benchmarking data:', response);
        toast({
          title: "Dados Insuficientes",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }
      
      // Check if data structure is valid
      if (!response.data || !response.data.recommendations) {
        console.error('Invalid response structure:', response);
        toast({
          title: "Erro de Resposta",
          description: "A resposta da API está em formato inválido. Tente novamente.",
          variant: "destructive",
        });
        return;
      }
      
      // Success - set data and show success message
      setRecommendations(response.data.recommendations);
      setDataCollected(response.data.dataCollected);
      toast({
        title: "Sucesso!",
        description: "Recomendações de IA geradas com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('AI recommendations error:', error);
      console.error('Error details:', error?.message, error?.response);
      const errorMessage = error?.message || error?.response?.data?.details || error?.response?.data?.error || "Falha ao gerar recomendações de IA. Verifique se você adicionou dados de benchmarking (DVF, Lovability, etc).";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleGenerateRecommendations = () => {
    generateRecommendationsMutation.mutate();
  };

  const getDataQualityScore = () => {
    if (!dataCollected) return 0;
    const total = Object.values(dataCollected as Record<string, number>).reduce((sum: number, count: number) => sum + count, 0);
    if ((total as number) >= 8) return 100;
    if ((total as number) >= 5) return 75;
    if ((total as number) >= 3) return 50;
    if ((total as number) >= 1) return 25;
    return 0;
  };

  const getDataQualityColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    if (score >= 25) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-full sm:max-w-4xl lg:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-3 sm:p-6 border-b dark:border-gray-700">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2 flex-wrap">
                <Brain className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600 flex-shrink-0" />
                <span className="truncate">Recomendações IA - {projectName}</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Análise inteligente baseada em dados de DVF, Lovability, Analytics e Competitividade
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="flex-shrink-0" 
              data-testid="button-close"
              aria-label="Fechar recomendações de IA"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          {!recommendations ? (
            <div className="text-center py-6 sm:py-12">
              <div className="max-w-md mx-auto px-2">
                <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Análise Inteligente de Benchmarking</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                  Nossa IA analisará todos os dados de benchmarking do seu projeto para gerar 
                  recomendações personalizadas e insights estratégicos.
                </p>
                
                {dataCollected && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Dados Disponíveis</CardTitle>
                      <CardDescription>
                        Qualidade dos dados: <span className={getDataQualityColor(getDataQualityScore())}>
                          {getDataQualityScore()}%
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span>Avaliações DVF:</span>
                          <Badge variant={dataCollected.dvfAssessments > 0 ? "default" : "secondary"}>
                            {dataCollected.dvfAssessments}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Métricas Lovability:</span>
                          <Badge variant={dataCollected.lovabilityMetrics > 0 ? "default" : "secondary"}>
                            {dataCollected.lovabilityMetrics}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Analytics de Projeto:</span>
                          <Badge variant={dataCollected.projectAnalytics > 0 ? "default" : "secondary"}>
                            {dataCollected.projectAnalytics}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Análises Competitivas:</span>
                          <Badge variant={dataCollected.competitiveAnalyses > 0 ? "default" : "secondary"}>
                            {dataCollected.competitiveAnalyses}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button 
                  size="lg"
                  onClick={handleGenerateRecommendations}
                  disabled={generateRecommendationsMutation.isPending}
                  className="w-full text-sm sm:text-base"
                  data-testid="button-generate-ai-recommendations"
                >
                  {generateRecommendationsMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analisando dados...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Gerar Recomendações IA
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Avaliação Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{recommendations.overallAssessment}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Insights-Chave
                    </CardTitle>
                    <CardDescription>
                      Principais descobertas da análise dos dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendations.keyInsights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3" data-testid={`insight-${index}`}>
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Competitive Advantages */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-600" />
                      Vantagens Competitivas
                    </CardTitle>
                    <CardDescription>
                      Pontos fortes identificados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendations.competitiveAdvantages.map((advantage, index) => (
                        <div key={index} className="flex items-start gap-3" data-testid={`advantage-${index}`}>
                          <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{advantage}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actionable Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    Recomendações Acionáveis
                  </CardTitle>
                  <CardDescription>
                    Ações específicas para implementar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.actionableRecommendations.map((recommendation, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg"
                        data-testid={`recommendation-${index}`}
                      >
                        <ArrowRight className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-800">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Improvement Areas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Áreas de Melhoria
                    </CardTitle>
                    <CardDescription>
                      Pontos que precisam de atenção
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendations.improvementAreas.map((area, index) => (
                        <div key={index} className="flex items-start gap-3" data-testid={`improvement-${index}`}>
                          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{area}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      Próximos Passos
                    </CardTitle>
                    <CardDescription>
                      Ações prioritárias para as próximas semanas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendations.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3" data-testid={`next-step-${index}`}>
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <p className="text-sm text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleGenerateRecommendations}
                  disabled={generateRecommendationsMutation.isPending}
                  data-testid="button-regenerate-recommendations"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar Análise
                </Button>
                
                <Button onClick={onClose} data-testid="button-close-ai-recommendations">
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}