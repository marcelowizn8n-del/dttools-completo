import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const { data: chartData, isLoading } = useQuery({
    queryKey: ["/api/analytics/progress-trends"],
  });

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;

    const initChart = async () => {
      const Chart = (await import("chart.js/auto")).default;
      
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: (chartData as any)?.labels || [],
          datasets: ((chartData as any)?.datasets || []).map((dataset: any) => ({
            ...dataset,
            tension: 0.4,
            fill: true,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top" as const,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                },
              },
            },
          },
          elements: {
            point: {
              radius: 4,
              hoverRadius: 8,
            },
          },
        },
      });
    };

    initChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Weekly Progress Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Progress Trends</CardTitle>
          <div className="flex space-x-2">
            <Button variant="default" size="sm" data-testid="button-chart-7d">7D</Button>
            <Button variant="ghost" size="sm" data-testid="button-chart-30d">30D</Button>
            <Button variant="ghost" size="sm" data-testid="button-chart-90d">90D</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={canvasRef} className="w-full h-full" data-testid="chart-progress-trends" />
        </div>
      </CardContent>
    </Card>
  );
}
