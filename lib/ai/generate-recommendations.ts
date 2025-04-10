// lib/ai/generate-recommendations.ts
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { AnalysisResult } from "../analysis/analyzer";

export async function generateRecommendations(
  analysisResult: AnalysisResult,
  code: string,
  filename?: string
) {
  const { issues, summary } = analysisResult;
  
  if (issues.length === 0) {
    return {
      summary: "No performance issues were detected in your code. Great job!",
      recommendations: []
    };
  }
  
  // Create a prompt for the AI
  const prompt = `
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