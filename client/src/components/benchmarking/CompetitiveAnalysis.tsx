import { useState, useEffect } from "react";
import { 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  Save,
  Download,
  BarChart3,
  Briefcase,
  Globe,
  Star,
  Minus
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
import type { CompetitiveAnalysis } from "@shared/schema";

interface CompetitiveAnalysisProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

const competitorTemplates = [
  {
    name: "Miro",
    type: "direct",
    position: "leader",
    description: "Plataforma líder em colaboração visual e design thinking",
    features: ["Boards infinitos", "Templates DT", "Colaboração real-time", "Integrações"],
    pricing: "Freemium + $8-16/mês",
    strengths: ["Comunidade forte", "Biblioteca de templates", "Escalabilidade"],
    weaknesses: ["Curva de aprendizado", "Pode ser complexo para iniciantes"]
  },
  {
    name: "Figma",
    type: "indirect",
    position: "leader", 
    description: "Ferramenta de design com recursos de colaboração",
    features: ["Design UI/UX", "Prototipagem", "Colaboração", "Componentes"],
    pricing: "Freemium + $12-45/mês",
    strengths: ["Interface intuitiva", "Prototipagem avançada", "Cloud-native"],
    weaknesses: ["Foco em UI/UX", "Limitado para brainstorming"]
  },
  {
    name: "Notion",
    type: "substitute",
    position: "challenger",
    description: "Workspace all-in-one com templates de DT",
    features: ["Documentação", "Databases", "Templates", "Colaboração"],
    pricing: "Freemium + $8-16/mês",
    strengths: ["Flexibilidade", "Preço acessível", "All-in-one"],
    weaknesses: ["Não é visual", "Setup complexo", "Performance"]
  },
  {
    name: "Canva",
    type: "substitute", 
    position: "challenger",
    description: "Ferramenta de design com templates visuais",
    features: ["Templates visuais", "Design simplificado", "Biblioteca de assets"],
    pricing: "Freemium + $12.99/mês",
    strengths: ["Muito fácil de usar", "Templates profissionais", "Preço acessível"],
    weaknesses: ["Limitado para DT", "Pouca colaboração", "Funcionalidades básicas"]
  }
];

const featureCategories = [
  { id: "collaboration", name: "Colaboração", icon: Users },
  { id: "templates", name: "Templates", icon: Star },
  { id: "visualization", name: "Visualização", icon: BarChart3 },
  { id: "integration", name: "Integrações", icon: Zap },
  { id: "usability", name: "Usabilidade", icon: CheckCircle },
  { id: "scalability", name: "Escalabilidade", icon: TrendingUp }
];

const marketPositions = [
  { value: "leader", label: "Líder", color: "bg-green-100 text-green-800" },
  { value: "challenger", label: "Desafiante", color: "bg-blue-100 text-blue-800" },
  { value: "niche", label: "Nicho", color: "bg-purple-100 text-purple-800" },
  { value: "follower", label: "Seguidor", color: "bg-gray-100 text-gray-800" }
];

const competitorTypes = [
  { value: "direct", label: "Direto", color: "bg-red-100 text-red-800" },
  { value: "indirect", label: "Indireto", color: "bg-yellow-100 text-yellow-800" },
  { value: "substitute", label: "Substituto", color: "bg-blue-100 text-blue-800" }
];

export default function CompetitiveAnalysisComponent({
  projectId,
  projectName,
  onClose
}: CompetitiveAnalysisProps) {
  const { toast } = useToast();

  const [selectedCompetitor, setSelectedCompetitor] = useState<string>("");
  const [formData, setFormData] = useState({
    competitorName: "",
    competitorType: "direct" as "direct" | "indirect" | "substitute",
    marketPosition: "challenger" as "leader" | "challenger" | "niche" | "follower",
    
    // Feature comparison
    features: {} as Record<string, number>, // 1-5 rating for each feature
    functionalGaps: [] as string[],
    functionalOverages: [] as string[],
    
    // Pricing comparison
    pricingModel: "freemium" as "freemium" | "subscription" | "one-time" | "usage-based",
    pricePoints: [] as string[],
    valueProposition: "",
    
    // Market gaps
    underservedOutcomes: [] as string[],
    overservedOutcomes: [] as string[],
    
    // Our positioning
    ourAdvantages: [] as string[],
    ourDisadvantages: [] as string[],
    recommendations: [] as string[]
  });

  const [newGap, setNewGap] = useState("");
  const [newOverage, setNewOverage] = useState("");
  const [newPricePoint, setNewPricePoint] = useState("");
  const [newUnderserved, setNewUnderserved] = useState("");
  const [newOverserved, setNewOverserved] = useState("");
  const [newAdvantage, setNewAdvantage] = useState("");
  const [newDisadvantage, setNewDisadvantage] = useState("");
  const [newRecommendation, setNewRecommendation] = useState("");

  // Fetch existing analyses
  const { data: existingAnalyses = [] } = useQuery<CompetitiveAnalysis[]>({
    queryKey: ['/api/competitive-analysis', projectId]
  });

  // Save/Update analysis mutation
  const saveAnalysisMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest("POST", "/api/competitive-analysis", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/competitive-analysis'] });
      toast({
        title: "Sucesso!",
        description: "Análise competitiva salva com sucesso.",
      });
      // Reset form
      setFormData({
        competitorName: "",
        competitorType: "direct",
        marketPosition: "challenger",
        features: {},
        functionalGaps: [],
        functionalOverages: [],
        pricingModel: "freemium",
        pricePoints: [],
        valueProposition: "",
        underservedOutcomes: [],
        overservedOutcomes: [],
        ourAdvantages: [],
        ourDisadvantages: [],
        recommendations: []
      });
    },
    onError: (error) => {
      console.error('Competitive analysis save error:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar análise competitiva.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!formData.competitorName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do concorrente é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    const analysisData = {
      projectId,
      ...formData
    };

    saveAnalysisMutation.mutate(analysisData);
  };

  const loadCompetitorTemplate = (template: typeof competitorTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      competitorName: template.name,
      competitorType: template.type as any,
      marketPosition: template.position as any,
      valueProposition: template.description,
      functionalGaps: template.weaknesses,
      ourAdvantages: template.strengths.map(s => `Versus ${template.name}: ${s}`)
    }));
    setSelectedCompetitor(template.name);
  };

  const addArrayItem = (
    field: "functionalGaps" | "functionalOverages" | "pricePoints" | "underservedOutcomes" | "overservedOutcomes" | "ourAdvantages" | "ourDisadvantages" | "recommendations",
    value: string
  ) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));

      // Clear input
      switch (field) {
        case "functionalGaps":
          setNewGap("");
          break;
        case "functionalOverages":
          setNewOverage("");
          break;
        case "pricePoints":
          setNewPricePoint("");
          break;
        case "underservedOutcomes":
          setNewUnderserved("");
          break;
        case "overservedOutcomes":
          setNewOverserved("");
          break;
        case "ourAdvantages":
          setNewAdvantage("");
          break;
        case "ourDisadvantages":
          setNewDisadvantage("");
          break;
        case "recommendations":
          setNewRecommendation("");
          break;
      }
    }
  };

  const removeArrayItem = (
    field: "functionalGaps" | "functionalOverages" | "pricePoints" | "underservedOutcomes" | "overservedOutcomes" | "ourAdvantages" | "ourDisadvantages" | "recommendations",
    index: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getOverallCompetitiveness = () => {
    const featureScores = Object.values(formData.features);
    const avgFeatureScore = featureScores.length > 0 ? featureScores.reduce((a, b) => a + b, 0) / featureScores.length : 0;
    const advantageScore = Math.min(formData.ourAdvantages.length * 0.5, 5);
    const gapPenalty = Math.min(formData.ourDisadvantages.length * 0.3, 2);
    
    return Math.max(0, Math.min(10, avgFeatureScore * 2 + advantageScore - gapPenalty));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-7 h-7 text-purple-600" />
                Análise Competitiva - {projectName}
              </h2>
              <p className="text-gray-600">
                Compare com concorrentes e identifique oportunidades de mercado
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {getOverallCompetitiveness().toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Competitividade</div>
              </div>
              <Button variant="ghost" onClick={onClose}>×</Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Competitor Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Templates de Concorrentes
              </CardTitle>
              <CardDescription>
                Selecione um concorrente conhecido ou adicione um customizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {competitorTemplates.map((template) => (
                  <Card 
                    key={template.name} 
                    className={`cursor-pointer border-2 transition-colors ${
                      selectedCompetitor === template.name 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => loadCompetitorTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge 
                          className={
                            competitorTypes.find(t => t.value === template.type)?.color || "bg-gray-100"
                          }
                        >
                          {competitorTypes.find(t => t.value === template.type)?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="space-y-1">
                        <div className="text-xs font-medium">Pricing: {template.pricing}</div>
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 2).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {template.features.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.features.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Basic Competitor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Informações do Concorrente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome do Concorrente</label>
                  <Input
                    value={formData.competitorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, competitorName: e.target.value }))}
                    placeholder="Ex: Miro, Figma..."
                    data-testid="input-competitor-name"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tipo de Concorrente</label>
                  <select
                    value={formData.competitorType}
                    onChange={(e) => setFormData(prev => ({ ...prev, competitorType: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                    data-testid="select-competitor-type"
                  >
                    {competitorTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Posição no Mercado</label>
                  <select
                    value={formData.marketPosition}
                    onChange={(e) => setFormData(prev => ({ ...prev, marketPosition: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                    data-testid="select-market-position"
                  >
                    {marketPositions.map(pos => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Modelo de Preços</label>
                  <select
                    value={formData.pricingModel}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricingModel: e.target.value as any }))}
                    className="w-full p-2 border rounded-md"
                    data-testid="select-pricing-model"
                  >
                    <option value="freemium">Freemium</option>
                    <option value="subscription">Assinatura</option>
                    <option value="one-time">Pagamento único</option>
                    <option value="usage-based">Por uso</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">Proposta de Valor</label>
                <Textarea
                  value={formData.valueProposition}
                  onChange={(e) => setFormData(prev => ({ ...prev, valueProposition: e.target.value }))}
                  placeholder="Qual é a principal proposta de valor deste concorrente?"
                  rows={2}
                  data-testid="textarea-value-proposition"
                />
              </div>
            </CardContent>
          </Card>

          {/* Feature Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Comparação de Funcionalidades
              </CardTitle>
              <CardDescription>
                Avalie cada categoria de funcionalidade de 1 a 5
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featureCategories.map((category) => {
                  const Icon = category.icon;
                  const score = formData.features[category.id] || 0;
                  
                  return (
                    <div key={category.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-2xl font-bold text-purple-600">
                            {score}/5
                          </div>
                        </div>
                      </div>
                      
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={score}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            [category.id]: parseInt(e.target.value)
                          }
                        }))}
                        className="w-full h-2 rounded-lg appearance-none bg-gray-200"
                        data-testid={`slider-feature-${category.id}`}
                      />
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Fraco</span>
                        <span>Excelente</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Gaps and Advantages Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Minus className="w-5 h-5 text-red-600" />
                  Gaps Funcionais (Deles)
                </CardTitle>
                <CardDescription>
                  O que eles não fazem bem ou não oferecem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newGap}
                    onChange={(e) => setNewGap(e.target.value)}
                    placeholder="Ex: Sem templates brasileiros..."
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('functionalGaps', newGap)}
                    data-testid="input-functional-gap"
                  />
                  <Button
                    size="sm"
                    onClick={() => addArrayItem('functionalGaps', newGap)}
                    data-testid="button-add-gap"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.functionalGaps.map((gap, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-red-50 rounded cursor-pointer"
                      onClick={() => removeArrayItem('functionalGaps', index)}
                      data-testid={`gap-${index}`}
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="flex-1">{gap}</span>
                      <span className="text-xs text-red-600">×</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Nossas Vantagens
                </CardTitle>
                <CardDescription>
                  Onde somos melhores que este concorrente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newAdvantage}
                    onChange={(e) => setNewAdvantage(e.target.value)}
                    placeholder="Ex: Foco específico em DT..."
                    onKeyPress={(e) => e.key === 'Enter' && addArrayItem('ourAdvantages', newAdvantage)}
                    data-testid="input-our-advantage"
                  />
                  <Button
                    size="sm"
                    onClick={() => addArrayItem('ourAdvantages', newAdvantage)}
                    data-testid="button-add-advantage"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.ourAdvantages.map((advantage, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-green-50 rounded cursor-pointer"
                      onClick={() => removeArrayItem('ourAdvantages', index)}
                      data-testid={`advantage-${index}`}
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="flex-1">{advantage}</span>
                      <span className="text-xs text-green-600">×</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Oportunidades de Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Necessidades Mal Atendidas</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newUnderserved}
                      onChange={(e) => setNewUnderserved(e.target.value)}
                      placeholder="Ex: Design Thinking para PMEs..."
                      onKeyPress={(e) => e.key === 'Enter' && addArrayItem('underservedOutcomes', newUnderserved)}
                      data-testid="input-underserved"
                    />
                    <Button
                      size="sm"
                      onClick={() => addArrayItem('underservedOutcomes', newUnderserved)}
                      data-testid="button-add-underserved"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.underservedOutcomes.map((outcome, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => removeArrayItem('underservedOutcomes', index)}
                        data-testid={`underserved-${index}`}
                      >
                        {outcome} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Áreas Super Atendidas</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newOverserved}
                      onChange={(e) => setNewOverserved(e.target.value)}
                      placeholder="Ex: Funcionalidades complexas demais..."
                      onKeyPress={(e) => e.key === 'Enter' && addArrayItem('overservedOutcomes', newOverserved)}
                      data-testid="input-overserved"
                    />
                    <Button
                      size="sm"
                      onClick={() => addArrayItem('overservedOutcomes', newOverserved)}
                      data-testid="button-add-overserved"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.overservedOutcomes.map((outcome, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeArrayItem('overservedOutcomes', index)}
                        data-testid={`overserved-${index}`}
                      >
                        {outcome} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recomendações Estratégicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newRecommendation}
                  onChange={(e) => setNewRecommendation(e.target.value)}
                  placeholder="Ex: Focar em simplicidade vs complexidade do Miro..."
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('recommendations', newRecommendation)}
                  data-testid="input-recommendation"
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
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                    <span className="flex-1">{rec}</span>
                    <span className="text-xs text-blue-600">×</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Existing Analyses */}
          {existingAnalyses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Análises Existentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {existingAnalyses.map((analysis) => (
                    <Card key={analysis.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{analysis.competitorName}</h4>
                          <Badge 
                            className={
                              competitorTypes.find(t => t.value === analysis.competitorType)?.color || "bg-gray-100"
                            }
                          >
                            {competitorTypes.find(t => t.value === analysis.competitorType)?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{analysis.valueProposition}</p>
                        <div className="flex justify-between text-xs">
                          <span>Vantagens: {(analysis.ourAdvantages as string[])?.length || 0}</span>
                          <span>Gaps: {(analysis.functionalGaps as string[])?.length || 0}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel-competitive">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveAnalysisMutation.isPending || !formData.competitorName.trim()}
              data-testid="button-save-competitive"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveAnalysisMutation.isPending ? "Salvando..." : "Salvar Análise"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}