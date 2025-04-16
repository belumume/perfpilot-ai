// components/dashboard/dashboard-features.tsx
import { Gauge, Zap, Image as ImageIcon, FileCode, Box, BarChart, Cpu, LineChart, Sparkles } from 'lucide-react';

export function DashboardFeatures() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              Key Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Optimize Your Next.js Application
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              PerfPilot AI helps you identify and fix performance issues in your Next.js applications with support for the latest Next.js 14/15 features.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Gauge className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Performance Analysis</h3>
            <p className="text-center text-muted-foreground">
              Analyze your Next.js application for performance bottlenecks and calculate a performance score.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Zap className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">AI Recommendations</h3>
            <p className="text-center text-muted-foreground">
              Get AI-powered, priority-ranked recommendations to improve your application&apos;s speed.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <ImageIcon className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Image Optimization</h3>
            <p className="text-center text-muted-foreground">
              Identify missing next/image components, dimensions, and priority props for LCP images.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <BarChart className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Core Web Vitals</h3>
            <p className="text-center text-muted-foreground">
              Improve LCP, CLS, and INP by detecting issues that impact these critical metrics.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Box className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Partial Prerendering</h3>
            <p className="text-center text-muted-foreground">
              Detect opportunities to use Next.js 14&apos;s Partial Prerendering (PPR) for faster initial loads.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Cpu className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Server Components</h3>
            <p className="text-center text-muted-foreground">
              Identify optimal patterns for React Server Components and client/server code separation.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <FileCode className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Code Examples</h3>
            <p className="text-center text-muted-foreground">
              Get specific, copyable code examples to fix identified performance issues in your app.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <LineChart className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Visual Dashboard</h3>
            <p className="text-center text-muted-foreground">
              See performance metrics and optimization opportunities in a comprehensive visual dashboard.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Sparkles className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Multi-File Analysis</h3>
            <p className="text-center text-muted-foreground">
              Upload and analyze multiple files at once to get a holistic view of your application&apos;s performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}