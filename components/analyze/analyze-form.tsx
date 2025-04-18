// components/analyze/analyze-form.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeUploader } from "./code-uploader";
import { CodeInput } from "./code-input";
import { Button } from "@/components/ui/button";
import { Loader2, InfoIcon, Zap, CheckCircle, AlertTriangle, FileText, Package } from 'lucide-react';
import { toast } from "sonner";
import { AnalysisResult } from "@/lib/analysis/analyzer";
import { BundleAnalysisResult } from "@/lib/analysis/bundle-analyzer";
import dynamic from "next/dynamic";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

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

// Analysis progress stages
type AnalysisProgressStage = 
  'preparing' | 
  'processing' | 
  'analyzing' | 
  'bundle-analysis' | 
  'recommendations' | 
  'finalizing';

// Text descriptions for each stage
const stageDescriptions: Record<AnalysisProgressStage, string> = {
  'preparing': 'Preparing analysis environment...',
  'processing': 'Processing files and identifying structure...',
  'analyzing': 'Analyzing code performance patterns...',
  'bundle-analysis': 'Examining bundle size and dependencies...',
  'recommendations': 'Generating AI-powered recommendations...',
  'finalizing': 'Finalizing analysis results...'
};

// Icons for each stage
const stageIcons: Record<AnalysisProgressStage, JSX.Element> = {
  'preparing': <Loader2 className="h-4 w-4 animate-spin" />,
  'processing': <FileText className="h-4 w-4" />,
  'analyzing': <Zap className="h-4 w-4" />,
  'bundle-analysis': <Package className="h-4 w-4" />,
  'recommendations': <AlertTriangle className="h-4 w-4" />,
  'finalizing': <CheckCircle className="h-4 w-4" />
};

// Near the top of the file, add a helper function to generate unique IDs
const generateAnalysisId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 12);
};

