import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  RotateCcw, 
  Trash2, 
  Clock, 
  FileText,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Backup {
  id: string;
  projectId: string;
  backupType: 'auto' | 'manual';
  description?: string;
  phaseSnapshot?: number;
  completionSnapshot?: number;
  itemCount?: number;
  createdAt: string;
}

interface BackupManagerProps {
  projectId: string;
}

export default function BackupManager({ projectId }: BackupManagerProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch backups
  const { data: backups = [], isLoading } = useQuery<Backup[]>({
    queryKey: ['/api/projects', projectId, 'backups'],
    enabled: !!projectId,
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async (desc: string) => {
      return await apiRequest('POST', `/api/projects/${projectId}/backups`, { description: desc });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'backups'] });
      toast({
        title: "Backup criado!",
        description: "O backup do projeto foi criado com sucesso.",
      });
      setDescription("");
      setCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro ao criar backup",
        description: "Não foi possível criar o backup. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Restore backup mutation
  const restoreBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      return await apiRequest('POST', `/api/backups/${backupId}/restore`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
      toast({
        title: "Projeto restaurado!",
        description: "O projeto foi restaurado para a versão do backup selecionado.",
      });
      setRestoreDialogOpen(false);
      setSelectedBackup(null);
    },
    onError: () => {
      toast({
        title: "Erro ao restaurar",
        description: "Não foi possível restaurar o backup. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Delete backup mutation
  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      return await apiRequest('DELETE', `/api/backups/${backupId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'backups'] });
      toast({
        title: "Backup excluído",
        description: "O backup foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o backup. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="w-full" data-testid="card-backup-manager">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="w-5 h-5" />
          Backups do Projeto
        </CardTitle>
        <CardDescription>
          Gerencie versões anteriores do seu projeto. Backups automáticos são criados a cada hora de alterações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Total de backups: {backups.length}
          </p>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-backup">
                <Save className="w-4 h-4 mr-2" />
                Criar Backup Manual
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-create-backup">
              <DialogHeader>
                <DialogTitle>Criar Backup Manual</DialogTitle>
                <DialogDescription>
                  Crie um backup manual do estado atual do projeto
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Input
                    id="description"
                    data-testid="input-backup-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Antes de testar nova ideia..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createBackupMutation.mutate(description)}
                  disabled={createBackupMutation.isPending}
                  data-testid="button-confirm-create-backup"
                >
                  {createBackupMutation.isPending ? "Criando..." : "Criar Backup"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Carregando backups...</div>
        ) : backups.length === 0 ? (
          <Alert data-testid="alert-no-backups">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum backup encontrado. Crie um backup manual para começar.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2" data-testid="list-backups">
            {backups.map((backup) => (
              <Card key={backup.id} className="p-4" data-testid={`card-backup-${backup.id}`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium" data-testid={`text-backup-type-${backup.id}`}>
                        {backup.backupType === 'auto' ? 'Backup Automático' : 'Backup Manual'}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        Fase {backup.phaseSnapshot || 1}
                      </span>
                    </div>
                    {backup.description && (
                      <p className="text-sm text-muted-foreground" data-testid={`text-backup-desc-${backup.id}`}>
                        {backup.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(backup.createdAt)}
                      </span>
                      <span>{backup.itemCount || 0} itens</span>
                      <span>{backup.completionSnapshot?.toFixed(0) || 0}% completo</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBackup(backup);
                        setRestoreDialogOpen(true);
                      }}
                      data-testid={`button-restore-${backup.id}`}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBackupMutation.mutate(backup.id)}
                      disabled={deleteBackupMutation.isPending}
                      data-testid={`button-delete-${backup.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
          <DialogContent data-testid="dialog-restore-backup">
            <DialogHeader>
              <DialogTitle>Restaurar Backup</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja restaurar este backup? Esta ação irá substituir o estado atual do projeto.
              </DialogDescription>
            </DialogHeader>
            {selectedBackup && (
              <div className="py-4 space-y-2">
                <p className="text-sm">
                  <strong>Tipo:</strong> {selectedBackup.backupType === 'auto' ? 'Automático' : 'Manual'}
                </p>
                {selectedBackup.description && (
                  <p className="text-sm">
                    <strong>Descrição:</strong> {selectedBackup.description}
                  </p>
                )}
                <p className="text-sm">
                  <strong>Data:</strong> {formatDate(selectedBackup.createdAt)}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRestoreDialogOpen(false)}
                data-testid="button-cancel-restore"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => selectedBackup && restoreBackupMutation.mutate(selectedBackup.id)}
                disabled={restoreBackupMutation.isPending}
                data-testid="button-confirm-restore"
              >
                {restoreBackupMutation.isPending ? "Restaurando..." : "Restaurar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
