import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { generateDefectCode, DefectCodeInput } from "@/lib/defectCodeGenerator";
import { Sparkles } from "lucide-react";

export const DefectCodeGenerator = () => {
  const [input, setInput] = useState<DefectCodeInput>({
    processType: "공정검사",
    partName: "",
    defectType: "",
    defectCause: "조립불량",
  });
  
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<any>(null);

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
          <Input
            id="partName"
            placeholder="예: 솔밸브-온수"
            value={input.partName}
            onChange={(e) => setInput({ ...input, partName: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="defectType">불량 유형</Label>
          <Input
            id="defectType"
            placeholder="예: 누수"
            value={input.defectType}
            onChange={(e) => setInput({ ...input, defectType: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="processType">공정</Label>
          <Input
            id="processType"
            placeholder="예: 공정검사"
            value={input.processType}
            onChange={(e) => setInput({ ...input, processType: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="defectCause">불량 원인</Label>
          <Input
            id="defectCause"
            placeholder="예: 조립불량"
            value={input.defectCause}
            onChange={(e) => setInput({ ...input, defectCause: e.target.value })}
          />
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
          
          <div className="flex flex-wrap gap-2">
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
        </div>
      )}
    </Card>
  );
};
