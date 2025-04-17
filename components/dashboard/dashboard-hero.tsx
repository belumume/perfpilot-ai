// components/dashboard/dashboard-hero.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, Zap, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DashboardHero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 relative">
      {/* Hackathon Banner */}
      <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground py-2 px-4">
        <div className="container flex flex-col sm:flex-row items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Submitted for the Next.js Global Hackathon 2025</span>
          </div>
          <a href="https://next-hackathon-2025.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline">
            Learn more about the hackathon
          </a>
        </div>
      </div>
      
      <div className="container pt-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className="px-3 py-1 text-sm bg-background">
                <Zap className="mr-1 h-3 w-3" />
                Speed Optimizer
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-sm bg-background">
                <Package className="mr-1 h-3 w-3" />
                <span className="text-primary font-medium">NEW</span>: Bundle Analyzer
              </Badge>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Optimize Your Next.js App with AI
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                PerfPilot AI analyzes your Next.js code and dependencies for performance issues and provides actionable recommendations to improve speed.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/analyze">
                <Button size="lg">Analyze Your App</Button>
              </Link>
              <Link href="/analyze">
                <Button size="lg" variant="outline" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Analyze Bundle Size
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[300px] w-full overflow-hidden rounded-xl border bg-background p-2 shadow-xl">
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-primary">New Bundle Analysis</Badge>
              </div>
              <div className="flex h-full w-full flex-col rounded-lg bg-muted p-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <div className="ml-2 text-sm font-medium">Bundle Size Analysis</div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {/* Left side - Chart mockup */}
                  <div className="col-span-2 rounded-lg bg-background p-2 h-32">
                    <div className="w-full h-full flex items-end justify-around space-x-1 px-2">
                      <div className="h-[30%] w-4 bg-red-400 rounded-t"></div>
                      <div className="h-[60%] w-4 bg-red-500 rounded-t"></div>
                      <div className="h-[40%] w-4 bg-orange-400 rounded-t"></div>
                      <div className="h-[20%] w-4 bg-yellow-400 rounded-t"></div>
                      <div className="h-[70%] w-4 bg-green-400 rounded-t"></div>
                      <div className="h-[90%] w-4 bg-green-500 rounded-t"></div>
                    </div>
                  </div>
                  
                  {/* Right side - Metrics mockup */}
                  <div className="col-span-2 flex flex-col justify-between">
                    <div className="bg-muted-foreground/10 h-7 w-full rounded"></div>
                    <div className="bg-muted-foreground/10 h-7 w-full rounded"></div>
                    <div className="bg-primary/20 h-7 w-full rounded"></div>
                    <div className="bg-muted-foreground/10 h-7 w-full rounded"></div>
                  </div>
                  
                  {/* Bottom area - Table mockup */}
                  <div className="col-span-4 mt-2 h-[100px] overflow-hidden rounded bg-background p-2">
                    <div className="space-y-2">
                      <div className="h-4 w-full rounded bg-muted-foreground/20"></div>
                      <div className="h-4 w-5/6 rounded bg-muted-foreground/20"></div>
                      <div className="h-4 w-full rounded bg-muted-foreground/20"></div>
                      <div className="h-4 w-4/6 rounded bg-red-400/30"></div>
                      <div className="h-4 w-3/4 rounded bg-yellow-400/30"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}