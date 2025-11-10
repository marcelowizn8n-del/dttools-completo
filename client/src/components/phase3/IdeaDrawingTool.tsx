import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Stage, Layer, Line, Text, Image as KonvaImage, Rect, Circle, Star } from 'react-konva';
import useImage from 'use-image';
import { 
  Pen, 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Upload,
  Download, 
  Trash2, 
  Save,
  Palette,
  MousePointer2,
  Plus,
  Eye,
  Edit3,
  Star as StarIcon,
  Image as ImageIcon,
  Undo,
  Redo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type { CanvasDrawing } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface IdeaDrawingToolProps {
  projectId: string;
}

interface DrawingElement {
  id: string;
  type: 'line' | 'text' | 'image' | 'rect' | 'circle' | 'star';
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  imageUrl?: string;
  draggable?: boolean;
}

interface DrawingPage {
  id: string;
  name: string;
  elements: DrawingElement[];
}

const URLImage = ({ src, ...props }: { src: string } & any) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} {...props} />;
};

export default function IdeaDrawingTool({ projectId }: IdeaDrawingToolProps) {
  const { toast } = useToast();
  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Drawing state
  const [tool, setTool] = useState<string>("pen");
  const [pages, setPages] = useState<DrawingPage[]>([
    { id: "page-1", name: "Página 1", elements: [] }
  ]);
  const [currentPageId, setCurrentPageId] = useState<string>("page-1");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState<number>(2);
  const [fontSize, setFontSize] = useState<number>(16);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  
  // UI state
  const [currentDrawing, setCurrentDrawing] = useState<CanvasDrawing | null>(null);
  const [isDrawingSelectorOpen, setIsDrawingSelectorOpen] = useState(false);
  const [newDrawingTitle, setNewDrawingTitle] = useState("");
  const [newDrawingDescription, setNewDrawingDescription] = useState("");
  
  // History for undo/redo - now per page
  const [pageHistories, setPageHistories] = useState<Map<string, { history: DrawingElement[][], step: number }>>(
    new Map([["page-1", { history: [[]], step: 0 }]])
  );

  // Query para buscar desenhos existentes
  const { data: drawings = [], isLoading: isLoadingDrawings } = useQuery({
    queryKey: ['/api/canvas-drawings', projectId] as const,
    queryFn: () => fetch(`/api/canvas-drawings/${projectId}?phase=3`, { credentials: 'include' }).then(res => res.json()),
    enabled: !!projectId,
  });

  // Mutation para salvar desenho
  const saveDrawingMutation = useMutation({
    mutationFn: async (drawingData: { 
      title: string; 
      description?: string; 
      canvasData: any;
      thumbnailData?: string; 
    }) => {
      const method = currentDrawing ? "PUT" : "POST";
      const url = currentDrawing 
        ? `/api/canvas-drawings/${currentDrawing.id}` 
        : "/api/canvas-drawings";
      
      const dataToSend = {
        projectId,
        title: drawingData.title,
        description: drawingData.description,
        phase: 3, // Fase de Ideação
        canvasType: "konva",
        canvasData: drawingData.canvasData,
        thumbnailData: drawingData.thumbnailData,
        tags: ["ideacao", "desenho"],
      };
      
      const response = await apiRequest(method, url, dataToSend);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/canvas-drawings', projectId] });
      toast({
        title: "Desenho salvo!",
        description: currentDrawing ? "Desenho atualizado com sucesso." : "Novo desenho criado com sucesso.",
      });
      setIsDrawingSelectorOpen(false);
      setNewDrawingTitle("");
      setNewDrawingDescription("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o desenho.",
        variant: "destructive",
      });
    },
  });

  const saveToHistory = useCallback((newElements: DrawingElement[]) => {
    setPageHistories(prev => {
      const currentPageHistory = prev.get(currentPageId) || { history: [[]], step: 0 };
      const newHistory = currentPageHistory.history.slice(0, currentPageHistory.step + 1);
      // Deep clone elements to avoid mutation issues
      const clonedElements = newElements.map(el => ({ ...el, points: el.points ? [...el.points] : undefined }));
      newHistory.push(clonedElements);
      
      const updated = new Map(prev);
      updated.set(currentPageId, { history: newHistory, step: newHistory.length - 1 });
      return updated;
    });
  }, [currentPageId]);

  const undo = () => {
    const currentPageHistory = pageHistories.get(currentPageId) || { history: [[]], step: 0 };
    if (currentPageHistory.step > 0) {
      const newStep = currentPageHistory.step - 1;
      setPageHistories(prev => {
        const updated = new Map(prev);
        updated.set(currentPageId, { ...currentPageHistory, step: newStep });
        return updated;
      });
      updateCurrentPageElements([...currentPageHistory.history[newStep]]);
    }
  };

  const redo = () => {
    const currentPageHistory = pageHistories.get(currentPageId) || { history: [[]], step: 0 };
    if (currentPageHistory.step < currentPageHistory.history.length - 1) {
      const newStep = currentPageHistory.step + 1;
      setPageHistories(prev => {
        const updated = new Map(prev);
        updated.set(currentPageId, { ...currentPageHistory, step: newStep });
        return updated;
      });
      updateCurrentPageElements([...currentPageHistory.history[newStep]]);
    }
  };

  // Função para calcular dimensões responsivas
  const getCanvasDimensions = () => {
    if (typeof window === 'undefined') return { width: 800, height: 600 };
    
    const containerWidth = window.innerWidth - 64; // padding
    if (window.innerWidth < 768) {
      return {
        width: Math.max(300, Math.min(containerWidth, 600)),
        height: 400
      };
    }
    return { width: 800, height: 600 };
  };

  const [canvasSize, setCanvasSize] = useState(getCanvasDimensions);

  // Handler para resize
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize(getCanvasDimensions());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper functions for pages
  const getCurrentPage = () => pages.find(page => page.id === currentPageId) || pages[0];
  const getCurrentElements = () => getCurrentPage().elements;

  const updateCurrentPageElements = (newElements: DrawingElement[]) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === currentPageId 
          ? { ...page, elements: newElements }
          : page
      )
    );
  };

  const addNewPage = () => {
    const newPageId = `page-${Date.now()}`;
    const newPage: DrawingPage = {
      id: newPageId,
      name: `Página ${pages.length + 1}`,
      elements: []
    };
    setPages(prev => [...prev, newPage]);
    setCurrentPageId(newPageId);
  };

  const deletePage = (pageId: string) => {
    if (pages.length <= 1) {
      toast({
        title: "Não é possível excluir",
        description: "Você deve ter pelo menos uma página",
        variant: "destructive"
      });
      return;
    }
    
    const newPages = pages.filter(page => page.id !== pageId);
    setPages(newPages);
    
    if (currentPageId === pageId) {
      setCurrentPageId(newPages[0].id);
    }
  };

  const renamePage = (pageId: string, newName: string) => {
    setPages(prevPages =>
      prevPages.map(page =>
        page.id === pageId ? { ...page, name: newName } : page
      )
    );
  };

  const generatePageThumbnail = useCallback((page: DrawingPage): string => {
    // Create a temporary canvas to generate thumbnail
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 120;
    canvas.height = 90;
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Simple representation of elements count
    if (page.elements.length > 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${page.elements.length} elementos`, canvas.width / 2, canvas.height / 2);
      
      // Draw simple shapes to represent content
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
      page.elements.slice(0, 4).forEach((element, index) => {
        const x = 10 + (index % 2) * 50;
        const y = 20 + Math.floor(index / 2) * 25;
        
        ctx.fillStyle = colors[index % colors.length];
        
        switch (element.type) {
          case 'rect':
            ctx.fillRect(x, y, 40, 15);
            break;
          case 'circle':
            ctx.beginPath();
            ctx.arc(x + 20, y + 7.5, 7.5, 0, 2 * Math.PI);
            ctx.fill();
            break;
          case 'line':
            ctx.strokeStyle = colors[index % colors.length];
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 40, y + 15);
            ctx.stroke();
            break;
          default:
            ctx.fillRect(x, y, 40, 15);
        }
      });
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Página vazia', canvas.width / 2, canvas.height / 2);
    }

    return canvas.toDataURL();
  }, []);

  // Apply touch-action to Stage container for mobile
  useEffect(() => {
    if (stageRef.current) {
      const container = stageRef.current.container();
      if (container) {
        container.style.touchAction = 'none';
        (container.style as any).msTouchAction = 'none';
        (container.style as any).webkitTouchAction = 'none';
      }
    }
  }, []);

  // Memoized thumbnails for performance
  const pageThumbnails = useMemo(() => {
    const thumbnails = new Map<string, string>();
    pages.forEach(page => {
      thumbnails.set(page.id, generatePageThumbnail(page));
    });
    return thumbnails;
  }, [pages, generatePageThumbnail]);

  const handleMouseDown = (e: any) => {
    if (tool === "select") return;
    
    // Enhanced mobile touch handling
    e.evt?.preventDefault?.();
    e.evt?.stopPropagation?.();
    
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    
    if (tool === "pen") {
      setCurrentPath([pos.x, pos.y]);
    } else if (tool === "text") {
      const userText = prompt("Digite o texto:", "Texto") || "Texto";
      const newElement: DrawingElement = {
        id: `element-${Date.now()}`,
        type: "text",
        x: pos.x,
        y: pos.y,
        fill: selectedColor,
        stroke: selectedColor,
        strokeWidth: selectedStrokeWidth,
        draggable: true,
        text: userText,
        fontSize: fontSize,
      };
      // Finalize text immediately
      const currentElements = getCurrentElements();
      const newElements = [...currentElements, newElement];
      updateCurrentPageElements(newElements);
      saveToHistory(newElements);
    } else if (tool === "rect" || tool === "circle" || tool === "star") {
      // Store the starting position for shapes but don't add to canvas yet
      setStartPos({ x: pos.x, y: pos.y });
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    
    // Enhanced mobile touch handling
    e.evt?.preventDefault?.();
    e.evt?.stopPropagation?.();
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    if (tool === "pen") {
      setCurrentPath(prev => [...prev, point.x, point.y]);
    } else if ((tool === "rect" || tool === "circle" || tool === "star") && startPos) {
      // Create temporary shape for preview while dragging
      const tempElement: DrawingElement = {
        id: `temp-${tool}`,
        type: tool as any,
        x: Math.min(startPos.x, point.x),
        y: Math.min(startPos.y, point.y),
        width: Math.abs(point.x - startPos.x),
        height: Math.abs(point.y - startPos.y),
        fill: "transparent",
        stroke: selectedColor,
        strokeWidth: selectedStrokeWidth,
        draggable: true,
      };
      
      const currentElements = getCurrentElements();
      const elementsWithoutTemp = currentElements.filter(el => !el.id.startsWith('temp-'));
      updateCurrentPageElements([...elementsWithoutTemp, tempElement]);
    }
  };

  const handleMouseUp = (e: any) => {
    if (!isDrawing) return;
    
    // Enhanced mobile touch handling
    e.evt?.preventDefault?.();
    e.evt?.stopPropagation?.();
    
    setIsDrawing(false);
    
    if (tool === "pen" && currentPath.length > 0) {
      const newLine: DrawingElement = {
        id: `line-${Date.now()}`,
        type: "line",
        points: currentPath,
        stroke: selectedColor,
        strokeWidth: selectedStrokeWidth,
        draggable: false,
      };
      
      const currentElements = getCurrentElements();
      const newElements = [...currentElements, newLine];
      updateCurrentPageElements(newElements);
      saveToHistory(newElements);
      setCurrentPath([]);
    } else if ((tool === "rect" || tool === "circle" || tool === "star") && startPos) {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      
      // Only create shape if there was actual dragging (minimum size)
      const width = Math.abs(point.x - startPos.x);
      const height = Math.abs(point.y - startPos.y);
      
      if (width > 5 || height > 5) {
        const finalElement: DrawingElement = {
          id: `element-${Date.now()}`,
          type: tool as any,
          x: Math.min(startPos.x, point.x),
          y: Math.min(startPos.y, point.y),
          width: width,
          height: height,
          fill: "transparent",
          stroke: selectedColor,
          strokeWidth: selectedStrokeWidth,
          draggable: true,
        };
        
        const currentElements = getCurrentElements();
        const elementsWithoutTemp = currentElements.filter(el => !el.id.startsWith('temp-'));
        const newElements = [...elementsWithoutTemp, finalElement];
        updateCurrentPageElements(newElements);
        saveToHistory(newElements);
      } else {
        // Remove temp element if drag was too small
        const currentElements = getCurrentElements();
        const elementsWithoutTemp = currentElements.filter(el => !el.id.startsWith('temp-'));
        updateCurrentPageElements(elementsWithoutTemp);
      }
      
      setStartPos(null);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const newImage: DrawingElement = {
        id: `image-${Date.now()}`,
        type: "image",
        x: 50,
        y: 50,
        width: 200,
        height: 150,
        imageUrl,
        draggable: true,
      };
      
      const currentElements = getCurrentElements();
      const newElements = [...currentElements, newImage];
      updateCurrentPageElements(newElements);
      saveToHistory(newElements);
      
      toast({
        title: "Imagem adicionada!",
        description: "A imagem foi inserida no canvas.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            const newImage: DrawingElement = {
              id: `image-${Date.now()}`,
              type: "image",
              x: 100,
              y: 100,
              width: 200,
              height: 150,
              imageUrl,
              draggable: true,
            };
            
            const currentElements = getCurrentElements();
            const next = [...currentElements, newImage];
            updateCurrentPageElements(next);
            saveToHistory(next);
            
            toast({
              title: "Imagem colada!",
              description: "A imagem foi inserida no canvas.",
            });
          };
          reader.readAsDataURL(blob);
        }
        break;
      }
    }
  }, [saveToHistory, toast]);

  // Add paste event listener with proper cleanup
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const exportDrawing = () => {
    if (!stageRef.current) return;
    
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = `idea-${currentDrawing?.title || 'drawing'}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Desenho exportado!",
      description: "O arquivo PNG foi baixado com sucesso.",
    });
  };

  const deleteSelected = () => {
    if (selectedElement) {
      const currentElements = getCurrentElements();
      const newElements = currentElements.filter(el => el.id !== selectedElement);
      updateCurrentPageElements(newElements);
      saveToHistory(newElements);
      setSelectedElement(null);
      toast({
        title: "Elemento excluído!",
        description: "O elemento selecionado foi removido.",
      });
    } else {
      toast({
        title: "Nenhum elemento selecionado",
        description: "Clique em um elemento para selecioná-lo antes de excluir.",
        variant: "destructive",
      });
    }
  };

  const clearCanvas = () => {
    updateCurrentPageElements([]);
    setCurrentPath([]);
    setSelectedElement(null);
    saveToHistory([]);
    toast({
      title: "Canvas limpo!",
      description: "Todos os elementos foram removidos.",
    });
  };

  const saveDrawing = () => {
    if (!newDrawingTitle.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para o desenho.",
        variant: "destructive",
      });
      return;
    }

    const canvasData = {
      pages: pages,
      currentPageId: currentPageId,
      width: 800,
      height: 600,
    };

    // Generate thumbnail
    const thumbnailData = stageRef.current?.toDataURL();

    saveDrawingMutation.mutate({
      title: newDrawingTitle,
      description: newDrawingDescription,
      canvasData,
      thumbnailData,
    });
  };

  const loadDrawing = (drawing: CanvasDrawing) => {
    try {
      const canvasData = typeof drawing.canvasData === 'string' 
        ? JSON.parse(drawing.canvasData) 
        : drawing.canvasData;
        
      if (canvasData) {
        // Check if it's the new multi-page format
        if (canvasData.pages) {
          setPages(canvasData.pages);
          setCurrentPageId(canvasData.currentPageId || canvasData.pages[0]?.id || "page-1");
          
          // Initialize history for each page
          const newPageHistories = new Map();
          canvasData.pages.forEach((page: DrawingPage) => {
            newPageHistories.set(page.id, { history: [page.elements], step: 0 });
          });
          setPageHistories(newPageHistories);
        } else if (canvasData.elements) {
          // Legacy single-page format
          const legacyPage = { id: "page-1", name: "Página 1", elements: canvasData.elements };
          setPages([legacyPage]);
          setCurrentPageId("page-1");
          setPageHistories(new Map([["page-1", { history: [canvasData.elements], step: 0 }]]));
        }
        
        setCurrentDrawing(drawing);
        
        toast({
          title: "Desenho carregado!",
          description: `Desenho "${drawing.title}" foi carregado com sucesso.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar o desenho.",
        variant: "destructive",
      });
    }
  };

  const startNewDrawing = () => {
    updateCurrentPageElements([]);
    setCurrentPath([]);
    setCurrentDrawing(null);
    setPageHistories(prev => {
      const updated = new Map(prev);
      updated.set(currentPageId, { history: [[]], step: 0 });
      return updated;
    });
    setNewDrawingTitle("");
    setNewDrawingDescription("");
    
    toast({
      title: "Novo desenho",
      description: "Canvas limpo para um novo desenho.",
    });
  };

  const handleDragEnd = (e: any, elementId: string) => {
    const newAttrs = {
      x: e.target.x(),
      y: e.target.y(),
    };
    
    const currentElements = getCurrentElements();
    const updatedElements = currentElements.map(el => 
      el.id === elementId ? { ...el, ...newAttrs } : el
    );
    
    updateCurrentPageElements(updatedElements);
    saveToHistory(updatedElements);
  };

  const handleElementClick = (elementId: string) => {
    setSelectedElement(selectedElement === elementId ? null : elementId);
  };

  const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];

  const canUndo = useMemo(() => {
    const history = pageHistories.get(currentPageId);
    return history ? history.step > 0 : false;
  }, [pageHistories, currentPageId]);

  const canRedo = useMemo(() => {
    const history = pageHistories.get(currentPageId);
    return history ? history.step < history.history.length - 1 : false;
  }, [pageHistories, currentPageId]);

  const renderElement = (element: DrawingElement) => {
    const isSelected = selectedElement === element.id;
    const strokeWidth = isSelected ? (element.strokeWidth || 2) + 2 : (element.strokeWidth || 2);
    const stroke = isSelected ? '#007bff' : (element.stroke || '#000000');
    
    switch (element.type) {
      case 'line':
        return (
          <Line
            key={element.id}
            points={element.points || []}
            stroke={stroke}
            strokeWidth={strokeWidth}
            onClick={() => handleElementClick(element.id)}
            data-testid={`drawing-line-${element.id}`}
          />
        );
      case 'text':
        return (
          <Text
            key={element.id}
            x={element.x || 0}
            y={element.y || 0}
            text={element.text || 'Texto'}
            fontSize={element.fontSize || 16}
            fill={element.fill || '#000000'}
            draggable={element.draggable}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onClick={() => handleElementClick(element.id)}
            stroke={isSelected ? '#007bff' : undefined}
            strokeWidth={isSelected ? 1 : 0}
            data-testid={`drawing-text-${element.id}`}
          />
        );
      case 'image':
        return element.imageUrl ? (
          <URLImage
            key={element.id}
            src={element.imageUrl}
            x={element.x || 0}
            y={element.y || 0}
            width={element.width || 100}
            height={element.height || 100}
            draggable={element.draggable}
            onDragEnd={(e: any) => handleDragEnd(e, element.id)}
            onClick={() => handleElementClick(element.id)}
            stroke={isSelected ? '#007bff' : undefined}
            strokeWidth={isSelected ? 2 : 0}
            data-testid={`drawing-image-${element.id}`}
          />
        ) : null;
      case 'rect':
        return (
          <Rect
            key={element.id}
            x={element.x || 0}
            y={element.y || 0}
            width={element.width || 100}
            height={element.height || 100}
            fill={element.fill || 'transparent'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            draggable={element.draggable}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onClick={() => handleElementClick(element.id)}
            data-testid={`drawing-rect-${element.id}`}
          />
        );
      case 'circle':
        return (
          <Circle
            key={element.id}
            x={(element.x || 0) + (element.width || 100) / 2}
            y={(element.y || 0) + (element.height || 100) / 2}
            radius={(Math.min(element.width || 100, element.height || 100)) / 2}
            fill={element.fill || 'transparent'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            draggable={element.draggable}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onClick={() => handleElementClick(element.id)}
            data-testid={`drawing-circle-${element.id}`}
          />
        );
      case 'star':
        return (
          <Star
            key={element.id}
            x={(element.x || 0) + (element.width || 100) / 2}
            y={(element.y || 0) + (element.height || 100) / 2}
            numPoints={5}
            innerRadius={(Math.min(element.width || 100, element.height || 100)) / 4}
            outerRadius={(Math.min(element.width || 100, element.height || 100)) / 2}
            fill={element.fill || 'transparent'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            draggable={element.draggable}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onClick={() => handleElementClick(element.id)}
            data-testid={`drawing-star-${element.id}`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Ferramenta de Desenho</h3>
          <p className="text-sm text-muted-foreground">
            Visualize e desenhe suas ideias com ferramentas interativas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isDrawingSelectorOpen} onOpenChange={setIsDrawingSelectorOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-drawings-manager">
                <Eye className="h-4 w-4 mr-2" />
                Gerenciar Desenhos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gerenciar Desenhos de Ideação</DialogTitle>
                <DialogDescription>
                  Visualize, carregue ou crie novos desenhos para suas ideias
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="existing" className="space-y-4">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="existing">Desenhos Existentes</TabsTrigger>
                  <TabsTrigger value="new">Novo Desenho</TabsTrigger>
                </TabsList>
                
                <TabsContent value="existing" className="space-y-4">
                  {isLoadingDrawings ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Carregando desenhos...</p>
                    </div>
                  ) : drawings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {drawings.map((drawing: CanvasDrawing) => (
                        <Card 
                          key={drawing.id} 
                          className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
                            currentDrawing?.id === drawing.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => loadDrawing(drawing)}
                          data-testid={`drawing-card-${drawing.id}`}
                        >
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{drawing.title}</CardTitle>
                            <CardDescription className="text-xs">
                              {drawing.description || 'Sem descrição'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {drawing.thumbnailData && (
                              <img 
                                src={drawing.thumbnailData}
                                alt={drawing.title}
                                className="w-full h-32 object-cover rounded border mb-2"
                              />
                            )}
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(drawing.tags) && drawing.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum desenho encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        Crie seu primeiro desenho de ideação para começar.
                      </p>
                      <Button 
                        onClick={() => {
                          setIsDrawingSelectorOpen(true);
                          setTimeout(() => {
                            const newTab = document.querySelector('[data-value="new"]') as HTMLElement;
                            newTab?.click();
                          }, 100);
                        }}
                        data-testid="button-create-first-drawing"
                      >
                        Criar Primeiro Desenho
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="new" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Título do Desenho</label>
                      <Input
                        value={newDrawingTitle}
                        onChange={(e) => setNewDrawingTitle(e.target.value)}
                        placeholder="Ex: Brainstorm de Funcionalidades"
                        data-testid="input-new-drawing-title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Descrição (Opcional)</label>
                      <Textarea
                        value={newDrawingDescription}
                        onChange={(e) => setNewDrawingDescription(e.target.value)}
                        placeholder="Descreva brevemente o conteúdo do desenho"
                        className="min-h-[80px]"
                        data-testid="textarea-new-drawing-description"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={saveDrawing} 
                        disabled={saveDrawingMutation.isPending || !newDrawingTitle.trim()}
                        className="flex-1"
                        data-testid="button-save-new-drawing"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saveDrawingMutation.isPending ? "Salvando..." : "Salvar Desenho"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={startNewDrawing}
                        data-testid="button-start-new-drawing"
                      >
                        Novo
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-base">
                {currentDrawing ? currentDrawing.title : 'Desenho de Ideação'}
              </CardTitle>
              {currentDrawing && (
                <Badge variant="outline" data-testid="current-drawing-badge">
                  Carregado
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Pages Management */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Páginas:</span>
              <div className="flex items-center gap-1">
                {pages.map(page => (
                  <Button
                    key={page.id}
                    variant={currentPageId === page.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPageId(page.id)}
                    data-testid={`page-tab-${page.id}`}
                  >
                    {page.name}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addNewPage}
                  data-testid="button-add-page"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {pages.length > 1 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deletePage(currentPageId)}
                data-testid="button-delete-page"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={tool === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => setTool("select")}
              data-testid="tool-select"
            >
              <MousePointer2 className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "pen" ? "default" : "outline"}
              size="sm"
              onClick={() => setTool("pen")}
              data-testid="tool-pen"
            >
              <Pen className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "rect" ? "default" : "outline"}
              size="sm"
              onClick={() => setTool("rect")}
              data-testid="tool-rect"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => setTool("circle")}
              data-testid="tool-circle"
            >
              <CircleIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "star" ? "default" : "outline"}
              size="sm"
              onClick={() => setTool("star")}
              data-testid="tool-star"
            >
              <StarIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => setTool("text")}
              data-testid="tool-text"
            >
              <Type className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-image"
            >
              <Upload className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportDrawing}
              data-testid="button-export-drawing"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={deleteSelected}
              disabled={!selectedElement}
              data-testid="button-delete-selected"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              data-testid="button-clear-canvas"
            >
              Limpar
            </Button>

            <Separator orientation="vertical" className="h-6" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              data-testid="button-undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              data-testid="button-redo"
            >
              <Redo className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />
            
            {/* Quick Save Button */}
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (!currentDrawing && !newDrawingTitle.trim()) {
                  // Open dialog to get title
                  setIsDrawingSelectorOpen(true);
                  // Auto-switch to "new" tab
                  setTimeout(() => {
                    const newTab = document.querySelector('[data-value="new"]') as HTMLElement;
                    newTab?.click();
                  }, 100);
                } else {
                  saveDrawing();
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-quick-save"
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </div>

          {/* Settings */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Cor:</span>
              <div className="flex gap-1">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border-2 ${
                      selectedColor === color ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    data-testid={`color-${color}`}
                  />
                ))}
              </div>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-8 h-6 rounded border cursor-pointer"
                data-testid="color-picker"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm">Espessura:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={selectedStrokeWidth}
                onChange={(e) => setSelectedStrokeWidth(parseInt(e.target.value))}
                className="w-20"
                data-testid="stroke-width-slider"
              />
              <span className="text-xs w-6 text-center">{selectedStrokeWidth}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm">Fonte:</span>
              <input
                type="range"
                min="8"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-20"
                data-testid="font-size-slider"
              />
              <span className="text-xs w-8 text-center">{fontSize}px</span>
            </div>
          </div>

          {/* Canvas */}
          <div className="border rounded-lg overflow-hidden bg-white" data-testid="drawing-canvas-container">
            <Stage
              width={canvasSize.width}
              height={canvasSize.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              ref={stageRef}
              data-testid="drawing-stage"
            >
              <Layer>
                {getCurrentElements().map(renderElement)}
                {/* Current path being drawn */}
                {isDrawing && tool === "pen" && currentPath.length > 0 && (
                  <Line
                    points={currentPath}
                    stroke={selectedColor}
                    strokeWidth={selectedStrokeWidth}
                    data-testid="current-drawing-path"
                  />
                )}
              </Layer>
            </Stage>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            data-testid="file-input"
          />
        </CardContent>
      </Card>
    </div>
  );
}