// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeCode, AnalysisResult } from "@/lib/analysis/analyzer";
import { generateRecommendations } from "@/lib/ai/generate-recommendations";
import { analyzeBundleSize, analyzeTreeshaking } from "@/lib/analysis/bundle-analyzer";

// Enable edge runtime for better performance
export const runtime = 'edge';

// Set long revalidation time for API responses
export const revalidate = 3600; // 1 hour

/**
 * Helper function to check if a file is likely a package.json file
 * Checks either if the name contains "package" or if the content has dependencies
 */
function isPackageJsonFile(fileName: string, content: string): boolean {
  // Check filename first (case insensitive)
  if (fileName.toLowerCase().includes('package') && fileName.endsWith('.json')) {
    console.log(`File ${fileName} identified as package.json by name`);
    return true;
  }
  
  // If not identified by name, check content
  try {
    // Skip full parsing here - just do a quick check for key properties
    if (content.includes('"dependencies"') || 
        content.includes('"devDependencies"') || 
        content.includes('"peerDependencies"')) {
      console.log(`File ${fileName} identified as package.json by content (has dependencies)`);
      return true;
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    // If we can't check the content, it's probably not a valid package.json
    console.log(`File ${fileName} doesn't appear to be valid JSON`);
  }
  
  return false;
}

/**
 * Process multiple package.json files, trying each one until we get a successful analysis
 */
async function processBundleAnalysis(packageJsonFiles: string[], fileContents: Record<string, string>) {
  console.log(`Attempting to analyze ${packageJsonFiles.length} package.json files`);
  let bundleAnalysis = null;
  let errorMessages = [];
  
  // Try each package.json file in order until we get a successful analysis
  for (const packageJsonFile of packageJsonFiles) {
    try {
      const packageJsonContent = fileContents[packageJsonFile];
      console.log(`Trying package.json file: ${packageJsonFile}`);
      
      bundleAnalysis = await analyzeBundleSize(packageJsonContent);
      console.log('Bundle analysis completed:', 
        `Found ${bundleAnalysis.heavyDependencies.length} heavy deps, ` +
        `${bundleAnalysis.unnecessaryDependencies.length} unnecessary deps, ` +
        `${bundleAnalysis.duplicateDependencies.length} duplicate deps`
      );
      
      // If we get here without errors, we have a successful analysis
      break;
    } catch (error) {
      console.error(`Error analyzing ${packageJsonFile}:`, error);
      errorMessages.push(`Failed to analyze ${packageJsonFile}: ${error.message}`);
    }
  }
  
  // If we couldn't analyze any package.json files, return a default result with error info
  if (!bundleAnalysis) {
    console.error('All package.json analyses failed:', errorMessages);
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const codeSource = formData.get("codeSource") as string;
    
    console.log('API route triggered, codeSource:', codeSource);
    
    // Handle multiple file uploads
    if (codeSource === "upload") {
      const files = formData.getAll("file") as File[];
      
      console.log('Files received:', files.length, 'file(s)');
      console.log('File names:', files.map(f => f.name).join(', '));
      
      if (files.length === 0) {
        return NextResponse.json(
          { error: "No files provided" },
          { status: 400 }
        );
      }
      
      // Structure to hold results for each file
      const fileResults: Record<string, {
        issues: Array<{
          rule: {
            id: string;
            name: string;
            description: string;
            severity: string;
            category: string;
            recommendation: string;
            codeExample?: string;
            docs?: string;
          };
          lineNumber?: number;
          code?: string;
        }>;
        summary: {
          totalIssues: number;
          criticalIssues: number;
          warningIssues: number;
          infoIssues: number;
          categories: Record<string, number>;
        };
      }> = {};
      
      // Aggregate summary data
      const aggregateSummary = {
        totalIssues: 0,
        criticalIssues: 0,
        warningIssues: 0,
        infoIssues: 0,
        categories: {} as Record<string, number>
      };
      
      // Preload file contents for efficient analysis
      const fileContents: Record<string, string> = {};
      await Promise.all(files.map(async (file) => {
        const content = await file.text();
        fileContents[file.name] = content;
      }));
      
      // Find package.json files using our flexible detection
      const packageJsonFiles = Object.entries(fileContents)
        .filter(([fileName, content]) => isPackageJsonFile(fileName, content))
        .map(([fileName]) => fileName);
      
      console.log('Detected package.json files:', packageJsonFiles.length > 0 ? packageJsonFiles.join(', ') : 'None');
      
      let bundleAnalysis = null;
      
      // Process each file for code analysis
      for (const [fileName, content] of Object.entries(fileContents)) {
        // Skip package.json files for code analysis
        if (!packageJsonFiles.includes(fileName)) {
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
        }
      }
      
      // Perform bundle analysis if package.json files exist
      if (packageJsonFiles.length > 0) {
        // Use our new function to try analyzing each package.json file
        bundleAnalysis = await processBundleAnalysis(packageJsonFiles, fileContents);
        
        // Analyze code files for treeshaking issues if we have a successful bundle analysis
        if (bundleAnalysis) {
          const treeshakingIssues = analyzeTreeshaking(fileContents);
          bundleAnalysis.treeshakingIssues = treeshakingIssues;
          console.log('Treeshaking analysis completed:', `Found ${treeshakingIssues.length} issues`);
          
          // Update total issues count
          bundleAnalysis.summary.totalIssues += treeshakingIssues.length;
        }
      }
      
      // Prepare combined code for AI recommendations
      const combinedCode = await Promise.all(files.map(async (file) => {
        const code = fileContents[file.name] || await file.text();
        return `// ${file.name}\n${code}\n\n`;
      }));
      
      const allCode = combinedCode.join('');
      
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
        allCode,
        "multiple files"
      );
      
      // Include bundle analysis information in AI recommendations if available
      if (bundleAnalysis) {
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
      
      const response = {
        analysis: {
          fileResults: fileResults,
          aggregateSummary: aggregateSummary
        },
        recommendations: aiRecommendations,
        bundleAnalysis: bundleAnalysis
      };
      
      console.log('Returning response with bundleAnalysis:', !!bundleAnalysis);
      
      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        }
      });
    } else if (codeSource === "input") {
      // Existing single code handling
      const code = formData.get("code") as string;
      if (!code) {
        return NextResponse.json(
          { error: "No code provided" },
          { status: 400 }
        );
      }
      
      // Check if this is a package.json file for bundle analysis
      const fileName = formData.get("fileName") as string || "input.tsx";
      console.log('Input mode - fileName:', fileName);
      
      // Use our flexible detection for the pasted content as well
      const isPkgJson = isPackageJsonFile(fileName, code);
      
      let bundleAnalysis = null;
      
      if (isPkgJson) {
        console.log('Analyzing pasted package.json, content length:', code.length);
        
        try {
          // Use the new bundle analysis approach for single file input as well
          bundleAnalysis = await analyzeBundleSize(code);
          console.log('Bundle analysis completed for pasted package.json:', 
            `Found ${bundleAnalysis.heavyDependencies.length} heavy deps, ` +
            `${bundleAnalysis.unnecessaryDependencies.length} unnecessary deps, ` +
            `${bundleAnalysis.duplicateDependencies.length} duplicate deps`
          );
        } catch (error) {
          console.error('Error analyzing pasted package.json:', error);
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
                estimated: `Error parsing package.json: ${error.message}`,
                breakdown: {
                  dependencies: 'Unknown',
                  devDependencies: 'Unknown',
                },
              },
            },
          };
        }
        
        // For package.json only, we'll skip the regular code analysis
        const aiRecommendations = await generateRecommendations(
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
        
        console.log('Returning input response with bundleAnalysis');
        
        return NextResponse.json({
          bundleAnalysis: bundleAnalysis,
          recommendations: aiRecommendations
        }, {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          }
        });
      }
      
      // Regular code analysis
      const analysisResult = await analyzeCode(code);
      
      // Generate AI recommendations
      const aiRecommendations = await generateRecommendations(
        analysisResult,
        code,
        fileName
      );
      
      return NextResponse.json({
        analysis: analysisResult,
        recommendations: aiRecommendations,
        bundleAnalysis: null // No bundle analysis for regular code
      }, {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        }
      });
    } else {
      return NextResponse.json(
        { error: "Invalid code source" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: `An error occurred during analysis: ${error.message}` },
      { status: 500 }
    );
  }
}