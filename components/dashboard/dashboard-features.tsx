// components/dashboard/dashboard-features.tsx
import { Gauge, Zap, Image, FileCode, LayoutGrid, Sparkles } from 'lucide-react';

export function DashboardFeatures() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              Key Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Optimize Your Next.js Application
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              PerfPilot AI helps you identify and fix performance issues in your Next.js applications.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Gauge className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Performance Analysis</h3>
            <p className="text-center text-muted-foreground">
              Analyze your Next.js application for performance bottlenecks and issues.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Zap className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Optimization Suggestions</h3>
            <p className="text-center text-muted-foreground">
              Get AI-powered recommendations to improve your application's speed.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Image className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Image Optimization</h3>
            <p className="text-center text-muted-foreground">
              Identify and fix image-related performance issues using next/image.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <FileCode className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Code Suggestions</h3>
            <p className="text-center text-muted-foreground">
              Get specific code examples to fix identified performance issues.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <LayoutGrid className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Layout Analysis</h3>
            <p className="text-center text-muted-foreground">
              Detect layout shifts and other UI performance problems.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Sparkles className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">AI-Powered Insights</h3>
            <p className="text-center text-muted-foreground">
              Leverage AI to understand and fix complex performance issues.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}