-- 작업실적 추가 컬럼: 협력업체 코드, 등록 장소/코드
ALTER TABLE public.worker_submissions
ADD COLUMN IF NOT EXISTS supplier_code TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS registration_place TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS registration_place_code TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_worker_submissions_supplier_code
  ON public.worker_submissions (supplier_code);

CREATE INDEX IF NOT EXISTS idx_worker_submissions_registration_place
  ON public.worker_submissions (registration_place);