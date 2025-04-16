// app/page.tsx
import { MainLayout } from "@/components/layout/main-layout";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardFeatures } from "@/components/dashboard/dashboard-features";
import { DashboardCTA } from "@/components/dashboard/dashboard-cta";
import { Suspense } from "react";

// Enable Partial Prerendering for better initial load performance
export const experimental_ppr = true;

export default function Home() {
  return (
    <MainLayout>
      <DashboardHero />
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading features...</div>}>
        <DashboardFeatures />
      </Suspense>
      <Suspense fallback={<div className="h-96 w-full flex items-center justify-center">Loading content...</div>}>
        <DashboardCTA />
      </Suspense>
    </MainLayout>
  );
}