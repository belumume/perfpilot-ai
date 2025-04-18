// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeCode, AnalysisResult } from "@/lib/analysis/analyzer";
import { generateRecommendations } from "@/lib/ai/generate-recommendations";
import { analyzeBundleSize, analyzeTreeshaking } from "@/lib/analysis/bundle-analyzer";
import { StreamingText, createAnalysisStream } from "@/lib/ai/streaming-helpers";

// Force edge runtime for better performance and streaming support
export const runtime = 'edge';

// This is crucial for streaming to work correctly in production
export const dynamic = 'force-dynamic';

// Set long revalidation time for API responses
export const revalidate = 3600; // 1 hour

// Simple in-memory store for active analysis processes with expiration
// Note: This will reset between invocations in Edge runtime, so we need a different approach
type AnalysisData = {
  codeSource: string;
  files?: File[];
  code?: string;
  fileName?: string;
  timestamp: number;
};

// In-memory map for temporary storage during a single request
const activeAnalysis = new Map<string, AnalysisData>();

/**
 * Handle GET requests for EventSource connections
 * EventSource protocol requires GET method
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const stream = searchParams.get("stream") === "true";
  const analysisId = searchParams.get("id");
  
  if (!stream) {
    return NextResponse.json(
      { error: "GET method only supported for EventSource connections. Use POST for analysis requests." },
      { status: 400 }
    );
  }
  
  console.log(`GET streaming request received for analysis ID: ${analysisId}`);
  
  // Create a streaming response for EventSource
  return createAnalysisStream(async (updateProgress) => {
    try {
      await updateProgress("SSE connection established. Waiting for analysis data...");
      
      // If we don't have an ID, just return connection status
      if (!analysisId) {
        console.log("No analysis ID provided in request");
        return { 
          status: "connected", 
          message: "No analysis ID provided",
          recommendations: {
            summary: "No analysis ID was provided. Please try again.",
            recommendations: []
          }
        };
      }
      
      // Try to get analysis data from our in-memory map first
      const storedAnalysisData = activeAnalysis.get(analysisId);
      
      // Wait a moment to ensure the POST request has time to run and store data
      if (!storedAnalysisData) {
        console.log(`No stored data found for analysis ID ${analysisId}, waiting for POST...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Try again after waiting
      const analysisData = activeAnalysis.get(analysisId);
      if (analysisData) {
        console.log(`Found stored analysis data for ID ${analysisId}, processing...`);
        
        const { codeSource, files, code, fileName } = analysisData;
        
        // Clear the data from memory after retrieving it
        activeAnalysis.delete(analysisId);
        
        if (codeSource === "upload" && files && files.length > 0) {
          await updateProgress(`Processing ${files.length} uploaded files...`);
          
          // Process uploaded files
          const fileContents: Record<string, string> = {};
          await Promise.all(files.map(async (file) => {
            try {
              const content = await file.text();
              fileContents[file.name] = content;
              await updateProgress(`Loaded file: ${file.name}`);
            } catch (error) {
              await updateProgress(`Error loading file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }));
          
          // Continue with existing file processing code...
          await updateProgress('Files loaded. Identifying package.json files...');
          
          // Find package.json files using our flexible detection
          const packageJsonFiles = Object.entries(fileContents)
            .filter(([fileName, content]) => isPackageJsonFile(fileName, content))
            .map(([fileName]) => fileName);

          const fileResults: Record<string, AnalysisResult> = {};
      
      // Aggregate summary data
      const aggregateSummary = {
        totalIssues: 0,
        criticalIssues: 0,
        warningIssues: 0,
        infoIssues: 0,
        categories: {} as Record<string, number>
      };
      
          // Process non-package files
          const codeFiles = Object.keys(fileContents).filter(fileName => !packageJsonFiles.includes(fileName));
          
          await updateProgress(`Found ${codeFiles.length} code files and ${packageJsonFiles.length} package.json files. Analyzing code structure...`);
          
          // Process codefiles in batches for progressive updates
          const batchSize = Math.max(1, Math.ceil(codeFiles.length / 3)); // Process in ~3 batches
          
          for (let i = 0; i < codeFiles.length; i += batchSize) {
            const batch = codeFiles.slice(i, i + batchSize);
            
            await updateProgress(`Analyzing files ${i + 1} to ${Math.min(i + batchSize, codeFiles.length)} of ${codeFiles.length}... Detected issues: ${aggregateSummary.totalIssues}`);
            
            // Process batch in parallel
            await Promise.all(batch.map(async (fileName) => {
              try {
                const content = fileContents[fileName];
          const result = await analyzeCode(content);
          
          fileResults[fileName] = result;
          
          // Update aggregate summary
          aggregateSummary.totalIssues += result.summary.totalIssues;
          aggregateSummary.criticalIssues += result.summary.criticalIssues;
          aggregateSummary.warningIssues += result.summary.warningIssues;
          aggregateSummary.infoIssues += result.summary.infoIssues;
          
          // Merge categories
          Object.entries(result.summary.categories || {}).forEach(([category, count]) => {
            if (typeof count === 'number') {
              aggregateSummary.categories[category] = (aggregateSummary.categories[category] || 0) + count;
            }
          });
                
                await updateProgress(`Analyzed ${fileName}: Found ${result.summary.totalIssues} issues`);
              } catch (error) {
                await updateProgress(`Error analyzing ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
            }));
      }
      
          // Process bundle analysis if needed
          let bundleAnalysis = null;
          
      if (packageJsonFiles.length > 0) {
            await updateProgress(`Code analysis complete: Found ${aggregateSummary.totalIssues} issues. Starting bundle analysis...`);
            
        // Use our new function to try analyzing each package.json file
            try {
        bundleAnalysis = await processBundleAnalysis(packageJsonFiles, fileContents);
        
        // Analyze code files for treeshaking issues if we have a successful bundle analysis
        if (bundleAnalysis) {
          const treeshakingIssues = analyzeTreeshaking(fileContents);
          bundleAnalysis.treeshakingIssues = treeshakingIssues;
          
          // Update total issues count
          bundleAnalysis.summary.totalIssues += treeshakingIssues.length;
                
                await updateProgress(`Bundle analysis complete: Found ${bundleAnalysis.summary.totalIssues} issues.`);
              }
            } catch (error) {
              await updateProgress(`Error during bundle analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
          } else {
            await updateProgress(`Code analysis complete: Found ${aggregateSummary.totalIssues} issues. No package.json files to analyze.`);
      }
      
          // Get recommendations
          await updateProgress(`Generating AI recommendations...`);
          
          try {
      // Prepare combined code for AI recommendations
            const combinedCode = Object.entries(fileContents)
              .filter(([fileName]) => !packageJsonFiles.includes(fileName))
              .map(([fileName, content]) => `// ${fileName}\n${content}\n\n`)
              .join('');
            
            console.log(`Preparing to generate recommendations for ${codeFiles.length} code files`);
      
      // Collect all issues for AI recommendations
      const allIssues = Object.entries(fileResults).flatMap(([fileName, result]) => {
        // Add fileName to each issue for context
        return result.issues.map(issue => ({
          ...issue,
          fileName: fileName
        }));
      });
      
      // Generate recommendations based on all issues
      const aiRecommendations = await generateRecommendations(
        {
          issues: allIssues,
          summary: aggregateSummary,
          fileResults: fileResults as unknown as Record<string, AnalysisResult>
        },
              combinedCode,
        "multiple files"
      );
            
            console.log("Generated initial recommendations successfully");
      
      // Include bundle analysis information in AI recommendations if available
      if (bundleAnalysis) {
              await updateProgress(`Generating bundle optimization recommendations...`);
              
        // Enhance the AI recommendations with bundle insights
        const bundleInsightsPrompt = `
Additionally, here's information about the bundle analysis from package.json:
- Total dependencies: ${bundleAnalysis.totalDependencies}
- Heavy dependencies: ${bundleAnalysis.heavyDependencies.map(d => d.name).join(', ')}
- Unnecessary dependencies: ${bundleAnalysis.unnecessaryDependencies.map(d => d.name).join(', ')}
- Duplicate functionality: ${bundleAnalysis.duplicateDependencies.map(d => d.names.join(' & ')).join(', ')}
- Tree shaking issues: ${bundleAnalysis.treeshakingIssues.length}
- Estimated bundle size: ${bundleAnalysis.summary.size.estimated}

Please provide additional recommendations specifically for optimizing the bundle size based on this analysis.
`;
        
        // Add bundle recommendations to the existing recommendations
        const bundleRecommendations = await generateRecommendations(
          {
            issues: [],  // No regular issues
            summary: {
              totalIssues: bundleAnalysis.summary.totalIssues,
              criticalIssues: 0,
              warningIssues: 0,
              infoIssues: 0,
              categories: {}
            }
          },
          bundleInsightsPrompt,
          "package.json"
        );
        
        // Combine recommendations
        aiRecommendations.summary += "\n\n## Bundle Size Analysis\n\n" + bundleRecommendations.summary;
        aiRecommendations.recommendations = [
          ...aiRecommendations.recommendations,
          ...bundleRecommendations.recommendations
        ];
      }
      
            // Step 6: Complete analysis and return full results
            await updateProgress(`Analysis complete! Total issues found: ${aggregateSummary.totalIssues + (bundleAnalysis ? bundleAnalysis.summary.totalIssues : 0)}. Preparing final report...`);
            
            // Final full result
            const finalResult = {
        analysis: {
          fileResults: fileResults,
          aggregateSummary: aggregateSummary
        },
        recommendations: aiRecommendations,
        bundleAnalysis: bundleAnalysis
      };
      
            console.log(`Final result prepared with ${Object.keys(fileResults).length} analyzed files`);
            console.log(`Recommendations generated: ${aiRecommendations.recommendations.length} items`);
            
            // Small delay before sending the final result to ensure the stream is stable
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Return the final result
            return finalResult;
          } catch (error) {
            await updateProgress(`Error generating recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error(`Failed to generate recommendations:`, error);
            
            return { 
              error: `Error generating recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`,
              analysis: {
                fileResults: fileResults,
                aggregateSummary: aggregateSummary
              },
              bundleAnalysis: bundleAnalysis,
              recommendations: {
                summary: "Error generating recommendations.",
                recommendations: []
              }
            };
          }
        } else if (codeSource === "input" && code) {
          // For pasted code input
          await updateProgress(`Analyzing pasted code (${fileName || 'input.tsx'})...`);
          
          // Check if this is a package.json file
          const isPkgJson = isPackageJsonFile(fileName || 'input.tsx', code);
      
      let bundleAnalysis = null;
          let analysisResult = null;
          let aiRecommendations = null;
      
      if (isPkgJson) {
            await updateProgress(`Identified package.json. Analyzing dependencies...`);
        
        try {
              // Analyze bundle
          bundleAnalysis = await analyzeBundleSize(code);
              
              await updateProgress(`Bundle analysis complete. Found ${bundleAnalysis.heavyDependencies.length} heavy dependencies. Generating recommendations...`);
              
              // Generate recommendations
              aiRecommendations = await generateRecommendations(
          {
            issues: [],
            summary: {
              totalIssues: bundleAnalysis.summary.totalIssues,
              criticalIssues: 0,
              warningIssues: 0,
              infoIssues: 0,
              categories: {}
            }
          },
          `Package.json Analysis:
- Total dependencies: ${bundleAnalysis.totalDependencies}
- Heavy dependencies: ${bundleAnalysis.heavyDependencies.map(d => d.name).join(', ')}
- Unnecessary dependencies: ${bundleAnalysis.unnecessaryDependencies.map(d => d.name).join(', ')}
- Duplicate functionality: ${bundleAnalysis.duplicateDependencies.map(d => d.names.join(' & ')).join(', ')}
- Estimated bundle size: ${bundleAnalysis.summary.size.estimated}

Please provide recommendations for optimizing the bundle size based on this analysis.`,
          "package.json"
        );
        
              return {
          bundleAnalysis: bundleAnalysis,
          recommendations: aiRecommendations
              };
            } catch (error) {
              await updateProgress(`Error analyzing package.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
              
              // Create placeholder result for error
              bundleAnalysis = {
                totalDependencies: 0,
                heavyDependencies: [],
                unnecessaryDependencies: [],
                duplicateDependencies: [],
                treeshakingIssues: [],
                score: 100,
                summary: {
                  totalIssues: 0,
                  size: {
                    estimated: `Error parsing package.json: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    breakdown: {
                      dependencies: 'Unknown',
                      devDependencies: 'Unknown',
                    },
                  },
                },
              };
              
              return {
                bundleAnalysis: bundleAnalysis,
                recommendations: {
                  summary: "Error analyzing package.json. Please check the file format and try again.",
                  recommendations: []
                }
              };
            }
          } else {
            // Regular code analysis
            await updateProgress(`Analyzing code structure...`);
            
            try {
              analysisResult = await analyzeCode(code);
              
              await updateProgress(`Code analysis complete: Found ${analysisResult.summary.totalIssues} issues. Generating AI recommendations...`);
      
      // Generate AI recommendations
              aiRecommendations = await generateRecommendations(
        analysisResult,
        code,
                fileName || 'input.tsx'
      );
      
              return {
        analysis: analysisResult,
        recommendations: aiRecommendations,
        bundleAnalysis: null // No bundle analysis for regular code
              };
            } catch (error) {
              await updateProgress(`Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}`);
              return { 
                error: `Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}`,
                analysis: {
                  issues: [],
                  summary: {
                    totalIssues: 0,
                    criticalIssues: 0,
                    warningIssues: 0,
                    infoIssues: 0,
                    categories: {}
                  }
                },
                recommendations: {
                  summary: "Error analyzing code. Please check the input and try again.",
                  recommendations: []
                }
              };
            }
          }
        }
      }
      
      // If we get here, either there's no stored data or we're still using the form approach
      console.log(`No stored data for ID ${analysisId} or storage approach failed, falling back to form data...`);
      
      // Get analysis data from the request object
      const formData = await request.formData().catch(() => null);
      if (!formData) {
        await updateProgress("No form data received. This could be due to a connection issue or missing files.");
        
        return { 
          error: "No analysis data found", 
          recommendations: {
            summary: "No analysis data was found. Please try again with different files or refresh the page.",
            recommendations: []
          }
        };
      }

      // Continue with the existing implementation...
      // ... existing code ...

      // If we get here, something went wrong with both approaches
      return { 
        error: "Invalid analysis configuration or missing data", 
        recommendations: {
          summary: "Error during analysis. Please try again with different input.",
          recommendations: []
        }
      };
    } catch (error) {
      console.error(`Error in GET streaming handler:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { 
        error: errorMessage, 
        recommendations: {
          summary: `Error during analysis: ${errorMessage}. Please try again.`,
          recommendations: []
        }
      };
    }
  });
}

/**
 * Helper function to check if a file is likely a package.json file
 * Checks either if the name contains "package" or if the content has dependencies
 */
