
-- 1. Inserir chave PIX estática na configuracoes
INSERT INTO public.configuracoes (chave, valor, descricao, categoria)
VALUES ('pix_chave', '00020126580014br.gov.bcb.pix0136arena-cedro-pix@exemplo.com5204000053039865802BR5925ARENA CEDRO SOCIETY6009SAO LUIS62070503***6304', 'Chave PIX estática para pagamento livre', 'pagamento')
ON CONFLICT (chave) DO NOTHING;

-- 2. Inserir timeout PIX
INSERT INTO public.configuracoes (chave, valor, descricao, categoria)
VALUES ('pix_timeout_minutos', '8', 'Tempo limite em minutos para pagamento PIX', 'pagamento')
ON CONFLICT (chave) DO NOTHING;

-- 3. Função para devolver estoque de itens alugados
CREATE OR REPLACE FUNCTION public.devolver_estoque_aluguel(p_reserva_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.produtos p
    SET quantidade_estoque = p.quantidade_estoque + ir.quantidade
    FROM public.itens_reserva ir
    WHERE ir.reserva_id = p_reserva_id
      AND ir.tipo = 'aluguel'
      AND ir.produto_id = p.id;
    
    UPDATE public.itens_reserva
    SET pago = true
    WHERE reserva_id = p_reserva_id
      AND tipo = 'aluguel';
END;
$$;

-- 4. Função para cancelar reservas com PIX expirado
CREATE OR REPLACE FUNCTION public.cancelar_reservas_pix_expiradas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.reservas
    SET status = 'cancelada'
    WHERE status = 'pendente'
      AND forma_pagamento = 'pix'
      AND created_at < NOW() - INTERVAL '8 minutes';

    UPDATE public.pagamentos
    SET status = 'expirado'
    WHERE status = 'pendente'
      AND forma_pagamento = 'pix'
      AND created_at < NOW() - INTERVAL '8 minutes';
END;
$$;

-- 5. Policy para deletar itens_reserva
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'itens_reserva' AND policyname = 'Exclusão de itens_reserva'
    ) THEN
        CREATE POLICY "Exclusão de itens_reserva" ON public.itens_reserva FOR DELETE TO public USING (true);
    END IF;
END $$;

-- 6. Policy para deletar reservas_fixas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'reservas_fixas' AND policyname = 'Exclusão de reservas_fixas'
    ) THEN
        CREATE POLICY "Exclusão de reservas_fixas" ON public.reservas_fixas FOR DELETE TO public USING (true);
    END IF;
END $$;
