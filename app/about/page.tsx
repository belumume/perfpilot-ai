// app/about/page.tsx
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Gauge, Zap, Brain, Github } from 'lucide-react';

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container py-10 space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">About PerfPilot AI</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            PerfPilot AI is an intelligent co-pilot for Next.js developers, helping you optimize your applications for better performance and user experience.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Gauge className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Performance Analysis</h3>
                <p className="text-muted-foreground">
                  Automatically detect common performance issues in your Next.js code, including image optimization, font loading, and more.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Brain className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">AI-Powered Recommendations</h3>
                <p className="text-muted-foreground">
                  Get personalized recommendations from advanced AI models to improve your application's performance.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Zap className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Code Examples</h3>
                <p className="text-muted-foreground">
                  See concrete code examples for implementing the recommended optimizations in your Next.js application.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-bold">Upload or Paste Code</h3>
              <p className="text-muted-foreground">
                Upload your Next.js files or paste your code directly into PerfPilot AI.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-bold">Analyze Performance</h3>
              <p className="text-muted-foreground">
                Our engine analyzes your code for common Next.js performance issues and best practices.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-bold">Get Recommendations</h3>
              <p className="text-muted-foreground">
                Receive AI-powered recommendations and code examples to optimize your application.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to optimize your Next.js app?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Try PerfPilot AI now and see how you can improve your application's performance.
          </p>
          <Link href="/analyze">
            <Button size="lg" className="mt-4">
              Start Analyzing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            Built for the Next.js Global Hackathon 2025 by{' '}
            <a 
              href="https://github.com/belumume/perfpilot-ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:underline"
            >
              <Github className="mr-1 h-3 w-3" />
              belumume
            </a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}