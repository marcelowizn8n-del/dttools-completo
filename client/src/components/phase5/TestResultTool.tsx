import { useQuery } from "@tanstack/react-query";
import { FileText, Users, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { TestPlan } from "@shared/schema";

interface TestResultToolProps {
  projectId: string;
}

export default function TestResultTool({ projectId }: TestResultToolProps) {
  const { data: testPlans = [], isLoading } = useQuery<TestPlan[]>({
    queryKey: ['/api/projects', projectId, 'test-plans'],
  });

  // Para demonstração, vamos simular alguns resultados
  const getMockResults = (testPlan: TestPlan) => {
    const completedTests = Math.floor(Math.random() * testPlan.participants);
    const successRate = Math.floor(Math.random() * 40) + 60; // 60-100%
    const avgTime = Math.floor(Math.random() * 20) + 5; // 5-25 min
    
    return {
      completedTests,
      successRate,
      avgTime,
      insights: [
        "Usuários tiveram dificuldade com o menu principal",
        "O fluxo de checkout foi intuitivo para 80% dos participantes",
        "Necessário melhorar as instruções na tela inicial"
      ]
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
        </div>
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completedTests = testPlans.filter(plan => plan.status === 'completed');
  const runningTests = testPlans.filter(plan => plan.status === 'running');

  if (testPlans.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum resultado ainda</h3>
          <p className="text-gray-600 text-center">
            Crie planos de teste e execute-os para ver os resultados aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
        <p className="text-sm text-gray-600">
          Acompanhe os resultados e insights dos seus testes de usabilidade
        </p>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Testes Concluídos</p>
                <p className="text-2xl font-bold" data-testid="text-completed-tests">
                  {completedTests.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold" data-testid="text-running-tests">
                  {runningTests.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Planos</p>
                <p className="text-2xl font-bold" data-testid="text-total-plans">
                  {testPlans.length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados Detalhados */}
      <div className="space-y-4">
        {testPlans.map((testPlan) => {
          const mockResults = getMockResults(testPlan);
          const isCompleted = testPlan.status === 'completed';
          const isRunning = testPlan.status === 'running';
          
          return (
            <Card key={testPlan.id} data-testid={`card-test-result-${testPlan.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{testPlan.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {isCompleted ? mockResults.completedTests : isRunning ? Math.floor(mockResults.completedTests / 2) : 0} / {testPlan.participants}
                        </span>
                      </div>
                      {testPlan.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{testPlan.duration} min planejado</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge 
                    className={
                      testPlan.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                      testPlan.status === 'running' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      'bg-blue-100 text-blue-700 border-blue-200'
                    }
                  >
                    {testPlan.status === 'completed' ? 'Finalizado' :
                     testPlan.status === 'running' ? 'Em andamento' : 'Planejado'}
                  </Badge>
                </div>
              </CardHeader>
              
              {(isCompleted || isRunning) && (
                <CardContent>
                  <div className="space-y-4">
                    {/* Progresso */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progresso dos Testes</span>
                        <span>
                          {isCompleted ? mockResults.completedTests : Math.floor(mockResults.completedTests / 2)} / {testPlan.participants}
                        </span>
                      </div>
                      <Progress 
                        value={isCompleted ? 100 : (Math.floor(mockResults.completedTests / 2) / testPlan.participants) * 100}
                        className="h-2"
                      />
                    </div>

                    {isCompleted && (
                      <>
                        {/* Métricas */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{mockResults.successRate}%</p>
                            <p className="text-xs text-gray-600">Taxa de Sucesso</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{mockResults.avgTime}min</p>
                            <p className="text-xs text-gray-600">Tempo Médio</p>
                          </div>
                        </div>

                        {/* Insights */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Principais Insights</h4>
                          <ul className="space-y-1">
                            {mockResults.insights.map((insight, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    {isRunning && (
                      <div className="text-sm text-gray-600 italic">
                        Teste em andamento... Resultados parciais serão exibidos conforme os participantes completarem as tarefas.
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
              
              {testPlan.status === 'planned' && (
                <CardContent>
                  <div className="text-sm text-gray-600 italic">
                    Este teste ainda não foi iniciado. Inicie a execução para começar a coleta de resultados.
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}