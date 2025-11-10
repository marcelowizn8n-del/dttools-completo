import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertObservationSchema, type Observation, type InsertObservation } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface EditObservationDialogProps {
  observation: Observation;
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ObservationFormData {
  location: string;
  context: string;
  behavior: string;
  insights: string;
}

export default function EditObservationDialog({ observation, projectId, isOpen, onOpenChange }: EditObservationDialogProps) {
  const { toast } = useToast();

  const form = useForm<ObservationFormData>({
    resolver: zodResolver(insertObservationSchema.pick({
      location: true,
      context: true,
      behavior: true,
      insights: true,
    })),
    defaultValues: {
      location: observation.location || "",
      context: observation.context || "",
      behavior: observation.behavior || "",
      insights: observation.insights || "",
    },
  });

  const updateObservationMutation = useMutation({
    mutationFn: async (data: Partial<InsertObservation>) => {
      const response = await apiRequest("PUT", `/api/observations/${observation.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "observations"] });
      toast({
        title: "Observação atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a observação.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ObservationFormData) => {
    const updateData: Partial<InsertObservation> = {
      location: data.location,
      context: data.context,
      behavior: data.behavior,
      insights: data.insights,
    };
    updateObservationMutation.mutate(updateData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Observação</DialogTitle>
          <DialogDescription>
            Atualize as informações da observação de campo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local da Observação</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Onde a observação foi realizada..."
                      {...field}
                      data-testid="input-edit-observation-location"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contexto</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o contexto da observação..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-edit-observation-context"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="behavior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comportamento Observado</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o comportamento observado..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-edit-observation-behavior"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insights e Descobertas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Quais insights você obteve desta observação..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-edit-observation-insights"
                    />
                  </FormControl>
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
                disabled={updateObservationMutation.isPending}
                data-testid="button-save-edit"
              >
                {updateObservationMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}