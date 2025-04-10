// components/analyze/analyze-form.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeUploader } from "./code-uploader";
import { CodeInput } from "./code-input";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";

export function AnalyzeForm() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [codeSource, setCodeSource] = useState<"upload" | "input">("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [inputCode, setInputCode] = useState("");
  
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
    
    try {
      // TODO: Implement the actual analysis logic
      // This will be connected to our AI analysis engine
      
      // Simulate analysis for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Analysis complete!");
      // TODO: Display results
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("An error occurred during analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="space-y-6">
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
    </div>
  );
}