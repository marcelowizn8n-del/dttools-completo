import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ExternalLink, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RecentReports() {
  const { toast } = useToast();
  
  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/reports/recent"],
  });

  const handleDownloadReport = async (reportId: string, title: string) => {
    try {
      await apiRequest("POST", "/api/user-behavior", {
        action: "download_report",
        context: { reportId },
        userId: "current_user",
      });
      
      toast({
        title: "Download Started",
        description: `Downloading ${title}...`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewReport = async (reportId: string) => {
    try {
      await apiRequest("POST", "/api/user-behavior", {
        action: "view_report",
        context: { reportId },
        userId: "current_user",
      });
      
      toast({
        title: "Report Opened",
        description: "Opening report in new tab...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to open report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="w-8 h-8" />
                  <Skeleton className="w-8 h-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Reports</CardTitle>
          <Button variant="ghost" size="sm" data-testid="button-view-all-reports">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(reports as any)?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reports generated yet</p>
              <p className="text-sm">Generate your first report to see it here</p>
            </div>
          ) : (
            (reports as any)?.map((report: any) => (
              <div 
                key={report.id} 
                className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                data-testid={`report-${report.id}`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground" data-testid={`text-report-title-${report.id}`}>
                    {report.title}
                  </h4>
                  <p className="text-sm text-muted-foreground" data-testid={`text-report-meta-${report.id}`}>
                    Generated {new Date(report.generatedAt).toLocaleDateString()} • {report.completionRate}% completion rate
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleViewReport(report.id)}
                    data-testid={`button-view-${report.id}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDownloadReport(report.id, report.title)}
                    data-testid={`button-download-${report.id}`}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
