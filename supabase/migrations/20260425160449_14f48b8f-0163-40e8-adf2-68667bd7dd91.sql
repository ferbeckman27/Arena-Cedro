CREATE OR REPLACE FUNCTION public.resgatar_fidelidade_cliente(cli_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

    -- Reset total: ao usar a cortesia fidelidade, o contador volta a zero
    -- (não preserva jogos excedentes além dos 10).
    UPDATE public.clientes
    SET reservas_concluidas = 0,
        pontos_fidelidade = 0
    WHERE id = cli_id;

    RETURN TRUE;
END;
$function$;