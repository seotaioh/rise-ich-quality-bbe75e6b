import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardEdit, Plus, Trash2, Clock, User, Factory,
  AlertTriangle, MessageSquare, Send, RotateCcw, Package,
  Calendar, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useModelOptions } from "@/hooks/useModelOptions";
import { useModelDefectTypes } from "@/hooks/useModelDefectTypes";
import { useWorkerSubmissions, DefectEntry } from "@/hooks/useWorkerSubmissions";
import { parseTraceTags, stripTraceTags } from "@/lib/traceability";
import { toast } from "sonner";
import { useModel } from "@/contexts/ModelContext";
import { useNavigate } from "react-router-dom";

// ── 작업유형 (실제 카톡 데이터 기반) ──
const TASK_OPTIONS = [
  "조립작업", "필터작업", "필터체결", "필터체결마무리",
  "포장작업", "포장상자접기", "포장박스접기", "박스접기", "제품포장",
  "물검사", "공정검사", "제품검사",
  "바디데코작업", "사전작업", "하우징인두작업", "배선작업", "체결작업",
  "제품출하", "출하작업", "지게차작업", "불량자재출고", "공정창고입고",
];

// ── 날짜 유틸 ──
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatDateKR(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}
function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

const selectCls =
  "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const inputCls =
  "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

