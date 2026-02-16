import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { UserCheck, Package } from "lucide-react";
import { useSubmissionStats, toDateStr, getMonthStart } from "@/hooks/useSubmissionStats";
import type { StatFilters } from "@/hooks/useSubmissionStats";
import { QueryPanel } from "@/components/quality/QueryPanel";
import type { QueryParams } from "@/components/quality/QueryPanel";
import { useModel } from "@/contexts/ModelContext";

const WorkerDefects = () => {
  const { selectedModel } = useModel();
  const todayISO = toDateStr(new Date());
  const [applied, setApplied] = useState({
    startDate: getMonthStart(todayISO), endDate: todayISO,
    filters: { process: "", worker: "", part: "", defectType: "" } as StatFilters,
  });
  const [queried, setQueried] = useState(false);

  const stats = useSubmissionStats(applied.startDate, applied.endDate, applied.filters, selectedModel.id);

  const handleQuery = useCallback((params: QueryParams) => {
    setApplied(params);
    setQueried(true);
  }, []);

  // 작업자별 카드 데이터
  const workerCards = Object.entries(stats.byWorker)
    .sort(([, a], [, b]) => b.defects - a.defects)
    .map(([name, v]) => ({ name, production: v.production, defects: v.defects, defectRate: +v.defectRate.toFixed(1) }));

  // 작업자별 상세 불량 (submission에서 추출)
  const workerDefectDetails: Record<string, Record<string, number>> = {};
  stats.filtered.forEach((s) => {
    const f = applied.filters;
    const defects = s.defects
      .filter((d) => (!f.part || d.part === f.part) && (!f.defectType || d.defectType === f.defectType));
    defects.forEach((d) => {
      if (!workerDefectDetails[s.workerName]) workerDefectDetails[s.workerName] = {};
      const key = `${d.part}-${d.defectType}`;
      workerDefectDetails[s.workerName][key] = (workerDefectDetails[s.workerName][key] || 0) + d.count;
    });
  });

  // 바차트 데이터
  const barData = workerCards.map((w) => ({ name: w.name, 생산량: w.production, 불량건수: w.defects }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCheck className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">작업자별 불량유형 분석</h2>
          <p className="text-muted-foreground">작업자별 주요 불량 패턴 및 개선 포인트</p>
        </div>
      </div>

      <QueryPanel
        onQuery={handleQuery} defaultRange="month"
        availableProcesses={stats.availableProcesses} availableWorkers={stats.availableWorkers}
        availableParts={stats.availableParts} availableDefectTypes={stats.availableDefectTypes}
      />

      {!queried ? (
        <Card className="p-12 shadow-[var(--shadow-soft)] border-border/50 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">조회 조건을 설정한 후</p>
          <p className="text-lg font-medium text-primary">조회 버튼을 클릭하세요.</p>
        </Card>
      ) : (
        <>
          {/* 요약 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
              <p className="text-sm text-muted-foreground">조회 작업자수</p>
              <p className="text-2xl font-bold text-foreground">{workerCards.length}명</p>
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
              <p className="text-sm text-muted-foreground">전체 불량률</p>
              <p className="text-2xl font-bold text-foreground">{stats.defectRate.toFixed(1)}%</p>
            </Card>
          </div>

          {workerCards.length === 0 ? (
            <Card className="p-12 shadow-[var(--shadow-soft)] border-border/50 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">선택한 조건에 해당하는 데이터가 없습니다.</p>
            </Card>
          ) : (
            <>
              {/* 작업자별 카드 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {workerCards.map((worker) => {
                  const details = workerDefectDetails[worker.name] || {};
                  const topDefects = Object.entries(details)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3);
                  const totalWorkerDefects = Object.values(details).reduce((s, c) => s + c, 0);

                  return (
                    <Card key={worker.name} className="p-6 shadow-[var(--shadow-soft)] border-border/50 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{worker.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">생산 {worker.production.toLocaleString()}개</p>
                        </div>
                        <div className={`text-2xl font-bold ${worker.defectRate > 3 ? "text-destructive" : worker.defectRate > 2 ? "text-orange-500" : "text-green-500"}`}>
                          {worker.defectRate}%
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">총 불량:</span>
                          <span className="font-medium text-destructive">{worker.defects}건</span>
                        </div>
                      </div>

                      {topDefects.length > 0 && (
                        <div className="border-t border-border pt-4">
                          <h4 className="text-sm font-medium text-foreground mb-3">주요 불량 유형</h4>
                          <div className="space-y-2">
                            {topDefects.map(([key, count], idx) => {
                              const percent = totalWorkerDefects > 0 ? +((count / totalWorkerDefects) * 100).toFixed(1) : 0;
                              const parts = key.split("-");
                              const label = parts.length > 1 ? `${parts[0]} · ${parts.slice(1).join("-")}` : key;
                              return (
                                <div key={key}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground truncate mr-2">{label}</span>
                                    <div className="flex gap-2 flex-shrink-0">
                                      <Badge variant="secondary" className="text-xs">{count}건</Badge>
                                      <span className="text-xs text-muted-foreground w-10 text-right">{percent}%</span>
                                    </div>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${idx === 0 ? "bg-destructive" : idx === 1 ? "bg-orange-500" : "bg-yellow-500"}`}
                                      style={{ width: `${percent}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* 바차트 */}
              {barData.length > 0 && (
                <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                  <h3 className="text-lg font-semibold text-foreground mb-6">작업자별 생산/불량 현황</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Legend />
                      <Bar dataKey="생산량" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="불량건수" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* 상세 테이블 */}
              <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-6">작업자별 불량 상세 분석</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>작업자</TableHead>
                        <TableHead className="text-right">생산량</TableHead>
                        <TableHead className="text-right">불량 건수</TableHead>
                        <TableHead className="text-right">불량률</TableHead>
                        <TableHead>주요 불량 내용</TableHead>
                        <TableHead className="text-right">개선 필요도</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workerCards.map((w) => {
                        const details = workerDefectDetails[w.name] || {};
                        const topItems = Object.entries(details).sort(([, a], [, b]) => b - a).slice(0, 3);
                        return (
                          <TableRow key={w.name}>
                            <TableCell className="font-medium">{w.name}</TableCell>
                            <TableCell className="text-right">{w.production.toLocaleString()}개</TableCell>
                            <TableCell className="text-right font-semibold text-destructive">{w.defects}건</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={w.defectRate > 3 ? "destructive" : w.defectRate > 2 ? "default" : "secondary"}>
                                {w.defectRate}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[300px]">
                              {topItems.map(([key, count]) => {
                                const p = key.split("-");
                                return `${p.slice(1).join("-")}(${count})`;
                              }).join(", ")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={w.defectRate > 3 ? "destructive" : "secondary"}>
                                {w.defectRate > 3 ? "높음" : w.defectRate > 2 ? "중간" : "낮음"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default WorkerDefects;
