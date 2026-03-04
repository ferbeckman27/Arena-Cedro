
-- Add access counting columns to funcionarios table
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS total_acessos integer DEFAULT 0;
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS ultimo_acesso timestamp with time zone;

-- Create function to increment access count
CREATE OR REPLACE FUNCTION public.registrar_acesso(p_funcionario_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.funcionarios
    SET total_acessos = COALESCE(total_acessos, 0) + 1,
        ultimo_acesso = NOW()
    WHERE id = p_funcionario_id;
END;
$$;

-- Create function to reset password for clientes
CREATE OR REPLACE FUNCTION public.redefinir_senha_cliente(p_email text, p_nova_senha text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.clientes
    SET senha = crypt(p_nova_senha, gen_salt('bf'))
    WHERE email = p_email;
    
    RETURN FOUND;
END;
$$;
