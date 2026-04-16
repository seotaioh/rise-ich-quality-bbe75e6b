-- 모델 코드 옵션 타입 확장: 협력업체, 등록장소
ALTER TABLE public.model_code_options
DROP CONSTRAINT IF EXISTS model_code_options_option_type_check;

ALTER TABLE public.model_code_options
ADD CONSTRAINT model_code_options_option_type_check
CHECK (option_type IN ('process', 'part', 'defect_cause', 'worker', 'supplier', 'location'));