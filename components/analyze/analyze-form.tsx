// components/analyze/analyze-form.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeUploader } from "./code-uploader";
import { CodeInput } from "./code-input";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { AnalysisResult } from "@/lib/analysis/analyzer";
import dynamic from "next/dynamic";

// Dynamically import the AnalysisResults component
const AnalysisResults = dynamic(() => import("./analysis-results").then(mod => ({ default: mod.AnalysisResults })), {
  loading: () => <div className="flex items-center justify-center py-8">
    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
    <p>Loading analysis results...</p>
  </div>,
  ssr: false
});

export function AnalyzeForm() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [codeSource, setCodeSource] = useState<"upload" | "input">("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [inputCode, setInputCode] = useState("");
  const [analysisResults, setAnalysisResults] = useState<{
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
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("An error occurred during analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
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
              <CodeUploader 
                files={uploadedFiles} 
                setFiles={setUploadedFiles} 
              />
            </TabsContent>
            <TabsContent value="input" className="mt-6">
              <CodeInput 
                code={inputCode} 
                setCode={setInputCode} 
              />
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
                  Analyzing...
                </>
              ) : (
                "Analyze Performance"
              )}
            </Button>
          </div>
        </>
      ) : (
        <AnalysisResults 
          results={analysisResults} 
          onReset={() => setAnalysisResults(null)}
        />
      )}
    </div>
  );
}