-- Restore the favorites table when an environment missed the original migration.
-- IF NOT EXISTS makes this safe for databases where the table already exists.
CREATE TABLE IF NOT EXISTS public.guru_favorit_siswa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guru_id uuid NOT NULL,
  siswa_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guru_id, siswa_id)
);

GRANT SELECT, INSERT, DELETE ON public.guru_favorit_siswa TO authenticated;
GRANT ALL ON public.guru_favorit_siswa TO service_role;

ALTER TABLE public.guru_favorit_siswa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guru read own favorites" ON public.guru_favorit_siswa;
CREATE POLICY "Guru read own favorites"
  ON public.guru_favorit_siswa FOR SELECT
  TO authenticated
  USING (auth.uid() = guru_id);

DROP POLICY IF EXISTS "Guru insert own favorites" ON public.guru_favorit_siswa;
CREATE POLICY "Guru insert own favorites"
  ON public.guru_favorit_siswa FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = guru_id
    AND (has_role(auth.uid(), 'guru'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

DROP POLICY IF EXISTS "Guru delete own favorites" ON public.guru_favorit_siswa;
CREATE POLICY "Guru delete own favorites"
  ON public.guru_favorit_siswa FOR DELETE
  TO authenticated
  USING (auth.uid() = guru_id);

CREATE INDEX IF NOT EXISTS guru_favorit_siswa_guru_idx
  ON public.guru_favorit_siswa(guru_id);

-- Refresh PostgREST's schema cache so the table is immediately discoverable.
NOTIFY pgrst, 'reload schema';
