CREATE DATABASE arena_cedro;
USE arena_cedro;

CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    salvar_senha BOOLEAN DEFAULT FALSE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    pontos_fidelidade INT DEFAULT 0,
    reservas_concluidas INT DEFAULT 0,
    tipo ENUM('normal', 'vip') DEFAULT 'normal',
    aceitou_termos BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_telefone (telefone)
);

CREATE TABLE funcionarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    email_pessoal VARCHAR(150),
    telefone VARCHAR(20) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('atendente', 'administrador') NOT NULL,
    salvar_senha BOOLEAN DEFAULT FALSE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    aceitou_termos BOOLEAN DEFAULT FALSE,
    INDEX idx_tipo (tipo),
    INDEX idx_email (email)
);

CREATE TABLE turnos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    valor_hora DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    UNIQUE KEY uk_turno_horario (nome, horario_inicio, horario_fim)
);

CREATE TABLE blocos_horario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    duracao_minutos INT NOT NULL,
    descricao VARCHAR(50) NOT NULL,
    multiplicador DECIMAL(3,2) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    CHECK (duracao_minutos IN (30, 60, 90)),
    UNIQUE KEY uk_duracao (duracao_minutos)
);

CREATE TABLE dias_semana (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(20) NOT NULL,
    codigo INT NOT NULL,
    UNIQUE KEY uk_nome (nome),
    UNIQUE KEY uk_codigo (codigo)
);

CREATE TABLE reservas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    funcionario_id INT,
    data_reserva DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    bloco_id INT NOT NULL,
    turno_id INT NOT NULL,
    tipo ENUM('avulsa', 'fixa') DEFAULT 'avulsa',
    status ENUM('pendente', 'confirmada', 'cancelada', 'concluida') DEFAULT 'pendente',
    valor_total DECIMAL(10,2) NOT NULL,
    forma_pagamento ENUM('pix', 'dinheiro') DEFAULT NULL,
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento DATETIME DEFAULT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE SET NULL,
    FOREIGN KEY (bloco_id) REFERENCES blocos_horario(id),
    FOREIGN KEY (turno_id) REFERENCES turnos(id),
    INDEX idx_data_reserva (data_reserva),
    INDEX idx_status (status),
    INDEX idx_cliente (cliente_id),
    UNIQUE KEY uk_reserva_horario (data_reserva, horario_inicio)
);

CREATE TABLE reservas_fixas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    dia_semana_id INT NOT NULL,
    horario_inicio TIME NOT NULL,
    bloco_id INT NOT NULL,
    turno_id INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (dia_semana_id) REFERENCES dias_semana(id),
    FOREIGN KEY (bloco_id) REFERENCES blocos_horario(id),
    FOREIGN KEY (turno_id) REFERENCES turnos(id),
    UNIQUE KEY uk_reserva_fixa (cliente_id, dia_semana_id, horario_inicio)
);

CREATE TABLE produtos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    tipo ENUM('venda', 'aluguel', 'ambos') NOT NULL,
    preco_venda DECIMAL(10,2),
    preco_aluguel DECIMAL(10,2),
    quantidade_estoque INT DEFAULT 0,
    estoque_minimo INT DEFAULT 5,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nome (nome),
    INDEX idx_tipo (tipo)
);

CREATE TABLE itens_reserva (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reserva_id INT NOT NULL,
    produto_id INT NOT NULL,
    tipo ENUM('venda', 'aluguel') NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    pago BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    INDEX idx_reserva (reserva_id)
);

CREATE TABLE pagamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reserva_id INT NOT NULL,
    tipo ENUM('reserva', 'produto') NOT NULL,
    forma_pagamento ENUM('pix', 'dinheiro') NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    codigo_pix TEXT,
    qr_code_path VARCHAR(255),
    status ENUM('pendente', 'confirmado', 'cancelado') DEFAULT 'pendente',
    data_pagamento DATETIME,
    data_confirmacao DATETIME,
    comprovante_path VARCHAR(255),
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
    INDEX idx_reserva (reserva_id),
    INDEX idx_status (status)
);

CREATE TABLE depoimentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    comentario TEXT NOT NULL,
    estrelas INT NOT NULL CHECK (estrelas >= 1 AND estrelas <= 5),
    aprovado BOOLEAN DEFAULT FALSE,
    data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    censurado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_aprovado (aprovado),
    INDEX idx_cliente (cliente_id)
);

CREATE TABLE observacoes_clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    funcionario_id INT NOT NULL,
    tipo ENUM('positiva', 'negativa', 'neutra') DEFAULT 'neutra',
    observacao TEXT NOT NULL,
    alerta BOOLEAN DEFAULT FALSE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE,
    INDEX idx_cliente (cliente_id),
    INDEX idx_alerta (alerta)
);

