
-- Tabelas faltantes

CREATE TABLE IF NOT EXISTS public.dias_semana (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(20) UNIQUE NOT NULL,
    codigo INT UNIQUE NOT NULL
);

ALTER TABLE public.dias_semana ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de dias_semana" ON public.dias_semana FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.mensalistas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    dia_semana VARCHAR(10),
    horario TIME,
    metodo_pgto VARCHAR(20),
    status_pagamento TEXT DEFAULT 'em_dia',
    responsavel VARCHAR(100),
    observacao TEXT
);

ALTER TABLE public.mensalistas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de mensalistas" ON public.mensalistas FOR SELECT USING (true);
CREATE POLICY "Inserção de mensalistas" ON public.mensalistas FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de mensalistas" ON public.mensalistas FOR UPDATE USING (true);
CREATE POLICY "Exclusão de mensalistas" ON public.mensalistas FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS public.palavras_bloqueadas (
    id SERIAL PRIMARY KEY,
    palavra VARCHAR(50) NOT NULL UNIQUE
);

ALTER TABLE public.palavras_bloqueadas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de palavras_bloqueadas" ON public.palavras_bloqueadas FOR SELECT USING (true);
CREATE POLICY "Inserção de palavras_bloqueadas" ON public.palavras_bloqueadas FOR INSERT WITH CHECK (true);
CREATE POLICY "Exclusão de palavras_bloqueadas" ON public.palavras_bloqueadas FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS public.manutencao (
    id SERIAL PRIMARY KEY,
    ativo INT DEFAULT 0,
    data_inicio TIMESTAMP,
    data_fim TIMESTAMP,
    descricao TEXT
);

ALTER TABLE public.manutencao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de manutencao" ON public.manutencao FOR SELECT USING (true);
CREATE POLICY "Atualização de manutencao" ON public.manutencao FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS public.fechamentos_caixa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    data DATE NOT NULL,
    valor_pix NUMERIC DEFAULT 0,
    valor_dinheiro NUMERIC DEFAULT 0,
    fechado_por UUID
);

ALTER TABLE public.fechamentos_caixa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de fechamentos_caixa" ON public.fechamentos_caixa FOR SELECT USING (true);
CREATE POLICY "Inserção de fechamentos_caixa" ON public.fechamentos_caixa FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de fechamentos_caixa" ON public.fechamentos_caixa FOR UPDATE USING (true);
