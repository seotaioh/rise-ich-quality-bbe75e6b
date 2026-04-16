import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DefectEntry {
  part: string;
  defectType: string;
  count: number;
}

export interface WorkerSubmission {
  id: string;
  workerName: string;
  workerCode: string;
  date: string;
  time: string;
  process: string;
  productionQty: number;
  tasks: string[];
  defects: DefectEntry[];
  memo: string;
  lotNo?: string;
  supplierName?: string;
  supplierCode?: string;
  registrationPlace?: string;
  registrationPlaceCode?: string;
  model?: string;
}

interface DbRow {
  id: string;
  worker_name: string;
  worker_code: string;
  work_date: string;
  work_time: string;
  process: string;
  production_qty: number;
  tasks: string[];
  defects: DefectEntry[];
  memo: string;
  lot_no: string;
  supplier_name: string;
  supplier_code: string;
  registration_place: string;
  registration_place_code: string;
  model: string;
  created_at: string;
}

function rowToSubmission(row: DbRow): WorkerSubmission {
  return {
    id: row.id,
    workerName: row.worker_name,
    workerCode: row.worker_code,
    date: row.work_date,
    time: row.work_time,
    process: row.process,
    productionQty: row.production_qty,
    tasks: row.tasks || [],
    defects: (row.defects as unknown as DefectEntry[]) || [],
    memo: row.memo || "",
    lotNo: row.lot_no || "",
    supplierName: row.supplier_name || "",
    supplierCode: row.supplier_code || "",
    registrationPlace: row.registration_place || "",
    registrationPlaceCode: row.registration_place_code || "",
    model: row.model || "ICH-3000",
  };
}

// localStorage 동기화 (useSubmissionStats 등 다른 훅과 호환)
const STORAGE_KEY = "ich-quality-worker-submissions-v2";
function syncToLocalStorage(subs: WorkerSubmission[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
  } catch {}
}

export function useWorkerSubmissions() {
  const [submissions, setSubmissions] = useState<WorkerSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("worker_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch submissions:", error);
      toast.error("데이터를 불러오지 못했습니다.");
    } else {
      const mapped = (data as unknown as DbRow[]).map(rowToSubmission);
      setSubmissions(mapped);
      syncToLocalStorage(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addSubmission = async (sub: Omit<WorkerSubmission, "id">) => {
    const appendMetaTag = (baseMemo: string, tag: string, value?: string) => {
      const normalized = (value || "").trim();
      if (!normalized) return baseMemo;
      const line = `[${tag}:${normalized}]`;
      if (baseMemo.includes(line)) return baseMemo;
      return `${line}\n${baseMemo}`.trim();
    };

    const legacyMemo = [
      ["LOT", sub.lotNo],
      ["SUPPLIER", sub.supplierName],
      ["SUPPLIER_CODE", sub.supplierCode],
      ["PLACE", sub.registrationPlace],
      ["PLACE_CODE", sub.registrationPlaceCode],
    ].reduce((memo, [tag, value]) => appendMetaTag(memo, tag as string, value as string), sub.memo || "");

    const insertData = {
      worker_name: sub.workerName,
      worker_code: sub.workerCode,
      work_date: sub.date,
      work_time: sub.time,
      process: sub.process,
      production_qty: sub.productionQty,
      tasks: sub.tasks,
      defects: sub.defects as unknown as Record<string, unknown>[],
      memo: sub.memo,
      lot_no: sub.lotNo || "",
      supplier_name: sub.supplierName || "",
      supplier_code: sub.supplierCode || "",
      registration_place: sub.registrationPlace || "",
      registration_place_code: sub.registrationPlaceCode || "",
      model: sub.model || "ICH-3000",
    };

    const { data, error } = await supabase
      .from("worker_submissions")
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      const message = `${error.message || ""} ${error.details || ""}`.toLowerCase();
      const isSchemaMismatch =
        error.code === "42703"
        || message.includes("column")
        || message.includes("registration_place")
        || message.includes("supplier_code")
        || message.includes("lot_no");

      if (isSchemaMismatch) {
        const legacyInsertData = {
          worker_name: sub.workerName,
          worker_code: sub.workerCode,
          work_date: sub.date,
          work_time: sub.time,
          process: sub.process,
          production_qty: sub.productionQty,
          tasks: sub.tasks,
          defects: sub.defects as unknown as Record<string, unknown>[],
          memo: legacyMemo,
          model: sub.model || "ICH-3000",
        };

        const legacyResult = await supabase
          .from("worker_submissions")
          .insert(legacyInsertData as any)
          .select()
          .single();

        if (legacyResult.error) {
          console.error("Legacy insert error:", legacyResult.error);
          toast.error("등록에 실패했습니다. (DB 스키마 확인 필요)");
          return null;
        }

        const newSub = rowToSubmission(legacyResult.data as unknown as DbRow);
        setSubmissions((prev) => {
          const next = [newSub, ...prev];
          syncToLocalStorage(next);
          return next;
        });

        toast.info("구버전 DB 호환 모드로 등록되었습니다.");
        return newSub;
      }

      console.error("Insert error:", error);
      toast.error("등록에 실패했습니다.");
      return null;
    }

    const newSub = rowToSubmission(data as unknown as DbRow);
    setSubmissions((prev) => {
      const next = [newSub, ...prev];
      syncToLocalStorage(next);
      return next;
    });
    return newSub;
  };

  const deleteSubmission = async (id: string) => {
    const { error } = await supabase
      .from("worker_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      toast.error("삭제에 실패했습니다.");
      return false;
    }

    setSubmissions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      syncToLocalStorage(next);
      return next;
    });
    return true;
  };

  return { submissions, loading, addSubmission, deleteSubmission, refetch: fetchAll };
}
