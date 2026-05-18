-- Fjern UNIQUE-constraint som hindrer logging av samme topp flere ganger
ALTER TABLE public.ascents DROP CONSTRAINT IF EXISTS ascents_user_id_peak_id_key;

-- Behold composite index for ytelse (ikke-unik)
CREATE INDEX IF NOT EXISTS ascents_user_peak_idx ON public.ascents (user_id, peak_id);
