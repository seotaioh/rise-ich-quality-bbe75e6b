export interface TraceTags {
  lotNo: string;
  supplier: string;
  supplierCode: string;
  registrationPlace: string;
  registrationPlaceCode: string;
}

const LOT_TAG_REGEX = /^\[LOT:([^\]]+)\]$/i;
const SUPPLIER_TAG_REGEX = /^\[SUPPLIER:([^\]]+)\]$/i;
const SUPPLIER_CODE_TAG_REGEX = /^\[SUPPLIER_CODE:([^\]]+)\]$/i;
const PLACE_TAG_REGEX = /^\[PLACE:([^\]]+)\]$/i;
const PLACE_CODE_TAG_REGEX = /^\[PLACE_CODE:([^\]]+)\]$/i;
const INLINE_LOT_REGEX = /(LOT\s*[:\-]\s*([A-Za-z0-9\-_./]+))/i;

export function parseTraceTags(memo: string | undefined): TraceTags {
  if (!memo) {
    return {
      lotNo: "",
      supplier: "",
      supplierCode: "",
      registrationPlace: "",
      registrationPlaceCode: "",
    };
  }

  const lines = memo
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let lotNo = "";
  let supplier = "";
  let supplierCode = "";
  let registrationPlace = "";
  let registrationPlaceCode = "";

  for (const line of lines) {
    const lotTag = line.match(LOT_TAG_REGEX);
    if (lotTag && !lotNo) {
      lotNo = lotTag[1].trim();
    }

    const supplierTag = line.match(SUPPLIER_TAG_REGEX);
    if (supplierTag && !supplier) {
      supplier = supplierTag[1].trim();
    }

    const supplierCodeTag = line.match(SUPPLIER_CODE_TAG_REGEX);
    if (supplierCodeTag && !supplierCode) {
      supplierCode = supplierCodeTag[1].trim();
    }

    const placeTag = line.match(PLACE_TAG_REGEX);
    if (placeTag && !registrationPlace) {
      registrationPlace = placeTag[1].trim();
    }

    const placeCodeTag = line.match(PLACE_CODE_TAG_REGEX);
    if (placeCodeTag && !registrationPlaceCode) {
      registrationPlaceCode = placeCodeTag[1].trim();
    }
  }

  if (!lotNo) {
    const inlineLot = memo.match(INLINE_LOT_REGEX);
    lotNo = inlineLot?.[2]?.trim() || "";
  }

  return { lotNo, supplier, supplierCode, registrationPlace, registrationPlaceCode };
}

export function stripTraceTags(memo: string | undefined): string {
  if (!memo) return "";

  return memo
    .split("\n")
    .filter((line) => {
      const normalized = line.trim();
      return !LOT_TAG_REGEX.test(normalized)
        && !SUPPLIER_TAG_REGEX.test(normalized)
        && !SUPPLIER_CODE_TAG_REGEX.test(normalized)
        && !PLACE_TAG_REGEX.test(normalized)
        && !PLACE_CODE_TAG_REGEX.test(normalized);
    })
    .join("\n")
    .trim();
}

export function buildMemoWithTraceTags(baseMemo: string, lotNo: string, supplier: string): string {
  const lines: string[] = [];

  const normalizedLot = lotNo.trim();
  const normalizedSupplier = supplier.trim();
  const normalizedMemo = baseMemo.trim();

  if (normalizedLot) {
    lines.push(`[LOT:${normalizedLot}]`);
  }

  if (normalizedSupplier) {
    lines.push(`[SUPPLIER:${normalizedSupplier}]`);
  }

  if (normalizedMemo) {
    lines.push(normalizedMemo);
  }

  return lines.join("\n");
}