import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OptionItem {
  name: string;
  code: string;
}

export interface ModelOptionsData {
  processes: OptionItem[];
  parts: OptionItem[];
  defectCauses: OptionItem[];
  workers: OptionItem[];
  suppliers: OptionItem[];
  locations: OptionItem[];
}

// ── ICH-3000 기본 데이터 ──
const ICH3000_PROCESSES: OptionItem[] = [
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

const ICH3000_PARTS: OptionItem[] = [
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

const ICH3000_DEFECT_CAUSES: OptionItem[] = [
  { name: "조립불량", code: "DC01" },
  { name: "자재불량", code: "DC02" },
  { name: "기능불량", code: "DC03" },
];

const ICH3000_WORKERS: OptionItem[] = [
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

const ICH3000_SUPPLIERS: OptionItem[] = [
  { name: "ABC정밀", code: "S001" },
  { name: "한빛테크", code: "S002" },
  { name: "대성부품", code: "S003" },
];

const ICH3000_LOCATIONS: OptionItem[] = [
  { name: "입고검사장", code: "L01" },
  { name: "공정검사장", code: "L02" },
  { name: "출하검사장", code: "L03" },
];

// ── EP-7000 기본 데이터 (별도 코드체계) ──
const EP7000_PROCESSES: OptionItem[] = [
  { name: "1공정", code: "A" },
  { name: "2공정", code: "A" },
  { name: "3공정", code: "A" },
  { name: "조립", code: "A" },
  { name: "공정검사", code: "B" },
  { name: "에이징", code: "B" },
  { name: "성능검사", code: "C" },
  { name: "제품검사", code: "C" },
  { name: "출하검사", code: "D" },
  { name: "고객", code: "E" },
];

const EP7000_PARTS: OptionItem[] = [
  { name: "본체케이스", code: "101" },
  { name: "전면커버", code: "102" },
  { name: "출수부", code: "103" },
  { name: "메인PCB", code: "201" },
  { name: "파워PCB", code: "202" },
  { name: "디스플레이PCB", code: "203" },
  { name: "SMPS", code: "204" },
  { name: "정수필터", code: "301" },
  { name: "UV램프", code: "302" },
  { name: "유량센서", code: "401" },
  { name: "수위센서", code: "402" },
  { name: "온도센서", code: "403" },
  { name: "솔밸브-입수", code: "501" },
  { name: "솔밸브-출수", code: "502" },
  { name: "펌프", code: "503" },
  { name: "메인하네스", code: "601" },
  { name: "파워하네스", code: "602" },
  { name: "냉각모듈", code: "701" },
  { name: "히팅모듈", code: "702" },
  { name: "배수밸브", code: "801" },
  { name: "튜브류", code: "802" },
  { name: "피팅류", code: "803" },
];

const EP7000_DEFECT_CAUSES: OptionItem[] = [
  { name: "조립불량", code: "DC01" },
  { name: "자재불량", code: "DC02" },
  { name: "기능불량", code: "DC03" },
];

const EP7000_WORKERS: OptionItem[] = [
  { name: "김철수", code: "W001" },
  { name: "이영희", code: "W002" },
  { name: "박민수", code: "W003" },
  { name: "정수진", code: "W004" },
  { name: "최동욱", code: "W005" },
];

const EP7000_SUPPLIERS: OptionItem[] = [
  { name: "세광산업", code: "S011" },
  { name: "우성정밀", code: "S012" },
  { name: "현대소재", code: "S013" },
];

const EP7000_LOCATIONS: OptionItem[] = [
  { name: "EP 입고검사장", code: "L11" },
  { name: "EP 공정검사장", code: "L12" },
  { name: "EP 출하검사장", code: "L13" },
];

// ── 모델별 기본 데이터 매핑 ──
const MODEL_DEFAULTS: Record<string, ModelOptionsData> = {
  "ICH-3000": {
    processes: ICH3000_PROCESSES,
    parts: ICH3000_PARTS,
    defectCauses: ICH3000_DEFECT_CAUSES,
    workers: ICH3000_WORKERS,
    suppliers: ICH3000_SUPPLIERS,
    locations: ICH3000_LOCATIONS,
  },
  "EP-7000": {
    processes: EP7000_PROCESSES,
    parts: EP7000_PARTS,
    defectCauses: EP7000_DEFECT_CAUSES,
    workers: EP7000_WORKERS,
    suppliers: EP7000_SUPPLIERS,
    locations: EP7000_LOCATIONS,
  },
};

function getDefaultsForModel(modelId: string): ModelOptionsData {
  return MODEL_DEFAULTS[modelId] || {
    processes: ICH3000_PROCESSES,
    parts: ICH3000_PARTS,
    defectCauses: ICH3000_DEFECT_CAUSES,
    workers: ICH3000_WORKERS,
    suppliers: ICH3000_SUPPLIERS,
    locations: ICH3000_LOCATIONS,
  };
}

// ── localStorage 유틸 ──
function storageKey(modelId: string) {
  return `ich-quality-options-${modelId}`;
}

function loadLocal(modelId: string): ModelOptionsData | null {
  try {
    const raw = localStorage.getItem(storageKey(modelId));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveLocal(modelId: string, data: ModelOptionsData) {
  localStorage.setItem(storageKey(modelId), JSON.stringify(data));
}

// ── Supabase 동기화 ──
type OptionType = "process" | "part" | "defect_cause" | "worker" | "supplier" | "location";

async function loadFromSupabase(modelId: string): Promise<ModelOptionsData | null> {
  try {
    const { data, error } = await (supabase
      .from("model_code_options") as any)
      .select("option_type, name, code, sort_order")
      .eq("model_id", modelId)
      .order("sort_order");

    if (error || !data || data.length === 0) return null;

    const result: ModelOptionsData = {
      processes: [],
      parts: [],
      defectCauses: [],
      workers: [],
      suppliers: [],
      locations: [],
    };
    for (const row of data as any[]) {
      const item: OptionItem = { name: row.name, code: row.code };
      switch (row.option_type as OptionType) {
        case "process": result.processes.push(item); break;
        case "part": result.parts.push(item); break;
        case "defect_cause": result.defectCauses.push(item); break;
        case "worker": result.workers.push(item); break;
        case "supplier": result.suppliers.push(item); break;
        case "location": result.locations.push(item); break;
      }
    }
    return result;
  } catch {
    return null;
  }
}

async function saveToSupabase(modelId: string, data: ModelOptionsData) {
  try {
    await (supabase.from("model_code_options") as any).delete().eq("model_id", modelId);

    const rows: { model_id: string; option_type: string; name: string; code: string; sort_order: number }[] = [];
    const addItems = (items: OptionItem[], type: OptionType) => {
      items.forEach((item, i) => rows.push({ model_id: modelId, option_type: type, name: item.name, code: item.code, sort_order: i }));
    };
    addItems(data.processes, "process");
    addItems(data.parts, "part");
    addItems(data.defectCauses, "defect_cause");
    addItems(data.workers, "worker");
    addItems(data.suppliers, "supplier");
    addItems(data.locations, "location");

    if (rows.length > 0) {
      await (supabase.from("model_code_options") as any).insert(rows);
    }
  } catch { /* ignore */ }
}

// ── Hook ──
export function useModelOptions(modelId: string) {
  const defaults = getDefaultsForModel(modelId);
  const [processes, setProcesses] = useState<OptionItem[]>(defaults.processes);
  const [parts, setParts] = useState<OptionItem[]>(defaults.parts);
  const [defectCauses, setDefectCauses] = useState<OptionItem[]>(defaults.defectCauses);
  const [workers, setWorkers] = useState<OptionItem[]>(defaults.workers);
  const [suppliers, setSuppliers] = useState<OptionItem[]>(defaults.suppliers);
  const [locations, setLocations] = useState<OptionItem[]>(defaults.locations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const localData = loadLocal(modelId);
    if (localData) {
      const defaultsForModel = getDefaultsForModel(modelId);
      setProcesses(localData.processes);
      setParts(localData.parts);
      setDefectCauses(localData.defectCauses);
      setWorkers(localData.workers);
      setSuppliers(localData.suppliers && localData.suppliers.length > 0 ? localData.suppliers : defaultsForModel.suppliers);
      setLocations(localData.locations && localData.locations.length > 0 ? localData.locations : defaultsForModel.locations);
      setLoading(false);
    } else {
      const d = getDefaultsForModel(modelId);
      setProcesses(d.processes);
      setParts(d.parts);
      setDefectCauses(d.defectCauses);
      setWorkers(d.workers);
      setSuppliers(d.suppliers);
      setLocations(d.locations);
      setLoading(false);
    }

    loadFromSupabase(modelId).then((dbData) => {
      if (dbData) {
        setProcesses(dbData.processes);
        setParts(dbData.parts);
        setDefectCauses(dbData.defectCauses);
        setWorkers(dbData.workers);
        setSuppliers(dbData.suppliers || []);
        setLocations(dbData.locations || []);
        saveLocal(modelId, dbData);
      }
    });
  }, [modelId]);

  const persist = useCallback(
    (p: OptionItem[], pa: OptionItem[], dc: OptionItem[], w: OptionItem[], s: OptionItem[], l: OptionItem[]) => {
      const data: ModelOptionsData = {
        processes: p,
        parts: pa,
        defectCauses: dc,
        workers: w,
        suppliers: s,
        locations: l,
      };
      saveLocal(modelId, data);
      saveToSupabase(modelId, data);
    },
    [modelId],
  );

  const addProcess = useCallback((item: OptionItem) => {
    setProcesses((prev) => {
      const next = [...prev, item];
      persist(next, parts, defectCauses, workers, suppliers, locations);
      return next;
    });
  }, [parts, defectCauses, workers, suppliers, locations, persist]);

  const removeProcess = useCallback((name: string) => {
    setProcesses((prev) => {
      const next = prev.filter((p) => p.name !== name);
      persist(next, parts, defectCauses, workers, suppliers, locations);
      return next;
    });
  }, [parts, defectCauses, workers, suppliers, locations, persist]);

  const addPart = useCallback((item: OptionItem) => {
    setParts((prev) => {
      const next = [...prev, item];
      persist(processes, next, defectCauses, workers, suppliers, locations);
      return next;
    });
  }, [processes, defectCauses, workers, suppliers, locations, persist]);

  const removePart = useCallback((name: string) => {
    setParts((prev) => {
      const next = prev.filter((p) => p.name !== name);
      persist(processes, next, defectCauses, workers, suppliers, locations);
      return next;
    });
  }, [processes, defectCauses, workers, suppliers, locations, persist]);

  const addDefectCause = useCallback((item: OptionItem) => {
    setDefectCauses((prev) => {
      const next = [...prev, item];
      persist(processes, parts, next, workers, suppliers, locations);
      return next;
    });
  }, [processes, parts, workers, suppliers, locations, persist]);

  const removeDefectCause = useCallback((name: string) => {
    setDefectCauses((prev) => {
      const next = prev.filter((c) => c.name !== name);
      persist(processes, parts, next, workers, suppliers, locations);
      return next;
    });
  }, [processes, parts, workers, suppliers, locations, persist]);

  const addWorker = useCallback((item: OptionItem) => {
    setWorkers((prev) => {
      const next = [...prev, item];
      persist(processes, parts, defectCauses, next, suppliers, locations);
      return next;
    });
  }, [processes, parts, defectCauses, suppliers, locations, persist]);

  const removeWorker = useCallback((name: string) => {
    setWorkers((prev) => {
      const next = prev.filter((w) => w.name !== name);
      persist(processes, parts, defectCauses, next, suppliers, locations);
      return next;
    });
  }, [processes, parts, defectCauses, suppliers, locations, persist]);

  const addSupplier = useCallback((item: OptionItem) => {
    setSuppliers((prev) => {
      const next = [...prev, item];
      persist(processes, parts, defectCauses, workers, next, locations);
      return next;
    });
  }, [processes, parts, defectCauses, workers, locations, persist]);

  const removeSupplier = useCallback((name: string) => {
    setSuppliers((prev) => {
      const next = prev.filter((s) => s.name !== name);
      persist(processes, parts, defectCauses, workers, next, locations);
      return next;
    });
  }, [processes, parts, defectCauses, workers, locations, persist]);

  const addLocation = useCallback((item: OptionItem) => {
    setLocations((prev) => {
      const next = [...prev, item];
      persist(processes, parts, defectCauses, workers, suppliers, next);
      return next;
    });
  }, [processes, parts, defectCauses, workers, suppliers, persist]);

  const removeLocation = useCallback((name: string) => {
    setLocations((prev) => {
      const next = prev.filter((l) => l.name !== name);
      persist(processes, parts, defectCauses, workers, suppliers, next);
      return next;
    });
  }, [processes, parts, defectCauses, workers, suppliers, persist]);

  const resetAll = useCallback(() => {
    const d = getDefaultsForModel(modelId);
    setProcesses(d.processes);
    setParts(d.parts);
    setDefectCauses(d.defectCauses);
    setWorkers(d.workers);
    setSuppliers(d.suppliers);
    setLocations(d.locations);
    localStorage.removeItem(storageKey(modelId));
    saveToSupabase(modelId, d);
  }, [modelId]);

  return {
    processes, addProcess, removeProcess,
    parts, addPart, removePart,
    defectCauses, addDefectCause, removeDefectCause,
    workers, addWorker, removeWorker,
    suppliers, addSupplier, removeSupplier,
    locations, addLocation, removeLocation,
    resetAll,
    loading,
  };
}