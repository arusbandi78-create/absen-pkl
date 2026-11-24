-- Fix: pastikan tabel public.wa_schedule_overrides tersedia dengan semua kolom yang diperlukan
-- Idempotent: aman dijalankan berulang kali (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)

-- 1. Buat tabel jika belum ada
CREATE TABLE IF NOT EXISTS public.wa_schedule_overrides (
  siswa_user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  disable_all BOOLEAN NOT NULL DEFAULT FALSE,
  skip_siswa BOOLEAN NOT NULL DEFAULT FALSE,
  skip_ortu BOOLEAN NOT NULL DEFAULT FALSE,
  skip_dudi BOOLEAN NOT NULL DEFAULT FALSE,
  skip_guru BOOLEAN NOT NULL DEFAULT FALSE,
  skip_pulang BOOLEAN NOT NULL DEFAULT FALSE,
  hari_aktif INTEGER[] NULL,
  tanggal_libur DATE[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tambahkan kolom yang mungkin belum ada di database lama (idempotent)
ALTER TABLE public.wa_schedule_overrides
  ADD COLUMN IF NOT EXISTS disable_all BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS skip_siswa BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS skip_ortu BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS skip_dudi BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS skip_guru BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS skip_pulang BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hari_aktif INTEGER[] NULL,
  ADD COLUMN IF NOT EXISTS tanggal_libur DATE[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3. Grant
GRANT SELECT ON public.wa_schedule_overrides TO authenticated;
GRANT ALL ON public.wa_schedule_overrides TO service_role;

-- 4. RLS
ALTER TABLE public.wa_schedule_overrides ENABLE ROW LEVEL SECURITY;

-- 5. Policies (idempotent via DROP IF EXISTS + CREATE)
DROP POLICY IF EXISTS "Admins read wa overrides" ON public.wa_schedule_overrides;
CREATE POLICY "Admins read wa overrides"
  ON public.wa_schedule_overrides
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Siswa kelola override sendiri" ON public.wa_schedule_overrides;
CREATE POLICY "Siswa kelola override sendiri"
  ON public.wa_schedule_overrides
  FOR ALL
  TO authenticated
  USING (siswa_user_id = auth.uid())
  WITH CHECK (siswa_user_id = auth.uid());