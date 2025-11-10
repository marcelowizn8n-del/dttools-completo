import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Eye, MapPin, Calendar, Lightbulb } from "lucide-react";
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
import { insertObservationSchema, type Observation, type InsertObservation } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import EditObservationDialog from "./EditObservationDialog";

interface ObservationToolProps {
  projectId: string;
}

function ObservationCard({ observation, projectId }: { observation: Observation; projectId: string }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const deleteObservationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/observations/${observation.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete observation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "observations"] });
      toast({
        title: "Observação excluída",
        description: "A observação foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a observação.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="w-full" data-testid={`card-observation-${observation.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {observation.location}
              </Badge>
              <Badge variant="outline" className="text-xs" data-testid={`text-observation-date-${observation.id}`}>
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(observation.date).toLocaleDateString('pt-BR')}
              </Badge>
            </div>
            <CardDescription className="text-sm text-gray-600" data-testid={`text-observation-context-${observation.id}`}>
              {observation.context}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              data-testid={`button-edit-${observation.id}`}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteObservationMutation.mutate()}
              disabled={deleteObservationMutation.isPending}
              data-testid={`button-delete-${observation.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Behavior Observed */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
            <Eye className="w-4 h-4 text-blue-600" />
            Comportamento Observado
          </h4>
          <p className="text-sm text-gray-700" data-testid={`text-observation-behavior-${observation.id}`}>
            {observation.behavior}
          </p>
        </div>

        {/* Insights */}
        {observation.insights && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              Insights
            </h4>
            <p className="text-sm text-gray-700" data-testid={`text-observation-insights-${observation.id}`}>
              {observation.insights}
            </p>
          </div>
        )}
      </CardContent>
      
      <EditObservationDialog
        observation={observation}
        projectId={projectId}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
      />
    </Card>
  );
}

function CreateObservationDialog({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<Omit<InsertObservation, 'projectId'>>({
    resolver: zodResolver(insertObservationSchema.omit({ projectId: true })),
    defaultValues: {
      location: "",
      context: "",
      behavior: "",
      insights: "",
      date: new Date(),
    },
  });

  const createObservationMutation = useMutation({
    mutationFn: async (data: InsertObservation) => {
      const response = await fetch(`/api/projects/${projectId}/observations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create observation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "observations"] });
      toast({
        title: "Observação criada!",
        description: "Sua observação foi criada com sucesso.",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a observação.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (formData: Omit<InsertObservation, 'projectId'>) => {
    const observationData: InsertObservation = {
      ...formData,
      projectId,
      // Garantir que a data seja um objeto Date válido
      date: formData.date instanceof Date ? formData.date : new Date(formData.date),
    };
    createObservationMutation.mutate(observationData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-create-observation">
          <Plus className="w-4 h-4 mr-2" />
          Nova Observação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Observação de Campo</DialogTitle>
          <DialogDescription>
            Registre comportamentos e padrões observados em usuários reais.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Restaurante, Escritório" 
                        {...field} 
                        data-testid="input-location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        value={field.value instanceof Date && !isNaN(field.value.getTime()) 
                          ? field.value.toISOString().split('T')[0] 
                          : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedDate = new Date(e.target.value + 'T12:00:00');
                            field.onChange(selectedDate);
                          } else {
                            field.onChange(undefined);
                          }
                        }}
                        data-testid="input-observation-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contexto *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o contexto da observação..."
                      className="resize-none"
                      rows={2}
                      {...field}
                      data-testid="input-context"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="behavior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comportamento Observado *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o comportamento que você observou..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-behavior"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insights</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Que insights você tirou desta observação? (opcional)"
                      className="resize-none"
                      rows={2}
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
                disabled={createObservationMutation.isPending}
                data-testid="button-submit"
              >
                {createObservationMutation.isPending ? "Criando..." : "Criar Observação"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function ObservationTool({ projectId }: ObservationToolProps) {
  const { data: observations = [], isLoading } = useQuery<Observation[]>({
    queryKey: ["/api/projects", projectId, "observations"],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/observations`);
      if (!response.ok) throw new Error("Failed to fetch observations");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h3 className="text-xl font-semibold text-gray-900">Observações de Campo</h3>
          <p className="text-gray-600 text-sm">
            Registre comportamentos observados em contextos reais de uso
          </p>
        </div>
        <CreateObservationDialog projectId={projectId} />
      </div>

      {/* Observations List */}
      {observations.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma observação registrada
          </h3>
          <p className="text-gray-600 mb-6">
            Comece registrando sua primeira observação de campo
          </p>
          <CreateObservationDialog projectId={projectId} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {observations.map((observation) => (
            <ObservationCard 
              key={observation.id} 
              observation={observation} 
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}