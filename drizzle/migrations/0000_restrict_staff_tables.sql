DO $$
DECLARE t text; p record;
BEGIN
  FOREACH t IN ARRAY ARRAY['funcionarios','fechamentos_caixa','mensalistas','observacoes_clientes','agenda'] LOOP
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('CREATE POLICY "Equipe logada gerencia %s" ON public.%I FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL)', t, t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Atualização de configurações" ON public.configuracoes;
DROP POLICY IF EXISTS "Inserção de configurações" ON public.configuracoes;
CREATE POLICY "Equipe logada altera configuracoes" ON public.configuracoes FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Equipe logada insere configuracoes" ON public.configuracoes FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);