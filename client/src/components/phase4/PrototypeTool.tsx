import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Wrench, Package, Monitor, FileText, AlertTriangle, Link as LinkIcon } from "lucide-react";
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
import { insertPrototypeSchema, type Prototype, type InsertPrototype, type Idea } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import EditPrototypeDialog from "./EditPrototypeDialog";

interface PrototypeToolProps {
  projectId: string;
}

function PrototypeCard({ prototype, projectId, ideas }: { prototype: Prototype; projectId: string; ideas: Idea[] }) {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const deletePrototypeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/prototypes/${prototype.id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "prototypes"] });
      toast({
        title: "Protótipo excluído",
        description: "O protótipo foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o protótipo.",
        variant: "destructive",
      });
    },
  });

  const typeIcons = {
    digital: Monitor,
    physical: Package,
    paper: FileText,
    storyboard: FileText
  };

  const typeColors = {
    digital: "bg-blue-100 text-blue-800",
    physical: "bg-green-100 text-green-800",
    paper: "bg-orange-100 text-orange-800",
    storyboard: "bg-purple-100 text-purple-800"
  };

  const typeLabels = {
    digital: "Digital",
    physical: "Físico",
    paper: "Papel",
    storyboard: "Storyboard"
  };

  const TypeIcon = typeIcons[prototype.type as keyof typeof typeIcons] || Wrench;
  
  const linkedIdea = ideas.find(idea => idea.id === prototype.ideaId);

  return (
    <Card className="w-full" data-testid={`card-prototype-${prototype.id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className={`text-xs ${typeColors[prototype.type as keyof typeof typeColors]}`}
                data-testid={`badge-type-${prototype.id}`}
              >
                <TypeIcon className="w-3 h-3 mr-1" />
                {typeLabels[prototype.type as keyof typeof typeLabels]}
              </Badge>
              <Badge variant="outline" className="text-xs" data-testid={`badge-version-${prototype.id}`}>
                v{prototype.version}
              </Badge>
              {linkedIdea && (
                <Badge variant="secondary" className="text-xs" data-testid={`badge-idea-${prototype.id}`}>
                  <LinkIcon className="w-3 h-3 mr-1" />
                  {linkedIdea.title}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-bold mb-2" data-testid={`text-prototype-title-${prototype.id}`}>
              {prototype.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Criado em {prototype.createdAt ? new Date(prototype.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <EditPrototypeDialog
              prototype={prototype}
              projectId={projectId}
              ideas={ideas}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  data-testid={`button-edit-prototype-${prototype.id}`}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              }
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-800"
                  data-testid={`button-delete-prototype-${prototype.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Excluir protótipo
                    </div>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O protótipo "{prototype.name}" será 
                    removido permanentemente do projeto.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deletePrototypeMutation.mutate()}
                    disabled={deletePrototypeMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deletePrototypeMutation.isPending ? "Excluindo..." : "Excluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-700" data-testid={`text-description-${prototype.id}`}>
            {prototype.description}
          </p>
          
          {prototype.materials && (prototype.materials as string[]).length > 0 ? (
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-1">Materiais:</h4>
              <div className="flex flex-wrap gap-1">
                {(prototype.materials as string[]).map((material, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {material}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {prototype.feedback && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-600 mb-1">Feedback:</h4>
              <p className="text-sm text-gray-700">{prototype.feedback}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PrototypeTool({ projectId }: PrototypeToolProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: prototypes = [], isLoading, error, refetch } = useQuery<Prototype[]>({
    queryKey: ["/api/projects", projectId, "prototypes"],
    retry: 1,
  });

  const { data: ideas = [] } = useQuery<Idea[]>({
    queryKey: ["/api/projects", projectId, "ideas"],
  });

  const createPrototypeForm = useForm<InsertPrototype>({
    resolver: zodResolver(insertPrototypeSchema.omit({ projectId: true })),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      materials: [],
      images: [],
      version: 1,
      feedback: "",
      ideaId: "none",
    },
  });

  const createPrototypeMutation = useMutation({
    mutationFn: async (data: InsertPrototype) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/prototypes`, {
        ...data,
        materials: data.materials || [],
        images: data.images || [],
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "prototypes"] });
      toast({
        title: "Protótipo criado!",
        description: "Seu protótipo foi adicionado com sucesso.",
      });
      createPrototypeForm.reset();
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o protótipo.",
        variant: "destructive",
      });
    },
  });

  const onSubmitCreate = (data: InsertPrototype) => {
    // Clean up ideaId if it's empty string or "none"
    const cleanData = {
      ...data,
      ideaId: (data.ideaId === "" || data.ideaId === "none") ? undefined : (data.ideaId || undefined),
    };
    createPrototypeMutation.mutate(cleanData);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Erro ao carregar protótipos</p>
        <Button onClick={() => refetch()} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Protótipos</h2>
          <p className="text-sm text-gray-600">
            Crie versões testáveis das suas ideias para validar conceitos
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-create-prototype">
              <Plus className="w-4 h-4" />
              Novo Protótipo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Protótipo</DialogTitle>
              <DialogDescription>
                Documente seu protótipo com detalhes sobre tipo, materiais e objetivos
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createPrototypeForm}>
              <form onSubmit={createPrototypeForm.handleSubmit(onSubmitCreate)} className="space-y-4">
                <FormField
                  control={createPrototypeForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Protótipo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: App de Delivery - Versão Mobile"
                          data-testid="input-prototype-name"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createPrototypeForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-prototype-type">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="digital">Digital</SelectItem>
                            <SelectItem value="physical">Físico</SelectItem>
                            <SelectItem value="paper">Papel</SelectItem>
                            <SelectItem value="storyboard">Storyboard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createPrototypeForm.control}
                    name="ideaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ideia Base (Opcional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-prototype-idea">
                              <SelectValue placeholder="Selecionar ideia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma ideia</SelectItem>
                            {ideas.map((idea) => (
                              <SelectItem key={idea.id} value={idea.id}>
                                {idea.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createPrototypeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o que este protótipo testa e seus objetivos..."
                          className="min-h-[100px]"
                          data-testid="textarea-prototype-description"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createPrototypeMutation.isPending}
                    data-testid="button-submit-prototype"
                  >
                    {createPrototypeMutation.isPending ? "Criando..." : "Criar Protótipo"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse" />
          ))}
        </div>
      ) : prototypes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum protótipo criado</h3>
          <p className="text-gray-600 mb-4">
            Comece criando seu primeiro protótipo para testar suas ideias
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Protótipo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prototypes.map((prototype) => (
            <PrototypeCard 
              key={prototype.id} 
              prototype={prototype} 
              projectId={projectId} 
              ideas={ideas}
            />
          ))}
        </div>
      )}
    </div>
  );
}