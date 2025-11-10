import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPersonaSchema, type Persona, type InsertPersona } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Upload, X, ImageIcon } from "lucide-react";

interface EditPersonaDialogProps {
  persona: Persona;
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PersonaFormData {
  name: string;
  age: number;
  occupation: string;
  bio: string;
  goals: string;
  frustrations: string;
  avatar: string;
}

export default function EditPersonaDialog({ persona, projectId, isOpen, onOpenChange }: EditPersonaDialogProps) {
  const { toast } = useToast();

  const form = useForm<PersonaFormData>({
    resolver: zodResolver(insertPersonaSchema.pick({
      name: true,
      age: true,
      occupation: true,
      bio: true,
      avatar: true,
    }).extend({
      goals: insertPersonaSchema.shape.name,
      frustrations: insertPersonaSchema.shape.name,
    })),
    defaultValues: {
      name: persona.name || "",
      age: persona.age || 0,
      occupation: persona.occupation || "",
      bio: persona.bio || "",
      goals: typeof persona.goals === 'string' ? persona.goals : "",
      frustrations: typeof persona.frustrations === 'string' ? persona.frustrations : "",
      avatar: persona.avatar || "",
    },
  });

  const updatePersonaMutation = useMutation({
    mutationFn: async (data: Partial<InsertPersona>) => {
      const response = await apiRequest("PUT", `/api/personas/${persona.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "personas"] });
      toast({
        title: "Persona atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a persona.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PersonaFormData) => {
    const updateData: Partial<InsertPersona> = {
      name: data.name,
      age: data.age,
      occupation: data.occupation,
      bio: data.bio,
      goals: data.goals,
      frustrations: data.frustrations,
      avatar: data.avatar,
    };
    updatePersonaMutation.mutate(updateData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Persona</DialogTitle>
          <DialogDescription>
            Atualize as informações da persona.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                    }
                                  }
                                };
                                input.click();
                              }}
                              disabled={updatePersonaMutation.isPending}
                              className="flex-1"
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
                              PNG, JPG, GIF até 10MB
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome da persona"
                        {...field}
                        data-testid="input-edit-persona-name"
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
                        placeholder="Idade"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-edit-persona-age"
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
                  <FormLabel>Ocupação</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ocupação da persona"
                      {...field}
                      data-testid="input-edit-persona-occupation"
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
                      placeholder="Descreva a biografia da persona..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-edit-persona-bio"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Quais são os objetivos da persona..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-edit-persona-goals"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frustrations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frustrações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Quais são as principais frustrações..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-edit-persona-frustrations"
                    />
                  </FormControl>
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
                disabled={updatePersonaMutation.isPending}
                data-testid="button-save-edit"
              >
                {updatePersonaMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}