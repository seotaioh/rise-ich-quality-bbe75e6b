import { DashboardHeader } from "@/components/quality/DashboardHeader";
import { DefectTrendChart } from "@/components/quality/DefectTrendChart";
import { DefectCategoryChart } from "@/components/quality/DefectCategoryChart";
import { ProcessFlowDiagram } from "@/components/quality/ProcessFlowDiagram";
import { RecentDefectsTable } from "@/components/quality/RecentDefectsTable";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <DashboardHeader />

      {/* Process Flow */}
      <ProcessFlowDiagram />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DefectTrendChart />
        <DefectCategoryChart />
      </div>

      {/* Recent Defects Table */}
      <RecentDefectsTable />
    </div>
  );
};

export default Dashboard;
