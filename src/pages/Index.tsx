import { DashboardHeader } from "@/components/quality/DashboardHeader";
import { DefectTrendChart } from "@/components/quality/DefectTrendChart";
import { DefectCategoryChart } from "@/components/quality/DefectCategoryChart";
import { TopDefectsTable } from "@/components/quality/TopDefectsTable";
import { ProcessFlowDiagram } from "@/components/quality/ProcessFlowDiagram";
import { DefectCodeGenerator } from "@/components/quality/DefectCodeGenerator";
import { RecentDefectsTable } from "@/components/quality/RecentDefectsTable";
import { WorkerPerformanceTable } from "@/components/quality/WorkerPerformanceTable";
import { Activity } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-[var(--shadow-soft)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ICH-3000 품질관리 시스템</h1>
              <p className="text-sm text-muted-foreground">Process Quality Management System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <DashboardHeader />

        {/* Process Flow */}
        <div className="mb-8">
          <ProcessFlowDiagram />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DefectTrendChart />
          <DefectCategoryChart />
        </div>

        {/* Defect Code Generator & Top Defects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <DefectCodeGenerator />
          </div>
          <div className="lg:col-span-2">
            <TopDefectsTable />
          </div>
        </div>

        {/* Recent Defects Table */}
        <div className="mb-8">
          <RecentDefectsTable />
        </div>

        {/* Worker Performance */}
        <div className="mb-8">
          <WorkerPerformanceTable />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-12">
        <div className="container mx-auto px-6 py-6">
          <p className="text-sm text-muted-foreground text-center">
            ICH-3000 Quality Management System © 2024 | 실시간 품질 모니터링 및 분석
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
