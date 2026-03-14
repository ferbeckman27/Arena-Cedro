import { useState, useEffect, useMemo } from "react";
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
  Package, AlertCircle, BellRing, Trash2, Clock, Copy, Lock, Edit, Ban, RefreshCcw, CheckCircle2
} from "lucide-react";
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
  const [metodoPgto, setMetodoPgto] = useState<string>("dinheiro");
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
  // Remarcação
  const [remarcarModal, setRemarcarModal] = useState(false);
  const [remarcarReserva, setRemarcarReserva] = useState<any>(null);
  const [remarcarData, setRemarcarData] = useState("");

  // VIP edit states
  const [editandoVipId, setEditandoVipId] = useState<number | null>(null);
  const [editVipForm, setEditVipForm] = useState({ dia: "", horario: "", metodoPgto: "" });

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
    forma_pagamento: string; pago: boolean; status?: string;
    clientes: { nome: string } | null;
  }
  interface SlotAgenda { inicio: string; fim: string; turno: string; valor: number; status: string; }

  const [mensalistas, setMensalistas] = useState<Mensalista[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [listaReservas, setListaReservas] = useState<ReservaCompleta[]>([]);
  const [itensCarrinho, setItensCarrinho] = useState<any[]>([]);

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

    buscarMensalistas();
    carregarReservasFinancas();
  };

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

  // Comissão
  useEffect(() => {
    const buscarComissao = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('reservas').select('comissao_valor').eq('atendente_id', user.id);
        const total = data?.reduce((acc, curr) => acc + (Number(curr.comissao_valor) || 0), 0) || 0;
        setTotalComissao(total);
      }
    };
    buscarComissao();
  }, []);

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
    const periodos = [{ inicio: 9, fim: 17.5 }, { inicio: 18, fim: 22 }];
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
      const reservaEncontrada = listaReservas?.find(r => r.horario_inicio === slot.inicio && r.data_reserva === dataFormatada);
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

  async function handleAgendar(slot: any, clienteNome: string, turno_id: number) {
    if (!clienteNome) return toast({ variant: "destructive", title: "Nome obrigatório" });
    const duracaoMin = parseInt(duracao, 10);
    setLoading(true);
    try {
      const horaH = parseInt(slot.inicio || slot, 10);
      const valorBase = horaH >= 18 ? 140 : 100;
      const valorReserva = (valorBase * duracaoMin) / 60;
      const totalProdutos = itensCarrinho.reduce((acc: number, item: any) => acc + item.preco, 0);
      const totalGeral = valorReserva + totalProdutos;

      const { data: { user } } = await supabase.auth.getUser();
      const slotInicio = typeof slot === 'string' ? slot : slot.inicio;
      const slotFim = typeof slot === 'string' ? '' : slot.fim;

      const { data: reserva, error: resError } = await supabase.from('reservas').insert([{
        cliente_nome: clienteNome, data_reserva: diaSelecionado.toLocaleDateString('sv-SE'),
        horario_inicio: slotInicio, horario_fim: slotFim, duracao: duracaoMin,
        valor_total: totalGeral, forma_pagamento: metodoPgto,
        funcionario_id: user?.id, atendente_id: user?.id,
        pago: metodoPgto === 'dinheiro', status: metodoPgto === 'pix' ? 'pendente' : 'confirmada',
        turno_id
      }]).select().single();

      if (resError) throw resError;

      const clienteEncontrado = clientes.find(c => c.nome.toLowerCase() === clienteNome.toLowerCase());
      if (clienteEncontrado) {
        await supabase.rpc('incrementar_fidelidade', { cli_id: clienteEncontrado.id });
      }

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
      await gerarPagamentoPix(valorOriginal, `Reserva Arena Cedro (PIX Livre)`, reservaIdAtual, undefined, undefined, 'livre', 0);
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

  const handlePixConfirmadoAtendente = () => {
    toast({ title: "Pagamento confirmado!" });
    setIsTermosAberto(true);
    setAceitouTermos(false);
    carregarReservasFinancas();
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

  const handleLiquidarReserva = async (id: number, total: number, metodo: string) => {
    try {
      const { error } = await supabase.from('reservas').update({
        pago: true, valor_pago_sinal: total, data_pagamento: new Date().toISOString(),
        forma_pagamento: metodo, status: 'confirmada'
      }).eq('id', id);
      if (error) throw error;
      toast({ title: "Pagamento Confirmado" });
      carregarReservasFinancas();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message });
    }
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
              <span className="text-xl font-black italic uppercase text-white">Bem Vindo, {localStorage.getItem("userName") || "Atendente"}</span>
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
            <TabsTrigger value="vip" className="px-6 font-bold uppercase italic">VIPs/Fixos</TabsTrigger>
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
                              tipoReserva === 'fixa' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                            )}>{tipoReserva === 'fixa' ? 'FIXA/VIP' : 'AVULSA'}</Badge>
                          )}
                          {isLivre && <span className="text-[8px] font-bold text-gray-600 italic">R$ {slot.valor.toFixed(2)}</span>}
                        </button>
                      </DialogTrigger>
                      {isLivre && (
                        <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem] max-w-md outline-none">
                          <DialogHeader>
                            <DialogTitle className="italic uppercase flex items-center gap-2 text-xl font-black">
                              <Plus className="text-[#22c55e]" size={20} /> NOVO JOGO - {slot.inicio}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <Input placeholder="Nome do Atleta" className="bg-white/5 border-white/10 h-14 rounded-xl text-white" id={`atleta-${slot.inicio}`} />
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] font-bold uppercase text-gray-400">Pagamento</label>
                                <select value={metodoPgto} onChange={e => setMetodoPgto(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none">
                                  <option value="dinheiro" className="bg-[#0c120f]">Dinheiro</option>
                                  <option value="pix" className="bg-[#0c120f]">PIX</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold uppercase text-gray-400">Duração</label>
                                <div className="h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-sm font-black text-[#22c55e]">{duracao} MIN</div>
                              </div>
                            </div>

                            {/* PIX Section - shows after reservation is created */}
                            {metodoPgto === "pix" && reservaCriada && reservaIdAtual && (
                              <PixPaymentSection
                                valorTotal={slot.valor + totalCarrinho}
                                desconto={10}
                                tipoReserva="avulsa"
                                pixChaveEstatica={pixChaveEstatica}
                                pixData={pixData}
                                isCarregando={isCarregandoPix}
                                onGerarPixIntegral={handleGerarPixIntegral}
                                onTimeout={handlePixTimeout}
                                onConfirmarPagamento={handlePixConfirmadoAtendente}
                                timeoutMinutos={8}
                              />
                            )}

                            {/* Produtos */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-gray-400">Consumo</label>
                              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                {produtos.filter(p => p.estoque > 0).map(p => (
                                  <button key={p.id} onClick={() => adicionarAoCarrinho(p)}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#22c55e]/50 text-[9px] font-black uppercase transition-all">
                                    <span>{p.nome}</span>
                                    <span className="text-[#22c55e]">R$ {p.preco.toFixed(2)}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <Button disabled={loading || isCarregandoPix}
                              className="w-full bg-[#22c55e] hover:bg-[#1ba850] text-black font-black uppercase h-16 rounded-2xl"
                              onClick={() => {
                                const input = document.getElementById(`atleta-${slot.inicio}`) as HTMLInputElement;
                                const hora = parseInt(slot.inicio.split(":")[0]);
                                handleAgendar(slot, input?.value, hora >= 18 ? 2 : 1);
                              }}>
                              {loading ? "Processando..." : "Fazer Reserva"}
                            </Button>
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

          {/* CLIENTES com fidelidade */}
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
                  return (
                    <div key={c.id} className="p-6 rounded-[2rem] border bg-white/5 border-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-full bg-white/5 border border-white/10 text-[#22c55e]"><Users size={20} /></div>
                          <div>
                            <p className="font-black uppercase italic text-white">{c.nome}</p>
                            <p className="text-[10px] text-gray-500 font-bold">{c.telefone}</p>
                          </div>
                        </div>
                        {c.isVip && <Badge className="bg-[#22c55e] text-black font-black text-[9px]">VIP</Badge>}
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
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* VIP - Editar / Cancelar */}
          <TabsContent value="vip">
            <Card className="bg-[#0c120f] border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="text-2xl font-black italic uppercase flex items-center gap-3 mb-6"><Crown className="text-[#22c55e]" /> Horários Fixos (Mensalistas)</h3>
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

          {/* FINANCEIRO - DADOS REAIS */}
          <TabsContent value="financeiro" className="space-y-8">
            <Card className="bg-[#0c120f] border-orange-500/20 rounded-[2.5rem] overflow-hidden">
              <div className="bg-[#facc15] p-4 flex items-center gap-2 text-black font-black uppercase text-sm italic">
                <DollarSign size={18} /> Pagamentos Pendentes
              </div>
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 text-[10px] font-black uppercase text-gray-400">
                    <TableHead>Atleta</TableHead><TableHead>Data/Hora</TableHead><TableHead>Tipo</TableHead>
                    <TableHead>Total</TableHead><TableHead className="text-red-500">Restante</TableHead><TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {listaReservas.filter(r => !r.pago && r.status !== 'cancelada').map(res => {
                    const restante = Number(res.valor_total) - Number(res.valor_pago_sinal || 0);
                    return (
                      <TableRow key={res.id} className="border-white/5">
                        <TableCell className="font-black italic uppercase text-white">{res.clientes?.nome || "Atleta"}</TableCell>
                        <TableCell className="text-[11px]">{new Date(res.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')} {res.horario_inicio?.slice(0,5)}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-[8px] font-black border-none", res.reserva_fixa_id ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400")}>
                            {res.reserva_fixa_id ? "FIXA" : "AVULSA"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-bold">R$ {Number(res.valor_total).toFixed(2)}</TableCell>
                        <TableCell className="text-sm font-black text-red-500">R$ {restante.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <select defaultValue="dinheiro" id={`pgto-${res.id}`} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white">
                              <option value="dinheiro">Dinheiro</option>
                              <option value="pix">PIX</option>
                              <option value="metade">Metade/Metade</option>
                            </select>
                            <Button size="sm" onClick={() => {
                              const sel = (document.getElementById(`pgto-${res.id}`) as HTMLSelectElement)?.value || 'dinheiro';
                              handleLiquidarReserva(res.id, Number(res.valor_total), sel);
                            }} className="bg-[#22c55e] text-black font-black text-[9px] uppercase rounded-xl h-8">Dar Baixa</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                  {listaReservas.filter(r => r.pago).slice(0, 20).map(res => (
                    <TableRow key={res.id} className="border-white/5 opacity-60">
                      <TableCell className="font-black italic uppercase text-white">{res.clientes?.nome || "Atleta"}</TableCell>
                      <TableCell className="text-gray-500 text-xs">{new Date(res.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')} | {res.horario_inicio?.slice(0,5)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-black text-[#22c55e]">R$ {Number(res.valor_total).toFixed(2)}</span>
                          <Badge className="text-[8px] bg-white/5">{res.forma_pagamento}</Badge>
                          {/* Botão devolver estoque aluguel */}
                          <Button variant="ghost" size="sm" className="text-purple-400 hover:bg-purple-500/10 rounded-xl text-[9px]"
                            onClick={() => handleDevolverEstoque(res.id)} title="Devolver itens alugados">
                            <RefreshCcw size={12} className="mr-1" /> Devolver
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
