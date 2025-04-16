// components/analyze/analyze-header.tsx
import { Badge } from "@/components/ui/badge";
import { Zap, LineChart, BarChart } from "lucide-react";

export function AnalyzeHeader() {
    return (
      <div className="mb-10 space-y-5">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Analyze Your Next.js App</h1>
          <p className="text-muted-foreground max-w-3xl">
            Upload your Next.js files or paste code to get AI-powered performance recommendations, detect issues, and optimize for the latest Next.js 14/15 features.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 pt-2">
          <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
            <Zap className="mr-1 h-3 w-3 text-amber-500" />
            Next.js 14/15 Support
          </div>
          <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
            <LineChart className="mr-1 h-3 w-3 text-blue-500" />
            Performance Score
          </div>
          <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
            <BarChart className="mr-1 h-3 w-3 text-green-500" />
            Visual Dashboard
          </div>
          <Badge variant="outline" className="bg-primary/10 hover:bg-primary/10">Multi-file Analysis</Badge>
          <Badge variant="outline" className="bg-primary/10 hover:bg-primary/10">Code Examples</Badge>
          <Badge variant="outline" className="bg-primary/10 hover:bg-primary/10">Partial Prerendering</Badge>
        </div>
      </div>
    );
  }