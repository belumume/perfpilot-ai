"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getAnalysisHistory, deleteAnalysisRecord, clearAnalysisHistory, AnalysisHistoryRecord } from "@/lib/storage";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart, Bar } from "recharts";
import { 
  ArchiveX, 
  ArrowRight, 
  ChevronRight, 
  Clock, 
  FileText, 
  LineChart as LineChartIcon,
  ListChecks, 
  RefreshCw, 
  Trash2, 
  TrendingUp,
  XCircle 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DashboardView() {
  const [history, setHistory] = useState<AnalysisHistoryRecord[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<AnalysisHistoryRecord | null>(null);

  // Load history on component mount
  useEffect(() => {
    const loadHistory = () => {
      const analysisHistory = getAnalysisHistory();
      setHistory(analysisHistory);
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
                    <Trash2 className="mr-2 h-4 w-4" />
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
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{history.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Projects analyzed
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold">
                        {history.length > 0 ? history[0].performanceScore : "N/A"}
                      </div>
                      {history.length > 0 && (
                        <Badge variant="secondary" className={getScoreBadgeColor(history[0].performanceScore)}>
                          {history[0].performanceScore >= 90 
                            ? "Excellent" 
                            : history[0].performanceScore >= 75 
                            ? "Good" 
                            : history[0].performanceScore >= 60 
                            ? "Moderate" 
                            : "Needs Work"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Most recent analysis
                    </p>
                  </CardContent>
                </Card>
                
                {history.length > 1 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Score Change</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-bold">
                          {history.length > 1 
                            ? history[0].performanceScore - history[1].performanceScore 
                            : 0}
                        </div>
                        {history.length > 1 && (
                          <Badge variant="secondary" className={
                            history[0].performanceScore >= history[1].performanceScore
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                          }>
                            {history[0].performanceScore >= history[1].performanceScore
                              ? <TrendingUp className="h-3 w-3" />
                              : <TrendingUp className="h-3 w-3 transform rotate-180" />
                            }
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Since previous analysis
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {history.length > 0 
                        ? Math.round(history.reduce((acc, record) => acc + record.performanceScore, 0) / history.length) 
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across all analyses
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Analyses</CardTitle>
                    <CardDescription>
                      Your latest performance analysis results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {history.slice(0, 5).map((record) => (
                          <div 
                            key={record.id} 
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center h-8 w-8 rounded-full text-white ${getScoreBadgeColor(record.performanceScore)}`}>
                                {record.performanceScore}
                              </div>
                              <div>
                                <h4 className="font-medium">{record.projectName}</h4>
                                <p className="text-xs text-muted-foreground flex gap-1 items-center">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(record.date)}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-accent"
                              onClick={() => setSelectedRecord(record)}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href="#" onClick={() => setActiveTab("history")}>
                        View All History
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Performance Trend</CardTitle>
                    <CardDescription>
                      Track your score improvements over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {history.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={preparePerformanceData()}
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#666" opacity={0.2} />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip
                              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderRadius: '6px', border: 'none' }}
                              itemStyle={{ color: '#fff' }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              name="Performance Score"
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <LineChartIcon className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground text-center">
                            Add more analyses to see performance trends
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {selectedRecord && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedRecord.projectName}</CardTitle>
                        <CardDescription>
                          Analysis from {formatDate(selectedRecord.date)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedRecord(null)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Performance Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Performance Score:</span>
                            <Badge className={getScoreBadgeColor(selectedRecord.performanceScore)}>
                              {selectedRecord.performanceScore}/100
                            </Badge>
                          </div>
                          
                          {selectedRecord.results.analysis && (
                            <>
                              <div className="flex justify-between">
                                <span>Total Issues:</span>
                                <span className="font-semibold">
                                  {
                                    'aggregateSummary' in selectedRecord.results.analysis
                                      ? selectedRecord.results.analysis.aggregateSummary.totalIssues
                                      : selectedRecord.results.analysis.summary.totalIssues
                                  }
                                </span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span>Critical Issues:</span>
                                <span className="font-semibold text-destructive">
                                  {
                                    'aggregateSummary' in selectedRecord.results.analysis
                                      ? selectedRecord.results.analysis.aggregateSummary.criticalIssues
                                      : selectedRecord.results.analysis.summary.criticalIssues
                                  }
                                </span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span>Warning Issues:</span>
                                <span className="font-semibold text-amber-500">
                                  {
                                    'aggregateSummary' in selectedRecord.results.analysis
                                      ? selectedRecord.results.analysis.aggregateSummary.warningIssues
                                      : selectedRecord.results.analysis.summary.warningIssues
                                  }
                                </span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span>Info Issues:</span>
                                <span className="font-semibold text-blue-500">
                                  {
                                    'aggregateSummary' in selectedRecord.results.analysis
                                      ? selectedRecord.results.analysis.aggregateSummary.infoIssues
                                      : selectedRecord.results.analysis.summary.infoIssues
                                  }
                                </span>
                              </div>
                            </>
                          )}
                          
                          {selectedRecord.results.bundleAnalysis && (
                            <>
                              <div className="flex justify-between">
                                <span>Bundle Score:</span>
                                <Badge>
                                  {selectedRecord.results.bundleAnalysis.score}/100
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Dependencies:</span>
                                <span className="font-semibold">
                                  {selectedRecord.results.bundleAnalysis.totalDependencies}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">AI Recommendations</h4>
                        <div className="text-sm space-y-2 overflow-y-auto max-h-[150px] pr-2">
                          <p>{selectedRecord.results.recommendations.summary}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      asChild
                      className="w-full"
                    >
                      <Link href="/analyze">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Re-Analyze Project
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis History</CardTitle>
                  <CardDescription>
                    View and manage your previous analysis results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label htmlFor="search" className="sr-only">Search</Label>
                    <Input
                      id="search"
                      placeholder="Search by project name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  
                  <div className="border rounded-md">
                    <div className="grid grid-cols-12 gap-3 p-3 bg-muted font-medium text-sm">
                      <div className="col-span-5">Project</div>
                      <div className="col-span-2 text-center">Score</div>
                      <div className="col-span-3">Date</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    
                    <ScrollArea className="h-[400px]">
                      {filteredHistory.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No matching records found
                        </div>
                      ) : (
                        filteredHistory.map((record) => (
                          <div 
                            key={record.id} 
                            className="grid grid-cols-12 gap-3 p-3 border-t items-center text-sm"
                          >
                            <div className="col-span-5 font-medium truncate">
                              {record.projectName}
                            </div>
                            <div className="col-span-2 text-center">
                              <Badge className={getScoreBadgeColor(record.performanceScore)}>
                                {record.performanceScore}/100
                              </Badge>
                            </div>
                            <div className="col-span-3 text-muted-foreground">
                              {formatDate(record.date)}
                            </div>
                            <div className="col-span-2 flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => setSelectedRecord(record)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this analysis?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this analysis record.
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteRecord(record.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance Score Trend</CardTitle>
                    <CardDescription>
                      Track how your performance score evolves over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      {history.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={preparePerformanceData()}
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#666" opacity={0.2} />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip
                              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderRadius: '6px', border: 'none' }}
                              itemStyle={{ color: '#fff' }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              name="Performance Score"
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <LineChartIcon className="h-16 w-16 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground text-center">
                            Add more analyses to see performance trends
                          </p>
                          <Button className="mt-4" asChild>
                            <Link href="/analyze">
                              Run Another Analysis
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {history.length > 0 && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Issue Categories</CardTitle>
                        <CardDescription>
                          Distribution of issues by category
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={prepareCategoryData()}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#666" opacity={0.2} />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderRadius: '6px', border: 'none' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#fff' }}
                              />
                              <Bar dataKey="value" name="Issues" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Most Recent Improvements</CardTitle>
                        <CardDescription>
                          Changes between your last two analyses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {history.length > 1 ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium">Performance Score</p>
                                <p className="text-xs text-muted-foreground">
                                  Latest vs Previous
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {history[1].performanceScore} → {history[0].performanceScore}
                                </Badge>
                                <Badge 
                                  className={history[0].performanceScore >= history[1].performanceScore
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-red-500 hover:bg-red-600"
                                  }
                                >
                                  {history[0].performanceScore >= history[1].performanceScore ? "+" : ""}
                                  {history[0].performanceScore - history[1].performanceScore}
                                </Badge>
                              </div>
                            </div>
                            
                            {history[0].results.analysis && history[1].results.analysis && (
                              <>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm font-medium">Total Issues</p>
                                    <p className="text-xs text-muted-foreground">
                                      Latest vs Previous
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {
                                        'aggregateSummary' in history[1].results.analysis
                                          ? history[1].results.analysis.aggregateSummary.totalIssues
                                          : history[1].results.analysis.summary.totalIssues
                                      } → {
                                        'aggregateSummary' in history[0].results.analysis
                                          ? history[0].results.analysis.aggregateSummary.totalIssues
                                          : history[0].results.analysis.summary.totalIssues
                                      }
                                    </Badge>
                                    
                                    {(() => {
                                      const oldIssues = 'aggregateSummary' in history[1].results.analysis
                                        ? history[1].results.analysis.aggregateSummary.totalIssues
                                        : history[1].results.analysis.summary.totalIssues;
                                        
                                      const newIssues = 'aggregateSummary' in history[0].results.analysis
                                        ? history[0].results.analysis.aggregateSummary.totalIssues
                                        : history[0].results.analysis.summary.totalIssues;
                                        
                                      const diff = oldIssues - newIssues;
                                      
                                      return (
                                        <Badge 
                                          className={diff >= 0
                                            ? "bg-green-500 hover:bg-green-600"
                                            : "bg-red-500 hover:bg-red-600"
                                          }
                                        >
                                          {diff >= 0 ? "+" : ""}
                                          {diff}
                                        </Badge>
                                      );
                                    })()}
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm font-medium">Critical Issues</p>
                                    <p className="text-xs text-muted-foreground">
                                      Latest vs Previous
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {
                                        'aggregateSummary' in history[1].results.analysis
                                          ? history[1].results.analysis.aggregateSummary.criticalIssues
                                          : history[1].results.analysis.summary.criticalIssues
                                      } → {
                                        'aggregateSummary' in history[0].results.analysis
                                          ? history[0].results.analysis.aggregateSummary.criticalIssues
                                          : history[0].results.analysis.summary.criticalIssues
                                      }
                                    </Badge>
                                    
                                    {(() => {
                                      const oldIssues = 'aggregateSummary' in history[1].results.analysis
                                        ? history[1].results.analysis.aggregateSummary.criticalIssues
                                        : history[1].results.analysis.summary.criticalIssues;
                                        
                                      const newIssues = 'aggregateSummary' in history[0].results.analysis
                                        ? history[0].results.analysis.aggregateSummary.criticalIssues
                                        : history[0].results.analysis.summary.criticalIssues;
                                        
                                      const diff = oldIssues - newIssues;
                                      
                                      return (
                                        <Badge 
                                          className={diff >= 0
                                            ? "bg-green-500 hover:bg-green-600"
                                            : "bg-red-500 hover:bg-red-600"
                                          }
                                        >
                                          {diff >= 0 ? "+" : ""}
                                          {diff}
                                        </Badge>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {history[0].results.bundleAnalysis && history[1].results.bundleAnalysis && (
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium">Bundle Score</p>
                                  <p className="text-xs text-muted-foreground">
                                    Latest vs Previous
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {history[1].results.bundleAnalysis.score} → {history[0].results.bundleAnalysis.score}
                                  </Badge>
                                  <Badge 
                                    className={history[0].results.bundleAnalysis.score >= history[1].results.bundleAnalysis.score
                                      ? "bg-green-500 hover:bg-green-600"
                                      : "bg-red-500 hover:bg-red-600"
                                    }
                                  >
                                    {history[0].results.bundleAnalysis.score >= history[1].results.bundleAnalysis.score ? "+" : ""}
                                    {history[0].results.bundleAnalysis.score - history[1].results.bundleAnalysis.score}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[150px]">
                            <ListChecks className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground text-center">
                              Need at least two analyses to compare improvements
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
} 