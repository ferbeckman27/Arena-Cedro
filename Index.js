const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURAÇÃO DO SEU BANCO
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // padrão do XAMPP
    password: '', // padrão do XAMPP
    database: 'arena_cedro'
});

db.connect(err => {
    if (err) {
        console.error('ERRO AO CONECTAR NO BANCO:', err);
    } else {
        console.log('✅ CONECTADO AO BANCO ARENA CEDRO!');
    }
});

// ROTA DE LOGIN
app.post('/login-unificado', (req, res) => {
    const { email, password } = req.body;

    // Busca na tabela de funcionários que você criou
    const sql = "SELECT * FROM funcionarios WHERE email = ? AND senha = ?";
    
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).send(err);
        
        if (results.length > 0) {
            const user = results[0];
            res.json({
                sucesso: true,
                nome: user.nome,
                cargo: user.tipo,
                redirect: user.tipo === 'administrador' ? '/admindashboard' : '/atendentedashboard'
            });
        } else {
            res.status(401).json({ sucesso: false, mensagem: "E-mail ou senha incorretos!" });
        }
    });
});

app.listen(3001, () => console.log("🚀 Servidor rodando na porta 3001"));

app.post('/api/cadastro-cliente', (req, res) => {
    const { nome, sobrenome, email, telefone, senha } = req.body;

    // Inserindo no banco arena_cedro que criamos
    const sql = "INSERT INTO clientes (nome, sobrenome, email, telefone, senha) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [nome, sobrenome, email, telefone, senha], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erro ao cadastrar cliente. Verifique se o e-mail já existe." });
        }
        res.status(201).json({ message: "Cliente cadastrado com sucesso!" });
    });
});


app.post('/api/finalizar-reserva', async (req, res) => {
    const { cliente_id, data, horario, duracao, metodo_pagamento, total, itens } = req.body;

    // Iniciamos uma conexão para garantir que tudo seja salvo junto
    db.getConnection((err, connection) => {
        if (err) return res.status(500).send(err);

        connection.beginTransaction(err => {
            if (err) return res.status(500).send(err);

            // 1. Salva a Reserva Principal
            const sqlReserva = "INSERT INTO reservas (cliente_id, data, horario, duracao, status, valor_total, metodo_pagamento) VALUES (?, ?, ?, ?, 'pendente', ?, ?)";
            
            connection.query(sqlReserva, [cliente_id, data, horario, duracao, total, metodo_pagamento], (err, result) => {
                if (err) {
                    return connection.rollback(() => res.status(500).json(err));
                }

                const reservaId = result.insertId;

                // 2. Se tiver itens na loja, salva eles vinculados à reserva
                if (itens && itens.length > 0) {
                    const values = itens.map(idProduto => [reservaId, idProduto]);
                    const sqlItens = "INSERT INTO reserva_itens (reserva_id, produto_id) VALUES ?";
                    
                    connection.query(sqlItens, [values], (errItens) => {
                        if (errItens) {
                            return connection.rollback(() => res.status(500).json(errItens));
                        }
                        
                        connection.commit(err => {
                            if (err) return connection.rollback(() => res.status(500).send(err));
                            res.json({ success: true, message: "Reserva e Loja confirmados!" });
                        });
                    });
                } else {
                    // Se não houver itens, apenas finaliza
                    connection.commit(err => {
                        if (err) return connection.rollback(() => res.status(500).send(err));
                        res.json({ success: true, message: "Reserva confirmada!" });
                    });
                }
            });
        });
    });
});

app.get('/api/fidelidade/:id', (req, res) => {
    const clienteId = req.params.id;
    const sql = "SELECT COUNT(*) as total FROM reservas WHERE cliente_id = ? AND status = 'concluido'";
    
    db.query(sql, [clienteId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ totalConcluido: result[0].total });
    });
});