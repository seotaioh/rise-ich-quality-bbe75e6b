import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

function loadEnv(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
    env[key] = value;
  }
  return env;
}

const env = loadEnv(".env");
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase env vars");
}

const supabase = createClient(url, key);

const payload = {
  worker_name: "테스트작업자",
  worker_code: "WTST",
  work_date: new Date().toISOString().slice(0, 10),
  work_time: "12:40",
  process: "공정검사",
  production_qty: 10,
  tasks: ["테스트"],
  defects: [{ part: "메인PCB", defectType: "점검", count: 1 }],
  memo: "자동 테스트 등록",
  lot_no: "TST-250224-S001-L01-001",
  supplier_name: "ABC정밀",
  supplier_code: "S001",
  registration_place: "입고검사장",
  registration_place_code: "L01",
  model: "ICH-3000",
};

const insertResult = await supabase
  .from("worker_submissions")
  .insert(payload)
  .select("id")
  .single();

if (insertResult.error) {
  console.error("INSERT_FAIL", insertResult.error);
  process.exit(1);
}

const insertedId = insertResult.data.id;
console.log("INSERT_OK", insertedId);

const selectResult = await supabase
  .from("worker_submissions")
  .select("id, lot_no, supplier_code, registration_place_code")
  .eq("id", insertedId)
  .single();

if (selectResult.error) {
  console.error("SELECT_FAIL", selectResult.error);
  process.exit(1);
}

console.log("SELECT_OK", selectResult.data);

const deleteResult = await supabase
  .from("worker_submissions")
  .delete()
  .eq("id", insertedId);

if (deleteResult.error) {
  console.error("DELETE_FAIL", deleteResult.error);
  process.exit(1);
}

console.log("DELETE_OK");
