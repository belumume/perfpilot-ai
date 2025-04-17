import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalysisHistoryRecord } from "@/lib/storage";
import { LineChart as LineChartIcon, ListChecks } from "lucide-react";
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

interface TrendsTabProps {
  history: AnalysisHistoryRecord[];
  ChartComponents: ChartComponentsType;
  preparePerformanceData: () => Array<{
    date: string;
    score: number;
    name: string;
  }>;
  prepareCategoryData: () => Array<{
    name: string;
    value: number;
  }>;
}

export default function TrendsTabContent({
  history,
  ChartComponents,
  preparePerformanceData,
  prepareCategoryData
}: TrendsTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Performance Score Trend</CardTitle>
          <CardDescription>
            Track how your performance score evolves over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
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
                <LineChartIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Add more analyses to see performance trends
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/analyze">
                    Run Another Analysis
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {history.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Issue Categories</CardTitle>
              <CardDescription>
                Distribution of issues by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartComponents.ResponsiveContainer width="100%" height="100%">
                  <ChartComponents.BarChart data={prepareCategoryData()}>
                    <ChartComponents.CartesianGrid strokeDasharray="3 3" stroke="#666" opacity={0.2} />
                    <ChartComponents.XAxis dataKey="name" />
                    <ChartComponents.YAxis />
                    <ChartComponents.Tooltip
                      contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderRadius: '6px', border: 'none' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <ChartComponents.Bar dataKey="value" name="Issues" fill="#3b82f6" />
                  </ChartComponents.BarChart>
                </ChartComponents.ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Most Recent Improvements</CardTitle>
              <CardDescription>
                Changes between your last two analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 1 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Performance Score</p>
                      <p className="text-xs text-muted-foreground">
                        Latest vs Previous
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {history[1].performanceScore} → {history[0].performanceScore}
                      </Badge>
                      <Badge 
                        className={history[0].performanceScore >= history[1].performanceScore
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                        }
                      >
                        {history[0].performanceScore >= history[1].performanceScore ? "+" : ""}
                        {history[0].performanceScore - history[1].performanceScore}
                      </Badge>
                    </div>
                  </div>
                  
                  {history[0].results.analysis && history[1].results.analysis && (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Total Issues</p>
                          <p className="text-xs text-muted-foreground">
                            Latest vs Previous
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {
                              'aggregateSummary' in history[1].results.analysis
                                ? history[1].results.analysis.aggregateSummary.totalIssues
                                : history[1].results.analysis.summary.totalIssues
                            } → {
                              'aggregateSummary' in history[0].results.analysis
                                ? history[0].results.analysis.aggregateSummary.totalIssues
                                : history[0].results.analysis.summary.totalIssues
                            }
                          </Badge>
                          
                          {(() => {
                            const oldIssues = 'aggregateSummary' in history[1].results.analysis
                              ? history[1].results.analysis.aggregateSummary.totalIssues
                              : history[1].results.analysis.summary.totalIssues;
                              
                            const newIssues = 'aggregateSummary' in history[0].results.analysis
                              ? history[0].results.analysis.aggregateSummary.totalIssues
                              : history[0].results.analysis.summary.totalIssues;
                              
                            const diff = oldIssues - newIssues;
                            
                            return (
                              <Badge 
                                className={diff >= 0
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-red-500 hover:bg-red-600"
                                }
                              >
                                {diff >= 0 ? "+" : ""}
                                {diff}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Critical Issues</p>
                          <p className="text-xs text-muted-foreground">
                            Latest vs Previous
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {
                              'aggregateSummary' in history[1].results.analysis
                                ? history[1].results.analysis.aggregateSummary.criticalIssues
                                : history[1].results.analysis.summary.criticalIssues
                            } → {
                              'aggregateSummary' in history[0].results.analysis
                                ? history[0].results.analysis.aggregateSummary.criticalIssues
                                : history[0].results.analysis.summary.criticalIssues
                            }
                          </Badge>
                          
                          {(() => {
                            const oldIssues = 'aggregateSummary' in history[1].results.analysis
                              ? history[1].results.analysis.aggregateSummary.criticalIssues
                              : history[1].results.analysis.summary.criticalIssues;
                              
                            const newIssues = 'aggregateSummary' in history[0].results.analysis
                              ? history[0].results.analysis.aggregateSummary.criticalIssues
                              : history[0].results.analysis.summary.criticalIssues;
                              
                            const diff = oldIssues - newIssues;
                            
                            return (
                              <Badge 
                                className={diff >= 0
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-red-500 hover:bg-red-600"
                                }
                              >
                                {diff >= 0 ? "+" : ""}
                                {diff}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {history[0].results.bundleAnalysis && history[1].results.bundleAnalysis && (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Bundle Score</p>
                        <p className="text-xs text-muted-foreground">
                          Latest vs Previous
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {history[1].results.bundleAnalysis.score} → {history[0].results.bundleAnalysis.score}
                        </Badge>
                        <Badge 
                          className={history[0].results.bundleAnalysis.score >= history[1].results.bundleAnalysis.score
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                          }
                        >
                          {history[0].results.bundleAnalysis.score >= history[1].results.bundleAnalysis.score ? "+" : ""}
                          {history[0].results.bundleAnalysis.score - history[1].results.bundleAnalysis.score}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[150px]">
                  <ListChecks className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-center">
                    Need at least two analyses to compare improvements
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 