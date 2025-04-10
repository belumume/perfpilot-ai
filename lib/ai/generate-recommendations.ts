// lib/ai/generate-recommendations.ts
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { AnalysisResult } from "../analysis/analyzer";

// Update the function signature to accept either an AnalysisResult or a multi-file analysis result
export async function generateRecommendations(
  analysisResult: AnalysisResult | {
    issues: any[];
    summary: {
      totalIssues: number;
      criticalIssues: number;
      warningIssues: number;
      infoIssues: number;
      categories?: Record<string, number>;
    };
    fileResults?: Record<string, AnalysisResult>;
  },
  code: string,
  filename?: string
) {
  // Check if we're dealing with a multi-file analysis
  const isMultiFile = 'fileResults' in analysisResult && analysisResult.fileResults;
  
  // For multi-file analysis, we need to handle the issues differently
  const issues = isMultiFile 
    ? analysisResult.issues 
    : (analysisResult as AnalysisResult).issues;
  
  const summary = analysisResult.summary;
  
  if (issues.length === 0) {
    return {
      summary: "No performance issues were detected in your code. Great job!",
      recommendations: []
    };
  }
  
  // Create a prompt for the AI
  let prompt = "";
  
  if (isMultiFile) {
    // Get the file names from the fileResults object
    const fileNames = Object.keys(analysisResult.fileResults || {});
    
    // Create a multi-file prompt
    prompt = `
You are PerfPilot AI, an expert in Next.js performance optimization. Analyze the following code files and provide recommendations based on the detected issues.

Files analyzed: ${fileNames.join(', ')}

Detected issues across all files:
${issues.map(issue => {
  const fileName = issue.fileName || issue.file || 'Unknown file';
  return `- ${issue.rule.name} (in ${fileName}): ${issue.rule.description}${issue.lineNumber ? ` (Line ${issue.lineNumber})` : ''}`;
}).join('\n')}

Summary:
- Total issues: ${summary.totalIssues}
- Critical issues: ${summary.criticalIssues}
- Warning issues: ${summary.warningIssues}
- Info issues: ${summary.infoIssues}

Provide a comprehensive summary of the performance issues found across ALL files. Then provide 3-5 specific, actionable recommendations to improve the overall application's performance. For each recommendation, explain why it's important for Next.js performance and how it will improve the user experience.

IMPORTANT: Your summary should address issues across all files, not just focus on a single file. Avoid mentioning "the provided code snippet for a Next.js blog page" or similar phrases that reference only one file.
`;
  } else {
    // Use the existing single-file prompt
    prompt = `
You are PerfPilot AI, an expert in Next.js performance optimization. Analyze the following code and provide recommendations based on the detected issues.

Code filename: ${filename || 'Unknown'}

Code snippet:
\`\`\`
${code.slice(0, 2000)}${code.length > 2000 ? '...' : ''}
\`\`\`

Detected issues:
${issues.map(issue => `- ${issue.rule.name}: ${issue.rule.description}${issue.lineNumber ? ` (Line ${issue.lineNumber})` : ''}`).join('\n')}

Summary:
- Total issues: ${summary.totalIssues}
- Critical issues: ${summary.criticalIssues}
- Warning issues: ${summary.warningIssues}
- Info issues: ${summary.infoIssues}

Provide a concise summary of the performance issues and 3-5 specific, actionable recommendations to improve the code's performance. For each recommendation, explain why it's important for Next.js performance and how it will improve the user experience.
`;
  }

  // Generate recommendations using the AI SDK
  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt,
    temperature: 0.3,
    max_tokens: 1000,
  });
  
  // Parse the AI response
  const summaryMatch = text.match(/Summary:(.*?)(?=Recommendations:|$)/s);
  const recommendationsMatch = text.match(/Recommendations:(.*)/s);
  
  const aiSummary = summaryMatch ? summaryMatch[1].trim() : text;
  let aiRecommendations: string[] = [];
  
  if (recommendationsMatch) {
    const recommendationsText = recommendationsMatch[1].trim();
    aiRecommendations = recommendationsText
      .split(/\d+\./)
      .filter(Boolean)
      .map(rec => rec.trim());
  }
  
  return {
    summary: aiSummary,
    recommendations: aiRecommendations
  };
}