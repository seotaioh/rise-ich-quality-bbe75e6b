import { useState, useEffect, useMemo } from "react";

// ── 타입 ──
export interface DefectEntry {
  part: string;
  defectType: string;
  count: number;
}

export interface WorkerSubmission {
  id: number;
  workerName: string;
  workerCode: string;
  date: string; // YYYY-MM-DD
  time: string;
  process: string;
  productionQty: number;
  tasks: string[];
  defects: DefectEntry[];
  memo: string;
  model?: string;
}

export interface StatFilters {
  process?: string;    // "" = 전체
  worker?: string;     // "" = 전체
  part?: string;       // "" = 전체
  defectType?: string; // "" = 전체
}

const STORAGE_KEY = "ich-quality-worker-submissions-v2";

function normalizeDate(dateStr: string): string {
  const match = dateStr.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
  if (match) {
    return `${match[1]}-${String(parseInt(match[2])).padStart(2, "0")}-${String(parseInt(match[3])).padStart(2, "0")}`;
  }
  return dateStr;
}

// ── 날짜 유틸 ──
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateKR(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}

export function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

export function getMonthStart(dateStr: string): string {
  const d = new Date(dateStr);
  return toDateStr(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return toDateStr(d);
}

// ── 통계 결과 타입 ──
export interface SubmissionStats {
  submissions: WorkerSubmission[];
  filtered: WorkerSubmission[];
  totalProduction: number;
  totalDefects: number;
  defectRate: number;
  submissionCount: number;
  byProcess: Record<string, { production: number; defects: number; defectRate: number; defectDetails: Record<string, number> }>;
  byPart: Record<string, { total: number; types: Record<string, number> }>;
  byDefectType: Record<string, number>;
  byWorker: Record<string, { production: number; defects: number; defectRate: number }>;
  dailyTrend: { date: string; dateKR: string; production: number; defects: number; defectRate: number }[];
  // 필터 옵션용: 날짜 범위 내 존재하는 고유값들
  availableProcesses: string[];
  availableWorkers: string[];
  availableParts: string[];
  availableDefectTypes: string[];
}

// 내부: localStorage에서 submissions 로드
function useRawSubmissions() {
  const [submissions, setSubmissions] = useState<WorkerSubmission[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data: WorkerSubmission[] = JSON.parse(raw);
          setSubmissions(data.map((s) => ({ ...s, date: normalizeDate(s.date) })));
        }
      } catch {}
    };

    load();
    window.addEventListener("storage", load);
    const interval = setInterval(load, 2000);
    return () => {
      window.removeEventListener("storage", load);
      clearInterval(interval);
    };
  }, []);

  return submissions;
}

