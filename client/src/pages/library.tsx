import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Book, Search, Calendar, User, ArrowRight, Filter, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Article } from "@shared/schema";

const categories = [
  { id: "all", label: "Todos", icon: BookOpen, description: "Todos os artigos" },
  { id: "empathize", label: "Empatizar", icon: Book, description: "Compreender usuários" },
  { id: "define", label: "Definir", icon: Search, description: "Definir problemas" },
  { id: "ideate", label: "Idear", icon: ArrowRight, description: "Gerar soluções" },
  { id: "prototype", label: "Prototipar", icon: Filter, description: "Construir protótipos" },
  { id: "test", label: "Testar", icon: User, description: "Validar soluções" },
];

function ArticleCard({ article }: { article: Article }) {
  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }).format(new Date(date));
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      empathize: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      define: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      ideate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      prototype: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      test: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <Badge className={getCategoryColor(article.category)} data-testid={`badge-category-${article.id}`}>
            {getCategoryLabel(article.category)}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {article.createdAt ? formatDate(article.createdAt) : 'Data não disponível'}
          </div>
        </div>
        <CardTitle className="line-clamp-2" data-testid={`title-${article.id}`}>
          {article.title}
        </CardTitle>
        {article.description && (
          <CardDescription className="line-clamp-3" data-testid={`description-${article.id}`}>
            {article.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <User className="mr-1 h-3 w-3" />
          <span data-testid={`author-${article.id}`}>{article.author}</span>
        </div>
        {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs"
                data-testid={`tag-${article.id}-${index}`}
              >
                {tag}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{article.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/biblioteca/artigo/${article.id}`} className="w-full">
          <Button className="w-full" data-testid={`button-read-${article.id}`}>
            Ler artigo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function ArticleCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-3">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: allArticles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/help"],
  });

  // Filter to show only educational articles (exclude help system categories)
  const helpSystemCategories = ["inicio-rapido", "fases", "colaboracao", "exportacao"];
  const articles = allArticles.filter(article => 
    !helpSystemCategories.includes(article.category || "")
  );

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getArticleCount = (categoryId: string) => {
    if (categoryId === "all") return articles.length;
    return articles.filter(article => article.category === categoryId).length;
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4" data-testid="page-title">
            Biblioteca Design Thinking
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="page-description">
            Explore artigos, guias e recursos para dominar a metodologia de Design Thinking
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Categories and Articles */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6" data-testid="tabs-categories">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = getArticleCount(category.id);
              
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex flex-col items-center gap-1 p-3 h-auto"
                  data-testid={`tab-${category.id}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{category.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              {/* Category description */}
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2" data-testid={`category-title-${category.id}`}>
                  {category.id === "all" ? "Todos os Artigos" : category.label}
                </h2>
                <p className="text-muted-foreground" data-testid={`category-description-${category.id}`}>
                  {category.description}
                </p>
                <Separator className="mt-4" />
              </div>

              {/* Articles grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <ArticleCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="articles-grid">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2" data-testid="no-articles-title">
                    Nenhum artigo encontrado
                  </h3>
                  <p className="text-muted-foreground" data-testid="no-articles-description">
                    {searchTerm 
                      ? `Não encontramos artigos que correspondam à sua pesquisa "${searchTerm}".`
                      : "Não há artigos disponíveis nesta categoria no momento."
                    }
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                      className="mt-4"
                      data-testid="button-clear-search"
                    >
                      Limpar pesquisa
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}