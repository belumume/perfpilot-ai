"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BundleAnalysisResult, HeavyDependency, UnnecessaryDependency, DuplicateDependency, TreeshakingIssue } from "@/lib/analysis/bundle-analyzer";
import { BarChart, Check, FileDown, FileWarning, HardDriveDownload, Hexagon, Layers, Package, PackageOpen, Scale, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  BarChart as RechartsBarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts';

interface BundleAnalysisProps {
  analysis: BundleAnalysisResult;
}

export function BundleAnalysis({ analysis }: BundleAnalysisProps) {
  if (!analysis) {
    return (
      <div className="flex items-center justify-center py-8">
        <p>No bundle analysis data available. Upload a package.json file to analyze bundle size.</p>
      </div>
    );
  }

  const { 
    totalDependencies, 
    heavyDependencies, 
    unnecessaryDependencies, 
    duplicateDependencies,
    treeshakingIssues,
    score, 
    summary 
  } = analysis;
  
  // Get score badge
  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "bg-green-500" };
    if (score >= 75) return { label: "Good", color: "bg-green-400" };
    if (score >= 60) return { label: "Moderate", color: "bg-yellow-400" };
    if (score >= 40) return { label: "Needs Improvement", color: "bg-orange-500" };
    return { label: "Poor", color: "bg-red-500" };
  };
  
  const scoreBadge = getScoreBadge(score);
  
  // Prepare data for the pie chart
  const pieData = [
    { name: 'Heavy Dependencies', value: heavyDependencies.length, color: '#ef4444' },
    { name: 'Unnecessary Dependencies', value: unnecessaryDependencies.length, color: '#f97316' },
    { name: 'Duplicate Functionality', value: duplicateDependencies.length, color: '#eab308' },
    { name: 'Treeshaking Issues', value: treeshakingIssues.length, color: '#3b82f6' },
    { 
      name: 'Optimized Dependencies', 
      value: Math.max(0, totalDependencies - 
        (heavyDependencies.length + unnecessaryDependencies.length + duplicateDependencies.length)), 
      color: '#22c55e' 
    },
  ].filter(item => item.value > 0);
  
  // Bar chart data for heavy dependencies
  const barData = heavyDependencies.slice(0, 5).map(dep => ({
    name: dep.name,
    size: parseInt(dep.estimatedSize.replace(/[^0-9]/g, '')),
  }));
  
  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  
  // Handler to export analysis as JSON
  const exportAnalysis = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bundle-analysis.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Analysis exported successfully");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bundle Size Analysis</h2>
        <Button variant="outline" size="sm" onClick={exportAnalysis}>
          <FileDown className="h-4 w-4 mr-2" />
          Export Analysis
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Score Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Bundle Score</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Bundle score reflects the overall health of your dependencies.
                      A higher score means fewer bundle size issues.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-3xl font-bold">{score}</div>
              <Badge className={`${scoreBadge.color} text-white`}>{scoreBadge.label}</Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Estimated Size Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Estimated Size</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HardDriveDownload className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Rough estimation of client bundle size based on dependency analysis.
                      Actual size depends on import patterns and code splitting.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-3xl font-bold">{summary.size.estimated}</div>
              <div className="text-xs text-muted-foreground">Estimated client bundle</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Dependencies Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Dependencies</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Total number of dependencies in your package.json
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-3xl font-bold">{totalDependencies}</div>
              <div className="text-xs text-muted-foreground">
                {summary.size.breakdown.dependencies}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Issues Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Bundle Issues</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <FileWarning className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Total bundle size issues detected across all dependencies
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-3xl font-bold">{summary.totalIssues}</div>
              <div className="text-xs text-muted-foreground">
                Detected issues
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and detailed issues */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bundle Composition Pie Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Bundle Composition</CardTitle>
            <CardDescription>
              Analysis of dependencies by issue type
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip formatter={(value) => [`${value} dependencies`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Check className="h-12 w-12 mb-2 text-green-500" />
                  <p>No bundle issues detected!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Heavy Dependencies Bar Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Heaviest Dependencies</CardTitle>
            <CardDescription>
              Dependencies with the largest impact on bundle size
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={barData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                  <YAxis label={{ value: 'Size (KB)', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip formatter={(value) => [`${value} KB`, 'Size']} />
                  <Bar dataKey="size" fill="#ff4d4f" />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Check className="h-12 w-12 mb-2 text-green-500" />
                  <p>No heavy dependencies detected!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Issues */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Detailed Analysis</h3>
        
        <Accordion type="single" collapsible className="w-full">
          {/* Heavy Dependencies */}
          <AccordionItem value="heavy-dependencies">
            <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
              <div className="flex items-center">
                <Scale className="h-5 w-5 text-red-500 mr-2" />
                <span>Heavy Dependencies ({heavyDependencies.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              {heavyDependencies.length > 0 ? (
                <div className="space-y-4">
                  {heavyDependencies.map((dep, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="pb-2 bg-muted/30">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-primary" />
                            <CardTitle className="text-base">{dep.name}</CardTitle>
                          </div>
                          <Badge variant="destructive">{dep.estimatedSize}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Alternative options:</div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {dep.alternatives?.map((alt, i) => (
                              <Badge key={i} variant="outline" className="bg-muted/50">
                                {alt}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm mt-2">
                            <p>
                              Heavy dependencies significantly increase your bundle size. 
                              Consider switching to a lightweight alternative or implementing 
                              code splitting to load this dependency only when needed.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center py-6">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <p>No heavy dependencies detected. Your bundle size looks optimized!</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          
          {/* Unnecessary Dependencies */}
          <AccordionItem value="unnecessary-dependencies">
            <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-orange-500 mr-2" />
                <span>Unnecessary Dependencies ({unnecessaryDependencies.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              {unnecessaryDependencies.length > 0 ? (
                <div className="space-y-4">
                  {unnecessaryDependencies.map((dep, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="pb-2 bg-muted/30">
                        <CardTitle className="text-base flex items-center">
                          <Package className="h-4 w-4 mr-2 text-primary" />
                          {dep.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <p>{dep.reason}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center py-6">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <p>No unnecessary dependencies detected. Your dependencies are well-optimized!</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          
          {/* Duplicate Functionality */}
          <AccordionItem value="duplicate-functionality">
            <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
              <div className="flex items-center">
                <Hexagon className="h-5 w-5 text-yellow-500 mr-2" />
                <span>Duplicate Functionality ({duplicateDependencies.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              {duplicateDependencies.length > 0 ? (
                <div className="space-y-4">
                  {duplicateDependencies.map((dep, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="pb-2 bg-muted/30">
                        <CardTitle className="text-base">Duplicate Dependencies</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {dep.names.map((name, i) => (
                              <Badge key={i} variant="outline" className="bg-muted/50">
                                {name}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm mt-2">
                            <p>{dep.reason}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center py-6">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <p>No duplicate functionality detected. Your dependencies are well-organized!</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          
          {/* Treeshaking Issues */}
          <AccordionItem value="treeshaking-issues">
            <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
              <div className="flex items-center">
                <BarChart className="h-5 w-5 text-blue-500 mr-2" />
                <span>Tree Shaking Issues ({treeshakingIssues.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              {treeshakingIssues.length > 0 ? (
                <div className="space-y-4">
                  {treeshakingIssues.map((issue, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="pb-2 bg-muted/30">
                        <CardTitle className="text-base flex items-center">
                          <Package className="h-4 w-4 mr-2 text-primary" />
                          {issue.dependency}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium text-sm">Current Import:</p>
                            <div className="mt-1 relative">
                              <SyntaxHighlighter 
                                language="typescript" 
                                style={vscDarkPlus}
                                customStyle={{ borderRadius: '0.375rem', fontSize: '0.875rem', padding: '0.75rem' }}
                              >
                                {issue.importStatement}
                              </SyntaxHighlighter>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="absolute top-2 right-2 h-6 w-6" 
                                onClick={() => copyToClipboard(issue.importStatement)}
                              >
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                  <path d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                </svg>
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p className="font-medium">Recommendation:</p>
                            <p className="mt-1">{issue.recommendation}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center py-6">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <p>No tree shaking issues detected. Your imports are optimized for bundle size!</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* Recommendation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
          <CardDescription>
            Actionable steps to improve your bundle size
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {heavyDependencies.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">1. Replace Heavy Dependencies</h4>
              <p className="text-sm">
                Consider replacing these large dependencies with lighter alternatives:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {heavyDependencies.slice(0, 3).map((dep, index) => (
                  <li key={index}>
                    Replace <span className="font-mono bg-muted px-1 rounded">{dep.name}</span> ({dep.estimatedSize}) 
                    with {dep.alternatives?.[0] ? (
                      <span className="font-mono bg-muted px-1 rounded">{dep.alternatives[0]}</span>
                    ) : 'a lighter alternative'}
                  </li>
                ))}
                {heavyDependencies.length > 3 && (
                  <li>And {heavyDependencies.length - 3} more...</li>
                )}
              </ul>
            </div>
          )}
          
          {unnecessaryDependencies.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">2. Remove Unnecessary Dependencies</h4>
              <p className="text-sm">
                These dependencies are likely unnecessary in a Next.js project:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {unnecessaryDependencies.slice(0, 3).map((dep, index) => (
                  <li key={index}>
                    Remove <span className="font-mono bg-muted px-1 rounded">{dep.name}</span>: {dep.reason}
                  </li>
                ))}
                {unnecessaryDependencies.length > 3 && (
                  <li>And {unnecessaryDependencies.length - 3} more...</li>
                )}
              </ul>
            </div>
          )}
          
          {duplicateDependencies.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">3. Eliminate Duplicate Functionality</h4>
              <p className="text-sm">
                Standardize on a single library for each functionality:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {duplicateDependencies.map((dep, index) => (
                  <li key={index}>
                    Choose one from: {dep.names.map(name => (
                      <span key={name} className="font-mono bg-muted px-1 rounded mr-1">{name}</span>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {treeshakingIssues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">4. Fix Tree Shaking Issues</h4>
              <p className="text-sm">
                Update import statements to enable better tree shaking:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {treeshakingIssues.slice(0, 3).map((issue, index) => (
                  <li key={index}>
                    For <span className="font-mono bg-muted px-1 rounded">{issue.dependency}</span>: {issue.recommendation}
                  </li>
                ))}
                {treeshakingIssues.length > 3 && (
                  <li>And {treeshakingIssues.length - 3} more...</li>
                )}
              </ul>
            </div>
          )}
          
          {/* General recommendations always shown */}
          <div className="space-y-2">
            <h4 className="font-medium">{heavyDependencies.length || unnecessaryDependencies.length || duplicateDependencies.length || treeshakingIssues.length ? '5' : '1'}. General Optimization Tips</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Configure Next.js to use dynamic imports for large components</li>
              <li>Use <span className="font-mono bg-muted px-1 rounded">next/dynamic</span> with the <span className="font-mono bg-muted px-1 rounded">ssr: false</span> option for client-only components</li>
              <li>Enable automatic static optimization where possible</li>
              <li>Use Next.js Image and Font optimization</li>
              <li>Configure <span className="font-mono bg-muted px-1 rounded">@next/bundle-analyzer</span> to monitor your bundle size over time</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 