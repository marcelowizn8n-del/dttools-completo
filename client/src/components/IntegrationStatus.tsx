import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function IntegrationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: integrations, isLoading } = useQuery({
    queryKey: ["/api/integrations"],
  });

  const connectIntegrationMutation = useMutation({
    mutationFn: (integrationId: string) =>
      apiRequest("PUT", `/api/integrations/${integrationId}`, { status: "connected" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integration Connected",
        description: "Successfully connected to the service.",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-2 h-2" />;
      case "syncing":
        return <Clock className="w-2 h-2" />;
      case "error":
        return <AlertCircle className="w-2 h-2" />;
      default:
        return <XCircle className="w-2 h-2" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "syncing":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Connected";
      case "syncing":
        return "Syncing";
      case "error":
        return "Error";
      default:
        return "Disconnected";
    }
  };

  const getIntegrationIcon = (type: string) => {
    // Using placeholder icons for integrations
    const iconClass = "w-6 h-6";
    switch (type) {
      case "asana":
        return <div className={`${iconClass} bg-red-500 rounded text-white flex items-center justify-center text-xs font-bold`}>A</div>;
      case "trello":
        return <div className={`${iconClass} bg-blue-500 rounded text-white flex items-center justify-center text-xs font-bold`}>T</div>;
      case "monday":
        return <div className={`${iconClass} bg-purple-500 rounded text-white flex items-center justify-center text-xs font-bold`}>M</div>;
      case "slack":
        return <div className={`${iconClass} bg-green-500 rounded text-white flex items-center justify-center text-xs font-bold`}>S</div>;
      default:
        return <div className={`${iconClass} bg-gray-500 rounded text-white flex items-center justify-center text-xs font-bold`}>?</div>;
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-4 rounded-lg border border-border">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex items-center">
                    <Skeleton className="w-2 h-2 rounded-full mr-2" />
                    <Skeleton className="h-3 w-20" />
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
        <div className="flex items-center justify-between">
          <CardTitle>Integration Status</CardTitle>
          <Button data-testid="button-add-integration">
            <Plus className="w-4 h-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(integrations as any)?.map((integration: any) => (
            <div 
              key={integration.id} 
              className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:shadow-sm transition-shadow"
              data-testid={`integration-${integration.type}`}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {getIntegrationIcon(integration.type)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground capitalize" data-testid={`text-integration-name-${integration.type}`}>
                  {integration.name}
                </p>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)}
                  </div>
                  <span 
                    className="text-xs text-muted-foreground ml-2"
                    data-testid={`text-integration-status-${integration.type}`}
                  >
                    {getStatusText(integration.status)}
                  </span>
                </div>
                {integration.status === "disconnected" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-6 px-2 text-xs"
                    onClick={() => connectIntegrationMutation.mutate(integration.id)}
                    disabled={connectIntegrationMutation.isPending}
                    data-testid={`button-connect-${integration.type}`}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
