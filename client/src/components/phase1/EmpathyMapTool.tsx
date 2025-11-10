import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
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
import { insertEmpathyMapSchema, type EmpathyMap, type InsertEmpathyMap } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import EditEmpathyMapDialog from "./EditEmpathyMapDialog";

interface EmpathyMapToolProps {
  projectId: string;
}

interface EmpathyMapFormData {
  title: string;
  says: string[];
  thinks: string[];
  does: string[];
  feels: string[];
}

function EmpathyMapCard({ empathyMap, projectId }: { empathyMap: EmpathyMap; projectId: string }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const deleteEmpathyMapMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/empathy-maps/${empathyMap.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete empathy map");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "empathy-maps"] });
      toast({
        title: "Mapa de Empatia excluído",
        description: "O mapa de empatia foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o mapa de empatia.",
        variant: "destructive",
      });
    },
  });

  const quadrants = [
    { label: "O que DIZ", items: empathyMap.says as string[], color: "bg-red-50 border-red-200" },
    { label: "O que PENSA", items: empathyMap.thinks as string[], color: "bg-blue-50 border-blue-200" },
    { label: "O que FAZ", items: empathyMap.does as string[], color: "bg-green-50 border-green-200" },
    { label: "O que SENTE", items: empathyMap.feels as string[], color: "bg-yellow-50 border-yellow-200" },
  ];

  return (
    <Card className="w-full" data-testid={`card-empathy-map-${empathyMap.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg" data-testid={`text-empathy-map-title-${empathyMap.id}`}>
              {empathyMap.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Criado em {empathyMap.createdAt ? new Date(empathyMap.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              data-testid={`button-edit-${empathyMap.id}`}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteEmpathyMapMutation.mutate()}
              disabled={deleteEmpathyMapMutation.isPending}
              data-testid={`button-delete-${empathyMap.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quadrants.map((quadrant, index) => (
            <div
              key={quadrant.label}
              className={`p-4 rounded-lg border-2 ${quadrant.color}`}
              data-testid={`quadrant-${index}`}
            >
              <h4 className="font-semibold text-sm mb-2">{quadrant.label}</h4>
              <div className="space-y-1">
                {quadrant.items.length > 0 ? (
                  quadrant.items.map((item, itemIndex) => (
                    <Badge
                      key={itemIndex}
                      variant="secondary"
                      className="text-xs mr-1 mb-1"
                      data-testid={`item-${index}-${itemIndex}`}
                    >
                      {item}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">Nenhum item</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <EditEmpathyMapDialog
        empathyMap={empathyMap}
        projectId={projectId}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
      />
    </Card>
  );
}

function CreateEmpathyMapDialog({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [quadrantInputs, setQuadrantInputs] = useState({
    says: [""],
    thinks: [""],
    does: [""],
    feels: [""],
  });

  const form = useForm<{ title: string }>({
    resolver: zodResolver(insertEmpathyMapSchema.pick({ title: true })),
    defaultValues: {
      title: "",
    },
  });

  const createEmpathyMapMutation = useMutation({
    mutationFn: async (data: InsertEmpathyMap) => {
      const response = await fetch(`/api/projects/${projectId}/empathy-maps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create empathy map");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "empathy-maps"] });
      toast({
        title: "Mapa de Empatia criado!",
        description: "Seu mapa de empatia foi criado com sucesso.",
      });
      setIsOpen(false);
      form.reset();
      setQuadrantInputs({ says: [""], thinks: [""], does: [""], feels: [""] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o mapa de empatia.",
        variant: "destructive",
      });
    },
  });

  const updateQuadrantInput = (quadrant: keyof typeof quadrantInputs, index: number, value: string) => {
    setQuadrantInputs(prev => ({
      ...prev,
      [quadrant]: prev[quadrant].map((item, i) => i === index ? value : item)
    }));
  };

  const addQuadrantInput = (quadrant: keyof typeof quadrantInputs) => {
    setQuadrantInputs(prev => ({
      ...prev,
      [quadrant]: [...prev[quadrant], ""]
    }));
  };

  const removeQuadrantInput = (quadrant: keyof typeof quadrantInputs, index: number) => {
    if (quadrantInputs[quadrant].length > 1) {
      setQuadrantInputs(prev => ({
        ...prev,
        [quadrant]: prev[quadrant].filter((_, i) => i !== index)
      }));
    }
  };

  const onSubmit = (formData: { title: string }) => {
    const empathyMapData: InsertEmpathyMap = {
      projectId,
      title: formData.title,
      says: quadrantInputs.says.filter(item => item.trim() !== ""),
      thinks: quadrantInputs.thinks.filter(item => item.trim() !== ""),
      does: quadrantInputs.does.filter(item => item.trim() !== ""),
      feels: quadrantInputs.feels.filter(item => item.trim() !== ""),
    };
    createEmpathyMapMutation.mutate(empathyMapData);
  };

  const quadrantLabels = [
    { key: "says" as const, label: "O que DIZ", color: "bg-red-50 border-red-200" },
    { key: "thinks" as const, label: "O que PENSA", color: "bg-blue-50 border-blue-200" },
    { key: "does" as const, label: "O que FAZ", color: "bg-green-50 border-green-200" },
    { key: "feels" as const, label: "O que SENTE", color: "bg-yellow-50 border-yellow-200" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700" data-testid="button-create-empathy-map">
          <Plus className="w-4 h-4 mr-2" />
          Novo Mapa de Empatia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Mapa de Empatia</DialogTitle>
          <DialogDescription>
            O mapa de empatia ajuda a entender o que seu usuário diz, pensa, faz e sente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Mapa</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Usuário do App de Delivery" 
                      {...field} 
                      data-testid="input-empathy-map-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              {quadrantLabels.map((quadrant) => (
                <div key={quadrant.key} className={`p-4 rounded-lg border ${quadrant.color}`}>
                  <h4 className="font-semibold text-sm mb-2">{quadrant.label}</h4>
                  <div className="space-y-2">
                    {quadrantInputs[quadrant.key].map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`${quadrant.label.toLowerCase()}...`}
                          value={item}
                          onChange={(e) => updateQuadrantInput(quadrant.key, index, e.target.value)}
                          className="text-sm"
                          data-testid={`input-${quadrant.key}-${index}`}
                        />
                        {quadrantInputs[quadrant.key].length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuadrantInput(quadrant.key, index)}
                            data-testid={`button-remove-${quadrant.key}-${index}`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addQuadrantInput(quadrant.key)}
                      className="w-full"
                      data-testid={`button-add-${quadrant.key}`}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              ))}
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
                disabled={createEmpathyMapMutation.isPending}
                data-testid="button-submit"
              >
                {createEmpathyMapMutation.isPending ? "Criando..." : "Criar Mapa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function EmpathyMapTool({ projectId }: EmpathyMapToolProps) {
  const { data: empathyMaps = [], isLoading } = useQuery<EmpathyMap[]>({
    queryKey: ["/api/projects", projectId, "empathy-maps"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/empathy-maps`);
      if (!response.ok) throw new Error("Failed to fetch empathy maps");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h3 className="text-xl font-semibold text-gray-900">Mapas de Empatia</h3>
          <p className="text-gray-600 text-sm">
            Entenda o que seus usuários dizem, pensam, fazem e sentem
          </p>
        </div>
        <CreateEmpathyMapDialog projectId={projectId} />
      </div>

      {/* Empathy Maps List */}
      {empathyMaps.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🗺️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum mapa de empatia criado
          </h3>
          <p className="text-gray-600 mb-6">
            Comece criando seu primeiro mapa de empatia para entender melhor seus usuários
          </p>
          <CreateEmpathyMapDialog projectId={projectId} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {empathyMaps.map((empathyMap) => (
            <EmpathyMapCard 
              key={empathyMap.id} 
              empathyMap={empathyMap} 
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}