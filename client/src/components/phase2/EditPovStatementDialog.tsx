import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPovStatementSchema, type PovStatement, type InsertPovStatement } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface EditPovStatementDialogProps {
  povStatement: PovStatement;
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PovStatementFormData {
  user: string;
  need: string;
  insight: string;
  statement: string;
  priority: string;
}

export default function EditPovStatementDialog({ povStatement, projectId, isOpen, onOpenChange }: EditPovStatementDialogProps) {
  const { toast } = useToast();

  const form = useForm<PovStatementFormData>({
    resolver: zodResolver(insertPovStatementSchema.pick({
      user: true,
      need: true,
      insight: true,
      statement: true,
      priority: true,
    })),
    defaultValues: {
      user: povStatement.user || "",
      need: povStatement.need || "",
      insight: povStatement.insight || "",
      statement: povStatement.statement || "",
      priority: povStatement.priority || "medium",
    },
  });

  const updatePovStatementMutation = useMutation({
    mutationFn: async (data: Partial<InsertPovStatement>) => {
      const response = await apiRequest("PUT", `/api/pov-statements/${povStatement.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "pov-statements"] });
      toast({
        title: "POV Statement atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o POV Statement.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PovStatementFormData) => {
    updatePovStatementMutation.mutate(data);
  };

  // Generate the complete POV statement when user types
  const watchedValues = form.watch();
  const autoStatement = watchedValues.user && watchedValues.need && watchedValues.insight
    ? `${watchedValues.user} precisa ${watchedValues.need} porque ${watchedValues.insight}.`
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar POV Statement</DialogTitle>
          <DialogDescription>
            Atualize as informações do seu Point of View Statement.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário (Quem?)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o usuário alvo (ex: Uma mãe ocupada de 35 anos...)"
                      className="resize-none"
                      rows={2}
                      {...field}
                      data-testid="input-edit-pov-user"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="need"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Necessidade (O que?)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a necessidade (ex: de uma forma rápida e confiável de...)"
                      className="resize-none"
                      rows={2}
                      {...field}
                      data-testid="input-edit-pov-need"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insight (Por que?)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o insight surpreendente (ex: ela valoriza mais a conveniência que o preço...)"
                      className="resize-none"
                      rows={2}
                      {...field}
                      data-testid="input-edit-pov-insight"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Auto-generated statement preview */}
            {autoStatement && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Preview do POV Statement:</h4>
                <p className="text-sm text-purple-800 italic">{autoStatement}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="statement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>POV Statement Completo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="O POV Statement completo será gerado automaticamente, mas você pode personalizá-lo..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || autoStatement}
                      data-testid="input-edit-pov-statement"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-pov-priority">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-edit"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updatePovStatementMutation.isPending}
                data-testid="button-save-edit"
              >
                {updatePovStatementMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}