import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, User, Clock, Tag, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Article } from "@shared/schema";

// Simple markdown renderer for article content
function MarkdownRenderer({ content }: { content: string }) {
  const processMarkdown = (text: string) => {
    // Simple markdown processing
    let processed = text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-6">$1</h1>')
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

    return `<div class="prose prose-neutral dark:prose-invert max-w-none"><p class="mb-4">${processed}</p></div>`;
  };

  return (
    <div 
      className="article-content"
      dangerouslySetInnerHTML={{ __html: processMarkdown(content) }}
      data-testid="article-content"
    />
  );
}

function ArticleSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-6 w-1/2 mt-6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: ["/api/help", id],
    queryFn: async () => {
      const response = await fetch(`/api/help/${id}`);
      if (!response.ok) {
        throw new Error("Article not found");
      }
      return response.json();
    },
    enabled: !!id,
  });

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      empathize: "Empatizar",
      define: "Definir", 
      ideate: "Idear",
      prototype: "Prototipar",
      test: "Testar",
    };
    return categories[category] || category;
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

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description || "",
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: "Link copiado!",
        description: "O link do artigo foi copiado para a área de transferência.",
      });
    });
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  if (error) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <h2 className="text-xl font-semibold" data-testid="error-title">
                Artigo não encontrado
              </h2>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground" data-testid="error-message">
                O artigo que você está procurando não foi encontrado ou foi removido.
              </p>
              <Link href="/biblioteca">
                <Button data-testid="button-back-to-library">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar à biblioteca
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/biblioteca">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à biblioteca
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <ArticleSkeleton />
        ) : article ? (
          <article className="space-y-6">
            {/* Header */}
            <header className="space-y-4">
              <Badge 
                className={getCategoryColor(article.category)} 
                data-testid="article-category"
              >
                {getCategoryLabel(article.category)}
              </Badge>
              
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="article-title">
                {article.title}
              </h1>
              
              {article.description && (
                <p className="text-xl text-muted-foreground" data-testid="article-description">
                  {article.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1" data-testid="article-author">
                  <User className="h-4 w-4" />
                  {article.author}
                </div>
                
                <div className="flex items-center gap-1" data-testid="article-date">
                  <Calendar className="h-4 w-4" />
                  {article.createdAt ? formatDate(article.createdAt) : 'Data não disponível'}
                </div>
                
                <div className="flex items-center gap-1" data-testid="article-reading-time">
                  <Clock className="h-4 w-4" />
                  {estimateReadingTime(article.content)} min de leitura
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleShare}
                  data-testid="button-share"
                >
                  <Share className="h-4 w-4 mr-1" />
                  Compartilhar
                </Button>
              </div>

              {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2" data-testid="article-tags">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {article.tags.map((tag: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs"
                      data-testid={`tag-${index}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </header>

            <Separator />

            {/* Content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <MarkdownRenderer content={article.content} />
            </div>

            <Separator />

            {/* Footer */}
            <footer className="flex justify-between items-center pt-6">
              <Link href="/biblioteca">
                <Button variant="outline" data-testid="button-back-footer">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar à biblioteca
                </Button>
              </Link>
              
              <Button onClick={handleShare} data-testid="button-share-footer">
                <Share className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            </footer>
          </article>
        ) : null}
      </div>
    </div>
  );
}