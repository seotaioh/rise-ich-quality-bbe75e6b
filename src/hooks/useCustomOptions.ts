import { useState, useEffect, useCallback } from "react";

export interface OptionItem {
  name: string;
  code: string;
}

interface StoredOptions {
  processes: OptionItem[];
  parts: OptionItem[];
  defectCauses: OptionItem[];
  workers: OptionItem[];
}

// 기본 공정 목록
const DEFAULT_PROCESSES: OptionItem[] = [
  { name: "1공정", code: "A" },
  { name: "2공정", code: "A" },
  { name: "3공정", code: "A" },
  { name: "4공정", code: "A" },
  { name: "5공정", code: "A" },
  { name: "조립", code: "A" },
  { name: "공정검사", code: "B" },
  { name: "에이징", code: "B" },
  { name: "물제거", code: "C" },
  { name: "리크검사", code: "C" },
  { name: "제품검사", code: "C" },
  { name: "출하검사", code: "D" },
  { name: "고객", code: "E" },
];

// 기본 부품 목록
const DEFAULT_PARTS: OptionItem[] = [
  { name: "전면케이스", code: "101" },
  { name: "출수코크", code: "102" },
  { name: "출수부 커버", code: "103" },
  { name: "출수부", code: "102" },
  { name: "메인PCB", code: "201" },
  { name: "메인 PCB", code: "201" },
  { name: "파워PCB", code: "202" },
  { name: "파워 PCB", code: "202" },
  { name: "EMI 콤프", code: "203" },
  { name: "EMI 콤프 PCB", code: "203" },
  { name: "SMPS", code: "204" },
  { name: "SMP", code: "204" },
  { name: "전해조", code: "301" },
  { name: "UV 모듈 서브체", code: "302" },
  { name: "UV 모듈", code: "302" },
  { name: "1차 유량센서", code: "401" },
  { name: "2차 유량센서", code: "402" },
  { name: "솔밸브-온수", code: "501" },
  { name: "솔밸브 온수", code: "501" },
  { name: "솔밸브-입수", code: "502" },
  { name: "솔밸브 입수", code: "502" },
  { name: "솔밸브-정수", code: "503" },
  { name: "솔밸브 정수", code: "503" },
  { name: "솔밸브", code: "501" },
  { name: "전해조P하네스", code: "601" },
  { name: "전해조P 하네스", code: "601" },
  { name: "전해조 하네스", code: "601" },
  { name: "온수하네스", code: "602" },
  { name: "온수 하네스", code: "602" },
  { name: "메인-SMPS하네스", code: "603" },
  { name: "SMPS 하네스", code: "603" },
  { name: "EMI-콤프 PCB 하네스", code: "604" },
  { name: "EMI 하네스", code: "604" },
  { name: "필터", code: "701" },
  { name: "냉수통 튜브", code: "801" },
  { name: "냉수통", code: "802" },
  { name: "냉수통 입수 휘팅", code: "802" },
  { name: "냉수통 휘팅", code: "802" },
  { name: "입수부 휘팅", code: "803" },
  { name: "입수부", code: "803" },
  { name: "출수부 휘팅", code: "804" },
  { name: "나사", code: "805" },
  { name: "나사류", code: "805" },
];

// 기본 불량원인 목록
const DEFAULT_DEFECT_CAUSES: OptionItem[] = [
  { name: "조립불량", code: "DC01" },
  { name: "자재불량", code: "DC02" },
  { name: "기능불량", code: "DC03" },
];

// 기본 작업자 목록
const DEFAULT_WORKERS: OptionItem[] = [
  { name: "김철수", code: "W001" },
  { name: "이영희", code: "W002" },
  { name: "박민수", code: "W003" },
  { name: "정수진", code: "W004" },
  { name: "최동욱", code: "W005" },
  { name: "강지훈", code: "W006" },
  { name: "윤서연", code: "W007" },
  { name: "임재현", code: "W008" },
  { name: "한미경", code: "W009" },
  { name: "신동혁", code: "W010" },
];

const STORAGE_KEY = "ich-quality-custom-options-v2";

function loadFromStorage(): StoredOptions | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveToStorage(options: StoredOptions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
}

export function useCustomOptions() {
  const [processes, setProcesses] = useState<OptionItem[]>(DEFAULT_PROCESSES);
  const [parts, setParts] = useState<OptionItem[]>(DEFAULT_PARTS);
  const [defectCauses, setDefectCauses] = useState<OptionItem[]>(DEFAULT_DEFECT_CAUSES);
  const [workers, setWorkers] = useState<OptionItem[]>(DEFAULT_WORKERS);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setProcesses(stored.processes);
      setParts(stored.parts);
      setDefectCauses(stored.defectCauses);
      setWorkers(stored.workers);
    }
  }, []);

  const persist = useCallback((p: OptionItem[], pa: OptionItem[], dc: OptionItem[], w: OptionItem[]) => {
    saveToStorage({ processes: p, parts: pa, defectCauses: dc, workers: w });
  }, []);

  // 공정
  const addProcess = useCallback((item: OptionItem) => {
    setProcesses((prev) => {
      const next = [...prev, item];
      persist(next, parts, defectCauses, workers);
      return next;
    });
  }, [parts, defectCauses, workers, persist]);

  const removeProcess = useCallback((name: string) => {
    setProcesses((prev) => {
      const next = prev.filter((p) => p.name !== name);
      persist(next, parts, defectCauses, workers);
      return next;
    });
  }, [parts, defectCauses, workers, persist]);

  // 부품
  const addPart = useCallback((item: OptionItem) => {
    setParts((prev) => {
      const next = [...prev, item];
      persist(processes, next, defectCauses, workers);
      return next;
    });
  }, [processes, defectCauses, workers, persist]);

  const removePart = useCallback((name: string) => {
    setParts((prev) => {
      const next = prev.filter((p) => p.name !== name);
      persist(processes, next, defectCauses, workers);
      return next;
    });
  }, [processes, defectCauses, workers, persist]);

  // 불량원인
  const addDefectCause = useCallback((item: OptionItem) => {
    setDefectCauses((prev) => {
      const next = [...prev, item];
      persist(processes, parts, next, workers);
      return next;
    });
  }, [processes, parts, workers, persist]);

  const removeDefectCause = useCallback((name: string) => {
    setDefectCauses((prev) => {
      const next = prev.filter((c) => c.name !== name);
      persist(processes, parts, next, workers);
      return next;
    });
  }, [processes, parts, workers, persist]);

  // 작업자
  const addWorker = useCallback((item: OptionItem) => {
    setWorkers((prev) => {
      const next = [...prev, item];
      persist(processes, parts, defectCauses, next);
      return next;
    });
  }, [processes, parts, defectCauses, persist]);

  const removeWorker = useCallback((name: string) => {
    setWorkers((prev) => {
      const next = prev.filter((w) => w.name !== name);
      persist(processes, parts, defectCauses, next);
      return next;
    });
  }, [processes, parts, defectCauses, persist]);

  const resetAll = useCallback(() => {
    setProcesses(DEFAULT_PROCESSES);
    setParts(DEFAULT_PARTS);
    setDefectCauses(DEFAULT_DEFECT_CAUSES);
    setWorkers(DEFAULT_WORKERS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    processes, addProcess, removeProcess,
    parts, addPart, removePart,
    defectCauses, addDefectCause, removeDefectCause,
    workers, addWorker, removeWorker,
    resetAll,
  };
}
