-- LOT/협력업체 컬럼 추가 (메모 분리 저장)
ALTER TABLE public.worker_submissions
ADD COLUMN IF NOT EXISTS lot_no TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS supplier_name TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_worker_submissions_lot_no
  ON public.worker_submissions (lot_no);

CREATE INDEX IF NOT EXISTS idx_worker_submissions_supplier_name
  ON public.worker_submissions (supplier_name);

-- 기존 메모 태그 데이터 백필: [LOT:...], [SUPPLIER:...]
UPDATE public.worker_submissions
SET lot_no = (regexp_match(memo, '\\[LOT:([^\\]]+)\\]'))[1]
WHERE lot_no = ''
  AND memo ~ '\\[LOT:[^\\]]+\\]';

UPDATE public.worker_submissions
SET supplier_name = (regexp_match(memo, '\\[SUPPLIER:([^\\]]+)\\]'))[1]
WHERE supplier_name = ''
  AND memo ~ '\\[SUPPLIER:[^\\]]+\\]';