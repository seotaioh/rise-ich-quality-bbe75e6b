import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Filter, RotateCcw, Search } from "lucide-react";
import {
  toDateStr, formatDateKR, shiftDate, getMonthStart, getWeekStart,
} from "@/hooks/useSubmissionStats";
import type { StatFilters } from "@/hooks/useSubmissionStats";

export interface QueryParams {
  startDate: string;
  endDate: string;
  filters: StatFilters;
}

interface QueryPanelProps {
  /** 사용 가능한 필터 옵션 (이전 조회 결과 기반) */
  availableProcesses?: string[];
  availableWorkers?: string[];
  availableParts?: string[];
  availableDefectTypes?: string[];
  /** 조회 버튼 클릭 시 */
  onQuery: (params: QueryParams) => void;
  /** 초기값 (기본: 이번 달) */
  defaultRange?: "today" | "week" | "month";
}

const selectCls =
  "h-9 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export const QueryPanel = ({
  availableProcesses = [],
  availableWorkers = [],
  availableParts = [],
  availableDefectTypes = [],
  onQuery,
  defaultRange = "month",
}: QueryPanelProps) => {
  const todayISO = toDateStr(new Date());

  const getDefaultStart = () => {
    switch (defaultRange) {
      case "today": return todayISO;
      case "week": return getWeekStart(todayISO);
      case "month": return getMonthStart(todayISO);
    }
  };

  const [startDate, setStartDate] = useState(getDefaultStart());
  const [endDate, setEndDate] = useState(todayISO);
  const [filters, setFilters] = useState<StatFilters>({ process: "", worker: "", part: "", defectType: "" });

  const hasFilter = !!(filters.process || filters.worker || filters.part || filters.defectType);

  const setPreset = (preset: "today" | "week" | "month") => {
    switch (preset) {
      case "today":
        setStartDate(todayISO);
        setEndDate(todayISO);
        break;
      case "week":
        setStartDate(getWeekStart(todayISO));
        setEndDate(todayISO);
        break;
      case "month":
        setStartDate(getMonthStart(todayISO));
        setEndDate(todayISO);
        break;
    }
  };

  const shiftRange = (days: number) => {
    setStartDate(shiftDate(startDate, days));
    setEndDate(shiftDate(endDate, days));
  };

  const isToday = startDate === todayISO && endDate === todayISO;
  const isWeek = startDate === getWeekStart(todayISO) && endDate === todayISO;
  const isMonth = startDate === getMonthStart(todayISO) && endDate === todayISO;

  const presetBtnCls = (active: boolean) =>
    `px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
    }`;

  const updateFilter = (key: keyof StatFilters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    setFilters({ process: "", worker: "", part: "", defectType: "" });
  };

  const resetAll = () => {
    setStartDate(getDefaultStart());
    setEndDate(todayISO);
    resetFilters();
  };

  const handleQuery = useCallback(() => {
    onQuery({ startDate, endDate, filters });
  }, [startDate, endDate, filters, onQuery]);

  return (
    <Card className="p-5 shadow-[var(--shadow-soft)] border-border/50 space-y-4">
      {/* 1행: 조회 기간 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">조회 기간</span>
          <div className="flex gap-1 ml-2">
            <button type="button" onClick={() => setPreset("today")} className={presetBtnCls(isToday)}>오늘</button>
            <button type="button" onClick={() => setPreset("week")} className={presetBtnCls(isWeek)}>이번 주</button>
            <button type="button" onClick={() => setPreset("month")} className={presetBtnCls(isMonth)}>이번 달</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shiftRange(-1)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input type="date" className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span className="text-muted-foreground text-sm">~</span>
          <input type="date" className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button type="button" onClick={() => shiftRange(1)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2행: 상세 필터 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">상세 필터</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">공정</label>
            <select className={`${selectCls} w-full`} value={filters.process || ""} onChange={(e) => updateFilter("process", e.target.value)}>
              <option value="">전체 공정</option>
              {availableProcesses.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">작업자</label>
            <select className={`${selectCls} w-full`} value={filters.worker || ""} onChange={(e) => updateFilter("worker", e.target.value)}>
              <option value="">전체 작업자</option>
              {availableWorkers.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">불량 부품</label>
            <select className={`${selectCls} w-full`} value={filters.part || ""} onChange={(e) => updateFilter("part", e.target.value)}>
              <option value="">전체 부품</option>
              {availableParts.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">불량 유형</label>
            <select className={`${selectCls} w-full`} value={filters.defectType || ""} onChange={(e) => updateFilter("defectType", e.target.value)}>
              <option value="">전체 유형</option>
              {availableDefectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 선택된 필터 태그 */}
      {hasFilter && (
        <div className="flex flex-wrap gap-1.5">
          {filters.process && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              공정: {filters.process}
              <button type="button" onClick={() => updateFilter("process", "")} className="hover:text-destructive">&times;</button>
            </span>
          )}
          {filters.worker && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
              작업자: {filters.worker}
              <button type="button" onClick={() => updateFilter("worker", "")} className="hover:text-destructive">&times;</button>
            </span>
          )}
          {filters.part && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 border border-orange-500/20">
              부품: {filters.part}
              <button type="button" onClick={() => updateFilter("part", "")} className="hover:text-destructive">&times;</button>
            </span>
          )}
          {filters.defectType && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20">
              유형: {filters.defectType}
              <button type="button" onClick={() => updateFilter("defectType", "")} className="hover:text-destructive">&times;</button>
            </span>
          )}
        </div>
      )}

      {/* 3행: 조회/초기화 버튼 + 기간 표시 */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          {startDate === endDate ? formatDateKR(startDate) : `${formatDateKR(startDate)} ~ ${formatDateKR(endDate)}`}
          {isToday && <span className="text-primary font-medium ml-1">(오늘)</span>}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={resetAll}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
            <RotateCcw className="h-3.5 w-3.5" /> 초기화
          </button>
          <Button onClick={handleQuery} size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 px-6">
            <Search className="h-4 w-4 mr-1.5" />
            조회
          </Button>
        </div>
      </div>
    </Card>
  );
};
