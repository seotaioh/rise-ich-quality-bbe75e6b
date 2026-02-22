// ICH-3000 Defect Code Generation Engine
// Format: [AAA][B][CCC][D]
// AAA = Product Classification (C03)
// B = Process Classification (A-E)
// CCC = Part Code (Major + Minor)
// D = Defect Type

export interface DefectCodeInput {
  processType: string; // 공정 타입
  partName: string; // 부품명
  defectType: string; // 불량 유형
  defectCause: string; // 불량 원인
  worker?: string; // 작업자 (선택)
}

export interface DefectCodeResult {
  code: string;
  breakdown: {
    product: string;
    process: string;
    part: string;
    defect: string;
  };
  description: string;
}

// Product Classification - default C03 for ICH-3000
const DEFAULT_PRODUCT_CODE = "C03";

// Process Classification
export const PROCESS_CODES: Record<string, string> = {
  "1공정": "A",
  "2공정": "A",
  "3공정": "A",
  "4공정": "A",
  "5공정": "A",
  "조립": "A",
  "공정검사": "B",
  "에이징": "B",
  "물제거": "C",
  "리크검사": "C",
  "제품검사": "C",
  "출하검사": "D",
  "고객": "E",
};

// Part Code Mapping (Major + Minor Classification)
export const PART_CODES: Record<string, string> = {
  // 1xx: 사출물
  "전면케이스": "101",
  "출수코크": "102",
  "출수부 커버": "103",
  "출수부": "102",
  
  // 2xx: PCB
  "메인PCB": "201",
  "메인 PCB": "201",
  "파워PCB": "202",
  "파워 PCB": "202",
  "EMI 콤프": "203",
  "EMI 콤프 PCB": "203",
  "SMPS": "204",
  "SMP": "204",
  
  // 3xx: 전해조
  "전해조": "301",
  "UV 모듈 서브체": "302",
  "UV 모듈": "302",
  
  // 4xx: 센서
  "1차 유량센서": "401",
  "2차 유량센서": "402",
  
  // 5xx: 솔레노이드 밸브
  "솔밸브-온수": "501",
  "솔밸브 온수": "501",
  "솔밸브-입수": "502",
  "솔밸브 입수": "502",
  "솔밸브-정수": "503",
  "솔밸브 정수": "503",
  "솔밸브": "501",
  
  // 6xx: 하네스
  "전해조P하네스": "601",
  "전해조P 하네스": "601",
  "전해조 하네스": "601",
  "온수하네스": "602",
  "온수 하네스": "602",
  "메인-SMPS하네스": "603",
  "SMPS 하네스": "603",
  "EMI-콤프 PCB 하네스": "604",
  "EMI 하네스": "604",
  
  // 7xx: 필터 (Not used in current data)
  "필터": "701",
  
  // 8xx: 기타 (유로/냉수)
  "냉수통 튜브": "801",
  "냉수통": "802",
  "냉수통 입수 휘팅": "802",
  "냉수통 휘팅": "802",
  "입수부 휘팅": "803",
  "입수부": "803",
  "출수부 휘팅": "804",
  "나사": "805",
  "나사류": "805",
};

// Defect Type Codes (dependent on part category)
export const DEFECT_CODES: Record<string, Record<string, string>> = {
  "1": { // 사출물
    "변형": "1",
    "크랙": "2",
    "누수": "3",
    "체결불량": "4",
  },
  "2": { // PCB
    "단락": "1",
    "단선": "2",
    "접촉불량": "3",
    "전류0값": "4",
    "전류 0값": "4",
    "미전원": "5",
    "코팅불량": "6",
    "코팅묻음": "6",
    "점멸": "7",
    "램프점멸": "7",
    "미작동": "8",
  },
  "3": { // 전해조
    "누수": "1",
    "전류0값": "2",
    "전류 0값": "2",
    "체결불량": "3",
  },
  "4": { // 센서
    "센서불량": "1",
    "접촉불량": "2",
    "누수": "3",
  },
  "5": { // 솔밸브
    "누수": "2",
    "이물질": "3",
    "체결불량": "4",
    "작동불량": "5",
  },
  "6": { // 하네스
    "단선": "1",
    "접촉불량": "2",
    "미체결": "3",
    "체결불량": "3",
  },
  "7": { // 필터
    "막힘": "1",
    "누수": "2",
  },
  "8": { // 기타 유로/냉수
    "누수": "2",
    "체결불량": "3",
    "튜브이탈": "4",
  },
};

