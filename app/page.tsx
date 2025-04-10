// app/page.tsx
import { MainLayout } from "@/components/layout/main-layout";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardFeatures } from "@/components/dashboard/dashboard-features";
import { DashboardCTA } from "@/components/dashboard/dashboard-cta";

export default function Home() {
  return (
    <MainLayout>
      <DashboardHero />
      <DashboardFeatures />
      <DashboardCTA />
    </MainLayout>
  );
}