import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestPlanTool from "./TestPlanTool";
import TestResultTool from "./TestResultTool";

interface Phase5ToolsProps {
  projectId: string;
}

export default function Phase5Tools({ projectId }: Phase5ToolsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Fase 5: Testar</h2>
        <p className="text-gray-600 mb-6">
          Valide suas soluções com usuários reais através de testes estruturados
        </p>
      </div>

      <Tabs defaultValue="test-plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test-plans" data-testid="tab-test-plans">
            Planos de Teste
          </TabsTrigger>
          <TabsTrigger value="test-results" data-testid="tab-test-results">
            Resultados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="test-plans" className="mt-6">
          <TestPlanTool projectId={projectId} />
        </TabsContent>

        <TabsContent value="test-results" className="mt-6">
          <TestResultTool projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}