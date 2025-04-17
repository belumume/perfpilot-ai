"use client";

import { useState, useEffect, Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getAnalysisHistory, deleteAnalysisRecord, clearAnalysisHistory, AnalysisHistoryRecord } from "@/lib/storage";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { 
  ArchiveX, 
  ArrowRight,
  Loader2
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Link from "next/link";
import { toast } from "sonner";

// Import Recharts components directly for reliable rendering
// We trade a little bundle size for guaranteed functionality
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

// Create a combined object for the chart components
const ChartComponents = {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip: RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar
};

// Loading component for dynamic tab content
const TabLoading = () => (
  <div className="flex justify-center items-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
  </div>
);

// Dynamically import tab contents with proper loading states
const OverviewTabContent = dynamic(() => import("./tabs/overview-tab"), { 
  loading: () => <TabLoading />,
  ssr: true 
});

const HistoryTabContent = dynamic(() => import("./tabs/history-tab"), { 
  loading: () => <TabLoading />,
  ssr: false 
});

const TrendsTabContent = dynamic(() => import("./tabs/trends-tab"), { 
  loading: () => <TabLoading />,
  ssr: false 
});

export default function DashboardView() {
  const [history, setHistory] = useState<AnalysisHistoryRecord[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<AnalysisHistoryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load history on component mount
  useEffect(() => {
    const loadHistory = () => {
      setIsLoading(true);
      const analysisHistory = getAnalysisHistory();
      setHistory(analysisHistory);
      setIsLoading(false);
    };

    loadHistory();
    
    // Set up event listener for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'perfpilot-analysis-history') {
        loadHistory();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Filter history based on search term
  const filteredHistory = history.filter(record => 
    record.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle record deletion
  const handleDeleteRecord = (id: string) => {
    if (deleteAnalysisRecord(id)) {
      setHistory(prevHistory => prevHistory.filter(record => record.id !== id));
      toast.success("Analysis record deleted");
    } else {
      toast.error("Failed to delete analysis record");
    }
  };

  // Handle clearing all history
  const handleClearHistory = () => {
    if (clearAnalysisHistory()) {
      setHistory([]);
      toast.success("Analysis history cleared");
    } else {
      toast.error("Failed to clear analysis history");
    }
  };

  // Prepare data for trend charts
  const preparePerformanceData = () => {
    // Return the last 10 analyses in chronological order
    return [...history]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10)
      .map(record => ({
        date: format(new Date(record.date), 'MMM d'),
        score: record.performanceScore,
        name: record.projectName
      }));
  };

  // Prepare data for category distribution
  const prepareCategoryData = () => {
    if (history.length === 0) return [];
    
    // Aggregate categories across all analyses
    const categories: Record<string, number> = {};
    
    history.forEach(record => {
      if (record.results.analysis) {
        const summary = 'aggregateSummary' in record.results.analysis 
          ? record.results.analysis.aggregateSummary 
          : record.results.analysis.summary;
          
        if (summary.categories) {
          Object.entries(summary.categories).forEach(([category, count]) => {
            categories[category] = (categories[category] || 0) + count;
          });
        }
      }
    });
    
    // Convert to chart format
    return Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  };

  // Get badge color based on score
  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-500 hover:bg-green-600";
    if (score >= 75) return "bg-green-400 hover:bg-green-500";
    if (score >= 60) return "bg-yellow-400 hover:bg-yellow-500";
    if (score >= 40) return "bg-orange-500 hover:bg-orange-600";
    return "bg-red-500 hover:bg-red-600";
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ArchiveX className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No analysis history yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Run your first analysis to start tracking performance improvements over time.
      </p>
      <Button asChild>
        <Link href="/analyze">
          Analyze New Project
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );

  // Loading state for initial data load
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Track your performance improvements over time
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your performance improvements over time
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="default">
            <Link href="/analyze">
              New Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {history.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">Analysis History</TabsTrigger>
                <TabsTrigger value="trends">Performance Trends</TabsTrigger>
              </TabsList>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive">
                    Clear History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear analysis history?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete all saved analysis records.
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground">
                      Clear History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <Suspense fallback={<TabLoading />}>
                <OverviewTabContent 
                  history={history} 
                  selectedRecord={selectedRecord} 
                  setSelectedRecord={setSelectedRecord}
                  ChartComponents={ChartComponents}
                  preparePerformanceData={preparePerformanceData}
                  getScoreBadgeColor={getScoreBadgeColor}
                  formatDate={formatDate}
                  setActiveTab={setActiveTab}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Suspense fallback={<TabLoading />}>
                <HistoryTabContent 
                  history={filteredHistory}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  setSelectedRecord={setSelectedRecord}
                  handleDeleteRecord={handleDeleteRecord}
                  getScoreBadgeColor={getScoreBadgeColor}
                  formatDate={formatDate}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Suspense fallback={<TabLoading />}>
                <TrendsTabContent 
                  history={history}
                  ChartComponents={ChartComponents}
                  preparePerformanceData={preparePerformanceData}
                  prepareCategoryData={prepareCategoryData}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
} 