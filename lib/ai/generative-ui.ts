// // lib/ai/generative-ui.ts
// import { createStreamableUI } from "ai/rsc";
// import { openai } from "@ai-sdk/openai";
// import { AnalysisResult } from "../analysis/analyzer";
// import { 
//   IssueSummary, 
//   Recommendation, 
//   PerformanceImpact, 
//   SummarySection 
// } from "@/components/ui/ai-components";

// export async function generateUIRecommendations(
//   analysisResult: AnalysisResult | {
//     issues: any[];
//     summary: {
//       totalIssues: number;
//       criticalIssues: number;
//       warningIssues: number;
//       infoIssues: number;
//       categories?: Record<string, number>;
//     };
//     fileResults?: Record<string, AnalysisResult>;
//   },
//   code: string,
//   filename?: string
// ) {
//   // Check if we're dealing with a multi-file analysis
//   const isMultiFile = 'fileResults' in analysisResult && analysisResult.fileResults;
  
//   // For multi-file analysis, we need to handle the issues differently
//   const issues = isMultiFile 
//     ? analysisResult.issues 
//     : (analysisResult as AnalysisResult).issues;
  
//   const summary = analysisResult.summary;
  
//   if (issues.length === 0) {
//     return createStreamableUI({
//       model: openai("gpt-4o"),
//       system: `You are PerfPilot AI, an expert in Next.js performance optimization. 
//       The user's code has no performance issues. Generate a congratulatory message.`,
//       provider: {
//         IssueSummary,
//         SummarySection,
//       },
//       prompt: "Generate a congratulatory UI for a codebase with no performance issues.",
//       temperature: 0.3,
//     });
//   }
  
//   // Create a prompt for the AI
//   let prompt = "";
  
//   if (isMultiFile) {
//     // Get the file names from the fileResults object
//     const fileNames = Object.keys(analysisResult.fileResults || {});
    
//     // Create a multi-file prompt
//     prompt = `
// Analyze the following Next.js code files and generate a UI with recommendations based on the detected issues.

// Files analyzed: ${fileNames.join(', ')}

// Detected issues across all files:
// ${issues.map(issue => {
//   const fileName = issue.fileName || issue.file || 'Unknown file';
//   return `- ${issue.rule.name} (in ${fileName}): ${issue.rule.description}${issue.lineNumber ? ` (Line ${issue.lineNumber})` : ''}`;
// }).join('\n')}

// Summary:
// - Total issues: ${summary.totalIssues}
// - Critical issues: ${summary.criticalIssues}
// - Warning issues: ${summary.warningIssues}
// - Info issues: ${summary.infoIssues}

// Generate a UI that includes:
// 1. A summary section that explains the overall performance issues found across all files
// 2. 3-5 specific, actionable recommendations to improve the overall application's performance
// 3. For each recommendation, explain why it's important for Next.js performance and how it will improve the user experience
// 4. Include code examples where appropriate
// 5. Prioritize recommendations based on their impact on performance (high, medium, low)

// IMPORTANT: Your summary should address issues across all files, not just focus on a single file.
// `;
//   } else {
//     // Use the existing single-file prompt
//     prompt = `
// Analyze the following Next.js code and generate a UI with recommendations based on the detected issues.

// Code filename: ${filename || 'Unknown'}

// Code snippet:
// \`\`\`
// ${code.slice(0, 2000)}${code.length > 2000 ? '...' : ''}
// \`\`\`

// Detected issues:
// ${issues.map(issue => `- ${issue.rule.name}: ${issue.rule.description}${issue.lineNumber ? ` (Line ${issue.lineNumber})` : ''}`).join('\n')}

// Summary:
// - Total issues: ${summary.totalIssues}
// - Critical issues: ${summary.criticalIssues}
// - Warning issues: ${summary.warningIssues}
// - Info issues: ${summary.infoIssues}

// Generate a UI that includes:
// 1. A summary section that explains the performance issues found in the code
// 2. 3-5 specific, actionable recommendations to improve the code's performance
// 3. For each recommendation, explain why it's important for Next.js performance and how it will improve the user experience
// 4. Include code examples where appropriate
// 5. Prioritize recommendations based on their impact on performance (high, medium, low)
// `;
//   }

//   // Generate UI recommendations using the AI SDK's createStreamableUI function
//   return createStreamableUI({
//     model: openai("gpt-4o"),
//     system: `You are PerfPilot AI, an expert in Next.js performance optimization. 
//     Generate a UI that provides clear, actionable recommendations to improve Next.js application performance.
//     Use the provided React components to create a visually appealing and informative UI.`,
//     provider: {
//       IssueSummary,
//       Recommendation,
//       PerformanceImpact,
//       SummarySection,
//     },
//     prompt,
//     temperature: 0.3,
//   });
// }