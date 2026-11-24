-- Harden public.profiles: stop exposing credentials (pin, pin_ortu) to clients.
-- Root cause: anon & authenticated held FULL table grants, so column-level revokes never worked
-- and anon could read every profile's pin. Client only ever reads its OWN profile (no pin) and
-- updates its OWN profile via RLS, and all credential/server reads use service_role.
-- This migration:
--   1) Revokes ALL from anon (login candidates are served server-side via service_role).
--   2) Restricts authenticated to non-credential columns (SELECT/INSERT/UPDATE), never pin/pin_ortu.
--   3) Keeps service_role (server) with full access.
-- RLS policies (own read/update, guru/admin read all) are untouched and still filter rows.

BEGIN;

REVOKE ALL ON public.profiles FROM anon;

REVOKE ALL ON public.profiles FROM authenticated;

GRANT SELECT (id, nama_siswa, kelas, tempat_magang, created_at, updated_at, no_hp_siswa, no_hp_ortu, no_hp_guru, no_hp_dudi)
  ON public.profiles TO authenticated;

GRANT INSERT (id, nama_siswa, kelas, tempat_magang, created_at, updated_at, no_hp_siswa, no_hp_ortu, no_hp_guru, no_hp_dudi)
  ON public.profiles TO authenticated;

GRANT UPDATE (nama_siswa, kelas, tempat_magang, no_hp_siswa, no_hp_ortu, no_hp_guru, no_hp_dudi)
  ON public.profiles TO authenticated;

GRANT ALL ON public.profiles TO service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';