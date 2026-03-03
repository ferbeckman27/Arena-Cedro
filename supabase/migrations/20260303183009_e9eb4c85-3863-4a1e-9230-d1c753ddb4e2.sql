
-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS public.configuracoes (
  id SERIAL PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  valor TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.configuracoes (chave, valor) VALUES ('manutencao', 'false') ON CONFLICT (chave) DO NOTHING;

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  sobrenome TEXT,
  email TEXT UNIQUE,
  telefone TEXT,
  senha TEXT,
  tipo TEXT DEFAULT 'avulso', -- avulso, mensalista
  dia_fixo TEXT,
  horario_fixo TEXT,
  forma_pagamento TEXT,
  observacoes TEXT,
  cadastrado_por TEXT,
  status_pagamento TEXT DEFAULT 'em_dia',
  reservas_concluidas INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de funcionários
CREATE TABLE IF NOT EXISTS public.funcionarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE,
  senha TEXT,
  tipo TEXT DEFAULT 'atendente', -- administrador, atendente
  telefone TEXT,
  turno TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de turnos
CREATE TABLE IF NOT EXISTS public.turnos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL, -- diurno, noturno
  hora_inicio TIME,
  hora_fim TIME,
  preco_hora NUMERIC(10,2)
);

INSERT INTO public.turnos (id, nome, hora_inicio, hora_fim, preco_hora) VALUES
  (1, 'diurno', '08:00', '17:30', 100.00),
  (2, 'noturno', '18:00', '22:00', 140.00)
ON CONFLICT DO NOTHING;

-- Tabela de blocos de duração
CREATE TABLE IF NOT EXISTS public.blocos (
  id SERIAL PRIMARY KEY,
  duracao_minutos INT NOT NULL,
  label TEXT
);

INSERT INTO public.blocos (id, duracao_minutos, label) VALUES
  (1, 30, '30 min'),
  (2, 60, '1 hora'),
  (3, 90, '1h30')
ON CONFLICT DO NOTHING;

-- Tabela de produtos (venda/aluguel)
CREATE TABLE IF NOT EXISTS public.produtos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'venda', -- venda, aluguel, ambos
  preco_venda NUMERIC(10,2) DEFAULT 0,
  preco_aluguel NUMERIC(10,2) DEFAULT 0,
  quantidade_estoque INT DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de reservas fixas (mensalistas/VIP)
