CREATE OR REPLACE FUNCTION public.calcular_comissao()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.comissao_valor := COALESCE(NEW.valor_total, 0) * 0.02;
    RETURN NEW;
END;
$function$;