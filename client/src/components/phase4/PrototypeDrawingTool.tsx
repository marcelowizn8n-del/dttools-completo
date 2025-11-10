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

interface PrototypeDrawingToolProps {
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

export default function PrototypeDrawingTool({ projectId }: PrototypeDrawingToolProps) {
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
    queryFn: () => fetch(`/api/canvas-drawings/${projectId}?phase=4`, { credentials: 'include' }).then(res => res.json()),
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
        phase: 4, // Fase de Prototipagem
        canvasType: "konva",
        canvasData: drawingData.canvasData,
        thumbnailData: drawingData.thumbnailData,
        tags: ["prototipagem", "desenho"],
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
    link.download = `prototype-${currentDrawing?.title || 'drawing'}.png`;
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
      description: "Canvas limpo para um novo protótipo.",
    });
  };

  const renderElement = (element: DrawingElement) => {
    const isSelected = selectedElement === element.id;
    const commonProps = {
      x: element.x,
      y: element.y,
      fill: element.fill,
      stroke: isSelected ? "#ff6b6b" : element.stroke,
      strokeWidth: isSelected ? (element.strokeWidth || 2) + 2 : element.strokeWidth,
      draggable: element.draggable,
      onClick: () => setSelectedElement(element.id),
      onDragEnd: (e: any) => {
        const newPos = e.target.position();
        const currentElements = getCurrentElements();
        const newElements = currentElements.map(el => 
          el.id === element.id 
            ? { ...el, x: newPos.x, y: newPos.y }
            : el
        );
        updateCurrentPageElements(newElements);
        saveToHistory(newElements);
      },
    };

    switch (element.type) {
      case 'line':
        return <Line key={element.id} {...commonProps} points={element.points} draggable={false} />;
      case 'text':
        return <Text key={element.id} {...commonProps} text={element.text} fontSize={element.fontSize} />;
      case 'rect':
        return <Rect key={element.id} {...commonProps} width={element.width} height={element.height} />;
      case 'circle':
        return <Circle key={element.id} {...commonProps} radius={Math.min(element.width! / 2, element.height! / 2)} />;
      case 'star':
        return <Star key={element.id} {...commonProps} numPoints={5} innerRadius={Math.min(element.width! / 4, element.height! / 4)} outerRadius={Math.min(element.width! / 2, element.height! / 2)} />;
      case 'image':
        return <URLImage key={element.id} {...commonProps} src={element.imageUrl!} width={element.width} height={element.height} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Desenho de Protótipos</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Crie protótipos visuais com upload de imagens, desenho à mão livre e formas básicas. 
          Ideal para wireframes, mockups e validação rápida de conceitos.
        </p>

        <Tabs defaultValue="canvas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="canvas" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Canvas de Desenho
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Meus Desenhos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="canvas" className="space-y-4">
            {/* Toolbar */}
            {/* Page Management */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Páginas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Page thumbnails grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className={`relative group cursor-pointer border-2 rounded-lg p-2 transition-all ${
                        currentPageId === page.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setCurrentPageId(page.id)}
                      data-testid={`card-page-${page.id}`}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gray-100 rounded border mb-2 flex items-center justify-center overflow-hidden">
                        <img 
                          src={pageThumbnails.get(page.id) || ''}
                          alt={`Thumbnail da ${page.name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Page info */}
                      <div className="text-center">
                        <h4 className="text-sm font-medium truncate">{page.name}</h4>
                        <p className="text-xs text-gray-500">{page.elements.length} elementos</p>
                      </div>
                      
                      {/* Delete button */}
                      {pages.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePage(page.id);
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                          data-testid={`button-delete-page-${page.id}`}
                          title="Excluir página"
                        >
                          ×
                        </button>
                      )}
                      
                      {/* Current page indicator */}
                      {currentPageId === page.id && (
                        <div className="absolute top-1 left-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add new page card */}
                  <div
                    className="relative group cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-2 transition-all hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
                    onClick={addNewPage}
                    data-testid="card-add-page"
                  >
                    <div className="aspect-video bg-gray-200 rounded border mb-2 flex items-center justify-center">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-600">Nova Página</h4>
                      <p className="text-xs text-gray-400">Clique para criar</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 text-center">
                  Página atual: <strong>{getCurrentPage().name}</strong> ({getCurrentElements().length} elementos)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ferramentas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tool selection - Grid layout for better mobile responsiveness */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Ferramentas de Desenho</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    <Button
                      variant={tool === "select" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTool("select")}
                      data-testid="button-tool-select"
                      className="flex flex-col items-center justify-center h-16 sm:h-14 px-2"
                    >
                      <MousePointer2 className="w-4 h-4 mb-1" />
                      <span className="text-xs leading-tight">Selecionar</span>
                    </Button>
                    <Button
                      variant={tool === "pen" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTool("pen")}
                      data-testid="button-tool-pen"
                      className="flex flex-col items-center justify-center h-16 sm:h-14 px-2"
                    >
                      <Pen className="w-4 h-4 mb-1" />
                      <span className="text-xs leading-tight">Caneta</span>
                    </Button>
                    <Button
                      variant={tool === "rect" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTool("rect")}
                      data-testid="button-tool-rect"
                      className="flex flex-col items-center justify-center h-16 sm:h-14 px-2"
                    >
                      <Square className="w-4 h-4 mb-1" />
                      <span className="text-xs leading-tight">Retângulo</span>
                    </Button>
                    <Button
                      variant={tool === "circle" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTool("circle")}
                      data-testid="button-tool-circle"
                      className="flex flex-col items-center justify-center h-16 sm:h-14 px-2"
                    >
                      <CircleIcon className="w-4 h-4 mb-1" />
                      <span className="text-xs leading-tight">Círculo</span>
                    </Button>
                    <Button
                      variant={tool === "star" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTool("star")}
                      data-testid="button-tool-star"
                      className="flex flex-col items-center justify-center h-16 sm:h-14 px-2"
                    >
                      <StarIcon className="w-4 h-4 mb-1" />
                      <span className="text-xs leading-tight">Estrela</span>
                    </Button>
                    <Button
                      variant={tool === "text" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTool("text")}
                      data-testid="button-tool-text"
                      className="flex flex-col items-center justify-center h-16 sm:h-14 px-2"
                    >
                      <Type className="w-4 h-4 mb-1" />
                      <span className="text-xs leading-tight">Texto</span>
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-upload-image"
                    className="col-span-2 sm:col-span-3 md:col-span-6 h-12 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Adicionar Imagem</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Color and settings - Organized in sections */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-700">Configurações</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium min-w-0 flex-shrink-0">Cor:</label>
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-12 h-8 rounded border border-gray-300 flex-shrink-0"
                        data-testid="input-color"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium min-w-0 flex-shrink-0">Espessura:</label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={selectedStrokeWidth}
                        onChange={(e) => setSelectedStrokeWidth(Number(e.target.value))}
                        className="w-20 flex-shrink-0"
                        data-testid="input-stroke-width"
                      />
                    </div>
                    
                    {tool === "text" && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium min-w-0 flex-shrink-0">Fonte:</label>
                        <Input
                          type="number"
                          min="8"
                          max="72"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-20 flex-shrink-0"
                          data-testid="input-font-size"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons - Organized in logical groups */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Ações</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={undo}
                      disabled={(pageHistories.get(currentPageId)?.step || 0) <= 0}
                      data-testid="button-undo"
                      className="flex items-center justify-center gap-2 h-10"
                    >
                      <Undo className="w-4 h-4" />
                      <span className="text-sm">Desfazer</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={redo}
                      disabled={(() => {
        const pageHistory = pageHistories.get(currentPageId);
        if (!pageHistory) return true;
        return pageHistory.step >= pageHistory.history.length - 1;
      })()}
                      data-testid="button-redo"
                      className="flex items-center justify-center gap-2 h-10"
                    >
                      <Redo className="w-4 h-4" />
                      <span className="text-sm">Refazer</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deleteSelected}
                      disabled={!selectedElement}
                      data-testid="button-delete-selected"
                      className="flex items-center justify-center gap-2 h-10"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Excluir</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCanvas}
                      data-testid="button-clear"
                      className="flex items-center justify-center gap-2 h-10"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Limpar</span>
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 mb-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportDrawing}
                      data-testid="button-export"
                      className="flex items-center justify-center gap-2 h-10"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Exportar</span>
                    </Button>
                    
                    <Dialog open={isDrawingSelectorOpen} onOpenChange={setIsDrawingSelectorOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-save-drawing" className="flex items-center justify-center gap-2 h-10">
                          <Save className="w-4 h-4" />
                          <span className="text-sm">Salvar</span>
                        </Button>
                      </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {currentDrawing ? "Atualizar Desenho" : "Salvar Novo Desenho"}
                        </DialogTitle>
                        <DialogDescription>
                          {currentDrawing 
                            ? "Salve as alterações do desenho atual." 
                            : "Dê um nome ao seu protótipo para salvá-lo."
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Título *</label>
                          <Input
                            value={newDrawingTitle}
                            onChange={(e) => setNewDrawingTitle(e.target.value)}
                            placeholder="Ex: Wireframe da tela principal"
                            data-testid="input-drawing-title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Descrição</label>
                          <Textarea
                            value={newDrawingDescription}
                            onChange={(e) => setNewDrawingDescription(e.target.value)}
                            placeholder="Descreva o protótipo e seu propósito..."
                            data-testid="input-drawing-description"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsDrawingSelectorOpen(false)}
                            data-testid="button-cancel-save"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={saveDrawing}
                            disabled={saveDrawingMutation.isPending}
                            data-testid="button-confirm-save"
                          >
                            {saveDrawingMutation.isPending ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Canvas */}
            <Card>
              <CardContent className="p-2 md:p-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg max-w-full"
                  style={{ 
                    touchAction: 'none',
                    overflow: 'visible',
                    position: 'relative'
                  }}
                >
                  <Stage
                    ref={stageRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    onMouseUp={handleMouseUp}
                  >
                    <Layer>
                      {getCurrentElements().map(renderElement)}
                      {isDrawing && tool === "pen" && (
                        <Line
                          points={currentPath}
                          stroke={selectedColor}
                          strokeWidth={selectedStrokeWidth}
                        />
                      )}
                    </Layer>
                  </Stage>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  💡 Dica: Você pode colar imagens diretamente no canvas usando Ctrl+V
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Meus Protótipos Salvos</h3>
              <Button onClick={startNewDrawing} data-testid="button-new-drawing">
                <Plus className="w-4 h-4 mr-2" />
                Novo Desenho
              </Button>
            </div>

            {isLoadingDrawings ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando desenhos...</p>
              </div>
            ) : drawings.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Nenhum protótipo salvo ainda</p>
                <p className="text-sm text-gray-400">
                  Crie seu primeiro protótipo na aba "Canvas de Desenho"
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drawings.map((drawing: CanvasDrawing) => (
                  <Card 
                    key={drawing.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => loadDrawing(drawing)}
                    data-testid={`card-drawing-${drawing.id}`}
                  >
                    <CardContent className="p-4">
                      {drawing.thumbnailData && (
                        <img
                          src={drawing.thumbnailData}
                          alt={drawing.title}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <h4 className="font-medium text-sm mb-1" data-testid={`text-drawing-title-${drawing.id}`}>
                        {drawing.title}
                      </h4>
                      {drawing.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2" data-testid={`text-drawing-description-${drawing.id}`}>
                          {drawing.description}
                        </p>
                      )}
                      <div className="flex gap-1 flex-wrap">
                        {(drawing.tags as string[])?.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}