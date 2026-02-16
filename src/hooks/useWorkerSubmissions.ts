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
  };
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
      setSubmissions((data as unknown as DbRow[]).map(rowToSubmission));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addSubmission = async (sub: Omit<WorkerSubmission, "id">) => {
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
    };

    const { data, error } = await supabase
      .from("worker_submissions")
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      toast.error("등록에 실패했습니다.");
      return null;
    }

    const newSub = rowToSubmission(data as unknown as DbRow);
    setSubmissions((prev) => [newSub, ...prev]);
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

    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    return true;
  };

  return { submissions, loading, addSubmission, deleteSubmission, refetch: fetchAll };
}
