ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS presenca text DEFAULT 'pendente';
COMMENT ON COLUMN public.reservas.presenca IS 'pendente | compareceu | faltou | cancelou';