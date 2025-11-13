import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { sampleDefects } from "@/data/sampleDefects";
import { generateDefectCode } from "@/lib/defectCodeGenerator";

export const RecentDefectsTable = () => {
  const recentDefects = sampleDefects.slice(0, 8);

  const getDefectCode = (defect: typeof sampleDefects[0]) => {
    const [type, part] = defect.defectType.split("/");
    return generateDefectCode({
      processType: defect.process,
      partName: part || type,
      defectType: type,
      defectCause: defect.defectCause,
    }).code;
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-6">최근 불량 발생 내역</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>일자</TableHead>
              <TableHead>불량코드</TableHead>
              <TableHead>불량유형</TableHead>
              <TableHead>불량원인</TableHead>
              <TableHead>처리결과</TableHead>
              <TableHead className="text-right">수량</TableHead>
              <TableHead>분류</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentDefects.map((defect) => (
              <TableRow key={defect.id}>
                <TableCell className="whitespace-nowrap">{defect.date}</TableCell>
                <TableCell className="font-mono text-sm font-semibold text-primary">
                  {getDefectCode(defect)}
                </TableCell>
                <TableCell>{defect.defectType}</TableCell>
                <TableCell>{defect.defectCause}</TableCell>
                <TableCell className="max-w-[200px] truncate">{defect.treatment}</TableCell>
                <TableCell className="text-right">{defect.defectCount}</TableCell>
                <TableCell>
                  <Badge 
                    variant={defect.category === "기능불량" ? "destructive" : "secondary"}
                    className={defect.category === "재작업" ? "bg-warning text-warning-foreground" : ""}
                  >
                    {defect.category}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
