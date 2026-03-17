import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Clock, ChevronLeft, ChevronRight, ShoppingCart, LogOut, Star, Package,
  AlertTriangle, CreditCard, User, CalendarCheck, History, RefreshCcw,
  Banknote, Crown, CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { usePixPayment, calcularPrecoReserva } from '@/hooks/usePixPayment';
import { FidelityCard } from "@/components/dashboard/FidelityCard";
import { PixPaymentSection } from "@/components/booking/PixPaymentSection";

// --- TIPOS ---
interface Product {
  id: number; nome: string; preco_venda: number; preco_aluguel: number;
  tipo: 'venda' | 'aluguel' | 'ambos'; preco: number;
}
interface SlotHorario { inicio: string; fim: string; valor: number; }
interface Reserva {
  horario_inicio: string; data_reserva: string; id?: number; cliente_nome?: string;
  status?: string; valor_total?: number; duracao?: number; forma_pagamento?: string;
  tipo?: string; pago?: boolean;
}

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cart, setCart] = useState<any[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [emManutencao, setEmManutencao] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date());
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState<"pix" | "dinheiro">("pix");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [progressoFidelidade, setProgressoFidelidade] = useState(0);
  const [tipoReserva, setTipoReserva] = useState<'avulsa' | 'pacote'>('avulsa');
  const [isConfirmacaoAberta, setIsConfirmacaoAberta] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [review, setReview] = useState({ nome: "", estrelas: 5, texto: "" });
  const [listaReservas, setListaReservas] = useState<Reserva[]>([]);
  const [historicoReservas, setHistoricoReservas] = useState<Reserva[]>([]);
  const [reservasFixas, setReservasFixas] = useState<any[]>([]);
  const [pixChaveEstatica, setPixChaveEstatica] = useState("");
  const [reservaIdAtual, setReservaIdAtual] = useState<number | null>(null);
  const [reservaCriada, setReservaCriada] = useState(false);

  // Remarcação
  const [remarcarModal, setRemarcarModal] = useState(false);
  const [remarcarReserva, setRemarcarReserva] = useState<Reserva | null>(null);
  const [remarcarData, setRemarcarData] = useState("");

  const { isCarregandoPix, pixData, gerarPagamentoPix, limparPix } = usePixPayment();

  const getAuth = (key: string) => sessionStorage.getItem(key) || localStorage.getItem(key);
  const [userData] = useState({
    id: getAuth("userId") || "",
    nome: getAuth("userName") || "Jogador",
    email: getAuth("userEmail") || "",
    isVip: getAuth("userRole") === "vip"
  });

  // --- CARREGAMENTO ---
  useEffect(() => {
    const inicializarDados = async () => {
      const { data: config } = await supabase.from('configuracoes').select('valor').eq('chave', 'manutencao').single();
      if (config) setEmManutencao(config.valor === 'true');

      const { data: pixKey } = await supabase.from('configuracoes').select('valor').eq('chave', 'pix_chave').single();
      if (pixKey?.valor) setPixChaveEstatica(pixKey.valor);

      const { data: prod } = await supabase.from('produtos').select('*').eq('ativo', true);
      if (prod) setProdutos(prod.map(p => ({
        id: p.id, nome: p.nome, tipo: (p.tipo || 'venda') as any,
        preco_venda: p.preco_venda || 0, preco_aluguel: p.preco_aluguel || 0,
        preco: p.preco_venda || p.preco_aluguel || 0,
      })));

      if (userData.id) {
        const { data: user } = await supabase.from('clientes').select('reservas_concluidas').eq('id', Number(userData.id)).single();
        if (user) setProgressoFidelidade(user.reservas_concluidas || 0);

        const { data: historico } = await supabase.from('reservas').select('*').eq('cliente_id', Number(userData.id)).order('data_reserva', { ascending: false }).limit(20);
        if (historico) setHistoricoReservas(historico);

        const { data: fixas } = await supabase.from('reservas_fixas').select('*').eq('cliente_id', Number(userData.id)).eq('ativo', true);
        if (fixas) setReservasFixas(fixas.map(f => ({
          dia_semana: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][f.dia_semana_id ? f.dia_semana_id - 1 : 0],
          horario: f.horario_inicio,
        })));
      }
    };
    inicializarDados();
  }, [userData.id]);

  useEffect(() => {
    const carregarReservasOcupadas = async () => {
      const { data } = await supabase.from('reservas').select('horario_inicio, data_reserva, status, cliente_nome, id').eq('data_reserva', diaSelecionado.toLocaleDateString('sv-SE'));
      if (data) setListaReservas(data as Reserva[]);
    };
    carregarReservasOcupadas();
  }, [diaSelecionado]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: config } = await supabase.from('configuracoes').select('valor').eq('chave', 'manutencao').single();
      if (config) setEmManutencao(config.valor === 'true');
      await supabase.rpc('cancelar_reservas_pix_expiradas');
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- CÁLCULOS ---
  const valorApenasReserva = useMemo(() => {
    if (!horarioSelecionado) return 0;
    return calcularPrecoReserva(selectedDuration, parseInt(horarioSelecionado.split(":")[0]));
  }, [horarioSelecionado, selectedDuration]);

  const totalGeral = useMemo(() => {
    const produtosTotal = cart.reduce((acc, item) => acc + (item.preco || 0), 0);
    if (tipoReserva === 'pacote') {
      return valorApenasReserva * quantidadeJogosPacote + produtosTotal;
    }
    return produtosTotal + valorApenasReserva;
  }, [cart, valorApenasReserva, tipoReserva]);

  const descontoAtual = tipoReserva === 'pacote' ? 40 : 10;
  const quantidadeJogosPacote = 4;

  // --- FUNÇÕES ---
  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    toast({ title: "Adicionado!", description: `${product.nome} no carrinho.` });
  };
  const removeFromCart = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };
  const handleLogout = () => {
    localStorage.clear(); sessionStorage.clear(); navigate("/login");
  };

  const handleSubmitReview = async () => {
    if (!review.texto) return toast({ variant: "destructive", title: "Escreva algo!" });
    const { error } = await supabase.from('depoimentos').insert([{
      cliente_id: Number(userData.id), comentario: review.texto, estrelas: review.estrelas, nome: review.nome
    }]);
    if (!error) {
      toast({ title: "Obrigado!", description: "Sua avaliação foi enviada para moderação." });
      setReview({ nome: "", estrelas: 5, texto: "" });
    }
  };

  const gerarHorarios = (duracaoMinutos: number): SlotHorario[] => {
    const slots: SlotHorario[] = [];
    const periodos = [{ inicio: 9, fim: 17.5 }, { inicio: 18, fim: 22 }];
    for (const periodo of periodos) {
      let atual = periodo.inicio;
      while (atual + duracaoMinutos / 60 <= periodo.fim) {
        const horas = Math.floor(atual);
        const minutos = (atual % 1) * 60;
        const inicioFormatado = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
        const totalMinutosFim = horas * 60 + minutos + duracaoMinutos;
        const fimFormatado = `${String(Math.floor(totalMinutosFim / 60)).padStart(2, '0')}:${String(totalMinutosFim % 60).padStart(2, '0')}`;
        slots.push({ inicio: inicioFormatado, fim: fimFormatado, valor: calcularPrecoReserva(duracaoMinutos, horas) });
        atual += 0.5;
      }
    }
    return slots;
  };

  const criarReserva = async (): Promise<number | null> => {
    if (!horarioSelecionado) return null;
    const mapaBlocos: Record<number, number> = { 30: 1, 60: 2, 90: 3 };
    const hora = parseInt(horarioSelecionado.split(":")[0]);
    const turno_id = hora >= 18 ? 2 : 1;

    try {
      let reservaId = null;

      if (tipoReserva === 'pacote') {
        // Pacote: 4 jogos com desconto
        const valorPacote = valorApenasReserva * quantidadeJogosPacote;
        const { data: avulsa, error } = await supabase.from('reservas').insert([{
          cliente_id: Number(userData.id), cliente_nome: userData.nome,
          data_reserva: diaSelecionado.toISOString().split('T')[0],
          horario_inicio: horarioSelecionado, bloco_id: mapaBlocos[selectedDuration],
          turno_id, tipo: 'pacote',
          status: metodoPagamento === 'pix' ? 'pendente' : 'confirmada',
          valor_total: valorPacote, valor_sinal: 0, valor_restante: valorPacote,
          forma_pagamento: metodoPagamento,
          observacoes: `Pacote ${quantidadeJogosPacote} jogos`
        }]).select().single();
        if (error) throw error;
        reservaId = avulsa?.id;
      } else {
        const { data: avulsa, error } = await supabase.from('reservas').insert([{
          cliente_id: Number(userData.id), cliente_nome: userData.nome,
          data_reserva: diaSelecionado.toISOString().split('T')[0],
          horario_inicio: horarioSelecionado, bloco_id: mapaBlocos[selectedDuration],
          turno_id, tipo: 'avulsa',
          status: metodoPagamento === 'pix' ? 'pendente' : 'confirmada',
          valor_total: totalGeral, valor_sinal: 0, valor_restante: totalGeral,
          forma_pagamento: metodoPagamento
        }]).select().single();
        if (error) throw error;
        reservaId = avulsa?.id;
      }

      if (cart.length > 0 && reservaId) {
        await supabase.from('itens_reserva').insert(
          cart.map(item => ({
            reserva_id: reservaId, produto_id: item.id, quantidade: 1,
            preco_unitario: item.preco, subtotal: item.preco,
            tipo: item.tipo === 'aluguel' ? 'aluguel' : 'venda'
          }))
        );
      }

      // Fidelidade só será incrementada após confirmação de pagamento

      setReservaIdAtual(reservaId);
      setReservaCriada(true);
      setCart([]);
      return reservaId;
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({ variant: "destructive", title: "Erro", description: error.message || "Verifique sua conexão." });
      return null;
    }
  };

  const handleFinalizeDinheiro = async () => {
    const id = await criarReserva();
    if (id) {
      // Incrementar fidelidade ao confirmar pagamento presencial
      if (userData.id) {
        await supabase.rpc('incrementar_fidelidade', { cli_id: Number(userData.id) });
        setProgressoFidelidade(prev => prev + 1);
      }
      setIsCheckoutOpen(false);
      setIsConfirmacaoAberta(true);
      setAceitouTermos(false);
    }
  };

  const handleGerarPixIntegral = async (valorOriginal: number, descontoValor: number) => {
    let resId = reservaIdAtual;
    if (!reservaCriada) {
      resId = await criarReserva();
    }
    if (resId) {
      await gerarPagamentoPix(
        valorOriginal,
        `Reserva Arena Cedro - ${horarioSelecionado} (desconto R$${descontoValor})`,
        resId, Number(userData.id), userData.email, 'integral', descontoValor
      );
    }
  };

  const handleGerarPixLivre = async (valorDigitado: number) => {
    let resId = reservaIdAtual;
    if (!reservaCriada) {
      resId = await criarReserva();
    }
    if (resId) {
      // Update reserva with the advance amount
      await supabase.from('reservas').update({
        valor_sinal: valorDigitado,
        valor_restante: totalGeral - valorDigitado,
      }).eq('id', resId);
      await gerarPagamentoPix(
        valorDigitado,
        `Reserva Arena Cedro - ${horarioSelecionado} (Adiantamento)`,
        resId, Number(userData.id), userData.email, 'adiantamento', 0
      );
    }
  };

  const handlePixTimeout = async () => {
    if (reservaIdAtual) {
      await supabase.from('reservas').update({ status: 'cancelada' }).eq('id', reservaIdAtual);
      setReservaIdAtual(null);
      setReservaCriada(false);
      limparPix();
      const { data } = await supabase.from('reservas').select('horario_inicio, data_reserva, status, cliente_nome, id').eq('data_reserva', diaSelecionado.toLocaleDateString('sv-SE'));
      if (data) setListaReservas(data as Reserva[]);
    }
  };

  const handlePixConfirmado = async () => {
    // Incrementar fidelidade ao confirmar PIX
    if (userData.id) {
      await supabase.rpc('incrementar_fidelidade', { cli_id: Number(userData.id) });
      setProgressoFidelidade(prev => prev + 1);
    }
    setIsCheckoutOpen(false);
    setIsConfirmacaoAberta(true);
    setAceitouTermos(false);
    // Reload slots
    const { data } = await supabase.from('reservas').select('horario_inicio, data_reserva, status, cliente_nome, id').eq('data_reserva', diaSelecionado.toLocaleDateString('sv-SE'));
    if (data) setListaReservas(data as Reserva[]);
  };

  // Remarcação
  const handleRemarcar = async () => {
    if (!remarcarReserva?.id || !remarcarData) return;
    try {
      const { error } = await supabase.from('reservas').update({
        data_reserva: remarcarData,
      }).eq('id', remarcarReserva.id);
      if (error) throw error;
      toast({ title: "Reserva remarcada!", description: `Nova data: ${new Date(remarcarData + 'T00:00:00').toLocaleDateString('pt-BR')}` });
      setRemarcarModal(false);
      setRemarcarReserva(null);
      // Reload
      const { data: historico } = await supabase.from('reservas').select('*').eq('cliente_id', Number(userData.id)).order('data_reserva', { ascending: false }).limit(20);
      if (historico) setHistoricoReservas(historico);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message });
    }
  };

  const getSlotStatus = (slotInicio: string) => {
    const dataStr = diaSelecionado.toLocaleDateString('sv-SE');
    const reserva = (listaReservas || []).find((res: any) =>
      String(res.horario_inicio) === String(slotInicio) && String(res.data_reserva) === dataStr
    );
    if (!reserva) return 'livre';
    if (reserva.status === 'pendente') return 'pendente';
    if (reserva.status === 'cancelada') return 'livre';
    return 'reservado';
  };

  const getSlotColor = (status: string, isSelecionado: boolean) => {
    if (isSelecionado) return "border-[#22c55e] bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]";
    switch (status) {
      case 'livre': return "border-[#22c55e]/30 bg-[#22c55e]/5 text-white hover:border-[#22c55e]";
      case 'pendente': return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
      case 'reservado': return "border-red-500/30 bg-red-500/10 text-red-400 opacity-60 cursor-not-allowed";
      default: return "border-white/5 bg-white/5 text-white";
    }
  };

  const diasMes = useMemo(() => {
    const start = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const end = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const days: (number | null)[] = [];
    for (let i = 0; i < start.getDay(); i++) days.push(null);
    for (let i = 1; i <= end.getDate(); i++) days.push(i);
    return days;
  }, [mesAtual]);

  if (emManutencao) return (
    <div className="min-h-screen bg-[#060a08] flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle size={60} className="text-red-500 animate-pulse mb-4" />
      <h1 className="text-4xl font-black text-white italic uppercase">Arena em Pausa</h1>
      <p className="text-gray-400 mt-2">Estamos realizando uma manutenção rápida. Voltamos logo!</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans">
      <header className="w-full bg-[#0c120f] border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex flex-col items-center">
            <img src="/media/logo-arena.png" alt="Logo" className="h-40 md:h-48 w-auto object-contain transition-transform hover:scale-105" />
            <span className="text-[20px] font-black uppercase text-[#22c55e] tracking-[0.2em]">Bem Vindo, {userData.nome}</span>
          </div>
          <button onClick={handleLogout} className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-12"><FidelityCard count={progressoFidelidade} /></div>

        <div className="flex flex-wrap gap-4 mb-6 text-xs font-bold uppercase">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#22c55e]" /> Disponível</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Pgto Pendente</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Reservado</div>
        </div>

        <Tabs defaultValue="agendar" className="space-y-8">
          <TabsList className="bg-white/5 p-1 rounded-2xl w-full max-w-2xl mx-auto h-16 grid grid-cols-4 border border-white/5">
            <TabsTrigger value="agendar" className="rounded-xl font-bold uppercase italic">Agenda</TabsTrigger>
            <TabsTrigger value="loja" className="rounded-xl font-bold uppercase italic">Loja</TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl font-bold uppercase italic">Avaliar</TabsTrigger>
            <TabsTrigger value="perfil" className="rounded-xl font-bold uppercase italic">Perfil</TabsTrigger>
          </TabsList>

          {/* AGENDA */}
          <TabsContent value="agendar" className="grid lg:grid-cols-12 gap-8 outline-none border-none">
            <div className="lg:col-span-7">
              <Card className="bg-white border-none overflow-hidden rounded-[2.5rem] shadow-2xl">
                <div className="bg-[#22c55e] p-6 flex items-center justify-between text-black">
                  <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))}><ChevronLeft size={24} /></button>
                  <h2 className="text-xl font-black uppercase italic">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesAtual)}</h2>
                  <button onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))}><ChevronRight size={24} /></button>
                </div>
                <div className="grid grid-cols-7 text-center bg-gray-50 text-[10px] font-black text-gray-400 py-2">
                  {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7">
                  {diasMes.map((day, i) => (
                    <button key={i} disabled={!day}
                      onClick={() => day && setDiaSelecionado(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), day))}
                      className={cn("h-14 md:h-20 border-r border-b border-gray-50 flex flex-col items-center justify-center font-black transition-all",
                        !day ? "opacity-0" : "",
                        day && diaSelecionado.getDate() === day && diaSelecionado.getMonth() === mesAtual.getMonth() ? "bg-[#22c55e] text-black" : "bg-white text-black hover:bg-gray-100"
                      )}>{day}</button>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] backdrop-blur-sm h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2"><Clock className="text-[#22c55e]" size={20} /><h3 className="font-black uppercase italic text-sm text-white">Horários</h3></div>
                  <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                    {[30, 60, 90].map(m => (
                      <button key={m} onClick={() => { setSelectedDuration(m); setHorarioSelecionado(""); }}
                        className={cn("px-4 py-2 rounded-lg text-[10px] font-black transition-all", selectedDuration === m ? "bg-[#22c55e] text-black" : "text-gray-500 hover:text-gray-300")}>{m}M</button>
                    ))}
                  </div>
                </div>

                <ScrollArea className="h-[320px] pr-4 flex-grow">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {gerarHorarios(selectedDuration).map((slot) => {
                      const status = getSlotStatus(slot.inicio);
                      const isSelecionado = horarioSelecionado === slot.inicio;
                      const isOcupado = status === 'reservado';
                      return (
                        <button key={slot.inicio} disabled={isOcupado}
                          onClick={() => !isOcupado && setHorarioSelecionado(slot.inicio)}
                          className={cn("p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all h-20", getSlotColor(status, isSelecionado))}>
                          <span className="text-sm font-black italic tracking-tighter">{slot.inicio} — {slot.fim}</span>
                          <span className={cn("text-[9px] font-bold uppercase mt-1",
                            status === 'reservado' ? "text-red-500" : status === 'pendente' ? "text-yellow-500" : isSelecionado ? "text-black/60" : "text-[#22c55e]"
                          )}>{status === 'reservado' ? "Reservado" : status === 'pendente' ? "Pendente" : `Livre • R$ ${Number(slot.valor).toFixed(2)}`}</span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>

                <div className="mt-6 space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 italic tracking-widest ml-1">Tipo de Agendamento</label>
                  <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-2xl border border-white/5">
                    <button type="button" onClick={() => setTipoReserva('avulsa')} className={cn("py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2", tipoReserva === 'avulsa' ? "bg-[#22c55e] text-black shadow-lg" : "text-gray-500 hover:text-white")}>⚽ Avulsa</button>
                    <button type="button" onClick={() => setTipoReserva('pacote')} className={cn("py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2", tipoReserva === 'pacote' ? "bg-[#22c55e] text-black shadow-lg" : "text-gray-500 hover:text-white")}>📦 Pacote 4 Jogos</button>
                  </div>
                  {tipoReserva === 'pacote' && (
                    <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 p-3 rounded-xl">
                      <p className="text-[9px] text-[#22c55e] font-black uppercase italic leading-tight">✨ Pacote 4 jogos: desconto de R$10 por jogo (R$40 total). Pagamento antecipado PIX ou dinheiro.</p>
                    </div>
                  )}
                </div>

                <Button disabled={!horarioSelecionado} onClick={() => { setIsCheckoutOpen(true); setReservaCriada(false); setReservaIdAtual(null); limparPix(); }} className="w-full bg-[#22c55e] hover:bg-[#1eb054] text-black font-black uppercase italic h-14 rounded-2xl mt-4 transition-all shadow-[0_10px_20px_rgba(34,197,94,0.2)]">
                  Fazer Reserva
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* LOJA */}
          <TabsContent value="loja" className="grid lg:grid-cols-3 gap-8 outline-none">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {produtos.map(p => (
                <Card key={p.id} className="bg-white/5 border-white/10 p-6 rounded-[2rem] group hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#22c55e]/10 rounded-xl flex items-center justify-center text-[#22c55e]"><Package size={24} /></div>
                      <div>
                        <h4 className="font-bold text-sm uppercase italic text-white">{p.nome}</h4>
                        <Badge className={cn("text-[8px] font-black mt-1", p.tipo === 'venda' ? "bg-blue-500/20 text-blue-400" : p.tipo === 'aluguel' ? "bg-purple-500/20 text-purple-400" : "bg-orange-500/20 text-orange-400")}>
                          {p.tipo === 'ambos' ? 'VENDA / ALUGUEL' : p.tipo?.toUpperCase()}
                        </Badge>
                        <div className="mt-2 space-y-1">
                          {(p.tipo === 'venda' || p.tipo === 'ambos') && p.preco_venda > 0 && <p className="text-[#22c55e] font-black text-sm">Venda: R$ {p.preco_venda.toFixed(2)}</p>}
                          {(p.tipo === 'aluguel' || p.tipo === 'ambos') && p.preco_aluguel > 0 && <p className="text-purple-400 font-black text-sm">Aluguel: R$ {p.preco_aluguel.toFixed(2)}</p>}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => addToCart(p)} size="icon" className="bg-[#22c55e] text-black rounded-xl hover:scale-110 transition-transform"><ShoppingCart size={18} /></Button>
                  </div>
                </Card>
              ))}
            </div>
            <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[2.5rem] h-fit sticky top-24">
              <h3 className="italic font-black uppercase mb-6 flex items-center gap-2"><ShoppingCart size={20} className="text-[#22c55e]" /> Seu Carrinho</h3>
              <div className="space-y-4 mb-8">
                {cart.length === 0 ? <p className="text-gray-500 text-xs italic">Carrinho vazio...</p> : cart.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs font-bold uppercase tracking-tighter">
                    <span>{item.nome}</span>
                    <div className="flex items-center gap-2">
                      <span>R$ {(item.preco || 0).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(i)} className="text-red-500 hover:scale-125 transition-all"><CheckCircle2 className="rotate-45" size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="bg-white/10 mb-4" />
              <div className="flex justify-between font-black text-2xl text-[#22c55e] mb-6 italic"><span>Total:</span><span>R$ {totalGeral.toFixed(2)}</span></div>
              <Button onClick={() => { setIsCheckoutOpen(true); setReservaCriada(false); setReservaIdAtual(null); limparPix(); }} className="w-full bg-[#22c55e] text-black font-black italic h-14 rounded-2xl shadow-lg shadow-[#22c55e]/10">Finalizar Pedido</Button>
            </Card>
          </TabsContent>

          {/* FEEDBACK */}
          <TabsContent value="feedback" className="outline-none">
            <Card className="bg-white/5 border-white/10 p-10 rounded-[3rem] max-w-2xl mx-auto backdrop-blur-md">
              <div className="text-center mb-8"><Star className="mx-auto text-[#22c55e] mb-4 fill-[#22c55e]" size={40} /><h2 className="text-3xl font-black uppercase italic text-white">Sua <span className="text-[#22c55e]">Opinião</span></h2></div>
              <div className="space-y-6">
                <Input placeholder="Seu Nome" className="bg-white/5 border-white/10 h-14 rounded-xl" value={review.nome} onChange={(e) => setReview({ ...review, nome: e.target.value })} />
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setReview({ ...review, estrelas: n })}><Star className={cn("w-8 h-8 transition-all", review.estrelas >= n ? "text-yellow-400 fill-yellow-400 scale-110" : "text-gray-700")} /></button>
                  ))}
                </div>
                <Textarea placeholder="Como foi sua experiência?" className="bg-white/5 border-white/10 min-h-[120px] rounded-xl" value={review.texto} onChange={(e) => setReview({ ...review, texto: e.target.value })} />
                <Button onClick={handleSubmitReview} className="w-full bg-[#22c55e] text-black font-black uppercase italic h-16 rounded-2xl text-lg">Enviar Avaliação</Button>
              </div>
            </Card>
          </TabsContent>

          {/* PERFIL */}
          <TabsContent value="perfil" className="grid md:grid-cols-3 gap-8 outline-none border-none">
            <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center text-center h-fit">
              <div className="relative">
                <div className="w-24 h-24 bg-[#22c55e]/20 rounded-full flex items-center justify-center border-2 border-[#22c55e]"><User size={48} className="text-[#22c55e]" /></div>
                {userData.isVip && <div className="absolute -top-2 -right-2 bg-yellow-500 p-2 rounded-full text-black animate-bounce shadow-lg"><Crown size={16} /></div>}
              </div>
              <h3 className="font-black italic uppercase text-xl mt-4 text-white">{userData.nome}</h3>
              <p className="text-gray-500 text-xs font-bold">{userData.email}</p>
              <Badge className="bg-[#22c55e] text-black font-black mt-4 px-4 py-1 rounded-full uppercase italic">{userData.isVip ? "Membro Ouro" : "Cliente Arena"}</Badge>
              <div className="mt-4 text-center">
                <p className="text-[10px] font-black uppercase text-gray-500">Fidelidade</p>
                <p className="text-2xl font-black text-[#22c55e]">{progressoFidelidade}/10</p>
                <div className="w-full bg-white/5 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-[#22c55e] transition-all" style={{ width: `${(progressoFidelidade % 10) * 10}%` }} />
                </div>
                {progressoFidelidade > 0 && progressoFidelidade % 10 === 0 && <p className="text-yellow-500 text-[9px] font-black mt-1 animate-pulse">★ Próximo jogo é cortesia!</p>}
              </div>
              <Button onClick={handleLogout} variant="ghost" className="mt-8 text-red-500 hover:text-red-400 hover:bg-red-500/10 text-xs font-black uppercase italic gap-2"><LogOut size={14} /> Sair da Conta</Button>
            </Card>

            <div className="md:col-span-2 space-y-6">
              <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem]">
                <h4 className="text-[#22c55e] text-xs font-black uppercase italic mb-6 flex items-center gap-2 tracking-widest"><CalendarCheck size={18} /> Horários Fixos (VIP)</h4>
                {reservasFixas.length === 0 ? <p className="text-gray-500 text-xs italic">Nenhuma reserva fixa registrada.</p> :
                  reservasFixas.map((r: any, i: number) => (
                    <div key={i} className="flex justify-between bg-black/40 p-4 rounded-2xl mb-3 border border-white/5 items-center">
                      <span className="font-black uppercase text-xs italic">{r.dia_semana}s</span>
                      <span className="bg-[#22c55e] text-black px-3 py-1 rounded-lg font-black text-xs">{r.horario}</span>
                    </div>
                  ))
                }
              </Card>
              <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem]">
                <h4 className="text-[#22c55e] text-xs font-black uppercase italic mb-6 flex items-center gap-2 tracking-widest"><History size={18} /> Histórico de Reservas</h4>
                <div className="space-y-3">
                  {historicoReservas.length === 0 ? <p className="text-gray-500 text-xs italic">Nenhuma reserva registrada.</p> :
                    historicoReservas.map((r) => (
                      <div key={r.id} className="bg-black/40 p-4 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-black text-xs uppercase text-white italic">{new Date(r.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')} — {r.horario_inicio}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={cn("text-[8px] font-black border-none", r.tipo === 'fixa' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400")}>{r.tipo === 'fixa' ? 'FIXA' : 'AVULSA'}</Badge>
                              <Badge className={cn("text-[8px] font-black border-none", r.pago ? "bg-[#22c55e]/20 text-[#22c55e]" : r.status === 'pendente' ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500")}>{r.pago ? 'PAGO' : r.status === 'pendente' ? 'PENDENTE' : (r.status || 'PENDENTE').toUpperCase()}</Badge>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-black text-[#22c55e]">R$ {Number(r.valor_total || 0).toFixed(2)}</p>
                            <p className="text-[9px] text-gray-500 uppercase">{r.forma_pagamento || '—'}</p>
                            {/* Botão Remarcar */}
                            {(r.status === 'confirmada' || r.pago) && r.status !== 'cancelada' && (
                              <Button size="sm" variant="outline" className="border-blue-500/20 text-blue-400 rounded-xl text-[8px] h-6 px-2"
                                onClick={() => {
                                  setRemarcarReserva(r);
                                  setRemarcarData("");
                                  setRemarcarModal(true);
                                }}>
                                <RefreshCcw size={10} className="mr-1" /> Remarcar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL DE CHECKOUT */}
      <Dialog open={isCheckoutOpen} onOpenChange={(open) => { setIsCheckoutOpen(open); if (!open) { limparPix(); if (!reservaCriada) { setReservaIdAtual(null); } } }}>
        <DialogContent className="bg-[#0c120f] border-white/10 text-white max-w-[480px] rounded-[3rem] p-8 outline-none backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase text-[#22c55e] flex items-center gap-3"><ShoppingCart size={24} /> Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Resumo */}
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
              <p className="text-[10px] font-black uppercase text-gray-500 italic tracking-widest">Itens do Pedido</p>
              {horarioSelecionado && (
                <div className="flex justify-between items-center text-sm font-bold bg-[#22c55e]/5 p-3 rounded-xl border border-[#22c55e]/20">
                  <div className="flex items-center gap-2 text-[#22c55e]"><CalendarCheck size={16} /><span>Quadra ({horarioSelecionado})</span></div>
                  <span className="text-white">R$ {valorApenasReserva.toFixed(2)}</span>
                </div>
              )}
              {cart.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm font-bold px-1">
                  <div className="flex items-center gap-2 text-gray-400"><Package size={14} /><span>{item.nome}</span></div>
                  <div className="flex items-center gap-3">
                    <span>R$ {(item.preco || 0).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(idx)} className="text-red-500 hover:scale-125 transition-all"><CheckCircle2 className="rotate-45" size={14} /></button>
                  </div>
                </div>
              ))}
              <Separator className="bg-white/10" />
              <div className="flex justify-between items-center font-black text-lg italic pt-2">
                <span className="text-gray-400">Total:</span>
                <span className="text-[#22c55e] text-2xl">R$ {totalGeral.toFixed(2)}</span>
              </div>
              {tipoReserva === 'pacote' && (
                <p className="text-[9px] text-purple-400 font-bold italic">📦 Pacote 4 jogos — desconto de R$40 no PIX integral</p>
              )}
            </div>

            {/* Seleção de Pagamento */}
            <RadioGroup defaultValue="pix" onValueChange={(v) => setMetodoPagamento(v as any)} className="grid grid-cols-2 gap-4">
              <div className={cn("flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all gap-2", metodoPagamento === "pix" ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5")}>
                <RadioGroupItem value="pix" id="pix" className="sr-only" />
                <Label htmlFor="pix" className="flex flex-col items-center gap-2 font-black text-[10px] uppercase cursor-pointer">
                  <CreditCard size={20} className={metodoPagamento === "pix" ? "text-[#22c55e]" : "text-gray-600"} /> PIX
                </Label>
              </div>
              <div className={cn("flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all gap-2", metodoPagamento === "dinheiro" ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5")}>
                <RadioGroupItem value="dinheiro" id="dinheiro" className="sr-only" />
                <Label htmlFor="dinheiro" className="flex flex-col items-center gap-2 font-black text-[10px] uppercase cursor-pointer">
                  <Banknote size={20} className={metodoPagamento === "dinheiro" ? "text-[#22c55e]" : "text-gray-600"} /> NO LOCAL
                </Label>
              </div>
            </RadioGroup>

            {/* PIX Section */}
            {metodoPagamento === "pix" && (
              <PixPaymentSection
                valorTotal={totalGeral}
                desconto={descontoAtual}
                tipoReserva={tipoReserva}
                pixChaveEstatica={pixChaveEstatica}
                pixData={pixData}
                isCarregando={isCarregandoPix}
                onGerarPixIntegral={handleGerarPixIntegral}
                onGerarPixLivre={handleGerarPixLivre}
                onTimeout={handlePixTimeout}
                onConfirmarPagamento={handlePixConfirmado}
                timeoutMinutos={8}
              />
            )}

            {/* Dinheiro */}
            {metodoPagamento === "dinheiro" && (
              <>
                <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 text-center">
                  <p className="text-xs font-black uppercase italic text-gray-300">Reserva pré-confirmada!</p>
                  <p className="text-[10px] text-[#22c55e] font-bold uppercase mt-1">Apresente seu nome na recepção e pague na chegada.</p>
                  <p className="text-lg font-black text-white mt-2">Valor: R$ {totalGeral.toFixed(2)}</p>
                </div>
                <Button onClick={handleFinalizeDinheiro} className="w-full bg-[#22c55e] text-black font-black uppercase italic h-16 rounded-2xl text-lg shadow-xl">
                  Finalizar Agendamento
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL PÓS-PAGAMENTO - TERMOS */}
      <Dialog open={isConfirmacaoAberta} onOpenChange={(open) => { if (!open && aceitouTermos) { setIsConfirmacaoAberta(false); setHorarioSelecionado(null); } }}>
        <DialogContent className="bg-[#0c120f] border-white/10 text-white max-w-[480px] rounded-[3rem] p-8 outline-none backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase text-[#22c55e] flex items-center gap-3"><CheckCircle2 size={24} /> Reserva Confirmada</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-2xl p-5">
              <p className="text-xs font-bold text-white leading-relaxed uppercase">
                SUA RESERVA ESTÁ CONFIRMADA. SE HOUVER CANCELAMENTO ATÉ 24 HORAS ANTES DO INÍCIO DO JOGO, DEVERÁ COMUNICAR IMEDIATAMENTE EM NOSSO CANAL DIRETO NO WHATSAPP (98 99991-0535), SOLICITANDO REMARCAÇÃO PARA NO MÁXIMO SEMANA SEGUINTE, E MESMO TURNO (DIURNO P/ DIURNO, NOTURNO P/ NOTURNO). APÓS 24 HORAS NÃO HAVERÁ RESSARCIMENTO E NEM REMARCAÇÃO.
              </p>
            </div>
            <a href="/regras-arena.pdf" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-[#22c55e] text-sm font-black uppercase underline hover:text-white transition-colors">📄 Ver Regras da Arena Cedro</a>
            <label className="flex items-start gap-3 cursor-pointer bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-[#22c55e]/30 transition-all">
              <input type="checkbox" checked={aceitouTermos} onChange={(e) => setAceitouTermos(e.target.checked)} className="mt-1 accent-[#22c55e] w-5 h-5" />
              <span className="text-xs font-bold text-gray-300 uppercase leading-relaxed">Estou ciente e concordo com os termos e regras da Arena Cedro.</span>
            </label>
            <Button disabled={!aceitouTermos} onClick={() => { setIsConfirmacaoAberta(false); setHorarioSelecionado(null); setReservaCriada(false); toast({ title: "✅ Tudo certo!", description: "Sua reserva está confirmada. Bom jogo!" }); }}
              className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14 rounded-2xl disabled:opacity-30 transition-all">
              Confirmar e Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL REMARCAÇÃO */}
      <Dialog open={remarcarModal} onOpenChange={setRemarcarModal}>
        <DialogContent className="bg-[#0c120f] border-white/10 text-white max-w-[400px] rounded-[2rem] p-8 outline-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-black italic uppercase text-[#22c55e] flex items-center gap-2"><RefreshCcw size={20} /> Remarcar Reserva</DialogTitle>
          </DialogHeader>
          {remarcarReserva && (
            <div className="space-y-4 pt-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Reserva atual</p>
                <p className="font-black text-white">{new Date(remarcarReserva.data_reserva + 'T00:00:00').toLocaleDateString('pt-BR')} — {remarcarReserva.horario_inicio}</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl">
                <p className="text-[9px] text-yellow-300 font-bold">⚠️ A remarcação mantém o mesmo horário. Escolha apenas a nova data (mesmo turno: diurno→diurno, noturno→noturno). Máximo: semana seguinte.</p>
              </div>
              <div>
                <Label className="text-[10px] uppercase text-gray-500 font-bold">Nova Data</Label>
                <Input type="date" value={remarcarData} onChange={e => setRemarcarData(e.target.value)} className="bg-white/5 border-white/10 mt-1 text-white" />
              </div>
              <Button disabled={!remarcarData} onClick={handleRemarcar} className="w-full bg-[#22c55e] text-black font-black uppercase h-12 rounded-xl">
                Confirmar Remarcação
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClienteDashboard;
