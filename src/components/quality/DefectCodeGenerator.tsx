import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateDefectCode, DefectCodeInput, PROCESS_CODES, PART_CODES, DEFECT_CODES } from "@/lib/defectCodeGenerator";
import { Sparkles } from "lucide-react";

const DEFECT_CAUSES = ["조립불량", "자재불량", "기능불량"];

const WORKERS = [
  "김철수", "이영희", "박민수", "정수진", "최동욱",
  "강지훈", "윤서연", "임재현", "한미경", "신동혁"
];

export const DefectCodeGenerator = () => {
  const [input, setInput] = useState<DefectCodeInput>({
    processType: "공정검사",
    partName: "",
    defectType: "",
    defectCause: "조립불량",
    worker: "",
  });
  
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<any>(null);

  // 선택된 부품에 따라 사용 가능한 불량 유형 필터링
  const availableDefectTypes = useMemo(() => {
    if (!input.partName) return [];
    
    const partCode = PART_CODES[input.partName];
    if (!partCode) return [];
    
    const majorCategory = partCode.charAt(0);
    const defectMap = DEFECT_CODES[majorCategory];
    
    return defectMap ? Object.keys(defectMap) : [];
  }, [input.partName]);

  const handleGenerate = () => {
    const result = generateDefectCode(input);
    setGeneratedCode(result.code);
    setBreakdown(result.breakdown);
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">불량코드 자동 생성기</h3>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="partName">부품명</Label>
          <Select 
            value={input.partName} 
            onValueChange={(value) => setInput({ ...input, partName: value, defectType: "" })}
          >
            <SelectTrigger id="partName">
              <SelectValue placeholder="부품을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(PART_CODES).map((part) => (
                <SelectItem key={part} value={part}>
                  {part} ({PART_CODES[part]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="defectType">불량 유형</Label>
          <Select 
            value={input.defectType} 
            onValueChange={(value) => setInput({ ...input, defectType: value })}
            disabled={!input.partName}
          >
            <SelectTrigger id="defectType">
              <SelectValue placeholder={input.partName ? "불량 유형을 선택하세요" : "먼저 부품을 선택하세요"} />
            </SelectTrigger>
            <SelectContent>
              {availableDefectTypes.map((defect) => (
                <SelectItem key={defect} value={defect}>
                  {defect}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="processType">공정</Label>
          <Select 
            value={input.processType} 
            onValueChange={(value) => setInput({ ...input, processType: value })}
          >
            <SelectTrigger id="processType">
              <SelectValue placeholder="공정을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(PROCESS_CODES).map((process) => (
                <SelectItem key={process} value={process}>
                  {process} ({PROCESS_CODES[process]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="defectCause">불량 원인</Label>
          <Select 
            value={input.defectCause} 
            onValueChange={(value) => setInput({ ...input, defectCause: value })}
          >
            <SelectTrigger id="defectCause">
              <SelectValue placeholder="불량 원인을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {DEFECT_CAUSES.map((cause) => (
                <SelectItem key={cause} value={cause}>
                  {cause}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="worker">작업자</Label>
          <Select 
            value={input.worker} 
            onValueChange={(value) => setInput({ ...input, worker: value })}
          >
            <SelectTrigger id="worker">
              <SelectValue placeholder="작업자를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {WORKERS.map((worker) => (
                <SelectItem key={worker} value={worker}>
                  {worker}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={handleGenerate} 
        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        disabled={!input.partName || !input.defectType}
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
            <Badge variant="outline" className="bg-card">
              제품: {breakdown.product}
            </Badge>
            <Badge variant="outline" className="bg-card">
              공정: {breakdown.process}
            </Badge>
            <Badge variant="outline" className="bg-card">
              부품: {breakdown.part}
            </Badge>
            <Badge variant="outline" className="bg-card">
              불량: {breakdown.defect}
            </Badge>
          </div>
          
          {input.worker && (
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                작업자: <span className="font-medium text-foreground">{input.worker}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
