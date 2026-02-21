require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { supabase } = require('./supabaseClient.cjs');

const app = express();
app.use(cors());
app.use(express.json());

let estadoManutencao = false;

app.get('/api/produtos', async (req, res) => {
  const { data, error } = await supabase.from('produtos').select('*').eq('ativo', true);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.post('/api/produtos', async (req, res) => {
  const { nome, tipo, preco_venda, preco_aluguel, quantidade_estoque, descricao } = req.body;
  const tipoVal = ['venda', 'aluguel', 'ambos'].includes(tipo) ? tipo : 'venda';
  const precoV = tipoVal === 'aluguel' ? null : (Number(preco_venda) || 0);
  const precoA = tipoVal === 'venda' ? null : (Number(preco_aluguel) || 0);
  const estoque = Number(quantidade_estoque) || 0;
  const { data, error } = await supabase.from('produtos').insert([{ nome: nome || 'Produto', descricao: descricao || null, tipo: tipoVal, preco_venda: precoV, preco_aluguel: precoA, quantidade_estoque: estoque, ativo: true }]).select('id').single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ id: data.id, message: 'Produto cadastrado.' });
});

app.put('/api/produtos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { nome, tipo, preco_venda, preco_aluguel, quantidade_estoque, descricao } = req.body;
  const patch = {};
  if (nome != null) patch.nome = nome;
  if (tipo != null) patch.tipo = tipo;
  if (preco_venda != null) patch.preco_venda = Number(preco_venda);
  if (preco_aluguel != null) patch.preco_aluguel = Number(preco_aluguel);
  if (quantidade_estoque != null) patch.quantidade_estoque = Number(quantidade_estoque);
  if (descricao != null) patch.descricao = descricao;
  const { error } = await supabase.from('produtos').update(patch).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.delete('/api/produtos/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { error } = await supabase.from('produtos').update({ ativo: false }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.get('/api/depoimentos', async (req, res) => {
  const { data: deps, error } = await supabase.from('depoimentos').select('id, cliente_id, comentario, estrelas, aprovado, censurado, data_publicacao').eq('censurado', false).order('data_publicacao', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const ids = [...new Set((deps || []).map(d => d.cliente_id).filter(Boolean))];
  let mapa = {};
  if (ids.length) {
    const { data: cls } = await supabase.from('clientes').select('id, nome').in('id', ids);
    (cls || []).forEach(c => { mapa[c.id] = c.nome; });
  }
  const resp = (deps || []).map(d => ({ id: d.id, autor: mapa[d.cliente_id] || null, comentario: d.comentario, estrelas: d.estrelas, aprovado: d.aprovado, censurado: d.censurado, data_publicacao: d.data_publicacao }));
  res.json(resp);
});

app.put('/api/depoimentos/aprovar/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const { error } = await supabase.from('depoimentos').update({ aprovado: !!status }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Status de aprovação atualizado!' });
});

app.put('/api/depoimentos/rejeitar/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { error } = await supabase.from('depoimentos').update({ censurado: true }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Depoimento rejeitado.' });
});

app.post('/api/login-unificado', async (req, res) => {
  const { email, password } = req.body;
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const { data: funcs, error: ef } = await supabase.from('funcionarios').select('id, nome, sobrenome, email, tipo, senha, ativo').eq('email', email).limit(1);
  if (ef) return res.status(500).json({ error: ef.message });
  if (funcs && funcs[0] && funcs[0].senha === hash && funcs[0].ativo) {
    const u = funcs[0];
    const redirect = u.tipo === 'administrador' ? '/admindashboard' : '/atendentedashboard';
    return res.json({ sucesso: true, nome: u.nome, token: 'ok', redirect, tipo: u.tipo, cargo: u.tipo, id: u.id });
  }
  const { data: cls, error: ec } = await supabase.from('clientes').select('id, nome, sobrenome, email, tipo, senha, ativo').eq('email', email).limit(1);
  if (ec) return res.status(500).json({ error: ec.message });
  if (cls && cls[0] && cls[0].senha === hash && cls[0].ativo) {
    const u = cls[0];
    const tipoCliente = u.tipo === 'vip' ? 'vip' : 'cliente';
    return res.json({ sucesso: true, nome: u.nome, token: 'ok', redirect: '/clientdashboard', tipo: tipoCliente, cargo: tipoCliente, id: u.id });
  }
  res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha incorretos!' });
});

