import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Settings, Package } from "lucide-react";
import { useSubmissionStats, toDateStr, getMonthStart } from "@/hooks/useSubmissionStats";
import type { StatFilters } from "@/hooks/useSubmissionStats";
import { QueryPanel } from "@/components/quality/QueryPanel";
import type { QueryParams } from "@/components/quality/QueryPanel";

const ProcessDefects = () => {
  const todayISO = toDateStr(new Date());
  const [applied, setApplied] = useState({
    startDate: getMonthStart(todayISO), endDate: todayISO,
    filters: { process: "", worker: "", part: "", defectType: "" } as StatFilters,
  });
  const [queried, setQueried] = useState(false);

  const stats = useSubmissionStats(applied.startDate, applied.endDate, applied.filters);

  const handleQuery = useCallback((params: QueryParams) => {
    setApplied(params);
    setQueried(true);
  }, []);

  // 공정별 카드 데이터
  const processCards = Object.entries(stats.byProcess)
    .sort(([, a], [, b]) => b.defects - a.defects)
    .map(([name, v]) => {
      const topDefect = Object.entries(v.defectDetails).sort(([, a], [, b]) => b - a)[0];
      return {
        name, production: v.production, defects: v.defects, defectRate: +v.defectRate.toFixed(1),
        topDefect: topDefect ? topDefect[0].split("-").pop() || "" : "-",
        defectDetails: v.defectDetails,
      };
    });

  const barData = processCards.map((p) => ({ name: p.name, 생산량: p.production, 불량건수: p.defects }));

  const topProcesses = processCards.slice(0, 5).map((p) => ({
    process: p.name,
    types: Object.entries(p.defectDetails).sort(([, a], [, b]) => b - a).slice(0, 5)
      .map(([key, count]) => { const parts = key.split("-"); return { name: `${parts[0]} · ${parts.slice(1).join("-")}`, count }; }),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">공정별 불량유형 분석</h2>
          <p className="text-muted-foreground">각 공정별 주요 불량 유형 및 발생 현황</p>
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
              <p className="text-sm text-muted-foreground">조회 공정수</p>
              <p className="text-2xl font-bold text-foreground">{Object.keys(stats.byProcess).length}개</p>
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

          {stats.submissionCount === 0 ? (
            <Card className="p-12 shadow-[var(--shadow-soft)] border-border/50 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">선택한 조건에 해당하는 데이터가 없습니다.</p>
            </Card>
          ) : (
            <>
              {/* 공정별 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {processCards.map((process) => (
                  <Card key={process.name} className="p-4 hover:shadow-lg transition-shadow border-border/50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{process.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">생산 {process.production}개</p>
                      </div>
                      <div className={`text-2xl font-bold ${process.defectRate > 3 ? "text-destructive" : process.defectRate > 2 ? "text-orange-500" : "text-green-500"}`}>
                        {process.defectRate}%
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">총 불량:</span>
                        <span className="font-medium text-foreground">{process.defects}건</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">주요 불량:</span>
                        <span className="font-medium text-foreground">{process.topDefect}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`h-2 rounded-full ${process.defectRate > 3 ? "bg-destructive" : process.defectRate > 2 ? "bg-orange-500" : "bg-green-500"}`}
                          style={{ width: `${Math.min(process.defectRate * 20, 100)}%` }} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* 차트 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {barData.length > 0 && (
                  <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                    <h3 className="text-lg font-semibold text-foreground mb-6">공정별 생산/불량 현황</h3>
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
                {topProcesses.length > 0 && (
                  <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                    <h3 className="text-lg font-semibold text-foreground mb-4">공정별 불량 유형 분포</h3>
                    <div className="space-y-4 max-h-[320px] overflow-y-auto">
                      {topProcesses.map((item) => (
                        <div key={item.process} className="border-l-4 border-primary pl-4">
                          <h4 className="font-medium text-foreground mb-2">{item.process}</h4>
                          <div className="space-y-1">
                            {item.types.map((type) => (
                              <div key={type.name} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{type.name}</span>
                                <Badge variant="secondary">{type.count}건</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* 상세 테이블 */}
              <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                <h3 className="text-lg font-semibold text-foreground mb-6">공정별 불량 상세</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>공정</TableHead>
                        <TableHead className="text-right">생산량</TableHead>
                        <TableHead className="text-right">불량수</TableHead>
                        <TableHead className="text-right">불량률</TableHead>
                        <TableHead>주요 불량 내용</TableHead>
                        <TableHead className="text-right">상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processCards.map((p) => (
                        <TableRow key={p.name}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-right">{p.production.toLocaleString()}개</TableCell>
                          <TableCell className="text-right font-semibold text-destructive">{p.defects}건</TableCell>
                          <TableCell className="text-right">{p.defectRate}%</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[300px]">
                            {Object.entries(p.defectDetails).sort(([, a], [, b]) => b - a).slice(0, 3)
                              .map(([key, count]) => `${key.split("-").slice(1).join("-")}(${count})`).join(", ")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={p.defectRate > 3 ? "destructive" : p.defectRate > 2 ? "secondary" : "default"}
                              className={p.defectRate > 3 ? "" : p.defectRate > 2 ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground"}>
                              {p.defectRate > 3 ? "주의" : p.defectRate > 2 ? "관리" : "양호"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
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

export default ProcessDefects;
