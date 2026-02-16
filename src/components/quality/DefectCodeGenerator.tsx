import { useState, useMemo, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateDefectCodeDynamic, DEFECT_CODES } from "@/lib/defectCodeGenerator";
import { useCustomOptions } from "@/hooks/useCustomOptions";
import { CodedOptionManager } from "./OptionManager";
import { Sparkles, RotateCcw, Settings, AlertTriangle } from "lucide-react";
import { useModel } from "@/contexts/ModelContext";

const selectClassName =
  "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

interface FormInput {
  processType: string;
  partName: string;
  defectType: string;
  defectCause: string;
  worker: string;
}

const INITIAL_INPUT: FormInput = {
  processType: "",
  partName: "",
  defectType: "",
  defectCause: "",
  worker: "",
};

export const DefectCodeGenerator = () => {
  const { selectedModel } = useModel();
  const [input, setInput] = useState<FormInput>(INITIAL_INPUT);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmRestoreDefaults, setConfirmRestoreDefaults] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const options = useCustomOptions();

  // 확인 상태 자동 해제 (5초 후)
  useEffect(() => {
    if (confirmReset) {
      resetTimerRef.current = setTimeout(() => setConfirmReset(false), 5000);
      return () => clearTimeout(resetTimerRef.current);
    }
  }, [confirmReset]);

  useEffect(() => {
    if (confirmRestoreDefaults) {
      restoreTimerRef.current = setTimeout(() => setConfirmRestoreDefaults(false), 5000);
      return () => clearTimeout(restoreTimerRef.current);
    }
  }, [confirmRestoreDefaults]);

  // 선택된 부품의 코드로부터 사용 가능한 불량 유형 필터링
  const availableDefectTypes = useMemo(() => {
    if (!input.partName) return [];
    const part = options.parts.find((p) => p.name === input.partName);
    if (!part) return [];
    const majorCategory = part.code.charAt(0);
    const defectMap = DEFECT_CODES[majorCategory];
    return defectMap ? Object.keys(defectMap) : [];
  }, [input.partName, options.parts]);

  const handleGenerate = () => {
    if (!input.processType || !input.partName || !input.defectType) return;
    const proc = options.processes.find((p) => p.name === input.processType);
    const part = options.parts.find((p) => p.name === input.partName);
    const processCode = proc?.code || "B";
    const partCode = part?.code || "999";
    const result = generateDefectCodeDynamic(processCode, partCode, input.defectType, input.partName, selectedModel.productCode);
    setGeneratedCode(result.code);
    setBreakdown(result.breakdown);
  };

  const handleResetClick = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setInput(INITIAL_INPUT);
    setGeneratedCode(null);
    setBreakdown(null);
    setConfirmReset(false);
  };

  const handleRestoreDefaultsClick = () => {
    if (!confirmRestoreDefaults) {
      setConfirmRestoreDefaults(true);
      return;
    }
    options.resetAll();
    setConfirmRestoreDefaults(false);
  };

  const isFormValid = input.processType && input.partName && input.defectType;

  return (
    <div className="space-y-4">
      <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">불량코드 자동 생성기</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1 text-sm transition-colors ${
                showSettings ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4" />
              항목 관리
            </button>
            <button
              type="button"
              onClick={handleResetClick}
              className={`flex items-center gap-1 text-sm font-medium rounded-md px-2.5 py-1.5 transition-all ${
                confirmReset
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "text-destructive hover:bg-destructive/10 border border-destructive/30"
              }`}
            >
              {confirmReset ? (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  확인 - 초기화
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  초기화
                </>
              )}
            </button>
            {confirmReset && (
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-1 rounded hover:bg-muted"
              >
                취소
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="processType" className="block text-sm font-medium mb-1.5">공정</label>
            <select
              id="processType"
              className={selectClassName}
              value={input.processType}
              onChange={(e) => setInput({ ...input, processType: e.target.value })}
            >
              <option value="">공정을 선택하세요</option>
              {options.processes.map((proc) => (
                <option key={proc.name} value={proc.name}>
                  {proc.name} ({proc.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="partName" className="block text-sm font-medium mb-1.5">부품명</label>
            <select
              id="partName"
              className={selectClassName}
              value={input.partName}
              onChange={(e) => setInput({ ...input, partName: e.target.value, defectType: "" })}
            >
              <option value="">부품을 선택하세요</option>
              {options.parts.map((part) => (
                <option key={part.name} value={part.name}>
                  {part.name} ({part.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="defectType" className="block text-sm font-medium mb-1.5">불량 유형</label>
            <select
              id="defectType"
              className={selectClassName}
              value={input.defectType}
              onChange={(e) => setInput({ ...input, defectType: e.target.value })}
              disabled={!input.partName}
            >
              <option value="">
                {input.partName ? "불량 유형을 선택하세요" : "먼저 부품을 선택하세요"}
              </option>
              {availableDefectTypes.map((defect) => (
                <option key={defect} value={defect}>
                  {defect}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="defectCause" className="block text-sm font-medium mb-1.5">불량 원인</label>
            <select
              id="defectCause"
              className={selectClassName}
              value={input.defectCause}
              onChange={(e) => setInput({ ...input, defectCause: e.target.value })}
            >
              <option value="">불량 원인을 선택하세요</option>
              {options.defectCauses.map((cause) => (
                <option key={cause.name} value={cause.name}>
                  {cause.name} ({cause.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="worker" className="block text-sm font-medium mb-1.5">작업자</label>
            <select
              id="worker"
              className={selectClassName}
              value={input.worker}
              onChange={(e) => setInput({ ...input, worker: e.target.value })}
            >
              <option value="">작업자를 선택하세요</option>
              {options.workers.map((worker) => (
                <option key={worker.name} value={worker.name}>
                  {worker.name} ({worker.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {!isFormValid && (
          <p className="text-sm text-amber-600 mb-2">
            * 공정, 부품명, 불량 유형을 선택해야 코드를 생성할 수 있습니다.
          </p>
        )}

        <Button
          onClick={handleGenerate}
          className={`w-full transition-opacity ${
            !isFormValid
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-primary to-accent hover:opacity-90"
          }`}
          disabled={!isFormValid}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          코드 생성
        </Button>

        {generatedCode && breakdown && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm font-medium text-muted-foreground mb-2">생성된 코드</p>
            <p className="text-3xl font-bold text-foreground mb-4 font-mono tracking-wider">
              {generatedCode}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="bg-card">제품: {breakdown.product}</Badge>
              <Badge variant="outline" className="bg-card">공정: {breakdown.process}</Badge>
              <Badge variant="outline" className="bg-card">부품: {breakdown.part}</Badge>
              <Badge variant="outline" className="bg-card">불량: {breakdown.defect}</Badge>
            </div>

            {(input.defectCause || input.worker) && (
              <div className="pt-3 border-t border-border space-y-1">
                {input.defectCause && (() => {
                  const cause = options.defectCauses.find((c) => c.name === input.defectCause);
                  return (
                    <p className="text-sm text-muted-foreground">
                      불량 원인: <span className="font-medium text-foreground">{input.defectCause}</span>
                      {cause && <span className="text-muted-foreground"> ({cause.code})</span>}
                    </p>
                  );
                })()}
                {input.worker && (() => {
                  const worker = options.workers.find((w) => w.name === input.worker);
                  return (
                    <p className="text-sm text-muted-foreground">
                      작업자: <span className="font-medium text-foreground">{input.worker}</span>
                      {worker && <span className="text-muted-foreground"> ({worker.code})</span>}
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 항목 관리 패널 */}
      {showSettings && (
        <Card className="p-4 shadow-[var(--shadow-soft)] border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">항목 관리</h4>
            <button
              type="button"
              onClick={handleRestoreDefaultsClick}
              className={`text-xs font-medium rounded px-2 py-1 transition-all ${
                confirmRestoreDefaults
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "text-destructive hover:bg-destructive/10 border border-destructive/30"
              }`}
            >
              {confirmRestoreDefaults ? "⚠ 확인 - 기본값 복원" : "기본값으로 복원"}
            </button>
            {confirmRestoreDefaults && (
              <button
                type="button"
                onClick={() => setConfirmRestoreDefaults(false)}
                className="text-xs text-muted-foreground hover:text-foreground px-1 rounded hover:bg-muted"
              >
                취소
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            각 항목을 펼쳐서 추가/삭제할 수 있습니다. 변경사항은 자동 저장됩니다.
          </p>
          <CodedOptionManager
            label="공정"
            items={options.processes}
            onAdd={options.addProcess}
            onRemove={options.removeProcess}
          />
          <CodedOptionManager
            label="부품"
            items={options.parts}
            onAdd={options.addPart}
            onRemove={options.removePart}
          />
          <CodedOptionManager
            label="불량 원인"
            items={options.defectCauses}
            onAdd={options.addDefectCause}
            onRemove={options.removeDefectCause}
          />
          <CodedOptionManager
            label="작업자"
            items={options.workers}
            onAdd={options.addWorker}
            onRemove={options.removeWorker}
          />
        </Card>
      )}
    </div>
  );
};
