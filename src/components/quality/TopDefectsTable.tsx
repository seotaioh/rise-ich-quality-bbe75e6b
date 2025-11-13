import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { topDefectParts } from "@/data/sampleDefects";

export const TopDefectsTable = () => {
  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-6">부품별 TOP 불량</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>부품명</TableHead>
            <TableHead className="text-right">불량건수</TableHead>
            <TableHead className="text-right">불량률</TableHead>
            <TableHead className="text-right">상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topDefectParts.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.part}</TableCell>
              <TableCell className="text-right">{item.defects}건</TableCell>
              <TableCell className="text-right">{item.rate}%</TableCell>
              <TableCell className="text-right">
                <Badge 
                  variant={item.rate > 5 ? "destructive" : item.rate > 3 ? "secondary" : "default"}
                  className={item.rate > 5 ? "" : item.rate > 3 ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground"}
                >
                  {item.rate > 5 ? "주의" : item.rate > 3 ? "관리" : "양호"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
