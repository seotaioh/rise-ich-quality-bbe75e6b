-- 모델별 코드 옵션 테이블 (공정, 부품, 불량원인, 작업자)
CREATE TABLE public.model_code_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id TEXT NOT NULL,
  option_type TEXT NOT NULL CHECK (option_type IN ('process', 'part', 'defect_cause', 'worker')),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_model_code_options_model ON public.model_code_options (model_id, option_type);

ALTER TABLE public.model_code_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.model_code_options FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.model_code_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.model_code_options FOR DELETE USING (true);
CREATE POLICY "Allow public update" ON public.model_code_options FOR UPDATE USING (true);

-- 모델별 불량유형 매핑 테이블 (부품 카테고리별 불량코드)
CREATE TABLE public.model_defect_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id TEXT NOT NULL,
  part_category TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_model_defect_types_model ON public.model_defect_types (model_id, part_category);

ALTER TABLE public.model_defect_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.model_defect_types FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.model_defect_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.model_defect_types FOR DELETE USING (true);
CREATE POLICY "Allow public update" ON public.model_defect_types FOR UPDATE USING (true);
