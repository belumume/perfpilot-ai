// components/dashboard/dashboard-cta.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileCode2, ArrowRight, BarChart2 } from 'lucide-react';

export function DashboardCTA() {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Analysis Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 space-y-4 p-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Quick Analysis</h3>
                    <p className="text-muted-foreground">
                      Upload your Next.js component or paste code to get instant performance insights.
                    </p>
                  </div>
                  <Link href="/analyze">
                    <Button>
                      Start Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center justify-center bg-muted p-6 md:w-1/3">
                  <FileCode2 className="h-16 w-16 text-primary opacity-80" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Performance Metrics</h3>
                  <p className="text-muted-foreground">
                    Key metrics to focus on for Next.js optimization
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart2 className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">Initial Load Time</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Critical</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[75%]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Bundle Size</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Important</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[60%]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart2 className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Image Optimization</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Essential</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[85%]" />
                    </div>
                  </div>
                </div>
                
                <Link href="/about" className="inline-block">
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}