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
 * Advanced function to clean up JSON content that might have formatting issues
 * Handles common issues like comments, trailing commas, unquoted property names, and invalid escapes
 */
function cleanJsonContent(jsonContent: string): string {
  // Step 1: Remove comments (both // and /* */)
  let cleaned = jsonContent.replace(/\/\/.*$/gm, '') // Remove line comments
                           .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments
  
  // Step 2: Fix trailing commas in objects and arrays
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  
  // Step 3: Fix missing quotes around property names
  // This regex looks for unquoted property names (common in relaxed JSON formats)
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3');
  
  // Step 4: Fix single quotes used instead of double quotes (used in some JS configs)
  // First handle property names with single quotes
  cleaned = cleaned.replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3');
  // Then handle string values with single quotes (more complex to avoid breaking JSON structure)
  cleaned = cleaned.replace(/:(\s*)'([^']*)'([,}\]])/g, ':$1"$2"$3');
  
  // Step 5: Fix invalid escape sequences
  // Replace common Windows path backslashes that might not be properly escaped
  cleaned = cleaned.replace(/:\s*"([^"\\]*)(\\[^"\\][^"\\]*)+"/g, (match) => {
    return match.replace(/\\/g, '\\\\');
  });
  
  // Step 6: Try to normalize any other common issues
  // Remove potential control characters that might cause parsing errors
  cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  
  return cleaned;
}

/**
 * Tries multiple strategies to parse JSON content safely
 * Returns the parsed object or throws an error if all strategies fail
 */
function parseJsonSafely(content: string): Record<string, unknown> {
  // Strategy 1: Try direct JSON.parse
  try {
    return JSON.parse(content);
  } catch {
    console.log('Direct JSON.parse failed, trying cleanup');
  }
  
  // Strategy 2: Try cleaning the content first
  try {
    const cleaned = cleanJsonContent(content);
    return JSON.parse(cleaned);
  } catch {
    console.log('Cleaned JSON.parse failed, trying JavaScript evaluation');
  }
  
  // Strategy 3: Try to parse it as a JavaScript object literal
  try {
    // WARNING: This uses Function constructor as a last resort
    // It's generally safe since we're not executing arbitrary code, just evaluating a JSON-like object
    const jsObject = new Function(`try { return (${content}); } catch(e) { return {}; }`)();
    
    // Check if we got something usable back
    if (jsObject && typeof jsObject === 'object' && !Array.isArray(jsObject)) {
      return jsObject as Record<string, unknown>;
    }
    throw new Error('JavaScript evaluation did not return a valid object');
  } catch {
    console.log('JavaScript evaluation failed, trying piecemeal extraction');
  }
  
  // Strategy 4: Try to extract just dependencies and devDependencies directly using regex
  // This is a last resort when the JSON is seriously malformed
  try {
    const dependenciesMatch = content.match(/"dependencies"\s*:\s*({[^}]*})/);
    const devDependenciesMatch = content.match(/"devDependencies"\s*:\s*({[^}]*})/);
    
    const result: Record<string, unknown> = {};
    
    if (dependenciesMatch && dependenciesMatch[1]) {
      // Clean and parse just the dependencies object
      try {
        const depsString = cleanJsonContent(`{${dependenciesMatch[1]}}`);
        result.dependencies = JSON.parse(depsString);
      } catch {
        console.log('Failed to parse dependencies section');
      }
    }
    
    if (devDependenciesMatch && devDependenciesMatch[1]) {
      // Clean and parse just the devDependencies object
      try {
        const devDepsString = cleanJsonContent(`{${devDependenciesMatch[1]}}`);
        result.devDependencies = JSON.parse(devDepsString);
      } catch {
        console.log('Failed to parse devDependencies section');
      }
    }
    
    // If we extracted at least one section, return the result
    if (result.dependencies || result.devDependencies) {
      return result;
    }
    
    throw new Error('Failed to extract any dependencies sections');
  } catch (error) {
    // All strategies failed
    console.error('All JSON parsing strategies failed:', error);
    throw new Error('Could not parse package.json using any available method');
  }
}

/**
 * Analyze the package.json content to identify potential bundle size issues
 */
export async function analyzeBundleSize(packageJsonContent: string): Promise<BundleAnalysisResult> {
  console.log('Starting bundle analysis, content length:', packageJsonContent.length);
  
  let packageJson: PackageJson;
  
  try {
    // Use our new parseJsonSafely function instead of direct JSON.parse
    packageJson = parseJsonSafely(packageJsonContent);
    console.log('Successfully parsed package.json');
  } catch (error) {
    console.error('All parsing methods failed:', error);
    
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