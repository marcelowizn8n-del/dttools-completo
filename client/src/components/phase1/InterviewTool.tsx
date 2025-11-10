import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, MessageCircle, Clock, Calendar } from "lucide-react";
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
import { insertInterviewSchema, type Interview, type InsertInterview } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import EditInterviewDialog from "./EditInterviewDialog";

interface InterviewToolProps {
  projectId: string;
}

function InterviewCard({ interview, projectId }: { interview: Interview; projectId: string }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const deleteInterviewMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/interviews/${interview.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete interview");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interviews"] });
      toast({
        title: "Entrevista excluída",
        description: "A entrevista foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a entrevista.",
        variant: "destructive",
      });
    },
  });

  const questions = interview.questions as string[] || [];
  const responses = interview.responses as string[] || [];

  return (
    <Card className="w-full" data-testid={`card-interview-${interview.id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg" data-testid={`text-interview-participant-${interview.id}`}>
              {interview.participantName}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1" data-testid={`text-interview-date-${interview.id}`}>
                <Calendar className="w-4 h-4" />
                {new Date(interview.date).toLocaleDateString('pt-BR')}
              </span>
              {interview.duration && (
                <span className="flex items-center gap-1" data-testid={`text-interview-duration-${interview.id}`}>
                  <Clock className="w-4 h-4" />
                  {interview.duration} min
                </span>
              )}
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {questions.length} perguntas
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              data-testid={`button-edit-${interview.id}`}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteInterviewMutation.mutate()}
              disabled={deleteInterviewMutation.isPending}
              data-testid={`button-delete-${interview.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Questions and Responses */}
        {questions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Perguntas e Respostas</h4>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4" data-testid={`qa-pair-${index}`}>
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs mb-1">
                      Pergunta {index + 1}
                    </Badge>
                    <p className="text-sm font-medium text-gray-800" data-testid={`text-question-${index}`}>
                      {question}
                    </p>
                  </div>
                  {responses[index] && (
                    <div>
                      <Badge variant="outline" className="text-xs mb-1 bg-green-50 text-green-700">
                        Resposta
                      </Badge>
                      <p className="text-sm text-gray-600" data-testid={`text-response-${index}`}>
                        {responses[index]}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {interview.insights && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
              💡 Insights
            </h4>
            <p className="text-sm text-gray-700" data-testid={`text-interview-insights-${interview.id}`}>
              {interview.insights}
            </p>
          </div>
        )}
      </CardContent>
      
      <EditInterviewDialog
        interview={interview}
        projectId={projectId}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
      />
    </Card>
  );
}

function CreateInterviewDialog({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState([""]);
  const [responses, setResponses] = useState([""]);

  const form = useForm<Omit<InsertInterview, 'projectId' | 'questions' | 'responses'>>({
    resolver: zodResolver(insertInterviewSchema.omit({ 
      projectId: true, 
      questions: true, 
      responses: true 
    })),
    defaultValues: {
      participantName: "",
      date: new Date(),
      duration: undefined,
      insights: "",
    },
  });

  const createInterviewMutation = useMutation({
    mutationFn: async (data: InsertInterview) => {
      console.log('Starting mutation with data:', data);
      const response = await fetch(`/api/projects/${projectId}/interviews`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.details || errorData.error || "Failed to create interview");
      }
      const result = await response.json();
      console.log('Success result:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interviews"] });
      toast({
        title: "Entrevista criada!",
        description: "Sua entrevista foi criada com sucesso.",
      });
      setIsOpen(false);
      form.reset();
      setQuestions([""]);
      setResponses([""]);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a entrevista.",
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    setQuestions([...questions, ""]);
    setResponses([...responses, ""]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
      setResponses(responses.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const updateResponse = (index: number, value: string) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);
  };

  const onSubmit = (formData: any) => {
    console.log('Form submitted - raw data:', formData);
    console.log('Questions state:', questions);
    console.log('Responses state:', responses);
    
    // Filtrar apenas pares onde a pergunta não está vazia
    const validPairs = questions
      .map((q, i) => ({ question: q, response: responses[i] || "" }))
      .filter(pair => pair.question.trim() !== "");
    
    console.log('Valid pairs:', validPairs);
    
    const interviewData: InsertInterview = {
      ...formData,
      projectId,
      questions: validPairs.map(p => p.question),
      responses: validPairs.map(p => p.response),
    };
    
    console.log('Final interview data to send:', interviewData);
    createInterviewMutation.mutate(interviewData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700" data-testid="button-create-interview">
          <Plus className="w-4 h-4 mr-2" />
          Nova Entrevista
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Entrevista</DialogTitle>
          <DialogDescription>
            Documente uma entrevista com usuário incluindo perguntas, respostas e insights.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="participantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Participante *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: João Santos" 
                        {...field} 
                        data-testid="input-participant-name"
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
                        placeholder="45" 
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Entrevista *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      value={field.value instanceof Date && !isNaN(field.value.getTime()) 
                        ? field.value.toISOString().split('T')[0] 
                        : ''}
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const value = e.target.value;
                        if (value) {
                          field.onChange(new Date(value + 'T00:00:00'));
                        } else {
                          field.onChange(undefined);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevenir digitação manual - apenas permitir Tab e Escape
                        if (e.key !== 'Tab' && e.key !== 'Escape') {
                          e.preventDefault();
                        }
                      }}
                      data-testid="input-interview-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Questions and Responses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-gray-700">Perguntas e Respostas</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuestion}
                  data-testid="button-add-question"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar Pergunta
                </Button>
              </div>
              
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        Pergunta {index + 1}
                      </Badge>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          data-testid={`button-remove-question-${index}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Digite a pergunta..."
                        value={question}
                        onChange={(e) => updateQuestion(index, e.target.value)}
                        className="resize-none"
                        rows={2}
                        data-testid={`input-question-${index}`}
                      />
                      <Textarea
                        placeholder="Digite a resposta (opcional)..."
                        value={responses[index] || ""}
                        onChange={(e) => updateResponse(index, e.target.value)}
                        className="resize-none"
                        rows={3}
                        data-testid={`input-response-${index}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="insights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insights</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Anote os principais insights desta entrevista..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                      data-testid="input-insights"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
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
                disabled={createInterviewMutation.isPending}
                data-testid="button-submit"
              >
                {createInterviewMutation.isPending ? "Criando..." : "Criar Entrevista"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function InterviewTool({ projectId }: InterviewToolProps) {
  const { data: interviews = [], isLoading } = useQuery<Interview[]>({
    queryKey: ["/api/projects", projectId, "interviews"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/interviews`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch interviews");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Entrevistas</h3>
          <p className="text-gray-600 text-sm">
            Documente entrevistas com usuários para capturar insights valiosos
          </p>
        </div>
        <CreateInterviewDialog projectId={projectId} />
      </div>

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma entrevista documentada
          </h3>
          <p className="text-gray-600 mb-6">
            Comece documentando sua primeira entrevista com usuários
          </p>
          <CreateInterviewDialog projectId={projectId} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {interviews.map((interview) => (
            <InterviewCard 
              key={interview.id} 
              interview={interview} 
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}