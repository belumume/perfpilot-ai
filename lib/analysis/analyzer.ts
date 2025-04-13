// lib/analysis/analyzer.ts
import { performanceRules, PerformanceRule } from './rules';

export interface AnalysisResult {
  issues: Array<{
    rule: PerformanceRule;
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
}

export async function analyzeCode(code: string): Promise<AnalysisResult> {
  const issues: AnalysisResult['issues'] = [];
  
  // Process each rule
  for (const rule of performanceRules) {
    let matched = false;
    
    if (typeof rule.pattern === 'function') {
      matched = rule.pattern(code);
      if (matched) {
        issues.push({ rule });
      }
    } else {
      const matches = code.match(rule.pattern);
      if (matches) {
        // Find line number of the first match
        const lines = code.split('\n');
        let lineNumber: number | undefined;
        let matchedCode: string | undefined;
        
        for (let i = 0; i < lines.length; i++) {
          if (rule.pattern.test(lines[i])) {
            lineNumber = i + 1;
            matchedCode = lines[i].trim();
            break;
          }
        }
        
        issues.push({ 
          rule,
          lineNumber,
          code: matchedCode
        });
      }
    }
  }
  
  // Generate summary
  const summary = {
    totalIssues: issues.length,
    criticalIssues: issues.filter(i => i.rule.severity === 'critical').length,
    warningIssues: issues.filter(i => i.rule.severity === 'warning').length,
    infoIssues: issues.filter(i => i.rule.severity === 'info').length,
    categories: issues.reduce((acc, issue) => {
      const category = issue.rule.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
  
  return { issues, summary };
}

export async function analyzeFiles(files: File[]): Promise<Record<string, AnalysisResult>> {
  const results: Record<string, AnalysisResult> = {};
  
  for (const file of files) {
    const code = await file.text();
    results[file.name] = await analyzeCode(code);
  }
  
  return results;
}