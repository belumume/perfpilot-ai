// components/ui/ai-components.tsx
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info, Zap, Code, FileCode, ArrowRight } from 'lucide-react';

// Issue summary component
export function IssueSummary({ 
  title, 
  description, 
  count, 
  severity 
}: { 
  title: string; 
  description: string; 
  count: number; 
  severity: "critical" | "warning" | "info" | "success" 
}) {
  const getIcon = () => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getTextColor = () => {
    switch (severity) {
      case "critical":
        return "text-destructive";
      case "warning":
        return "text-amber-500";
      case "info":
        return "text-blue-500";
      case "success":
        return "text-green-500";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getTextColor()}`}>{count}</div>
      </CardContent>
    </Card>
  );
}

// Recommendation component
export function Recommendation({ 
  title, 
  description, 
  codeExample,
  importance = "medium"
}: { 
  title: string; 
  description: string; 
  codeExample?: string;
  importance?: "high" | "medium" | "low";
}) {
  const getImportanceBadge = () => {
    switch (importance) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return <Badge variant="default">Medium Priority</Badge>;
      case "low":
        return <Badge variant="outline">Low Priority</Badge>;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {getImportanceBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{description}</p>
        {codeExample && (
          <div className="rounded-md bg-muted p-4">
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-4 w-4" />
              <span className="text-xs font-medium">Example Implementation</span>
            </div>
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{codeExample}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Performance impact component
export function PerformanceImpact({
  metric,
  impact,
  description
}: {
  metric: string;
  impact: "high" | "medium" | "low";
  description: string;
}) {
  const getImpactColor = () => {
    switch (impact) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-blue-500";
    }
  };

  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="mt-1">
        <div className={`h-3 w-3 rounded-full ${getImpactColor()}`} />
      </div>
      <div>
        <h4 className="font-medium text-sm">{metric}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Summary section component
export function SummarySection({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}