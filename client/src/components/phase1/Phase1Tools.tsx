import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, MessageCircle, Eye, Grid3x3, List } from "lucide-react";
import EmpathyMapTool from "./EmpathyMapTool";
import PersonaTool from "./PersonaTool";
import InterviewTool from "./InterviewTool";
import ObservationTool from "./ObservationTool";
import ToolsSummary from "@/components/ToolsSummary";

interface Phase1ToolsProps {
  projectId: string;
}

export default function Phase1Tools({ projectId }: Phase1ToolsProps) {
  const [activeTab, setActiveTab] = useState("empathy-maps");
  const [viewMode, setViewMode] = useState<'tools' | 'summary'>('tools');

  const tools = [
    {
      id: "empathy-maps",
      label: "Mapas de Empatia",
      icon: Users,
      color: "text-red-600",
      component: <EmpathyMapTool projectId={projectId} />
    },
    {
      id: "personas", 
      label: "Personas",
      icon: User,
      color: "text-blue-600",
      component: <PersonaTool projectId={projectId} />
    },
    {
      id: "interviews",
      label: "Entrevistas", 
      icon: MessageCircle,
      color: "text-green-600",
      component: <InterviewTool projectId={projectId} />
    },
    {
      id: "observations",
      label: "Observações",
      icon: Eye,
      color: "text-purple-600", 
      component: <ObservationTool projectId={projectId} />
    }
  ];

  const handleToolSelect = (toolId: string) => {
    setActiveTab(toolId);
    setViewMode('tools');
  };

  if (viewMode === 'summary') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fase 1: Empatizar</h2>
            <p className="text-sm text-gray-600">Navegue pelas ferramentas disponíveis</p>
          </div>
          <Button
            onClick={() => setViewMode('tools')}
            variant="outline"
            data-testid="button-tools-view"
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Ver Ferramentas
          </Button>
        </div>
        <ToolsSummary 
          onToolSelect={handleToolSelect} 
          currentPhase={1}
          compact={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Simplificado */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-red-600" />
              <div>
                <CardTitle className="text-xl text-red-800">Fase 1: Empatizar</CardTitle>
                <p className="text-red-700 text-sm">4 ferramentas disponíveis</p>
              </div>
            </div>
            <Button
              onClick={() => setViewMode('summary')}
              variant="outline"
              size="sm"
              data-testid="button-summary-view"
            >
              <List className="w-4 h-4 mr-2" />
              Índice
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs das Ferramentas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <TabsTrigger
                key={tool.id}
                value={tool.id}
                className="flex flex-col items-center gap-2 p-3 h-auto"
                data-testid={`tab-${tool.id}`}
              >
                <Icon className={`w-5 h-5 ${tool.color}`} />
                <span className="text-xs font-medium">{tool.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tools.map((tool) => (
          <TabsContent 
            key={tool.id} 
            value={tool.id} 
            className="mt-6"
            data-testid={`content-${tool.id}`}
          >
            {tool.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}