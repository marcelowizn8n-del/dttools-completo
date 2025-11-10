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
import { insertIdeaSchema, type Idea, type InsertIdea } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface EditIdeaDialogProps {
  idea: Idea;
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface IdeaFormData {
  title: string;
  description: string;
  category: string;
  feasibility?: number;
  impact?: number;
  status: string;
}

export default function EditIdeaDialog({ idea, projectId, isOpen, onOpenChange }: EditIdeaDialogProps) {
  const { toast } = useToast();

  const form = useForm<IdeaFormData>({
    resolver: zodResolver(insertIdeaSchema.pick({
      title: true,
      description: true,
      category: true,
      feasibility: true,
      impact: true,
      status: true,
    })),
    defaultValues: {
      title: idea.title || "",
      description: idea.description || "",
      category: idea.category || "",
      feasibility: idea.feasibility || undefined,
      impact: idea.impact || undefined,
      status: idea.status || "idea",
    },
  });

  const updateIdeaMutation = useMutation({
    mutationFn: async (data: Partial<InsertIdea>) => {
      const response = await apiRequest("PUT", `/api/ideas/${idea.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "ideas"] });
      toast({
        title: "Ideia atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a ideia.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IdeaFormData) => {
    updateIdeaMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Ideia</DialogTitle>
          <DialogDescription>
            Atualize as informações da sua ideia.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Ideia</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: App de carona solidária para universitários"
                      {...field}
                      data-testid="input-edit-idea-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva sua ideia em detalhes. Como ela funcionaria? Que problemas resolveria?"
                      className="resize-none"
                      rows={4}
                      {...field}
                      data-testid="input-edit-idea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Tecnologia, Sustentabilidade, Social, etc."
                      {...field}
                      value={field.value || ""}
                      data-testid="input-edit-idea-category"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="feasibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Viabilidade</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-idea-feasibility">
                          <SelectValue placeholder="Avaliar viabilidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Não avaliado</SelectItem>
                        <SelectItem value="1">1 - Muito difícil</SelectItem>
                        <SelectItem value="2">2 - Difícil</SelectItem>
                        <SelectItem value="3">3 - Moderado</SelectItem>
                        <SelectItem value="4">4 - Fácil</SelectItem>
                        <SelectItem value="5">5 - Muito fácil</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impacto</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-idea-impact">
                          <SelectValue placeholder="Avaliar impacto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Não avaliado</SelectItem>
                        <SelectItem value="1">1 - Baixo impacto</SelectItem>
                        <SelectItem value="2">2 - Impacto menor</SelectItem>
                        <SelectItem value="3">3 - Impacto moderado</SelectItem>
                        <SelectItem value="4">4 - Alto impacto</SelectItem>
                        <SelectItem value="5">5 - Impacto transformador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status da Ideia</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-idea-status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="idea">Ideia</SelectItem>
                      <SelectItem value="selected">Selecionada</SelectItem>
                      <SelectItem value="prototype">Protótipo</SelectItem>
                      <SelectItem value="tested">Testada</SelectItem>
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
                disabled={updateIdeaMutation.isPending}
                data-testid="button-save-edit"
              >
                {updateIdeaMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}