
-- Functions e Triggers

-- Censura de texto
CREATE OR REPLACE FUNCTION public.fn_censurar_texto(p_texto TEXT)
RETURNS TEXT AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT palavra FROM public.palavras_bloqueadas LOOP
        p_texto := regexp_replace(p_texto, r.palavra, '****', 'gi');
    END LOOP;
    RETURN p_texto;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger de censura em depoimentos
CREATE OR REPLACE FUNCTION public.tr_funcao_censurar_depoimento()
RETURNS TRIGGER AS $$
BEGIN
    NEW.comentario := public.fn_censurar_texto(NEW.comentario);
    IF NEW.comentario LIKE '%****%' THEN
        NEW.censurado := TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_censurar_depoimento ON public.depoimentos;
CREATE TRIGGER tr_censurar_depoimento
BEFORE INSERT ON public.depoimentos
FOR EACH ROW EXECUTE FUNCTION public.tr_funcao_censurar_depoimento();

-- Comissão automática (5%)
CREATE OR REPLACE FUNCTION public.calcular_comissao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.comissao_valor := COALESCE(NEW.valor_total, 0) * 0.05;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_comissao ON public.reservas;
CREATE TRIGGER trigger_comissao
BEFORE INSERT OR UPDATE ON public.reservas
FOR EACH ROW EXECUTE FUNCTION public.calcular_comissao();

-- Baixa de estoque
CREATE OR REPLACE FUNCTION public.baixar_estoque_venda()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.produtos
    SET quantidade_estoque = quantidade_estoque - NEW.quantidade
    WHERE id = NEW.produto_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS tr_baixar_estoque ON public.itens_reserva;
CREATE TRIGGER tr_baixar_estoque
AFTER INSERT ON public.itens_reserva
FOR EACH ROW EXECUTE FUNCTION public.baixar_estoque_venda();

-- Timestamp automático em configuracoes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_config_timestamp ON public.configuracoes;
CREATE TRIGGER tr_update_config_timestamp
BEFORE UPDATE ON public.configuracoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Login cliente (com bcrypt)
CREATE OR REPLACE FUNCTION public.login_cliente(p_email TEXT, p_senha TEXT)
RETURNS TABLE (id INT, nome TEXT, email TEXT, tipo TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.nome::TEXT, c.email::TEXT, COALESCE(c.tipo, 'cliente')::TEXT
    FROM public.clientes c
    WHERE c.email = p_email
    AND c.senha = crypt(p_senha, c.senha);
END;
$$;

-- Login funcionário (com bcrypt)
CREATE OR REPLACE FUNCTION public.login_funcionario(p_email TEXT, p_senha TEXT)
RETURNS TABLE (id UUID, nome TEXT, tipo TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT f.id, f.nome::TEXT, COALESCE(f.tipo, 'atendente')::TEXT
    FROM public.funcionarios f
    WHERE (f.email = p_email OR f.email_corporativo = p_email)
    AND f.senha = crypt(p_senha, f.senha)
    AND f.ativo = TRUE;
END;
$$;

-- Verificar disponibilidade
CREATE OR REPLACE FUNCTION public.sp_verificar_disponibilidade(
    p_data DATE, p_horario TIME, p_duracao_min INT
)
RETURNS TABLE (disponivel BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_horario_fim TIME;
BEGIN
    v_horario_fim := p_horario + (p_duracao_min || ' minutes')::interval;

    IF EXISTS (
        SELECT 1 FROM public.manutencao
        WHERE ativo = 1
        AND p_data BETWEEN DATE(data_inicio) AND DATE(data_fim)
    ) THEN
        RETURN QUERY SELECT FALSE;
        RETURN;
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.reservas r
        JOIN public.blocos b ON r.bloco_id = b.id
        WHERE r.data_reserva = p_data
        AND r.status IN ('confirmada', 'pendente')
        AND (
            r.horario_inicio::TIME < v_horario_fim AND
            (r.horario_inicio::TIME + (b.duracao_minutos || ' minutes')::interval) > p_horario
        )
    ) THEN
        RETURN QUERY SELECT FALSE;
        RETURN;
    END IF;

    RETURN QUERY SELECT TRUE;
END;
$$;

-- Atualizar incrementar_fidelidade para aceitar INT (compatível com tabela clientes)
CREATE OR REPLACE FUNCTION public.incrementar_fidelidade(cli_id INT)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    UPDATE public.clientes
    SET reservas_concluidas = COALESCE(reservas_concluidas, 0) + 1,
        pontos_fidelidade = COALESCE(pontos_fidelidade, 0) + 10
    WHERE id = cli_id;
END;
$$;
