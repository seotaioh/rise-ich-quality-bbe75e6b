import { useState } from "react";
import { X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import type { OptionItem } from "@/hooks/useModelOptions";
import type { DefectTypeMap } from "@/hooks/useModelDefectTypes";

/** 코드가 있는 항목 (공정, 부품) 관리 */
export function CodedOptionManager({
  label,
  items,
  onAdd,
  onRemove,
}: {
  label: string;
  items: OptionItem[];
  onAdd: (item: OptionItem) => void;
  onRemove: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");

  const handleAdd = () => {
    const name = newName.trim();
    const code = newCode.trim();
    if (!name || !code) return;
    if (items.some((i) => i.name === name)) return;
    onAdd({ name, code });
    setNewName("");
    setNewCode("");
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
      >
        <span>{label} 관리 ({items.length}개)</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="p-3 space-y-3">
          {/* 추가 폼 */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="이름"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 h-8 rounded border border-input bg-background px-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <input
              type="text"
              placeholder="코드"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-20 h-8 rounded border border-input bg-background px-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim() || !newCode.trim()}
              className="h-8 px-2 rounded bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              추가
            </button>
          </div>

          {/* 항목 목록 */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {items.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/50 text-sm group"
              >
                <span>
                  {item.name}{" "}
                  <span className="text-muted-foreground">({item.code})</span>
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(item.name)}
                  className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded p-0.5 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** 단순 문자열 항목 (불량원인, 작업자) 관리 */
export function SimpleOptionManager({
  label,
  items,
  onAdd,
  onRemove,
}: {
  label: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newValue, setNewValue] = useState("");

  const handleAdd = () => {
    const value = newValue.trim();
    if (!value) return;
    if (items.includes(value)) return;
    onAdd(value);
    setNewValue("");
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
      >
        <span>{label} 관리 ({items.length}개)</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="p-3 space-y-3">
          {/* 추가 폼 */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`새 ${label}`}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="flex-1 h-8 rounded border border-input bg-background px-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newValue.trim()}
              className="h-8 px-2 rounded bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              추가
            </button>
          </div>

          {/* 항목 목록 */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {items.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/50 text-sm group"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded p-0.5 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** 부품 카테고리별 불량 하위유형 코드 관리 */
export function DefectTypeOptionManager({
  categories,
  defectTypes,
  onAdd,
  onRemove,
}: {
  categories: Array<{ key: string; label: string }>;
  defectTypes: DefectTypeMap;
  onAdd: (partCategory: string, name: string, code: string) => void;
  onRemove: (partCategory: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.key || "1");
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");

  const currentMap = defectTypes[selectedCategory] || {};
  const items = Object.entries(currentMap).map(([name, code]) => ({ name, code }));

  const handleAdd = () => {
    const name = newName.trim();
    const code = newCode.trim();
    if (!selectedCategory || !name || !code) return;
    if (items.some((i) => i.name === name)) return;
    onAdd(selectedCategory, name, code);
    setNewName("");
    setNewCode("");
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
      >
        <span>불량 하위유형 코드 관리</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="p-3 space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">부품 카테고리</label>
            <select
              className="w-full h-8 rounded border border-input bg-background px-2 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="하위유형"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 h-8 rounded border border-input bg-background px-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <input
              type="text"
              placeholder="코드"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-20 h-8 rounded border border-input bg-background px-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim() || !newCode.trim()}
              className="h-8 px-2 rounded bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              추가
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1">
            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1 py-2">등록된 하위유형이 없습니다.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/50 text-sm group"
                >
                  <span>
                    {item.name} <span className="text-muted-foreground">({item.code})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(selectedCategory, item.name)}
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded p-0.5 transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
