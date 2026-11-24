-- Keep the deployed attendance constraint aligned with all attendance kinds
-- supported by the application, including warning and disciplinary records.
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_jenis_check;
ALTER TABLE public.attendance
  ADD CONSTRAINT attendance_jenis_check
  CHECK (jenis IN ('masuk','pulang','izin','sakit','peringatan','sp1','sp2','sp3'));
