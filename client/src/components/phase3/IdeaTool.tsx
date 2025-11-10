import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Lightbulb, ThumbsUp, Star, TrendingUp, Tag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIdeaSchema, type Idea, type InsertIdea } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import EditIdeaDialog from "./EditIdeaDialog";

interface IdeaToolProps {
  projectId: string;
}

function IdeaCard({ idea, projectId }: { idea: Idea; projectId: string }) {
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const deleteIdeaMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/ideas/${idea.id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "ideas"] });
      toast({
        title: "Ideia excluída",
        description: "A ideia foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a ideia.",
        variant: "destructive",
      });
    },
  });

  const voteIdeaMutation = useMutation({
    mutationFn: async () => {
      const newVotes = (idea.votes || 0) + 1;
      const response = await apiRequest("PUT", `/api/ideas/${idea.id}`, {
        votes: newVotes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "ideas"] });
      toast({
        title: "Voto registrado!",
        description: "Seu voto foi contabilizado para esta ideia.",
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
    voteIdeaMutation.mutate();
    setTimeout(() => setIsVoting(false), 1000);
  };

  const statusColors = {
    idea: "bg-gray-100 text-gray-800",
    selected: "bg-blue-100 text-blue-800", 
    prototype: "bg-yellow-100 text-yellow-800",
    tested: "bg-green-100 text-green-800"
  };

  const statusLabels = {
    idea: "Ideia",
    selected: "Selecionada",
    prototype: "Protótipo",
    tested: "Testada"
  };

  return (
    <Card className="w-full" data-testid={`card-idea-${idea.id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className={`text-xs ${statusColors[idea.status as keyof typeof statusColors]}`}
                data-testid={`badge-status-${idea.id}`}
              >
                {statusLabels[idea.status as keyof typeof statusLabels]}
              </Badge>
              {idea.category && (
                <Badge variant="outline" className="text-xs" data-testid={`badge-category-${idea.id}`}>
                  <Tag className="w-3 h-3 mr-1" />
                  {idea.category}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-bold mb-2" data-testid={`text-idea-title-${idea.id}`}>
              {idea.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Criada em {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVote}
              disabled={isVoting || voteIdeaMutation.isPending}
              data-testid={`button-vote-${idea.id}`}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              {isVoting ? "..." : `+1 (${idea.votes || 0})`}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              data-testid={`button-edit-${idea.id}`}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleteIdeaMutation.isPending}
                  data-testid={`button-delete-${idea.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Excluir Ideia
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a ideia "{idea.title}"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid={`button-cancel-delete-${idea.id}`}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteIdeaMutation.mutate()}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    data-testid={`button-confirm-delete-${idea.id}`}
                  >
                    {deleteIdeaMutation.isPending ? "Excluindo..." : "Excluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
            <Lightbulb className="w-4 h-4 text-purple-600" />
            Descrição
          </h4>
          <p className="text-sm text-gray-700" data-testid={`text-idea-description-${idea.id}`}>
            {idea.description}
          </p>
        </div>

        {/* DVF Analysis Section */}
        {(idea.desirability || idea.viability || idea.feasibility || idea.dvfScore) && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Análise DVF (Design Thinking Framework)
            </h4>
            
            {/* DVF Scores Grid */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {/* Desirability */}
              <div className="bg-white border border-purple-200 rounded-lg p-3">
                <h5 className="font-medium text-xs text-gray-700 mb-1">Desejabilidade</h5>
                <p className="text-xs text-gray-600 mb-2">Satisfaz necessidade do usuário</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= (idea.desirability || 0) 
                          ? "fill-pink-500 text-pink-500" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">
                    {idea.desirability || 0}/5
                  </span>
                </div>
              </div>

              {/* Viability */}
              <div className="bg-white border border-purple-200 rounded-lg p-3">
                <h5 className="font-medium text-xs text-gray-700 mb-1">Viabilidade</h5>
                <p className="text-xs text-gray-600 mb-2">Potencial de negócio/lucro</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= (idea.viability || 0) 
                          ? "fill-green-500 text-green-500" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">
                    {idea.viability || 0}/5
                  </span>
                </div>
              </div>

              {/* Feasibility */}
              <div className="bg-white border border-purple-200 rounded-lg p-3">
                <h5 className="font-medium text-xs text-gray-700 mb-1">Exequibilidade</h5>
                <p className="text-xs text-gray-600 mb-2">Implementação técnica</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= (idea.feasibility || 0) 
                          ? "fill-blue-500 text-blue-500" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">
                    {idea.feasibility || 0}/5
                  </span>
                </div>
              </div>
            </div>

            {/* DVF Score and Action Decision */}
            {idea.dvfScore && (
              <div className="bg-white border border-purple-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-sm text-gray-700">Score DVF</h5>
                    <p className="text-xs text-gray-600">Média dos critérios</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{idea.dvfScore.toFixed(1)}/5</div>
                    {idea.actionDecision && (
                      <Badge 
                        variant={
                          idea.actionDecision === 'love_it' ? 'default' : 
                          idea.actionDecision === 'change_it' ? 'secondary' : 'destructive'
                        }
                        className="text-xs mt-1"
                      >
                        {idea.actionDecision === 'love_it' ? '💖 Amar' :
                         idea.actionDecision === 'change_it' ? '🔄 Mudar' : 
                         idea.actionDecision === 'leave_it' ? '❌ Deixar' : '📊 Avaliar'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DVF Analysis Text */}
            {idea.dvfAnalysis && (
              <div className="bg-white border border-purple-200 rounded-lg p-3">
                <h5 className="font-medium text-xs text-gray-700 mb-2">Análise Detalhada</h5>
                <p className="text-xs text-gray-600">{idea.dvfAnalysis}</p>
              </div>
            )}
          </div>
        )}

        {/* Legacy Impact Section (if no DVF but has impact) */}
        {!idea.dvfScore && idea.impact && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-medium text-xs text-gray-700 mb-1">Impacto</h4>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <TrendingUp
                  key={star}
                  className={`w-4 h-4 ${
                    star <= (idea.impact || 0) 
                      ? "text-green-500" 
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs text-gray-600 ml-1">{idea.impact}/5</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <EditIdeaDialog
        idea={idea}
        projectId={projectId}
        isOpen={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </Card>
  );
}

function CreateIdeaDialog({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<Omit<InsertIdea, 'projectId'>>({
    resolver: zodResolver(insertIdeaSchema.omit({ 
      projectId: true,
      votes: true,
    })),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      // Legacy fields
      feasibility: undefined,
      impact: undefined,
      // DVF fields
      desirability: undefined,
      viability: undefined,
      confidenceLevel: undefined,
      dvfScore: undefined,
      dvfAnalysis: "",
      actionDecision: "evaluate",
      priorityRank: undefined,
      iterationNotes: "",
      status: "idea",
    },
  });

  // Auto-calculate DVF Score when DVF fields change
  const watchedFields = form.watch(['desirability', 'viability', 'feasibility']);
  
  useEffect(() => {
    const [desirability, viability, feasibility] = watchedFields;
    if (desirability && viability && feasibility) {
      const dvfScore = (desirability + viability + feasibility) / 3;
      form.setValue('dvfScore', dvfScore);
    }
  }, [watchedFields, form]);

  const createIdeaMutation = useMutation({
    mutationFn: async (data: InsertIdea) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/ideas`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "ideas"] });
      toast({
        title: "Ideia criada!",
        description: "Sua ideia foi criada com sucesso.",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a ideia.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Omit<InsertIdea, 'projectId'>) => {
    const submitData: InsertIdea = {
      ...data,
      projectId: projectId,
      votes: 0,
    };
    createIdeaMutation.mutate(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" data-testid="button-create-idea">
          <Plus className="w-4 h-4 mr-2" />
          Nova Ideia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Ideia</DialogTitle>
          <DialogDescription>
            Registre uma nova ideia gerada durante o brainstorming. Seja criativo e pense fora da caixa!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      data-testid="input-idea-title"
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
                      data-testid="input-idea-description"
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
                  <FormLabel>Categoria (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Tecnologia, Sustentabilidade, Social, etc."
                      {...field}
                      value={field.value || ""}
                      data-testid="input-idea-category"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DVF Analysis Section */}
            <div className="border-t pt-4">
              <div className="mb-3">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Análise DVF (Design Thinking)
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Avalie sua ideia nos 3 critérios fundamentais
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {/* Desirability */}
                <FormField
                  control={form.control}
                  name="desirability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-pink-500 rounded-full"></span>
                          Desejabilidade
                        </div>
                      </FormLabel>
                      <p className="text-xs text-gray-600 mb-2">Satisfaz necessidade do usuário?</p>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-idea-desirability">
                            <SelectValue placeholder="1-5" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 - Não desejável</SelectItem>
                          <SelectItem value="2">2 - Pouco desejável</SelectItem>
                          <SelectItem value="3">3 - Moderadamente desejável</SelectItem>
                          <SelectItem value="4">4 - Muito desejável</SelectItem>
                          <SelectItem value="5">5 - Extremamente desejável</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Viability */}
                <FormField
                  control={form.control}
                  name="viability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          Viabilidade
                        </div>
                      </FormLabel>
                      <p className="text-xs text-gray-600 mb-2">Potencial de negócio/lucro?</p>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-idea-viability">
                            <SelectValue placeholder="1-5" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 - Não viável</SelectItem>
                          <SelectItem value="2">2 - Pouco viável</SelectItem>
                          <SelectItem value="3">3 - Moderadamente viável</SelectItem>
                          <SelectItem value="4">4 - Muito viável</SelectItem>
                          <SelectItem value="5">5 - Extremamente viável</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Feasibility */}
                <FormField
                  control={form.control}
                  name="feasibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          Exequibilidade
                        </div>
                      </FormLabel>
                      <p className="text-xs text-gray-600 mb-2">Implementação técnica?</p>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-idea-feasibility">
                            <SelectValue placeholder="1-5" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
              </div>

              {/* DVF Score Display */}
              {form.watch('dvfScore') && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Score DVF Calculado</h4>
                      <p className="text-xs text-gray-600">Média dos três critérios</p>
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {form.watch('dvfScore')?.toFixed(1)}/5
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Confidence Level */}
                <FormField
                  control={form.control}
                  name="confidenceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Confiança (Opcional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-idea-confidence">
                            <SelectValue placeholder="Quão confiante está?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 - Muito incerto</SelectItem>
                          <SelectItem value="2">2 - Incerto</SelectItem>
                          <SelectItem value="3">3 - Moderadamente confiante</SelectItem>
                          <SelectItem value="4">4 - Confiante</SelectItem>
                          <SelectItem value="5">5 - Muito confiante</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Decision */}
                <FormField
                  control={form.control}
                  name="actionDecision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decisão de Ação</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger data-testid="select-idea-action">
                            <SelectValue placeholder="Love it, Leave it, or Change it?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="evaluate">📊 Avaliar mais</SelectItem>
                          <SelectItem value="love_it">💖 Amar (continuar)</SelectItem>
                          <SelectItem value="change_it">🔄 Mudar (iterar)</SelectItem>
                          <SelectItem value="leave_it">❌ Deixar (abandonar)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* DVF Analysis */}
              <FormField
                control={form.control}
                name="dvfAnalysis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Análise Detalhada (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Justifique suas pontuações DVF. Por que esta ideia é desejável, viável e exequível? Quais são os riscos e oportunidades?"
                        className="resize-none"
                        rows={3}
                        {...field}
                        value={field.value || ""}
                        data-testid="input-idea-dvf-analysis"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Legacy Impact Field (for backward compatibility) */}
            <FormField
              control={form.control}
              name="impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Impacto Geral (Opcional - Campo Legado)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger data-testid="select-idea-impact">
                        <SelectValue placeholder="Avaliar impacto geral" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                data-testid="button-cancel-create"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createIdeaMutation.isPending}
                data-testid="button-save-create"
              >
                {createIdeaMutation.isPending ? "Criando..." : "Criar Ideia"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function IdeaTool({ projectId }: IdeaToolProps) {
  const { data: ideas, isLoading, error } = useQuery<Idea[]>({
    queryKey: ["/api/projects", projectId, "ideas"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Geração de Ideias</h2>
            <p className="text-gray-600">Gere e organize ideias criativas para resolver os problemas identificados</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Geração de Ideias</h2>
            <p className="text-gray-600">Gere e organize ideias criativas para resolver os problemas identificados</p>
          </div>
        </div>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar ideias</h3>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar as ideias. Verifique sua conexão e tente novamente.
          </p>
          <Button onClick={() => window.location.reload()} data-testid="button-retry-ideas">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Geração de Ideias</h2>
          <p className="text-gray-600">
            Gere ideias criativas e inovadoras para resolver os problemas identificados
          </p>
        </div>
        <CreateIdeaDialog projectId={projectId} />
      </div>

      {ideas && ideas.length > 0 ? (
        <div className="grid gap-6">
          {ideas
            .sort((a, b) => (b.votes || 0) - (a.votes || 0)) // Sort by votes descending
            .map((idea: Idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              projectId={projectId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ideia cadastrada</h3>
          <p className="text-gray-600 mb-6">
            Comece gerando suas primeiras ideias para resolver os problemas identificados nas fases anteriores.
          </p>
          <CreateIdeaDialog projectId={projectId} />
        </div>
      )}
    </div>
  );
}