CREATE TABLE IF NOT EXISTS public.reservas_fixas (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES public.clientes(id) ON DELETE CASCADE,
  dia_semana_id INT, -- 1=dom, 2=seg...
  horario_inicio TEXT,
  bloco_id INT REFERENCES public.blocos(id),
  turno_id INT REFERENCES public.turnos(id),
  data_inicio DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela principal de reservas
CREATE TABLE IF NOT EXISTS public.reservas (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  reserva_fixa_id INT REFERENCES public.reservas_fixas(id) ON DELETE SET NULL,
  data_reserva DATE NOT NULL,
  horario_inicio TEXT NOT NULL,
  horario_fim TEXT,
  duracao INT DEFAULT 60,
  bloco_id INT REFERENCES public.blocos(id),
  turno_id INT REFERENCES public.turnos(id),
  tipo TEXT DEFAULT 'avulsa', -- avulsa, fixa
  status TEXT DEFAULT 'pendente', -- pendente, confirmada, concluida, cancelada
  valor_total NUMERIC(10,2) DEFAULT 0,
  valor_sinal NUMERIC(10,2) DEFAULT 0, -- 50% antecipado
  valor_restante NUMERIC(10,2) DEFAULT 0, -- 50% a pagar no dia
  valor_pago_sinal NUMERIC(10,2) DEFAULT 0,
  forma_pagamento TEXT, -- pix, dinheiro
  pago BOOLEAN DEFAULT false,
  data_pagamento TIMESTAMPTZ,
  funcionario_id UUID REFERENCES public.funcionarios(id),
  atendente_id UUID,
  comissao_valor NUMERIC(10,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de pagamentos (histórico e controle do MP)
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id SERIAL PRIMARY KEY,
  reserva_id INT REFERENCES public.reservas(id) ON DELETE CASCADE,
  valor NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pendente', -- pendente, pago, cancelado, reembolsado
  tipo TEXT DEFAULT 'sinal', -- sinal (50%), restante, produto
  forma_pagamento TEXT, -- pix, dinheiro
  id_mercado_pago TEXT, -- ID do pagamento no MP
  codigo_pix TEXT, -- código copia e cola
  qr_code_base64 TEXT,
  data_confirmacao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Itens vinculados a reservas (produtos vendidos/alugados)
CREATE TABLE IF NOT EXISTS public.itens_reserva (
  id SERIAL PRIMARY KEY,
  reserva_id INT REFERENCES public.reservas(id) ON DELETE CASCADE,
  produto_id INT REFERENCES public.produtos(id),
  tipo TEXT DEFAULT 'venda', -- venda, aluguel
  quantidade INT DEFAULT 1,
  preco_unitario NUMERIC(10,2),
  subtotal NUMERIC(10,2),
  pago BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de depoimentos
CREATE TABLE IF NOT EXISTS public.depoimentos (
  id SERIAL PRIMARY KEY,
  cliente_id INT,
  nome TEXT,
  autor TEXT,
  comentario TEXT,
  estrelas INT DEFAULT 5,
  aprovado BOOLEAN DEFAULT false,
  data_publicacao TIMESTAMPTZ DEFAULT now()
);

-- Tabela de observações de clientes
CREATE TABLE IF NOT EXISTS public.observacoes_clientes (
  id SERIAL PRIMARY KEY,
  cliente_id INT REFERENCES public.clientes(id) ON DELETE CASCADE,
  cliente_nome TEXT,
  observacao TEXT,
  tipo TEXT DEFAULT 'neutra', -- positiva, negativa, neutra
  alerta BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de agenda (visão do dia)
CREATE TABLE IF NOT EXISTS public.agenda (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  horario_inicio TIME,
  horario_fim TIME,
  turno TEXT,
  status TEXT DEFAULT 'livre', -- livre, confirmada, pendente
  reserva_id INT REFERENCES public.reservas(id)
);

-- View de detalhes de reserva
CREATE OR REPLACE VIEW public.reservas_detalhes AS
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

-- Função para incrementar fidelidade
CREATE OR REPLACE FUNCTION public.incrementar_fidelidade(cli_id INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.clientes 
  SET reservas_concluidas = reservas_concluidas + 1 
  WHERE id = cli_id;
END;
$$;

-- Enable RLS em todas as tabelas
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas_fixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_reserva ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depoimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observacoes_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para leitura (ajustar depois com autenticação real)
CREATE POLICY "Leitura pública de configurações" ON public.configuracoes FOR SELECT USING (true);
CREATE POLICY "Atualização de configurações" ON public.configuracoes FOR UPDATE USING (true);

CREATE POLICY "Leitura pública de clientes" ON public.clientes FOR SELECT USING (true);
CREATE POLICY "Inserção de clientes" ON public.clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de clientes" ON public.clientes FOR UPDATE USING (true);
CREATE POLICY "Exclusão de clientes" ON public.clientes FOR DELETE USING (true);

CREATE POLICY "Leitura de funcionários" ON public.funcionarios FOR SELECT USING (true);
CREATE POLICY "Inserção de funcionários" ON public.funcionarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de funcionários" ON public.funcionarios FOR UPDATE USING (true);

CREATE POLICY "Leitura de produtos" ON public.produtos FOR SELECT USING (true);
CREATE POLICY "Gestão de produtos insert" ON public.produtos FOR INSERT WITH CHECK (true);
CREATE POLICY "Gestão de produtos update" ON public.produtos FOR UPDATE USING (true);
CREATE POLICY "Gestão de produtos delete" ON public.produtos FOR DELETE USING (true);

CREATE POLICY "Leitura de reservas fixas" ON public.reservas_fixas FOR SELECT USING (true);
CREATE POLICY "Inserção de reservas fixas" ON public.reservas_fixas FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de reservas fixas" ON public.reservas_fixas FOR UPDATE USING (true);

CREATE POLICY "Leitura de reservas" ON public.reservas FOR SELECT USING (true);
CREATE POLICY "Inserção de reservas" ON public.reservas FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de reservas" ON public.reservas FOR UPDATE USING (true);
CREATE POLICY "Exclusão de reservas" ON public.reservas FOR DELETE USING (true);

CREATE POLICY "Leitura de pagamentos" ON public.pagamentos FOR SELECT USING (true);
CREATE POLICY "Inserção de pagamentos" ON public.pagamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de pagamentos" ON public.pagamentos FOR UPDATE USING (true);

CREATE POLICY "Leitura de itens" ON public.itens_reserva FOR SELECT USING (true);
CREATE POLICY "Inserção de itens" ON public.itens_reserva FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de itens" ON public.itens_reserva FOR UPDATE USING (true);

CREATE POLICY "Leitura de depoimentos" ON public.depoimentos FOR SELECT USING (true);
CREATE POLICY "Inserção de depoimentos" ON public.depoimentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de depoimentos" ON public.depoimentos FOR UPDATE USING (true);
CREATE POLICY "Exclusão de depoimentos" ON public.depoimentos FOR DELETE USING (true);

CREATE POLICY "Leitura de observações" ON public.observacoes_clientes FOR SELECT USING (true);
CREATE POLICY "Inserção de observações" ON public.observacoes_clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Exclusão de observações" ON public.observacoes_clientes FOR DELETE USING (true);

CREATE POLICY "Leitura de agenda" ON public.agenda FOR SELECT USING (true);
CREATE POLICY "Inserção de agenda" ON public.agenda FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de agenda" ON public.agenda FOR UPDATE USING (true);