export function useSubmissionStats(
  startDate: string,
  endDate: string,
  filters?: StatFilters,
  model?: string,
): SubmissionStats {
  const submissions = useRawSubmissions();

  const filterProcess = filters?.process || "";
  const filterWorker = filters?.worker || "";
  const filterPart = filters?.part || "";
  const filterDefectType = filters?.defectType || "";

  return useMemo(() => {
    // 0단계: 모델 필터
    let modelFiltered = submissions;
    if (model) {
      modelFiltered = submissions.filter((s) => (s.model || "ICH-3000") === model);
    }

    // 1단계: 날짜 필터
    const dateFiltered = modelFiltered.filter((s) => s.date >= startDate && s.date <= endDate);

    // 필터 옵션용 고유값 수집 (날짜 범위 내 전체 데이터 기준)
    const processSet = new Set<string>();
    const workerSet = new Set<string>();
    const partSet = new Set<string>();
    const defectTypeSet = new Set<string>();
    dateFiltered.forEach((s) => {
      processSet.add(s.process);
      workerSet.add(s.workerName);
      (s.defects || []).forEach((d) => {
        partSet.add(d.part);
        defectTypeSet.add(d.defectType);
      });
    });

    // 2단계: 공정/작업자 필터
    let filtered = dateFiltered;
    if (filterProcess) {
      filtered = filtered.filter((s) => s.process === filterProcess);
    }
    if (filterWorker) {
      filtered = filtered.filter((s) => s.workerName === filterWorker);
    }

    // 3단계: 부품/불량유형 필터 - submission 레벨이 아니라 defect 레벨 필터링
    // 불량 관련 통계 계산 시 해당 필터 적용
    const filterDefects = (defects: DefectEntry[] | undefined) => {
      let result = defects || [];
      if (filterPart) {
        result = result.filter((d) => d.part === filterPart);
      }
      if (filterDefectType) {
        result = result.filter((d) => d.defectType === filterDefectType);
      }
      return result;
    };

    const totalProduction = filtered.reduce((sum, s) => sum + s.productionQty, 0);
    const totalDefects = filtered.reduce(
      (sum, s) => sum + filterDefects(s.defects).reduce((ds, d) => ds + d.count, 0), 0
    );
    const defectRate = totalProduction > 0 ? (totalDefects / totalProduction) * 100 : 0;

    // 공정별
    const byProcess: SubmissionStats["byProcess"] = {};
    filtered.forEach((s) => {
      if (!byProcess[s.process]) {
        byProcess[s.process] = { production: 0, defects: 0, defectRate: 0, defectDetails: {} };
      }
      byProcess[s.process].production += s.productionQty;
      filterDefects(s.defects).forEach((d) => {
        byProcess[s.process].defects += d.count;
        const key = `${d.part}-${d.defectType}`;
        byProcess[s.process].defectDetails[key] = (byProcess[s.process].defectDetails[key] || 0) + d.count;
      });
    });
    Object.values(byProcess).forEach((v) => {
      v.defectRate = v.production > 0 ? (v.defects / v.production) * 100 : 0;
    });

    // 부품별
    const byPart: SubmissionStats["byPart"] = {};
    filtered.forEach((s) => {
      filterDefects(s.defects).forEach((d) => {
        if (!byPart[d.part]) byPart[d.part] = { total: 0, types: {} };
        byPart[d.part].total += d.count;
        byPart[d.part].types[d.defectType] = (byPart[d.part].types[d.defectType] || 0) + d.count;
      });
    });

    // 불량유형별
    const byDefectType: Record<string, number> = {};
    filtered.forEach((s) => {
      filterDefects(s.defects).forEach((d) => {
        byDefectType[d.defectType] = (byDefectType[d.defectType] || 0) + d.count;
      });
    });

    // 작업자별
    const byWorker: SubmissionStats["byWorker"] = {};
    filtered.forEach((s) => {
      if (!byWorker[s.workerName]) byWorker[s.workerName] = { production: 0, defects: 0, defectRate: 0 };
      byWorker[s.workerName].production += s.productionQty;
      filterDefects(s.defects).forEach((d) => {
        byWorker[s.workerName].defects += d.count;
      });
    });
    Object.values(byWorker).forEach((v) => {
      v.defectRate = v.production > 0 ? (v.defects / v.production) * 100 : 0;
    });

    // 일별 추이
    const dailyMap: Record<string, { production: number; defects: number }> = {};
    filtered.forEach((s) => {
      if (!dailyMap[s.date]) dailyMap[s.date] = { production: 0, defects: 0 };
      dailyMap[s.date].production += s.productionQty;
      filterDefects(s.defects).forEach((d) => {
        dailyMap[s.date].defects += d.count;
      });
    });
    const dailyTrend = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        dateKR: formatDateKR(date),
        production: v.production,
        defects: v.defects,
        defectRate: v.production > 0 ? +((v.defects / v.production) * 100).toFixed(1) : 0,
      }));

    return {
      submissions: modelFiltered,
      filtered,
      totalProduction,
      totalDefects,
      defectRate,
      submissionCount: filtered.length,
      byProcess,
      byPart,
      byDefectType,
      byWorker,
      dailyTrend,
      availableProcesses: [...processSet].sort(),
      availableWorkers: [...workerSet].sort(),
      availableParts: [...partSet].sort(),
      availableDefectTypes: [...defectTypeSet].sort(),
    };
  }, [submissions, startDate, endDate, filterProcess, filterWorker, filterPart, filterDefectType, model]);
}
