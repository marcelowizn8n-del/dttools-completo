import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamPerformance() {
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["/api/team-members"],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "bg-green-500";
    if (efficiency >= 80) return "bg-blue-500";
    if (efficiency >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(teamMembers as any)?.map((member: any) => (
            <div key={member.id} className="flex items-center space-x-4" data-testid={`team-member-${member.id}`}>
              <img 
                src={member.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face`}
                alt={member.name}
                className="w-10 h-10 rounded-full object-cover"
                data-testid={`img-avatar-${member.id}`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground" data-testid={`text-name-${member.id}`}>
                    {member.name}
                  </span>
                  <span className="text-sm text-muted-foreground" data-testid={`text-efficiency-${member.id}`}>
                    {member.efficiency}%
                  </span>
                </div>
                <div className="mt-2">
                  <Progress 
                    value={member.efficiency} 
                    className="h-2"
                    data-testid={`progress-${member.id}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
