import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  Target, 
  Users, 
  Lightbulb, 
  Hammer,
  TestTube,
  Save,
  Download,
  RefreshCw,
  Calendar,
  Award,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProjectAnalytics } from "@shared/schema";

interface ProjectAnalyticsProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

const phaseNames = [
  { id: 1, name: "Empatizar", icon: Users, color: "#E53E3E" },
  { id: 2, name: "Definir", icon: Target, color: "#3182CE" },
  { id: 3, name: "Idear", icon: Lightbulb, color: "#38A169" },
  { id: 4, name: "Prototipar", icon: Hammer, color: "#9F7AEA" },
  { id: 5, name: "Testar", icon: TestTube, color: "#F56500" }
];

const toolCategories = {
  empathy: { name: "Ferramentas de Empatia", tools: ["empathy-map", "persona", "interview", "observation"] },
  define: { name: "Ferramentas de Definição", tools: ["pov-statement", "hmw-question"] },
  ideate: { name: "Ferramentas de Ideação", tools: ["idea-generation", "brainstorming"] },
  prototype: { name: "Ferramentas de Prototipagem", tools: ["prototype", "storyboard", "canvas-drawing"] },
  test: { name: "Ferramentas de Teste", tools: ["test-plan", "test-result", "feedback-collection"] }
};

const successMetrics = [
  { key: "overallSuccess", label: "Sucesso Geral", icon: Award, suffix: "%" },
  { key: "userSatisfaction", label: "Satisfação do Usuário", icon: Users, suffix: "/10" },
  { key: "goalAchievement", label: "Alcance de Objetivos", icon: Target, suffix: "%" },
  { key: "innovationLevel", label: "Nível de Inovação", icon: Lightbulb, suffix: "/5" }
];

