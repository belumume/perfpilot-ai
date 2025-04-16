// app/analyze/page.tsx
import { MainLayout } from "@/components/layout/main-layout";
import { AnalyzeHeader } from "@/components/analyze/analyze-header";
import { AnalyzeForm } from "@/components/analyze/analyze-form";

export default function AnalyzePage() {
  return (
    <MainLayout>
      <div className="py-10">
        <AnalyzeHeader />
        <AnalyzeForm />
      </div>
    </MainLayout>
  );
}