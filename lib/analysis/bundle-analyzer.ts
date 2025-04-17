// Define the structure for a bundle analysis result
export interface BundleAnalysisResult {
  totalDependencies: number;
  heavyDependencies: HeavyDependency[];
  unnecessaryDependencies: UnnecessaryDependency[];
  duplicateDependencies: DuplicateDependency[];
  treeshakingIssues: TreeshakingIssue[];
  score: number;
  summary: {
    totalIssues: number;
    size: {
      estimated: string;
      breakdown: {
        dependencies: string;
        devDependencies: string;
      };
    };
  };
}

export interface HeavyDependency {
  name: string;
  estimatedSize: string;
  alternatives?: string[];
}

export interface UnnecessaryDependency {
  name: string;
  reason: string;
}

export interface DuplicateDependency {
  names: string[];
  reason: string;
}

export interface TreeshakingIssue {
  dependency: string;
  importStatement: string;
  recommendation: string;
}

// Define the interface for package.json structure
interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

// Common heavy dependencies known to cause bundle size issues in Next.js
const HEAVY_DEPENDENCIES = new Map<string, { size: string; alternatives?: string[] }>([
  ['moment', { size: '~300KB', alternatives: ['date-fns', 'dayjs'] }],
  ['lodash', { size: '~70KB', alternatives: ['lodash-es', 'just use native methods'] }],
  ['jquery', { size: '~90KB', alternatives: ['use native DOM methods'] }],
  ['chart.js', { size: '~160KB', alternatives: ['lightweight-charts', 'recharts'] }],
  ['bootstrap', { size: '~190KB', alternatives: ['tailwindcss'] }],
  ['material-ui', { size: '~350KB', alternatives: ['shadcn/ui', '@radix-ui/react'] }],
  ['material-ui/core', { size: '~350KB', alternatives: ['shadcn/ui', '@radix-ui/react'] }],
  ['@mui/material', { size: '~350KB', alternatives: ['shadcn/ui', '@radix-ui/react'] }],
  ['antd', { size: '~400KB', alternatives: ['shadcn/ui', '@radix-ui/react'] }],
  ['gatsby', { size: '~250KB', alternatives: ['next.js'] }],
  ['axios', { size: '~40KB', alternatives: ['fetch API', 'ky'] }],
  ['redux', { size: '~30KB', alternatives: ['zustand', 'jotai', 'context API'] }],
  ['react-redux', { size: '~20KB', alternatives: ['zustand', 'jotai', 'context API'] }],
  ['styled-components', { size: '~50KB', alternatives: ['emotion', 'tailwindcss'] }],
]);

// Dependencies that are typically unnecessary in Next.js projects
const UNNECESSARY_DEPENDENCIES = new Map<string, string>([
  ['react-router', 'Next.js has built-in routing, no need for react-router'],
  ['react-router-dom', 'Next.js has built-in routing, no need for react-router-dom'],
  ['webpack', 'Next.js handles webpack configuration internally'],
  ['babel', 'Next.js handles babel configuration internally'],
  ['express', 'For API routes, use Next.js API routes instead (unless needed for custom server)'],
  ['parcel', 'Next.js has its own bundler; parcel is redundant'],
  ['serve', 'Use built-in Next.js production server or Vercel deployment'],
]);

