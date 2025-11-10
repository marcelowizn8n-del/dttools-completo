import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronRight, Users, User, MessageCircle, Eye, Target, Lightbulb, Wrench, TestTube } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  phase: number;
  phaseName: string;
  description: string;
  icon: any;
  category: string;
  difficulty: 'Fácil' | 'Médio' | 'Avançado';
  timeEstimate: string;
  tags: string[];
}

const toolsDatabase: Tool[] = [
  // Fase 1 - Empatizar
  {
    id: "empathy-maps",
    name: "Mapa de Empatia",
    phase: 1,
    phaseName: "Empatizar",
    description: "Visualize o que usuários dizem, pensam, fazem e sentem",
    icon: Users,
    category: "Pesquisa",
    difficulty: 'Fácil',
    timeEstimate: "30-45 min",
    tags: ["pesquisa", "usuário", "empatia", "comportamento"]
  },
  {
    id: "personas",
    name: "Personas",
    phase: 1,
    phaseName: "Empatizar", 
    description: "Crie perfis detalhados dos usuários-alvo",
    icon: User,
    category: "Pesquisa",
    difficulty: 'Médio',
    timeEstimate: "60-90 min",
    tags: ["usuário", "perfil", "segmentação", "target"]
  },
  {
    id: "interviews",
    name: "Entrevistas",
    phase: 1,
    phaseName: "Empatizar",
    description: "Documente conversas com usuários reais",
    icon: MessageCircle,
    category: "Pesquisa",
    difficulty: 'Médio',
    timeEstimate: "45-60 min",
    tags: ["entrevista", "pesquisa qualitativa", "insights"]
  },
  {
    id: "observations",
    name: "Observações",
    phase: 1,
    phaseName: "Empatizar",
    description: "Registre comportamentos observados",
    icon: Eye,
    category: "Pesquisa",
    difficulty: 'Fácil',
    timeEstimate: "20-30 min",
    tags: ["observação", "etnografia", "comportamento"]
  },
  // Fase 2 - Definir
  {
    id: "pov-statements",
    name: "POV Statements",
    phase: 2,
    phaseName: "Definir",
    description: "Formule declarações de ponto de vista claras",
    icon: Target,
    category: "Definição",
    difficulty: 'Médio',
    timeEstimate: "30-45 min",
    tags: ["problema", "definição", "foco", "declaração"]
  },
  // Fase 3 - Idear
  {
    id: "brainstorming",
    name: "Brainstorming",
    phase: 3,
    phaseName: "Idear",
    description: "Gere ideias criativas em quantidade",
    icon: Lightbulb,
    category: "Ideação",
    difficulty: 'Fácil',
    timeEstimate: "45-60 min",
    tags: ["ideias", "criatividade", "brainstorm", "soluções"]
  },
  // Fase 4 - Prototipar
  {
    id: "prototypes",
    name: "Protótipos",
    phase: 4,
    phaseName: "Prototipar",
    description: "Construa versões testáveis das ideias",
    icon: Wrench,
    category: "Prototipação",
    difficulty: 'Avançado',
    timeEstimate: "2-4 horas",
    tags: ["protótipo", "teste", "validação", "mvp"]
  },
  // Fase 5 - Testar
  {
    id: "user-tests",
    name: "Testes com Usuários",
    phase: 5,
    phaseName: "Testar",
    description: "Valide soluções com usuários reais",
    icon: TestTube,
    category: "Validação",
    difficulty: 'Médio',
    timeEstimate: "1-2 horas",
    tags: ["teste", "validação", "feedback", "usuário"]
  }
];

interface ToolsSummaryProps {
  onToolSelect?: (toolId: string) => void;
  currentPhase?: number;
  compact?: boolean;
}

export default function ToolsSummary({ onToolSelect, currentPhase, compact = false }: ToolsSummaryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<number | null>(currentPhase || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTools = toolsDatabase.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPhase = selectedPhase ? tool.phase === selectedPhase : true;
    const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
    
    return matchesSearch && matchesPhase && matchesCategory;
  });

  const categories = Array.from(new Set(toolsDatabase.map(tool => tool.category)));
  const phases = Array.from(new Set(toolsDatabase.map(tool => tool.phase))).sort();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-700 border-green-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Avançado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPhaseColor = (phase: number) => {
    const colors = {
      1: 'bg-red-50 text-red-700 border-red-200',
      2: 'bg-orange-50 text-orange-700 border-orange-200', 
      3: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      4: 'bg-blue-50 text-blue-700 border-blue-200',
      5: 'bg-green-50 text-green-700 border-green-200'
    };
    return colors[phase as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Índice de Ferramentas
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {phases.map(phase => (
              <Button
                key={phase}
                variant={selectedPhase === phase ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPhase(selectedPhase === phase ? null : phase)}
                data-testid={`button-phase-${phase}`}
              >
                Fase {phase}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredTools.map(tool => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant="ghost"
                  className="h-auto p-3 flex flex-col items-start gap-2 hover:bg-gray-50"
                  onClick={() => onToolSelect?.(tool.id)}
                  data-testid={`button-tool-${tool.id}`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <Badge variant="outline" className={`text-xs ${getPhaseColor(tool.phase)}`}>
                      {tool.phase}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium text-left">{tool.name}</span>
                  <span className="text-xs text-gray-500 text-left">{tool.timeEstimate}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Busca e Filtros */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Search className="w-6 h-6" />
            Navegador de Ferramentas DT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Buscar ferramentas, descrições ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                data-testid="input-search-tools"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedPhase === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPhase(null)}
                data-testid="button-all-phases"
              >
                Todas Fases
              </Button>
              {phases.map(phase => (
                <Button
                  key={phase}
                  variant={selectedPhase === phase ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPhase(selectedPhase === phase ? null : phase)}
                  data-testid={`button-filter-phase-${phase}`}
                >
                  Fase {phase}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              data-testid="button-all-categories"
            >
              <Filter className="w-4 h-4 mr-1" />
              Todas Categorias
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                data-testid={`button-filter-${category.toLowerCase()}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map(tool => {
          const Icon = tool.icon;
          return (
            <Card 
              key={tool.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onToolSelect?.(tool.id)}
              data-testid={`card-tool-${tool.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-gray-600" />
                    <div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge className={`text-xs ${getPhaseColor(tool.phase)}`}>
                          Fase {tool.phase}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(tool.difficulty)}`}>
                          {tool.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>⏱️ {tool.timeEstimate}</span>
                  <span>{tool.category}</span>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {tool.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {tool.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{tool.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma ferramenta encontrada com os filtros selecionados.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedPhase(null);
                setSelectedCategory(null);
              }}
              className="mt-4"
              data-testid="button-clear-filters"
            >
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}