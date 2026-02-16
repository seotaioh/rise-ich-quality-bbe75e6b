import { Card } from "@/components/ui/card";
import { Filter, RotateCcw } from "lucide-react";
import type { StatFilters } from "@/hooks/useSubmissionStats";

interface StatFilterBarProps {
  filters: StatFilters;
  onChange: (filters: StatFilters) => void;
  availableProcesses: string[];
  availableWorkers: string[];
  availableParts: string[];
  availableDefectTypes: string[];
}

const selectCls =
  "h-9 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export const StatFilterBar = ({
  filters, onChange,
  availableProcesses, availableWorkers, availableParts, availableDefectTypes,
}: StatFilterBarProps) => {
  const hasFilter = !!(filters.process || filters.worker || filters.part || filters.defectType);

  const update = (key: keyof StatFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onChange({ process: "", worker: "", part: "", defectType: "" });
  };

  return (
    <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">상세 필터</span>
        {hasFilter && (
          <button type="button" onClick={resetFilters}
            className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline">
            <RotateCcw className="h-3 w-3" /> 필터 초기화
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 공정 */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1">공정</label>
          <select className={`${selectCls} w-full`} value={filters.process || ""}
            onChange={(e) => update("process", e.target.value)}>
            <option value="">전체 공정</option>
            {availableProcesses.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* 작업자 */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1">작업자</label>
          <select className={`${selectCls} w-full`} value={filters.worker || ""}
            onChange={(e) => update("worker", e.target.value)}>
            <option value="">전체 작업자</option>
            {availableWorkers.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        {/* 불량 부품 */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1">불량 부품</label>
          <select className={`${selectCls} w-full`} value={filters.part || ""}
            onChange={(e) => update("part", e.target.value)}>
            <option value="">전체 부품</option>
            {availableParts.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* 불량 유형 */}
        <div>
          <label className="block text-xs text-muted-foreground mb-1">불량 유형</label>
          <select className={`${selectCls} w-full`} value={filters.defectType || ""}
            onChange={(e) => update("defectType", e.target.value)}>
            <option value="">전체 유형</option>
            {availableDefectTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {hasFilter && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {filters.process && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              공정: {filters.process}
              <button type="button" onClick={() => update("process", "")} className="hover:text-destructive">&times;</button>
            </span>
          )}
          {filters.worker && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
              작업자: {filters.worker}
              <button type="button" onClick={() => update("worker", "")} className="hover:text-destructive">&times;</button>
            </span>
          )}
          {filters.part && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 border border-orange-500/20">
              부품: {filters.part}
              <button type="button" onClick={() => update("part", "")} className="hover:text-destructive">&times;</button>
            </span>
          )}
          {filters.defectType && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20">
              유형: {filters.defectType}
              <button type="button" onClick={() => update("defectType", "")} className="hover:text-destructive">&times;</button>
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
