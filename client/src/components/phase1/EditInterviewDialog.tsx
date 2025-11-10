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
import { insertInterviewSchema, type Interview, type InsertInterview } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface EditInterviewDialogProps {
  interview: Interview;
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InterviewFormData {
  participantName: string;
  duration: number;
  insights: string;
}

export default function EditInterviewDialog({ interview, projectId, isOpen, onOpenChange }: EditInterviewDialogProps) {
  const { toast } = useToast();

  const form = useForm<InterviewFormData>({
    resolver: zodResolver(insertInterviewSchema.pick({
      participantName: true,
      duration: true,
      insights: true,
    })),
    defaultValues: {
      participantName: interview.participantName || "",
      duration: interview.duration || 0,
      insights: interview.insights || "",
    },
  });

  const updateInterviewMutation = useMutation({
    mutationFn: async (data: Partial<InsertInterview>) => {
      const response = await apiRequest("PUT", `/api/interviews/${interview.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interviews"] });
      toast({
        title: "Entrevista atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a entrevista.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InterviewFormData) => {
    const updateData: Partial<InsertInterview> = {
      participantName: data.participantName,
      duration: data.duration,
      insights: data.insights,
    };
    updateInterviewMutation.mutate(updateData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Entrevista</DialogTitle>
          <DialogDescription>
            Atualize as informações da entrevista com o usuário.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="participantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Participante</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do entrevistado"
                        {...field}
                        data-testid="input-edit-interview-participant-name"
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
                        placeholder="Duração em minutos"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-edit-interview-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="insights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insights da Entrevista</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Principais descobertas e insights da entrevista..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      data-testid="input-edit-interview-insights"
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
                disabled={updateInterviewMutation.isPending}
                data-testid="button-save-edit"
              >
                {updateInterviewMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}