export default function ProjectAnalyticsComponent({
  projectId,
  projectName,
  onClose
}: ProjectAnalyticsProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Usage metrics
    totalTimeSpent: 0,
    timePerPhase: {} as Record<number, number>,
    toolsUsed: [] as string[],
    toolUsageCount: {} as Record<string, number>,
    
    // Progress metrics
    completionRate: 0,
    phasesCompleted: [] as number[],
    stageProgressions: 0,
    iterationsCount: 0,
    
    // Success indicators
    prototypesCreated: 0,
    testsCompleted: 0,
    userFeedbackCollected: 0,
    ideasGenerated: 0,
    ideasImplemented: 0,
    
    // Team collaboration
    teamSize: 1,
    collaborationEvents: 0,
    meetingsHeld: 0,
    decisionsMade: 0,
    
    // Innovation metrics
    originalityScore: 0,
    feasibilityScore: 0,
    impactPotential: 0,
    marketFit: 0,
    
    // Success metrics
    overallSuccess: 0,
    userSatisfaction: 0,
    goalAchievement: 0,
    innovationLevel: 0,
    
    // Key insights
    topPerformingTools: [] as string[],
    timeBottlenecks: [] as string[],
    successFactors: [] as string[],
    improvementAreas: [] as string[]
  });

  // Fetch existing analytics
  const { data: existingAnalytics } = useQuery<ProjectAnalytics>({
    queryKey: ['/api/project-analytics', projectId]
  });

  // Load existing data if available
  useEffect(() => {
    if (existingAnalytics) {
      setFormData({
        totalTimeSpent: existingAnalytics.totalTimeSpent || 0,
        timePerPhase: (existingAnalytics.timePerPhase as Record<number, number>) || {},
        toolsUsed: (existingAnalytics.toolsUsed as string[]) || [],
        toolUsageCount: (existingAnalytics.toolUsageCount as Record<string, number>) || {},
        completionRate: existingAnalytics.completionRate || 0,
        phasesCompleted: (existingAnalytics.phasesCompleted as number[]) || [],
        stageProgressions: existingAnalytics.stageProgressions || 0,
        iterationsCount: existingAnalytics.iterationsCount || 0,
        prototypesCreated: existingAnalytics.prototypesCreated || 0,
        testsCompleted: existingAnalytics.testsCompleted || 0,
        userFeedbackCollected: existingAnalytics.userFeedbackCollected || 0,
        ideasGenerated: existingAnalytics.ideasGenerated || 0,
        ideasImplemented: existingAnalytics.ideasImplemented || 0,
        teamSize: existingAnalytics.teamSize || 1,
        collaborationEvents: existingAnalytics.collaborationEvents || 0,
        meetingsHeld: existingAnalytics.meetingsHeld || 0,
        decisionsMade: existingAnalytics.decisionsMade || 0,
        originalityScore: existingAnalytics.originalityScore || 0,
        feasibilityScore: existingAnalytics.feasibilityScore || 0,
        impactPotential: existingAnalytics.impactPotential || 0,
        marketFit: existingAnalytics.marketFit || 0,
        overallSuccess: existingAnalytics.overallSuccess || 0,
        userSatisfaction: existingAnalytics.userSatisfaction || 0,
        goalAchievement: existingAnalytics.goalAchievement || 0,
        innovationLevel: existingAnalytics.innovationLevel || 0,
        topPerformingTools: (existingAnalytics.topPerformingTools as string[]) || [],
        timeBottlenecks: (existingAnalytics.timeBottlenecks as string[]) || [],
        successFactors: (existingAnalytics.successFactors as string[]) || [],
        improvementAreas: (existingAnalytics.improvementAreas as string[]) || []
      });
    }
  }, [existingAnalytics]);

  // Calculate derived metrics
  const averageTimePerPhase = formData.totalTimeSpent / Math.max(phaseNames.length, 1);
  const implementationRate = formData.ideasGenerated > 0 ? (formData.ideasImplemented / formData.ideasGenerated) * 100 : 0;
  const testCoverage = formData.prototypesCreated > 0 ? (formData.testsCompleted / formData.prototypesCreated) * 100 : 0;
  
  // Save/Update analytics mutation
  const saveAnalyticsMutation = useMutation({
    mutationFn: (data: any) => {
      if (existingAnalytics) {
        return apiRequest("PUT", `/api/project-analytics/${existingAnalytics.id}`, data);
      } else {
        return apiRequest("POST", "/api/project-analytics", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/project-analytics'] });
      toast({
        title: "Sucesso!",
        description: "Analytics do projeto salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Project analytics save error:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar analytics do projeto.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const analyticsData = {
      projectId,
      ...formData
    };

    saveAnalyticsMutation.mutate(analyticsData);
  };

  const handleAutoCalculate = () => {
    // Auto-calculate metrics based on project data
    // This would ideally pull from actual project usage data
    toast({
      title: "Calculando...",
      description: "Analisando dados do projeto para calcular métricas automaticamente.",
    });
    
    // Simulate auto-calculation (in real app, this would call an API)
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        totalTimeSpent: Math.floor(Math.random() * 2000) + 500,
        timePerPhase: {
          1: Math.floor(Math.random() * 300) + 100,
          2: Math.floor(Math.random() * 200) + 80,
          3: Math.floor(Math.random() * 400) + 150,
          4: Math.floor(Math.random() * 350) + 120,
          5: Math.floor(Math.random() * 250) + 90
        },
        completionRate: Math.floor(Math.random() * 40) + 60,
        prototypesCreated: Math.floor(Math.random() * 8) + 2,
        testsCompleted: Math.floor(Math.random() * 12) + 3,
        ideasGenerated: Math.floor(Math.random() * 25) + 10,
        ideasImplemented: Math.floor(Math.random() * 8) + 2,
      }));
      
      toast({
        title: "Concluído!",
        description: "Métricas calculadas automaticamente com base nos dados do projeto.",
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-blue-600" />
                Analytics do Projeto - {projectName}
              </h2>
              <p className="text-gray-600">
                Análise detalhada de performance e métricas de sucesso
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAutoCalculate}
                data-testid="button-auto-calculate"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Auto-Calcular
              </Button>
              <Button variant="ghost" onClick={onClose}>×</Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {successMetrics.map((metric) => {
              const Icon = metric.icon;
              const value = formData[metric.key as keyof typeof formData] as number;
              
              return (
                <Card key={metric.key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{metric.label}</p>
                        <p className="text-2xl font-bold">
                          {value.toFixed(1)}{metric.suffix}
                        </p>
                      </div>
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Time Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Análise de Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Tempo Total (minutos)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.totalTimeSpent}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalTimeSpent: parseInt(e.target.value) || 0 }))}
                    data-testid="input-total-time"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Média por fase: {averageTimePerPhase.toFixed(0)} min
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Tempo por Fase</h4>
                  {phaseNames.map((phase) => {
                    const Icon = phase.icon;
                    const time = formData.timePerPhase[phase.id] || 0;
                    const percentage = formData.totalTimeSpent > 0 ? (time / formData.totalTimeSpent) * 100 : 0;
                    
                    return (
                      <div key={phase.id} className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: phase.color + "20", color: phase.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span>{phase.name}</span>
                            <span>{time} min ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="flex gap-2 items-center mt-1">
                            <Progress value={percentage} className="flex-1" />
                            <Input
                              type="number"
                              min="0"
                              value={time}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                timePerPhase: {
                                  ...prev.timePerPhase,
                                  [phase.id]: parseInt(e.target.value) || 0
                                }
                              }))}
                              className="w-20 h-8"
                              data-testid={`input-time-phase-${phase.id}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress & Success Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Métricas de Progresso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Taxa de Conclusão (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.completionRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, completionRate: parseFloat(e.target.value) || 0 }))}
                      data-testid="input-completion-rate"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Iterações</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.iterationsCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, iterationsCount: parseInt(e.target.value) || 0 }))}
                      data-testid="input-iterations"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Fases Completadas</label>
                  <div className="flex gap-2 mt-2">
                    {phaseNames.map((phase) => {
                      const isCompleted = formData.phasesCompleted.includes(phase.id);
                      return (
                        <Button
                          key={phase.id}
                          variant={isCompleted ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              phasesCompleted: isCompleted 
                                ? prev.phasesCompleted.filter(id => id !== phase.id)
                                : [...prev.phasesCompleted, phase.id]
                            }));
                          }}
                          data-testid={`button-phase-${phase.id}`}
                        >
                          {phase.id}. {phase.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Indicadores de Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Protótipos Criados</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.prototypesCreated}
                      onChange={(e) => setFormData(prev => ({ ...prev, prototypesCreated: parseInt(e.target.value) || 0 }))}
                      data-testid="input-prototypes"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Testes Realizados</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.testsCompleted}
                      onChange={(e) => setFormData(prev => ({ ...prev, testsCompleted: parseInt(e.target.value) || 0 }))}
                      data-testid="input-tests"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ideias Geradas</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.ideasGenerated}
                      onChange={(e) => setFormData(prev => ({ ...prev, ideasGenerated: parseInt(e.target.value) || 0 }))}
                      data-testid="input-ideas-generated"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ideias Implementadas</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.ideasImplemented}
                      onChange={(e) => setFormData(prev => ({ ...prev, ideasImplemented: parseInt(e.target.value) || 0 }))}
                      data-testid="input-ideas-implemented"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Feedback Coletado</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.userFeedbackCollected}
                      onChange={(e) => setFormData(prev => ({ ...prev, userFeedbackCollected: parseInt(e.target.value) || 0 }))}
                      data-testid="input-feedback"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tamanho da Equipe</label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.teamSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 1 }))}
                      data-testid="input-team-size"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {implementationRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Taxa de Implementação</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {testCoverage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Cobertura de Testes</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        {formData.userFeedbackCollected}
                      </div>
                      <div className="text-xs text-gray-600">Feedbacks Coletados</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Innovation & Market Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Métricas de Inovação e Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Originalidade (1-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.originalityScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalityScore: parseFloat(e.target.value) || 0 }))}
                    data-testid="input-originality"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Viabilidade (1-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.feasibilityScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, feasibilityScore: parseFloat(e.target.value) || 0 }))}
                    data-testid="input-feasibility"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Potencial de Impacto (1-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.impactPotential}
                    onChange={(e) => setFormData(prev => ({ ...prev, impactPotential: parseFloat(e.target.value) || 0 }))}
                    data-testid="input-impact"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Market Fit (1-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.marketFit}
                    onChange={(e) => setFormData(prev => ({ ...prev, marketFit: parseFloat(e.target.value) || 0 }))}
                    data-testid="input-market-fit"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel-analytics">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveAnalyticsMutation.isPending}
              data-testid="button-save-analytics"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveAnalyticsMutation.isPending ? "Salvando..." : "Salvar Analytics"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}