function findPartCode(partName: string): string {
  // Direct match
  if (PART_CODES[partName]) {
    return PART_CODES[partName];
  }
  
  // Fuzzy match - find best match
  for (const [key, value] of Object.entries(PART_CODES)) {
    if (partName.includes(key) || key.includes(partName)) {
      return value;
    }
  }
  
  return "999"; // Unknown part
}

function findDefectCode(partCode: string, defectDescription: string): string {
  const majorCategory = partCode.charAt(0);
  const defectMap = DEFECT_CODES[majorCategory];
  
  if (!defectMap) return "9";
  
  // Direct match
  for (const [key, value] of Object.entries(defectMap)) {
    if (defectDescription.includes(key)) {
      return value;
    }
  }
  
  return "9"; // Unknown defect
}

function extractProcessFromCause(cause: string): string {
  if (cause.includes("조립")) return "B";
  if (cause.includes("자재")) return "A";
  if (cause.includes("기능")) return "C";
  return "B"; // Default to process inspection
}

export function generateDefectCode(input: DefectCodeInput, productCode: string = DEFAULT_PRODUCT_CODE): DefectCodeResult {
  
  // 2. Process Code - 사용자가 선택한 공정을 우선 사용
  const processCode = PROCESS_CODES[input.processType] || "B";
  
  // 3. Part Code
  const partCode = findPartCode(input.partName);
  
  // 4. Defect Code
  const defectCode = findDefectCode(partCode, input.defectType);
  
  const fullCode = `${productCode}${processCode}${partCode}${defectCode}`;
  
  return {
    code: fullCode,
    breakdown: {
      product: productCode,
      process: processCode,
      part: partCode,
      defect: defectCode,
    },
    description: `${input.partName} - ${input.defectType}`,
  };
}

// 동적 옵션을 사용한 코드 생성 (코드값을 직접 전달)
// defectTypesMap: 외부에서 모델별 불량유형 매핑을 전달 (없으면 기본 DEFECT_CODES 사용)
export function generateDefectCodeDynamic(
  processCode: string,
  partCode: string,
  defectType: string,
  partName: string,
  productCode: string = DEFAULT_PRODUCT_CODE,
  defectTypesMap?: Record<string, Record<string, string>>,
): DefectCodeResult {
  const defectCode = defectTypesMap
    ? findDefectCodeFromMap(partCode, defectType, defectTypesMap)
    : findDefectCode(partCode, defectType);
  const fullCode = `${productCode}${processCode}${partCode}${defectCode}`;

  return {
    code: fullCode,
    breakdown: {
      product: productCode,
      process: processCode,
      part: partCode,
      defect: defectCode,
    },
    description: `${partName} - ${defectType}`,
  };
}

// 외부 매핑을 사용한 불량코드 조회
function findDefectCodeFromMap(
  partCode: string,
  defectDescription: string,
  defectTypesMap: Record<string, Record<string, string>>,
): string {
  const majorCategory = partCode.charAt(0);
  const defectMap = defectTypesMap[majorCategory];
  if (!defectMap) return "9";
  for (const [key, value] of Object.entries(defectMap)) {
    if (defectDescription.includes(key)) return value;
  }
  return "9";
}

// Batch processing for multiple defects
export function generateDefectCodes(inputs: DefectCodeInput[], productCode: string = DEFAULT_PRODUCT_CODE): DefectCodeResult[] {
  return inputs.map(input => generateDefectCode(input, productCode));
}
