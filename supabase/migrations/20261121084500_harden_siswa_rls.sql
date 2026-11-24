-- Harden public.siswa: stop exposing credential columns (password_login, pin) to clients.
-- Root cause found on live DB: RLS was DISABLED and anon/authenticated held full table grants,
-- so every earlier column-level REVOKE was ineffective. Fix = table-level REVOKE + enable RLS.
-- The application reads siswa only through the server (service_role, bypasses RLS), so locking
-- clients out does not break any feature.

BEGIN;

-- 1) Pastikan RLS aktif.
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;

-- 2) Cabut SEMUA privilege tabel dari anon & authenticated (ini yang membocorkan password_login/pin).
REVOKE ALL ON public.siswa FROM anon;
REVOKE ALL ON public.siswa FROM authenticated;

-- 3) (Defense-in-depth) pastikan kolom kredensial tidak pernah bisa di-SELECT oleh klien.
REVOKE SELECT (password_login, pin) ON public.siswa FROM anon, authenticated;

-- 4) Klien login (authenticated) hanya boleh baca kolom non-sensitif.
GRANT SELECT (id, user_id, nama_lengkap, nisn, kelas, tempat_pkl, jurusan, nama, is_aktif, status_akun, created_at)
  ON public.siswa TO authenticated;

-- 5) service_role (kode server) tetap punya akses penuh.
GRANT ALL ON public.siswa TO service_role;

-- 6) Rapikan policy: hanya admin (via authenticated) yang boleh akses baris; siswa/guru tidak.
DROP POLICY IF EXISTS "Staff manage siswa" ON public.siswa;
DROP POLICY IF EXISTS "Users read own siswa" ON public.siswa;
DROP POLICY IF EXISTS "Admin manage siswa" ON public.siswa;

CREATE POLICY "Admin manage siswa"
  ON public.siswa
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

COMMIT;

-- Refresh PostgREST schema cache so grant changes take effect immediately.
NOTIFY pgrst, 'reload schema';