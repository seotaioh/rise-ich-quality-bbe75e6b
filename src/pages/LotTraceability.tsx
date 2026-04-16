import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, GitBranch, AlertTriangle, Factory, User } from "lucide-react";
import { QueryPanel } from "@/components/quality/QueryPanel";
import type { QueryParams } from "@/components/quality/QueryPanel";
import { useSubmissionStats, toDateStr, getMonthStart } from "@/hooks/useSubmissionStats";
import type { StatFilters } from "@/hooks/useSubmissionStats";
import { useModel } from "@/contexts/ModelContext";
import { parseTraceTags, stripTraceTags } from "@/lib/traceability";

const LotTraceability = () => {
  const { selectedModel } = useModel();
  const todayISO = toDateStr(new Date());

  const [applied, setApplied] = useState({
    startDate: getMonthStart(todayISO),
    endDate: todayISO,
    filters: { process: "", worker: "", part: "", defectType: "" } as StatFilters,
  });
  const [queried, setQueried] = useState(false);
  const [lotKeyword, setLotKeyword] = useState("");
  const [alertThreshold, setAlertThreshold] = useState(3);

  const stats = useSubmissionStats(applied.startDate, applied.endDate, applied.filters, selectedModel.id);

  const handleQuery = (params: QueryParams) => {
    setApplied(params);
    setQueried(true);
  };

  const normalizedKeyword = lotKeyword.trim().toLowerCase();
  const hasKeyword = normalizedKeyword.length > 0;
  const isThresholdValid = Number.isFinite(alertThreshold) && alertThreshold >= 0;

  const lotMatched = useMemo(() => {
    const base = [...stats.filtered].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    if (!normalizedKeyword) {
      return [];
    }

    return base.filter((row) => {
      const tags = parseTraceTags(row.memo);
      const resolvedLot = (row.lotNo || "").trim() || tags.lotNo;
      const target = `${resolvedLot} ${row.memo}`.toLowerCase();
      return target.includes(normalizedKeyword);
    });
  }, [stats.filtered, normalizedKeyword]);

  const lotSummary = useMemo(() => {
    const totalProduction = lotMatched.reduce((sum, s) => sum + s.productionQty, 0);
    const totalDefects = lotMatched.reduce((sum, s) => sum + (s.defects || []).reduce((dSum, d) => dSum + d.count, 0), 0);
    const defectRate = totalProduction > 0 ? (totalDefects / totalProduction) * 100 : 0;

    return { totalProduction, totalDefects, defectRate };
  }, [lotMatched]);

  const processAlerts = useMemo(() => {
    return Object.entries(stats.byProcess)
      .map(([name, v]) => ({ name, ...v }))
      .filter((item) => item.defectRate >= alertThreshold)
      .sort((a, b) => b.defectRate - a.defectRate);
  }, [stats.byProcess, alertThreshold]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GitBranch className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">LOT 추적 및 임계값 알림</h2>
          <p className="text-muted-foreground">LOT 기반 이력 추적과 공정 불량률 임계값 모니터링</p>
        </div>
      </div>

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
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">조회 후 LOT를 입력해 주세요.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50 lg:col-span-2">
              <label className="text-sm font-medium text-foreground mb-2 block">LOT 검색</label>
              <div className="flex gap-2">
                <Input
                  value={lotKeyword}
                  onChange={(e) => setLotKeyword(e.target.value)}
                  placeholder="예: C03-250224-S001-L01-001"
                  className="h-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLotKeyword("")}
                  disabled={!hasKeyword}
                  className="h-10"
                >
                  초기화
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">LOT 번호 일부만 입력해도 검색됩니다.</p>
            </Card>

            <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
              <label className="text-sm font-medium text-foreground mb-2 block">임계값 (%)</label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value) || 0)}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground mt-2">입력값 이상이면 경보로 표시됩니다.</p>
            </Card>
          </div>

          {(!hasKeyword || !isThresholdValid) && (
            <Card className="p-3 border border-warning/40 bg-warning/10">
              <p className="text-xs font-medium text-warning-foreground mb-2">조회 전 체크</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`px-2 py-1 rounded border ${hasKeyword ? "border-success/40 bg-success/10 text-success-foreground" : "border-warning/40 bg-warning/10 text-warning-foreground"}`}>
                  {hasKeyword ? "완료" : "필수"} · LOT 검색어
                </span>
                <span className={`px-2 py-1 rounded border ${isThresholdValid ? "border-success/40 bg-success/10 text-success-foreground" : "border-warning/40 bg-warning/10 text-warning-foreground"}`}>
                  {isThresholdValid ? "완료" : "필수"} · 임계값(0 이상)
                </span>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
              <p className="text-sm text-muted-foreground">LOT 일치 건수</p>
              <p className="text-2xl font-bold text-foreground">{lotMatched.length}건</p>
            </Card>
            <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
              <p className="text-sm text-muted-foreground">LOT 생산량</p>
              <p className="text-2xl font-bold text-primary">{lotSummary.totalProduction.toLocaleString()}개</p>
            </Card>
            <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
              <p className="text-sm text-muted-foreground">LOT 불량수</p>
              <p className="text-2xl font-bold text-destructive">{lotSummary.totalDefects}개</p>
            </Card>
            <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
              <p className="text-sm text-muted-foreground">LOT 불량률</p>
              <p className="text-2xl font-bold text-foreground">{lotSummary.defectRate.toFixed(1)}%</p>
            </Card>
          </div>

          <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> 공정 임계값 경보
            </h3>
            {processAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">현재 조건에서 임계값 초과 공정이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {processAlerts.map((alert) => (
                  <div key={alert.name} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-destructive" />
                      <span className="font-medium text-foreground">{alert.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-destructive">불량률 {alert.defectRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">불량 {alert.defects}건 / 생산 {alert.production}개</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">LOT 이력 타임라인</h3>
            {!hasKeyword ? (
              <p className="text-sm text-muted-foreground">LOT를 입력하면 이력이 표시됩니다.</p>
            ) : lotMatched.length === 0 ? (
              <p className="text-sm text-muted-foreground">일치하는 이력이 없습니다.</p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto">
                {lotMatched.map((row) => {
                  const tags = parseTraceTags(row.memo);
                  const resolvedLot = (row.lotNo || "").trim() || tags.lotNo;
                  const resolvedSupplier = (row.supplierName || "").trim() || tags.supplier;
                  const resolvedSupplierCode = (row.supplierCode || "").trim() || tags.supplierCode;
                  const resolvedPlace = (row.registrationPlace || "").trim() || tags.registrationPlace;
                  const resolvedPlaceCode = (row.registrationPlaceCode || "").trim() || tags.registrationPlaceCode;
                  const cleanMemo = stripTraceTags(row.memo);
                  const totalDefects = (row.defects || []).reduce((sum, d) => sum + d.count, 0);
                  const rowRate = row.productionQty > 0 ? (totalDefects / row.productionQty) * 100 : 0;

                  return (
                    <div key={row.id} className="p-3 rounded-lg border border-border/60 bg-muted/20">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{row.date}</Badge>
                          <Badge variant="secondary">{row.process}</Badge>
                          <Badge variant="outline" className="flex items-center gap-1"><User className="h-3 w-3" />{row.workerName}</Badge>
                          {resolvedLot && <Badge variant="outline">LOT {resolvedLot}</Badge>}
                          {resolvedSupplier && <Badge variant="outline">협력업체 {resolvedSupplier}{resolvedSupplierCode ? ` (${resolvedSupplierCode})` : ""}</Badge>}
                          {resolvedPlace && <Badge variant="outline">등록장소 {resolvedPlace}{resolvedPlaceCode ? ` (${resolvedPlaceCode})` : ""}</Badge>}
                        </div>
                        <Badge variant={rowRate >= alertThreshold ? "destructive" : "secondary"}>{rowRate.toFixed(1)}%</Badge>
                      </div>

                      <div className="text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-1">
                        <p>생산: <span className="text-foreground font-medium">{row.productionQty}개</span></p>
                        <p>불량: <span className="text-foreground font-medium">{totalDefects}개</span></p>
                      </div>

                      {(row.defects || []).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {(row.defects || []).map((d) => `${d.part}/${d.defectType}(${d.count})`).join(", ")}
                        </p>
                      )}

                      {cleanMemo && <p className="text-xs text-muted-foreground mt-2 whitespace-pre-line">{cleanMemo}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default LotTraceability;
