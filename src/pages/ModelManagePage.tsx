import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Plus, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { useModel } from "@/contexts/ModelContext";
import { useToast } from "@/hooks/use-toast";

const inputCls =
  "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const ModelManagePage = () => {
  const { models, selectedModel, addModel, removeModel, setSelectedModelId } = useModel();
  const { toast } = useToast();

  const [newId, setNewId] = useState("");
  const [newProductCode, setNewProductCode] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // 5초 후 삭제 확인 자동 취소
  useEffect(() => {
    if (confirmDeleteId) {
      timerRef.current = setTimeout(() => setConfirmDeleteId(null), 5000);
      return () => clearTimeout(timerRef.current);
    }
  }, [confirmDeleteId]);

  const handleAdd = () => {
    const id = newId.trim();
    const productCode = newProductCode.trim().toUpperCase();
    if (!id) {
      toast({ title: "모델명을 입력하세요", variant: "destructive" });
      return;
    }
    if (!productCode) {
      toast({ title: "제품코드를 입력하세요", variant: "destructive" });
      return;
    }
    if (models.some((m) => m.id === id)) {
      toast({ title: "이미 존재하는 모델명입니다", variant: "destructive" });
      return;
    }
    addModel({ id, label: id, productCode });
    toast({ title: `${id} 모델이 추가되었습니다` });
    setNewId("");
    setNewProductCode("");
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    // 2단계 확인 완료 → 삭제 실행
    const success = removeModel(id);
    if (success) {
      toast({ title: `${id} 모델이 삭제되었습니다` });
    }
    setConfirmDeleteId(null);
  };

  const isSelected = (id: string) => selectedModel.id === id;
  const canDelete = (id: string) => models.length > 1 && !isSelected(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold text-foreground">모델 관리</h2>
          <p className="text-muted-foreground">생산 모델을 추가하거나 삭제할 수 있습니다</p>
        </div>
      </div>

      {/* 모델 추가 */}
      <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" /> 새 모델 추가
        </h3>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1.5">모델명</label>
            <input
              type="text"
              className={inputCls + " w-full"}
              placeholder="예: HBS-5000"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="w-[140px]">
            <label className="block text-sm font-medium mb-1.5">제품코드</label>
            <input
              type="text"
              className={inputCls + " w-full"}
              placeholder="예: H05"
              value={newProductCode}
              onChange={(e) => setNewProductCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              maxLength={5}
            />
          </div>
          <Button onClick={handleAdd} className="h-10">
            <Plus className="h-4 w-4 mr-1" /> 추가
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          * 제품코드는 불량코드 생성 시 앞자리(AAA)에 사용됩니다.
        </p>
      </Card>

      {/* 모델 목록 */}
      <Card className="p-6 shadow-[var(--shadow-soft)] border-border/50">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" /> 등록된 모델 ({models.length}개)
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>모델명</TableHead>
                <TableHead>제품코드</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-foreground">{m.label}</TableCell>
                  <TableCell>
                    <span className="font-mono bg-muted px-2 py-1 rounded text-sm">{m.productCode}</span>
                  </TableCell>
                  <TableCell>
                    {isSelected(m.id) ? (
                      <Badge className="bg-primary text-primary-foreground">
                        <CheckCircle className="h-3 w-3 mr-1" /> 현재 선택
                      </Badge>
                    ) : (
                      <button
                        onClick={() => setSelectedModelId(m.id)}
                        className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                      >
                        선택하기
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!canDelete(m.id) ? (
                      <span className="text-xs text-muted-foreground">
                        {isSelected(m.id) ? "선택 중 삭제 불가" : "최소 1개 필요"}
                      </span>
                    ) : confirmDeleteId === m.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(m.id)}
                          className="animate-pulse"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 mr-1" /> 정말 삭제
                        </Button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(m.id)}
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> 삭제
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default ModelManagePage;
