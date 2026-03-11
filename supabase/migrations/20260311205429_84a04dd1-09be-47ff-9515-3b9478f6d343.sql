
-- Function to hash and store employee password
CREATE OR REPLACE FUNCTION public.set_funcionario_senha(p_id uuid, p_senha text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.funcionarios
    SET senha = crypt(p_senha, gen_salt('bf'))
    WHERE id = p_id;
END;
$$;

-- Insert promo config entries if not exist
INSERT INTO public.configuracoes (chave, valor, descricao, categoria)
VALUES 
  ('promo_ativa', 'false', 'Promoção ativa no site', 'marketing'),
  ('promo_texto', 'Promoção Relâmpago!', 'Texto da promoção', 'marketing'),
  ('promo_link', '', 'Link da promoção', 'marketing'),
  ('pix_chave', '', 'Chave PIX estática da arena', 'pagamentos')
ON CONFLICT (chave) DO NOTHING;

-- Allow inserting into configuracoes
CREATE POLICY "Inserção de configurações" ON public.configuracoes FOR INSERT TO public WITH CHECK (true);
