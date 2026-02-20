require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURAÇÃO DO BANCO (use .env ou padrão XAMPP)
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'arena_cedro',
  waitForConnections: true,
  connectionLimit: 10
});

// Testar conexão ao iniciar
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Erro ao conectar no banco:', err.message);
    console.error('   Verifique: MySQL/XAMPP ligado, banco "arena_cedro" criado.');
    return;
  }
  connection.release();
  console.log('✅ Conectado ao banco de dados arena_cedro');
});

// Rota para buscar as RESERVAS da View simplificada que você criou
app.get('/api/agenda', (req, res) => {
  const { data } = req.query;
  const sql = 'SELECT * FROM view_agenda_simplificada WHERE data_reserva = ?';
  db.query(sql, [data], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Rota para buscar os PRODUTOS
app.get('/api/produtos', (req, res) => {
  db.query('SELECT * FROM produtos WHERE ativo = TRUE', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post('/api/produtos', (req, res) => {
    const { nome, preco, tipo, qtd } = req.body;
    const sql = "INSERT INTO produtos (nome, preco, tipo, qtd) VALUES (?, ?, ?, ?)";
    db.query(sql, [nome, preco, tipo, qtd], (err) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: "Produto cadastrado com sucesso!" });
    });
});

// Rota para buscar os DEPOIMENTOS (Com nome do cliente)
app.get('/api/depoimentos', (req, res) => {
  const sql = `
    SELECT 
      d.id, 
      c.nome as autor, 
      d.comentario, 
      d.estrelas, 
      d.aprovado, 
      d.censurado,
      d.data_publicacao
    FROM depoimentos d 
    JOIN clientes c ON d.cliente_id = c.id
    WHERE d.censurado = FALSE
    ORDER BY d.data_publicacao DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.patch('/api/depoimentos/:id', (req, res) => {
  const id = req.params.id;
  const { aprovado } = req.body;
  if (typeof aprovado !== 'boolean') return res.status(400).json({ error: 'aprovado inválido' });
  db.query('UPDATE depoimentos SET aprovado = ? WHERE id = ?', [aprovado, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Depoimento não encontrado' });
    res.json({ ok: true, aprovado });
  });
});


app.put('/api/depoimentos/aprovar/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Envia true ou false

  const sql = "UPDATE depoimentos SET aprovado = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Status de aprovação atualizado!" });
  });
});

app.put('/api/depoimentos/rejeitar/:id', (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE depoimentos SET censurado = TRUE WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Depoimento rejeitado." });
  });
});


// ——— Login unificado (senha no banco = SHA2, como em arena_cedro.sql) ———
app.post('/api/login-unificado', (req, res) => {
  const { email, password } = req.body;
  const sqlFunc = "SELECT id, nome, sobrenome, email, tipo FROM funcionarios WHERE email = ? AND senha = SHA2(?, 256)";
  db.query(sqlFunc, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      const user = results[0];
      const redirect = user.tipo === 'administrador' ? '/admindashboard' : '/atendentedashboard';
      return res.json({
        sucesso: true,
        nome: user.nome,
        token: 'ok',
        redirect,
        tipo: user.tipo,
        cargo: user.tipo,
        id: user.id
      });
    }
    const sqlCliente = "SELECT id, nome, sobrenome, email, tipo FROM clientes WHERE email = ? AND senha = SHA2(?, 256) AND ativo = 1";
    db.query(sqlCliente, [email, password], (errCliente, resultsCliente) => {
      if (errCliente) return res.status(500).json({ error: errCliente.message });
      if (resultsCliente.length > 0) {
        const user = resultsCliente[0];
        const tipoCliente = user.tipo === 'vip' ? 'vip' : 'cliente';
        return res.json({
          sucesso: true,
          nome: user.nome,
          token: 'ok',
          redirect: '/clientdashboard',
          tipo: tipoCliente,
          cargo: tipoCliente,
          id: user.id
        });
      }
      res.status(401).json({ sucesso: false, mensagem: "E-mail ou senha incorretos!" });
    });
  });
});

// ——— Cadastro de cliente (senha armazenada com SHA2, como em arena_cedro.sql) ———
app.post('/api/cadastro-cliente', (req, res) => {
  const { nome, sobrenome, email, telefone, senha } = req.body;
  const sql = "INSERT INTO clientes (nome, sobrenome, email, telefone, senha) VALUES (?, ?, ?, ?, SHA2(?, 256))";
  db.query(sql, [nome, sobrenome, email, telefone, senha], (err) => {
    if (err) return res.status(500).json({ message: "Erro ao cadastrar. Verifique se o e-mail já existe." });
    res.status(201).json({ message: "Cliente cadastrado com sucesso!" });
  });
});

app.get('/api/equipe', (req, res) => {
    // Esta query busca o funcionário e conta quantas reservas ele fez
    const sql = `
        SELECT 
            f.id, f.nome, f.sobrenome,
            COALESCE(SUM(r.valor_total), 0) as total_vendas,
            COUNT(r.id) as total_reservas
        FROM funcionarios f
        LEFT JOIN reservas r ON f.id = r.funcionario_id
        WHERE f.tipo = 'atendente' AND f.ativo = 1
        GROUP BY f.id;
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});


// Rota para Bloquear/Desativar funcionário
app.put('/api/funcionarios/status/:id', (req, res) => {
    const { id } = req.params;
    const { ativo } = req.body; // Envia 0 para bloquear, 1 para ativar
    
    const sql = "UPDATE funcionarios SET ativo = ? WHERE id = ?";
    
    db.query(sql, [ativo, id], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao atualizar status" });
        res.json({ message: "Status do funcionário atualizado!" });
    });
});


// ——— Finalizar reserva (schema arena_cedro.sql: data_reserva, horario_inicio, bloco_id, turno_id, forma_pagamento, itens_reserva) ———
app.post('/api/finalizar-reserva', (req, res) => {
  const { cliente_id, data, horario, duracao, metodo_pagamento, total, itens } = req.body;
  const formaPagamento = (metodo_pagamento === 'pix' || metodo_pagamento === 'dinheiro') ? metodo_pagamento : 'pix';
  const duracaoMin = Number(duracao) || 60;
  const horarioTime = /^\d{1,2}:\d{2}/.test(horario) ? (horario.length === 5 ? horario + ':00' : horario) : '09:00:00';
  const hora = parseInt(horarioTime.split(':')[0], 10);

  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ error: err.message });
    connection.beginTransaction((errTr) => {
      if (errTr) return connection.release() && res.status(500).json({ error: errTr.message });
      connection.query('SELECT id FROM blocos_horario WHERE duracao_minutos = ? LIMIT 1', [duracaoMin], (errBloco, rowsBloco) => {
        if (errBloco) return connection.rollback(() => { connection.release(); res.status(500).json({ error: errBloco.message }); });
        const blocoId = (rowsBloco && rowsBloco[0]) ? rowsBloco[0].id : 2;
        const turnoNome = hora >= 18 ? 'Noturno' : 'Diurno';
        connection.query('SELECT id FROM turnos WHERE nome = ? LIMIT 1', [turnoNome], (errTurno, rowsTurno) => {
          if (errTurno) return connection.rollback(() => { connection.release(); res.status(500).json({ error: errTurno.message }); });
          const turnoId = (rowsTurno && rowsTurno[0]) ? rowsTurno[0].id : 1;
          const sqlReserva = "INSERT INTO reservas (cliente_id, data_reserva, horario_inicio, bloco_id, turno_id, valor_total, forma_pagamento, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')";
          connection.query(sqlReserva, [cliente_id, data, horarioTime, blocoId, turnoId, total, formaPagamento], (err, result) => {
            if (err) return connection.rollback(() => { connection.release(); res.status(500).json({ error: err.message }); });
            const reservaId = result.insertId;
            if (itens && itens.length > 0) {
              connection.query('SELECT id, preco_venda, preco_aluguel FROM produtos WHERE ativo = TRUE', [], (errProd, produtos) => {
                if (errProd) return connection.rollback(() => { connection.release(); res.status(500).json({ error: errProd.message }); });
                const precoPorId = {};
                (produtos || []).forEach(p => { precoPorId[p.id] = p.preco_venda != null ? p.preco_venda : p.preco_aluguel; });
                const itensValues = itens.map((idProduto) => {
                  const preco = precoPorId[idProduto] != null ? precoPorId[idProduto] : 0;
                  return [reservaId, idProduto, 'venda', 1, preco, preco, 0];
                });
                connection.query("INSERT INTO itens_reserva (reserva_id, produto_id, tipo, quantidade, preco_unitario, subtotal, pago) VALUES ?", [itensValues], (errItens) => {
                  if (errItens) return connection.rollback(() => { connection.release(); res.status(500).json({ error: errItens.message }); });
                  connection.commit((errC) => {
                    connection.release();
                    if (errC) return res.status(500).json({ error: errC.message });
                    res.json({ success: true, message: "Reserva e itens confirmados!" });
                  });
                });
              });
            } else {
              connection.commit((errC) => {
                connection.release();
                if (errC) return res.status(500).json({ error: errC.message });
                res.json({ success: true, message: "Reserva confirmada!" });
              });
            }
          });
        });
      });
    });
  });
});

