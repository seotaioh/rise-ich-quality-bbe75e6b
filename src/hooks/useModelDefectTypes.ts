import { useState, useEffect, useCallback } from "react";

// 부품 카테고리(첫 자리) → { 불량유형이름: 코드 }
export type DefectTypeMap = Record<string, Record<string, string>>;

// ── ICH-3000 기본 불량유형 매핑 ──
const ICH3000_DEFECT_TYPES: DefectTypeMap = {
  "1": { "변형": "1", "크랙": "2", "누수": "3", "체결불량": "4" },
  "2": { "단락": "1", "단선": "2", "접촉불량": "3", "전류0값": "4", "전류 0값": "4", "미전원": "5", "코팅불량": "6", "코팅묻음": "6", "점멸": "7", "램프점멸": "7", "미작동": "8" },
  "3": { "누수": "1", "전류0값": "2", "전류 0값": "2", "체결불량": "3" },
  "4": { "센서불량": "1", "접촉불량": "2", "누수": "3" },
  "5": { "누수": "2", "이물질": "3", "체결불량": "4", "작동불량": "5" },
  "6": { "단선": "1", "접촉불량": "2", "미체결": "3", "체결불량": "3" },
  "7": { "막힘": "1", "누수": "2" },
  "8": { "누수": "2", "체결불량": "3", "튜브이탈": "4" },
};

// ── EP-7000 기본 불량유형 매핑 ──
const EP7000_DEFECT_TYPES: DefectTypeMap = {
  "1": { "변형": "1", "크랙": "2", "스크래치": "3", "체결불량": "4" },
  "2": { "단락": "1", "단선": "2", "접촉불량": "3", "미전원": "4", "화면불량": "5", "미작동": "6" },
  "3": { "막힘": "1", "누수": "2", "성능저하": "3" },
  "4": { "센서불량": "1", "접촉불량": "2", "오측정": "3" },
  "5": { "누수": "1", "작동불량": "2", "체결불량": "3", "소음": "4" },
  "6": { "단선": "1", "접촉불량": "2", "미체결": "3" },
  "7": { "냉각불량": "1", "히팅불량": "2", "누수": "3", "소음": "4" },
  "8": { "누수": "1", "체결불량": "2", "파손": "3" },
};

const MODEL_DEFECT_DEFAULTS: Record<string, DefectTypeMap> = {
  "ICH-3000": ICH3000_DEFECT_TYPES,
  "EP-7000": EP7000_DEFECT_TYPES,
};

function getDefaultsForModel(modelId: string): DefectTypeMap {
  return MODEL_DEFECT_DEFAULTS[modelId] || ICH3000_DEFECT_TYPES;
}

// ── localStorage 유틸 ──
function storageKey(modelId: string) {
  return `ich-quality-defect-types-${modelId}`;
}

function loadLocal(modelId: string): DefectTypeMap | null {
  try {
    const raw = localStorage.getItem(storageKey(modelId));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveLocal(modelId: string, data: DefectTypeMap) {
  localStorage.setItem(storageKey(modelId), JSON.stringify(data));
}

// localStorage만 사용 (DB 테이블 없음)

// ── Hook ──
export function useModelDefectTypes(modelId: string) {
  const [defectTypes, setDefectTypes] = useState<DefectTypeMap>(getDefaultsForModel(modelId));

  useEffect(() => {
    const localData = loadLocal(modelId);
    if (localData) {
      setDefectTypes(localData);
    } else {
      setDefectTypes(getDefaultsForModel(modelId));
    }

    // localStorage에서만 로드
  }, [modelId]);

  // 특정 부품 카테고리의 불량유형 목록 반환
  const getDefectTypesForCategory = useCallback(
    (partCategory: string): string[] => {
      const map = defectTypes[partCategory];
      return map ? Object.keys(map) : [];
    },
    [defectTypes],
  );

  // 불량 코드 조회
  const findDefectCode = useCallback(
    (partCode: string, defectName: string): string => {
      const majorCategory = partCode.charAt(0);
      const map = defectTypes[majorCategory];
      if (!map) return "9";
      for (const [key, value] of Object.entries(map)) {
        if (defectName.includes(key)) return value;
      }
      return "9";
    },
    [defectTypes],
  );

  // 불량유형 추가
  const addDefectType = useCallback(
    (partCategory: string, name: string, code: string) => {
      setDefectTypes((prev) => {
        const next = { ...prev, [partCategory]: { ...(prev[partCategory] || {}), [name]: code } };
        saveLocal(modelId, next);
        // localStorage only
        return next;
      });
    },
    [modelId],
  );

  // 불량유형 삭제
  const removeDefectType = useCallback(
    (partCategory: string, name: string) => {
      setDefectTypes((prev) => {
        const catMap = { ...(prev[partCategory] || {}) };
        delete catMap[name];
        const next = { ...prev, [partCategory]: catMap };
        saveLocal(modelId, next);
        // localStorage only
        return next;
      });
    },
    [modelId],
  );

  // 기본값 복원
  const resetAll = useCallback(() => {
    const d = getDefaultsForModel(modelId);
    setDefectTypes(d);
    localStorage.removeItem(storageKey(modelId));
    // localStorage only
  }, [modelId]);

  return { defectTypes, getDefectTypesForCategory, findDefectCode, addDefectType, removeDefectType, resetAll };
}
