
-- Colunas faltantes em tabelas existentes

-- clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS salvar_senha BOOLEAN DEFAULT FALSE;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS pontos_fidelidade INT DEFAULT 0;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS aceitou_termos BOOLEAN DEFAULT FALSE;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- funcionarios
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS sobrenome VARCHAR(100);
ALTER TABLE public.funcionarios ADD COLUMN IF NOT EXISTS email_corporativo VARCHAR(150);

-- turnos
ALTER TABLE public.turnos ADD COLUMN IF NOT EXISTS valor_hora DECIMAL(10,2);
ALTER TABLE public.turnos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- blocos (já existe como "blocos", adicionar colunas faltantes)
ALTER TABLE public.blocos ADD COLUMN IF NOT EXISTS descricao VARCHAR(50);
ALTER TABLE public.blocos ADD COLUMN IF NOT EXISTS multiplicador DECIMAL(3,2);
ALTER TABLE public.blocos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- produtos
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS estoque_minimo INT DEFAULT 5;

-- depoimentos
ALTER TABLE public.depoimentos ADD COLUMN IF NOT EXISTS censurado BOOLEAN DEFAULT FALSE;
ALTER TABLE public.depoimentos ADD COLUMN IF NOT EXISTS nome_exibicao VARCHAR(255);

-- reservas
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS id_mercado_pago TEXT;
ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS pix_copia_e_cola TEXT;

-- pagamentos
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS comprovante_path VARCHAR(255);
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS data_expiracao TIMESTAMP;

-- configuracoes
ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS descricao VARCHAR(255);
ALTER TABLE public.configuracoes ADD COLUMN IF NOT EXISTS categoria VARCHAR(50);

-- reservas_fixas: adicionar FK para dias_semana se não existir
ALTER TABLE public.reservas_fixas ADD COLUMN IF NOT EXISTS data_fim DATE;

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);
CREATE INDEX IF NOT EXISTS idx_reservas_data ON public.reservas(data_reserva);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON public.pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_funcionarios_tipo ON public.funcionarios(tipo);
CREATE INDEX IF NOT EXISTS idx_funcionarios_email ON public.funcionarios(email);
