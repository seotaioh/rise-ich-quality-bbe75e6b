import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingDown, AlertTriangle, CheckCircle, Package, Users } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { useSubmissionStats, toDateStr } from "@/hooks/useSubmissionStats";
import type { StatFilters } from "@/hooks/useSubmissionStats";
import { QueryPanel } from "@/components/quality/QueryPanel";
import type { QueryParams } from "@/components/quality/QueryPanel";
import { ProcessFlowDiagram } from "@/components/quality/ProcessFlowDiagram";
import { useModel } from "@/contexts/ModelContext";

const CHART_COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))",
  "#6366f1", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6",
];

const Dashboard = () => {
  const { selectedModel } = useModel();
  const todayISO = toDateStr(new Date());
  const [applied, setApplied] = useState({
    startDate: todayISO, endDate: todayISO,
    filters: { process: "", worker: "", part: "", defectType: "" } as StatFilters,
  });
  const [queried, setQueried] = useState(false);

  const stats = useSubmissionStats(applied.startDate, applied.endDate, applied.filters, selectedModel.id);

  const handleQuery = useCallback((params: QueryParams) => {
    setApplied(params);
    setQueried(true);
  }, []);

  const qualityRate = stats.totalProduction > 0 ? 100 - stats.defectRate : 100;

  const defectTypePieData = Object.entries(stats.byDefectType)
    .sort(([, a], [, b]) => b - a).slice(0, 8)
    .map(([name, count], i) => ({
      name, count,
      percentage: stats.totalDefects > 0 ? +((count / stats.totalDefects) * 100).toFixed(1) : 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  const processBarData = Object.entries(stats.byProcess)
    .sort(([, a], [, b]) => b.defects - a.defects)
    .map(([name, v]) => ({ name, production: v.production, defects: v.defects }));

  const workerData = Object.entries(stats.byWorker)
    .sort(([, a], [, b]) => b.production - a.production)
    .map(([name, v]) => ({ name, production: v.production, defects: v.defects, defectRate: +v.defectRate.toFixed(1) }));

  const topParts = Object.entries(stats.byPart).sort(([, a], [, b]) => b.total - a.total).slice(0, 5);

  return (
    <div className="space-y-6">
      <QueryPanel
        onQuery={handleQuery} defaultRange="today"
        availableProcesses={stats.availableProcesses} availableWorkers={stats.availableWorkers}
        availableParts={stats.availableParts} availableDefectTypes={stats.availableDefectTypes}
      />

      {!queried ? (
        <>
          <ProcessFlowDiagram />
          <Card className="p-12 shadow-[var(--shadow-soft)] border-border/50 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">조회 조건을 설정한 후</p>
            <p className="text-lg font-medium text-primary">조회 버튼을 클릭하세요.</p>
          </Card>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-medium)] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">총 생산량</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalProduction.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stats.submissionCount}건 입력</p>
                </div>
                <div className="p-3 rounded-lg bg-primary"><Activity className="h-6 w-6 text-primary-foreground" /></div>
              </div>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-medium)] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">불량률</p>
                  <p className="text-3xl font-bold text-foreground">{stats.defectRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground mt-1">총 {stats.totalDefects}건 불량</p>
                </div>
                <div className="p-3 rounded-lg bg-success"><TrendingDown className="h-6 w-6 text-success-foreground" /></div>
              </div>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-medium)] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">발생 불량</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalDefects}</p>
                  <p className="text-sm text-muted-foreground mt-1">{Object.keys(stats.byDefectType).length}가지 유형</p>
                </div>
                <div className="p-3 rounded-lg bg-warning"><AlertTriangle className="h-6 w-6 text-warning-foreground" /></div>
              </div>
            </Card>
            <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50 hover:shadow-[var(--shadow-medium)] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">품질 달성률</p>
                  <p className="text-3xl font-bold text-foreground">{qualityRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground mt-1">목표: 95%</p>
                </div>
                <div className="p-3 rounded-lg bg-accent"><CheckCircle className="h-6 w-6 text-accent-foreground" /></div>
              </div>
            </Card>
          </div>

          <ProcessFlowDiagram />

          {stats.submissionCount === 0 ? (
            <Card className="p-12 shadow-[var(--shadow-soft)] border-border/50 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">선택한 조건에 해당하는 데이터가 없습니다.</p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stats.dailyTrend.length > 1 && (
                  <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                    <h3 className="text-lg font-semibold text-foreground mb-6">일별 생산/불량 추이</h3>
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

              {processBarData.length > 0 && (
                <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                  <h3 className="text-lg font-semibold text-foreground mb-6">공정별 생산/불량 현황</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={processBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                      <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Legend />
                      <Bar dataKey="production" fill="hsl(var(--chart-1))" name="생산량" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="defects" fill="hsl(var(--chart-4))" name="불량건수" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {topParts.length > 0 && (
                  <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                    <h3 className="text-lg font-semibold text-foreground mb-4">부품별 TOP 불량</h3>
                    <div className="space-y-3">
                      {topParts.map(([part, data], i) => (
                        <div key={part} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                              i === 0 ? "bg-destructive text-destructive-foreground" : i === 1 ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                            }`}>{i + 1}</span>
                            <div>
                              <p className="font-medium text-foreground text-sm">{part}</p>
                              <p className="text-xs text-muted-foreground">{Object.entries(data.types).map(([t, c]) => `${t}(${c})`).join(", ")}</p>
                            </div>
                          </div>
                          <Badge variant="destructive">{data.total}건</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                {workerData.length > 0 && (
                  <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" /> 작업자별 실적
                    </h3>
                    <div className="space-y-3">
                      {workerData.map((w) => (
                        <div key={w.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div>
                            <p className="font-medium text-foreground text-sm">{w.name}</p>
                            <p className="text-xs text-muted-foreground">불량률 {w.defectRate}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-primary">{w.production}개</p>
                            {w.defects > 0 && <p className="text-xs text-destructive">불량 {w.defects}건</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
