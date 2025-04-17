import { AnalysisResult } from "@/lib/analysis/analyzer";
import { BundleAnalysisResult } from "@/lib/analysis/bundle-analyzer";

// Define the structure of a saved analysis record
export interface AnalysisHistoryRecord {
  id: string;
  date: string;
  performanceScore: number;
  results: {
    analysis?: AnalysisResult | {
      fileResults: Record<string, AnalysisResult>;
      aggregateSummary: {
        totalIssues: number;
        criticalIssues: number;
        warningIssues: number;
        infoIssues: number;
        categories: Record<string, number>;
      };
    };
    recommendations: {
      summary: string;
      recommendations: string[];
    };
    bundleAnalysis?: BundleAnalysisResult;
  };
  projectName: string;
}

const STORAGE_KEY = 'perfpilot-analysis-history';

// Save a new analysis to history
export function saveAnalysisToHistory(
  results: AnalysisHistoryRecord['results'],
  performanceScore: number,
  projectName: string = 'Unnamed Project'
): AnalysisHistoryRecord {
  try {
    // Generate a unique ID and create record with timestamp
    const id = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newRecord: AnalysisHistoryRecord = {
      id,
      date: new Date().toISOString(),
      performanceScore,
      results,
      projectName,
    };
    
    // Get existing history or initialize empty array
    const existingHistory = getAnalysisHistory();
    
    // Add new record to the beginning of the array
    const updatedHistory = [newRecord, ...existingHistory];
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    
    return newRecord;
  } catch (error) {
    console.error('Failed to save analysis to history:', error);
    throw error;
  }
}

// Get all saved analysis records
export function getAnalysisHistory(): AnalysisHistoryRecord[] {
  try {
    // Check if localStorage is available (only works in browser)
    if (typeof window === 'undefined') {
      return [];
    }
    
    const historyJson = localStorage.getItem(STORAGE_KEY);
    
    if (!historyJson) {
      return [];
    }
    
    return JSON.parse(historyJson) as AnalysisHistoryRecord[];
  } catch (error) {
    console.error('Failed to retrieve analysis history:', error);
    return [];
  }
}

// Delete an analysis record by ID
export function deleteAnalysisRecord(id: string): boolean {
  try {
    const existingHistory = getAnalysisHistory();
    
    // Filter out the record with the matching ID
    const updatedHistory = existingHistory.filter(record => record.id !== id);
    
    // Save the updated history
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    
    // Return true if a record was removed
    return updatedHistory.length < existingHistory.length;
  } catch (error) {
    console.error('Failed to delete analysis record:', error);
    return false;
  }
}

// Clear all analysis history
export function clearAnalysisHistory(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear analysis history:', error);
    return false;
  }
} 