// Using a named function declaration instead of a function expression
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
  
  // New state for streaming analysis
  const [analysisProgress, setAnalysisProgress] = useState<{
    stage: AnalysisProgressStage;
    message: string;
    detailMessage?: string;
    progress: number;
  } | null>(null);
  
  // Reference to EventSource for cleanup
  const eventSourceRef = useRef<EventSource | null>(null);

  // Clean up the event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Determine analysis stage based on message content
  const inferStageFromMessage = (message: string): AnalysisProgressStage => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('starting') || lowerMessage.includes('preparing')) {
      return 'preparing';
    } else if (lowerMessage.includes('processing') || lowerMessage.includes('files loaded') || lowerMessage.includes('identifying')) {
      return 'processing';
    } else if (lowerMessage.includes('analyzing code') || lowerMessage.includes('code structure')) {
      return 'analyzing';
    } else if (lowerMessage.includes('bundle analysis') || lowerMessage.includes('dependencies')) {
      return 'bundle-analysis';
    } else if (lowerMessage.includes('generating') || lowerMessage.includes('recommendations')) {
      return 'recommendations';
    } else if (lowerMessage.includes('complete') || lowerMessage.includes('final')) {
      return 'finalizing';
    }
    
    // Default to processing if we can't determine
    return 'processing';
  };
  
  // Calculate progress percentage based on stage
  const calculateProgressFromStage = (stage: AnalysisProgressStage): number => {
    const stages: AnalysisProgressStage[] = ['preparing', 'processing', 'analyzing', 'bundle-analysis', 'recommendations', 'finalizing'];
    const stageIndex = stages.indexOf(stage);
    const totalStages = stages.length;
    
    // Base progress on stage (each stage is worth 15% except the last which is 25%)
    return Math.min(100, Math.max(5, stageIndex === totalStages - 1 
      ? 95 // Final stage is at 95%
      : Math.round((stageIndex / (totalStages - 1)) * 85) + 5)); // Other stages from 5% to 90%
  };
  
  // Effect to log analysis results when they change
  useEffect(() => {
    if (analysisResults) {
      console.log('Analysis results in state:', analysisResults);
      
      // Check if results has the expected structure
      if (analysisResults.recommendations) {
        console.log('Recommendations found:', analysisResults.recommendations);
      } else {
        console.warn('No recommendations found in results:', analysisResults);
      }
      
      // Check if we have analysis data
      if (analysisResults.analysis) {
        console.log('Analysis data found:', analysisResults.analysis);
      } else {
        console.warn('No analysis data found in results:', analysisResults);
      }
    }
  }, [analysisResults]);
  
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
    
    // Generate a unique ID for this analysis session
    const analysisId = generateAnalysisId();
    
    try {
      // First establish a streaming connection
      // This will show progress while we process the analysis
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      // Set up event source to track progress, including the analysis ID
      const eventSourceUrl = `/api/analyze?stream=true&id=${analysisId}`;
      const eventSource = new EventSource(eventSourceUrl);
      eventSourceRef.current = eventSource;
      
      // Track reconnection attempts
      let reconnectAttempts = 0;
      const maxReconnectAttempts = 3;
      
      // Show initial progress
      setAnalysisProgress({
        stage: 'preparing',
        message: 'Preparing analysis environment...',
        progress: 5
      });
      
      // Set up event handlers for the event source
      eventSource.onmessage = (event) => {
        try {
          // Reset reconnect attempts on successful message
          reconnectAttempts = 0;
          
          const data = JSON.parse(event.data);
          console.log('EventSource message received:', data);
          
          if (data.type === 'progress') {
            const message = data.message;
            const stage = inferStageFromMessage(message);
            const progress = calculateProgressFromStage(stage);
            
            const detailMessage = message.includes(':') 
              ? message.split(':').slice(1).join(':').trim() 
              : undefined;
            
            setAnalysisProgress({
              stage,
              message: stageDescriptions[stage],
              detailMessage: message,
              progress
            });
          } else if (data.type === 'complete') {
            // Stream is complete with full results
            console.log('Complete message received with data:', data);
            
            if (data.result && Object.keys(data.result).length > 0) {
              console.log('Analysis complete with results structure:', Object.keys(data.result));
              
              // Log data structure for debugging
              if (data.result.analysis) {
                console.log('Analysis structure:', Object.keys(data.result.analysis));
              }
              if (data.result.recommendations) {
                console.log('Recommendations structure:', Object.keys(data.result.recommendations));
              }
              
              // Force setting the results with a small delay to ensure state updates properly
              setTimeout(() => {
                // Create a fresh copy of the result to ensure React sees it as new state
                const resultCopy = JSON.parse(JSON.stringify(data.result));
                setAnalysisResults(resultCopy);
                setAnalysisProgress(null);
                setIsAnalyzing(false);
                
                toast.success("Analysis complete!");
                
                // Clean up the EventSource properly
                eventSource.close();
                eventSourceRef.current = null;
              }, 100);
            } else {
              // Check if result is null but data contains direct analysis/recommendations
              if (data.analysis || data.recommendations) {
                console.log('Direct analysis data found in message, not in result property');
                
                // Force setting the results with a small delay to ensure state updates properly
                setTimeout(() => {
                  // Create a fresh copy of the data to ensure React sees it as new state
                  const dataCopy = JSON.parse(JSON.stringify(data));
                  // Remove the type property since we're using the data directly
                  delete dataCopy.type;
                  setAnalysisResults(dataCopy);
                  setAnalysisProgress(null);
                  setIsAnalyzing(false);
                  
                  toast.success("Analysis complete!");
                  
                  // Clean up the EventSource properly
                  eventSource.close();
                  eventSourceRef.current = null;
                }, 100);
              } else {
                console.warn('Results missing or empty:', data);
                toast.error("Analysis completed but with empty results");
                setIsAnalyzing(false);
                setAnalysisProgress(null);
                
                // Clean up properly
                eventSource.close();
                eventSourceRef.current = null;
              }
            }
          } else if (data.type === 'error') {
            console.error('Error from server:', data.error);
            throw new Error(data.error || 'Unknown error');
          } else if (data.status === 'connected') {
            // Initial connection message - just update progress
            console.log('Connected to analysis server');
            setAnalysisProgress({
              stage: 'preparing',
              message: 'Connected to analysis server...',
              progress: 10
            });
          } else if (data.status === 'complete') {
            // Final status update from server, will be followed by complete results
            console.log('Received status complete message');
            setAnalysisProgress({
              stage: 'finalizing',
              message: 'Finalizing analysis...',
              progress: 95
            });
          } else {
            // Unknown message type
            console.log('Unknown message type received:', data);
          }
        } catch (err) {
          console.error('Error parsing event data:', err, event.data);
          toast.error('Error processing analysis data');
          setIsAnalyzing(false);
          setAnalysisProgress(null);
          
          // Clean up properly
          eventSource.close();
          eventSourceRef.current = null;
        }
      };
      
      // Enhanced onerror handler with better debugging
      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        
        // Attempt to reconnect a few times
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          
          setAnalysisProgress({
            stage: 'preparing',
            message: `Connection error. Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})...`,
            progress: 5
          });
          
          // EventSource will try to reconnect automatically
          // We just need to update the UI
          toast.error(`Error in analysis stream. Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})...`);
        } else {
          // Too many reconnection attempts, give up
          toast.error('Could not establish a stable connection. Please try again.');
          setIsAnalyzing(false);
          setAnalysisProgress(null);
          
          // Clean up
          eventSource.close();
          eventSourceRef.current = null;
        }
      };
      
      // Now send the actual analysis request via POST
      // Create FormData for the actual analysis
      const formData = new FormData();
      formData.append("codeSource", codeSource);
      formData.append("stream", "true");
      formData.append("analysisId", analysisId);
      
      // Add the actual files/code
      if (codeSource === "upload") {
        // Append files to FormData for the POST request
        uploadedFiles.forEach(file => {
          formData.append("file", file);
        });
      } else {
        formData.append("code", inputCode);
        formData.append("fileName", fileName);
      }
      
      // Post the form data to start the analysis
      try {
        console.log(`Sending POST request with analysisId: ${analysisId} and ${codeSource === "upload" ? uploadedFiles.length + " files" : "input code"}`);
        
        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Analysis request failed: " + response.statusText);
        }
        
        // The POST response is just an acknowledgment
        // The actual processing happens in the EventSource connection
        const result = await response.json();
        console.log('POST response:', result);
      } catch (error) {
        console.error("Analysis request error:", error);
        toast.error("Failed to start analysis. Please try again.");
        
        // Clean up on error
        setIsAnalyzing(false);
        setAnalysisProgress(null);
        
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("An error occurred during analysis");
      setIsAnalyzing(false);
      setAnalysisProgress(null);
      
      // Clean up event source
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
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
                  </div>
                </div>
                <CodeInput 
                  code={inputCode} 
                  setCode={setInputCode} 
                />
              </div>
            </TabsContent>
          </Tabs>
          
          {analysisProgress ? (
            <Card className="mt-8">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <h3 className="text-lg font-medium">{analysisProgress.message}</h3>
                  </div>
                  
                  {analysisProgress.detailMessage && (
                    <p className="text-sm text-muted-foreground">{analysisProgress.detailMessage}</p>
                  )}
                  
                  <div className="space-y-2">
                    <Progress value={analysisProgress.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Analyzing</span>
                      <span>{analysisProgress.progress}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                    {(Object.keys(stageDescriptions) as AnalysisProgressStage[]).map((stage) => {
                      const isActive = analysisProgress.stage === stage;
                      const isPast = calculateProgressFromStage(stage) < analysisProgress.progress;
                      
                      return (
                        <div 
                          key={stage}
                          className={`flex flex-col items-center p-2 rounded border text-center ${
                            isActive 
                              ? 'border-primary bg-primary/10' 
                              : isPast 
                                ? 'border-muted-foreground/30 bg-muted/30 opacity-80' 
                                : 'border-muted bg-background opacity-50'
                          }`}
                        >
                          <div className={`mb-1 ${isActive ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                            {stageIcons[stage]}
                          </div>
                          <span className={`text-xs truncate w-full ${isActive ? 'font-medium' : ''}`}>
                            {stage.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
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
          )}
        </>
      ) : (
        // Display diagnostic info if no analysis or results structure is unexpected
        !analysisResults.recommendations && !analysisResults.analysis && !analysisResults.bundleAnalysis ? (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Error in Analysis Results</CardTitle>
                <CardDescription>The analysis results are missing expected data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted p-5">
                  <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
                  <p className="mb-4">The results data doesn't contain any of the expected properties:</p>
                  <pre className="bg-muted-foreground/10 p-4 rounded overflow-x-auto">
                    {JSON.stringify(analysisResults, null, 2)}
                  </pre>
                  <Button onClick={() => setAnalysisResults(null)} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : analysisResults.bundleAnalysis && !analysisResults.analysis ? (
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