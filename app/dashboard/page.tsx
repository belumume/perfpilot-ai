import DashboardView from "@/components/dashboard/dashboard-view";

export const metadata = {
  title: "Dashboard - PerfPilot AI",
  description: "Track your Next.js performance improvements over time"
};

export default function DashboardPage() {
  return (
    <main className="container py-10">
      <DashboardView />
    </main>
  );
} 