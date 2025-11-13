import { DefectTrendChart } from "@/components/quality/DefectTrendChart";
import { DefectCategoryChart } from "@/components/quality/DefectCategoryChart";
import { TopDefectsTable } from "@/components/quality/TopDefectsTable";
import { RecentDefectsTable } from "@/components/quality/RecentDefectsTable";
import { BarChart3 } from "lucide-react";

const DefectAnalysis = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">불량 분석</h2>
          <p className="text-muted-foreground">공정별, 부품별 불량 현황 및 트렌드 분석</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DefectTrendChart />
        <DefectCategoryChart />
      </div>

      {/* Top Defects */}
      <TopDefectsTable />

      {/* Recent Defects */}
      <RecentDefectsTable />
    </div>
  );
};

export default DefectAnalysis;
