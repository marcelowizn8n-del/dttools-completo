import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Save, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmpathyMapSchema, type EmpathyMap, type InsertEmpathyMap } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface EditEmpathyMapDialogProps {
  empathyMap: EmpathyMap;
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditEmpathyMapDialog({ 
  empathyMap, 
  projectId, 
  isOpen, 
  onOpenChange 
}: EditEmpathyMapDialogProps) {
  const { toast } = useToast();
  const [quadrantInputs, setQuadrantInputs] = useState({
    says: (empathyMap.says as string[]) || [""],
    thinks: (empathyMap.thinks as string[]) || [""],
    does: (empathyMap.does as string[]) || [""],
    feels: (empathyMap.feels as string[]) || [""],
  });

  const form = useForm<{ title: string }>({
    resolver: zodResolver(insertEmpathyMapSchema.pick({ title: true })),
    defaultValues: {
      title: empathyMap.title,
    },
  });

  const updateEmpathyMapMutation = useMutation({
    mutationFn: async (data: Partial<InsertEmpathyMap>) => {
      const response = await apiRequest("PUT", `/api/empathy-maps/${empathyMap.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "empathy-maps"] });
      toast({
        title: "Mapa de Empatia atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o mapa de empatia.",
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
    const empathyMapData: Partial<InsertEmpathyMap> = {
      title: formData.title,
      says: quadrantInputs.says.filter(item => item.trim() !== ""),
      thinks: quadrantInputs.thinks.filter(item => item.trim() !== ""),
      does: quadrantInputs.does.filter(item => item.trim() !== ""),
      feels: quadrantInputs.feels.filter(item => item.trim() !== ""),
    };
    updateEmpathyMapMutation.mutate(empathyMapData);
  };

  const quadrantLabels = [
    { key: "says" as const, label: "O que DIZ", color: "bg-red-50 border-red-200" },
    { key: "thinks" as const, label: "O que PENSA", color: "bg-blue-50 border-blue-200" },
    { key: "does" as const, label: "O que FAZ", color: "bg-green-50 border-green-200" },
    { key: "feels" as const, label: "O que SENTE", color: "bg-yellow-50 border-yellow-200" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Mapa de Empatia</DialogTitle>
          <DialogDescription>
            Atualize as informações do seu mapa de empatia.
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
                      data-testid="input-edit-empathy-map-title"
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
                          data-testid={`input-edit-${quadrant.key}-${index}`}
                        />
                        {quadrantInputs[quadrant.key].length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuadrantInput(quadrant.key, index)}
                            data-testid={`button-remove-edit-${quadrant.key}-${index}`}
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
                      data-testid={`button-add-edit-${quadrant.key}`}
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
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-edit"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateEmpathyMapMutation.isPending}
                data-testid="button-save-edit"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateEmpathyMapMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}