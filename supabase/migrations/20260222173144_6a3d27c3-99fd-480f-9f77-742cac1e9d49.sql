
-- model_code_options 테이블 생성
CREATE TABLE public.model_code_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id TEXT NOT NULL,
  option_type TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- model_defect_types 테이블 생성
CREATE TABLE public.model_defect_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id TEXT NOT NULL,
  part_category TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.model_code_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_defect_types ENABLE ROW LEVEL SECURITY;

-- model_code_options RLS 정책
CREATE POLICY "Allow public read" ON public.model_code_options FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.model_code_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.model_code_options FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.model_code_options FOR DELETE USING (true);

-- model_defect_types RLS 정책
CREATE POLICY "Allow public read" ON public.model_defect_types FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.model_defect_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.model_defect_types FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.model_defect_types FOR DELETE USING (true);

-- 인덱스 추가
CREATE INDEX idx_model_code_options_model ON public.model_code_options(model_id);
CREATE INDEX idx_model_defect_types_model ON public.model_defect_types(model_id);
