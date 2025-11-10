import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Tag, TrendingUp, PenTool } from "lucide-react";
import IdeaTool from "./IdeaTool";
import IdeaDrawingTool from "./IdeaDrawingTool";

interface Phase3ToolsProps {
  projectId: string;
}

export default function Phase3Tools({ projectId }: Phase3ToolsProps) {
  const [activeTab, setActiveTab] = useState("brainstorming");

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-600 font-semibold text-sm">3</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fase 3: Idear</h1>
            <p className="text-gray-600">
              Gere ideias criativas e inovadoras para resolver os problemas identificados
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-1">
          <TabsTrigger value="brainstorming" className="flex items-center justify-center gap-2 text-xs sm:text-sm px-2 py-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Brainstorming</span>
            <span className="sm:hidden">Ideias</span>
          </TabsTrigger>
          <TabsTrigger value="drawing" className="flex items-center justify-center gap-2 text-xs sm:text-sm px-2 py-2">
            <PenTool className="w-4 h-4" />
            <span>Desenho</span>
          </TabsTrigger>
          <TabsTrigger value="categorization" className="flex items-center justify-center gap-2 text-xs sm:text-sm px-2 py-2">
            <Tag className="w-4 h-4" />
            <span className="hidden sm:inline">Categorização</span>
            <span className="sm:hidden">Categorias</span>
          </TabsTrigger>
          <TabsTrigger value="prioritization" className="flex items-center justify-center gap-2 text-xs sm:text-sm px-2 py-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Priorização</span>
            <span className="sm:hidden">Prioridade</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brainstorming" className="space-y-6">
          <IdeaTool projectId={projectId} />
        </TabsContent>

        <TabsContent value="drawing" className="space-y-6">
          <IdeaDrawingTool projectId={projectId} />
        </TabsContent>

        <TabsContent value="categorization" className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Categorização de Ideias</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Esta ferramenta permite organizar e categorizar suas ideias por temas ou áreas de foco.
            </p>
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">📋 Como usar:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>No formulário de criação de ideias, defina uma categoria para cada ideia</li>
                <li>Use categorias consistentes como: "Tecnologia", "Sustentabilidade", "Social", etc.</li>
                <li>As ideias serão automaticamente agrupadas por categoria na visualização</li>
                <li>Edite ideias existentes para adicionar ou alterar categorias</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prioritization" className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Priorização de Ideias</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Avalie e priorise suas ideias com base em viabilidade, impacto e votação da equipe.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">🎯 Sistema de Votação</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Clique no botão "+1" para votar em ideias</li>
                  <li>As ideias são ordenadas por número de votos</li>
                  <li>Ideias mais votadas aparecem no topo</li>
                </ul>
              </div>
              
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">⭐ Matriz Impacto x Viabilidade</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li><strong>Viabilidade:</strong> Facilidade de implementação (1-5)</li>
                  <li><strong>Impacto:</strong> Potencial de solução do problema (1-5)</li>
                  <li>Ideias com alta viabilidade + alto impacto = prioridade máxima</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">🚀 Recomendações de Priorização:</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-medium text-green-700">Alto Impacto + Alta Viabilidade:</span>
                  <p className="text-gray-600">Implemente primeiro (Quick Wins)</p>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Alto Impacto + Baixa Viabilidade:</span>
                  <p className="text-gray-600">Projetos de longo prazo</p>
                </div>
                <div>
                  <span className="font-medium text-yellow-700">Baixo Impacto + Alta Viabilidade:</span>
                  <p className="text-gray-600">Projetos de apoio</p>
                </div>
                <div>
                  <span className="font-medium text-red-700">Baixo Impacto + Baixa Viabilidade:</span>
                  <p className="text-gray-600">Considere descartar</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}