import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Users, Calendar as LucideCalendar, ShoppingBag, AlertTriangle, 
  LogOut, CheckCircle, XCircle, Star, MessageSquare, Trophy, 
  Bell, ChevronLeft, ChevronRight, Crown, Plus, Search, DollarSign,
  Package, AlertCircle, BellRing, Trash2, Clock, Copy, Lock, Edit, Ban, RefreshCcw, CheckCircle2,
  CreditCard, Banknote
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { usePixPayment, calcularPrecoReserva } from '@/hooks/usePixPayment';
import { PixPaymentSection } from "@/components/booking/PixPaymentSection";

const Separator = ({ className }: { className?: string }) => <div className={`h-[1px] w-full ${className}`} />;

const AtendenteDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- ESTADOS ---
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date());
  const [filtroNome, setFiltroNome] = useState("");
  const [duracao, setDuracao] = useState<string>("60");
  const [metodoPgto, setMetodoPgto] = useState<"pix" | "dinheiro" | "antecipado">("dinheiro");
  const [tipoReservaAtendente, setTipoReservaAtendente] = useState<'avulsa' | 'pacote'>('avulsa');
  const [isModalVipAberto, setIsModalVipAberto] = useState(false);
  const [modalNovoAlertaAberto, setModalNovoAlertaAberto] = useState(false);
  const [novoAlertaForm, setNovoAlertaForm] = useState({ cliente_id: "", tipo: "neutra" as "positiva" | "negativa" | "neutra", observacao: "" });
  const { isCarregandoPix, pixData, gerarPagamentoPix, limparPix } = usePixPayment();
  const [loading, setLoading] = useState(false);
  const [totalComissao, setTotalComissao] = useState(0);
  const [pixChaveEstatica, setPixChaveEstatica] = useState("");
  const [reservaIdAtual, setReservaIdAtual] = useState<number | null>(null);
  const [reservaCriada, setReservaCriada] = useState(false);
  const [isTermosAberto, setIsTermosAberto] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [remarcarModal, setRemarcarModal] = useState(false);
  const [remarcarReserva, setRemarcarReserva] = useState<any>(null);
  const [remarcarData, setRemarcarData] = useState("");
  const [editandoVipId, setEditandoVipId] = useState<number | null>(null);
  const [editVipForm, setEditVipForm] = useState({ dia: "", horario: "", metodoPgto: "" });
  const [funcionarioNome, setFuncionarioNome] = useState("");
  const [funcionarioId, setFuncionarioId] = useState<string | null>(null);
  // Financeiro - liquidação customizada
  const [liquidarValorCustom, setLiquidarValorCustom] = useState("");
  const [liquidarMetodo, setLiquidarMetodo] = useState<"pix" | "dinheiro" | "metade">("dinheiro");
  const { isCarregandoPix: isCarregandoPixFinanceiro, pixData: pixDataFinanceiro, gerarPagamentoPix: gerarPixFinanceiro, limparPix: limparPixFinanceiro } = usePixPayment();
  // Notificação de pagamento recebido
  const [notificacaoPagamento, setNotificacaoPagamento] = useState<{ show: boolean; cliente: string; valor: number } | null>(null);
  
  // Cadastro de novo cliente
  const [mostrarCadastroCliente, setMostrarCadastroCliente] = useState(false);
  const [novoClienteForm, setNovoClienteForm] = useState({ nome: "", sobrenome: "", telefone: "", email: "" });
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<number | null>(null);
  const [clienteNomeBusca, setClienteNomeBusca] = useState("");
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  interface Mensalista {
    id?: number; nome: string; dia: string; horario: string; metodoPgto: string;
    observacao?: string; status_pagamento?: string; responsavel?: string;
  }
  interface Produto {
    id: number; nome: string; tipo: string; preco: number;
    preco_venda?: number; preco_aluguel?: number; estoque: number;
  }
  interface ReservaCompleta {
    id: number; data_reserva: string; horario_inicio: string; horario_fim: string;
    tipo: string; valor_total: number; valor_pago_sinal: number; reserva_fixa_id: number | null;
    forma_pagamento: string; pago: boolean; status?: string; cliente_nome?: string;
    clientes: { nome: string } | null;
  }
  interface SlotAgenda { inicio: string; fim: string; turno: string; valor: number; status: string; }

  const [mensalistas, setMensalistas] = useState<Mensalista[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [listaReservas, setListaReservas] = useState<ReservaCompleta[]>([]);
  const [itensCarrinho, setItensCarrinho] = useState<any[]>([]);
  const [itensReservaMap, setItensReservaMap] = useState<Record<number, any[]>>({});

  // --- CARREGAMENTO ---
  const buscarDadosIniciais = async () => {
    const { data: config } = await supabase.from('configuracoes').select('valor').eq('chave', 'manutencao').single();
    if (config) setIsMaintenance(config.valor === 'true');

    const { data: pixKey } = await supabase.from('configuracoes').select('valor').eq('chave', 'pix_chave').single();
    if (pixKey?.valor) setPixChaveEstatica(pixKey.valor);

    const { data: prod } = await supabase.from('produtos').select('*').eq('ativo', true);
    if (prod) setProdutos(prod.map(p => ({
      id: p.id, nome: p.nome, tipo: p.tipo || 'venda',
      preco: p.preco_venda ?? p.preco_aluguel ?? 0,
      preco_venda: p.preco_venda, preco_aluguel: p.preco_aluguel,
      estoque: p.quantidade_estoque ?? 0
    })));

    const { data: cli } = await supabase.from('clientes').select('*');
    if (cli) setClientes(cli.map(c => ({
      id: c.id, nome: [c.nome, c.sobrenome].filter(Boolean).join(" "),
      telefone: c.telefone || "", isVip: c.tipo === "mensalista",
      reservas_concluidas: c.reservas_concluidas || 0,
      pontos_fidelidade: c.pontos_fidelidade || 0,
    })));

    const { data: obs } = await supabase.from('observacoes_clientes').select('*');
    if (obs) setAlertas(obs.map(o => ({
      id: o.id, cliente: o.cliente_nome, cliente_id: o.cliente_id,
      obs: o.observacao, tipo: o.tipo || "neutra", alerta: !!o.alerta
    })));

    // Buscar itens_reserva para mostrar consumo na agenda
    const { data: itens } = await supabase.from('itens_reserva').select('*, produtos(nome, preco_venda, preco_aluguel, tipo)');
    if (itens) {
      const map: Record<number, any[]> = {};
      itens.forEach((it: any) => {
        if (!it.reserva_id) return;
        if (!map[it.reserva_id]) map[it.reserva_id] = [];
        map[it.reserva_id].push(it);
      });
      setItensReservaMap(map);
    }

    buscarMensalistas();
    carregarReservasFinancas();
  };

  // Buscar nome e ID do funcionário logado
  useEffect(() => {
    const buscarFuncionario = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: func } = await supabase.from('funcionarios').select('id, nome, sobrenome').eq('email_corporativo', user.email).single();
        if (func) {
          setFuncionarioNome([func.nome, func.sobrenome].filter(Boolean).join(" "));
          setFuncionarioId(func.id);
        } else {
          // Fallback: try matching by regular email
          const { data: func2 } = await supabase.from('funcionarios').select('id, nome, sobrenome').eq('email', user.email).single();
          if (func2) {
            setFuncionarioNome([func2.nome, func2.sobrenome].filter(Boolean).join(" "));
            setFuncionarioId(func2.id);
          } else {
            setFuncionarioNome(localStorage.getItem("userName") || "Atendente");
            setFuncionarioId(null);
          }
        }
      }
    };
    buscarFuncionario();
  }, []);

  const buscarMensalistas = async () => {
    const { data } = await supabase.from('clientes').select('*').eq('tipo', 'mensalista');
    if (data) setMensalistas(data.map(d => ({
      id: d.id, nome: d.nome, dia: d.dia_fixo || "", horario: d.horario_fixo || "",
      metodoPgto: d.forma_pagamento || "", status_pagamento: d.status_pagamento,
      observacao: d.observacoes
    })));
  };

  const carregarReservasFinancas = async () => {
    const { data } = await supabase.from('reservas').select('*, clientes ( nome )').order('data_reserva', { ascending: false });
    if (data) setListaReservas(data as unknown as ReservaCompleta[]);
  };

  useEffect(() => { buscarDadosIniciais(); }, []);

  // Realtime: escutar pagamentos confirmados para notificar atendente
  useEffect(() => {
    const channel = supabase
      .channel('pagamentos-atendente')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pagamentos' }, async (payload) => {
        const pgto = payload.new as any;
        if (pgto.status !== 'pago') return;
        const { data: reserva } = await supabase.from('reservas').select('cliente_nome, valor_total').eq('id', pgto.reserva_id).single();
        if (reserva) {
          setNotificacaoPagamento({ show: true, cliente: reserva.cliente_nome || "Cliente", valor: pgto.valor });
          toast({ title: "💰 Pagamento Recebido!", description: `${reserva.cliente_nome} pagou R$ ${Number(pgto.valor).toFixed(2)} via PIX` });
          carregarReservasFinancas();
          buscarDadosIniciais();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Comissão
  useEffect(() => {
    if (!funcionarioId) return;
    const buscarComissao = async () => {
      const { data } = await supabase.from('reservas').select('comissao_valor').eq('atendente_id', funcionarioId);
      const total = data?.reduce((acc, curr) => acc + (Number(curr.comissao_valor) || 0), 0) || 0;
      setTotalComissao(total);
    };
    buscarComissao();
  }, [funcionarioId]);

  // Manutenção polling
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: config } = await supabase.from('configuracoes').select('valor').eq('chave', 'manutencao').single();
      if (config) setIsMaintenance(config.valor === 'true');
      await supabase.rpc('cancelar_reservas_pix_expiradas');
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- LÓGICA DO CALENDÁRIO ---
  const diasMes = useMemo(() => {
    const start = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const end = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < start.getDay(); i++) days.push(null);
    for (let i = 1; i <= end.getDate(); i++) days.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i));
    return days;
  }, [mesAtual]);

  const gerarSlotsAgenda = (duracaoMinutos: number): SlotAgenda[] => {
    const slots: SlotAgenda[] = [];
    const periodos = [{ inicio: 9, fim: 18 }, { inicio: 18, fim: 22 }];
    for (const periodo of periodos) {
      let atual = periodo.inicio;
      while (atual + duracaoMinutos / 60 <= periodo.fim) {
        const horas = Math.floor(atual);
        const minutos = (atual % 1) * 60;
        const inicio = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
        const totalMinutosFim = horas * 60 + minutos + duracaoMinutos;
        const fim = `${String(Math.floor(totalMinutosFim / 60)).padStart(2, '0')}:${String(totalMinutosFim % 60).padStart(2, '0')}`;
        const valorBase = horas >= 18 ? 140 : 100;
        slots.push({ inicio, fim, turno: horas >= 18 ? 'Noturno' : 'Diurno', valor: (valorBase * duracaoMinutos) / 60, status: 'livre' });
        atual += 0.5;
      }
    }
    return slots;
  };

  const listaSlotsAgendamento = useMemo(() => {
    const slotsCalculados = gerarSlotsAgenda(Number(duracao));
    const dataFormatada = diaSelecionado.toLocaleDateString('sv-SE');
    return slotsCalculados.map(slot => {
      const reservaEncontrada = listaReservas?.find(r => {
        if (r.data_reserva === dataFormatada && r.horario_inicio === slot.inicio && r.status !== 'cancelada') return true;
        if (r.tipo === 'pacote' && r.horario_inicio === slot.inicio && r.status !== 'cancelada') {
          const reservaDate = new Date(r.data_reserva + 'T00:00:00');
          const slotDate = new Date(dataFormatada + 'T00:00:00');
          if (reservaDate.getDay() === slotDate.getDay()) {
            const diffDays = Math.abs((slotDate.getTime() - reservaDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays > 0 && diffDays <= 28 && diffDays % 7 === 0) return true;
          }
        }
        return false;
      });
      let slotStatus = "livre";
      if (reservaEncontrada) {
        slotStatus = reservaEncontrada.pago ? "reservado" : (reservaEncontrada.status === "pendente" ? "pendente" : "reservado");
      }
      return { ...slot, status: slotStatus, detalhes: reservaEncontrada || null };
    });
  }, [duracao, listaReservas, diaSelecionado]);

  // --- FUNÇÕES ---
  const playApito = () => { new Audio('/sound/apito.mp3').play().catch(() => {}); };
  const playTorcida = () => { new Audio('/sound/torcida.mp3').play().catch(() => {}); };

  const adicionarAoCarrinho = (produto: any) => {
    setItensCarrinho([...itensCarrinho, { ...produto, idUnico: Date.now() }]);
    toast({ title: "Adicionado", description: `${produto.nome} somado à reserva.` });
  };
  const removerDoCarrinho = (idUnico: number) => {
    setItensCarrinho(itensCarrinho.filter(item => item.idUnico !== idUnico));
  };

  const totalCarrinho = useMemo(() => itensCarrinho.reduce((acc, item) => acc + item.preco, 0), [itensCarrinho]);

  // Cadastrar novo cliente
  const handleCadastrarCliente = async () => {
    if (!novoClienteForm.nome.trim()) return toast({ variant: "destructive", title: "Nome obrigatório" });
    if (!novoClienteForm.email.trim()) return toast({ variant: "destructive", title: "E-mail obrigatório" });
    const senhaGerada = Math.random().toString(36).slice(-8);
    try {
      const { data: cli, error } = await supabase.from('clientes').insert([{
        nome: novoClienteForm.nome.trim(),
        sobrenome: novoClienteForm.sobrenome.trim() || null,
        telefone: novoClienteForm.telefone.trim() || null,
        email: novoClienteForm.email.trim(),
        senha: senhaGerada, // será hasheada pelo trigger se existir, senão salva plain
        tipo: 'avulso',
        cadastrado_por: funcionarioNome || 'atendente'
      }]).select().single();
      if (error) throw error;
      // Atualizar senha com hash via RPC
      await supabase.rpc('redefinir_senha_cliente', { p_email: novoClienteForm.email.trim(), p_nova_senha: senhaGerada });
      
      setClienteSelecionadoId(cli.id);
      setClienteNomeBusca([cli.nome, cli.sobrenome].filter(Boolean).join(" "));
      setMostrarCadastroCliente(false);
      toast({ title: "✅ Cliente cadastrado!" });
      buscarDadosIniciais();
      
      // Retornar dados para envio WhatsApp posterior
      return { id: cli.id, nome: [cli.nome, cli.sobrenome].filter(Boolean).join(" "), email: novoClienteForm.email.trim(), senha: senhaGerada, telefone: novoClienteForm.telefone.trim() };
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro ao cadastrar", description: e.message });
      return null;
    }
  };

  // Sugestões de clientes filtradas
  const clientesFiltrados = useMemo(() => {
    if (!clienteNomeBusca.trim()) return [];
    return clientes.filter(c => c.nome.toLowerCase().includes(clienteNomeBusca.toLowerCase())).slice(0, 8);
  }, [clientes, clienteNomeBusca]);

  async function handleAgendar(slot: any, clienteNome: string, turno_id: number, clienteIdOverride?: number) {
    if (!clienteNome) return toast({ variant: "destructive", title: "Nome obrigatório" });
    const duracaoMin = parseInt(duracao, 10);
    setLoading(true);
    try {
      const horaH = parseInt(slot.inicio || slot, 10);
      const valorBaseHora = horaH >= 18 ? 140 : 100;
      const valorReserva = (valorBaseHora * duracaoMin) / 60;
      const totalProdutos = itensCarrinho.reduce((acc: number, item: any) => acc + item.preco, 0);
      const valorTotalReserva = tipoReservaAtendente === 'pacote' ? valorReserva * 4 : valorReserva;
      const totalGeral = valorTotalReserva + totalProdutos;

      const slotInicio = typeof slot === 'string' ? slot : slot.inicio;
      const slotFim = typeof slot === 'string' ? '' : slot.fim;
      
      const clienteId = clienteIdOverride || clienteSelecionadoId || undefined;
      const formaPgto = metodoPgto === 'antecipado' ? 'pix' : metodoPgto;

      const { data: reserva, error: resError } = await supabase.from('reservas').insert([{
        cliente_nome: clienteNome, data_reserva: diaSelecionado.toLocaleDateString('sv-SE'),
        horario_inicio: slotInicio, horario_fim: slotFim, duracao: duracaoMin,
        valor_total: totalGeral, forma_pagamento: formaPgto,
        tipo: tipoReservaAtendente,
        cliente_id: clienteId,
        funcionario_id: funcionarioId || undefined, atendente_id: funcionarioId || undefined,
        pago: false, status: formaPgto === 'pix' ? 'pendente' : 'confirmada',
        turno_id,
        observacoes: tipoReservaAtendente === 'pacote' ? 'Pacote 4 jogos' : undefined
      }]).select().single();

      if (resError) throw resError;

      setReservaIdAtual(reserva.id);
      setReservaCriada(true);

      if (itensCarrinho.length > 0) {
        await supabase.from('itens_reserva').insert(
          itensCarrinho.map(item => ({
            reserva_id: reserva.id, produto_id: item.id, tipo: item.tipo,
            quantidade: 1, preco_unitario: item.preco, subtotal: item.preco
          }))
        );
      }

      if (metodoPgto === 'dinheiro') {
        playTorcida();
        setIsTermosAberto(true);
        setAceitouTermos(false);
      } else if (metodoPgto === 'antecipado') {
        // Antecipado = agendar, pagamento será cobrado antes do jogo
        playTorcida();
        setIsTermosAberto(true);
        setAceitouTermos(false);
      } else {
        playApito();
      }

      setItensCarrinho([]);
      buscarDadosIniciais();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setLoading(false);
    }
  }

  const handleGerarPixIntegral = async (valorOriginal: number, descontoValor: number) => {
    if (reservaIdAtual) {
      await gerarPagamentoPix(valorOriginal, `Reserva Arena Cedro`, reservaIdAtual, undefined, undefined, 'integral', descontoValor);
    }
  };

  const handleGerarPixLivre = async (valorOriginal: number) => {
    if (reservaIdAtual) {
      await gerarPagamentoPix(valorOriginal, `Reserva Arena Cedro (PIX Livre)`, reservaIdAtual, undefined, undefined, 'adiantamento', 0);
    }
  };

  const handlePixTimeout = async () => {
    if (reservaIdAtual) {
      await supabase.from('reservas').update({ status: 'cancelada' }).eq('id', reservaIdAtual);
      setReservaIdAtual(null);
      setReservaCriada(false);
      limparPix();
      carregarReservasFinancas();
    }
  };

  const handlePixConfirmadoAtendente = async () => {
    if (reservaIdAtual) {
      const { data: reserva } = await supabase.from('reservas').select('cliente_id, valor_restante').eq('id', reservaIdAtual).single();
      if (reserva?.cliente_id && Number(reserva.valor_restante || 0) <= 0) {
        await supabase.rpc('incrementar_fidelidade', { cli_id: reserva.cliente_id });
      }
    }
    toast({ title: "Pagamento confirmado!" });
    setIsTermosAberto(true);
    setAceitouTermos(false);
    carregarReservasFinancas();
    buscarDadosIniciais();
  };

  const handleRemarcarAtendente = async () => {
    if (!remarcarReserva?.id || !remarcarData) return;
    try {
      const { error } = await supabase.from('reservas').update({ data_reserva: remarcarData }).eq('id', remarcarReserva.id);
      if (error) throw error;
      toast({ title: "Reserva remarcada!", description: `Nova data: ${new Date(remarcarData + 'T00:00:00').toLocaleDateString('pt-BR')}` });
      setRemarcarModal(false);
      carregarReservasFinancas();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message });
    }
  };

  const handleLiquidarReserva = async (id: number, valorPago: number, metodo: string) => {
    try {
      const { data: reserva } = await supabase.from('reservas').select('cliente_id, valor_pago_sinal, valor_total').eq('id', id).single();
      const totalJaPago = Number(reserva?.valor_pago_sinal || 0) + valorPago;
      const valorRestante = Math.max(Number(reserva?.valor_total || 0) - totalJaPago, 0);
      const pagamentoCompleto = valorRestante <= 0;

      const { error } = await supabase.from('reservas').update({
        pago: pagamentoCompleto,
        valor_pago_sinal: totalJaPago,
        valor_restante: valorRestante,
        data_pagamento: pagamentoCompleto ? new Date().toISOString() : undefined,
        forma_pagamento: metodo,
        status: pagamentoCompleto ? 'confirmada' : 'pendente'
      }).eq('id', id);
      if (error) throw error;

      // Registrar pagamento
      await supabase.from('pagamentos').insert([{
        reserva_id: id, valor: valorPago, status: 'aprovado',
        tipo: pagamentoCompleto ? 'integral' : 'parcial',
        forma_pagamento: metodo, data_confirmacao: new Date().toISOString()
      }]);

      if (pagamentoCompleto && reserva?.cliente_id) {
        await supabase.rpc('incrementar_fidelidade', { cli_id: reserva.cliente_id });
      }
      toast({ title: pagamentoCompleto ? "✅ Pagamento Total Confirmado" : "💰 Pagamento Parcial Registrado" });
      setLiquidarValorCustom("");
      limparPixFinanceiro();
      carregarReservasFinancas();
      buscarDadosIniciais();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message });
    }
  };

  // Gerar PIX para financeiro (dar baixa)
  const handleGerarPixFinanceiro = async (reservaId: number, valor: number) => {
    await gerarPixFinanceiro(valor, `Pagamento restante Arena Cedro`, reservaId, undefined, undefined, 'parcial', 0);
  };

  // VIP handlers
  const handleEditarVip = async (id: number) => {
    const { error } = await supabase.from('clientes').update({
      dia_fixo: editVipForm.dia, horario_fixo: editVipForm.horario,
      forma_pagamento: editVipForm.metodoPgto
    }).eq('id', id);
    if (!error) {
      toast({ title: "VIP atualizado!" });
      setEditandoVipId(null);
      buscarMensalistas();
    }
  };

  const handleCancelarVip = async (id: number) => {
    if (!confirm("Cancelar este horário fixo?")) return;
    const { error } = await supabase.from('clientes').update({ tipo: 'avulso', dia_fixo: null, horario_fixo: null }).eq('id', id);
    if (!error) {
      toast({ title: "Horário fixo cancelado", variant: "destructive" });
      buscarMensalistas();
    }
  };

  const handleDevolverEstoque = async (reservaId: number) => {
    try {
      await supabase.rpc('devolver_estoque_aluguel', { p_reserva_id: reservaId });
      toast({ title: "Estoque devolvido!", description: "Itens alugados retornaram ao estoque." });
      buscarDadosIniciais();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleFecharCaixa = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const dataStr = diaSelecionado.toLocaleDateString('sv-SE');
      const reservasDoDia = listaReservas.filter(r => r.data_reserva === dataStr && r.pago);
      const pix = reservasDoDia.filter(r => r.forma_pagamento === 'pix').reduce((a, r) => a + Number(r.valor_total || 0), 0);
      const dinheiro = reservasDoDia.filter(r => r.forma_pagamento === 'dinheiro').reduce((a, r) => a + Number(r.valor_total || 0), 0);

      await supabase.from('fechamentos_caixa').insert([{
        data: dataStr, valor_pix: pix, valor_dinheiro: dinheiro, fechado_por: user?.id
      }]);
      toast({ title: "Caixa Fechado!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    }
  };

  // Financeiro real
  const resumoFinanceiro = useMemo(() => {
    const dataStr = diaSelecionado.toLocaleDateString('sv-SE');
    const doDia = listaReservas.filter(r => r.data_reserva === dataStr);
    const pagas = doDia.filter(r => r.pago);
    const pendentes = doDia.filter(r => !r.pago);
    return {
      pix: pagas.filter(r => r.forma_pagamento === 'pix').reduce((a, r) => a + Number(r.valor_total || 0), 0),
      dinheiro: pagas.filter(r => r.forma_pagamento === 'dinheiro').reduce((a, r) => a + Number(r.valor_total || 0), 0),
      restante: pendentes.reduce((a, r) => a + Number(r.valor_total || 0) - Number(r.valor_pago_sinal || 0), 0),
    };
  }, [listaReservas, diaSelecionado]);

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans">
      {/* HEADER */}
      <header className="w-full bg-[#0c120f] border-b border-white/5 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src="/media/logo-arena.png" alt="Logo" className="h-40 md:h-48 w-auto object-contain transition-transform hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-[#22c55e] tracking-[0.3em] leading-none mb-1">Painel Operacional</span>
              <span className="text-xl font-black italic uppercase text-white">Bem Vindo, {funcionarioNome || "Atendente"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end bg-[#22c55e]/10 px-4 py-1.5 rounded-2xl border border-[#22c55e]/20">
              <span className="text-[9px] font-black uppercase text-[#22c55e] tracking-widest leading-none mb-1">Comissão (5%)</span>
              <div className="flex items-baseline gap-1 leading-none">
                <span className="text-[#22c55e] font-bold text-[10px] italic">R$</span>
                <span className="text-xl font-black italic text-white">{totalComissao.toFixed(2)}</span>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black rounded-xl font-bold">
                  <DollarSign size={16} className="mr-1"/> CAIXA
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem] outline-none">
                <DialogHeader><DialogTitle className="italic uppercase flex items-center gap-2"><DollarSign className="text-[#22c55e]" size={20} /> Resumo {diaSelecionado.toLocaleDateString()}</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5"><p className="text-[10px] text-gray-400 uppercase font-black">PIX</p><p className="text-xl font-black text-[#22c55e]">R$ {resumoFinanceiro.pix.toFixed(2)}</p></div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5"><p className="text-[10px] text-gray-400 uppercase font-black">Dinheiro</p><p className="text-xl font-black text-[#22c55e]">R$ {resumoFinanceiro.dinheiro.toFixed(2)}</p></div>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex justify-between items-center">
                    <span className="text-xs uppercase font-black italic">A receber:</span>
                    <span className="font-black text-red-500">R$ {resumoFinanceiro.restante.toFixed(2)}</span>
                  </div>
                  <Button onClick={() => { if(confirm("Fechar caixa?")) handleFecharCaixa(); }} className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase h-14 rounded-2xl"><Lock size={18} className="mr-2"/> Fechar Caixa</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-xl" onClick={handleLogout}><LogOut size={22} /></Button>
          </div>
        </div>
      </header>

      {/* Notificação de pagamento recebido */}
      {notificacaoPagamento?.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right bg-[#22c55e] text-black p-4 rounded-2xl shadow-2xl max-w-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} />
            <div>
              <p className="font-black text-sm">Pagamento Recebido!</p>
              <p className="text-xs font-bold">{notificacaoPagamento.cliente} pagou R$ {notificacaoPagamento.valor.toFixed(2)}</p>
            </div>
            <button onClick={() => setNotificacaoPagamento(null)} className="ml-2 font-black">✕</button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {isMaintenance && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 animate-pulse">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <div><p className="text-red-500 font-black uppercase text-sm">⚠️ SISTEMA EM MANUTENÇÃO</p><p className="text-red-400/70 text-xs">Novos agendamentos estão bloqueados.</p></div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-6 text-xs font-bold uppercase">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#22c55e]" /> Disponível</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Pgto Pendente</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Reservado</div>
        </div>

        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/5 w-full md:w-fit overflow-x-auto">
            <TabsTrigger value="agenda" className="px-6 font-bold uppercase italic">Agenda</TabsTrigger>
            <TabsTrigger value="clientes" className="px-6 font-bold uppercase italic">Clientes</TabsTrigger>
            <TabsTrigger value="vip" className="px-6 font-bold uppercase italic">Pacotes</TabsTrigger>
            <TabsTrigger value="produtos" className="font-black italic uppercase px-6 bg-[#22c55e]/10 text-[#22c55e]">Produtos</TabsTrigger>
            <TabsTrigger value="alertas" className="font-black italic uppercase px-6">Alertas</TabsTrigger>
            <TabsTrigger value="financeiro" className="font-black italic uppercase px-6">Financeiro</TabsTrigger>
          </TabsList>

          {/* AGENDA */}
          <TabsContent value="agenda" className="space-y-8">
            <Card className="bg-[#0c120f] border-white/5 overflow-hidden rounded-[2.5rem]">
              <div className="bg-[#22c55e] p-4 flex justify-between items-center text-black font-black uppercase text-sm">
                <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))}><ChevronLeft /></button>
                <h2 className="italic tracking-widest">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesAtual)}</h2>
                <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))}><ChevronRight /></button>
              </div>
              <div className="grid grid-cols-7 p-6 gap-2">
                {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map(d => <div key={d} className="text-center text-[10px] text-gray-500 font-black mb-2">{d}</div>)}
                {diasMes.map((date, i) => (
                  <button key={i} disabled={!date} onClick={() => date && setDiaSelecionado(date)}
                    className={cn("h-14 rounded-2xl flex items-center justify-center font-black text-sm transition-all border",
                      !date ? "opacity-0" : "hover:bg-[#22c55e]/10 border-white/5",
                      date?.toDateString() === diaSelecionado.toDateString() ? "bg-[#22c55e] text-black shadow-[0_0_20px_rgba(34,197,94,0.4)] border-[#22c55e]" : "text-white bg-white/5"
                    )}>{date?.getDate()}</button>
                ))}
              </div>
            </Card>

            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Duração do Jogo</p>
              <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                {[30, 60, 90].map(min => (
                  <button key={min} onClick={() => setDuracao(String(min))}
                    className={cn("px-8 py-3 rounded-xl text-[11px] font-black uppercase transition-all",
                      duracao === String(min) ? "bg-[#22c55e] text-black" : "text-gray-500 hover:text-white"
                    )}>{min} MIN</button>
                ))}
              </div>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {listaSlotsAgendamento.map((slot: any, index) => {
                  const isLivre = slot.status === 'livre';
                  const isPendente = slot.status === 'pendente';
                  const isReservado = slot.status === 'reservado';
                  const tipoReserva = slot.detalhes?.tipo;
                  const itensDoSlot = slot.detalhes ? itensReservaMap[slot.detalhes.id] || [] : [];

                  return (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <button className={cn(
                          "p-5 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-2 transition-all min-h-[120px] group",
                          isLivre ? "border-[#22c55e]/20 bg-[#22c55e]/5 hover:border-[#22c55e]/60" :
                          isPendente ? "border-yellow-500/20 bg-yellow-500/5" :
                          "border-red-500/20 bg-red-500/5"
                        )}>
                          <span className="text-xs font-black italic">{slot.inicio} — {slot.fim}</span>
                          <Badge className={cn("text-[8px] font-black border-none",
                            isLivre ? "bg-[#22c55e]/20 text-[#22c55e]" :
                            isPendente ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                          )}>{isLivre ? "LIVRE" : isPendente ? "PENDENTE" : "RESERVADO"}</Badge>
                          {isReservado && tipoReserva && (
                            <Badge className={cn("text-[7px] font-black border-none",
                              tipoReserva === 'pacote' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                            )}>{tipoReserva === 'pacote' ? 'PACOTE' : 'AVULSA'}</Badge>
                          )}
                          {/* Mostrar consumo de produtos */}
                          {itensDoSlot.length > 0 && (
                            <div className="flex flex-col items-center gap-0.5">
                              <Badge className="text-[6px] font-black bg-orange-500/20 text-orange-400 border-none">
                                {itensDoSlot.length} {itensDoSlot.length === 1 ? 'ITEM' : 'ITENS'}
                              </Badge>
                            </div>
                          )}
                          {isLivre && <span className="text-[8px] font-bold text-gray-600 italic">R$ {slot.valor.toFixed(2)}</span>}
                          {!isLivre && slot.detalhes && (
                            <span className="text-[8px] font-bold text-gray-500">{slot.detalhes.clientes?.nome || slot.detalhes.cliente_nome || ""}</span>
                          )}
                        </button>
                      </DialogTrigger>
                      {isLivre ? (
                        <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem] max-w-md outline-none max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="italic uppercase flex items-center gap-2 text-xl font-black">
                              <Plus className="text-[#22c55e]" size={20} /> NOVO JOGO - {slot.inicio}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            {/* Nome do cliente com autocomplete + cadastro */}
                            <div className="space-y-2 relative">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase text-gray-500 italic tracking-widest">Atleta</label>
                                <button type="button" onClick={() => setMostrarCadastroCliente(!mostrarCadastroCliente)}
                                  className="text-[9px] font-black uppercase text-[#22c55e] hover:underline flex items-center gap-1">
                                  <Plus size={12} /> {mostrarCadastroCliente ? "Fechar" : "Novo Cliente"}
                                </button>
                              </div>
                              
                              {/* Cadastro inline de novo cliente */}
                              {mostrarCadastroCliente && (
                                <div className="bg-white/5 border border-[#22c55e]/20 rounded-xl p-4 space-y-3 animate-in slide-in-from-top">
                                  <p className="text-[9px] font-black uppercase text-[#22c55e]">Cadastrar Novo Cliente</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input placeholder="Nome *" value={novoClienteForm.nome} onChange={e => setNovoClienteForm(p => ({ ...p, nome: e.target.value }))} className="bg-white/5 border-white/10 h-10 rounded-lg text-white text-xs" />
                                    <Input placeholder="Sobrenome" value={novoClienteForm.sobrenome} onChange={e => setNovoClienteForm(p => ({ ...p, sobrenome: e.target.value }))} className="bg-white/5 border-white/10 h-10 rounded-lg text-white text-xs" />
                                  </div>
                                  <Input placeholder="Telefone (WhatsApp)" value={novoClienteForm.telefone} onChange={e => setNovoClienteForm(p => ({ ...p, telefone: e.target.value }))} className="bg-white/5 border-white/10 h-10 rounded-lg text-white text-xs" />
                                  <Input placeholder="E-mail *" type="email" value={novoClienteForm.email} onChange={e => setNovoClienteForm(p => ({ ...p, email: e.target.value }))} className="bg-white/5 border-white/10 h-10 rounded-lg text-white text-xs" />
                                  <Button type="button" className="w-full bg-[#22c55e] text-black font-black uppercase text-xs h-10 rounded-lg"
                                    onClick={async () => {
                                      const resultado = await handleCadastrarCliente();
                                      if (resultado) {
                                        // Enviar WhatsApp com credenciais
                                        const tel = resultado.telefone?.replace(/\D/g, '');
                                        if (tel) {
                                          const msg = `*ARENA CEDRO - CADASTRO REALIZADO* ⚽%0A%0A` +
                                            `Olá *${resultado.nome}*!%0A%0A` +
                                            `Seu cadastro foi criado com sucesso.%0A%0A` +
                                            `📧 *Usuário:* ${resultado.email}%0A` +
                                            `🔑 *Senha:* ${resultado.senha}%0A%0A` +
                                            `Acesse: ${window.location.origin}/login%0A%0A` +
                                            `Não compartilhe sua senha com ninguém!`;
                                          window.open(`https://wa.me/55${tel}?text=${msg}`, '_blank');
                                        }
                                        setNovoClienteForm({ nome: "", sobrenome: "", telefone: "", email: "" });
                                      }
                                    }}>
                                    Cadastrar e Enviar WhatsApp
                                  </Button>
                                </div>
                              )}
                              
                              {/* Campo de busca/autocomplete */}
                              {!mostrarCadastroCliente && (
                                <div className="relative">
                                  <Input 
                                    placeholder="Buscar ou digitar nome do atleta" 
                                    value={clienteNomeBusca} 
                                    onChange={e => { setClienteNomeBusca(e.target.value); setMostrarSugestoes(true); setClienteSelecionadoId(null); }}
                                    onFocus={() => clienteNomeBusca.trim() && setMostrarSugestoes(true)}
                                    onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                                    className="bg-white/5 border-white/10 h-14 rounded-xl text-white" 
                                    id={`atleta-${slot.inicio}`} 
                                  />
                                  {mostrarSugestoes && clientesFiltrados.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#0c120f] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                      {clientesFiltrados.map(c => (
                                        <button key={c.id} type="button"
                                          className="w-full text-left px-4 py-3 hover:bg-[#22c55e]/10 transition-colors flex items-center justify-between border-b border-white/5 last:border-0"
                                          onMouseDown={(e) => { e.preventDefault(); setClienteNomeBusca(c.nome); setClienteSelecionadoId(c.id); setMostrarSugestoes(false); }}>
                                          <div className="flex items-center gap-2">
                                            <Users size={14} className="text-[#22c55e]" />
                                            <span className="text-white text-sm font-bold">{c.nome}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {c.isVip && <Badge className="bg-[#22c55e] text-black text-[7px] font-black">VIP</Badge>}
                                            <span className="text-[9px] text-gray-500">{c.reservas_concluidas || 0} jogos</span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  {clienteSelecionadoId && (
                                    <p className="text-[9px] text-[#22c55e] font-bold mt-1">✓ Cliente vinculado ao cadastro</p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Tipo de Reserva */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-gray-500 italic tracking-widest">Tipo de Agendamento</label>
                              <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-2xl border border-white/5">
                                <button type="button" onClick={() => setTipoReservaAtendente('avulsa')} className={cn("py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2", tipoReservaAtendente === 'avulsa' ? "bg-[#22c55e] text-black shadow-lg" : "text-gray-500 hover:text-white")}>⚽ Avulsa</button>
                                <button type="button" onClick={() => setTipoReservaAtendente('pacote')} className={cn("py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2", tipoReservaAtendente === 'pacote' ? "bg-[#22c55e] text-black shadow-lg" : "text-gray-500 hover:text-white")}>📦 Pacote 4 Jogos</button>
                              </div>
                              {tipoReservaAtendente === 'pacote' && (
                                <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 p-3 rounded-xl">
                                  <p className="text-[9px] text-[#22c55e] font-black uppercase italic leading-tight">✨ Pacote 4 jogos: desconto de R$10 por jogo (R$40 total). Pagamento antecipado PIX ou dinheiro.</p>
                                </div>
                              )}
                            </div>

                            {/* Duração */}
                            <div>
                              <label className="text-[10px] font-bold uppercase text-gray-400">Duração</label>
                              <div className="h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-sm font-black text-[#22c55e]">{duracao} MIN</div>
                            </div>

                            {/* Resumo de valores */}
                            {(() => {
                              const valorReserva = slot.valor;
                              const qtdJogos = tipoReservaAtendente === 'pacote' ? 4 : 1;
                              const valorBase = tipoReservaAtendente === 'pacote' ? valorReserva * 4 : valorReserva;
                              const descontoAtual = tipoReservaAtendente === 'pacote' ? 40 : 10;
                              const totalComProdutos = valorBase + totalCarrinho;
                              return (
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">{tipoReservaAtendente === 'pacote' ? `Quadra (${qtdJogos}x R$${valorReserva.toFixed(0)})` : `Quadra (${slot.inicio})`}:</span>
                                    <span className="text-white font-bold">R$ {valorBase.toFixed(2)}</span>
                                  </div>
                                  {totalCarrinho > 0 && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-400">Produtos:</span>
                                      <span className="text-white font-bold">R$ {totalCarrinho.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="border-t border-white/10 pt-2 flex justify-between font-black text-lg italic">
                                    <span className="text-gray-400">Total:</span>
                                    <span className="text-[#22c55e]">R$ {totalComProdutos.toFixed(2)}</span>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Método de Pagamento */}
                            <RadioGroup value={metodoPgto} onValueChange={(v) => setMetodoPgto(v as "pix" | "dinheiro")} className="grid grid-cols-2 gap-4">
                              <div className={cn("flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all gap-2", metodoPgto === "pix" ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5")}>
                                <RadioGroupItem value="pix" id={`pix-${slot.inicio}`} className="sr-only" />
                                <Label htmlFor={`pix-${slot.inicio}`} className="flex flex-col items-center gap-2 font-black text-[10px] uppercase cursor-pointer">
                                  <CreditCard size={20} className={metodoPgto === "pix" ? "text-[#22c55e]" : "text-gray-600"} /> PIX
                                </Label>
                              </div>
                              <div className={cn("flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all gap-2", metodoPgto === "dinheiro" ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5")}>
                                <RadioGroupItem value="dinheiro" id={`dinheiro-${slot.inicio}`} className="sr-only" />
                                <Label htmlFor={`dinheiro-${slot.inicio}`} className="flex flex-col items-center gap-2 font-black text-[10px] uppercase cursor-pointer">
                                  <Banknote size={20} className={metodoPgto === "dinheiro" ? "text-[#22c55e]" : "text-gray-600"} /> DINHEIRO
                                </Label>
                              </div>
                            </RadioGroup>

                            {/* PIX Section - mostra PixPaymentSection com opções livre/integral */}
                            {metodoPgto === "pix" && reservaCriada && reservaIdAtual && (
                              <PixPaymentSection
                                valorTotal={(() => {
                                  const valorReserva = slot.valor;
                                  const valorBase = tipoReservaAtendente === 'pacote' ? valorReserva * 4 : valorReserva;
                                  return valorBase + totalCarrinho;
                                })()}
                                desconto={tipoReservaAtendente === 'pacote' ? 40 : 10}
                                tipoReserva={tipoReservaAtendente === 'pacote' ? 'pacote' : 'avulsa'}
                                pixChaveEstatica={pixChaveEstatica}
                                pixData={pixData}
                                isCarregando={isCarregandoPix}
                                onGerarPixIntegral={handleGerarPixIntegral}
                                onGerarPixLivre={handleGerarPixLivre}
                                onTimeout={handlePixTimeout}
                                onConfirmarPagamento={handlePixConfirmadoAtendente}
                                timeoutMinutos={8}
                                quantidadeJogos={tipoReservaAtendente === 'pacote' ? 4 : 1}
                              />
                            )}

                            {/* Dinheiro = apenas agendar */}
                            {metodoPgto === "dinheiro" && reservaCriada && (
                              <div className="bg-black/40 p-5 rounded-[2rem] border border-white/5 text-center space-y-2">
                                <p className="text-xs font-black uppercase italic text-[#22c55e]">✅ Reserva Agendada!</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Pagamento será realizado no caixa da arena.</p>
                                <p className="text-lg font-black text-white">Valor: R$ {(() => {
                                  const valorReserva = slot.valor;
                                  const valorBase = tipoReservaAtendente === 'pacote' ? valorReserva * 4 : valorReserva;
                                  return (valorBase + totalCarrinho).toFixed(2);
                                })()}</p>
                                <p className="text-[9px] text-yellow-400 font-bold">⚠️ Fidelidade será contada após pagamento completo.</p>
                              </div>
                            )}

                            {/* Produtos / Consumo */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-gray-400">Consumo (Venda / Aluguel)</label>
                              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                {produtos.filter(p => p.estoque > 0).map(p => {
                                  const precoExibido = p.tipo === 'aluguel' ? (p.preco_aluguel || p.preco) : (p.preco_venda || p.preco);
                                  return (
                                    <button key={p.id} onClick={() => adicionarAoCarrinho({ ...p, preco: precoExibido })}
                                      className="flex flex-col items-start p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#22c55e]/50 text-[9px] font-black uppercase transition-all">
                                      <span className="text-white">{p.nome}</span>
                                      <div className="flex gap-2 mt-0.5">
                                        {p.preco_venda && p.preco_venda > 0 && <span className="text-[#22c55e]">V: R${Number(p.preco_venda).toFixed(0)}</span>}
                                        {p.preco_aluguel && p.preco_aluguel > 0 && <span className="text-purple-400">A: R${Number(p.preco_aluguel).toFixed(0)}</span>}
                                      </div>
                                      <Badge className="text-[6px] mt-1 bg-white/5 border-none">{p.tipo}</Badge>
                                    </button>
                                  );
                                })}
                              </div>
                              {/* Itens no carrinho */}
                              {itensCarrinho.length > 0 && (
                                <div className="space-y-1 mt-2">
                                  <p className="text-[8px] font-black text-gray-500 uppercase">No carrinho:</p>
                                  {itensCarrinho.map((item, idx) => (
                                    <div key={item.idUnico} className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded-lg text-[9px]">
                                      <span className="text-white font-bold">{item.nome}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[#22c55e] font-black">R$ {item.preco.toFixed(2)}</span>
                                        <button onClick={() => removerDoCarrinho(item.idUnico)} className="text-red-400 hover:text-red-300"><Trash2 size={12}/></button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {!reservaCriada && (
                              <Button disabled={loading || isCarregandoPix}
                                className="w-full bg-[#22c55e] hover:bg-[#1ba850] text-black font-black uppercase h-16 rounded-2xl"
                                onClick={() => {
                                  const input = document.getElementById(`atleta-${slot.inicio}`) as HTMLInputElement;
                                  const hora = parseInt(slot.inicio.split(":")[0]);
                                  handleAgendar(slot, input?.value, hora >= 18 ? 2 : 1);
                                }}>
                                {loading ? "Processando..." : "Fazer Reserva"}
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      ) : (
                        /* Slot ocupado - mostrar detalhes com consumo */
                        <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem] max-w-md outline-none">
                          <DialogHeader>
                            <DialogTitle className="italic uppercase flex items-center gap-2 text-lg font-black">
                              📋 Detalhes - {slot.inicio}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-2">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Atleta:</span>
                                <span className="text-white font-black">{slot.detalhes?.clientes?.nome || slot.detalhes?.cliente_nome || "-"}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Tipo:</span>
                                <Badge className={cn("text-[8px] font-black border-none", slot.detalhes?.tipo === 'pacote' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400")}>
                                  {slot.detalhes?.tipo === 'pacote' ? 'PACOTE' : 'AVULSA'}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Valor:</span>
                                <span className="text-[#22c55e] font-black">R$ {Number(slot.detalhes?.valor_total || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Status:</span>
                                <Badge className={cn("text-[8px] font-black border-none", slot.detalhes?.pago ? "bg-[#22c55e]/20 text-[#22c55e]" : "bg-yellow-500/20 text-yellow-400")}>
                                  {slot.detalhes?.pago ? 'PAGO' : 'PENDENTE'}
                                </Badge>
                              </div>
                            </div>
                            {/* Consumo / Produtos */}
                            {itensDoSlot.length > 0 && (
                              <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-xl space-y-2">
                                <p className="text-[10px] font-black uppercase text-orange-400">🛒 Consumo</p>
                                {itensDoSlot.map((it: any) => (
                                  <div key={it.id} className="flex justify-between text-xs">
                                    <span className="text-white">{it.produtos?.nome || `Produto #${it.produto_id}`}</span>
                                    <div className="flex gap-2">
                                      <Badge className="text-[7px] bg-white/5 border-none">{it.tipo}</Badge>
                                      <span className="text-[#22c55e] font-black">R$ {Number(it.subtotal || it.preco_unitario || 0).toFixed(2)}</span>
                                    </div>
                                  </div>
                                ))}
                                <div className="border-t border-orange-500/20 pt-1 flex justify-between text-xs font-black">
                                  <span className="text-orange-400">Total consumo:</span>
                                  <span className="text-orange-300">R$ {itensDoSlot.reduce((a: number, it: any) => a + Number(it.subtotal || it.preco_unitario || 0), 0).toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                            {/* Ações */}
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 border-blue-500/20 text-blue-400 rounded-xl text-[9px]"
                                onClick={() => { setRemarcarReserva(slot.detalhes); setRemarcarData(""); setRemarcarModal(true); }}>
                                <RefreshCcw size={12} className="mr-1" /> Remarcar
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1 border-red-500/20 text-red-400 rounded-xl text-[9px]"
                                onClick={async () => {
                                  if (!confirm("Cancelar esta reserva?")) return;
                                  await supabase.from('reservas').update({ status: 'cancelada' }).eq('id', slot.detalhes.id);
                                  toast({ title: "Reserva cancelada." });
                                  carregarReservasFinancas();
                                }}>
                                <XCircle size={12} className="mr-1" /> Cancelar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* PRODUTOS */}
          <TabsContent value="produtos">
            <Card className="bg-[#0c120f] border-white/5 p-6 rounded-[2.5rem]">
              <h3 className="text-xl font-black italic uppercase flex items-center gap-2 text-white mb-6"><Package className="text-[#22c55e]" /> Produtos / Estoque</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {produtos.map(item => (
                  <div key={item.id} className={cn("p-5 bg-white/5 border rounded-[2rem] flex flex-col justify-between transition-all", item.estoque <= 5 ? "border-red-500/30 bg-red-500/5" : "border-white/10")}>
                    <div>
                      <Badge className={cn("text-[9px] font-black uppercase", item.tipo === 'venda' ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400")}>{item.tipo}</Badge>
                      <p className="font-black italic uppercase text-white text-lg mt-3">{item.nome}</p>
                      <div className="mt-2 space-y-1">
                        {(item.tipo === 'venda' || item.tipo === 'ambos') && item.preco_venda && item.preco_venda > 0 && (
                          <p className="text-[#22c55e] font-black text-sm">Venda: R$ {Number(item.preco_venda).toFixed(2)}</p>
                        )}
                        {(item.tipo === 'aluguel' || item.tipo === 'ambos') && item.preco_aluguel && item.preco_aluguel > 0 && (
                          <p className="text-purple-400 font-black text-sm">Aluguel: R$ {Number(item.preco_aluguel).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-center px-1 mb-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Disponível</span>
                        <span className={cn("text-sm font-black", item.estoque <= 5 ? "text-red-500" : "text-white")}>{item.estoque} UN</span>
                      </div>
                      <Button disabled={item.estoque === 0} className={cn("w-full h-12 rounded-xl font-black uppercase text-xs", item.estoque === 0 ? "bg-white/5 text-gray-600" : "bg-white/10 hover:bg-[#22c55e] hover:text-black")}
                        onClick={() => adicionarAoCarrinho(item)}>
                        {item.estoque === 0 ? "Esgotado" : "Adicionar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* CLIENTES com cores/fidelidade */}
          <TabsContent value="clientes">
            <Card className="bg-[#0c120f] border-white/5 p-8 rounded-[2.5rem]">
              <div className="flex justify-between items-center gap-4 mb-8">
                <h3 className="text-2xl font-black italic uppercase text-white">Gestão de Atletas</h3>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                  <input placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none" onChange={e => setFiltroNome(e.target.value)} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientes.filter(c => c.nome.toLowerCase().includes(filtroNome.toLowerCase())).map((c: any) => {
                  const total = Number(c.reservas_concluidas || 0);
                  const progresso = total % 10;
                  const temPremio = total > 0 && total % 10 === 0;
                  const reservasCliente = listaReservas.filter(r => r.clientes?.nome?.toLowerCase() === c.nome.toLowerCase());
                  const temPendente = reservasCliente.some(r => !r.pago && r.status !== 'cancelada');
                  const temAtrasada = reservasCliente.some(r => !r.pago && r.status !== 'cancelada' && new Date(r.data_reserva + 'T00:00:00') < new Date());
                  const statusColor = temAtrasada ? 'border-red-500/40 bg-red-500/5' : temPendente ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-[#22c55e]/20 bg-[#22c55e]/5';
                  const statusBadge = temAtrasada ? { text: 'EM ATRASO', cls: 'bg-red-500/20 text-red-400' } : temPendente ? { text: 'PENDENTE', cls: 'bg-yellow-500/20 text-yellow-400' } : { text: 'EM DIA', cls: 'bg-[#22c55e]/20 text-[#22c55e]' };
                  return (
                    <div key={c.id} className={cn("p-6 rounded-[2rem] border-2 transition-all", statusColor)}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-3 rounded-full border", temAtrasada ? "bg-red-500/10 border-red-500/20 text-red-400" : temPendente ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" : "bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]")}><Users size={20} /></div>
                          <div>
                            <p className="font-black uppercase italic text-white">{c.nome}</p>
                            <p className="text-[10px] text-gray-500 font-bold">{c.telefone}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {c.isVip && <Badge className="bg-[#22c55e] text-black font-black text-[9px]">VIP</Badge>}
                          <Badge className={cn("text-[8px] font-black border-none", statusBadge.cls)}>{statusBadge.text}</Badge>
                        </div>
                      </div>
                      <div className="mb-4 space-y-2">
                        <div className="flex justify-between items-end">
                          <p className="text-[9px] font-black text-gray-500 uppercase">Fidelidade</p>
                          <p className={`text-xs font-black ${temPremio ? 'text-yellow-500 animate-pulse' : 'text-white'}`}>{temPremio ? '★ 10/10' : `${progresso}/10`}</p>
                        </div>
                        <div className="w-full bg-black/40 h-2 rounded-full border border-white/5 overflow-hidden">
                          <div className={`h-full transition-all ${temPremio ? 'bg-yellow-500' : 'bg-[#22c55e]'}`} style={{ width: `${temPremio ? 100 : progresso * 10}%` }} />
                        </div>
                        {temPremio && <p className="text-[8px] text-yellow-500 font-black uppercase text-center">Próximo jogo é cortesia!</p>}
                      </div>
                      {reservasCliente.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                          <p className="text-[8px] font-black text-gray-600 uppercase">Últimas reservas</p>
                          {reservasCliente.slice(0, 3).map(r => (
                            <div key={r.id} className="flex justify-between items-center text-[9px]">
                              <span className="text-gray-400">{new Date(r.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')} {r.horario_inicio?.slice(0,5)}</span>
                              <Badge className={cn("text-[7px] font-black border-none", r.pago ? "bg-[#22c55e]/20 text-[#22c55e]" : r.status === 'cancelada' ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400")}>
                                {r.pago ? 'PAGO' : (r.status || 'PENDENTE').toUpperCase()}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* VIP/PACOTES */}
          <TabsContent value="vip">
            <Card className="bg-[#0c120f] border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="text-2xl font-black italic uppercase flex items-center gap-3 mb-6"><Crown className="text-[#22c55e]" /> Pacotes com Desconto</h3>
              <div className="space-y-4">
                {mensalistas.map(m => (
                  <div key={m.id} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-6">
                      <div className="text-center bg-black/40 p-3 rounded-2xl min-w-[70px]">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Dia</p>
                        <p className="text-xl font-black text-[#22c55e] italic">{m.dia}</p>
                      </div>
                      <div>
                        <p className="font-black italic uppercase text-lg text-white">{m.nome}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Toda {m.dia} às {m.horario} • {m.metodoPgto}</p>
                        <Badge className={m.status_pagamento === 'em_atraso' ? "bg-red-500/10 text-red-500 mt-1" : "bg-[#22c55e]/10 text-[#22c55e] mt-1"}>
                          {m.status_pagamento === 'em_atraso' ? 'Em Atraso' : 'Em Dia'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Dialog open={editandoVipId === m.id} onOpenChange={(open) => { if (!open) setEditandoVipId(null); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-white/10 text-blue-400 rounded-xl" onClick={() => {
                            setEditandoVipId(m.id!);
                            setEditVipForm({ dia: m.dia, horario: m.horario, metodoPgto: m.metodoPgto });
                          }}><Edit size={14} className="mr-1" /> Editar</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
                          <DialogHeader><DialogTitle className="italic uppercase font-black">Editar Reserva VIP</DialogTitle></DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <label className="text-[10px] font-bold uppercase text-gray-500">Dia Fixo</label>
                              <Select value={editVipForm.dia} onValueChange={v => setEditVipForm(p => ({ ...p, dia: v }))}>
                                <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>{['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div><label className="text-[10px] font-bold uppercase text-gray-500">Horário</label><Input type="time" value={editVipForm.horario} onChange={e => setEditVipForm(p => ({ ...p, horario: e.target.value }))} className="bg-white/5 border-white/10 mt-1" /></div>
                            <div>
                              <label className="text-[10px] font-bold uppercase text-gray-500">Pagamento</label>
                              <Select value={editVipForm.metodoPgto} onValueChange={v => setEditVipForm(p => ({ ...p, metodoPgto: v }))}>
                                <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="PIX">PIX</SelectItem><SelectItem value="Dinheiro">Dinheiro</SelectItem></SelectContent>
                              </Select>
                            </div>
                            <Button className="w-full bg-[#22c55e] text-black font-black" onClick={() => handleEditarVip(m.id!)}>Salvar Alterações</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" className="border-red-500/20 text-red-500 rounded-xl" onClick={() => handleCancelarVip(m.id!)}>
                        <Ban size={14} className="mr-1" /> Cancelar
                      </Button>
                    </div>
                  </div>
                ))}
                {mensalistas.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
                    <p className="text-gray-600 italic font-bold">Nenhum mensalista cadastrado.</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* ALERTAS */}
          <TabsContent value="alertas">
            <Card className="bg-[#0c120f] border-white/5 p-6 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black italic uppercase flex items-center gap-2"><BellRing className="text-yellow-500" /> Alertas</h3>
                <Button onClick={() => { setNovoAlertaForm({ cliente_id: "", tipo: "neutra", observacao: "" }); setModalNovoAlertaAberto(true); }} className="bg-[#22c55e] text-black font-black rounded-xl">+ NOVO ALERTA</Button>
              </div>
              <div className="space-y-3">
                {alertas.map(a => (
                  <div key={a.id} className={cn("p-4 rounded-2xl border flex items-start gap-4",
                    a.tipo === "negativa" ? "bg-red-500/5 border-red-500/20" : a.tipo === "positiva" ? "bg-[#22c55e]/5 border-[#22c55e]/20" : "bg-blue-500/5 border-blue-500/20"
                  )}>
                    <AlertCircle size={20} className={a.tipo === "negativa" ? "text-red-500" : a.tipo === "positiva" ? "text-[#22c55e]" : "text-blue-400"} />
                    <div><p className="font-black uppercase text-sm">{a.cliente}</p><p className="text-sm text-gray-400 italic">"{a.obs}"</p></div>
                  </div>
                ))}
              </div>
              <Dialog open={modalNovoAlertaAberto} onOpenChange={setModalNovoAlertaAberto}>
                <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
                  <DialogHeader><DialogTitle className="italic uppercase font-black">Novo Alerta</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    <Select value={novoAlertaForm.cliente_id} onValueChange={v => setNovoAlertaForm(p => ({ ...p, cliente_id: v }))}>
                      <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                      <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={novoAlertaForm.tipo} onValueChange={v => setNovoAlertaForm(p => ({ ...p, tipo: v as any }))}>
                      <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="positiva">Positiva</SelectItem><SelectItem value="negativa">Negativa</SelectItem><SelectItem value="neutra">Neutra</SelectItem></SelectContent>
                    </Select>
                    <Textarea value={novoAlertaForm.observacao} onChange={e => setNovoAlertaForm(p => ({ ...p, observacao: e.target.value }))} className="bg-white/5 border-white/10 min-h-[80px]" placeholder="Observação..." />
                    <Button className="w-full bg-[#22c55e] text-black font-black" onClick={async () => {
                      if (!novoAlertaForm.cliente_id || !novoAlertaForm.observacao.trim()) return toast({ variant: "destructive", title: "Preencha todos os campos" });
                      const cli = clientes.find(c => c.id === Number(novoAlertaForm.cliente_id));
                      await supabase.from('observacoes_clientes').insert([{
                        cliente_id: Number(novoAlertaForm.cliente_id), cliente_nome: cli?.nome,
                        tipo: novoAlertaForm.tipo, observacao: novoAlertaForm.observacao.trim()
                      }]);
                      toast({ title: "Alerta criado!" });
                      setModalNovoAlertaAberto(false);
                      buscarDadosIniciais();
                    }}>Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          </TabsContent>

          {/* FINANCEIRO - COM 3 FORMAS DE PAGAMENTO */}
          <TabsContent value="financeiro" className="space-y-8">
            <Card className="bg-[#0c120f] border-orange-500/20 rounded-[2.5rem] overflow-hidden">
              <div className="bg-[#facc15] p-4 flex items-center gap-2 text-black font-black uppercase text-sm italic">
                <DollarSign size={18} /> Pagamentos Pendentes
              </div>
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 text-[10px] font-black uppercase text-gray-400">
                    <TableHead>Atleta</TableHead><TableHead>Data/Hora</TableHead><TableHead>Tipo</TableHead>
                    <TableHead>Total</TableHead><TableHead className="text-red-500">Pago / Restante</TableHead><TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {(() => {
                  const pendentes = listaReservas.filter(r => !r.pago && r.status !== 'cancelada');
                  const vistos = new Set<string>();
                  return pendentes.filter(res => {
                    const chave = `${res.clientes?.nome || 'x'}-${res.data_reserva}-${res.horario_inicio}`;
                    if (vistos.has(chave)) return false;
                    vistos.add(chave);
                    return true;
                  }).map(res => {
                    const pago = Number(res.valor_pago_sinal || 0);
                    const restante = Number(res.valor_total) - pago;
                    return (
                      <TableRow key={res.id} className="border-white/5">
                        <TableCell className="font-black italic uppercase text-white">{res.clientes?.nome || res.cliente_nome || "Atleta"}</TableCell>
                        <TableCell className="text-[11px]">{new Date(res.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')} {res.horario_inicio?.slice(0,5)}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-[8px] font-black border-none", res.tipo === 'pacote' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400")}>
                            {res.tipo === 'pacote' ? "PACOTE" : "AVULSA"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-bold">R$ {Number(res.valor_total).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            {pago > 0 && <p className="text-[9px] text-[#22c55e] font-bold">Pago: R$ {pago.toFixed(2)}</p>}
                            <p className="text-sm font-black text-red-500">Falta: R$ {restante.toFixed(2)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog onOpenChange={(open) => { if (!open) { setLiquidarValorCustom(""); setLiquidarMetodo("dinheiro"); limparPixFinanceiro(); } }}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-[#22c55e] text-black font-black text-[9px] uppercase rounded-xl h-8">💰 Pagamento</Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem] max-w-sm outline-none max-h-[90vh] overflow-y-auto">
                              <DialogHeader><DialogTitle className="italic uppercase font-black flex items-center gap-2"><DollarSign className="text-[#22c55e]" size={18} /> Receber Pagamento</DialogTitle></DialogHeader>
                              <div className="space-y-4 pt-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                  <p className="text-[10px] text-gray-500 uppercase font-bold">Atleta: {res.clientes?.nome || res.cliente_nome}</p>
                                  <p className="text-2xl font-black text-red-500">Restante: R$ {restante.toFixed(2)}</p>
                                </div>

                                {/* Input para valor customizado */}
                                <div>
                                  <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">Valor a receber (R$)</label>
                                  <Input
                                    type="number" min="0.01" max={restante} step="0.01"
                                    placeholder={restante.toFixed(2)}
                                    value={liquidarValorCustom}
                                    onChange={(e) => setLiquidarValorCustom(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white h-14 rounded-xl text-lg font-black text-center"
                                  />
                                  {liquidarValorCustom && parseFloat(liquidarValorCustom) > 0 && parseFloat(liquidarValorCustom) < restante && (
                                    <p className="text-[9px] text-yellow-400 font-bold mt-1">⚠️ Pagamento parcial. Restará: R$ {(restante - parseFloat(liquidarValorCustom)).toFixed(2)}</p>
                                  )}
                                </div>

                                {/* 3 Formas de pagamento */}
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-gray-500">Forma de Pagamento</label>
                                  <div className="grid grid-cols-3 gap-2">
                                    {[
                                      { value: "pix", icon: <CreditCard size={16} />, label: "PIX" },
                                      { value: "dinheiro", icon: <Banknote size={16} />, label: "DINHEIRO" },
                                      { value: "metade", icon: <><CreditCard size={12} /><Banknote size={12} /></>, label: "METADE" },
                                    ].map(opt => (
                                      <button key={opt.value} type="button"
                                        onClick={() => setLiquidarMetodo(opt.value as any)}
                                        className={cn("flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1",
                                          liquidarMetodo === opt.value ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5 hover:border-white/20"
                                        )}>
                                        <div className={cn("flex gap-1", liquidarMetodo === opt.value ? "text-[#22c55e]" : "text-gray-600")}>{opt.icon}</div>
                                        <span className="text-[8px] font-black uppercase">{opt.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* PIX QR Code */}
                                {liquidarMetodo === "pix" && (
                                  <div className="space-y-3">
                                    {!pixDataFinanceiro && (
                                      <Button disabled={isCarregandoPixFinanceiro} onClick={() => {
                                        const val = liquidarValorCustom ? parseFloat(liquidarValorCustom) : restante;
                                        if (val <= 0) return;
                                        handleGerarPixFinanceiro(res.id, val);
                                      }} className="w-full bg-[#22c55e] text-black font-black uppercase h-12 rounded-xl">
                                        {isCarregandoPixFinanceiro ? "Gerando PIX..." : `Gerar PIX — R$ ${(liquidarValorCustom ? parseFloat(liquidarValorCustom) : restante).toFixed(2)}`}
                                      </Button>
                                    )}
                                    {pixDataFinanceiro && (
                                      <div className="bg-black/60 rounded-2xl border border-[#22c55e]/20 p-4 flex flex-col items-center gap-3">
                                        <p className="text-xs font-black uppercase text-[#22c55e]">PIX — R$ {pixDataFinanceiro.valorPago.toFixed(2)}</p>
                                        {pixDataFinanceiro.qrCodeBase64 && (
                                          <img src={`data:image/png;base64,${pixDataFinanceiro.qrCodeBase64}`} alt="QR Code" className="w-40 h-40 rounded-xl bg-white p-2" />
                                        )}
                                        {pixDataFinanceiro.copiaECola && (
                                          <div className="w-full">
                                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Copia e Cola:</p>
                                            <div className="flex gap-2">
                                              <input readOnly value={pixDataFinanceiro.copiaECola} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[9px] text-white truncate" />
                                              <Button size="sm" variant="outline" className="border-[#22c55e] text-[#22c55e] shrink-0" onClick={() => {
                                                navigator.clipboard.writeText(pixDataFinanceiro.copiaECola);
                                                toast({ title: "✅ Copiado!" });
                                              }}><Copy size={12} /></Button>
                                            </div>
                                          </div>
                                        )}
                                        <p className="text-[9px] text-yellow-400 font-bold animate-pulse">⏳ Aguardando pagamento do cliente...</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Metade PIX + Metade Dinheiro */}
                                {liquidarMetodo === "metade" && (
                                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                                    <p className="text-[10px] font-black uppercase text-gray-400">Metade PIX + Metade Dinheiro</p>
                                    {(() => {
                                      const val = liquidarValorCustom ? parseFloat(liquidarValorCustom) : restante;
                                      const metade = val / 2;
                                      return (
                                        <>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">PIX:</span>
                                            <span className="text-[#22c55e] font-black">R$ {metade.toFixed(2)}</span>
                                          </div>
                                          <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">Dinheiro:</span>
                                            <span className="text-yellow-400 font-black">R$ {metade.toFixed(2)}</span>
                                          </div>
                                        </>
                                      );
                                    })()}
                                    {!pixDataFinanceiro && (
                                      <Button disabled={isCarregandoPixFinanceiro} onClick={() => {
                                        const val = liquidarValorCustom ? parseFloat(liquidarValorCustom) : restante;
                                        handleGerarPixFinanceiro(res.id, val / 2);
                                      }} className="w-full bg-[#22c55e] text-black font-black uppercase h-10 rounded-xl text-xs">
                                        {isCarregandoPixFinanceiro ? "Gerando..." : "Gerar PIX da Metade"}
                                      </Button>
                                    )}
                                    {pixDataFinanceiro && (
                                      <div className="bg-black/60 rounded-xl border border-[#22c55e]/20 p-3 flex flex-col items-center gap-2">
                                        <p className="text-[10px] font-black text-[#22c55e]">PIX Metade — R$ {pixDataFinanceiro.valorPago.toFixed(2)}</p>
                                        {pixDataFinanceiro.qrCodeBase64 && (
                                          <img src={`data:image/png;base64,${pixDataFinanceiro.qrCodeBase64}`} alt="QR Code" className="w-32 h-32 rounded-lg bg-white p-1" />
                                        )}
                                        {pixDataFinanceiro.copiaECola && (
                                          <div className="w-full flex gap-1">
                                            <input readOnly value={pixDataFinanceiro.copiaECola} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[8px] text-white truncate" />
                                            <Button size="sm" variant="outline" className="border-[#22c55e] text-[#22c55e] h-7 px-2" onClick={() => {
                                              navigator.clipboard.writeText(pixDataFinanceiro.copiaECola);
                                              toast({ title: "✅ Copiado!" });
                                            }}><Copy size={10} /></Button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Botão Dar Baixa */}
                                <Button onClick={() => {
                                  const val = liquidarValorCustom ? parseFloat(liquidarValorCustom) : restante;
                                  if (val <= 0) return toast({ variant: "destructive", title: "Valor inválido" });
                                  const metodo = liquidarMetodo === "metade" ? "pix+dinheiro" : liquidarMetodo;
                                  handleLiquidarReserva(res.id, val, metodo);
                                }} className="w-full bg-yellow-500 text-black font-black uppercase rounded-xl h-12 flex items-center gap-2">
                                  <CheckCircle2 size={16} /> Dar Baixa — R$ {(liquidarValorCustom ? parseFloat(liquidarValorCustom) : restante).toFixed(2)}
                                </Button>

                                <Button variant="outline" className="w-full border-red-500/20 text-red-400 rounded-xl text-[9px] h-8"
                                  onClick={async () => {
                                    if (!confirm("Cancelar esta reserva?")) return;
                                    await supabase.from('reservas').update({ status: 'cancelada' }).eq('id', res.id);
                                    toast({ title: "Reserva cancelada." });
                                    carregarReservasFinancas();
                                  }}>Cancelar Reserva</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  });
                })()}
                </TableBody>
              </Table>
            </Card>

            <Card className="bg-[#0c120f] border-[#22c55e]/20 rounded-[2.5rem] overflow-hidden">
              <div className="bg-[#22c55e] p-4 text-black font-black uppercase text-sm italic flex items-center justify-between">
                <span>Reservas Concluídas / Pagas</span>
                <Badge className="bg-black/20 text-white font-black">{listaReservas.filter(r => r.pago).length}</Badge>
              </div>
              <Table>
                <TableBody>
                  {(() => {
                    const pagas = listaReservas.filter(r => r.pago);
                    const vistos = new Set<string>();
                    return pagas.filter(res => {
                      const chave = `${res.clientes?.nome || 'x'}-${res.data_reserva}-${res.horario_inicio}`;
                      if (vistos.has(chave)) return false;
                      vistos.add(chave);
                      return true;
                    }).slice(0, 20).map(res => (
                      <TableRow key={res.id} className="border-white/5 opacity-70">
                        <TableCell className="font-black italic uppercase text-white">{res.clientes?.nome || "Atleta"}</TableCell>
                        <TableCell className="text-gray-500 text-xs">{new Date(res.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')} | {res.horario_inicio?.slice(0,5)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <span className="font-black text-[#22c55e]">R$ {Number(res.valor_total).toFixed(2)}</span>
                            <Badge className={cn("text-[8px] font-black border-none",
                              res.forma_pagamento === 'pix' ? "bg-blue-500/20 text-blue-400" :
                              res.forma_pagamento === 'dinheiro' ? "bg-yellow-500/20 text-yellow-400" :
                              res.forma_pagamento === 'pix+dinheiro' ? "bg-purple-500/20 text-purple-400" :
                              "bg-white/10 text-gray-400"
                            )}>{res.forma_pagamento === 'pix+dinheiro' ? 'PIX+DIN' : (res.forma_pagamento || '—').toUpperCase()}</Badge>
                            <Badge className={cn("text-[8px] font-black border-none", res.tipo === 'pacote' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400")}>
                              {res.tipo === 'pacote' ? 'PACOTE' : 'AVULSA'}
                            </Badge>
                            <Button variant="ghost" size="sm" className="text-purple-400 hover:bg-purple-500/10 rounded-xl text-[9px]"
                              onClick={() => handleDevolverEstoque(res.id)} title="Devolver itens alugados">
                              <RefreshCcw size={12} className="mr-1" /> Devolver
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL TERMOS PÓS-PAGAMENTO */}
      <Dialog open={isTermosAberto} onOpenChange={(open) => { if (!open && aceitouTermos) setIsTermosAberto(false); }}>
        <DialogContent className="bg-[#0c120f] border-white/10 text-white max-w-[480px] rounded-[2rem] p-8 outline-none">
          <DialogHeader><DialogTitle className="text-lg font-black italic uppercase text-[#22c55e] flex items-center gap-2"><CheckCircle2 size={20} /> Reserva Confirmada</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-white leading-relaxed uppercase">
                RESERVA CONFIRMADA. CANCELAMENTO ATÉ 24H ANTES: COMUNICAR VIA WHATSAPP (98 99991-0535). REMARCAÇÃO MÁXIMO SEMANA SEGUINTE, MESMO TURNO. APÓS 24H NÃO HAVERÁ RESSARCIMENTO.
              </p>
            </div>
            <a href="/regras-arena.pdf" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-[#22c55e] text-xs font-black uppercase underline">📄 Regras da Arena</a>
            <label className="flex items-start gap-3 cursor-pointer bg-white/5 p-3 rounded-2xl border border-white/10">
              <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)} className="mt-1 accent-[#22c55e] w-5 h-5" />
              <span className="text-[10px] font-bold text-gray-300 uppercase">Concordo com os termos e regras da Arena Cedro.</span>
            </label>
            <Button disabled={!aceitouTermos} onClick={() => { setIsTermosAberto(false); setReservaCriada(false); toast({ title: "✅ Reserva finalizada!" }); }} className="w-full bg-[#22c55e] text-black font-black uppercase h-12 rounded-xl disabled:opacity-30">Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL REMARCAÇÃO */}
      <Dialog open={remarcarModal} onOpenChange={setRemarcarModal}>
        <DialogContent className="bg-[#0c120f] border-white/10 text-white max-w-[400px] rounded-[2rem] p-8 outline-none">
          <DialogHeader><DialogTitle className="text-lg font-black italic uppercase text-[#22c55e] flex items-center gap-2"><RefreshCcw size={18} /> Remarcar Reserva</DialogTitle></DialogHeader>
          {remarcarReserva && (
            <div className="space-y-4 pt-2">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Atual</p>
                <p className="font-black text-white text-sm">{new Date(remarcarReserva.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')} — {remarcarReserva.horario_inicio?.slice(0,5)}</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl">
                <p className="text-[9px] text-yellow-300 font-bold">⚠️ Mesmo horário, mesmo turno. Máximo: semana seguinte.</p>
              </div>
              <div><Label className="text-[10px] uppercase text-gray-500 font-bold">Nova Data</Label><Input type="date" value={remarcarData} onChange={e => setRemarcarData(e.target.value)} className="bg-white/5 border-white/10 mt-1 text-white" /></div>
              <Button disabled={!remarcarData} onClick={handleRemarcarAtendente} className="w-full bg-[#22c55e] text-black font-black uppercase h-12 rounded-xl">Remarcar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AtendenteDashboard;
