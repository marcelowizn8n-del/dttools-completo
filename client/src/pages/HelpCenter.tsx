import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, BookOpen, HelpCircle, ThumbsUp, Eye, Lightbulb, Users, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { HelpArticle } from "@shared/schema";

const categoryInfo: Record<string, { icon: any; label: string; description: string }> = {
  "inicio-rapido": { icon: Lightbulb, label: "Início Rápido", description: "Comece a usar o DTTools" },
  "fases": { icon: FileText, label: "Fases do DT", description: "Design Thinking passo a passo" },
  "colaboracao": { icon: Users, label: "Colaboração", description: "Trabalhe em equipe" },
  "exportacao": { icon: FileText, label: "Exportação", description: "Compartilhe seus projetos" },
};

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch all help articles
  const { data: articles = [], isLoading } = useQuery<HelpArticle[]>({
    queryKey: ['/api/help'],
  });

  // Search articles when query changes
  const { data: searchResults = [] } = useQuery<HelpArticle[]>({
    queryKey: ['/api/help/search', searchQuery],
    enabled: searchQuery.length > 2,
  });

  const displayArticles = searchQuery.length > 2 ? searchResults : articles;

  const filteredArticles = selectedCategory === "all" 
    ? displayArticles
    : displayArticles.filter(a => a.category === selectedCategory);

  const featuredArticles = articles.filter(a => a.featured);

  const handleArticleClick = async (article: HelpArticle) => {
    try {
      // Fetch article by slug to increment view count
      const response = await fetch(`/api/help/${article.slug}`);
      if (response.ok) {
        const updatedArticle = await response.json();
        setSelectedArticle(updatedArticle);
        // Invalidate to update view count in the list
        queryClient.invalidateQueries({ queryKey: ['/api/help'] });
        if (searchQuery.length > 2) {
          queryClient.invalidateQueries({ queryKey: ['/api/help/search', searchQuery] });
        }
      } else {
        setSelectedArticle(article);
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      setSelectedArticle(article);
    }
  };

  const handleHelpful = async (articleId: string) => {
    try {
      const response = await fetch(`/api/help/${articleId}/helpful`, { method: 'POST' });
      if (response.ok) {
        const updatedArticle = await response.json();
        // Update the open article with new helpful count
        setSelectedArticle(updatedArticle);
        // Invalidate queries to update helpful count in lists
        queryClient.invalidateQueries({ queryKey: ['/api/help'] });
        if (searchQuery.length > 2) {
          queryClient.invalidateQueries({ queryKey: ['/api/help/search', searchQuery] });
        }
      }
    } catch (error) {
      console.error("Error marking article as helpful:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl" data-testid="help-center-container">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
          <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold">Central de Ajuda</h1>
        </div>
        <p className="text-muted-foreground text-base sm:text-lg px-4">
          Encontre respostas e aprenda a usar todas as funcionalidades do DTTools
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 sm:mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
        <Input
          data-testid="input-search-help"
          type="text"
          placeholder="Buscar artigos de ajuda..."
          className="pl-9 sm:pl-10 py-4 sm:py-6 text-base sm:text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Featured Articles */}
      {searchQuery.length === 0 && featuredArticles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Artigos em Destaque</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((article) => (
              <Card 
                key={article.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleArticleClick(article)}
                data-testid={`card-featured-article-${article.id}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="line-clamp-2">{article.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {article.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {article.helpful}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Categories and Articles */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <div className="mb-6 overflow-x-auto">
          <TabsList className="inline-flex w-auto">
            <TabsTrigger value="all" data-testid="tab-all-categories" className="flex-shrink-0">Todos</TabsTrigger>
            {Object.entries(categoryInfo).map(([key, info]) => (
              <TabsTrigger key={key} value={key} data-testid={`tab-category-${key}`} className="flex-shrink-0">
                <info.icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{info.label}</span>
                <span className="sm:hidden">{info.label.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={selectedCategory}>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando artigos...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  {searchQuery.length > 0 
                    ? "Nenhum artigo encontrado para sua busca." 
                    : "Nenhum artigo disponível nesta categoria."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((article) => (
                <Card 
                  key={article.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleArticleClick(article)}
                  data-testid={`card-help-article-${article.id}`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{article.title}</span>
                      {article.phase && (
                        <Badge variant="outline">Fase {article.phase}</Badge>
                      )}
                    </CardTitle>
                    {article.subcategory && (
                      <CardDescription>{article.subcategory}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="secondary">{categoryInfo[article.category]?.label || article.category}</Badge>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.viewCount} visualizações
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {article.helpful} úteis
                      </span>
                    </div>
                    {article.tags && Array.isArray(article.tags) && (article.tags as string[]).length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {(article.tags as string[]).map((tag: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Article Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedArticle.title}</DialogTitle>
              </DialogHeader>
              <div className="prose prose-sm max-w-none dark:prose-invert mt-4">
                <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
              </div>
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {selectedArticle.viewCount} visualizações
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {selectedArticle.helpful} pessoas acharam útil
                  </span>
                </div>
                <Button
                  data-testid="button-mark-helpful"
                  variant="outline"
                  onClick={() => handleHelpful(selectedArticle.id)}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Marcar como Útil
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
