import { DefectCodeGenerator } from "@/components/quality/DefectCodeGenerator";
import { Card } from "@/components/ui/card";
import { Code2 } from "lucide-react";

const DefectCodePage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Code2 className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">불량코드 생성기</h2>
          <p className="text-muted-foreground">부품, 공정, 불량 유형을 선택하여 자동으로 불량코드를 생성합니다</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DefectCodeGenerator />
        
        <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-4">코드 체계 안내</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-foreground mb-2">코드 구조: [AAA][B][CCC][D]</p>
              <ul className="space-y-2 text-muted-foreground">
                <li><span className="font-mono bg-muted px-2 py-1 rounded">AAA</span> = 제품 분류 (C03: ICH-3000)</li>
                <li><span className="font-mono bg-muted px-2 py-1 rounded">B</span> = 공정 분류 (A: 조립, B: 검사, C: 제품검사, D: 출하, E: 고객)</li>
                <li><span className="font-mono bg-muted px-2 py-1 rounded">CCC</span> = 부품 코드 (대분류 + 소분류)</li>
                <li><span className="font-mono bg-muted px-2 py-1 rounded">D</span> = 불량 유형</li>
              </ul>
            </div>

            <div className="border-t border-border pt-4">
              <p className="font-medium text-foreground mb-2">부품 대분류</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>1xx: 사출물 (케이스, 출수부 등)</li>
                <li>2xx: PCB (메인, 파워, EMI 등)</li>
                <li>3xx: 전해조 (전해조, UV 모듈)</li>
                <li>4xx: 센서 (유량센서)</li>
                <li>5xx: 솔레노이드 밸브</li>
                <li>6xx: 하네스</li>
                <li>8xx: 기타 (냉수통, 유로 등)</li>
              </ul>
            </div>

            <div className="border-t border-border pt-4">
              <p className="font-medium text-foreground mb-2">예시</p>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-mono text-lg mb-2 text-foreground">C03B5012</p>
                <p className="text-xs text-muted-foreground">제품: C03 (ICH-3000) | 공정: B (검사) | 부품: 501 (솔밸브-온수) | 불량: 2 (누수)</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DefectCodePage;
