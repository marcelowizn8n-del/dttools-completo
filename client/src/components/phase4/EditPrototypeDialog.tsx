import { ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPrototypeSchema, type Prototype, type InsertPrototype, type Idea } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { X } from "lucide-react";

interface EditPrototypeDialogProps {
  prototype: Prototype;
  projectId: string;
  ideas: Idea[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
}

interface PrototypeFormData {
  name: string;
  type: string;
  description: string;
  materials: string[];
  images: string[];
  version: number;
  feedback: string;
  ideaId?: string;
}

export default function EditPrototypeDialog({ 
  prototype, 
  projectId, 
  ideas, 
  open, 
  onOpenChange, 
  trigger 
}: EditPrototypeDialogProps) {
  const { toast } = useToast();

  const form = useForm<PrototypeFormData>({
    resolver: zodResolver(insertPrototypeSchema.pick({
      name: true,
      type: true,
      description: true,
      version: true,
      feedback: true,
      ideaId: true,
    })),
    defaultValues: {
      name: prototype.name || "",
      type: prototype.type || "",
      description: prototype.description || "",
      materials: (prototype.materials as string[]) || [],
      images: (prototype.images as string[]) || [],
      version: prototype.version || 1,
      feedback: prototype.feedback || "",
      ideaId: prototype.ideaId || "none",
    },
  });

  const updatePrototypeMutation = useMutation({
    mutationFn: async (data: Partial<InsertPrototype>) => {
      const cleanData = {
        ...data,
        ideaId: (data.ideaId === "" || data.ideaId === "none") ? undefined : data.ideaId,
      };
      const response = await apiRequest("PUT", `/api/prototypes/${prototype.id}`, cleanData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "prototypes"] });
      toast({
        title: "Protótipo atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o protótipo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PrototypeFormData) => {
    updatePrototypeMutation.mutate(data);
  };

  // Helper functions for managing materials
  const addMaterial = (material: string) => {
    if (material.trim()) {
      const currentMaterials = form.getValues("materials") || [];
      form.setValue("materials", [...currentMaterials, material.trim()]);
    }
  };

  const removeMaterial = (index: number) => {
    const currentMaterials = form.getValues("materials") || [];
    form.setValue("materials", currentMaterials.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Protótipo</DialogTitle>
          <DialogDescription>
            Atualize as informações do seu protótipo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Protótipo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: App de Delivery - Versão Mobile"
                      {...field}
                      data-testid="input-edit-prototype-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-prototype-type">
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
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Versão</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        data-testid="input-edit-prototype-version"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ideaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ideia Base (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-prototype-idea">
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o que este protótipo testa e seus objetivos..."
                      className="min-h-[100px]"
                      {...field}
                      data-testid="textarea-edit-prototype-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Materiais</FormLabel>
              <div className="flex gap-2">
                <Input 
                  placeholder="Adicionar material (ex: Papel, Cola, Tinta)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMaterial(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  data-testid="input-add-material"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addMaterial(input.value);
                    input.value = '';
                  }}
                >
                  Adicionar
                </Button>
              </div>
              {form.watch("materials") && form.watch("materials").length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.watch("materials").map((material, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {material}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-600" 
                        onClick={() => removeMaterial(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Registre feedback recebido sobre este protótipo..."
                      className="min-h-[80px]"
                      {...field}
                      data-testid="textarea-edit-prototype-feedback"
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
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={updatePrototypeMutation.isPending}
                data-testid="button-update-prototype"
              >
                {updatePrototypeMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}