// components/analyze/analyze-form.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeUploader } from "./code-uploader";
import { CodeInput } from "./code-input";
import { Button } from "@/components/ui/button";
import { Loader2, InfoIcon } from 'lucide-react';
import { toast } from "sonner";
import { AnalysisResult } from "@/lib/analysis/analyzer";
import { BundleAnalysisResult } from "@/lib/analysis/bundle-analyzer";
import dynamic from "next/dynamic";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Dynamically import the AnalysisResults component
const AnalysisResults = dynamic(() => import("./analysis-results").then(mod => ({ default: mod.AnalysisResults })), {
  loading: () => <div className="flex items-center justify-center py-8">
    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
    <p>Loading analysis results...</p>
  </div>,
  ssr: false
});

// Dynamically import the BundleAnalysis component
const BundleAnalysis = dynamic(() => import("./bundle-analysis").then(mod => ({ default: mod.BundleAnalysis })), {
  loading: () => <div className="flex items-center justify-center py-8">
    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
    <p>Loading bundle analysis...</p>
  </div>,
  ssr: false
});

export function AnalyzeForm() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [codeSource, setCodeSource] = useState<"upload" | "input">("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [inputCode, setInputCode] = useState("");
  const [fileName, setFileName] = useState("input.tsx");
  const [analysisResults, setAnalysisResults] = useState<{
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
  } | null>(null);
  
  const handleAnalyze = async () => {
    if (codeSource === "upload" && uploadedFiles.length === 0) {
      toast.error("Please upload at least one file to analyze");
      return;
    }
    
    if (codeSource === "input" && !inputCode.trim()) {
      toast.error("Please enter some code to analyze");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResults(null);
    
    try {
      const formData = new FormData();
      formData.append("codeSource", codeSource);
      
      if (codeSource === "upload") {
        // Append all files to the form data
        uploadedFiles.forEach(file => {
          formData.append("file", file);
        });
      } else {
        formData.append("code", inputCode);
        formData.append("fileName", fileName);
      }
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Analysis failed");
      }
      
      const result = await response.json();
      setAnalysisResults(result);
      
      if (result.bundleAnalysis) {
        toast.success("Bundle analysis complete!");
      } else {
        toast.success("Code analysis complete!");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("An error occurred during analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Check if one of the files is package.json
  const hasPackageJson = uploadedFiles.some(file => file.name === 'package.json');
  
  // Determine if we're in bundle analysis mode
  const isBundleAnalysisMode = 
    (codeSource === "input" && fileName === "package.json") || 
    (codeSource === "upload" && hasPackageJson);
  
  return (
    <div className="space-y-6">
      {!analysisResults ? (
        <>
          <Tabs defaultValue="upload" onValueChange={(value) => setCodeSource(value as "upload" | "input")}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="input">Paste Code</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-6">
              <Alert className="mb-4 bg-muted/50">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Include a <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">package.json</span> file to get bundle size analysis!
                </AlertDescription>
              </Alert>
              <CodeUploader 
                files={uploadedFiles} 
                setFiles={setUploadedFiles} 
              />
            </TabsContent>
            <TabsContent value="input" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-3">
                    <label htmlFor="filename" className="block text-sm font-medium text-muted-foreground mb-1">
                      File name (use package.json for bundle analysis)
                    </label>
                    <input
                      id="filename"
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="e.g., index.tsx or package.json"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Type "package.json" for bundle analysis or use any other name for code analysis.
                    </p>
                  </div>
                </div>
                <CodeInput 
                  code={inputCode} 
                  setCode={setInputCode} 
                  isPackageJson={fileName === "package.json"}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isBundleAnalysisMode ? "Analyzing Bundle..." : "Analyzing Performance..."}
                </>
              ) : (
                isBundleAnalysisMode ? "Analyze Bundle Size" : "Analyze Performance"
              )}
            </Button>
          </div>
        </>
      ) : (
        // Show bundle analysis or code analysis based on results
        analysisResults.bundleAnalysis ? (
          <div className="space-y-8">
            <BundleAnalysis 
              analysis={analysisResults.bundleAnalysis} 
            />
            <div className="flex justify-start">
              <Button variant="outline" onClick={() => setAnalysisResults(null)}>
                Back to Analysis
              </Button>
            </div>
          </div>
        ) : (
          <AnalysisResults 
            results={analysisResults} 
            onReset={() => setAnalysisResults(null)}
          />
        )
      )}
    </div>
  );
}