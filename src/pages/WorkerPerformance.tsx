import { WorkerPerformanceTable } from "@/components/quality/WorkerPerformanceTable";
import { Users } from "lucide-react";

const WorkerPerformance = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">작업자 실적 관리</h2>
          <p className="text-muted-foreground">작업자별 생산량 및 품질 실적 현황</p>
        </div>
      </div>

      <WorkerPerformanceTable />
    </div>
  );
};

export default WorkerPerformance;
