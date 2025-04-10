// components/analyze/analysis-results.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResult } from "@/lib/analysis/analyzer";
import { AlertTriangle, CheckCircle, Info, ArrowLeft, Zap, FileCode } from 'lucide-react';
import { useState } from "react";

interface AnalysisResultsProps {
  results: {
    analysis: AnalysisResult | {
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
  };
  onReset: () => void;
}

export function AnalysisResults({ results, onReset }: AnalysisResultsProps) {
  // Check if we have multi-file results
  const isMultiFile = results.analysis && 'fileResults' in results.analysis;
  
  // Get the summary data
  const summary = isMultiFile 
    ? results.analysis.aggregateSummary 
    : (results.analysis as AnalysisResult).summary;
  
  // Get file results for multi-file analysis
  const fileResults = isMultiFile 
    ? results.analysis.fileResults 
    : { "single-file": results.analysis as AnalysisResult };
  
  const fileNames = Object.keys(fileResults);
  const [activeFile, setActiveFile] = useState(fileNames[0]);
  
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
  
  return (
    <div className="space-y-8">
      <Button variant="ghost" onClick={onReset} className="pl-0">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Analysis
      </Button>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalIssues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary.criticalIssues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warning Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{summary.warningIssues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Info Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{summary.infoIssues}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>
            Personalized recommendations based on your code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">{results.recommendations.summary}</p>
          </div>
          
          <div className="space-y-4">
            {results.recommendations.recommendations.map((recommendation, index) => (
              <div key={index} className="flex gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
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
                  const issueCount = fileResults[fileName].issues.length;
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
                {fileResults[activeFile].issues.length > 0 ? (
                  fileResults[activeFile].issues.map((issue, index) => (
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
                            <pre className="mt-2 rounded-md bg-muted p-2 text-xs">{issue.code}</pre>
                          )}
                          <div className="mt-2">
                            <h5 className="text-sm font-medium">Recommendation</h5>
                            <p className="text-sm text-muted-foreground">{issue.rule.recommendation}</p>
                            {issue.rule.codeExample && (
                              <pre className="mt-2 rounded-md bg-muted p-2 text-xs whitespace-pre-wrap">{issue.rule.codeExample}</pre>
                            )}
                          </div>
                          {issue.rule.docs && (
                            <a 
                              href={issue.rule.docs} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline inline-block mt-2"
                            >
                              Learn more
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
              {fileResults[fileNames[0]].issues.length > 0 ? (
                fileResults[fileNames[0]].issues.map((issue, index) => (
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
                          <pre className="mt-2 rounded-md bg-muted p-2 text-xs">{issue.code}</pre>
                        )}
                        <div className="mt-2">
                          <h5 className="text-sm font-medium">Recommendation</h5>
                          <p className="text-sm text-muted-foreground">{issue.rule.recommendation}</p>
                          {issue.rule.codeExample && (
                            <pre className="mt-2 rounded-md bg-muted p-2 text-xs whitespace-pre-wrap">{issue.rule.codeExample}</pre>
                          )}
                        </div>
                        {issue.rule.docs && (
                          <a 
                            href={issue.rule.docs} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-block mt-2"
                          >
                            Learn more
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
    </div>
  );
}