CREATE TABLE manutencao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    motivo TEXT NOT NULL,
    criado_por INT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES funcionarios(id),
    INDEX idx_ativo (ativo),
    INDEX idx_periodo (data_inicio, data_fim)
);

CREATE TABLE logs_atividades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    usuario_tipo ENUM('cliente', 'atendente', 'administrador') NOT NULL,
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    ip_address VARCHAR(45),
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usuario (usuario_id, usuario_tipo),
    INDEX idx_data (data_hora)
);

CREATE TABLE IF NOT EXISTS galeria_arena (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100),
    url_midia VARCHAR(255) NOT NULL,
    tipo ENUM('foto', 'video') DEFAULT 'foto',
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    data_upload DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE configuracoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao VARCHAR(255),
    categoria VARCHAR(50),
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_chave (chave)
);

CREATE TABLE palavras_bloqueadas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    palavra VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE mensalistas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100),
    dia_semana VARCHAR(10),
    horario TIME,
    metodo_pgto VARCHAR(20)
);

CREATE TABLE alertas_clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT,
    observacao TEXT,
    tipo VARCHAR(20)
    valor_mensal DECIMAL(10,2)
);

INSERT INTO palavras_bloqueadas (palavra) VALUES 
("Porra"), ("Merda"), ("Lixo"), ("Bosta"), ("Caralho"), ("Puta"), ("Putaria"), 
("Vagabundo"), ("Desgraça"), ("Inferno"), ("Cacete"), ("Fodase"), ("Foder"),
("Corno"), ("Otário"), ("Verme"), ("Inútil"), ("Escroto"), ("Ladrão"), 
("Safado"), ("Horrível"), ("Péssimo"), ("Fraude"), ("Engano");

INSERT INTO turnos (nome, horario_inicio, horario_fim, valor_hora) VALUES
('Diurno', '08:00:00', '17:00:00', 80.00),
('Noturno', '18:00:00', '22:00:00', 120.00);

INSERT INTO blocos_horario (duracao_minutos, descricao, multiplicador) VALUES
(30, '30 minutos', 0.5),
(60, '1 hora', 1.0),
(90, '1 hora e 30 minutos', 1.5);

INSERT INTO dias_semana (nome, codigo) VALUES
('Domingo', 0),
('Segunda', 1),
('Terça', 2),
('Quarta', 3),
('Quinta', 4),
('Sexta', 5),
('Sábado', 6);

INSERT INTO galeria_arena (titulo, url_midia, tipo, ordem) VALUES
('Campo Society - Vista 1', 'media/campo-1.jpg', 'foto', 1),
('Campo Society - Vista 2', 'media/campo-2.jpg', 'foto', 2),
('Campo Society - Vista 3', 'media/campo-4.jpg', 'foto', 3),
('Campo Society - Vista Panorâmica 1', 'media/campohorizontal-3.jpg', 'foto', 4),
('Vídeo 1', 'media/video-1.mp4', 'video', 5),
('Vídeo 2', 'media/video-2.mp4', 'video', 6),
('Vídeo 3', 'media/video-3.mp4', 'video', 7),
('Vídeo 4', 'media/video-4.mp4', 'video', 8),
('Vídeo 5', 'media/video-5.mp4', 'video', 5),
('Vídeo 6', 'media/video-6.mp4', 'video', 6),
('Vídeo 7', 'media/video-7.mp4', 'video', 7),
('Vídeo 8', 'media/video-8.mp4', 'video', 8);

INSERT INTO configuracoes (chave, valor, descricao, categoria) VALUES
('fidelidade_jogos_necessarios', '10', 'Quantidade de jogos para ganhar 1 grátis', 'fidelidade'),
('fidelidade_premio', '1', 'Quantidade de jogos grátis ao completar fidelidade', 'fidelidade'),
('horario_abertura', '08:00', 'Horário de abertura da arena', 'horarios'),
('horario_fechamento', '22:00', 'Horário de fechamento da arena', 'horarios'),
('telefone_contato', '(98) 99991-0535', 'Telefone para contato e Reservas', 'contato'),
('email_contato', 'contato@arenacedro.com', 'Email para contato', 'contato'),
('endereco', ' Av. Trindade, 3126, SJ de Ribamar-MA', 'Endereço completo', 'localizacao'),
('latitude', '-23.550520', 'Coordenada latitude', 'localizacao'),
('longitude', '-46.633308', 'Coordenada longitude', 'localizacao'),
('whatsapp_notificacoes', 'true', 'Ativar notificações por WhatsApp', 'notificacoes'),
('email_notificacoes', 'true', 'Ativar notificações por email', 'notificacoes'),
('tempo_limite_pagamento', '30', 'Tempo limite para pagamento (minutos)', 'reservas'),
('bloqueio_manutencao', 'true', 'Bloquear agendamentos durante manutenção', 'sistema'),
('link_instagram', 'https://instagram.com/arenacedrofut7', 'Link oficial Instagram', 'social'),
('whatsapp_mensagem_padrao', 'Olá! Sua reserva na Arena Cedro está confirmada. Segue informações abaixo e pdf das regras de uso', 'Texto base para disparo WhatsApp', 'notificacoes'),
('link_google_maps', 'https://maps.app.goo.gl/exemplo', 'Link da localização Arena', 'localizacao');

