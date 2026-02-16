import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { BarChart3, Package } from "lucide-react";
import { useSubmissionStats, toDateStr, getMonthStart } from "@/hooks/useSubmissionStats";
import type { StatFilters } from "@/hooks/useSubmissionStats";
import { QueryPanel } from "@/components/quality/QueryPanel";
import type { QueryParams } from "@/components/quality/QueryPanel";
import { useModel } from "@/contexts/ModelContext";

const CHART_COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))",
  "#6366f1", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6",
];

const DefectAnalysis = () => {
  const { selectedModel } = useModel();
  const todayISO = toDateStr(new Date());

  // 조회 적용된 파라미터
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

  // 불량 유형 분포
  const defectTypePieData = Object.entries(stats.byDefectType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count], i) => ({
      name, count,
      percentage: stats.totalDefects > 0 ? +((count / stats.totalDefects) * 100).toFixed(1) : 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  // 부품별 TOP 불량
  const topParts = Object.entries(stats.byPart)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 10)
    .map(([part, data]) => ({
      part, defects: data.total,
      rate: stats.totalProduction > 0 ? +((data.total / stats.totalProduction) * 100).toFixed(1) : 0,
      types: data.types,
    }));

  // 불량 발생 내역
  const f = applied.filters;
  const recentDefects = stats.filtered
    .flatMap((s) =>
      s.defects
        .filter((d) => (!f.part || d.part === f.part) && (!f.defectType || d.defectType === f.defectType))
        .map((d) => ({ date: s.date, time: s.time, worker: s.workerName, process: s.process, part: d.part, defectType: d.defectType, count: d.count }))
    ).slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">불량 분석</h2>
          <p className="text-muted-foreground">기간별 불량 현황 및 트렌드 분석</p>
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
      ) : (
        <>
          {/* 요약 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
              <p className="text-sm text-muted-foreground">입력 건수</p>
              <p className="text-2xl font-bold text-foreground">{stats.submissionCount}건</p>
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
              <p className="text-sm text-muted-foreground">불량률</p>
              <p className="text-2xl font-bold text-foreground">{stats.defectRate.toFixed(1)}%</p>
            </Card>
          </div>

          {stats.totalDefects === 0 && stats.submissionCount === 0 ? (
            <Card className="p-12 shadow-[var(--shadow-soft)] border-border/50 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">선택한 조건에 해당하는 데이터가 없습니다.</p>
            </Card>
          ) : (
            <>
              {/* 차트 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stats.dailyTrend.length > 0 && (
                  <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                    <h3 className="text-lg font-semibold text-foreground mb-6">일별 불량 추이</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.dailyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="dateKR" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "11px" }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Legend />
                        <Line type="monotone" dataKey="production" stroke="hsl(var(--chart-1))" strokeWidth={2} name="생산량" dot={{ fill: "hsl(var(--chart-1))", r: 4 }} />
                        <Line type="monotone" dataKey="defects" stroke="hsl(var(--chart-4))" strokeWidth={2} name="불량건수" dot={{ fill: "hsl(var(--chart-4))", r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {defectTypePieData.length > 0 && (
                  <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                    <h3 className="text-lg font-semibold text-foreground mb-6">불량 유형 분포</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={defectTypePieData} cx="50%" cy="50%" labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage}%`} outerRadius={100} dataKey="count">
                          {defectTypePieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                )}
              </div>

              {/* 부품별 TOP 불량 */}
              {topParts.length > 0 && (
                <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                  <h3 className="text-lg font-semibold text-foreground mb-6">부품별 TOP 불량</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>순위</TableHead>
                        <TableHead>부품명</TableHead>
                        <TableHead>불량 유형</TableHead>
                        <TableHead className="text-right">불량건수</TableHead>
                        <TableHead className="text-right">불량률</TableHead>
                        <TableHead className="text-right">상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topParts.map((item, index) => (
                        <TableRow key={item.part}>
                          <TableCell>
                            <span className={`inline-block w-6 h-6 text-center rounded text-xs font-bold leading-6 ${
                              index === 0 ? "bg-destructive text-destructive-foreground" :
                              index === 1 ? "bg-orange-500 text-white" :
                              index === 2 ? "bg-yellow-500 text-white" : "bg-muted text-muted-foreground"
                            }`}>{index + 1}</span>
                          </TableCell>
                          <TableCell className="font-medium">{item.part}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {Object.entries(item.types).map(([t, c]) => `${t}(${c})`).join(", ")}
                          </TableCell>
                          <TableCell className="text-right font-semibold">{item.defects}건</TableCell>
                          <TableCell className="text-right">{item.rate}%</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={item.rate > 5 ? "destructive" : item.rate > 3 ? "secondary" : "default"}
                              className={item.rate > 5 ? "" : item.rate > 3 ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground"}>
                              {item.rate > 5 ? "주의" : item.rate > 3 ? "관리" : "양호"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}

              {/* 작업자별 불량 현황 */}
              {Object.keys(stats.byWorker).length > 0 && (
                <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                  <h3 className="text-lg font-semibold text-foreground mb-6">작업자별 불량 현황</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>작업자</TableHead>
                        <TableHead className="text-right">생산량</TableHead>
                        <TableHead className="text-right">불량수</TableHead>
                        <TableHead className="text-right">불량률</TableHead>
                        <TableHead className="text-right">상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(stats.byWorker).sort(([, a], [, b]) => b.defects - a.defects).map(([name, w]) => (
                        <TableRow key={name}>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell className="text-right">{w.production.toLocaleString()}개</TableCell>
                          <TableCell className="text-right font-semibold text-destructive">{w.defects}건</TableCell>
                          <TableCell className="text-right">{w.defectRate.toFixed(1)}%</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={w.defectRate > 5 ? "destructive" : w.defectRate > 3 ? "secondary" : "default"}
                              className={w.defectRate > 5 ? "" : w.defectRate > 3 ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground"}>
                              {w.defectRate > 5 ? "주의" : w.defectRate > 3 ? "관리" : "양호"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}

              {/* 불량 발생 내역 */}
              {recentDefects.length > 0 && (
                <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                  <h3 className="text-lg font-semibold text-foreground mb-6">불량 발생 내역</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>일자</TableHead><TableHead>시간</TableHead><TableHead>작업자</TableHead>
                          <TableHead>공정</TableHead><TableHead>불량 부품</TableHead><TableHead>불량 유형</TableHead>
                          <TableHead className="text-right">수량</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentDefects.map((d, i) => (
                          <TableRow key={i}>
                            <TableCell className="whitespace-nowrap">{d.date}</TableCell>
                            <TableCell>{d.time}</TableCell>
                            <TableCell>{d.worker}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-xs">{d.process}</Badge></TableCell>
                            <TableCell className="font-medium">{d.part}</TableCell>
                            <TableCell>{d.defectType}</TableCell>
                            <TableCell className="text-right font-semibold text-destructive">{d.count}개</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DefectAnalysis;
