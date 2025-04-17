import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnalysisHistoryRecord } from "@/lib/storage";
import { 
  Clock, 
  ChevronRight, 
  LineChart as LineChartIcon,
  RefreshCw, 
  TrendingUp,
  XCircle 
} from "lucide-react";
import Link from "next/link";

// Define types for chart components
/* eslint-disable @typescript-eslint/no-explicit-any */
interface ChartComponentsType {
  LineChart: React.ComponentType<any>;
  Line: React.ComponentType<any>;
  XAxis: React.ComponentType<any>;
  YAxis: React.ComponentType<any>;
  CartesianGrid: React.ComponentType<any>;
  Tooltip: React.ComponentType<any>;
  ResponsiveContainer: React.ComponentType<any>;
  BarChart: React.ComponentType<any>;
  Bar: React.ComponentType<any>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface OverviewTabProps {
  history: AnalysisHistoryRecord[];
  selectedRecord: AnalysisHistoryRecord | null;
  setSelectedRecord: (record: AnalysisHistoryRecord | null) => void;
  ChartComponents: ChartComponentsType;
  preparePerformanceData: () => Array<{
    date: string;
    score: number;
    name: string;
  }>;
  getScoreBadgeColor: (score: number) => string;
  formatDate: (date: string) => string;
  setActiveTab: (tab: string) => void;
}

export default function OverviewTabContent({
  history,
  selectedRecord,
  setSelectedRecord,
  ChartComponents,
  preparePerformanceData,
  getScoreBadgeColor,
  formatDate,
  setActiveTab
}: OverviewTabProps) {
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Projects analyzed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">
                {history.length > 0 ? history[0].performanceScore : "N/A"}
              </div>
              {history.length > 0 && (
                <Badge variant="secondary" className={getScoreBadgeColor(history[0].performanceScore)}>
                  {history[0].performanceScore >= 90 
                    ? "Excellent" 
                    : history[0].performanceScore >= 75 
                    ? "Good" 
                    : history[0].performanceScore >= 60 
                    ? "Moderate" 
                    : "Needs Work"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Most recent analysis
            </p>
          </CardContent>
        </Card>
        
        {history.length > 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Score Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">
                  {history.length > 1 
                    ? history[0].performanceScore - history[1].performanceScore 
                    : 0}
                </div>
                {history.length > 1 && (
                  <Badge variant="secondary" className={
                    history[0].performanceScore >= history[1].performanceScore
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }>
                    {history[0].performanceScore >= history[1].performanceScore
                      ? <TrendingUp className="h-3 w-3" />
                      : <TrendingUp className="h-3 w-3 transform rotate-180" />
                    }
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Since previous analysis
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history.length > 0 
                ? Math.round(history.reduce((acc, record) => acc + record.performanceScore, 0) / history.length) 
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all analyses
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>
              Your latest performance analysis results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {history.slice(0, 5).map((record) => (
                  <div 
                    key={record.id} 
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full text-white ${getScoreBadgeColor(record.performanceScore)}`}>
                        {record.performanceScore}
                      </div>
                      <div>
                        <h4 className="font-medium">{record.projectName}</h4>
                        <p className="text-xs text-muted-foreground flex gap-1 items-center">
                          <Clock className="h-3 w-3" />
                          {formatDate(record.date)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-accent"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="#" onClick={() => setActiveTab("history")}>
                View All History
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>
              Track your score improvements over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {history.length > 1 ? (
                <ChartComponents.ResponsiveContainer width="100%" height="100%">
                  <ChartComponents.LineChart
                    data={preparePerformanceData()}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <ChartComponents.CartesianGrid strokeDasharray="3 3" stroke="#666" opacity={0.2} />
                    <ChartComponents.XAxis dataKey="date" />
                    <ChartComponents.YAxis domain={[0, 100]} />
                    <ChartComponents.Tooltip
                      contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderRadius: '6px', border: 'none' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <ChartComponents.Line 
                      type="monotone" 
                      dataKey="score" 
                      name="Performance Score"
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </ChartComponents.LineChart>
                </ChartComponents.ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <LineChartIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-center">
                    Add more analyses to see performance trends
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {selectedRecord && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedRecord.projectName}</CardTitle>
                <CardDescription>
                  Analysis from {formatDate(selectedRecord.date)}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRecord(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Performance Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Performance Score:</span>
                    <Badge className={getScoreBadgeColor(selectedRecord.performanceScore)}>
                      {selectedRecord.performanceScore}/100
                    </Badge>
                  </div>
                  
                  {selectedRecord.results.analysis && (
                    <>
                      <div className="flex justify-between">
                        <span>Total Issues:</span>
                        <span className="font-semibold">
                          {
                            'aggregateSummary' in selectedRecord.results.analysis
                              ? selectedRecord.results.analysis.aggregateSummary.totalIssues
                              : selectedRecord.results.analysis.summary.totalIssues
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Critical Issues:</span>
                        <span className="font-semibold text-destructive">
                          {
                            'aggregateSummary' in selectedRecord.results.analysis
                              ? selectedRecord.results.analysis.aggregateSummary.criticalIssues
                              : selectedRecord.results.analysis.summary.criticalIssues
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Warning Issues:</span>
                        <span className="font-semibold text-amber-500">
                          {
                            'aggregateSummary' in selectedRecord.results.analysis
                              ? selectedRecord.results.analysis.aggregateSummary.warningIssues
                              : selectedRecord.results.analysis.summary.warningIssues
                          }
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Info Issues:</span>
                        <span className="font-semibold text-blue-500">
                          {
                            'aggregateSummary' in selectedRecord.results.analysis
                              ? selectedRecord.results.analysis.aggregateSummary.infoIssues
                              : selectedRecord.results.analysis.summary.infoIssues
                          }
                        </span>
                      </div>
                    </>
                  )}
                  
                  {selectedRecord.results.bundleAnalysis && (
                    <>
                      <div className="flex justify-between">
                        <span>Bundle Score:</span>
                        <Badge>
                          {selectedRecord.results.bundleAnalysis.score}/100
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Dependencies:</span>
                        <span className="font-semibold">
                          {selectedRecord.results.bundleAnalysis.totalDependencies}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">AI Recommendations</h4>
                <div className="text-sm space-y-2 overflow-y-auto max-h-[150px] pr-2">
                  <p>{selectedRecord.results.recommendations.summary}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              asChild
              className="w-full"
            >
              <Link href="/analyze">
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-Analyze Project
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
} 