app.post('/api/cadastro-cliente', async (req, res) => {
  const { nome, sobrenome, email, telefone, senha } = req.body;
  const hash = crypto.createHash('sha256').update(senha).digest('hex');
  const { error } = await supabase.from('clientes').insert([{ nome, sobrenome, email, telefone, senha: hash, ativo: true, tipo: 'cliente' }]);
  if (error) return res.status(500).json({ message: 'Erro ao cadastrar. Verifique se o e-mail já existe.' });
  res.status(201).json({ message: 'Cliente cadastrado com sucesso!' });
});

app.get('/api/equipe', async (req, res) => {
  const { data: funcs, error } = await supabase.from('funcionarios').select('id, nome, sobrenome').eq('tipo', 'atendente').eq('ativo', 1);
  if (error) return res.status(500).json(error);
  const ids = (funcs || []).map(f => f.id);
  let mapaVendas = {}, mapaCount = {};
  if (ids.length) {
    const { data: rs } = await supabase.from('reservas').select('id, funcionario_id, valor_total').in('funcionario_id', ids);
    (rs || []).forEach(r => {
      mapaVendas[r.funcionario_id] = (mapaVendas[r.funcionario_id] || 0) + Number(r.valor_total || 0);
      mapaCount[r.funcionario_id] = (mapaCount[r.funcionario_id] || 0) + 1;
    });
  }
  const resp = (funcs || []).map(f => ({ id: f.id, nome: f.nome, sobrenome: f.sobrenome, total_vendas: mapaVendas[f.id] || 0, total_reservas: mapaCount[f.id] || 0 }));
  res.json(resp);
});

app.put('/api/funcionarios/status/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { ativo } = req.body;
  const { error } = await supabase.from('funcionarios').update({ ativo: !!ativo }).eq('id', id);
  if (error) return res.status(500).json({ error: 'Erro ao atualizar status' });
  res.json({ message: 'Status do funcionário atualizado!' });
});

app.post('/api/finalizar-reserva', async (req, res) => {
  const { cliente_id, data, horario, duracao, metodo_pagamento, total, itens, funcionario_id } = req.body;
  const formaPagamento = (metodo_pagamento === 'pix' || metodo_pagamento === 'dinheiro') ? metodo_pagamento : 'pix';
  const duracaoMin = Number(duracao) || 60;
  const horarioTime = /^\d{1,2}:\d{2}/.test(horario) ? (horario.length === 5 ? horario + ':00' : horario) : '09:00:00';
  const hora = parseInt(horarioTime.split(':')[0], 10);
  const turnoNome = hora >= 18 ? 'Noturno' : 'Diurno';
  let blocoId = 2, turnoId = 1;
  const { data: bloc } = await supabase.from('blocos_horario').select('id').eq('duracao_minutos', duracaoMin).limit(1);
  if (bloc && bloc[0]) blocoId = bloc[0].id;
  const { data: tur } = await supabase.from('turnos').select('id').eq('nome', turnoNome).limit(1);
  if (tur && tur[0]) turnoId = tur[0].id;
  const payload = { cliente_id, funcionario_id: funcionario_id || null, data_reserva: data, horario_inicio: horarioTime, bloco_id: blocoId, turno_id: turnoId, valor_total: total, forma_pagamento: formaPagamento, status: 'pendente', pago: false };
  const { data: r, error } = await supabase.from('reservas').insert([payload]).select('id').single();
  if (error) return res.status(500).json({ error: error.message });
  const reservaId = r.id;
  if (itens && itens.length > 0) {
    const { data: produtos } = await supabase.from('produtos').select('id, preco_venda, preco_aluguel').eq('ativo', true);
    const precoPorId = {};
    (produtos || []).forEach(p => { precoPorId[p.id] = p.preco_venda != null ? p.preco_venda : p.preco_aluguel; });
    const itensRows = itens.map(idProduto => {
      const preco = precoPorId[idProduto] != null ? precoPorId[idProduto] : 0;
      return { reserva_id: reservaId, produto_id: idProduto, tipo: 'venda', quantidade: 1, preco_unitario: preco, subtotal: preco, pago: false };
    });
    const { error: e2 } = await supabase.from('itens_reserva').insert(itensRows);
    if (e2) return res.status(500).json({ error: e2.message });
  }
  res.json({ success: true, message: 'Reserva e itens confirmados!' });
});

