import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AnalysisHistoryRecord } from "@/lib/storage";
import { FileText, Trash2 } from "lucide-react";

interface HistoryTabProps {
  history: AnalysisHistoryRecord[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedRecord: AnalysisHistoryRecord | null;
  setSelectedRecord: (record: AnalysisHistoryRecord | null) => void;
  handleDeleteRecord: (id: string) => void;
  getScoreBadgeColor: (score: number) => string;
  formatDate: (date: string) => string;
}

export default function HistoryTabContent({
  history,
  searchTerm,
  setSearchTerm,
  setSelectedRecord,
  handleDeleteRecord,
  getScoreBadgeColor,
  formatDate
}: HistoryTabProps) {
  return (
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
            {history.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No matching records found
              </div>
            ) : (
              history.map((record) => (
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
  );
} 