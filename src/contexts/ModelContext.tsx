import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface ModelConfig {
  id: string;
  label: string;
  productCode: string;
}

const DEFAULT_MODELS: ModelConfig[] = [
  { id: "ICH-3000", label: "ICH-3000", productCode: "C03" },
  { id: "EP-7000", label: "EP-7000", productCode: "E07" },
];

const MODEL_STORAGE_KEY = "ich-quality-selected-model";
const MODELS_STORAGE_KEY = "ich-quality-models";

function loadModels(): ModelConfig[] {
  try {
    const raw = localStorage.getItem(MODELS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_MODELS;
}

function saveModels(models: ModelConfig[]) {
  localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(models));
}

interface ModelContextValue {
  selectedModel: ModelConfig;
  setSelectedModelId: (id: string) => void;
  models: ModelConfig[];
  addModel: (model: ModelConfig) => boolean;
  removeModel: (id: string) => boolean;
}

const ModelContext = createContext<ModelContextValue | null>(null);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const [models, setModels] = useState<ModelConfig[]>(loadModels);

  const [selectedId, setSelectedId] = useState<string>(() => {
    try {
      return localStorage.getItem(MODEL_STORAGE_KEY) || models[0].id;
    } catch {
      return models[0].id;
    }
  });

  const selectedModel = models.find((m) => m.id === selectedId) || models[0];

  const setSelectedModelId = useCallback((id: string) => {
    setSelectedId(id);
    localStorage.setItem(MODEL_STORAGE_KEY, id);
  }, []);

  const addModel = useCallback((model: ModelConfig): boolean => {
    let added = false;
    setModels((prev) => {
      if (prev.some((m) => m.id === model.id)) return prev;
      const next = [...prev, model];
      saveModels(next);
      added = true;
      return next;
    });
    return added;
  }, []);

  const removeModel = useCallback((id: string): boolean => {
    let removed = false;
    setModels((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((m) => m.id !== id);
      if (next.length === prev.length) return prev;
      saveModels(next);
      removed = true;
      // 삭제된 모델이 현재 선택 모델이면 첫 번째 모델로 전환
      setSelectedId((prevId) => {
        if (prevId === id) {
          const newId = next[0].id;
          localStorage.setItem(MODEL_STORAGE_KEY, newId);
          return newId;
        }
        return prevId;
      });
      return next;
    });
    return removed;
  }, []);

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModelId, models, addModel, removeModel }}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModel = (): ModelContextValue => {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModel must be used inside ModelProvider");
  return ctx;
};