INSERT INTO produtos (nome, descricao, tipo, preco_venda, preco_aluguel, quantidade_estoque) VALUES
('Bola Society', 'Bola profissional tamanho 5', 'ambos', 150.00, 20.00, 10),
('Colete', 'Colete para divisão de times', 'aluguel', NULL, 5.00, 50),
('Apito', 'Apito para árbitro', 'venda', 15.00, NULL, 20),
('Redes', 'Redes para gol', 'aluguel', NULL, 30.00, 4),
('Cones', 'Cones para marcação', 'ambos', 40.00, 10.00, 30);

INSERT INTO clientes (nome, sobrenome, email, telefone, senha, tipo) VALUES
('João', 'Silva', 'joao@email.com', '(11) 99999-9999', SHA2('Senha123!', 256), 'vip');

INSERT INTO funcionarios (nome, sobrenome, email, email_pessoal, telefone, senha, tipo) VALUES
('Maria', 'Santos', 'mariasantos@atendcedro.com', 'maria.pessoal@email.com', '(11) 98888-8888', SHA2('SenhaAtend123!', 256), 'atendente'),
('Carlos', 'Admin', 'carlosadmin@admincedro.com', 'carlos.pessoal@email.com', '(11) 97777-7777', SHA2('SenhaAdmin456!', 256), 'administrador');

ALTER TABLE funcionarios ADD COLUMN turno VARCHAR(20) DEFAULT 'DIURNO', 'NOTURNO';
ALTER TABLE mensalistas ADD COLUMN status_pagamento ENUM('em_dia', 'em_atraso') DEFAULT 'em_dia';
ALTER TABLE mensalistas ADD COLUMN responsavel VARCHAR(100);
ALTER TABLE mensalistas ADD COLUMN observacao TEXT;

CREATE VIEW view_agenda_simplificada AS
SELECT 
    r.data_reserva,
    r.horario_inicio,
    DATE_ADD(r.horario_inicio, INTERVAL bh.duracao_minutos MINUTE) AS horario_fim,
    CASE 
        WHEN r.status = 'confirmada' THEN 'vermelho'
        WHEN r.status = 'pendente' THEN 'amarelo'
        ELSE 'verde'
    END AS cor_status,
    r.status,
    t.nome AS turno,
    bh.descricao AS duracao
FROM reservas r
JOIN turnos t ON r.turno_id = t.id
JOIN blocos_horario bh ON r.bloco_id = bh.id
WHERE r.data_reserva >= CURDATE();

CREATE VIEW view_relatorio_reservas AS
SELECT 
    DATE_FORMAT(r.data_reserva, '%Y-%m') AS mes,
    t.nome AS turno,
    COUNT(*) AS total_reservas,
    SUM(CASE WHEN r.pago = 1 THEN r.valor_total ELSE 0 END) AS valor_total,
    SUM(CASE WHEN r.forma_pagamento = 'pix' THEN 1 ELSE 0 END) AS pagamentos_pix,
    SUM(CASE WHEN r.forma_pagamento = 'dinheiro' THEN 1 ELSE 0 END) AS pagamentos_dinheiro,
    AVG(r.valor_total) AS valor_medio
FROM reservas r
JOIN turnos t ON r.turno_id = t.id
GROUP BY mes, turno;

CREATE VIEW view_produtos_populares AS
SELECT 
    p.nome,
    p.tipo,
    SUM(ir.quantidade) AS total_vendido,
    SUM(ir.subtotal) AS receita_total
FROM produtos p
JOIN itens_reserva ir ON p.id = ir.produto_id
WHERE ir.pago = 1
GROUP BY p.id
ORDER BY total_vendido DESC;

