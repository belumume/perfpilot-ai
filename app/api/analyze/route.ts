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
    const parsed = JSON.parse(content);
    if (parsed && (parsed.dependencies || parsed.devDependencies)) {
      console.log(`File ${fileName} identified as package.json by content (has dependencies)`);
      return true;
    }
  } catch (e) {
    // If we can't parse the JSON, it's not a valid package.json
    console.log(`File ${fileName} doesn't appear to be valid JSON`);
  }
  
  return false;
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
      let fileContents: Record<string, string> = {};
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
      
      // Process each file
      for (const [fileName, content] of Object.entries(fileContents)) {
        console.log(`Processing file: ${fileName}, content length: ${content.length}`);
        
        // Skip bundle analysis files for now
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
        // Use the first package.json file for analysis
        const packageJsonFile = packageJsonFiles[0];
        const packageJsonContent = fileContents[packageJsonFile];
        console.log('Using package.json file for bundle analysis:', packageJsonFile);
        console.log('Package.json content:', packageJsonContent.substring(0, 100) + '...');
        
        try {
          // Test if we can parse the JSON
          JSON.parse(packageJsonContent);
          console.log('Successfully parsed package.json JSON');
          
          bundleAnalysis = await analyzeBundleSize(packageJsonContent);
          console.log('Bundle analysis completed:', 
            `Found ${bundleAnalysis.heavyDependencies.length} heavy deps, ` +
            `${bundleAnalysis.unnecessaryDependencies.length} unnecessary deps, ` +
            `${bundleAnalysis.duplicateDependencies.length} duplicate deps`
          );
          
          // Analyze code files for treeshaking issues
          const treeshakingIssues = analyzeTreeshaking(fileContents);
          bundleAnalysis.treeshakingIssues = treeshakingIssues;
          console.log('Treeshaking analysis completed:', `Found ${treeshakingIssues.length} issues`);
          
          // Update total issues count
          bundleAnalysis.summary.totalIssues += treeshakingIssues.length;
        } catch (error) {
          console.error('Error analyzing package.json:', error);
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
                estimated: 'Error parsing package.json',
                breakdown: {
                  dependencies: 'Unknown',
                  devDependencies: 'Unknown',
                },
              },
            },
          };
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
        console.log('First 100 chars:', code.substring(0, 100) + '...');
        
        try {
          // Test if we can parse the JSON
          JSON.parse(code);
          console.log('Successfully parsed pasted package.json JSON');
          
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
                estimated: 'Error parsing package.json',
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
      { error: "An error occurred during analysis" },
      { status: 500 }
    );
  }
}