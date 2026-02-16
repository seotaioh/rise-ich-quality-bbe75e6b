import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Users, Package } from "lucide-react";
import { useSubmissionStats, toDateStr, getMonthStart } from "@/hooks/useSubmissionStats";
import type { StatFilters } from "@/hooks/useSubmissionStats";
import { QueryPanel } from "@/components/quality/QueryPanel";
import type { QueryParams } from "@/components/quality/QueryPanel";
import { WorkerPerformanceTable } from "@/components/quality/WorkerPerformanceTable";
import { useModel } from "@/contexts/ModelContext";

const WorkerPerformance = () => {
  const { selectedModel } = useModel();
  const todayISO = toDateStr(new Date());

  const [applied, setApplied] = useState({
    startDate: getMonthStart(todayISO),
    endDate: todayISO,
    filters: { process: "", worker: "", part: "", defectType: "" } as StatFilters,
  });
  const [queried, setQueried] = useState(false);

  const stats = useSubmissionStats(applied.startDate, applied.endDate, applied.filters, selectedModel.id);

  const handleQuery = useCallback((params: QueryParams) => {
    setApplied(params);
    setQueried(true);
  }, []);

  // 작업자별 실적 데이터 가공
  const workerData = Object.entries(stats.byWorker)
    .map(([name, w]) => {
      const defectRate = w.defectRate;
      const score = Math.max(0, +(100 - defectRate).toFixed(1));
      return {
        name,
        produced: w.production,
        defects: w.defects,
        defectRate: +defectRate.toFixed(1),
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">작업자 실적 관리</h2>
          <p className="text-muted-foreground">작업자별 생산량 및 품질 실적 현황</p>
        </div>
      </div>

      {/* 조회 패널 */}
      <QueryPanel
        onQuery={handleQuery}
        defaultRange="month"
        availableProcesses={stats.availableProcesses}
        availableWorkers={stats.availableWorkers}
        availableParts={stats.availableParts}
        availableDefectTypes={stats.availableDefectTypes}
      />

      {!queried ? (
        <Card className="p-12 shadow-[var(--shadow-soft)] border-border/50 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">조회 조건을 설정한 후</p>
          <p className="text-lg font-medium text-primary">조회 버튼을 클릭하세요.</p>
        </Card>
      ) : workerData.length === 0 ? (
        <Card className="p-12 shadow-[var(--shadow-soft)] border-border/50 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">선택한 조건에 해당하는 데이터가 없습니다.</p>
        </Card>
      ) : (
        <>
          {/* 요약 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
              <p className="text-sm text-muted-foreground">작업자 수</p>
              <p className="text-2xl font-bold text-foreground">{workerData.length}명</p>
            </Card>
            <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
              <p className="text-sm text-muted-foreground">총 생산량</p>
              <p className="text-2xl font-bold text-primary">{stats.totalProduction.toLocaleString()}개</p>
            </Card>
            <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
              <p className="text-sm text-muted-foreground">총 불량수</p>
              <p className="text-2xl font-bold text-destructive">{stats.totalDefects}개</p>
            </Card>
            <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
              <p className="text-sm text-muted-foreground">평균 불량률</p>
              <p className="text-2xl font-bold text-foreground">{stats.defectRate.toFixed(1)}%</p>
            </Card>
          </div>

          <WorkerPerformanceTable data={workerData} />
        </>
      )}
    </div>
  );
};

export default WorkerPerformance;
