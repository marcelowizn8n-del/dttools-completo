import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, User, Briefcase, Target, Frown, Heart, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPersonaSchema, type Persona, type InsertPersona } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import EditPersonaDialog from "./EditPersonaDialog";

interface PersonaToolProps {
  projectId: string;
}

function PersonaCard({ persona, projectId }: { persona: Persona; projectId: string }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const deletePersonaMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/personas/${persona.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete persona");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "personas"] });
      toast({
        title: "Persona excluída",
        description: "A persona foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a persona.",
        variant: "destructive",
      });
    },
  });

  const techLevels = {
    low: "Baixo",
    medium: "Médio", 
    high: "Alto"
  };

  return (
    <Card className="w-full" data-testid={`card-persona-${persona.id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {persona.avatar ? (
              <img 
                src={persona.avatar} 
                alt={persona.name}
                className="w-16 h-16 rounded-full object-cover"
                data-testid={`img-persona-avatar-${persona.id}`}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-xl" data-testid={`text-persona-name-${persona.id}`}>
                {persona.name}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                {persona.age && (
                  <span data-testid={`text-persona-age-${persona.id}`}>
                    {persona.age} anos
                  </span>
                )}
                {persona.occupation && (
                  <span data-testid={`text-persona-occupation-${persona.id}`}>
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    {persona.occupation}
                  </span>
                )}
                {persona.techSavviness && (
                  <Badge variant="outline" data-testid={`badge-tech-level-${persona.id}`}>
                    Tech: {techLevels[persona.techSavviness as keyof typeof techLevels]}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              data-testid={`button-edit-${persona.id}`}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deletePersonaMutation.mutate()}
              disabled={deletePersonaMutation.isPending}
              data-testid={`button-delete-${persona.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {persona.bio && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-1">Biografia</h4>
            <p className="text-sm text-gray-600" data-testid={`text-persona-bio-${persona.id}`}>
              {persona.bio}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Goals */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-1">
              <Target className="w-4 h-4 text-green-600" />
              Objetivos
            </h4>
            <div className="space-y-1">
              {Array.isArray(persona.goals) && persona.goals.length > 0 ? (
                persona.goals.map((goal, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs mr-1 mb-1 bg-green-50 text-green-800"
                    data-testid={`badge-goal-${index}`}
                  >
                    {goal}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">Nenhum objetivo</p>
              )}
            </div>
          </div>

          {/* Frustrations */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-1">
              <Frown className="w-4 h-4 text-red-600" />
              Frustrações
            </h4>
            <div className="space-y-1">
              {Array.isArray(persona.frustrations) && persona.frustrations.length > 0 ? (
                persona.frustrations.map((frustration, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs mr-1 mb-1 bg-red-50 text-red-800"
                    data-testid={`badge-frustration-${index}`}
                  >
                    {frustration}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">Nenhuma frustração</p>
              )}
            </div>
          </div>

          {/* Motivations */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-1">
              <Heart className="w-4 h-4 text-blue-600" />
              Motivações
            </h4>
            <div className="space-y-1">
              {Array.isArray(persona.motivations) && persona.motivations.length > 0 ? (
                persona.motivations.map((motivation, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs mr-1 mb-1 bg-blue-50 text-blue-800"
                    data-testid={`badge-motivation-${index}`}
                  >
                    {motivation}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">Nenhuma motivação</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <EditPersonaDialog
        persona={persona}
        projectId={projectId}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
      />
    </Card>
  );
}

function CreatePersonaDialog({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [listInputs, setListInputs] = useState({
    goals: [""],
    frustrations: [""],
    motivations: [""],
  });

  const form = useForm<InsertPersona>({
    resolver: zodResolver(insertPersonaSchema.omit({ projectId: true })),
    defaultValues: {
      name: "",
      age: undefined,
      occupation: "",
      bio: "",
      techSavviness: undefined,
      avatar: "",
    },
  });

  const createPersonaMutation = useMutation({
    mutationFn: async (data: InsertPersona) => {
      const response = await fetch(`/api/projects/${projectId}/personas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create persona");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "personas"] });
      toast({
        title: "Persona criada!",
        description: "Sua persona foi criada com sucesso.",
      });
      setIsOpen(false);
      form.reset();
      setListInputs({ goals: [""], frustrations: [""], motivations: [""] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a persona.",
        variant: "destructive",
      });
    },
  });

  const updateListInput = (list: keyof typeof listInputs, index: number, value: string) => {
    setListInputs(prev => ({
      ...prev,
      [list]: prev[list].map((item, i) => i === index ? value : item)
    }));
  };

  const addListInput = (list: keyof typeof listInputs) => {
    setListInputs(prev => ({
      ...prev,
      [list]: [...prev[list], ""]
    }));
  };

  const removeListInput = (list: keyof typeof listInputs, index: number) => {
    if (listInputs[list].length > 1) {
      setListInputs(prev => ({
        ...prev,
        [list]: prev[list].filter((_, i) => i !== index)
      }));
    }
  };

  const onSubmit = (formData: any) => {
    const personaData: InsertPersona = {
      ...formData,
      projectId,
      goals: listInputs.goals.filter(item => item.trim() !== ""),
      frustrations: listInputs.frustrations.filter(item => item.trim() !== ""),
      motivations: listInputs.motivations.filter(item => item.trim() !== ""),
    };
    createPersonaMutation.mutate(personaData);
  };

  const listSections = [
    { key: "goals" as const, label: "Objetivos", icon: Target, color: "bg-green-50 border-green-200" },
    { key: "frustrations" as const, label: "Frustrações", icon: Frown, color: "bg-red-50 border-red-200" },
    { key: "motivations" as const, label: "Motivações", icon: Heart, color: "bg-blue-50 border-blue-200" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-persona">
          <Plus className="w-4 h-4 mr-2" />
          Nova Persona
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Persona</DialogTitle>
          <DialogDescription>
            Crie um perfil detalhado do seu usuário-alvo incluindo características, objetivos e motivações.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Maria Silva" 
                        {...field} 
                        data-testid="input-persona-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="32" 
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-persona-age"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissão</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Designer Gráfico" 
                      {...field}
                      value={field.value || ""}
                      data-testid="input-persona-occupation"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva brevemente o perfil da persona..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                      data-testid="input-persona-bio"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="techSavviness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível Tecnológico</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tech-level">
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto da Persona</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value ? (
                          <div className="relative group">
                            <img
                              src={field.value}
                              alt="Avatar"
                              className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-gray-200 persona-avatar"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => field.onChange("")}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 mb-2">Adicione uma foto para sua persona:</p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = async (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      const formData = new FormData();
                                      formData.append('avatar', file);
                                      try {
                                        const response = await fetch('/api/upload/avatar', {
                                          method: 'POST',
                                          body: formData,
                                          credentials: 'include',
                                        });
                                        if (response.ok) {
                                          const data = await response.json();
                                          field.onChange(data.url);
                                        }
                                      } catch (error) {
                                        console.error('Upload failed:', error);
                                        const errorMessage = error instanceof Error ? error.message : 'Erro no upload';
                                        // Show toast with error feedback
                                        alert(`Erro ao fazer upload: ${errorMessage}`);
                                      }
                                    }
                                  };
                                  input.click();
                                }}
                                disabled={createPersonaMutation.isPending}
                                className="flex-1"
                                data-testid="button-upload-persona-photo"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Carregar Foto
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  const url = prompt('Digite a URL da imagem:');
                                  if (url) field.onChange(url);
                                }}
                              >
                                URL
                              </Button>
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                              <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF até 50MB
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {listSections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.key} className={`p-4 rounded-lg border ${section.color}`}>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </h4>
                    <div className="space-y-2">
                      {listInputs[section.key].map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`${section.label.toLowerCase()}...`}
                            value={item}
                            onChange={(e) => updateListInput(section.key, index, e.target.value)}
                            className="text-sm"
                            data-testid={`input-${section.key}-${index}`}
                          />
                          {listInputs[section.key].length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeListInput(section.key, index)}
                              data-testid={`button-remove-${section.key}-${index}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListInput(section.key)}
                        className="w-full text-xs leading-tight h-auto py-2 px-3"
                        data-testid={`button-add-${section.key}`}
                      >
                        <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="text-center">
                          Adicionar {section.label.slice(0, -1)}
                        </span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

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
                disabled={createPersonaMutation.isPending}
                data-testid="button-submit"
              >
                {createPersonaMutation.isPending ? "Criando..." : "Criar Persona"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function PersonaTool({ projectId }: PersonaToolProps) {
  const { data: personas = [], isLoading } = useQuery<Persona[]>({
    queryKey: ["/api/projects", projectId, "personas"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/personas`);
      if (!response.ok) throw new Error("Failed to fetch personas");
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
          <h3 className="text-xl font-semibold text-gray-900">Personas</h3>
          <p className="text-gray-600 text-sm">
            Crie perfis detalhados dos seus usuários-alvo
          </p>
        </div>
        <CreatePersonaDialog projectId={projectId} />
      </div>

      {/* Personas List */}
      {personas.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma persona criada
          </h3>
          <p className="text-gray-600 mb-6">
            Comece criando sua primeira persona para representar seus usuários-alvo
          </p>
          <CreatePersonaDialog projectId={projectId} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {personas.map((persona) => (
            <PersonaCard 
              key={persona.id} 
              persona={persona} 
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}