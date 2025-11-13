import { Card } from "@/components/ui/card";
import { processList } from "@/data/sampleDefects";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export const ProcessFlowDiagram = () => {
  const getProcessStatus = (id: string) => {
    // Simulate different statuses
    if (id === "LEAK") return "warning";
    if (id === "FINAL") return "ok";
    return "ok";
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-6">공정 흐름도</h3>
      
      {/* Assembly Processes */}
      <div className="mb-6">
        <p className="text-sm font-medium text-muted-foreground mb-3">조립 공정</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {processList.filter(p => p.stage === "조립").map((process, index, arr) => (
            <div key={process.id} className="flex items-center gap-2">
              <div className="flex-shrink-0 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 min-w-[140px]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-primary">{process.name}</p>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <p className="text-xs text-muted-foreground">{process.description}</p>
              </div>
              {index < arr.length - 1 && (
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Inspection Processes */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">검사 공정</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {processList.filter(p => p.stage === "검사").map((process, index, arr) => {
            const status = getProcessStatus(process.id);
            return (
              <div key={process.id} className="flex items-center gap-2">
                <div className={`flex-shrink-0 p-4 rounded-lg border min-w-[140px] ${
                  status === "warning" 
                    ? "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20" 
                    : "bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs font-semibold ${status === "warning" ? "text-warning" : "text-accent"}`}>
                      {process.name}
                    </p>
                    {status === "warning" ? (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{process.description}</p>
                </div>
                {index < arr.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
