import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, FileText, Users, Timer, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTestPlanSchema, type TestPlan, type InsertTestPlan } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EditTestPlanDialog from "./EditTestPlanDialog";

interface TestPlanToolProps {
  projectId: string;
}

export default function TestPlanTool({ projectId }: TestPlanToolProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: testPlans = [], isLoading } = useQuery<TestPlan[]>({
    queryKey: ['/api/projects', projectId, 'test-plans'],
  });

  const { data: prototypes = [] } = useQuery<any[]>({
    queryKey: ['/api/projects', projectId, 'prototypes'],
  });

  const form = useForm<InsertTestPlan>({
    resolver: zodResolver(insertTestPlanSchema.extend({
      tasks: insertTestPlanSchema.shape.tasks.optional().default([]),
      metrics: insertTestPlanSchema.shape.metrics.optional().default([])
    })),
    defaultValues: {
      projectId,
      name: "",
      objective: "",
      methodology: "",
      participants: 5,
      duration: 60,
      tasks: [],
      metrics: [],
      status: "planned",
      prototypeId: "none",
    },
  });

  const createTestPlan = useMutation({
    mutationFn: (data: InsertTestPlan) =>
      apiRequest("POST", `/api/projects/${projectId}/test-plans`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'test-plans'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Plano de teste criado!",
        description: "Seu plano de teste foi criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o plano de teste.",
      });
    },
  });

  const onSubmit = (data: InsertTestPlan) => {
    createTestPlan.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'running':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Planejado';
      case 'running':
        return 'Em andamento';
      case 'completed':
        return 'Finalizado';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Planos de Teste</h3>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Planos de Teste</h3>
          <p className="text-sm text-gray-600">
            Defina como você testará seus protótipos com usuários reais
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-test-plan">
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Plano de Teste</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nome do Plano</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Teste de Usabilidade do App"
                            data-testid="input-test-plan-name"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prototypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protótipo (Opcional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-prototype">
                              <SelectValue placeholder="Selecione um protótipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum protótipo</SelectItem>
                            {prototypes.map((prototype: any) => (
                              <SelectItem key={prototype.id} value={prototype.id || "none"}>
                                {prototype.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="participants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Participantes</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="100"
                            data-testid="input-participants"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo do Teste</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o que você quer descobrir com este teste"
                          className="min-h-[80px]"
                          data-testid="textarea-objective"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="methodology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metodologia</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva como o teste será conduzido"
                          className="min-h-[80px]"
                          data-testid="textarea-methodology"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTestPlan.isPending}
                    data-testid="button-create-test-plan"
                  >
                    {createTestPlan.isPending ? "Criando..." : "Criar Plano"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {testPlans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum plano de teste ainda</h3>
            <p className="text-gray-600 text-center mb-4">
              Comece criando seu primeiro plano de teste para validar seus protótipos
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-test-plan">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Plano
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {testPlans.map((testPlan) => (
            <Card key={testPlan.id} className="hover:shadow-md transition-shadow" data-testid={`card-test-plan-${testPlan.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{testPlan.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{testPlan.participants} participantes</span>
                      </div>
                      {testPlan.duration && (
                        <div className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          <span>{testPlan.duration} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(testPlan.status || "planned")}>
                      {getStatusLabel(testPlan.status || "planned")}
                    </Badge>
                    <EditTestPlanDialog testPlan={testPlan} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1 flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Objetivo
                    </h4>
                    <p className="text-sm text-gray-600">{testPlan.objective}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Metodologia</h4>
                    <p className="text-sm text-gray-600">{testPlan.methodology}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}