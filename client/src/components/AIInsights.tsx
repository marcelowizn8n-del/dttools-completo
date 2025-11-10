import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AIInsights() {
  const queryClient = useQueryClient();
  
  const { data: insights, isLoading } = useQuery({
    queryKey: ["/api/ai-insights"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (insightId: string) => 
      apiRequest("PUT", `/api/ai-insights/${insightId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-insights/unread"] });
    },
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "pattern":
        return Lightbulb;
      case "trend":
        return TrendingUp;
      case "risk":
        return AlertTriangle;
      default:
        return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "pattern":
        return "bg-blue-50 border-blue-200 text-blue-900";
      case "trend":
        return "bg-green-50 border-green-200 text-green-900";
      case "risk":
        return "bg-orange-50 border-orange-200 text-orange-900";
      default:
        return "bg-gray-50 border-gray-200 text-gray-900";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "pattern":
        return "text-blue-600";
      case "trend":
        return "text-green-600";
      case "risk":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-600" />
            </div>
            <span>AI Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-start space-x-2">
                  <Skeleton className="w-4 h-4 mt-1" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-600" />
          </div>
          <span>AI Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(insights as any)?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No AI insights available</p>
              <p className="text-sm">AI is learning from your behavior patterns</p>
            </div>
          ) : (
            (insights as any)?.slice(0, 3).map((insight: any) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <div 
                  key={insight.id} 
                  className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                  data-testid={`insight-${insight.id}`}
                >
                  <div className="flex items-start space-x-2">
                    <Icon className={`w-4 h-4 mt-1 ${getIconColor(insight.type)}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" data-testid={`text-insight-title-${insight.id}`}>
                        {insight.title}
                      </p>
                      <p className="text-sm mt-1" data-testid={`text-insight-description-${insight.id}`}>
                        {insight.description}
                      </p>
                      {!insight.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-6 px-2 text-xs"
                          onClick={() => markAsReadMutation.mutate(insight.id)}
                          data-testid={`button-mark-read-${insight.id}`}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Button 
          variant="secondary" 
          className="w-full mt-4" 
          size="sm"
          data-testid="button-view-more-insights"
        >
          View More Insights
        </Button>
      </CardContent>
    </Card>
  );
}
