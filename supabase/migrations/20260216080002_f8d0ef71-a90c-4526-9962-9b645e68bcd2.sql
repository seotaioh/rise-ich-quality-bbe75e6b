
-- 생산 실적 테이블
CREATE TABLE public.worker_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_name TEXT NOT NULL,
  worker_code TEXT NOT NULL DEFAULT '',
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  work_time TEXT NOT NULL DEFAULT '',
  process TEXT NOT NULL,
  production_qty INTEGER NOT NULL DEFAULT 0,
  tasks TEXT[] NOT NULL DEFAULT '{}',
  defects JSONB NOT NULL DEFAULT '[]',
  memo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_worker_submissions_work_date ON public.worker_submissions (work_date);
CREATE INDEX idx_worker_submissions_worker_name ON public.worker_submissions (worker_name);

-- RLS 활성화 (현재 인증 없이 공개 접근 허용)
ALTER TABLE public.worker_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.worker_submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.worker_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.worker_submissions FOR DELETE USING (true);
CREATE POLICY "Allow public update" ON public.worker_submissions FOR UPDATE USING (true);
