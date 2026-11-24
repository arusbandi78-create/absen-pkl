-- Add the missing profiles.pin_ortu column.
-- The application (getRekap, ortu login, PIN-ortu edit) and generated types expect it,
-- but it was never created in the DB. Without it, getRekap's profiles SELECT fails with
-- "column profiles.pin_ortu does not exist", which surfaces as "Siswa tidak ditemukan"
-- when opening a student's rekap detail page.
-- Default '1122' matches the app's fallback (?? "1122"). NOT NULL DEFAULT backfills existing rows.

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pin_ortu TEXT NOT NULL DEFAULT '1122';

-- Server (service_role) keeps full access; admin/server code reads & updates pin_ortu.
GRANT ALL ON public.profiles TO service_role;

COMMIT;

-- Refresh PostgREST schema cache so the new column is immediately queryable.
NOTIFY pgrst, 'reload schema';