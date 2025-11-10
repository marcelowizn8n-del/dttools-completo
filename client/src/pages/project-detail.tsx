import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Users, Target, Lightbulb, Wrench, TestTube, Calendar, BarChart3, Brain, Columns3, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@shared/schema";
import Phase1Tools from "@/components/phase1/Phase1Tools";
import Phase2Tools from "@/components/phase2/Phase2Tools";
import Phase3Tools from "@/components/phase3/Phase3Tools";
import Phase4Tools from "@/components/phase4/Phase4Tools";
import Phase5Tools from "@/components/phase5/Phase5Tools";
import AnalysisReport from "@/components/AnalysisReport";
import { KanbanBoard } from "@/components/KanbanBoard";
import BackupManager from "@/components/BackupManager";
import { DoubleDiamond } from "@/components/DoubleDiamond";

const phaseData = {
  1: { 
    icon: Users, 
    title: "Empatizar", 
    description: "Entenda profundamente seus usuários",
    color: "bg-red-100 text-red-700 border-red-200",
    tools: ["Mapa de Empatia", "Personas", "Entrevistas", "Observações"]
  },
  2: { 
    icon: Target, 
    title: "Definir", 
    description: "Defina claramente o problema a resolver",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    tools: ["POV Statements", "How Might We", "Problem Statements"]
  },
  3: { 
    icon: Lightbulb, 
    title: "Idear", 
    description: "Gere ideias criativas para soluções",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    tools: ["Brainstorming", "Categorização", "Priorização"]
  },
  4: { 
    icon: Wrench, 
    title: "Prototipar", 
    description: "Construa versões testáveis das suas ideias",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    tools: ["Protótipos Digitais", "Protótipos Físicos", "Storyboards"]
  },
  5: { 
    icon: TestTube, 
    title: "Testar", 
    description: "Valide suas soluções com usuários reais",
    color: "bg-green-100 text-green-700 border-green-200",
    tools: ["Planos de Teste", "Coleta de Feedback", "Análise de Resultados"]
  },
};

