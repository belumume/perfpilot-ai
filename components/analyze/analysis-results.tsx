// components/analyze/analysis-results.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnalysisResult } from "@/lib/analysis/analyzer";
import { AlertTriangle, CheckCircle, Info, ArrowLeft, Zap, FileCode, ExternalLink, BarChart, BookOpen, Copy, LineChart, Download, Share2 } from 'lucide-react';
import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Badge } from "@/components/ui/badge";
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import PerformanceCharts from "@/components/charts/PerformanceCharts";
import Image from "next/image";
import { BundleAnalysisResult } from "@/lib/analysis/bundle-analyzer";
import { BundleAnalysis } from "@/components/analyze/bundle-analysis";

// Add type declaration for modules without declaration files
declare module 'react-syntax-highlighter';
declare module 'react-syntax-highlighter/dist/esm/styles/prism';

interface AnalysisResultsProps {
  results: {
    analysis?: AnalysisResult | {
      fileResults: Record<string, AnalysisResult>;
      aggregateSummary: {
        totalIssues: number;
        criticalIssues: number;
        warningIssues: number;
        infoIssues: number;
        categories: Record<string, number>;
      };
    };
    recommendations: {
      summary: string;
      recommendations: string[];
    };
    bundleAnalysis?: BundleAnalysisResult;
  };
  onReset: () => void;
}