DELIMITER $$
CREATE TRIGGER tr_atualizar_fidelidade
AFTER UPDATE ON reservas
FOR EACH ROW
BEGIN
    IF NEW.status = 'concluida' AND OLD.status != 'concluida' THEN
        UPDATE clientes 
        SET 
            reservas_concluidas = reservas_concluidas + 1,
            pontos_fidelidade = pontos_fidelidade + 1
        WHERE id = NEW.cliente_id;
        
        UPDATE clientes 
        SET pontos_fidelidade = 0
        WHERE id = NEW.cliente_id 
        AND reservas_concluidas % 10 = 0;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER tr_log_reserva
AFTER INSERT ON reservas
FOR EACH ROW
BEGIN
    INSERT INTO logs_atividades (usuario_id, usuario_tipo, acao, descricao)
    VALUES (
        NEW.cliente_id,
        'cliente',
        'NOVA_RESERVA',
        CONCAT('Reserva criada para ', NEW.data_reserva, ' às ', NEW.horario_inicio)
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_relatorio_mensal(
    IN p_mes INT,
    IN p_ano INT
)
BEGIN
    SELECT 
        r.data_reserva,
        c.nome AS cliente,
        t.nome AS turno,
        r.valor_total,
        r.forma_pagamento,
        r.pago,
        COUNT(ir.id) AS produtos_vendidos,
        SUM(ir.subtotal) AS receita_produtos
    FROM reservas r
    JOIN clientes c ON r.cliente_id = c.id
    JOIN turnos t ON r.turno_id = t.id
    LEFT JOIN itens_reserva ir ON r.id = ir.reserva_id
    WHERE MONTH(r.data_reserva) = p_mes 
    AND YEAR(r.data_reserva) = p_ano
    GROUP BY r.id
    ORDER BY r.data_reserva, r.horario_inicio;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_verificar_disponibilidade(
    IN p_data DATE,
    IN p_horario TIME,
    IN p_duracao INT
)
BEGIN
    DECLARE v_horario_fim TIME;
    DECLARE v_disponivel BOOLEAN DEFAULT TRUE;
    
    SET v_horario_fim = DATE_ADD(p_horario, INTERVAL p_duracao MINUTE);
    IF EXISTS (
        SELECT 1 FROM manutencao 
        WHERE ativo = 1 
        AND p_data BETWEEN DATE(data_inicio) AND DATE(data_fim)
        AND (
            (TIME(data_inicio) <= v_horario_fim AND TIME(data_fim) >= p_horario) OR
            (TIME(data_inicio) <= p_horario AND TIME(data_fim) >= v_horario_fim)
        )
    ) THEN
        SET v_disponivel = FALSE;
    ELSEIF EXISTS (
        SELECT 1 FROM reservas r
        JOIN blocos_horario bh ON r.bloco_id = bh.id
        WHERE r.data_reserva = p_data
        AND r.status IN ('confirmada', 'pendente')
        AND (
            (r.horario_inicio < v_horario_fim AND 
             DATE_ADD(r.horario_inicio, INTERVAL bh.duracao_minutos MINUTE) > p_horario)
        )
    ) THEN
        SET v_disponivel = FALSE;
    END IF;
    
    SELECT v_disponivel AS disponivel;
END$$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION fn_censurar_texto(p_texto TEXT) 
RETURNS TEXT
DETERMINISTIC
BEGIN
    DECLARE v_palavra VARCHAR(50);
    DECLARE done INT DEFAULT FALSE;
    DECLARE cur CURSOR FOR SELECT palavra FROM palavras_bloqueadas;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_palavra;
        IF done THEN
            LEAVE read_loop;
        END IF;
        SET p_texto = REPLACE(p_texto, v_palavra, '****');
    END LOOP;
    CLOSE cur;

    RETURN p_texto;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER tr_censurar_depoimento
BEFORE INSERT ON depoimentos
FOR EACH ROW
BEGIN
    SET NEW.comentario = fn_censurar_texto(NEW.comentario);
    IF NEW.comentario LIKE '%****%' THEN
        SET NEW.censurado = TRUE;
    END IF;
END$$
DELIMITER ;

CREATE INDEX idx_reservas_cliente_data ON reservas(cliente_id, data_reserva);
CREATE INDEX idx_reservas_status_data ON reservas(status, data_reserva);
CREATE INDEX idx_pagamentos_data ON pagamentos(data_pagamento);
CREATE INDEX idx_depoimentos_data ON depoimentos(data_publicacao);
CREATE INDEX idx_produtos_ativo ON produtos(ativo, tipo);
CREATE INDEX idx_manutencao_periodo ON manutencao(data_inicio, data_fim, ativo);

COMMIT;
