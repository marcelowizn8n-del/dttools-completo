import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { X, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertHelpArticleSchema, type HelpArticle } from "@shared/schema";

const articleFormSchema = insertHelpArticleSchema.extend({
  tags: z.string().optional(),
  searchKeywords: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleFormSchema>;

interface ArticleEditorProps {
  article?: HelpArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

// Simple markdown renderer for preview
function MarkdownPreview({ content }: { content: string }) {
  const processMarkdown = (text: string) => {
    let processed = text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Lists
      .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
      // Wrap consecutive list items
      .replace(/(<li.*?<\/li>\s*)+/g, '<ul class="space-y-1 mb-4">$&</ul>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4">')
      // Line breaks
      .replace(/\n/g, '<br>');

    return `<div class="prose prose-sm prose-neutral dark:prose-invert max-w-none"><p class="mb-4">${processed}</p></div>`;
  };

  return (
    <div 
      className="p-4 border rounded-lg bg-muted/50 min-h-[400px]"
      dangerouslySetInnerHTML={{ __html: processMarkdown(content || '') }}
    />
  );
}

export default function ArticleEditor({ article, isOpen, onClose }: ArticleEditorProps) {
  const [activeTab, setActiveTab] = useState("edit");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategorySelected, setIsCustomCategorySelected] = useState(false);
  const { toast } = useToast();

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      author: "DTTools Team",
      category: "",
      subcategory: "",
      phase: undefined,
      content: "",
      tags: "",
      searchKeywords: "",
      featured: false,
      order: 0,
    },
  });

  const contentValue = form.watch("content") || "";

  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        slug: article.slug,
        author: article.author,
        category: article.category,
        subcategory: article.subcategory || "",
        phase: article.phase || undefined,
        content: article.content,
        tags: Array.isArray(article.tags) ? (article.tags as string[]).join(", ") : "",
        searchKeywords: Array.isArray(article.searchKeywords) ? (article.searchKeywords as string[]).join(", ") : "",
        featured: article.featured || false,
        order: article.order || 0,
      });
    } else if (isOpen && !article) {
      form.reset({
        title: "",
        slug: "",
        author: "DTTools Team",
        category: "",
        subcategory: "",
        phase: undefined,
        content: "",
        tags: "",
        searchKeywords: "",
        featured: false,
        order: 0,
      });
    }
  }, [article, isOpen, form]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("edit");
      setIsCustomCategorySelected(false);
      setCustomCategory("");
      form.reset({
        title: "",
        slug: "",
        author: "DTTools Team",
        category: "",
        subcategory: "",
        phase: undefined,
        content: "",
        tags: "",
        searchKeywords: "",
        featured: false,
        order: 0,
      });
    }
  }, [isOpen, form]);

  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const { tags, searchKeywords, ...rest } = data;
      const payload = {
        ...rest,
        tags: tags ? tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
        searchKeywords: searchKeywords ? searchKeywords.split(",").map(k => k.trim()).filter(Boolean) : [],
      };

      const response = await apiRequest("POST", "/api/help", payload);
      if (!response.ok) {
        throw new Error("Failed to create article");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help"] });
      toast({
        title: "Artigo criado",
        description: "O artigo foi criado com sucesso.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro ao criar artigo",
        description: "Ocorreu um erro ao criar o artigo.",
        variant: "destructive",
      });
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const { tags, searchKeywords, ...rest } = data;
      const payload = {
        ...rest,
        tags: tags ? tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
        searchKeywords: searchKeywords ? searchKeywords.split(",").map(k => k.trim()).filter(Boolean) : [],
      };

      const response = await apiRequest("PUT", `/api/help/${article?.id}`, payload);
      if (!response.ok) {
        throw new Error("Failed to update article");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help"] });
      toast({
        title: "Artigo atualizado",
        description: "O artigo foi atualizado com sucesso.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar artigo",
        description: "Ocorreu um erro ao atualizar o artigo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    if (article) {
      updateArticleMutation.mutate(data);
    } else {
      createArticleMutation.mutate(data);
    }
  };

  const isLoading = createArticleMutation.isPending || updateArticleMutation.isPending;

  const categories = [
    { value: "empathize", label: "Empatizar" },
    { value: "define", label: "Definir" },
    { value: "ideate", label: "Idear" },
    { value: "prototype", label: "Prototipar" },
    { value: "test", label: "Testar" },
    { value: "design-thinking", label: "Design Thinking" },
    { value: "creativity", label: "Criatividade" },
    { value: "ux-ui", label: "UX/UI" },
    { value: "custom", label: "📝 Categoria Personalizada" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl h-[95vh] max-h-[95vh] p-0 gap-0 overflow-hidden">
        <DialogDescription className="sr-only">
          {article ? "Editar artigo existente" : "Criar novo artigo para a biblioteca"}
        </DialogDescription>
        
        {/* Header fixo */}
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-background">
          <DialogTitle data-testid="editor-title" className="text-xl font-semibold">
            {article ? "Editar Artigo" : "Criar Novo Artigo"}
          </DialogTitle>
        </DialogHeader>

        {/* Conteúdo principal com scroll */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o título do artigo"
                            data-testid="input-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Autor</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do autor"
                            data-testid="input-author"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setIsCustomCategorySelected(true);
                              field.onChange("");
                            } else {
                              setIsCustomCategorySelected(false);
                              setCustomCategory("");
                              field.onChange(value);
                            }
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isCustomCategorySelected && (
                          <FormControl className="mt-2">
                            <Input
                              placeholder="Digite uma categoria personalizada"
                              value={customCategory}
                              onChange={(e) => {
                                setCustomCategory(e.target.value);
                                field.onChange(e.target.value);
                              }}
                              data-testid="input-custom-category"
                            />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (URL)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="como-criar-mapa-empatia"
                            data-testid="input-slug"
                            {...field}
                          />
                        </FormControl>
                        <div className="text-sm text-muted-foreground">
                          URL amigável (gerado automaticamente do título)
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategoria (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Mapas de Empatia"
                            data-testid="input-subcategory"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fase do Design Thinking</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-phase">
                              <SelectValue placeholder="Não aplicável" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Não aplicável</SelectItem>
                            <SelectItem value="1">Fase 1 - Empatizar</SelectItem>
                            <SelectItem value="2">Fase 2 - Definir</SelectItem>
                            <SelectItem value="3">Fase 3 - Idear</SelectItem>
                            <SelectItem value="4">Fase 4 - Prototipar</SelectItem>
                            <SelectItem value="5">Fase 5 - Testar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            data-testid="input-order"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <div className="text-sm text-muted-foreground">
                          Ordem de exibição (maior = aparece primeiro)
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Destaque</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Destacar na página principal
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-featured"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="empatia, pesquisa, usuários (separadas por vírgula)"
                          data-testid="input-tags"
                          {...field}
                        />
                      </FormControl>
                      <div className="text-sm text-muted-foreground">
                        Tags separadas por vírgula para facilitar a busca
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="searchKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Palavras-chave (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="usuário, cliente, entrevista (separadas por vírgula)"
                          data-testid="input-keywords"
                          {...field}
                        />
                      </FormControl>
                      <div className="text-sm text-muted-foreground">
                        Palavras-chave adicionais para melhorar a busca
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content Editor with Preview */}
                <div className="space-y-4">
                  <Label>Conteúdo</Label>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="edit" data-testid="tab-edit">
                        Editar
                      </TabsTrigger>
                      <TabsTrigger value="preview" data-testid="tab-preview">
                        Visualizar
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit" className="space-y-2">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Escreva o conteúdo do artigo em Markdown..."
                                className="min-h-[400px] resize-none font-mono text-sm"
                                data-testid="textarea-content"
                                {...field}
                              />
                            </FormControl>
                            <div className="text-sm text-muted-foreground">
                              Use Markdown para formatação: **negrito**, *itálico*, # títulos, - listas
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="preview">
                      <MarkdownPreview content={contentValue} />
                    </TabsContent>
                  </Tabs>
                </div>
              </form>
            </Form>
          </div>

          {/* Footer com botões fixos */}
          <div className="flex-shrink-0 border-t bg-background px-6 py-4">
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel"
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("preview")}
                  data-testid="button-preview"
                  disabled={isLoading}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  data-testid="button-save"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}