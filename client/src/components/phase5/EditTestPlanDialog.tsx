import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditTestPlanDialogProps {
  testPlan: TestPlan;
}

export default function EditTestPlanDialog({ testPlan }: EditTestPlanDialogProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: prototypes = [] } = useQuery<any[]>({
    queryKey: ['/api/projects', testPlan.projectId, 'prototypes'],
  });

  const form = useForm<InsertTestPlan>({
    resolver: zodResolver(insertTestPlanSchema.extend({
      tasks: insertTestPlanSchema.shape.tasks.optional().default([]),
      metrics: insertTestPlanSchema.shape.metrics.optional().default([])
    })),
    defaultValues: {
      projectId: testPlan.projectId,
      name: testPlan.name,
      objective: testPlan.objective,
      methodology: testPlan.methodology,
      participants: testPlan.participants,
      duration: testPlan.duration || 60,
      tasks: testPlan.tasks || [],
      metrics: testPlan.metrics || [],
      status: testPlan.status,
      prototypeId: testPlan.prototypeId || "none",
    },
  });

  const updateTestPlan = useMutation({
    mutationFn: (data: Partial<InsertTestPlan>) =>
      apiRequest("PUT", `/api/test-plans/${testPlan.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', testPlan.projectId, 'test-plans'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Plano de teste atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o plano de teste.",
      });
    },
  });

  const deleteTestPlan = useMutation({
    mutationFn: () =>
      apiRequest("DELETE", `/api/test-plans/${testPlan.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', testPlan.projectId, 'test-plans'] });
      toast({
        title: "Plano de teste removido",
        description: "O plano de teste foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o plano de teste.",
      });
    },
  });

  const onSubmit = (data: InsertTestPlan) => {
    updateTestPlan.mutate(data);
  };

  const handleDelete = () => {
    deleteTestPlan.mutate();
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" data-testid={`button-edit-test-plan-${testPlan.id}`}>
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plano de Teste</DialogTitle>
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
                          data-testid="input-edit-test-plan-name"
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
                          <SelectTrigger data-testid="select-edit-prototype">
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "planned"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="planned">Planejado</SelectItem>
                          <SelectItem value="running">Em andamento</SelectItem>
                          <SelectItem value="completed">Finalizado</SelectItem>
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
                          data-testid="input-edit-participants"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="480"
                          data-testid="input-edit-duration"
                          {...field}
                          value={field.value || ""}
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
                        data-testid="textarea-edit-objective"
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
                        data-testid="textarea-edit-methodology"
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
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateTestPlan.isPending}
                  data-testid="button-save-test-plan"
                >
                  {updateTestPlan.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" data-testid={`button-delete-test-plan-${testPlan.id}`}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Plano de Teste</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o plano "{testPlan.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteTestPlan.isPending}
              data-testid="button-confirm-delete"
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteTestPlan.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}