function PhaseCard({ phaseNumber, isActive, isCompleted, onClick, isUpdating }: { 
  phaseNumber: number; 
  isActive: boolean; 
  isCompleted: boolean;
  onClick: () => void;
  isUpdating: boolean;
}) {
  const phase = phaseData[phaseNumber as keyof typeof phaseData];
  const Icon = phase.icon;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('PhaseCard clicked:', phaseNumber);
    if (!isUpdating) {
      onClick();
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 select-none ${
        isUpdating 
          ? "opacity-50 cursor-not-allowed" 
          : "cursor-pointer hover:shadow-lg"
      } ${
        isActive 
          ? `border-2 ${phase.color} shadow-md` 
          : isCompleted 
          ? "border-green-200 bg-green-50 hover:bg-green-100" 
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
      data-testid={`card-phase-${phaseNumber}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            isActive 
              ? phase.color 
              : isCompleted 
              ? "bg-green-100 text-green-700" 
              : "bg-gray-100 text-gray-500"
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">
              Fase {phaseNumber}: {phase.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {phase.description}
            </CardDescription>
          </div>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800">Concluída</Badge>
          )}
          {isActive && (
            <Badge className="bg-blue-100 text-blue-800">Atual</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Ferramentas:</h4>
          <div className="flex flex-wrap gap-1">
            {phase.tools.map((tool) => (
              <Badge 
                key={tool} 
                variant="outline" 
                className="text-xs"
                data-testid={`badge-tool-${tool.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id;

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error("Project not found");
      return response.json();
    },
    enabled: !!projectId,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/projects", projectId, "stats"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/stats`);
      if (!response.ok) throw new Error("Stats not found");
      return response.json();
    },
    enabled: !!projectId,
  });

  // Mutation to update project phase
  const updatePhaseMutation = useMutation({
    mutationFn: async (newPhase: number) => {
      console.log('Making API request to update phase:', newPhase, 'for project:', projectId);
      const result = await apiRequest('PUT', `/api/projects/${projectId}`, { currentPhase: newPhase });
      console.log('API request successful:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Phase update successful:', data);
      // Invalidate and refetch project data
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "stats"] });
    },
    onError: (error) => {
      console.error('Phase update failed:', error);
    },
  });

  const handlePhaseChange = (phaseNumber: number) => {
    console.log('Phase change requested:', { 
      phaseNumber, 
      currentPhase: project?.currentPhase, 
      isPending: updatePhaseMutation.isPending,
      projectId 
    });
    
    if (!project) {
      console.error('No project data available');
      return;
    }

    if (updatePhaseMutation.isPending) {
      console.log('Mutation already pending, skipping');
      return;
    }

    if (phaseNumber !== project.currentPhase) {
      console.log('Updating phase from', project.currentPhase, 'to', phaseNumber);
      updatePhaseMutation.mutate(phaseNumber);
    } else {
      console.log('Phase already selected:', phaseNumber);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Projeto não encontrado</h2>
          <p className="text-gray-600 mb-6">O projeto que você está procurando não existe ou foi removido.</p>
          <Link href="/projects">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Projetos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail">
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="sm" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="heading-project-name">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-gray-600 mt-1" data-testid="text-project-description">
              {project.description}
            </p>
          )}
        </div>
        <Badge 
          variant={project.status === "completed" ? "default" : "secondary"}
          className={project.status === "completed" ? "bg-green-100 text-green-800" : ""}
          data-testid="badge-project-status"
        >
          {project.status === "completed" ? "Concluído" : "Em andamento"}
        </Badge>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2" data-testid="text-completion-rate">
              {project.completionRate}%
            </div>
            <Progress value={project.completionRate || 0} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fase Atual</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-current-phase">
              Fase {project.currentPhase}
            </div>
            <p className="text-xs text-muted-foreground">
              {project.currentPhase ? phaseData[project.currentPhase as keyof typeof phaseData]?.title : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Criado em</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-created-date">
              {project.createdAt ? new Date(project.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats && `${stats.completedTools}/${stats.totalTools} ferramentas`}
            </p>
          </CardContent>
        </Card>
      </div>

      <DoubleDiamond currentPhase={project.currentPhase} />

      {/* Main Content with Tabs */}
      <Tabs defaultValue="phases" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="phases" data-testid="tab-phases">
            Fases & Ferramentas
          </TabsTrigger>
          <TabsTrigger value="kanban" data-testid="tab-kanban">
            <Columns3 className="w-4 h-4 mr-2" />
            Board Kanban
          </TabsTrigger>
          <TabsTrigger value="analysis" data-testid="tab-analysis">
            <Brain className="w-4 h-4 mr-2" />
            Análise Inteligente IA
          </TabsTrigger>
          <TabsTrigger value="backups" data-testid="tab-backups">
            <Save className="w-4 h-4 mr-2" />
            Backups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phases" className="space-y-6">
          {/* Design Thinking Phases */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Fases do Design Thinking</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map((phaseNumber) => (
                <PhaseCard
                  key={phaseNumber}
                  phaseNumber={phaseNumber}
                  isActive={(project.currentPhase || 1) === phaseNumber}
                  isCompleted={(project.currentPhase || 1) > phaseNumber}
                  onClick={() => handlePhaseChange(phaseNumber)}
                  isUpdating={updatePhaseMutation.isPending}
                />
              ))}
              
              {/* Benchmarking Card */}
              <Card className="bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-200 hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-600 text-white">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-purple-900">
                        Benchmarking
                      </CardTitle>
                      <CardDescription className="text-sm text-purple-700">
                        Compare sua maturidade em Design Thinking
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href="/benchmarking">
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                      data-testid="button-benchmarking"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Acessar Benchmarking
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Phase Tools */}
          {project.currentPhase === 1 ? (
            <Phase1Tools projectId={project.id} />
          ) : project.currentPhase === 2 ? (
            <Phase2Tools projectId={project.id} />
          ) : project.currentPhase === 3 ? (
            <Phase3Tools projectId={project.id} />
          ) : project.currentPhase === 4 ? (
            <Phase4Tools projectId={project.id} />
          ) : project.currentPhase === 5 ? (
            <Phase5Tools projectId={project.id} />
          ) : (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Em Desenvolvimento</CardTitle>
                <CardDescription className="text-blue-700">
                  As ferramentas para esta fase estao sendo desenvolvidas. 
                  Complete as fases anteriores para desbloquear as proximas fases!
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="kanban" className="space-y-6">
          <KanbanBoard projectId={project.id} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <AnalysisReport projectId={project.id} />
        </TabsContent>

        <TabsContent value="backups" className="space-y-6">
          <BackupManager projectId={project.id} />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}