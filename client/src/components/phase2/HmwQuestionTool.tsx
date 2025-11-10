import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, HelpCircle, ThumbsUp, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHmwQuestionSchema, type HmwQuestion, type InsertHmwQuestion } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import EditHmwQuestionDialog from "./EditHmwQuestionDialog";

interface HmwQuestionToolProps {
  projectId: string;
}

function HmwQuestionCard({ hmwQuestion, projectId }: { hmwQuestion: HmwQuestion; projectId: string }) {
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const deleteHmwQuestionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/hmw-questions/${hmwQuestion.id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "hmw-questions"] });
      toast({
        title: "Pergunta HMW excluída",
        description: "A pergunta How Might We foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a pergunta HMW.",
        variant: "destructive",
      });
    },
  });

  const voteHmwQuestionMutation = useMutation({
    mutationFn: async () => {
      const newVotes = (hmwQuestion.votes || 0) + 1;
      const response = await apiRequest("PUT", `/api/hmw-questions/${hmwQuestion.id}`, {
        votes: newVotes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "hmw-questions"] });
      toast({
        title: "Voto registrado!",
        description: "Seu voto foi contabilizado para esta pergunta.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar o voto.",
        variant: "destructive",
      });
    },
  });

  const handleVote = () => {
    setIsVoting(true);
    voteHmwQuestionMutation.mutate();
    setTimeout(() => setIsVoting(false), 1000);
  };

  return (
    <Card className="w-full" data-testid={`card-hmw-question-${hmwQuestion.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {hmwQuestion.category && (
                <Badge variant="outline" className="text-xs" data-testid={`badge-category-${hmwQuestion.id}`}>
                  <Tag className="w-3 h-3 mr-1" />
                  {hmwQuestion.category}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs" data-testid={`badge-votes-${hmwQuestion.id}`}>
                <ThumbsUp className="w-3 h-3 mr-1" />
                {hmwQuestion.votes || 0} votos
              </Badge>
            </div>
            <CardDescription className="text-sm text-gray-600">
              Criada em {hmwQuestion.createdAt ? new Date(hmwQuestion.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVote}
              disabled={isVoting || voteHmwQuestionMutation.isPending}
              data-testid={`button-vote-${hmwQuestion.id}`}
            >
              <ThumbsUp className="w-4 h-4" />
              {isVoting ? "..." : "+1"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              data-testid={`button-edit-${hmwQuestion.id}`}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteHmwQuestionMutation.mutate()}
              disabled={deleteHmwQuestionMutation.isPending}
              data-testid={`button-delete-${hmwQuestion.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
            <HelpCircle className="w-4 h-4 text-orange-600" />
            How Might We...
          </h4>
          <p className="text-lg text-gray-900 font-medium" data-testid={`text-hmw-question-${hmwQuestion.id}`}>
            {hmwQuestion.question}
          </p>
        </div>
      </CardContent>
      
      <EditHmwQuestionDialog
        hmwQuestion={hmwQuestion}
        projectId={projectId}
        isOpen={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </Card>
  );
}

function CreateHmwQuestionDialog({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<Omit<InsertHmwQuestion, 'projectId'>>({
    resolver: zodResolver(insertHmwQuestionSchema.omit({ 
      projectId: true,
      votes: true,
    })),
    defaultValues: {
      question: "",
      category: "",
    },
  });

  const createHmwQuestionMutation = useMutation({
    mutationFn: async (data: InsertHmwQuestion) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/hmw-questions`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "hmw-questions"] });
      toast({
        title: "Pergunta HMW criada!",
        description: "Sua pergunta How Might We foi criada com sucesso.",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a pergunta HMW.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Omit<InsertHmwQuestion, 'projectId'>) => {
    const submitData: InsertHmwQuestion = {
      ...data,
      projectId: projectId,
      votes: 0,
    };
    createHmwQuestionMutation.mutate(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" data-testid="button-create-hmw-question">
          <Plus className="w-4 h-4 mr-2" />
          Nova Pergunta HMW
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Pergunta "How Might We"</DialogTitle>
          <DialogDescription>
            As perguntas "How Might We" (Como Poderíamos) transformam problemas em oportunidades de design, abrindo espaço para soluções criativas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pergunta "How Might We"</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Como poderíamos... (ex: tornar o processo de entrega mais sustentável?)"
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-hmw-question"
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-gray-500 mt-1">
                    💡 Dica: Comece com "Como poderíamos..." e foque em uma oportunidade específica
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Sustentabilidade, UX, Tecnologia..."
                      {...field}
                      value={field.value || ""}
                      data-testid="input-hmw-category"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-sm text-blue-800 mb-2">📋 Boas práticas para HMW:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Seja específico, mas não prescritivo</li>
                <li>• Foque em oportunidades, não em soluções</li>
                <li>• Use linguagem positiva e inspiradora</li>
                <li>• Mantenha o escopo aberto para criatividade</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createHmwQuestionMutation.isPending}
                data-testid="button-submit"
              >
                {createHmwQuestionMutation.isPending ? "Criando..." : "Criar Pergunta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function HmwQuestionTool({ projectId }: HmwQuestionToolProps) {
  const { data: hmwQuestions, isLoading } = useQuery<HmwQuestion[]>({
    queryKey: ["/api/projects", projectId, "hmw-questions"],
  });

  // Sort questions by votes (descending) and then by creation date
  const sortedQuestions = hmwQuestions ? 
    [...hmwQuestions].sort((a, b) => {
      const voteDiff = (b.votes || 0) - (a.votes || 0);
      if (voteDiff !== 0) return voteDiff;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">How Might We</h2>
            <p className="text-gray-600">Transforme problemas em oportunidades de design</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">How Might We</h2>
          <p className="text-gray-600">
            Transforme problemas em oportunidades de design através de perguntas estratégicas
          </p>
        </div>
        <CreateHmwQuestionDialog projectId={projectId} />
      </div>

      {sortedQuestions.length > 0 ? (
        <div className="grid gap-4">
          {sortedQuestions.map((hmwQuestion: HmwQuestion) => (
            <HmwQuestionCard
              key={hmwQuestion.id}
              hmwQuestion={hmwQuestion}
              projectId={projectId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma pergunta HMW</h3>
          <p className="text-gray-600 mb-6">
            Comece criando suas primeiras perguntas "How Might We" para transformar problemas em oportunidades.
          </p>
          <CreateHmwQuestionDialog projectId={projectId} />
        </div>
      )}
    </div>
  );
}