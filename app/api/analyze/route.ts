// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeCode } from "@/lib/analysis/analyzer";
import { generateRecommendations } from "@/lib/ai/generate-recommendations";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const codeSource = formData.get("codeSource") as string;
    
    // Handle multiple file uploads
    if (codeSource === "upload") {
      const files = formData.getAll("file") as File[];
      
      if (files.length === 0) {
        return NextResponse.json(
          { error: "No files provided" },
          { status: 400 }
        );
      }
      
      // Structure to hold results for each file
      const fileResults: Record<string, any> = {};
      
      // Aggregate summary data
      const aggregateSummary = {
        totalIssues: 0,
        criticalIssues: 0,
        warningIssues: 0,
        infoIssues: 0,
        categories: {} as Record<string, number>
      };
      
      // Process each file
      await Promise.all(files.map(async (file) => {
        const code = await file.text();
        const filename = file.name;
        const result = await analyzeCode(code, filename);
        
        fileResults[filename] = result;
        
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
      }));
      
      // Prepare combined code for AI recommendations
      const combinedCode = await Promise.all(files.map(async (file) => {
        const code = await file.text();
        return `// ${file.name}\n${code}\n\n`;
      }));
      
      const allCode = combinedCode.join('');
      
      // Collect all issues for AI recommendations
      const allIssues = Object.values(fileResults).flatMap(result => result.issues);
      
      // Generate recommendations based on all issues
      const aiRecommendations = await generateRecommendations(
        { issues: allIssues, summary: aggregateSummary },
        allCode,
        "multiple files"
      );
      
      return NextResponse.json({
        analysis: {
          fileResults: fileResults,
          aggregateSummary: aggregateSummary
        },
        recommendations: aiRecommendations
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
      
      const analysisResult = await analyzeCode(code, "input.tsx");
      
      // Generate AI recommendations
      const aiRecommendations = await generateRecommendations(
        analysisResult,
        code,
        "input.tsx"
      );
      
      return NextResponse.json({
        analysis: analysisResult,
        recommendations: aiRecommendations
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