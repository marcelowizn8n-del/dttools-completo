import { useState, useEffect } from "react";
import { 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Smile, 
  Meh, 
  Frown, 
  Star, 
  MessageCircle, 
  TrendingUp,
  BarChart3,
  Plus,
  Save,
  UserCheck,
  Calendar,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LovabilityMetric } from "@shared/schema";

interface LovabilityMetricsProps {
  projectId: string;
  itemId: string;
  itemName: string;
  itemType: "idea" | "prototype" | "solution";
  onClose: () => void;
}

const emotionalCategories = [
  { id: "delight", name: "Encantamento", icon: Star, color: "#FFD700", description: "Usuários ficam encantados e surpreendidos" },
  { id: "satisfaction", name: "Satisfação", icon: Smile, color: "#4CAF50", description: "Usuários ficam satisfeitos e felizes" },
  { id: "neutral", name: "Neutro", icon: Meh, color: "#FFA726", description: "Usuários acham aceitável mas sem entusiasmo" },
  { id: "frustration", name: "Frustração", icon: Frown, color: "#F44336", description: "Usuários ficam frustrados ou confusos" }
];

const engagementMetrics = [
  { key: "npsScore", label: "NPS Score", icon: Target, min: -100, max: 100, suffix: "" },
  { key: "satisfactionScore", label: "Satisfação", icon: Smile, min: 0, max: 10, suffix: "/10" },
  { key: "retentionRate", label: "Taxa de Retenção", icon: UserCheck, min: 0, max: 100, suffix: "%" },
  { key: "engagementTime", label: "Tempo de Engajamento", icon: Calendar, min: 0, max: 300, suffix: "min" }
];

const sentimentTypes = {
  positive: { label: "Positivo", color: "bg-green-100 text-green-800", icon: ThumbsUp },
  neutral: { label: "Neutro", color: "bg-gray-100 text-gray-800", icon: Meh },
  negative: { label: "Negativo", color: "bg-red-100 text-red-800", icon: ThumbsDown }
};