function isPackageJsonFile(fileName: string, content: string): boolean {
  // Check filename first (case insensitive)
  if (fileName.toLowerCase().includes('package') && fileName.endsWith('.json')) {
    return true;
  }
  
  // If not identified by name, check content
  try {
    // Skip full parsing here - just do a quick check for key properties
    if (content.includes('"dependencies"') || 
        content.includes('"devDependencies"') || 
        content.includes('"peerDependencies"')) {
      return true;
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    // If we can't check the content, it's probably not a valid package.json
  }
  
  return false;
}

/**
 * Process multiple package.json files, trying each one until we get a successful analysis
 */
async function processBundleAnalysis(packageJsonFiles: string[], fileContents: Record<string, string>) {
  let bundleAnalysis = null;
  const errorMessages = [];
  
  // Try each package.json file in order until we get a successful analysis
  for (const packageJsonFile of packageJsonFiles) {
    try {
      const packageJsonContent = fileContents[packageJsonFile];
      bundleAnalysis = await analyzeBundleSize(packageJsonContent);
      
      // If we get here without errors, we have a successful analysis
      break;
    } catch (error) {
      // Fix the TypeScript error by ensuring error is an Error object with a message property
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      errorMessages.push(`Failed to analyze ${packageJsonFile}: ${errorMessage}`);
    }
  }
  
  // If we couldn't analyze any package.json files, return a default result with error info
  if (!bundleAnalysis) {
    bundleAnalysis = {
      totalDependencies: 0,
      heavyDependencies: [],
      unnecessaryDependencies: [],
      duplicateDependencies: [],
      treeshakingIssues: [],
      score: 100,
      summary: {
        totalIssues: 0,
        size: {
          estimated: `Error parsing package.json: ${errorMessages.join('; ')}`,
          breakdown: {
            dependencies: 'Unknown',
            devDependencies: 'Unknown',
          },
        },
      },
    };
  }
  
  return bundleAnalysis;
}

/**
 * POST handler for non-streaming file analysis
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const codeSource = formData.get("codeSource") as string;
    const streamMode = formData.get("stream") === "true";
    const analysisId = formData.get("analysisId") as string;
    
    // Log received request details
    console.log(`POST request received - Mode: ${streamMode ? 'streaming' : 'direct'}, Source: ${codeSource}, ID: ${analysisId}`);
    
    if (streamMode && analysisId) {
      // In streaming mode, we need to store the form data for the GET handler
      try {
        // Store the form data in memory temporarily for the GET handler to access
        const files = formData.getAll("file") as File[];
        const code = formData.get("code") as string;
        const fileName = formData.get("fileName") as string;
        
        // Log file information if available
        if (files && files.length > 0) {
          console.log(`Received ${files.length} files for analysis ID ${analysisId}`);
          files.forEach((file, index) => {
            console.log(`File ${index + 1}: ${file.name}, Size: ${file.size} bytes`);
          });
        }
        
        if (code) {
          console.log(`Received ${code.length} bytes of code for analysis ID ${analysisId}`);
        }
        
        // Store data in memory map
        activeAnalysis.set(analysisId, {
          codeSource,
          files: files.length > 0 ? files : undefined,
          code: code || undefined,
          fileName: fileName || undefined,
          timestamp: Date.now()
        });
        
        // Return confirmation that the streaming request was received
        return new NextResponse(
          JSON.stringify({
            status: "processing",
            message: "Analysis started. Please check the EventSource connection for real-time updates."
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            }
          }
        );
      } catch (error) {
        console.error(`Error storing analysis data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Just return a confirmation anyway - the GET handler will handle the error
        return new NextResponse(
          JSON.stringify({
            status: "processing",
            message: "Analysis started. Please check the EventSource connection for real-time updates."
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            }
          }
        );
      }
    } else if (streamMode) {
      // Streaming mode but no analysis ID
      console.warn("Streaming mode requested but no analysis ID provided");
      return new NextResponse(
        JSON.stringify({
          status: "processing",
          message: "Analysis started but no ID provided. This may cause issues with the analysis."
        }),
        {
          status: 200,
        headers: {
            "Content-Type": "application/json",
          }
        }
      );
    }
    
    // For non-streaming requests, return an error suggesting to use streaming mode
    return NextResponse.json(
      { 
        error: "Direct analysis mode is not fully implemented. Please use streaming mode." 
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    // Fix TypeScript error by properly handling unknown error type
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    return NextResponse.json(
      { error: `An error occurred during analysis: ${errorMessage}` },
      { status: 500 }
    );
  }
}