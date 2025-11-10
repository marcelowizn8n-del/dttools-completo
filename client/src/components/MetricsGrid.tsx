import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, Users, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsGridProps {
  metrics?: {
    activeEvents: number;
    completionRate: number;
    teamEfficiency: number;
    budgetUsage: number;
  };
  isLoading: boolean;
}

export default function MetricsGrid({ metrics, isLoading }: MetricsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-32 mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricsData = [
    {
      title: "Active Events",
      value: metrics?.activeEvents || 0,
      icon: Calendar,
      color: "blue",
      change: "+2",
      changeText: "from last week",
      testId: "metric-active-events",
    },
    {
      title: "Completion Rate",
      value: `${metrics?.completionRate || 0}%`,
      icon: CheckCircle,
      color: "green",
      change: "+5%",
      changeText: "from last week",
      testId: "metric-completion-rate",
    },
    {
      title: "Team Efficiency",
      value: `${metrics?.teamEfficiency || 0}%`,
      icon: Users,
      color: "purple",
      change: "+3%",
      changeText: "from last week",
      testId: "metric-team-efficiency",
    },
    {
      title: "Budget Usage",
      value: `$${((metrics?.budgetUsage || 0) / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: "orange",
      change: "73% of allocated budget",
      changeText: "",
      testId: "metric-budget-usage",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p 
                    className="text-3xl font-bold text-foreground mt-2" 
                    data-testid={metric.testId}
                  >
                    {metric.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">{metric.change}</span>
                {metric.changeText && (
                  <span className="text-muted-foreground ml-1">{metric.changeText}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
