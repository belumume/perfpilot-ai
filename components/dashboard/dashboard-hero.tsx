// components/dashboard/dashboard-hero.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardHero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Optimize Your Next.js App with AI
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                PerfPilot AI analyzes your Next.js application for performance issues and provides actionable recommendations to improve speed and user experience.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/analyze">
                <Button size="lg">Analyze Your App</Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[300px] w-full overflow-hidden rounded-xl border bg-background p-2 shadow-xl">
              <div className="flex h-full w-full flex-col rounded-lg bg-muted p-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <div className="ml-2 text-sm font-medium">Performance Analysis</div>
                </div>
                <div className="mt-4 flex-1 space-y-4">
                  <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
                  <div className="h-4 w-full rounded bg-muted-foreground/20" />
                  <div className="h-4 w-5/6 rounded bg-muted-foreground/20" />
                  <div className="h-4 w-4/6 rounded bg-muted-foreground/20" />
                  <div className="h-4 w-full rounded bg-muted-foreground/20" />
                  <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
                  <div className="h-4 w-5/6 rounded bg-muted-foreground/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}