app.get('/api/fidelidade/:id', async (req, res) => {
  const clienteId = Number(req.params.id);
  const { data, error } = await supabase.from('reservas').select('id', { count: 'exact', head: true }).eq('cliente_id', clienteId).in('status', ['concluida', 'confirmada']);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ totalConcluido: data?.length || 0 });
});

app.get('/api/mensalistas', async (req, res) => {
  const { data, error } = await supabase.from('mensalistas').select('*');
  if (error) return res.status(500).send(error);
  res.json(data || []);
});

app.post('/api/mensalistas', async (req, res) => {
  const { nome, dia_semana, horario, metodo_pagamento, observacao, responsavel, status_pagamento } = req.body;
  const { error } = await supabase.from('mensalistas').insert([{ nome, dia_semana, horario, metodo_pagamento, observacao, responsavel_cadastro: responsavel, status_pagamento }]);
  if (error) return res.status(500).send(error);
  res.sendStatus(201);
});

app.put('/api/mensalistas/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { nome, dia_semana, horario, metodo_pagamento, observacao } = req.body;
  const { error } = await supabase.from('mensalistas').update({ nome, dia_semana, horario, metodo_pagamento, observacao }).eq('id', id);
  if (error) return res.status(500).json(error);
  res.json({ ok: true });
});

app.put('/api/mensalistas/status/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { novoStatus } = req.body;
  const { error } = await supabase.from('mensalistas').update({ status_pagamento: novoStatus }).eq('id', id);
  if (error) return res.status(500).json({ error: 'Erro ao atualizar status do VIP' });
  res.json({ message: 'Status atualizado com sucesso!' });
});