export default function LovabilityMetricsComponent({
  projectId,
  itemId,
  itemName,
  itemType,
  onClose
}: LovabilityMetricsProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Core Metrics
    npsScore: 0,
    satisfactionScore: 0,
    retentionRate: 0,
    engagementTime: 0,
    
    // Emotional Response
    emotionalDistribution: {
      delight: 0,
      satisfaction: 0,
      neutral: 0,
      frustration: 0
    },
    
    // Feedback Analysis
    positiveComments: [] as string[],
    negativeComments: [] as string[],
    improvementSuggestions: [] as string[],
    
    // User Behavior
    userTestingSessions: 0,
    completionRate: 0,
    errorRate: 0,
    supportTickets: 0,
    
    // Qualitative Insights
    emotionalStory: "",
    userPersonas: [] as string[],
    keyMoments: [] as string[],
    painPoints: [] as string[],
    
    // Overall Assessment
    lovabilityScore: 0,
    recommendations: [] as string[]
  });

  const [newComment, setNewComment] = useState("");
  const [newSuggestion, setNewSuggestion] = useState("");
  const [newPersona, setNewPersona] = useState("");
  const [newMoment, setNewMoment] = useState("");
  const [newPainPoint, setNewPainPoint] = useState("");
  const [newRecommendation, setNewRecommendation] = useState("");

  // Fetch existing metrics
  const { data: existingMetrics = [] } = useQuery<LovabilityMetric[]>({
    queryKey: ['/api/lovability-metrics', projectId]
  });

  const existingMetric = existingMetrics.find(
    metric => metric.itemId === itemId
  );

  // Load existing data if available
  useEffect(() => {
    if (existingMetric) {
      setFormData({
        npsScore: existingMetric.npsScore || 0,
        satisfactionScore: existingMetric.satisfactionScore || 0,
        retentionRate: existingMetric.retentionRate || 0,
        engagementTime: existingMetric.engagementTime || 0,
        emotionalDistribution: (existingMetric.emotionalDistribution as any) || {
          delight: 0, satisfaction: 0, neutral: 0, frustration: 0
        },
        positiveComments: (existingMetric.positiveComments as string[]) || [],
        negativeComments: (existingMetric.negativeComments as string[]) || [],
        improvementSuggestions: (existingMetric.improvementSuggestions as string[]) || [],
        userTestingSessions: existingMetric.userTestingSessions || 0,
        completionRate: existingMetric.completionRate || 0,
        errorRate: existingMetric.errorRate || 0,
        supportTickets: existingMetric.supportTickets || 0,
        emotionalStory: existingMetric.emotionalStory || "",
        userPersonas: (existingMetric.userPersonas as string[]) || [],
        keyMoments: (existingMetric.keyMoments as string[]) || [],
        painPoints: (existingMetric.painPoints as string[]) || [],
        lovabilityScore: existingMetric.lovabilityScore || 0,
        recommendations: (existingMetric.recommendations as string[]) || []
      });
    }
  }, [existingMetric]);

  // Calculate overall lovability score
  useEffect(() => {
    const emotionalTotal = Object.values(formData.emotionalDistribution).reduce((a, b) => a + b, 0);
    const emotionalScore = emotionalTotal > 0 ? 
      (formData.emotionalDistribution.delight * 4 + 
       formData.emotionalDistribution.satisfaction * 3 + 
       formData.emotionalDistribution.neutral * 2 + 
       formData.emotionalDistribution.frustration * 1) / emotionalTotal : 0;

    const metricsScore = (
      (formData.npsScore + 100) / 20 + // Convert NPS to 0-10 scale
      formData.satisfactionScore +
      formData.retentionRate / 10 +
      Math.min(formData.engagementTime / 30, 10) // Cap at 10
    ) / 4;

    const behaviorScore = (
      (100 - formData.errorRate) / 10 +
      formData.completionRate / 10 +
      Math.max(10 - formData.supportTickets, 0)
    ) / 3;

    const overallScore = (emotionalScore + metricsScore + behaviorScore) / 3;
    
    setFormData(prev => ({
      ...prev,
      lovabilityScore: Math.round(overallScore * 10) / 10
    }));
  }, [
    formData.emotionalDistribution,
    formData.npsScore,
    formData.satisfactionScore,
    formData.retentionRate,
    formData.engagementTime,
    formData.errorRate,
    formData.completionRate,
    formData.supportTickets
  ]);

  // Save/Update metrics mutation
  const saveMetricsMutation = useMutation({
    mutationFn: (data: any) => {
      if (existingMetric) {
        return apiRequest("PUT", `/api/lovability-metrics/${existingMetric.id}`, data);
      } else {
        return apiRequest("POST", "/api/lovability-metrics", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lovability-metrics'] });
      toast({
        title: "Sucesso!",
        description: "Métricas de amabilidade salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Lovability metrics save error:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar métricas de amabilidade.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const metricsData = {
      projectId,
      itemType,
      itemId,
      itemName,
      ...formData
    };

    saveMetricsMutation.mutate(metricsData);
  };

  const addArrayItem = (
    field: "positiveComments" | "negativeComments" | "improvementSuggestions" | "userPersonas" | "keyMoments" | "painPoints" | "recommendations",
    value: string
  ) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));

      // Clear input
      switch (field) {
        case "positiveComments":
        case "negativeComments":
          setNewComment("");
          break;
        case "improvementSuggestions":
          setNewSuggestion("");
          break;
        case "userPersonas":
          setNewPersona("");
          break;
        case "keyMoments":
          setNewMoment("");
          break;
        case "painPoints":
          setNewPainPoint("");
          break;
        case "recommendations":
          setNewRecommendation("");
          break;
      }
    }
  };

  const removeArrayItem = (
    field: "positiveComments" | "negativeComments" | "improvementSuggestions" | "userPersonas" | "keyMoments" | "painPoints" | "recommendations",
    index: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getLovabilityColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-7 h-7 text-pink-600" />
                Métricas de Amabilidade - {itemName}
              </h2>
              <p className="text-gray-600">
                Análise emocional e engajamento dos usuários
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getLovabilityColor(formData.lovabilityScore)}`}>
                  {formData.lovabilityScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Lovability Score</div>
              </div>
              <Button variant="ghost" onClick={onClose}>×</Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Core Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Métricas de Engajamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {engagementMetrics.map((metric) => {
                  const Icon = metric.icon;
                  const value = formData[metric.key as keyof typeof formData] as number;
                  
                  return (
                    <div key={metric.key} className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {metric.label}
                      </label>
                      <Input
                        type="number"
                        min={metric.min}
                        max={metric.max}
                        value={value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [metric.key]: parseFloat(e.target.value) || 0
                        }))}
                        data-testid={`input-${metric.key}`}
                      />
                      <div className="text-xs text-gray-500">
                        {value}{metric.suffix} ({metric.min} - {metric.max})
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Emotional Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Emocional</CardTitle>
              <CardDescription>
                Como os usuários se sentem ao interagir com sua solução
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {emotionalCategories.map((category) => {
                  const Icon = category.icon;
                  const value = formData.emotionalDistribution[category.id as keyof typeof formData.emotionalDistribution];
                  
                  return (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: category.color + "20", color: category.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xl font-bold" style={{ color: category.color }}>
                            {value}%
                          </div>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          emotionalDistribution: {
                            ...prev.emotionalDistribution,
                            [category.id]: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full h-2 rounded-lg appearance-none"
                        style={{ 
                          background: `linear-gradient(to right, ${category.color} 0%, ${category.color} ${value}%, #e2e8f0 ${value}%, #e2e8f0 100%)`
                        }}
                        data-testid={`slider-emotion-${category.id}`}
                      />
                      <p className="text-xs text-gray-600">{category.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* User Behavior Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Comportamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Sessões de Teste</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.userTestingSessions}
                    onChange={(e) => setFormData(prev => ({ ...prev, userTestingSessions: parseInt(e.target.value) || 0 }))}
                    data-testid="input-testing-sessions"
                  />
                </div>
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
                  <label className="text-sm font-medium">Taxa de Erro (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.errorRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, errorRate: parseFloat(e.target.value) || 0 }))}
                    data-testid="input-error-rate"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tickets de Suporte</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.supportTickets}
                    onChange={(e) => setFormData(prev => ({ ...prev, supportTickets: parseInt(e.target.value) || 0 }))}
                    data-testid="input-support-tickets"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-600" />
                  Comentários Positivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar comentário positivo..."
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('positiveComments', newComment)}
                    data-testid="input-positive-comment"
                  />
                  <Button
                    size="sm"
                    onClick={() => addArrayItem('positiveComments', newComment)}
                    data-testid="button-add-positive"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.positiveComments.map((comment, index) => (
                    <div
                      key={index}
                      className="p-2 bg-green-50 rounded cursor-pointer text-sm"
                      onClick={() => removeArrayItem('positiveComments', index)}
                      data-testid={`positive-comment-${index}`}
                    >
                      <span className="flex-1">{comment}</span>
                      <span className="text-xs text-green-600 float-right">×</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5 text-red-600" />
                  Comentários Negativos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar comentário negativo..."
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('negativeComments', newComment)}
                    data-testid="input-negative-comment"
                  />
                  <Button
                    size="sm"
                    onClick={() => addArrayItem('negativeComments', newComment)}
                    data-testid="button-add-negative"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.negativeComments.map((comment, index) => (
                    <div
                      key={index}
                      className="p-2 bg-red-50 rounded cursor-pointer text-sm"
                      onClick={() => removeArrayItem('negativeComments', index)}
                      data-testid={`negative-comment-${index}`}
                    >
                      <span className="flex-1">{comment}</span>
                      <span className="text-xs text-red-600 float-right">×</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Qualitative Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Insights Qualitativos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">História Emocional</label>
                <Textarea
                  value={formData.emotionalStory}
                  onChange={(e) => setFormData(prev => ({ ...prev, emotionalStory: e.target.value }))}
                  placeholder="Descreva a jornada emocional dos usuários..."
                  rows={3}
                  data-testid="textarea-emotional-story"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Personas Envolvidas</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newPersona}
                      onChange={(e) => setNewPersona(e.target.value)}
                      placeholder="Ex: Designer júnior..."
                      onKeyPress={(e) => e.key === 'Enter' && addArrayItem('userPersonas', newPersona)}
                      data-testid="input-new-persona"
                    />
                    <Button
                      size="sm"
                      onClick={() => addArrayItem('userPersonas', newPersona)}
                      data-testid="button-add-persona"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.userPersonas.map((persona, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeArrayItem('userPersonas', index)}
                        data-testid={`persona-${index}`}
                      >
                        {persona} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Momentos-Chave</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newMoment}
                      onChange={(e) => setNewMoment(e.target.value)}
                      placeholder="Ex: Primeiro clique..."
                      onKeyPress={(e) => e.key === 'Enter' && addArrayItem('keyMoments', newMoment)}
                      data-testid="input-new-moment"
                    />
                    <Button
                      size="sm"
                      onClick={() => addArrayItem('keyMoments', newMoment)}
                      data-testid="button-add-moment"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.keyMoments.map((moment, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => removeArrayItem('keyMoments', index)}
                        data-testid={`moment-${index}`}
                      >
                        {moment} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newRecommendation}
                  onChange={(e) => setNewRecommendation(e.target.value)}
                  placeholder="Adicionar recomendação..."
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('recommendations', newRecommendation)}
                  data-testid="input-new-recommendation"
                />
                <Button
                  size="sm"
                  onClick={() => addArrayItem('recommendations', newRecommendation)}
                  data-testid="button-add-recommendation"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-blue-50 rounded cursor-pointer"
                    onClick={() => removeArrayItem('recommendations', index)}
                    data-testid={`recommendation-${index}`}
                  >
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="flex-1">{rec}</span>
                    <span className="text-xs text-blue-600">×</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel-lovability">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveMetricsMutation.isPending}
              data-testid="button-save-lovability"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMetricsMutation.isPending ? "Salvando..." : "Salvar Métricas"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}