export function AnalysisResults({ results, onReset }: AnalysisResultsProps) {
  // State for active file and tab - these must be defined outside conditionals
  const [activeFile, setActiveFile] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // All hooks must be called at the top level, before any conditional returns
  useEffect(() => {
    if (results.analysis) {
      // Check if we have multi-file results
      const isMultiFile = 'fileResults' in results.analysis;
      
      // Get file results for multi-file analysis
      const fileResults = isMultiFile && 'fileResults' in results.analysis
        ? results.analysis.fileResults 
        : { "single-file": results.analysis as AnalysisResult };
      
      const fileNames = Object.keys(fileResults);
      
      if (fileNames.length > 0 && !activeFile) {
        setActiveFile(fileNames[0]);
      }
    }
  }, [results.analysis, activeFile]);
  
  // Function to export analysis results as JSON
  const exportAsJson = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileName = 'perfpilot-analysis.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    toast.success("Analysis results exported as JSON");
  };
  
  // Function to export as formatted report
  const exportAsReport = () => {
    // Check if we have multi-file results or bundle analysis
    const isMultiFile = results.analysis && 'fileResults' in results.analysis;
    const hasBundleAnalysis = !!results.bundleAnalysis;
    
    // Get the summary data
    const summary = isMultiFile && results.analysis && 'aggregateSummary' in results.analysis 
      ? results.analysis.aggregateSummary 
      : (results.analysis as AnalysisResult)?.summary;
    
    // Calculate performance score if we have analysis results
    const performanceScore = results.analysis ? calculatePerformanceScore() : 'N/A';
    
    // Create report content
    let reportContent = `# PerfPilot AI Analysis Report\n\n`;
    reportContent += `## Summary\n\n`;
    
    if (results.analysis) {
      reportContent += `- **Performance Score**: ${performanceScore}/100\n`;
      reportContent += `- **Total Issues**: ${summary.totalIssues}\n`;
      reportContent += `- **Critical Issues**: ${summary.criticalIssues}\n`;
      reportContent += `- **Warning Issues**: ${summary.warningIssues}\n`;
      reportContent += `- **Info Issues**: ${summary.infoIssues}\n\n`;
    }
    
    if (hasBundleAnalysis && results.bundleAnalysis) {
      reportContent += `## Bundle Analysis\n\n`;
      reportContent += `- **Bundle Score**: ${results.bundleAnalysis.score}/100\n`;
      reportContent += `- **Total Dependencies**: ${results.bundleAnalysis.totalDependencies}\n`;
      reportContent += `- **Heavy Dependencies**: ${results.bundleAnalysis.heavyDependencies.length}\n`;
      reportContent += `- **Unnecessary Dependencies**: ${results.bundleAnalysis.unnecessaryDependencies.length}\n`;
      reportContent += `- **Duplicate Dependencies**: ${results.bundleAnalysis.duplicateDependencies.length}\n\n`;
    }
    
    // Add AI recommendations
    reportContent += `## AI Recommendations\n\n`;
    reportContent += `${results.recommendations.summary}\n\n`;
    
    // Add detailed recommendations
    reportContent += `## Detailed Recommendations\n\n`;
    results.recommendations.recommendations.forEach((recommendation, index) => {
      reportContent += `### Recommendation ${index + 1}\n\n`;
      reportContent += `${cleanRecommendationText(recommendation)}\n\n`;
    });
    
    // Convert to HTML for download (simple formatting)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>PerfPilot AI Analysis Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #0070f3; }
    h2 { color: #0070f3; margin-top: 20px; }
    h3 { margin-top: 15px; }
    ul { margin-bottom: 15px; }
  </style>
</head>
<body>
  ${reportContent.replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\# (.*)/g, '<h1>$1</h1>')
    .replace(/\#\# (.*)/g, '<h2>$1</h2>')
    .replace(/\#\#\# (.*)/g, '<h3>$1</h3>')
    .replace(/- (.*)/g, '<li>$1</li>')
    .replace(/<li>/g, '<ul><li>')
    .replace(/<\/li>/g, '</li></ul>')}
</body>
</html>
    `;
    
    const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
    const exportFileName = 'perfpilot-report.html';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    toast.success("Analysis report exported as HTML");
  };
  
  // Function to format markdown with custom components
  const MarkdownComponents: Components = {
    // Style links
    a: ({ className, children, ...props }) => (
      <a 
        className={`text-primary hover:underline ${className || ''}`}
        target="_blank" 
        rel="noopener noreferrer"
        {...props} 
      >
        {children}
      </a>
    ),
    // Style paragraphs
    p: ({ className, children, ...props }) => (
      <p className={`mb-2 ${className || ''}`} {...props}>
        {children}
      </p>
    ),
    // Style headings
    h1: ({ className, children, ...props }) => (
      <h1 className={`text-xl font-bold mb-2 ${className || ''}`} {...props}>
        {children}
      </h1>
    ),
    h2: ({ className, children, ...props }) => (
      <h2 className={`text-lg font-bold mb-2 ${className || ''}`} {...props}>
        {children}
      </h2>
    ),
    h3: ({ className, children, ...props }) => (
      <h3 className={`text-base font-bold mb-2 ${className || ''}`} {...props}>
        {children}
      </h3>
    ),
    // Style lists
    ul: ({ className, children, ...props }) => (
      <ul className={`list-disc pl-5 mb-2 ${className || ''}`} {...props}>
        {children}
      </ul>
    ),
    ol: ({ className, children, ...props }) => (
      <ol className={`list-decimal pl-5 mb-2 ${className || ''}`} {...props}>
        {children}
      </ol>
    ),
    // Style list items
    li: ({ className, children, ...props }) => (
      <li className={`mb-1 ${className || ''}`} {...props}>
        {children}
      </li>
    ),
    // Style code (inline)
    // @ts-expect-error - The inline property is needed for ReactMarkdown
    code: ({ inline, className, children, ...props }) => {
      return inline ? (
        <code 
          className={`px-1 py-0.5 bg-muted rounded text-xs font-mono ${className || ''}`} 
          {...props}
        >
          {children}
        </code>
      ) : (
        <code 
          className={`${className || ''}`}
          {...props}
        >
          {children}
        </code>
      );
    },
    // Style blockquotes
    blockquote: ({ className, children, ...props }) => (
      <blockquote 
        className={`pl-4 border-l-2 border-muted italic my-2 ${className || ''}`} 
        {...props}
      >
        {children}
      </blockquote>
    ),
    // Handle tables
    table: ({ className, children, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table 
          className={`min-w-full border-collapse ${className || ''}`} 
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ className, children, ...props }) => (
      <thead 
        className={`bg-muted ${className || ''}`} 
        {...props}
      >
        {children}
      </thead>
    ),
    tbody: ({ className, children, ...props }) => (
      <tbody 
        className={`${className || ''}`} 
        {...props}
      >
        {children}
      </tbody>
    ),
    tr: ({ className, children, ...props }) => (
      <tr 
        className={`border-b border-border ${className || ''}`} 
        {...props}
      >
        {children}
      </tr>
    ),
    th: ({ className, children, ...props }) => (
      <th 
        className={`px-4 py-2 text-left text-sm font-semibold ${className || ''}`} 
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ className, children, ...props }) => (
      <td 
        className={`px-4 py-2 text-sm ${className || ''}`} 
        {...props}
      >
        {children}
      </td>
    ),
    // Handle images
    img: ({ className, ...props }) => (
      <Image 
        className={`max-w-full h-auto my-4 rounded ${className || ''}`}
        alt={props.alt || "Image"}
        width={500}
        height={300}
        src={props.src || ""}
      />
    ),
    // Handle horizontal rules
    hr: ({ className, ...props }) => (
      <hr 
        className={`my-4 border-t border-border ${className || ''}`} 
        {...props} 
      />
    ),
  };
  
  // Handle bundle-only analysis (when only bundleAnalysis is available without code analysis)
  if (results.bundleAnalysis && !results.analysis) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={onReset} className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analysis
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportAsJson}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={exportAsReport}>
              <Share2 className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bundle Analysis Results</CardTitle>
            <CardDescription>
              Analysis of your package.json dependencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BundleAnalysis analysis={results.bundleAnalysis} />
          </CardContent>
        </Card>
        
        {results.recommendations && (
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Suggestions for optimizing your dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted p-5">
                <div className="markdown-content">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={MarkdownComponents}
                  >
                    {results.recommendations.summary}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
  
  // If there's no analysis, just show recommendations
  if (!results.analysis) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={onReset} className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analysis
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportAsJson}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={exportAsReport}>
              <Share2 className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Recommendations for your code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-5">
              <div className="markdown-content">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={MarkdownComponents}
                >
                  {results.recommendations?.summary || "No recommendations available."}
                </ReactMarkdown>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Check if we have multi-file results
  const isMultiFile = results.analysis && 'fileResults' in results.analysis;
  
  // Get the summary data
  const summary = isMultiFile && 'aggregateSummary' in results.analysis 
    ? results.analysis.aggregateSummary 
    : (results.analysis as AnalysisResult).summary;
  
  // Get file results for multi-file analysis
  const fileResults = isMultiFile && 'fileResults' in results.analysis
    ? results.analysis.fileResults 
    : { "single-file": results.analysis as AnalysisResult };
  
  const fileNames = Object.keys(fileResults);
  
  // Calculate performance score based on issues
  const calculatePerformanceScore = () => {
    if (summary.totalIssues === 0) return 100;
    
    // Weight different severity levels
    const criticalWeight = 5;
    const warningWeight = 2;
    const infoWeight = 0.5;
    
    const weightedIssues = 
      (summary.criticalIssues * criticalWeight) + 
      (summary.warningIssues * warningWeight) + 
      (summary.infoIssues * infoWeight);
    
    // Base score is 100, subtract weighted issues
    // Calculate a score between 0-100
    const baseScore = 100;
    const score = Math.max(0, Math.min(100, baseScore - (weightedIssues / 5) * 10));
    
    return Math.round(score);
  };
  
  const performanceScore = calculatePerformanceScore();
  
  // Get performance badge based on score
  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "bg-green-500" };
    if (score >= 75) return { label: "Good", color: "bg-green-400" };
    if (score >= 60) return { label: "Moderate", color: "bg-yellow-400" };
    if (score >= 40) return { label: "Needs Improvement", color: "bg-orange-500" };
    return { label: "Poor", color: "bg-red-500" };
  };
  
  const performanceBadge = getPerformanceBadge(performanceScore);
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  // Function to determine recommendation priority based on content
  const getRecommendationPriority = (recommendation: string) => {
    const lowerCaseRec = recommendation.toLowerCase();
    if (
      lowerCaseRec.includes('critical') || 
      lowerCaseRec.includes('significant') || 
      lowerCaseRec.includes('important') ||
      lowerCaseRec.includes('high priority')
    ) {
      return 'high';
    } else if (
      lowerCaseRec.includes('consider') || 
      lowerCaseRec.includes('might') || 
      lowerCaseRec.includes('could') ||
      lowerCaseRec.includes('low priority')
    ) {
      return 'low';
    }
    return 'medium';
  };

  // Function to extract code examples from recommendation text
  const extractCodeExample = (recommendation: string) => {
    // Match code blocks with or without language specification
    // Support more language identifiers and handle whitespace
    const codeBlockRegex = /```(?:jsx?|tsx?|javascript|typescript|js|ts|html|css|json|bash|shell|sh)?([^`]+)```/g;
    const matches = [...recommendation.matchAll(codeBlockRegex)];
    if (matches.length > 0) {
      // Return the first code block by default
      return matches[0][1].trim();
    }
    return null;
  };

  // Function to clean recommendation text by removing code blocks
  const cleanRecommendationText = (recommendation: string) => {
    // We'll preserve the original text but replace code blocks with markers
    return recommendation
      .replace(/```(?:jsx?|tsx?|javascript|typescript|js|ts|html|css|json|bash|shell|sh)?([^`]+)```/g, '')
      .replace(/\n\n+/g, '\n\n') // Replace multiple newlines with just two
      .trim();
  };

  // Function to copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copied to clipboard!");
  };
  
  // Calculate category distribution
  const categoryData = summary.categories || {};
  const totalCategoryIssues = Object.values(categoryData).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onReset} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Analysis
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportAsJson}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={exportAsReport}>
            <Share2 className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="issues">Detected Issues</TabsTrigger>
          <TabsTrigger value="insights">Performance Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">The total number of performance issues detected across {isMultiFile ? fileNames.length : 1} file(s).</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalIssues}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">Issues that significantly impact performance and should be fixed immediately.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{summary.criticalIssues}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-sm font-medium">Warning Issues</CardTitle>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">Issues that may impact performance and should be addressed.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">{summary.warningIssues}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-sm font-medium">Info Issues</CardTitle>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">Suggestions for improving performance or following best practices.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{summary.infoIssues}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Score</CardTitle>
                <CardDescription>Overall assessment of your Next.js app performance</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="relative mb-4">
                  <div className={`h-32 w-32 rounded-full flex items-center justify-center ${performanceBadge.color} text-white text-4xl font-bold`}>
                    {performanceScore}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{performanceBadge.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {performanceScore >= 90 
                      ? "Your app follows Next.js best practices well!" 
                      : performanceScore >= 75 
                      ? "Room for some minor optimizations" 
                      : performanceScore >= 60 
                      ? "Several performance improvements needed" 
                      : "Significant performance issues detected"}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Issue Categories</CardTitle>
                <CardDescription>Breakdown of performance issues by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(categoryData).map(([category, count]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{category}</span>
                      <span className="text-sm text-muted-foreground">{count} issues</span>
                    </div>
                    <Progress value={(count / totalCategoryIssues) * 100} className="h-2" />
                  </div>
                ))}
                
                {Object.keys(categoryData).length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p>No issues detected!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
              <CardDescription>
                AI-generated summary of your app&apos;s performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted p-5">
                <div className="markdown-content">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={MarkdownComponents}
                  >
                    {results.recommendations.summary}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="gap-1" asChild>
                <a href="https://nextjs.org/docs/app/building-your-application/optimizing" target="_blank" rel="noopener noreferrer">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Next.js Optimization Docs
                </a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Personalized recommendations based on your code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted p-5">
                <div className="markdown-content">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={MarkdownComponents}
                  >
                    {results.recommendations.summary}
                  </ReactMarkdown>
                </div>
              </div>
              
              <div className="space-y-6">
                {results.recommendations.recommendations.map((recommendation, index) => {
                  const priority = getRecommendationPriority(recommendation);
                  const codeExample = extractCodeExample(recommendation);
                  const cleanText = cleanRecommendationText(recommendation);
                  
                  return (
                    <Card key={index} className={`border-l-4 ${
                      priority === 'high' ? 'border-l-destructive' : 
                      priority === 'medium' ? 'border-l-primary' : 
                      'border-l-muted-foreground'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className={`h-5 w-5 ${
                              priority === 'high' ? 'text-destructive' : 
                              priority === 'medium' ? 'text-primary' : 
                              'text-muted-foreground'
                            }`} />
                            <CardTitle className="text-base">Recommendation {index + 1}</CardTitle>
                          </div>
                          <Badge variant={
                            priority === 'high' ? 'destructive' : 
                            priority === 'medium' ? 'default' : 
                            'outline'
                          }>
                            {priority === 'high' ? 'High Priority' : 
                             priority === 'medium' ? 'Medium Priority' : 
                             'Low Priority'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5 pt-0">
                        <div className="markdown-content">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]} 
                            rehypePlugins={[rehypeRaw, rehypeSanitize]}
                            components={MarkdownComponents}
                          >
                            {cleanText}
                          </ReactMarkdown>
                        </div>
                        
                        {codeExample && (
                          <div className="rounded-md overflow-hidden mt-4">
                            <div className="bg-muted px-4 py-2 text-xs font-medium flex items-center justify-between">
                              <div className="flex items-center">
                                <FileCode className="h-4 w-4 mr-2" />
                                Example Implementation
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2"
                                onClick={() => copyToClipboard(codeExample)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                <span className="text-xs">Copy</span>
                              </Button>
                            </div>
                            <SyntaxHighlighter 
                              language="jsx" 
                              style={vscDarkPlus}
                              customStyle={{ margin: 0, borderRadius: '0 0 0.375rem 0.375rem' }}
                            >
                              {codeExample}
                            </SyntaxHighlighter>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detected Issues</CardTitle>
              <CardDescription>
                {isMultiFile 
                  ? `Performance issues found across ${fileNames.length} files`
                  : "Performance issues found in your code"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fileNames.length > 1 ? (
                <Tabs defaultValue={activeFile} onValueChange={setActiveFile}>
                  <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap">
                    {fileNames.map(fileName => {
                      const fileResult = fileResults[fileName] || { issues: [] };
                      const issueCount = fileResult.issues?.length || 0;
                      return (
                        <TabsTrigger key={fileName} value={fileName} className="flex items-center gap-1">
                          <FileCode className="h-4 w-4" />
                          <span className="truncate max-w-[150px]">{fileName}</span>
                          <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                            issueCount > 0 ? 'bg-muted' : 'bg-green-100 dark:bg-green-900'
                          }`}>
                            {issueCount}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  
                  <div className="space-y-6">
                    {(fileResults[activeFile]?.issues || []).length > 0 ? (
                      (fileResults[activeFile]?.issues || []).map((issue, index) => (
                        <div key={index}>
                          {index > 0 && <Separator className="my-4" />}
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(issue.rule.severity)}
                            <div className="space-y-1">
                              <h4 className="font-medium">{issue.rule.name}</h4>
                              <p className="text-sm text-muted-foreground">{issue.rule.description}</p>
                              {issue.lineNumber && (
                                <p className="text-xs text-muted-foreground">Line: {issue.lineNumber}</p>
                              )}
                              {issue.code && (
                                <div className="mt-2 rounded-md overflow-hidden">
                                  <div className="bg-muted px-4 py-2 text-xs font-medium flex items-center justify-between">
                                    <span>Detected Code</span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 px-2"
                                      onClick={() => copyToClipboard(issue.code || '')}
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      <span className="text-xs">Copy</span>
                                    </Button>
                                  </div>
                                  <SyntaxHighlighter 
                                    language="jsx" 
                                    style={vscDarkPlus}
                                    customStyle={{ margin: 0, fontSize: '0.75rem' }}
                                  >
                                    {issue.code}
                                  </SyntaxHighlighter>
                                </div>
                              )}
                              <div className="mt-2">
                                <h5 className="text-sm font-medium">Recommendation</h5>
                                <p className="text-sm text-muted-foreground">{issue.rule.recommendation}</p>
                                {issue.rule.codeExample && (
                                  <div className="mt-2 rounded-md overflow-hidden">
                                    <div className="bg-muted px-4 py-2 text-xs font-medium flex items-center justify-between">
                                      <span>Recommended Fix</span>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 px-2"
                                        onClick={() => copyToClipboard(issue.rule.codeExample || '')}
                                      >
                                        <Copy className="h-3 w-3 mr-1" />
                                        <span className="text-xs">Copy</span>
                                      </Button>
                                    </div>
                                    <SyntaxHighlighter 
                                      language="jsx" 
                                      style={vscDarkPlus}
                                      customStyle={{ margin: 0, fontSize: '0.75rem' }}
                                    >
                                      {issue.rule.codeExample}
                                    </SyntaxHighlighter>
                                  </div>
                                )}
                              </div>
                              {issue.rule.docs && (
                                <a 
                                  href={issue.rule.docs} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
                                >
                                  Learn more
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <p>No issues detected in this file. Great job!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Tabs>
              ) : (
                <div className="space-y-6">
                  {(fileResults[fileNames[0]]?.issues || []).length > 0 ? (
                    (fileResults[fileNames[0]]?.issues || []).map((issue, index) => (
                      <div key={index}>
                        {index > 0 && <Separator className="my-4" />}
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(issue.rule.severity)}
                          <div className="space-y-1">
                            <h4 className="font-medium">{issue.rule.name}</h4>
                            <p className="text-sm text-muted-foreground">{issue.rule.description}</p>
                            {issue.lineNumber && (
                              <p className="text-xs text-muted-foreground">Line: {issue.lineNumber}</p>
                            )}
                            {issue.code && (
                              <div className="mt-2 rounded-md overflow-hidden">
                                <div className="bg-muted px-4 py-2 text-xs font-medium flex items-center justify-between">
                                  <span>Detected Code</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2"
                                    onClick={() => copyToClipboard(issue.code || '')}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    <span className="text-xs">Copy</span>
                                  </Button>
                                </div>
                                <SyntaxHighlighter 
                                  language="jsx" 
                                  style={vscDarkPlus}
                                  customStyle={{ margin: 0, fontSize: '0.75rem' }}
                                >
                                  {issue.code}
                                </SyntaxHighlighter>
                              </div>
                            )}
                            <div className="mt-2">
                              <h5 className="text-sm font-medium">Recommendation</h5>
                              <p className="text-sm text-muted-foreground">{issue.rule.recommendation}</p>
                              {issue.rule.codeExample && (
                                <div className="mt-2 rounded-md overflow-hidden">
                                  <div className="bg-muted px-4 py-2 text-xs font-medium flex items-center justify-between">
                                    <span>Recommended Fix</span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-7 px-2"
                                      onClick={() => copyToClipboard(issue.rule.codeExample || '')}
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      <span className="text-xs">Copy</span>
                                    </Button>
                                  </div>
                                  <SyntaxHighlighter 
                                    language="jsx" 
                                    style={vscDarkPlus}
                                    customStyle={{ margin: 0, fontSize: '0.75rem' }}
                                  >
                                    {issue.rule.codeExample}
                                  </SyntaxHighlighter>
                                </div>
                              )}
                            </div>
                            {issue.rule.docs && (
                              <a 
                                href={issue.rule.docs} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
                              >
                                Learn more
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <p>No issues detected. Great job!</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Visualization</CardTitle>
              <CardDescription>
                Interactive charts to visualize your app&apos;s performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceCharts 
                score={performanceScore}
                categories={categoryData}
                criticalIssues={summary.criticalIssues}
                warningIssues={summary.warningIssues}
                infoIssues={summary.infoIssues}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next.js Performance Insights</CardTitle>
              <CardDescription>
                Key performance areas and best practices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-primary" />
                    Core Web Vitals
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>LCP (Largest Contentful Paint):</strong> Time until the largest content element is visible. Use next/image with priority for hero images.</p>
                    <p><strong>FID/INP (First Input Delay/Interaction to Next Paint):</strong> Time until the page is responsive to user input. Optimize JavaScript execution and reduce main thread work.</p>
                    <p><strong>CLS (Cumulative Layout Shift):</strong> Visual stability measure. Always specify image dimensions and use next/font for font loading.</p>
                  </div>
                  
                  <h3 className="text-lg font-semibold flex items-center gap-2 mt-6">
                    <Zap className="h-5 w-5 text-primary" />
                    Next.js 14/15 Features
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Partial Prerendering (PPR):</strong> A hybrid rendering approach that statically generates a shell and streams dynamic content, combining the benefits of static and dynamic rendering.</p>
                    <p><strong>React Server Components (RSC):</strong> Components that render on the server, reducing client-side JavaScript and improving initial load performance.</p>
                    <p><strong>Server Actions:</strong> Functions that run on the server for form submissions and data mutations, simplifying state management and data processing.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary" />
                    Optimization Techniques
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Image Optimization</h4>
                      <Progress value={calculateImageOptimizationScore()} className="h-2 mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {summary.categories?.images ? `${summary.categories.images} issues detected` : 'No issues detected'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Code Splitting & Dynamic Imports</h4>
                      <Progress value={calculateImportsOptimizationScore()} className="h-2 mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {summary.categories?.imports ? `${summary.categories.imports} issues detected` : 'No issues detected'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Rendering Strategy</h4>
                      <Progress value={calculateRenderingOptimizationScore()} className="h-2 mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {summary.categories?.rendering ? `${summary.categories.rendering} issues detected` : 'No issues detected'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Font Optimization</h4>
                      <Progress value={calculateFontOptimizationScore()} className="h-2 mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {summary.categories?.fonts ? `${summary.categories.fonts} issues detected` : 'No issues detected'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Script Management</h4>
                      <Progress value={calculateScriptOptimizationScore()} className="h-2 mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {summary.categories?.scripts ? `${summary.categories.scripts} issues detected` : 'No issues detected'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="pt-2">
                <h3 className="text-lg font-semibold mb-4">Resources & Next Steps</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Official Documentation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <a 
                        href="https://nextjs.org/docs/app/building-your-application/optimizing/images" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Image Optimization
                      </a>
                      <a 
                        href="https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Partial Prerendering (PPR)
                      </a>
                      <a 
                        href="https://nextjs.org/docs/app/building-your-application/rendering/server-components" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Server Components
                      </a>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Learn & Improve</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <a 
                        href="https://nextjs.org/learn/dashboard-app" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Next.js Learn Dashboard Course
                      </a>
                      <a 
                        href="https://vercel.com/blog/next-js-14" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Next.js 14 Release Blog
                      </a>
                      <a 
                        href="https://vercel.com/analytics" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Vercel Analytics for Web Vitals
                      </a>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
  
  // Helper functions for performance scores
  function calculateImageOptimizationScore() {
    if (!summary.categories?.images) return 100;
    const imageIssues = summary.categories.images;
    return Math.max(0, 100 - imageIssues * 20);
  }
  
  function calculateImportsOptimizationScore() {
    if (!summary.categories?.imports) return 100;
    const importIssues = summary.categories.imports;
    return Math.max(0, 100 - importIssues * 20);
  }
  
  function calculateRenderingOptimizationScore() {
    if (!summary.categories?.rendering) return 100;
    const renderingIssues = summary.categories.rendering;
    return Math.max(0, 100 - renderingIssues * 20);
  }
  
  function calculateFontOptimizationScore() {
    if (!summary.categories?.fonts) return 100;
    const fontIssues = summary.categories.fonts;
    return Math.max(0, 100 - fontIssues * 20);
  }
  
  function calculateScriptOptimizationScore() {
    if (!summary.categories?.scripts) return 100;
    const scriptIssues = summary.categories.scripts;
    return Math.max(0, 100 - scriptIssues * 20);
  }
}

export default AnalysisResults;