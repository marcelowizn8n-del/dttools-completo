import { useState, useEffect } from "react";
import { 
  Target, 
  Users, 
  Cog, 
  DollarSign, 
  Plus, 
  Save, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
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
import type { DvfAssessment } from "@shared/schema";

interface DvfAssessmentProps {
  projectId: string;
  itemId: string;
  itemName: string;
  itemType: "idea" | "prototype" | "solution";
  onClose: () => void;
}

const pillars = [
  {
    id: "desirability",
    name: "Desejabilidade",
    icon: Users,
    color: "#E53E3E",
    description: "O quanto a ideia é desejada por clientes e usuários",
    questions: [
      "Os usuários demonstraram interesse real na solução?",
      "Existe demanda comprovada no mercado?",
      "A proposta de valor é clara e atrativa?",
      "Os usuários pagariam por esta solução?"
    ]
  },
  {
    id: "feasibility", 
    name: "Viabilidade",
    icon: Cog,
    color: "#3182CE",
    description: "A possibilidade técnica de implementar a solução",
    questions: [
      "Temos as capacidades técnicas necessárias?",
      "A tecnologia requerida está disponível?",
      "Os recursos necessários são acessíveis?",
      "O prazo de implementação é realista?"
    ]
  },
  {
    id: "viability",
    name: "Exequibilidade", 
    icon: DollarSign,
    color: "#38A169",
    description: "A viabilidade econômica e sustentável da solução",
    questions: [
      "O modelo de negócio é sustentável?",
      "O retorno sobre investimento é atrativo?",
      "Os custos de implementação são viáveis?",
      "Existe potencial de escalabilidade?"
    ]
  }
];

const recommendationTypes = {
  proceed: { label: "Prosseguir", color: "bg-green-100 text-green-800", icon: CheckCircle },
  modify: { label: "Modificar", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  stop: { label: "Parar", color: "bg-red-100 text-red-800", icon: XCircle }
};

export default function DvfAssessmentComponent({ 
  projectId, 
  itemId, 
  itemName, 
  itemType, 
  onClose 
}: DvfAssessmentProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    // Desirability
    desirabilityScore: 0,
    desirabilityEvidence: "",
    userFeedback: "",
    marketDemand: 0,
    
    // Feasibility
    feasibilityScore: 0,
    feasibilityEvidence: "",
    technicalComplexity: "medium" as "low" | "medium" | "high",
    resourceRequirements: [] as string[],
    timeToImplement: 0,
    
    // Viability
    viabilityScore: 0,
    viabilityEvidence: "",
    businessModel: "",
    costEstimate: 0,
    revenueProjection: 0,
    
    // Overall
    recommendation: "modify" as "proceed" | "modify" | "stop",
    nextSteps: [] as string[],
    risksIdentified: [] as string[]
  });

  const [newResource, setNewResource] = useState("");
  const [newNextStep, setNewNextStep] = useState("");
  const [newRisk, setNewRisk] = useState("");

  // Fetch existing assessment
  const { data: existingAssessments = [] } = useQuery<DvfAssessment[]>({
    queryKey: ['/api/dvf-assessments', projectId]
  });

  const existingAssessment = existingAssessments.find(
    assessment => assessment.itemId === itemId
  );

  // Load existing data if available
  useEffect(() => {
    if (existingAssessment) {
      setFormData({
        desirabilityScore: existingAssessment.desirabilityScore,
        desirabilityEvidence: existingAssessment.desirabilityEvidence || "",
        userFeedback: existingAssessment.userFeedback || "",
        marketDemand: existingAssessment.marketDemand || 0,
        feasibilityScore: existingAssessment.feasibilityScore,
        feasibilityEvidence: existingAssessment.feasibilityEvidence || "",
        technicalComplexity: existingAssessment.technicalComplexity as any || "medium",
        resourceRequirements: (existingAssessment.resourceRequirements as string[]) || [],
        timeToImplement: existingAssessment.timeToImplement || 0,
        viabilityScore: existingAssessment.viabilityScore,
        viabilityEvidence: existingAssessment.viabilityEvidence || "",
        businessModel: existingAssessment.businessModel || "",
        costEstimate: existingAssessment.costEstimate || 0,
        revenueProjection: existingAssessment.revenueProjection || 0,
        recommendation: existingAssessment.recommendation as any || "modify",
        nextSteps: (existingAssessment.nextSteps as string[]) || [],
        risksIdentified: (existingAssessment.risksIdentified as string[]) || []
      });
    }
  }, [existingAssessment]);

  // Calculate overall score
  const overallScore = (formData.desirabilityScore + formData.feasibilityScore + formData.viabilityScore) / 3;

  // Save/Update assessment mutation
  const saveAssessmentMutation = useMutation({
    mutationFn: (data: any) => {
      if (existingAssessment) {
        return apiRequest("PUT", `/api/dvf-assessments/${existingAssessment.id}`, data);
      } else {
        return apiRequest("POST", "/api/dvf-assessments", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dvf-assessments'] });
      toast({
        title: "Sucesso!",
        description: "Avaliação DVF salva com sucesso.",
      });
    },
    onError: (error) => {
      console.error('DVF assessment save error:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar avaliação DVF.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const assessmentData = {
      projectId,
      itemType,
      itemId,
      itemName,
      ...formData,
      overallScore: overallScore,
      resourceRequirements: formData.resourceRequirements,
      nextSteps: formData.nextSteps,
      risksIdentified: formData.risksIdentified
    };

    saveAssessmentMutation.mutate(assessmentData);
  };

  const addArrayItem = (field: "resourceRequirements" | "nextSteps" | "risksIdentified", value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      
      // Clear input
      if (field === "resourceRequirements") setNewResource("");
      if (field === "nextSteps") setNewNextStep("");  
      if (field === "risksIdentified") setNewRisk("");
    }
  };

  const removeArrayItem = (field: "resourceRequirements" | "nextSteps" | "risksIdentified", index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getRecommendationColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-yellow-600"; 
    return "text-red-600";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Avaliação DVF - {itemName}</h2>
              <p className="text-gray-600">
                Desejabilidade • Viabilidade • Exequibilidade
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getRecommendationColor(overallScore)}`}>
                  {overallScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Score Geral</div>
              </div>
              <Button variant="ghost" onClick={onClose}>×</Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Three Pillars Assessment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              const scoreField = `${pillar.id}Score` as keyof typeof formData;
              const evidenceField = `${pillar.id}Evidence` as keyof typeof formData;
              const score = formData[scoreField] as number;
              
              return (
                <Card key={pillar.id} className="border-2" style={{ borderColor: pillar.color + "40" }}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: pillar.color + "20", color: pillar.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{pillar.name}</CardTitle>
                        <div className={`text-2xl font-bold ${getRecommendationColor(score)}`}>
                          {score}/5
                        </div>
                      </div>
                    </div>
                    <CardDescription>{pillar.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Score Slider */}
                    <div>
                      <label className="text-sm font-medium">Pontuação (1-5)</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={score}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [scoreField]: parseFloat(e.target.value)
                        }))}
                        className="w-full h-2 rounded-lg appearance-none"
                        style={{ 
                          background: `linear-gradient(to right, ${pillar.color} 0%, ${pillar.color} ${(score/5)*100}%, #e2e8f0 ${(score/5)*100}%, #e2e8f0 100%)`
                        }}
                        data-testid={`slider-${pillar.id}-score`}
                      />
                    </div>

                    {/* Key Questions */}
                    <div>
                      <label className="text-sm font-medium">Perguntas-chave:</label>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {pillar.questions.map((question, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-xs mt-1">•</span>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Evidence */}
                    <div>
                      <label className="text-sm font-medium">Evidências</label>
                      <Textarea
                        value={formData[evidenceField] as string}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          [evidenceField]: e.target.value
                        }))}
                        placeholder={`Descreva as evidências para ${pillar.name.toLowerCase()}...`}
                        rows={3}
                        data-testid={`textarea-${pillar.id}-evidence`}
                      />
                    </div>

                    {/* Specific fields for each pillar */}
                    {pillar.id === "desirability" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Feedback dos Usuários</label>
                          <Textarea
                            value={formData.userFeedback}
                            onChange={(e) => setFormData(prev => ({ ...prev, userFeedback: e.target.value }))}
                            placeholder="Feedback direto dos usuários..."
                            rows={2}
                            data-testid="textarea-user-feedback"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Demanda de Mercado (1-5)</label>
                          <Input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={formData.marketDemand}
                            onChange={(e) => setFormData(prev => ({ ...prev, marketDemand: parseFloat(e.target.value) || 0 }))}
                            data-testid="input-market-demand"
                          />
                        </div>
                      </div>
                    )}

                    {pillar.id === "feasibility" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Complexidade Técnica</label>
                          <select
                            value={formData.technicalComplexity}
                            onChange={(e) => setFormData(prev => ({ ...prev, technicalComplexity: e.target.value as any }))}
                            className="w-full p-2 border rounded-md"
                            data-testid="select-technical-complexity"
                          >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Tempo para Implementar (dias)</label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.timeToImplement}
                            onChange={(e) => setFormData(prev => ({ ...prev, timeToImplement: parseInt(e.target.value) || 0 }))}
                            data-testid="input-time-to-implement"
                          />
                        </div>
                      </div>
                    )}

                    {pillar.id === "viability" && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Modelo de Negócio</label>
                          <Input
                            value={formData.businessModel}
                            onChange={(e) => setFormData(prev => ({ ...prev, businessModel: e.target.value }))}
                            placeholder="Como gera valor..."
                            data-testid="input-business-model"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium">Custo (R$)</label>
                            <Input
                              type="number"
                              min="0"
                              value={formData.costEstimate}
                              onChange={(e) => setFormData(prev => ({ ...prev, costEstimate: parseFloat(e.target.value) || 0 }))}
                              data-testid="input-cost-estimate"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Receita (R$)</label>
                            <Input
                              type="number"
                              min="0"
                              value={formData.revenueProjection}
                              onChange={(e) => setFormData(prev => ({ ...prev, revenueProjection: parseFloat(e.target.value) || 0 }))}
                              data-testid="input-revenue-projection"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Overall Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Análise Geral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Score */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Score Geral DVF:</span>
                <div className="flex items-center gap-4">
                  <Progress value={(overallScore / 5) * 100} className="w-32" />
                  <span className={`text-xl font-bold ${getRecommendationColor(overallScore)}`}>
                    {overallScore.toFixed(1)}/5
                  </span>
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <label className="text-sm font-medium">Recomendação</label>
                <div className="flex gap-2 mt-2">
                  {Object.entries(recommendationTypes).map(([key, rec]) => {
                    const Icon = rec.icon;
                    return (
                      <Button
                        key={key}
                        variant={formData.recommendation === key ? "default" : "outline"}
                        onClick={() => setFormData(prev => ({ ...prev, recommendation: key as any }))}
                        className="flex items-center gap-2"
                        data-testid={`button-recommendation-${key}`}
                      >
                        <Icon className="w-4 h-4" />
                        {rec.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Resources Required */}
              <div>
                <label className="text-sm font-medium">Recursos Necessários</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newResource}
                    onChange={(e) => setNewResource(e.target.value)}
                    placeholder="Ex: Desenvolvedor backend..."
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('resourceRequirements', newResource)}
                    data-testid="input-new-resource"
                  />
                  <Button
                    size="sm"
                    onClick={() => addArrayItem('resourceRequirements', newResource)}
                    data-testid="button-add-resource"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.resourceRequirements.map((resource, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeArrayItem('resourceRequirements', index)}
                      data-testid={`badge-resource-${index}`}
                    >
                      {resource} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <label className="text-sm font-medium">Próximos Passos</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newNextStep}
                    onChange={(e) => setNewNextStep(e.target.value)}
                    placeholder="Ex: Validar com 10 usuários..."
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('nextSteps', newNextStep)}
                    data-testid="input-new-next-step"
                  />
                  <Button
                    size="sm"
                    onClick={() => addArrayItem('nextSteps', newNextStep)}
                    data-testid="button-add-next-step"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1 mt-2">
                  {formData.nextSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-blue-50 rounded cursor-pointer"
                      onClick={() => removeArrayItem('nextSteps', index)}
                      data-testid={`step-${index}`}
                    >
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="flex-1">{step}</span>
                      <span className="text-xs text-blue-600">×</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div>
                <label className="text-sm font-medium">Riscos Identificados</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value)}
                    placeholder="Ex: Dependência de API externa..."
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('risksIdentified', newRisk)}
                    data-testid="input-new-risk"
                  />
                  <Button
                    size="sm"
                    onClick={() => addArrayItem('risksIdentified', newRisk)}
                    data-testid="button-add-risk"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1 mt-2">
                  {formData.risksIdentified.map((risk, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-red-50 rounded cursor-pointer"
                      onClick={() => removeArrayItem('risksIdentified', index)}
                      data-testid={`risk-${index}`}
                    >
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="flex-1">{risk}</span>
                      <span className="text-xs text-red-600">×</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel-dvf">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveAssessmentMutation.isPending}
              data-testid="button-save-dvf"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveAssessmentMutation.isPending ? "Salvando..." : "Salvar Avaliação"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}