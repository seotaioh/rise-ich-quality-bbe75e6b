import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { DefectTrendChart } from "@/components/quality/DefectTrendChart";
import { TopDefectsTable } from "@/components/quality/TopDefectsTable";

const ProcessDefects = () => {
  const processes = [
    { name: "1공정", code: "A", defectRate: 2.3, total: 45, top: "체결불량" },
    { name: "2공정", code: "A", defectRate: 1.8, total: 32, top: "조립불량" },
    { name: "3공정", code: "A", defectRate: 3.1, total: 58, top: "누수" },
    { name: "4공정", code: "A", defectRate: 1.5, total: 28, top: "체결불량" },
    { name: "5공정", code: "A", defectRate: 2.7, total: 51, top: "접촉불량" },
    { name: "공정검사", code: "B", defectRate: 4.2, total: 89, top: "누수" },
    { name: "에이징", code: "B", defectRate: 1.2, total: 18, top: "기능불량" },
    { name: "물제거", code: "C", defectRate: 0.8, total: 12, top: "체결불량" },
    { name: "리크검사", code: "C", defectRate: 3.5, total: 67, top: "누수" },
    { name: "제품검사", code: "C", defectRate: 2.1, total: 41, top: "외관불량" },
    { name: "출하검사", code: "D", defectRate: 0.5, total: 8, top: "포장불량" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">공정별 불량유형 분석</h2>
          <p className="text-muted-foreground">각 공정별 주요 불량 유형 및 발생 현황</p>
        </div>
      </div>

      {/* Process Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {processes.map((process) => (
          <Card key={process.name} className="p-4 hover:shadow-lg transition-shadow border-border/50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{process.name}</h3>
                <Badge variant="outline" className="mt-1 text-xs">
                  공정코드: {process.code}
                </Badge>
              </div>
              <div className={`text-2xl font-bold ${
                process.defectRate > 3 ? "text-destructive" :
                process.defectRate > 2 ? "text-orange-500" :
                "text-green-500"
              }`}>
                {process.defectRate}%
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">총 불량:</span>
                <span className="font-medium text-foreground">{process.total}건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">주요 불량:</span>
                <span className="font-medium text-foreground">{process.top}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    process.defectRate > 3 ? "bg-destructive" :
                    process.defectRate > 2 ? "bg-orange-500" :
                    "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(process.defectRate * 20, 100)}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DefectTrendChart />
        <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-4">공정별 불량 유형 분포</h3>
          <div className="space-y-4">
            {[
              { process: "공정검사", types: [{ name: "누수", count: 45 }, { name: "체결불량", count: 28 }, { name: "외관불량", count: 16 }] },
              { process: "리크검사", types: [{ name: "누수", count: 52 }, { name: "압력불량", count: 15 }] },
              { process: "3공정", types: [{ name: "누수", count: 38 }, { name: "조립불량", count: 20 }] },
            ].map((item) => (
              <div key={item.process} className="border-l-4 border-primary pl-4">
                <h4 className="font-medium text-foreground mb-2">{item.process}</h4>
                <div className="space-y-1">
                  {item.types.map((type) => (
                    <div key={type.name} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{type.name}</span>
                      <Badge variant="secondary">{type.count}건</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Defects by Process */}
      <TopDefectsTable />
    </div>
  );
};

export default ProcessDefects;