// ——— Fidelidade: total de reservas concluídas (status do arena_cedro.sql: concluida, confirmada) ———
app.get('/api/fidelidade/:id', (req, res) => {
  const clienteId = req.params.id;
  const sql = "SELECT COUNT(*) as total FROM reservas WHERE cliente_id = ? AND status IN ('concluida', 'confirmada')";
  db.query(sql, [clienteId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const totalConcluido = results[0]?.total ?? 0;
    res.json({ totalConcluido: Number(totalConcluido) });
  });
});

app.get('/api/agenda-detalhes', (req, res) => {
  const { data } = req.query;
  if (!data) return res.status(400).json({ error: 'Parâmetro data obrigatório' });
  const sql = `
    SELECT r.id, r.data_reserva, r.horario_inicio, r.status, r.valor_total, r.forma_pagamento, r.pago, r.observacoes,
           CONCAT(c.nome, ' ', c.sobrenome) AS cliente_nome, c.telefone AS cliente_telefone,
           f.nome AS reservado_por_nome, f.id AS funcionario_id,
           bh.duracao_minutos, t.nome AS turno
    FROM reservas r
    JOIN clientes c ON r.cliente_id = c.id
    LEFT JOIN funcionarios f ON r.funcionario_id = f.id
    JOIN blocos_horario bh ON r.bloco_id = bh.id
    JOIN turnos t ON r.turno_id = t.id
    WHERE r.data_reserva = ? AND r.status != 'cancelada'
    ORDER BY r.horario_inicio`;
  db.query(sql, [data], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const rows = (results || []).map(r => ({
      id: r.id,
      data_reserva: r.data_reserva,
      horario_inicio: r.horario_inicio,
      status: r.status,
      valor_total: r.valor_total,
      forma_pagamento: r.forma_pagamento || '-',
      pago: !!r.pago,
      observacoes: r.observacoes || '',
      cliente_nome: r.cliente_nome,
      cliente_telefone: r.cliente_telefone,
      reservado_por: r.reservado_por_nome ? `Atendente ${r.reservado_por_nome}` : 'Cliente (Site)',
      duracao_minutos: r.duracao_minutos,
      turno: r.turno
    }));
    res.json(rows);
  });
});


