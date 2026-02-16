-- 모델 컬럼 추가 (다중 모델 지원)
ALTER TABLE public.worker_submissions
ADD COLUMN IF NOT EXISTS model TEXT NOT NULL DEFAULT 'ICH-3000';

CREATE INDEX IF NOT EXISTS idx_worker_submissions_model ON public.worker_submissions (model);
