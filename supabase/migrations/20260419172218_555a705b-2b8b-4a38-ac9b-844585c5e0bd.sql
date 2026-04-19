-- Função para resgatar o cartão fidelidade: só executa se o cliente tiver >= 10 jogos.
-- Subtrai 10 dos jogos concluídos (preserva excedente) e zera os pontos correspondentes.
CREATE OR REPLACE FUNCTION public.resgatar_fidelidade_cliente(cli_id integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    v_jogos integer;
BEGIN
    SELECT COALESCE(reservas_concluidas, 0) INTO v_jogos
    FROM public.clientes
    WHERE id = cli_id;

    IF v_jogos IS NULL OR v_jogos < 10 THEN
        RETURN FALSE;
    END IF;

    UPDATE public.clientes
    SET reservas_concluidas = v_jogos - 10,
        pontos_fidelidade = GREATEST(COALESCE(pontos_fidelidade, 0) - 100, 0)
    WHERE id = cli_id;

    RETURN TRUE;
END;
$function$;