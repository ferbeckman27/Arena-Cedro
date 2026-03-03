
-- Fix: Security Definer View - recriar como SECURITY INVOKER
DROP VIEW IF EXISTS public.reservas_detalhes;
CREATE VIEW public.reservas_detalhes WITH (security_invoker = true) AS
SELECT 
  r.id,
  r.data_reserva,
  r.horario_inicio,
  r.horario_fim,
  r.tipo,
  r.status,
  r.valor_total,
  r.valor_sinal,
  r.valor_restante,
  r.forma_pagamento,
  r.pago,
  r.observacoes,
  c.nome as cliente_nome,
  f.nome as funcionario_nome
FROM public.reservas r
LEFT JOIN public.clientes c ON r.cliente_id = c.id
LEFT JOIN public.funcionarios f ON r.funcionario_id = f.id;

-- Fix: Enable RLS on turnos and blocos
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de turnos" ON public.turnos FOR SELECT USING (true);
CREATE POLICY "Leitura pública de blocos" ON public.blocos FOR SELECT USING (true);
