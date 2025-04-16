"use client";

import CategoryBarChart from "./CategoryBarChart";
import CategoryRadarChart from "./CategoryRadarChart";
import IssuePieChart from "./IssuePieChart";
import ScoreAreaChart from "./ScoreAreaChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PerformanceChartsProps {
  score: number;
  categories: Record<string, number>;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
}

const PerformanceCharts = ({
  score,
  categories,
  criticalIssues,
  warningIssues,
  infoIssues
}: PerformanceChartsProps) => {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      {/* Performance Score Area Chart */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Performance Score Distribution</CardTitle>
          <CardDescription>
            Your score of {score} compared to performance zones
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ScoreAreaChart score={score} />
        </CardContent>
      </Card>

      {/* Issues by Category Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Issues by Category</CardTitle>
          <CardDescription>
            Distribution of issues across different optimization categories
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <CategoryBarChart categories={categories} />
        </CardContent>
      </Card>

      {/* Issues by Severity Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Issues by Severity</CardTitle>
          <CardDescription>
            Distribution of issues by severity level
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <IssuePieChart 
            criticalIssues={criticalIssues} 
            warningIssues={warningIssues} 
            infoIssues={infoIssues} 
          />
        </CardContent>
      </Card>

      {/* Category Performance Radar Chart */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
          <CardDescription>
            Radar chart showing performance scores across all categories
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <CategoryRadarChart 
            categories={categories}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceCharts; 