app.get('/api/mensalistas', (req, res) => {
    db.query("SELECT * FROM mensalistas", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
});

// SALVAR NOVO MENSALISTA
app.post('/api/mensalistas', (req, res) => {
    const { nome, dia_semana, horario, metodo_pagamento, observacao, responsavel, status_pagamento } = req.body;
    const sql = `INSERT INTO mensalistas 
        (nome, dia_semana, horario, metodo_pagamento, observacao, responsavel_cadastro, status_pagamento) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [nome, dia_semana, horario, metodo_pagamento, observacao, responsavel, status_pagamento], (err) => {
        if (err) return res.status(500).send(err);
        res.sendStatus(201);
    });
});

// EDITAR MENSALISTA
app.put('/api/mensalistas/:id', (req, res) => {
    const { nome, dia_semana, horario, metodo_pagamento, observacao } = req.body;
    const { id } = req.params;
    const sql = "UPDATE mensalistas SET nome=?, dia_semana=?, horario=?, metodo_pagamento=?, observacao=? WHERE id=?";
    db.query(sql, [nome, dia_semana, horario, metodo_pagamento, observacao, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ ok: true });
    });
});


app.put('/api/mensalistas/status/:id', (req, res) => {
    const { id } = req.params;
    const { novoStatus } = req.body; // 'em_dia' ou 'em_atraso'

    const sql = "UPDATE mensalistas SET status_pagamento = ? WHERE id = ?";
    
    db.query(sql, [novoStatus, id], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao atualizar status do VIP" });
        res.json({ message: "Status atualizado com sucesso!" });
    });
});

// Configuração do transportador de e-mail (Exemplo com Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'seu-email-da-arena@gmail.com',
        pass: 'sua-senha-de-aplicativo' // Gere uma senha de app no Google
    }
});


app.get('/api/admin/vips', (req, res) => {
    const sql = `
        SELECT 
            id, 
            nome as grupo, 
            dia_semana, 
            DATE_FORMAT(horario, '%H:%i') as hora,
            metodo_pagamento,
            responsavel_cadastro, -- Nome do atendente ou 'Cliente'
            observacao,
            IF(pago_mes_atual = 1, 'Em dia', 'Em atraso') as status
        FROM mensalistas
        ORDER BY dia_semana, horario
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});



app.post('/api/solicitar-cadastro', async (req, res) => {
    const { nome, sobrenome, email_pessoal, tipo, telefone } = req.body;

    // 1. GERA O E-MAIL CORPORATIVO
    const dominio = tipo === 'administrador' ? 'admincedro.com' : 'atendcedro.com';
    const emailGerado = `${nome.toLowerCase()}${sobrenome.toLowerCase()}@${dominio}`;

    // 2. GERA A SENHA AUTOMÁTICA (8 caracteres, especial, sem repetir números)
    const gerarSenhaSegura = () => {
        const letras = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        const numeros = "0123456789".split('').sort(() => Math.random() - 0.5); // Embaralha números
        const especiais = "!@#$%&*";
        
        let senha = "";
        senha += letras.charAt(Math.floor(Math.random() * letras.length)).toUpperCase(); // Uma maiúscula
        senha += especiais.charAt(Math.floor(Math.random() * especiais.length)); // Um especial
        senha += numeros.slice(0, 4).join(''); // 4 números não repetidos
        senha += letras.charAt(Math.floor(Math.random() * letras.length)); // Mais uma letra
        senha += letras.charAt(Math.floor(Math.random() * letras.length)); // Total 8
        
        return senha;
    };

    const senhaGerada = gerarSenhaSegura();
    const telefoneFunc = telefone || '(00) 00000-0000';

    // 3. SALVA NO BANCO (arena_cedro.sql: telefone NOT NULL, senha com SHA2)
    const sql = "INSERT INTO funcionarios (nome, sobrenome, email, email_pessoal, telefone, senha, tipo) VALUES (?, ?, ?, ?, ?, SHA2(?, 256), ?)";
    
    db.query(sql, [nome, sobrenome, emailGerado, email_pessoal, telefoneFunc, senhaGerada, tipo], async (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao salvar no banco" });

        // 4. ENVIA O E-MAIL AUTOMÁTICO
        const mailOptions = {
            from: 'Arena Cedro <seu-email@gmail.com>',
            to: email_pessoal,
            subject: 'Seu Acesso ao Portal Arena Cedro',
            html: `
                <div style="font-family: sans-serif; background: #060a08; color: white; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #22c55e;">Bem-vindo à Arena Cedro, ${nome}!</h2>
                    <p>Seu cadastro foi aprovado pela diretoria.</p>
                    <hr style="border: 0.5px solid #222" />
                    <p><strong>E-mail de Acesso:</strong> ${emailGerado}</p>
                    <p><strong>Senha Temporária:</strong> ${senhaGerada}</p>
                    <br />
                    <a href="http://localhost:5173/adminlogin" style="background: #22c55e; color: black; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">Acessar Painel agora</a>
                    <p style="font-size: 10px; margin-top: 20px; color: #666;">Recomendamos alterar sua senha no primeiro acesso.</p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            res.json({ message: "Cadastro criado e e-mail enviado!" });
        } catch (mailError) {
            res.status(500).json({ error: "Erro ao enviar o e-mail." });
        }
    });
});

app.post('/api/produtos', (req, res) => {
  const { nome, tipo, preco_venda, preco_aluguel, quantidade_estoque, descricao } = req.body;
  const tipoVal = ['venda', 'aluguel', 'ambos'].includes(tipo) ? tipo : 'venda';
  const precoV = tipoVal === 'aluguel' ? null : (Number(preco_venda) || 0);
  const precoA = tipoVal === 'venda' ? null : (Number(preco_aluguel) || 0);
  const estoque = Number(quantidade_estoque) || 0;
  const sql = 'INSERT INTO produtos (nome, descricao, tipo, preco_venda, preco_aluguel, quantidade_estoque) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [nome || 'Produto', descricao || null, tipoVal, precoV, precoA, estoque], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, message: 'Produto cadastrado.' });
  });
});

app.put('/api/produtos/:id', (req, res) => {
  const id = req.params.id;
  const { nome, tipo, preco_venda, preco_aluguel, quantidade_estoque, descricao } = req.body;
  const tipoVal = tipo && ['venda', 'aluguel', 'ambos'].includes(tipo) ? tipo : undefined;
  const fields = [];
  const values = [];
  if (nome != null) { fields.push('nome = ?'); values.push(nome); }
  if (tipoVal != null) { fields.push('tipo = ?'); values.push(tipoVal); }
  if (preco_venda != null) { fields.push('preco_venda = ?'); values.push(Number(preco_venda)); }
  if (preco_aluguel != null) { fields.push('preco_aluguel = ?'); values.push(Number(preco_aluguel)); }
  if (quantidade_estoque != null) { fields.push('quantidade_estoque = ?'); values.push(Number(quantidade_estoque)); }
  if (descricao != null) { fields.push('descricao = ?'); values.push(descricao); }
  if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });
  values.push(id);
  db.query(`UPDATE produtos SET ${fields.join(', ')} WHERE id = ?`, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ ok: true });
  });
});

app.delete('/api/produtos/:id', (req, res) => {
  db.query('UPDATE produtos SET ativo = FALSE WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ ok: true });
  });
});

let estadoManutencao = false;
app.get('/api/manutencao', (req, res) => res.json({ ativo: estadoManutencao }));
app.post('/api/manutencao', (req, res) => {
  const { ativo } = req.body;
  estadoManutencao = !!ativo;
  res.json({ ativo: estadoManutencao });
});

app.get('/api/relatorios/sintetico', (req, res) => {
  const { mes, ano } = req.query;
  const m = mes || new Date().getMonth() + 1;
  const y = ano || new Date().getFullYear();
  const sql = `SELECT COUNT(*) as total_reservas, COALESCE(SUM(CASE WHEN pago = 1 THEN valor_total ELSE 0 END), 0) as faturamento
    FROM reservas WHERE MONTH(data_reserva) = ? AND YEAR(data_reserva) = ? AND status IN ('confirmada', 'concluida')`;
  db.query(sql, [m, y], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const r = rows[0];
    const totalReservas = r.total_reservas || 0;
    const faturamento = Number(r.faturamento || 0);
    res.json({ mes: Number(m), ano: Number(y), total_reservas: totalReservas, faturamento, media_diaria: totalReservas ? (faturamento / 30).toFixed(2) : 0 });
  });
});

app.get('/api/relatorios/analitico', (req, res) => {
  const { mes, ano } = req.query;
  const m = mes || new Date().getMonth() + 1;
  const y = ano || new Date().getFullYear();
  const sqlReservas = `SELECT COALESCE(SUM(valor_total), 0) as total FROM reservas WHERE MONTH(data_reserva) = ? AND YEAR(data_reserva) = ? AND pago = 1`;
  const sqlProdutos = `SELECT COALESCE(SUM(ir.subtotal), 0) as total FROM itens_reserva ir JOIN reservas r ON ir.reserva_id = r.id WHERE MONTH(r.data_reserva) = ? AND YEAR(r.data_reserva) = ? AND ir.pago = 1`;
  db.query(sqlReservas, [m, y], (err, r1) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query(sqlProdutos, [m, y], (err2, r2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      const vendasProdutos = Number((r2 && r2[0]) ? r2[0].total : 0);
      const horasAvulsas = Number((r1 && r1[0]) ? r1[0].total : 0) - vendasProdutos;
      res.json({
        mes: Number(m), ano: Number(y),
        venda_produtos: vendasProdutos,
        horas_avulsas: horasAvulsas < 0 ? 0 : horasAvulsas,
        faturamento_total: vendasProdutos + (horasAvulsas < 0 ? Number((r1 && r1[0]) ? r1[0].total : 0) : horasAvulsas)
      });
    });
  });
});

app.put('/api/clientes/:id', (req, res) => {
  const id = req.params.id;
  const { nome, sobrenome, email, telefone } = req.body;
  const fields = [];
  const values = [];
  if (nome != null) { fields.push('nome = ?'); values.push(nome); }
  if (sobrenome != null) { fields.push('sobrenome = ?'); values.push(sobrenome); }
  if (email != null) { fields.push('email = ?'); values.push(email); }
  if (telefone != null) { fields.push('telefone = ?'); values.push(telefone); }
  if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });
  values.push(id);
  db.query(`UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json({ ok: true });
  });
});

app.patch('/api/reservas/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['cancelada', 'confirmada', 'pendente', 'concluida'].includes(status)) return res.status(400).json({ error: 'Status inválido' });
  db.query('UPDATE reservas SET status = ? WHERE id = ?', [status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Reserva não encontrada' });
    res.json({ ok: true });
  });
});

app.get('/api/clientes', (req, res) => {
  db.query('SELECT id, nome, sobrenome, email, telefone, tipo, ativo FROM clientes WHERE ativo = 1 ORDER BY nome', [], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results || []);
  });
});

app.get('/api/observacoes-clientes', (req, res) => {
  const sql = `SELECT o.id, o.cliente_id, o.tipo, o.observacao, o.alerta, o.data_criacao, CONCAT(c.nome, ' ', c.sobrenome) as cliente_nome, c.telefone
    FROM observacoes_clientes o JOIN clientes c ON o.cliente_id = c.id ORDER BY o.data_criacao DESC`;
  db.query(sql, [], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const rows = (results || []).map(r => ({ ...r, alerta: !!r.alerta }));
    res.json(rows);
  });
});

app.post('/api/observacoes-clientes', (req, res) => {
  const { cliente_id, tipo, observacao, alerta, funcionario_id } = req.body;
  const funcId = funcionario_id || 1;
  const sql = 'INSERT INTO observacoes_clientes (cliente_id, funcionario_id, tipo, observacao, alerta) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [cliente_id, funcId, tipo || 'neutra', observacao || '', alerta ? 1 : 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId });
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
