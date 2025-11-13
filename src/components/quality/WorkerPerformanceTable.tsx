import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { workerPerformance } from "@/data/sampleDefects";
import { Award } from "lucide-react";

export const WorkerPerformanceTable = () => {
  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
      <div className="flex items-center gap-2 mb-6">
        <Award className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">작업자별 품질 성적</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>작업자</TableHead>
            <TableHead className="text-right">생산량</TableHead>
            <TableHead className="text-right">불량건수</TableHead>
            <TableHead className="text-right">불량률</TableHead>
            <TableHead>품질점수</TableHead>
            <TableHead>등급</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workerPerformance.map((worker, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{worker.name}</TableCell>
              <TableCell className="text-right">{worker.produced}</TableCell>
              <TableCell className="text-right">{worker.defects}</TableCell>
              <TableCell className="text-right">{worker.defectRate}%</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Progress value={worker.score} className="h-2 flex-1" />
                  <span className="text-sm font-semibold text-foreground min-w-[45px]">
                    {worker.score}점
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={worker.score >= 97 ? "default" : worker.score >= 95 ? "secondary" : "outline"}
                  className={
                    worker.score >= 97 
                      ? "bg-success text-success-foreground" 
                      : worker.score >= 95 
                      ? "bg-primary text-primary-foreground" 
                      : ""
                  }
                >
                  {worker.score >= 97 ? "우수" : worker.score >= 95 ? "양호" : "보통"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