app.get('/api/clientes', async (req, res) => {
  const { data, error } = await supabase.from('clientes').select('id, nome, sobrenome, email, telefone, tipo, ativo').eq('ativo', 1).order('nome');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.get('/api/observacoes-clientes', async (req, res) => {
  const { data: obs, error } = await supabase.from('observacoes_clientes').select('id, cliente_id, tipo, observacao, alerta, data_criacao').order('data_criacao', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const ids = [...new Set((obs || []).map(o => o.cliente_id))];
  let mapa = {};
  if (ids.length) {
    const { data: cls } = await supabase.from('clientes').select('id, nome, sobrenome, telefone').in('id', ids);
    (cls || []).forEach(c => { mapa[c.id] = { nome: `${c.nome} ${c.sobrenome || ''}`.trim(), telefone: c.telefone || '' }; });
  }
  const resp = (obs || []).map(o => ({ id: o.id, cliente_id: o.cliente_id, tipo: o.tipo, observacao: o.observacao, alerta: !!o.alerta, data_criacao: o.data_criacao, cliente_nome: mapa[o.cliente_id]?.nome, telefone: mapa[o.cliente_id]?.telefone }));
  res.json(resp);
});

app.post('/api/observacoes-clientes', async (req, res) => {
  const { cliente_id, tipo, observacao, alerta, funcionario_id } = req.body;
  const funcId = funcionario_id || 1;
  const { data, error } = await supabase.from('observacoes_clientes').insert([{ cliente_id, funcionario_id: funcId, tipo: tipo || 'neutra', observacao: observacao || '', alerta: alerta ? 1 : 0 }]).select('id').single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ id: data.id });
});

app.get('/api/agenda', async (req, res) => {
  const { data } = req.query;
  const { data: reservas, error } = await supabase.from('reservas').select('horario_inicio, status, turno_id').eq('data_reserva', data);
  if (error) return res.status(500).json({ error: error.message });
  const { data: turnos } = await supabase.from('turnos').select('id, nome');
  const turnoNomePorId = {};
  (turnos || []).forEach(t => { turnoNomePorId[t.id] = t.nome; });
  const resp = (reservas || []).map(r => ({
    horario_inicio: r.horario_inicio,
    status: r.status,
    turno: turnoNomePorId[r.turno_id] || null,
    cor_status: r.status === 'confirmada' ? 'vermelho' : 'verde'
  }));
  res.json(resp);
});

app.get('/api/agenda-detalhes', async (req, res) => {
  const { data } = req.query;
  if (!data) return res.status(400).json({ error: 'Parâmetro data (YYYY-MM-DD) obrigatório' });
  const { data: rs, error } = await supabase.from('reservas').select('id, data_reserva, horario_inicio, status, valor_total, forma_pagamento, pago, observacoes, cliente_id, funcionario_id, bloco_id, turno_id').eq('data_reserva', data).neq('status', 'cancelada').order('horario_inicio');
  if (error) return res.status(500).json({ error: error.message });
  const clienteIds = [...new Set((rs || []).map(r => r.cliente_id))];
  const funcIds = [...new Set((rs || []).map(r => r.funcionario_id).filter(Boolean))];
  const blocoIds = [...new Set((rs || []).map(r => r.bloco_id))];
  const turnoIds = [...new Set((rs || []).map(r => r.turno_id))];
  const [cls, fs, bhs, ts] = await Promise.all([
    supabase.from('clientes').select('id, nome, sobrenome, telefone').in('id', clienteIds),
    funcIds.length ? supabase.from('funcionarios').select('id, nome').in('id', funcIds) : Promise.resolve({ data: [] }),
    supabase.from('blocos_horario').select('id, duracao_minutos').in('id', blocoIds),
    supabase.from('turnos').select('id, nome').in('id', turnoIds)
  ]);
  const cMap = {}; (cls.data || []).forEach(c => { cMap[c.id] = c; });
  const fMap = {}; (fs.data || []).forEach(f => { fMap[f.id] = f; });
  const bMap = {}; (bhs.data || []).forEach(b => { bMap[b.id] = b; });
  const tMap = {}; (ts.data || []).forEach(t => { tMap[t.id] = t; });
  const out = (rs || []).map(r => ({
    id: r.id,
    data_reserva: r.data_reserva,
    horario_inicio: r.horario_inicio,
    status: r.status,
    valor_total: r.valor_total,
    forma_pagamento: r.forma_pagamento || '-',
    pago: !!r.pago,
    observacoes: r.observacoes || '',
    cliente_nome: cMap[r.cliente_id] ? `${cMap[r.cliente_id].nome} ${cMap[r.cliente_id].sobrenome || ''}`.trim() : null,
    cliente_telefone: cMap[r.cliente_id]?.telefone || '',
    reservado_por: fMap[r.funcionario_id] ? `Atendente ${fMap[r.funcionario_id].nome}` : 'Cliente (Site)',
    duracao_minutos: bMap[r.bloco_id]?.duracao_minutos || null,
    turno: tMap[r.turno_id]?.nome || null
  }));
  res.json(out);
});

app.get('/api/relatorios/sintetico', async (req, res) => {
  const { mes, ano } = req.query;
  const m = Number(mes) || (new Date().getMonth() + 1);
  const y = Number(ano) || new Date().getFullYear();
  const { data: r } = await supabase.rpc('reservas_mes', { p_mes: m, p_ano: y }).select('*');
  if (r && r[0]) {
    const total = Number(r[0].faturamento || 0);
    const totalReservas = Number(r[0].total_reservas || 0);
    return res.json({ mes: m, ano: y, total_reservas: totalReservas, faturamento: total, media_diaria: totalReservas ? (total / 30).toFixed(2) : 0 });
  }
  const { data: reservas } = await supabase.from('reservas').select('valor_total, pago, data_reserva, status').gte('data_reserva', `${y}-${String(m).padStart(2,'0')}-01`).lte('data_reserva', `${y}-${String(m).padStart(2,'0')}-31`).in('status', ['confirmada', 'concluida']);
  const total = (reservas || []).filter(r => r.pago).reduce((a, b) => a + Number(b.valor_total || 0), 0);
  const totalReservas = (reservas || []).length;
  res.json({ mes: m, ano: y, total_reservas: totalReservas, faturamento: total, media_diaria: totalReservas ? (total / 30).toFixed(2) : 0 });
});

app.get('/api/relatorios/analitico', async (req, res) => {
  const { mes, ano } = req.query;
  const m = Number(mes) || (new Date().getMonth() + 1);
  const y = Number(ano) || new Date().getFullYear();
  const { data: r1 } = await supabase.from('reservas').select('valor_total, data_reserva, pago').gte('data_reserva', `${y}-${String(m).padStart(2,'0')}-01`).lte('data_reserva', `${y}-${String(m).padStart(2,'0')}-31`).eq('pago', true);
  const { data: r2 } = await supabase.from('itens_reserva').select('subtotal, reservas!inner(data_reserva)').gte('reservas.data_reserva', `${y}-${String(m).padStart(2,'0')}-01`).lte('reservas.data_reserva', `${y}-${String(m).padStart(2,'0')}-31`).eq('pago', true);
  const vendaProdutos = (r2 || []).reduce((a, b) => a + Number(b.subtotal || 0), 0);
  const totalReservas = (r1 || []).reduce((a, b) => a + Number(b.valor_total || 0), 0);
  const horasAvulsas = Math.max(totalReservas - vendaProdutos, 0);
  res.json({ mes: m, ano: y, venda_produtos: vendaProdutos, horas_avulsas: horasAvulsas, faturamento_total: vendaProdutos + horasAvulsas });
});

app.put('/api/clientes/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { nome, sobrenome, email, telefone } = req.body;
  const patch = {};
  if (nome != null) patch.nome = nome;
  if (sobrenome != null) patch.sobrenome = sobrenome;
  if (email != null) patch.email = email;
  if (telefone != null) patch.telefone = telefone;
  const { error } = await supabase.from('clientes').update(patch).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.patch('/api/reservas/:id/status', async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!['cancelada', 'confirmada', 'pendente', 'concluida'].includes(status)) return res.status(400).json({ error: 'Status inválido' });
  const { error } = await supabase.from('reservas').update({ status }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.get('/api/manutencao', (req, res) => res.json({ ativo: estadoManutencao }));
app.post('/api/manutencao', (req, res) => {
  const { ativo } = req.body;
  estadoManutencao = !!ativo;
  res.json({ ativo: estadoManutencao });
});

app.post('/api/solicitar-cadastro', async (req, res) => {
  const { nome, sobrenome, email_pessoal, tipo, telefone } = req.body;
  const dominio = tipo === 'administrador' ? 'admincedro.com' : 'atendcedro.com';
  const emailGerado = `${nome.toLowerCase()}${sobrenome.toLowerCase()}@${dominio}`;
  const letras = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const numeros = "0123456789";
  const especiais = "!@#$%&*";
  const senhaGerada = letras[Math.floor(Math.random()*letras.length)].toUpperCase()+ especiais[Math.floor(Math.random()*especiais.length)] + numeros.split('').sort(()=>Math.random()-0.5).slice(0,4).join('') + letras[Math.floor(Math.random()*letras.length)] + letras[Math.floor(Math.random()*letras.length)];
  const telefoneFunc = telefone || '(00) 00000-0000';
  const hash = crypto.createHash('sha256').update(senhaGerada).digest('hex');
  const { error } = await supabase.from('funcionarios').insert([{ nome, sobrenome, email: emailGerado, email_pessoal, telefone: telefoneFunc, senha: hash, tipo }]);
  if (error) return res.status(500).json({ error: 'Erro ao salvar no banco' });
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'seu-email-da-arena@gmail.com', pass: 'sua-senha-de-aplicativo' } });
  const mailOptions = { from: 'Arena Cedro <seu-email@gmail.com>', to: email_pessoal, subject: 'Seu Acesso ao Portal Arena Cedro', html: `<div style="font-family: sans-serif; background: #060a08; color: white; padding: 20px; border-radius: 10px;"><h2 style="color: #22c55e;">Bem-vindo à Arena Cedro, ${nome}!</h2><p>Seu cadastro foi aprovado pela diretoria.</p><hr style="border: 0.5px solid #222" /><p><strong>E-mail de Acesso:</strong> ${emailGerado}</p><p><strong>Senha Temporária:</strong> ${senhaGerada}</p><br /><a href="http://localhost:5173/adminlogin" style="background: #22c55e; color: black; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">Acessar Painel agora</a><p style="font-size: 10px; margin-top: 20px; color: #666;">Recomendamos alterar sua senha no primeiro acesso.</p></div>` };
  try { await transporter.sendMail(mailOptions); res.json({ message: 'Cadastro criado e e-mail enviado!' }); } catch { res.status(500).json({ error: 'Erro ao enviar o e-mail.' }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor Supabase rodando na porta ${PORT}`);
});
