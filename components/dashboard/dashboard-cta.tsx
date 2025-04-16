// components/dashboard/dashboard-cta.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileCode2, ArrowRight, BarChart2, TrendingUp, Zap, Trophy } from 'lucide-react';

export function DashboardCTA() {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Analysis Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 space-y-4 p-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Quick Analysis</h3>
                    <p className="text-muted-foreground">
                      Upload your Next.js files or paste code to get instant performance insights and recommendations.
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

          {/* Next.js Features Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Next.js 14/15 Features</h3>
                  <p className="text-muted-foreground">
                    PerfPilot AI helps you adopt the latest Next.js features for maximum performance
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">Partial Prerendering (PPR)</span>
                      </div>
                      <span className="text-xs text-muted-foreground">New in Next.js 14</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[95%]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Server Actions & Components</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Essential</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[90%]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart2 className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Core Web Vitals</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Performance Critical</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[85%]" />
                    </div>
                  </div>
                </div>
                
                <Link href="https://nextjs.org/docs/app/building-your-application/optimizing" target="_blank" rel="noopener noreferrer" className="inline-block">
                  <Button variant="outline" size="sm">
                    Next.js Docs
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Hackathon Banner */}
        <div className="mt-12">
          <Card className="overflow-hidden bg-gradient-to-r from-blue-600 to-violet-600 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-300" />
                    <h3 className="text-xl font-bold">Next.js Global Hackathon 2025</h3>
                  </div>
                  <p className="md:max-w-[500px]">
                    PerfPilot AI is proudly participating in the Next.js Global Hackathon. We&apos;re focused on creating the best performance optimization tool for Next.js applications.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/analyze">
                    <Button variant="secondary" className="w-full sm:w-auto">
                      Try It Now
                    </Button>
                  </Link>
                  <Link href="https://lu.ma/vsi4m4l8" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 w-full sm:w-auto">
                      Hackathon Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}