import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit3,
  Target,
  Users,
  Lightbulb,
  Wrench,
  TestTube 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PhaseCard, InsertPhaseCard } from "@shared/schema";

interface KanbanBoardProps {
  projectId: string;
}

const PHASE_CONFIG = {
  1: {
    title: "Empatizar",
    icon: Users,
    color: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
    description: "Entender o usuário"
  },
  2: {
    title: "Definir",
    icon: Target,
    color: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    description: "Definir problemas"
  },
  3: {
    title: "Idear",
    icon: Lightbulb,
    color: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
    description: "Gerar ideias"
  },
  4: {
    title: "Prototipar",
    icon: Wrench,
    color: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    description: "Construir protótipos"
  },
  5: {
    title: "Testar",
    icon: TestTube,
    color: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
    description: "Validar soluções"
  }
} as const;

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", 
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
} as const;

interface PhaseCardItemProps {
  card: PhaseCard;
  onEdit: (card: PhaseCard) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, card: PhaseCard) => void;
}

function PhaseCardItem({ card, onEdit, onDelete, onDragStart }: PhaseCardItemProps) {
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      className="bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm hover:shadow-md cursor-move transition-shadow"
      data-testid={`card-${card.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 flex-1">{card.title}</h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" data-testid={`menu-card-${card.id}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(card)} data-testid={`edit-card-${card.id}`}>
              <Edit3 className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(card.id)} 
              className="text-red-600"
              data-testid={`delete-card-${card.id}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {card.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{card.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <Badge 
          variant="secondary" 
          className={`text-xs ${PRIORITY_COLORS[card.priority as keyof typeof PRIORITY_COLORS]}`}
        >
          {card.priority === 'low' ? 'Baixa' : card.priority === 'medium' ? 'Média' : 'Alta'}
        </Badge>
        {card.assignee && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{card.assignee}</span>
        )}
      </div>
    </div>
  );
}

interface CardFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignee: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<PhaseCard | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PhaseCard | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [formData, setFormData] = useState<CardFormData>({
    title: '',
    description: '',
    priority: 'medium',
    assignee: ''
  });

  // Fetch phase cards
  const { data: cards = [], isLoading } = useQuery<PhaseCard[]>({
    queryKey: ['/api/phase-cards', projectId],
    queryFn: async (): Promise<PhaseCard[]> => {
      const response = await fetch(`/api/phase-cards/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch phase cards');
      }
      return response.json();
    }
  });

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: async (data: InsertPhaseCard) => {
      const response = await fetch('/api/phase-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create card');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/phase-cards', projectId] });
      setIsDialogOpen(false);
      resetForm();
    }
  });

  // Update card mutation
  const updateCardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPhaseCard> }) => {
      const response = await fetch(`/api/phase-cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update card');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/phase-cards', projectId] });
      setIsDialogOpen(false);
      resetForm();
      setEditingCard(null);
    }
  });

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/phase-cards/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete card');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/phase-cards', projectId] });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      assignee: ''
    });
  };

  const handleAddCard = (phase: 1 | 2 | 3 | 4 | 5) => {
    setSelectedPhase(phase);
    setEditingCard(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditCard = (card: PhaseCard) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      description: card.description || '',
      priority: card.priority as 'low' | 'medium' | 'high',
      assignee: card.assignee || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    // Calculate position as the last in the phase
    const cardsInPhase = cards.filter(c => c.phase === (editingCard?.phase || selectedPhase));
    const position = cardsInPhase.length;

    const cardData: InsertPhaseCard = {
      projectId,
      phase: editingCard?.phase || selectedPhase,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      priority: formData.priority,
      assignee: formData.assignee.trim() || null,
      position
    };

    if (editingCard) {
      updateCardMutation.mutate({ 
        id: editingCard.id, 
        data: { 
          ...cardData, 
          phase: editingCard.phase, // Keep original phase when editing
          position: editingCard.position // Keep original position when editing
        } 
      });
    } else {
      createCardMutation.mutate(cardData);
    }
  };

  const handleDragStart = (e: React.DragEvent, card: PhaseCard) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPhase: 1 | 2 | 3 | 4 | 5) => {
    e.preventDefault();
    
    if (!draggedCard || draggedCard.phase === targetPhase) {
      setDraggedCard(null);
      return;
    }

    // Calculate new position (add to end of target phase)
    const cardsInTargetPhase = cards.filter(c => c.phase === targetPhase);
    const newPosition = cardsInTargetPhase.length;

    updateCardMutation.mutate({
      id: draggedCard.id,
      data: {
        phase: targetPhase,
        position: newPosition
      }
    });

    setDraggedCard(null);
  };

  const getCardsForPhase = (phase: 1 | 2 | 3 | 4 | 5) => {
    return cards
      .filter(card => card.phase === phase)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map(phase => (
          <Card key={phase} className="h-96">
            <CardHeader>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Board Kanban</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total de cards: {cards.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {([1, 2, 3, 4, 5] as const).map(phase => {
          const config = PHASE_CONFIG[phase];
          const phaseCards = getCardsForPhase(phase);
          const Icon = config.icon;

          return (
            <Card 
              key={phase} 
              className={`${config.color} min-h-96`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, phase)}
              data-testid={`phase-column-${phase}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-sm font-semibold">
                      {config.title}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {phaseCards.length}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {config.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {phaseCards.map(card => (
                  <PhaseCardItem
                    key={card.id}
                    card={card}
                    onEdit={handleEditCard}
                    onDelete={(id) => deleteCardMutation.mutate(id)}
                    onDragStart={handleDragStart}
                  />
                ))}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddCard(phase)}
                  className="w-full h-8 text-gray-600 hover:text-gray-900 border-dashed border-2 border-gray-300 hover:border-gray-400"
                  data-testid={`add-card-phase-${phase}`}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Card
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Card Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="card-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Editar Card' : `Novo Card - ${PHASE_CONFIG[selectedPhase]?.title}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título do card..."
                data-testid="input-card-title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o card..."
                rows={3}
                data-testid="input-card-description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prioridade</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger data-testid="select-card-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Responsável</label>
                <Input
                  value={formData.assignee}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                  placeholder="Nome do responsável"
                  data-testid="input-card-assignee"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.title.trim() || createCardMutation.isPending || updateCardMutation.isPending}
              data-testid="button-save-card"
            >
              {createCardMutation.isPending || updateCardMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}