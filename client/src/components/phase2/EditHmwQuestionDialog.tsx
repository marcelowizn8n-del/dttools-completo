import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHmwQuestionSchema, type HmwQuestion, type InsertHmwQuestion } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface EditHmwQuestionDialogProps {
  hmwQuestion: HmwQuestion;
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface HmwQuestionFormData {
  question: string;
  context: string;
  challenge: string;
  scope: string;
  priority: string;
}

export default function EditHmwQuestionDialog({ hmwQuestion, projectId, isOpen, onOpenChange }: EditHmwQuestionDialogProps) {
  const { toast } = useToast();

  const form = useForm<HmwQuestionFormData>({
    resolver: zodResolver(insertHmwQuestionSchema.pick({
      question: true,
      context: true,
      challenge: true,
      scope: true,
      priority: true,
    })),
    defaultValues: {
      question: hmwQuestion.question || "",
      context: hmwQuestion.context || "",
      challenge: hmwQuestion.challenge || "",
      scope: hmwQuestion.scope || "product",
      priority: hmwQuestion.priority || "medium",
    },
  });

  const updateHmwQuestionMutation = useMutation({
    mutationFn: async (data: Partial<InsertHmwQuestion>) => {
      const response = await apiRequest("PUT", `/api/hmw-questions/${hmwQuestion.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "hmw-questions"] });
      toast({
        title: "How Might We atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a How Might We question.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HmwQuestionFormData) => {
    updateHmwQuestionMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar How Might We</DialogTitle>
          <DialogDescription>
            Atualize sua pergunta "Como poderíamos..." para explorar novas oportunidades de design.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pergunta HMW</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Como poderíamos... (ex: Como poderíamos tornar a experiência de compra mais intuitiva?)"
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-edit-hmw-question"
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
                      placeholder="Forneça contexto sobre a situação atual ou problema observado..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-edit-hmw-context"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="challenge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desafio Principal</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Qual é o principal desafio ou obstáculo que esta pergunta pretende abordar?"
                      className="resize-none"
                      rows={2}
                      {...field}
                      data-testid="input-edit-hmw-challenge"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escopo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-hmw-scope">
                        <SelectValue placeholder="Selecione o escopo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="feature">Funcionalidade</SelectItem>
                      <SelectItem value="product">Produto</SelectItem>
                      <SelectItem value="service">Serviço</SelectItem>
                      <SelectItem value="experience">Experiência</SelectItem>
                      <SelectItem value="process">Processo</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectTrigger data-testid="select-edit-hmw-priority">
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
                disabled={updateHmwQuestionMutation.isPending}
                data-testid="button-save-edit"
              >
                {updateHmwQuestionMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}