// Known patterns where imports can cause treeshaking issues
const TREESHAKING_ISSUE_PATTERNS = [
  {
    pattern: /import\s+.*\s+from\s+['"]lodash['"]/,
    recommendation: 'Import specific functions from lodash-es or use native methods',
  },
  {
    pattern: /import\s+.*\s+from\s+['"]@mui\/material['"]/,
    recommendation: 'Import specific components, e.g., import Button from "@mui/material/Button"',
  },
  {
    pattern: /import\s+.*\s+from\s+['"]antd['"]/,
    recommendation: 'Import specific components, e.g., import { Button } from "antd/es/button"',
  },
  {
    pattern: /import\s+{[^}]+}\s+from\s+['"]react-icons\/fa['"]/,
    recommendation: 'Import specific icons, e.g., import { FaArrow } from "react-icons/fa/FaArrow"',
  },
];

/**
 * Helper function to clean up JSON content that might have formatting issues
 */
function cleanJsonContent(jsonContent: string): string {
  // Remove comments (both // and /* */)
  let cleaned = jsonContent.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove trailing commas
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  // Try to fix the case when there's a syntax error with JSON comments in the file
  if (cleaned.includes('// Comments in JSON') || cleaned.includes('/*')) {
    try {
      // Try to parse it as a JavaScript object
      const jsObject = new Function(`return ${cleaned}`)();
      return JSON.stringify(jsObject);
    } catch (e) {
      console.log('Failed to parse as JavaScript object:', e);
    }
  }
  
  return cleaned;
}

/**
 * Analyze the package.json content to identify potential bundle size issues
 */
export async function analyzeBundleSize(packageJsonContent: string): Promise<BundleAnalysisResult> {
  console.log('Starting bundle analysis, content length:', packageJsonContent.length);
  
  let packageJson: PackageJson;
  
  try {
    // First try simple JSON parse
    packageJson = JSON.parse(packageJsonContent);
    console.log('Successfully parsed package.json with standard JSON.parse');
  } catch (initialError) {
    console.error('Error in initial JSON parse:', initialError);
    
    try {
      // If that fails, try to clean the JSON content and parse again
      const cleanedContent = cleanJsonContent(packageJsonContent);
      console.log('Cleaned JSON content, attempting to parse again');
      packageJson = JSON.parse(cleanedContent);
      console.log('Successfully parsed cleaned package.json');
    } catch (secondError) {
      console.error('Error parsing cleaned JSON:', secondError);
      
      // Return a default result if we can't parse the JSON
      return {
        totalDependencies: 0,
        heavyDependencies: [],
        unnecessaryDependencies: [],
        duplicateDependencies: [],
        treeshakingIssues: [],
        score: 100, // Default to perfect score when we can't analyze
        summary: {
          totalIssues: 0,
          size: {
            estimated: 'Error: Invalid package.json format',
            breakdown: {
              dependencies: 'Parse error',
              devDependencies: 'Parse error',
            },
          },
        },
      };
    }
  }
  
  try {
    console.log('Analyzing dependencies in package.json');
    
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    
    console.log(`Found ${Object.keys(dependencies).length} dependencies and ${Object.keys(devDependencies).length} devDependencies`);
    
    const heavyDependencies: HeavyDependency[] = [];
    const unnecessaryDependencies: UnnecessaryDependency[] = [];
    const duplicateDependencies: DuplicateDependency[] = [];
    
    // Check for heavy dependencies
    Object.keys(dependencies).forEach((dep) => {
      if (HEAVY_DEPENDENCIES.has(dep)) {
        const info = HEAVY_DEPENDENCIES.get(dep)!;
        heavyDependencies.push({
          name: dep,
          estimatedSize: info.size,
          alternatives: info.alternatives,
        });
      }
    });
    
    // Check for unnecessary dependencies
    Object.keys(dependencies).forEach((dep) => {
      if (UNNECESSARY_DEPENDENCIES.has(dep)) {
        unnecessaryDependencies.push({
          name: dep,
          reason: UNNECESSARY_DEPENDENCIES.get(dep)!,
        });
      }
    });
    
    // Check for duplicate functionality
    const duplicates = findDuplicateFunctionality(dependencies);
    duplicateDependencies.push(...duplicates);
    
    // Calculate a bundle score (0-100)
    const score = calculateBundleScore({
      heavyDependencies,
      unnecessaryDependencies,
      duplicateDependencies,
    });
    
    const totalDependencies = Object.keys(dependencies).length;
    const totalDevDependencies = Object.keys(devDependencies).length;
    
    // Estimate bundle size (very rough estimation)
    const estimatedSize = estimateBundleSize(dependencies);
    
    const result: BundleAnalysisResult = {
      totalDependencies: totalDependencies,
      heavyDependencies,
      unnecessaryDependencies,
      duplicateDependencies,
      treeshakingIssues: [], // Will be populated by code analysis
      score,
      summary: {
        totalIssues: heavyDependencies.length + unnecessaryDependencies.length + duplicateDependencies.length,
        size: {
          estimated: estimatedSize,
          breakdown: {
            dependencies: `${totalDependencies} dependencies`,
            devDependencies: `${totalDevDependencies} devDependencies`,
          },
        },
      },
    };
    
    console.log('Bundle analysis complete, found:', 
      `${result.heavyDependencies.length} heavy deps, `,
      `${result.unnecessaryDependencies.length} unnecessary deps, `,
      `${result.duplicateDependencies.length} duplicate deps, `,
      `score: ${result.score}`
    );
    
    return result;
  } catch (error) {
    console.error("Error analyzing bundle size:", error);
    return {
      totalDependencies: 0,
      heavyDependencies: [],
      unnecessaryDependencies: [],
      duplicateDependencies: [],
      treeshakingIssues: [],
      score: 100, // Default to perfect score when we can't analyze
      summary: {
        totalIssues: 0,
        size: {
          estimated: 'Error during analysis',
          breakdown: {
            dependencies: 'Unknown',
            devDependencies: 'Unknown',
          },
        },
      },
    };
  }
}

/**
 * Analyze code files for treeshaking issues
 */
export function analyzeTreeshaking(files: Record<string, string>): TreeshakingIssue[] {
  const issues: TreeshakingIssue[] = [];
  
  Object.entries(files).forEach(([filename, content]) => {
    // Only analyze JavaScript/TypeScript files
    if (!filename.match(/\.(js|jsx|ts|tsx)$/)) return;
    
    // Check for problematic import patterns
    TREESHAKING_ISSUE_PATTERNS.forEach(({ pattern, recommendation }) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          dependency: pattern.toString().split(/['"]/)[1], // Extract dependency name
          importStatement: matches[0],
          recommendation,
        });
      }
    });
  });
  
  return issues;
}

// Helper functions

function findDuplicateFunctionality(dependencies: Record<string, string>): DuplicateDependency[] {
  const duplicates: DuplicateDependency[] = [];
  const deps = Object.keys(dependencies);
  
  // State management duplicates
  const stateManagementLibs = ['redux', 'react-redux', 'zustand', 'jotai', 'recoil', 'mobx', 'mobx-react'].filter(lib => deps.includes(lib));
  if (stateManagementLibs.length > 1) {
    duplicates.push({
      names: stateManagementLibs,
      reason: 'Multiple state management libraries can increase bundle size and complexity',
    });
  }
  
  // UI framework duplicates
  const uiLibs = ['@mui/material', '@chakra-ui/react', 'antd', 'react-bootstrap', 'semantic-ui-react'].filter(lib => deps.includes(lib));
  if (uiLibs.length > 1) {
    duplicates.push({
      names: uiLibs,
      reason: 'Multiple UI component libraries significantly increase bundle size',
    });
  }
  
  // HTTP client duplicates
  const httpClients = ['axios', 'superagent', 'got', 'request', 'node-fetch'].filter(lib => deps.includes(lib));
  if (httpClients.length > 1) {
    duplicates.push({
      names: httpClients,
      reason: 'Multiple HTTP client libraries are unnecessary; consider using the native fetch API',
    });
  }
  
  return duplicates;
}

function calculateBundleScore({
  heavyDependencies,
  unnecessaryDependencies,
  duplicateDependencies,
}: {
  heavyDependencies: HeavyDependency[];
  unnecessaryDependencies: UnnecessaryDependency[];
  duplicateDependencies: DuplicateDependency[];
}): number {
  // Start with a perfect score
  let score = 100;
  
  // Deduct for heavy dependencies
  score -= heavyDependencies.length * 5;
  
  // Deduct for unnecessary dependencies
  score -= unnecessaryDependencies.length * 3;
  
  // Deduct for duplicate dependencies
  score -= duplicateDependencies.length * 8;
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, score));
}

function estimateBundleSize(dependencies: Record<string, string>): string {
  // This is a very rough estimation based on typical dependency sizes
  // A more accurate analysis would require actual bundle analysis tools
  
  let totalEstimatedKB = 0;
  
  Object.keys(dependencies).forEach(dep => {
    if (HEAVY_DEPENDENCIES.has(dep)) {
      // Extract the numeric part from sizes like "~300KB"
      const sizeStr = HEAVY_DEPENDENCIES.get(dep)!.size;
      const sizeMatch = sizeStr.match(/~?(\d+)KB/);
      if (sizeMatch && sizeMatch[1]) {
        totalEstimatedKB += parseInt(sizeMatch[1], 10);
      }
    } else {
      // Assign a default size for unknown dependencies
      totalEstimatedKB += 20; // Assume average of 20KB
    }
  });
  
  // Format the size
  if (totalEstimatedKB > 1000) {
    return `~${(totalEstimatedKB / 1000).toFixed(1)}MB`;
  }
  return `~${totalEstimatedKB}KB`;
} 