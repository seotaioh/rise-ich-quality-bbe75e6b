import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck } from "lucide-react";
import { WorkerPerformanceTable } from "@/components/quality/WorkerPerformanceTable";

const WorkerDefects = () => {
  const workerDefects = [
    {
      worker: "김철수",
      team: "1공정",
      totalProduction: 850,
      totalDefects: 23,
      defectRate: 2.7,
      topDefects: [
        { type: "체결불량", count: 12, percent: 52.2 },
        { type: "누수", count: 7, percent: 30.4 },
        { type: "외관불량", count: 4, percent: 17.4 },
      ],
    },
    {
      worker: "이영희",
      team: "2공정",
      totalProduction: 920,
      totalDefects: 18,
      defectRate: 2.0,
      topDefects: [
        { type: "조립불량", count: 9, percent: 50.0 },
        { type: "접촉불량", count: 6, percent: 33.3 },
        { type: "체결불량", count: 3, percent: 16.7 },
      ],
    },
    {
      worker: "박민수",
      team: "3공정",
      totalProduction: 780,
      totalDefects: 31,
      defectRate: 4.0,
      topDefects: [
        { type: "누수", count: 18, percent: 58.1 },
        { type: "체결불량", count: 8, percent: 25.8 },
        { type: "조립불량", count: 5, percent: 16.1 },
      ],
    },
    {
      worker: "정수진",
      team: "4공정",
      totalProduction: 1050,
      totalDefects: 15,
      defectRate: 1.4,
      topDefects: [
        { type: "접촉불량", count: 8, percent: 53.3 },
        { type: "체결불량", count: 5, percent: 33.3 },
        { type: "외관불량", count: 2, percent: 13.3 },
      ],
    },
    {
      worker: "최동욱",
      team: "5공정",
      totalProduction: 890,
      totalDefects: 27,
      defectRate: 3.0,
      topDefects: [
        { type: "전류0값", count: 11, percent: 40.7 },
        { type: "접촉불량", count: 10, percent: 37.0 },
        { type: "단선", count: 6, percent: 22.2 },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <UserCheck className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">작업자별 불량유형 분석</h2>
          <p className="text-muted-foreground">작업자별 주요 불량 패턴 및 개선 포인트</p>
        </div>
      </div>

      {/* Worker Cards with Defect Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {workerDefects.map((worker) => (
          <Card key={worker.worker} className="p-6 shadow-[var(--shadow-soft)] border-border/50 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{worker.worker}</h3>
                <Badge variant="outline" className="mt-1">{worker.team}</Badge>
              </div>
              <div className={`text-2xl font-bold ${
                worker.defectRate > 3 ? "text-destructive" :
                worker.defectRate > 2 ? "text-orange-500" :
                "text-green-500"
              }`}>
                {worker.defectRate}%
              </div>
            </div>

            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">생산량:</span>
                <span className="font-medium text-foreground">{worker.totalProduction.toLocaleString()}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">총 불량:</span>
                <span className="font-medium text-destructive">{worker.totalDefects}건</span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground mb-3">주요 불량 유형</h4>
              <div className="space-y-2">
                {worker.topDefects.map((defect, idx) => (
                  <div key={defect.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{defect.type}</span>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">{defect.count}건</Badge>
                        <span className="text-xs text-muted-foreground">{defect.percent}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          idx === 0 ? "bg-destructive" :
                          idx === 1 ? "bg-orange-500" :
                          "bg-yellow-500"
                        }`}
                        style={{ width: `${defect.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed Table */}
      <Card className="shadow-[var(--shadow-soft)] border-border/50">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">작업자별 불량 상세 분석</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>작업자</TableHead>
                  <TableHead>소속</TableHead>
                  <TableHead className="text-right">생산량</TableHead>
                  <TableHead className="text-right">불량 건수</TableHead>
                  <TableHead className="text-right">불량률</TableHead>
                  <TableHead>주요 불량 1순위</TableHead>
                  <TableHead>주요 불량 2순위</TableHead>
                  <TableHead>개선 필요도</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workerDefects.map((worker) => (
                  <TableRow key={worker.worker}>
                    <TableCell className="font-medium">{worker.worker}</TableCell>
                    <TableCell>{worker.team}</TableCell>
                    <TableCell className="text-right">{worker.totalProduction.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{worker.totalDefects}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={worker.defectRate > 3 ? "destructive" : worker.defectRate > 2 ? "default" : "secondary"}>
                        {worker.defectRate}%
                      </Badge>
                    </TableCell>
                    <TableCell>{worker.topDefects[0].type}</TableCell>
                    <TableCell>{worker.topDefects[1].type}</TableCell>
                    <TableCell>
                      <Badge variant={worker.defectRate > 3 ? "destructive" : "secondary"}>
                        {worker.defectRate > 3 ? "높음" : worker.defectRate > 2 ? "중간" : "낮음"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* Overall Performance */}
      <WorkerPerformanceTable />
    </div>
  );
};

export default WorkerDefects;