// ── 메인 컴포넌트 ──
const WorkerInputPage = () => {
  const navigate = useNavigate();
  const { selectedModel } = useModel();
  const options = useModelOptions(selectedModel.id);
  const { getDefectTypesForCategory } = useModelDefectTypes(selectedModel.id);
  const { submissions, loading, addSubmission, deleteSubmission } = useWorkerSubmissions();

  // 날짜 상태
  const todayISO = toDateStr(new Date());
  const [workDate, setWorkDate] = useState(todayISO);
  const [viewDate, setViewDate] = useState(todayISO);

  // 폼 상태
  const [workerName, setWorkerName] = useState("");
  const [process, setProcess] = useState("");
  const [productionQty, setProductionQty] = useState<number>(0);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [defects, setDefects] = useState<DefectEntry[]>([]);
  const [lotNo, setLotNo] = useState("");
  const [lotSeq, setLotSeq] = useState("001");
  const [supplierName, setSupplierName] = useState("");
  const [supplierCode, setSupplierCode] = useState("");
  const [registrationPlace, setRegistrationPlace] = useState("");
  const [registrationPlaceCode, setRegistrationPlaceCode] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 선택된 부품에 따른 불량유형 목록 (모델별)
  const getDefectTypes = (partName: string) => {
    const part = options.parts.find((p) => p.name === partName);
    if (!part) return [];
    const major = part.code.charAt(0);
    return getDefectTypesForCategory(major);
  };

  // ── 불량 항목 CRUD ──
  const addDefect = () => setDefects([...defects, { part: "", defectType: "", count: 1 }]);
  const removeDefect = (i: number) => setDefects(defects.filter((_, idx) => idx !== i));
  const updateDefect = (i: number, field: keyof DefectEntry, val: string | number) => {
    const next = [...defects];
    if (field === "part") {
      next[i] = { ...next[i], part: val as string, defectType: "" };
    } else {
      next[i] = { ...next[i], [field]: val };
    }
    setDefects(next);
  };

  // ── 작업유형 토글 ──
  const toggleTask = (task: string) => {
    setSelectedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );
  };

  // ── 초기화 ──
  const handleReset = () => {
    setWorkDate(todayISO);
    setWorkerName("");
    setProcess("");
    setProductionQty(0);
    setSelectedTasks([]);
    setDefects([]);
    setLotNo("");
    setLotSeq("001");
    setSupplierName("");
    setSupplierCode("");
    setRegistrationPlace("");
    setRegistrationPlaceCode("");
    setMemo("");
    toast.info("입력 내용이 초기화되었습니다.");
  };

  const handleGenerateLotCode = () => {
    if (!supplierCode) {
      toast.error("협력업체를 선택하세요.");
      return;
    }
    if (!registrationPlaceCode) {
      toast.error("등록 장소를 선택하세요.");
      return;
    }

    const yymmdd = workDate.replace(/-/g, "").slice(2);
    const seqNum = Math.max(1, parseInt(lotSeq, 10) || 1);
    const seqCode = String(seqNum).padStart(3, "0");
    const nextLot = `${selectedModel.productCode}-${yymmdd}-${supplierCode}-${registrationPlaceCode}-${seqCode}`;

    setLotNo(nextLot);
    toast.success("LOT 코드가 생성되었습니다.");
  };

  // ── 제출 ──
  const handleSubmit = async () => {
    if (!workerName) { toast.error("작업자를 선택하세요."); return; }
    if (!process) { toast.error("공정을 선택하세요."); return; }
    if (!lotNo) { toast.error("LOT 번호를 입력하거나 자동 생성하세요."); return; }
    if (!supplierName || !supplierCode) { toast.error("협력업체를 선택하세요."); return; }
    if (!registrationPlace || !registrationPlaceCode) { toast.error("등록 장소를 선택하세요."); return; }

    const incompleteDefects = defects.filter((d) => (d.part || d.defectType || d.count > 1) && (!d.part || !d.defectType || d.count <= 0));
    if (incompleteDefects.length > 0) {
      toast.error(`불량 항목 ${incompleteDefects.length}건이 불완전합니다.`);
      return;
    }

    const validDefects = defects.filter((d) => d.part && d.defectType && d.count > 0);
    const worker = options.workers.find((w) => w.name === workerName);
    const now = new Date();

    setSubmitting(true);
    const result = await addSubmission({
      workerName,
      workerCode: worker?.code || "",
      date: workDate,
      time: now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      process,
      productionQty,
      tasks: selectedTasks,
      defects: validDefects,
      memo,
      lotNo,
      supplierName,
      supplierCode,
      registrationPlace,
      registrationPlaceCode,
      model: selectedModel.id,
    });
    setSubmitting(false);

    if (result) {
      setViewDate(workDate);
      setProductionQty(0);
      setSelectedTasks([]);
      setDefects([]);
      setLotNo("");
      setLotSeq("001");
      setSupplierName("");
      setSupplierCode("");
      setRegistrationPlace("");
      setRegistrationPlaceCode("");
      setMemo("");

      const defectMsg = validDefects.length > 0 ? ` (불량 ${validDefects.length}건 포함)` : "";
      toast.success(`${workerName}님의 실적이 등록되었습니다.${defectMsg}`);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteSubmission(id);
    if (ok) toast.info("삭제되었습니다.");
  };

  // ── 선택 날짜 통계 ──
  const viewSubs = submissions.filter((s) => s.date === viewDate && (s.model || "ICH-3000") === selectedModel.id);
  const totalProduction = viewSubs.reduce((s, sub) => s + sub.productionQty, 0);
  const totalDefects = viewSubs.reduce((s, sub) => s + (sub.defects || []).reduce((ds, d) => ds + d.count, 0), 0);
  const defectRate = totalProduction > 0 ? ((totalDefects / totalProduction) * 100).toFixed(1) : "0.0";
  const isViewToday = viewDate === todayISO;
  const requiredChecklist = [
    { label: "작업자", ok: !!workerName },
    { label: "공정", ok: !!process },
    { label: "LOT 번호", ok: !!lotNo },
    { label: "협력업체", ok: !!supplierName && !!supplierCode },
    { label: "등록 장소", ok: !!registrationPlace && !!registrationPlaceCode },
  ];
  const missingChecklist = requiredChecklist.filter((item) => !item.ok);
  const canSubmit = requiredChecklist.every((item) => item.ok) && !submitting;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <ClipboardEdit className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">작업자 생산/불량 입력</h2>
          <p className="text-muted-foreground">
            공정별 생산 실적과 불량 내역을 입력합니다
            <Badge variant="outline" className="ml-2 text-primary border-primary">{selectedModel.label}</Badge>
          </p>
        </div>
      </div>

      {/* 날짜 선택 바 */}
      <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">조회 날짜</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setViewDate(shiftDate(viewDate, -1))}
              className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <input
              type="date"
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={viewDate}
              onChange={(e) => setViewDate(e.target.value)}
            />
            <button type="button" onClick={() => setViewDate(shiftDate(viewDate, 1))}
              className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
            {!isViewToday && (
              <button type="button" onClick={() => setViewDate(todayISO)}
                className="text-xs text-primary hover:underline ml-1">오늘</button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1 text-right">
          {formatDateKR(viewDate)} {isViewToday && <span className="text-primary font-medium">(오늘)</span>}
        </p>
      </Card>

      {/* 날짜별 요약 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
          <p className="text-sm text-muted-foreground">입력 건수</p>
          <p className="text-2xl font-bold text-foreground">{viewSubs.length}건</p>
        </Card>
        <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
          <p className="text-sm text-muted-foreground">총 생산량</p>
          <p className="text-2xl font-bold text-primary">{totalProduction}개</p>
        </Card>
        <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
          <p className="text-sm text-muted-foreground">총 불량수</p>
          <p className="text-2xl font-bold text-destructive">{totalDefects}개</p>
        </Card>
        <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50">
          <p className="text-sm text-muted-foreground">불량률</p>
          <p className="text-2xl font-bold text-foreground">{defectRate}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── 입력 폼 ── */}
        <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              등록
            </h3>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="h-4 w-4" /> 초기화
            </button>
          </div>

          <div className="space-y-5">
            {/* 0. 작업일 */}
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> 작업일
              </label>
              <input type="date" className={inputCls} value={workDate} onChange={(e) => setWorkDate(e.target.value)} />
            </div>

            {/* 1. 작업자 */}
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> 작업자
              </label>
              <select className={selectCls} value={workerName} onChange={(e) => setWorkerName(e.target.value)}>
                <option value="">작업자를 선택하세요</option>
                {options.workers.map((w) => (
                  <option key={w.name} value={w.name}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>

            {/* 2. 공정 */}
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Factory className="h-3.5 w-3.5" /> 공정
              </label>
              <select className={selectCls} value={process} onChange={(e) => setProcess(e.target.value)}>
                <option value="">공정을 선택하세요</option>
                {options.processes.map((p) => (
                  <option key={p.name} value={p.name}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            {/* 3. 생산수량 */}
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" /> 생산수량
              </label>
              <input type="number" className={inputCls} placeholder="생산 수량을 입력하세요" min={0}
                value={productionQty || ""} onChange={(e) => setProductionQty(parseInt(e.target.value) || 0)} />
            </div>

            {/* 4. 작업내용 (토글 선택) */}
            <div>
              <label className="block text-sm font-medium mb-2">작업내용 (선택)</label>
              <div className="flex flex-wrap gap-2">
                {TASK_OPTIONS.map((task) => (
                  <button key={task} type="button" onClick={() => toggleTask(task)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedTasks.includes(task)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    }`}>
                    {task}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. 불량내용 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> 불량내용
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/defect-code", { state: { openDefectTypeManager: true } })}
                  className="text-xs text-primary hover:underline"
                >
                  하위유형 코드 관리
                </button>
              </div>

              {defects.length === 0 ? (
                <p className="text-sm text-muted-foreground mb-2">불량이 없으면 비워두세요.</p>
              ) : (
                <div className="space-y-2 mb-2">
                  {defects.map((d, idx) => {
                    const isIncomplete = !d.part || !d.defectType || d.count <= 0;
                    return (
                      <div key={idx} className={`p-3 rounded-lg border space-y-2 ${isIncomplete ? "border-destructive/50 bg-destructive/5" : "border-border bg-muted/20"}`}>
                        <div className="flex gap-2 items-center">
                          <select className={`${selectCls} ${!d.part ? "text-destructive border-destructive/30" : ""}`}
                            value={d.part} onChange={(e) => updateDefect(idx, "part", e.target.value)} style={{ flex: 3 }}>
                            <option value="">불량 부품을 선택하세요</option>
                            {options.parts.map((p) => (
                              <option key={p.name} value={p.name}>{p.name} ({p.code})</option>
                            ))}
                          </select>
                          <button type="button" onClick={() => removeDefect(idx)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <select className={`${selectCls} ${d.part && !d.defectType ? "text-destructive border-destructive/30" : ""}`}
                            value={d.defectType} onChange={(e) => updateDefect(idx, "defectType", e.target.value)}
                            disabled={!d.part} style={{ flex: 2 }}>
                            <option value="">{d.part ? "불량유형을 선택하세요" : "부품을 먼저 선택"}</option>
                            {getDefectTypes(d.part).map((dt) => (
                              <option key={dt} value={dt}>{dt}</option>
                            ))}
                          </select>
                          <input type="number" className={inputCls} placeholder="수량" min={1}
                            value={d.count || ""} onChange={(e) => updateDefect(idx, "count", parseInt(e.target.value) || 0)}
                            style={{ flex: 1 }} />
                        </div>
                        {isIncomplete && (
                          <p className="text-xs text-destructive">
                            {!d.part ? "부품을 선택하세요" : !d.defectType ? "불량유형을 선택하세요" : "수량을 입력하세요"}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <button type="button" onClick={addDefect}
                className="flex items-center gap-1 text-sm text-destructive hover:underline">
                <Plus className="h-3.5 w-3.5" /> 불량 항목 추가
              </button>
            </div>

            {/* 6. 메모 */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">LOT 번호</label>
                  <input
                    className={inputCls}
                    placeholder="예: C03-250224-S001-L01-001"
                    value={lotNo}
                    onChange={(e) => setLotNo(e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">LOT 순번 (3자리)</label>
                  <input
                    className={inputCls}
                    type="number"
                    min={1}
                    max={999}
                    value={lotSeq}
                    onChange={(e) => setLotSeq(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">협력업체 코드</label>
                  <select
                    className={selectCls}
                    value={supplierName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setSupplierName(name);
                      const supplier = options.suppliers.find((s) => s.name === name);
                      setSupplierCode(supplier?.code || "");
                    }}
                  >
                    <option value="">협력업체를 선택하세요</option>
                    {options.suppliers.map((s) => (
                      <option key={s.name} value={s.name}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">등록 장소 코드</label>
                  <select
                    className={selectCls}
                    value={registrationPlace}
                    onChange={(e) => {
                      const place = e.target.value;
                      setRegistrationPlace(place);
                      const location = options.locations.find((l) => l.name === place);
                      setRegistrationPlaceCode(location?.code || "");
                    }}
                  >
                    <option value="">등록 장소를 선택하세요</option>
                    {options.locations.map((l) => (
                      <option key={l.name} value={l.name}>{l.name} ({l.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                LOT 형식: 제품코드-날짜(YYMMDD)-협력업체코드-장소코드-순번
              </p>

              <Button type="button" variant="outline" className="w-full" onClick={handleGenerateLotCode}>
                LOT 코드 자동 생성
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">협력업체 코드(확인)</label>
                <input className={inputCls} value={supplierCode} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">등록 장소 코드(확인)</label>
                <input className={inputCls} value={registrationPlaceCode} disabled />
              </div>
            </div>

            {/* 7. 메모 */}
            <div>
              <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> 메모 (자유 입력)
              </label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                rows={3}
                placeholder="자유롭게 입력하세요&#10;예: 바디 432대 공정창고 입고&#10;EP7000 298대 출하작업 및 지게차작업&#10;HBS 불량자재출고"
                value={memo} onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {/* 제출 */}
            {!canSubmit && (
              <div className="rounded-lg border-2 border-destructive bg-destructive/15 p-4 shadow-[var(--shadow-soft)]">
                <p className="text-base font-extrabold text-destructive mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  필수 항목 {missingChecklist.length}개 미완료
                </p>
                <p className="text-sm font-semibold text-destructive mb-3">
                  미완료: {missingChecklist.map((item) => item.label).join(", ")}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {requiredChecklist.map((item) => (
                    <span
                      key={item.label}
                      className={`px-2.5 py-1.5 rounded-md border font-semibold ${
                        item.ok
                          ? "border-success/60 bg-success/15 text-success-foreground"
                          : "border-destructive/60 bg-destructive/15 text-destructive"
                      }`}
                    >
                      {item.ok ? "완료" : "필수"} · {item.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleSubmit}
              className={`w-full ${
                canSubmit
                  ? "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  : "bg-destructive/20 text-destructive border-2 border-destructive font-bold disabled:opacity-100"
              }`}
              disabled={!canSubmit}>
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "등록 중..." : canSubmit ? "등록" : "필수 항목 선택 후 등록 가능"}
            </Button>
          </div>
        </Card>

        {/* ── 날짜별 등록 내역 ── */}
        <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {isViewToday ? "오늘" : formatDateKR(viewDate)} 등록 내역
            {viewSubs.length > 0 && (
              <Badge variant="outline" className="ml-auto">{viewSubs.length}건</Badge>
            )}
          </h3>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">불러오는 중...</p>
          ) : viewSubs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {isViewToday ? "오늘" : formatDateKR(viewDate)} 입력된 내역이 없습니다.
            </p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {viewSubs.map((sub) => (
                <div key={sub.id} className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group">
                  {(() => {
                    const tags = parseTraceTags(sub.memo);
                    const resolvedLot = (sub.lotNo || "").trim() || tags.lotNo;
                    const resolvedSupplier = (sub.supplierName || "").trim() || tags.supplier;
                    const resolvedSupplierCode = (sub.supplierCode || "").trim() || tags.supplierCode;
                    const resolvedPlace = (sub.registrationPlace || "").trim() || tags.registrationPlace;
                    const resolvedPlaceCode = (sub.registrationPlaceCode || "").trim() || tags.registrationPlaceCode;
                    const cleanMemo = stripTraceTags(sub.memo);

                    return (
                      <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-card">{sub.workerName}</Badge>
                      <Badge variant="secondary" className="text-xs">{sub.process}</Badge>
                      {resolvedLot && <Badge variant="outline" className="text-xs">LOT {resolvedLot}</Badge>}
                      {resolvedSupplier && <Badge variant="outline" className="text-xs">협력업체 {resolvedSupplier}{resolvedSupplierCode ? ` (${resolvedSupplierCode})` : ""}</Badge>}
                      {resolvedPlace && <Badge variant="outline" className="text-xs">등록장소 {resolvedPlace}{resolvedPlaceCode ? ` (${resolvedPlaceCode})` : ""}</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{sub.time}</span>
                      <button onClick={() => handleDelete(sub.id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded p-1 transition-opacity">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {sub.productionQty > 0 && (
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">생산수량</span>
                      <span className="font-semibold text-primary">{sub.productionQty}개</span>
                    </div>
                  )}

                  {sub.tasks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {sub.tasks.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}

                  {(sub.defects || []).length > 0 && (
                    <div className="p-2 rounded bg-destructive/5 border border-destructive/20 space-y-1 mb-2">
                      <p className="text-xs font-medium text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> 불량
                      </p>
                      {sub.defects.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">
                            {d.part} <span className="text-muted-foreground">· {d.defectType}</span>
                          </span>
                          <span className="font-semibold text-destructive">{d.count}개</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {cleanMemo && (
                    <p className="text-xs text-muted-foreground border-t border-border/50 pt-2 whitespace-pre-line">
                      {cleanMemo}
                    </p>
                  )}
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default WorkerInputPage;
