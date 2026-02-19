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
import { 
  Users, Calendar as LucideCalendar, ShoppingBag, AlertTriangle, 
  LogOut, CheckCircle, XCircle, Star, MessageSquare, Trophy, 
  Bell, ChevronLeft, ChevronRight, Crown, Plus, Search, DollarSign,
  Package,
  AlertCircle,
  BellRing,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const AtendenteDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- ESTADOS ---
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date());
  const [agendaStatus, setAgendaStatus] = useState<Record<string, any>>({});
  const [filtroNome, setFiltroNome] = useState("");

  const [itensTemp, setItensTemp] = useState<any[]>([]);
  const [duracao, setDuracao] = useState<string>("60");
  const [metodoPgto, setMetodoPgto] = useState<string>("pix");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  
  const [isModalAberto, setIsModalAberto] = useState(false);

  const [itensCarrinho, setItensCarrinho] = useState<any[]>([]);

  const [isModalVipAberto, setIsModalVipAberto] = useState(false);
  const [novoVip, setNovoVip] = useState({
     nome: "",
  dia: "SEG",
  horario: "19:00",
  metodoPgto: "Mensal/PIX",
  observacao: ""            
});

  const [mensalistas, setMensalistas] = useState<Mensalista[]>([
  // Adicione um exemplo para teste ou deixe vazio []
  { id: 1, nome: "João Silva", dia: "SEG", horario: "19:00", metodoPgto: "Dinheiro" }
 ]);

 const adicionarAoCarrinho = (produto: any) => {
  setItensCarrinho([...itensCarrinho, { ...produto, idUnico: Date.now() }]);
  toast({ title: "Adicionado", description: `${produto.nome} somado à reserva.` });
};

const removerDoCarrinho = (idUnico: number) => {
  setItensCarrinho(itensCarrinho.filter(item => item.idUnico !== idUnico));
};

 interface Mensalista {
  id?: number; // O ID é opcional no cadastro, pois o banco gera automático
  nome: string;
  dia: string;
  horario: string;
  metodoPgto: string;
  observacao?: string; // Campo novo para o Admin ver na engrenagem
  status_pagamento?: 'em_dia' | 'em_atraso'; 
  responsavel?: string;
}

  // Dados Simulados (Em um app real viriam do Banco/API)
 const [estoque, setEstoque] = useState<any[]>([]);

 useEffect(() => {
  const carregarProdutos = async () => {
    try {
      // O seu servidor Node deve estar rodando na porta 3001
      const response = await fetch("http://localhost:3001/api/produtos");
      const data = await response.json();
      setEstoque(data);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
    }
  };
  carregarProdutos();
}, []);

const listaHorarios = useMemo(() => {
    const horas = [];
   for (let hora = 9; hora <= 17; hora++) {
    horas.push(`${hora.toString().padStart(2, '0')}:00`);
    horas.push(`${hora.toString().padStart(2, '0')}:30`);
  }

  for (let hora = 18; hora <= 22; hora++) {
    horas.push(`${hora.toString().padStart(2, '0')}:00`);
     horas.push(`${hora.toString().padStart(2, '0')}:30`);
  }
    return horas;
  }, []);

  const [clientes, setClientes] = useState<{ id: number; nome: string; sobrenome?: string; status?: string; telefone: string; obs?: string; isVip?: boolean }[]>([]);
  const [alertas, setAlertas] = useState<{ id: number; cliente: string; cliente_id?: number; obs: string; tipo: string; alerta?: boolean }[]>([]);
  const [modalNovoAlertaAberto, setModalNovoAlertaAberto] = useState(false);
  const [novoAlertaForm, setNovoAlertaForm] = useState({ cliente_id: "", tipo: "neutra" as "positiva" | "negativa" | "neutra", observacao: "" });
  const clientesComObs = useMemo(() => clientes.map(c => {
    const obsDoCliente = alertas.filter(a => a.cliente_id === c.id);
    const comAlerta = obsDoCliente.find(o => o.alerta);
    return { ...c, status: comAlerta ? "ruim" : "bom", obs: obsDoCliente[0]?.obs ?? c.obs ?? "—", alertaId: comAlerta?.id };
  }), [clientes, alertas]);

  const API = "http://localhost:3001/api";

  useEffect(() => {
    fetch(`${API}/clientes`).then(r => r.json()).then((rows: any[]) => setClientes((rows || []).map(c => ({ id: c.id, nome: [c.nome, c.sobrenome].filter(Boolean).join(" "), telefone: c.telefone || "", isVip: c.tipo === "vip" })))).catch(() => {});
    fetch(`${API}/observacoes-clientes`).then(r => r.json()).then((rows: any[]) => setAlertas((rows || []).map((o: any) => ({ id: o.id, cliente: o.cliente_nome, cliente_id: o.cliente_id, obs: o.observacao, tipo: o.tipo || "neutra", alerta: !!o.alerta })))).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API}/manutencao`).then(r => r.json()).then((d: { ativo: boolean }) => {
      setIsMaintenance(!!d.ativo);
      localStorage.setItem("arena_manutencao", String(d.ativo));
    }).catch(() => {
      const manutencaoSalva = localStorage.getItem("arena_manutencao") === "true";
      setIsMaintenance(manutencaoSalva);
    });
    const agendaSalva = localStorage.getItem("arena_agenda");
    if (agendaSalva) try { setAgendaStatus(JSON.parse(agendaSalva)); } catch (_) {}
  }, []);

  useEffect(() => {
    const handler = () => { const v = localStorage.getItem("arena_manutencao") === "true"; setIsMaintenance(v); };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // --- LÓGICA DO CALENDÁRIO ---
  const diasMes = useMemo(() => {
    const start = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const end = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const days = [];
    for (let i = 0; i < start.getDay(); i++) days.push(null);
    for (let i = 1; i <= end.getDate(); i++) days.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i));
    return days;
  }, [mesAtual]);

  // --- FUNÇÕES ---
  const handleToggleMaintenance = () => {
  const novoStatus = !isMaintenance;
  fetch(`${API}/manutencao`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ativo: novoStatus }) }).catch(() => {});
  setIsMaintenance(novoStatus);
  localStorage.setItem("arena_manutencao", novoStatus.toString());
  window.dispatchEvent(new Event("storage"));
  toast({
    variant: novoStatus ? "destructive" : "default",
    title: novoStatus ? "⚠️ SISTEMA BLOQUEADO" : "✅ SISTEMA LIBERADO",
    description: novoStatus ? "Clientes e painel admin foram alertados." : "Agendamento liberado.",
  });
};

const playApito = () => {
  const audio = new Audio('/sound/apito.mp3');
  audio.volume = 0.5;
  audio.play().catch(e => console.log("Erro som:", e));
};

const playTorcida = () => {
  const audio = new Audio('/sound/torcida.mp3');
  audio.volume = 0.4;
  audio.play().catch(e => console.log("Erro som:", e));
};

const verificarDisponibilidade = (horaInicio: string, min: number) => {
  const indexInicio = listaHorarios.indexOf(horaInicio);
  const slotsNecessarios = min / 30;
  for (let i = 0; i < slotsNecessarios; i++) {
    const horaCheck = listaHorarios[indexInicio + i];
    const idCheck = `${diaSelecionado.toDateString()}-${horaCheck}`;
    if (agendaStatus[idCheck]) return false;
  }
  return true;
};

const handleSuspenderMensalista = (id: number) => {
  if (window.confirm("Tem certeza que deseja suspender este horário fixo?")) {
    setMensalistas(prev => prev.filter(m => m.id !== id));
    toast({
      title: "Mensalista Suspenso",
      variant: "destructive",
    });
  }
};

// Função para abrir o modal de Edição (Você pode usar o mesmo modal de 'Novo VIP')
const handleEditarMensalista = (mensalista: Mensalista) => {
  setNovoVip(novoVip);
  setIsModalVipAberto(true); // Abre o modal
};


useEffect(() => {
  fetch("http://localhost:3001/api/mensalistas")
    .then(res => res.json())
    .then(data => setMensalistas(data));
}, []);

// Função disparada pelo botão "+ NOVO VIP"
const salvarNovoVip = async () => {
  const response = await fetch("http://localhost:3001/api/mensalistas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novoVip),
  });
  if (response.ok) {
    setIsModalVipAberto(false);
    window.location.reload(); // Atualiza a lista
  }
};


const handleSalvarVip = async () => {
  const atendenteNome = localStorage.getItem("userName") || "Atendente";

  // Criamos o objeto seguindo a Interface
  const dadosParaEnviar: Mensalista = {
    nome: novoVip.nome,
    dia: novoVip.dia,
    horario: novoVip.horario,
    metodoPgto: novoVip.metodoPgto,
    observacao: novoVip.observacao || "", // Pega a observação real
    responsavel: atendenteNome,           // Nome real de quem está logado
    status_pagamento: 'em_dia'            // Começa verdinho no Admin
  };

  try {
    const response = await fetch("http://localhost:3001/api/mensalistas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosParaEnviar),
    });

    if (response.ok) {
      toast({ 
        title: "✅ VIP CADASTRADO!", 
        description: "Os dados já estão disponíveis no painel do Admin." 
      });
      setIsModalVipAberto(false);
      buscarMensalistas(); 
    }
  } catch (error) {
    console.error("Erro ao salvar:", error);
  }
};


const alternarStatusPagamento = async (id: number, statusAtual: string) => {
  const novoStatus = statusAtual === 'em_dia' ? 'em_atraso' : 'em_dia';
  
  try {
    const response = await fetch(`http://localhost:3001/api/mensalistas/status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novoStatus })
    });

    if (response.ok) {
      toast({ 
        title: "Status Atualizado!", 
        description: `O VIP agora está ${novoStatus === 'em_dia' ? 'Em Dia' : 'Em Atraso'}.`,
        variant: novoStatus === 'em_dia' ? "default" : "destructive"
      });
      
      // Atualiza a lista local para o atendente ver a mudança na hora
      setMensalistas(prev => prev.map(v => v.id === id ? { ...v, status_pagamento: novoStatus } : v));
    }
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
  }
};

  
// 2. SEGUNDO: A Função de Agendar Completa
  function handleAgendar(horaInicio: string, clienteNome: string) {
    if (!clienteNome) return toast({ variant: "destructive", title: "Nome obrigatório" });

    const duracaoMin = parseInt(duracao, 10);

    // Verifica se o horário está livre antes de seguir
    if (!verificarDisponibilidade(horaInicio, duracaoMin)) {
      return toast({
        variant: "destructive",
        title: "Conflito de Horário!",
        description: "Este período invade uma reserva existente."
      });
    }

    // Toca o som baseado no pagamento
    if (metodoPgto === 'pix') {
      playApito();
    } else {
      playTorcida();
    }

    // Cálculos de Valores
    const horaH = parseInt(horaInicio.split(":")[0]);
    const valorBase = horaH >= 18 ? 120 : 80;
    const valorReserva = valorBase * (duracaoMin / 60);
    const totalProdutos = itensTemp.reduce((acc, item) => acc + item.preco, 0);
    const totalGeral = valorReserva + totalProdutos;
    const valorSinal = metodoPgto === "pix" ? totalGeral * 0.5 : totalGeral;

    const idDataRaiz = `${diaSelecionado.toDateString()}-${horaInicio}`;
    const slotsNecessarios = duracaoMin / 30;
    const novaAgenda = { ...agendaStatus };
    const indexBase = listaHorarios.indexOf(horaInicio);

    // LOOP para marcar todos os blocos de 30min necessários
    for (let i = 0; i < slotsNecessarios; i++) {
      const horaOcupada = listaHorarios[indexBase + i];
      if (!horaOcupada) break;

      const idOcupado = `${diaSelecionado.toDateString()}-${horaOcupada}`;

      novaAgenda[idOcupado] = {
        cliente: clienteNome,
        isRaiz: i === 0,
        referenciaRaiz: idDataRaiz,
        duracao: duracaoMin,
        metodo: metodoPgto,
        valorTotal: totalGeral,
        valorPagoAgora: valorSinal,
        restante: totalGeral - valorSinal,
        itens: i === 0 ? itensTemp : []
      };
    }

    // ATUALIZA ESTADOS E FECHA MODAL
    setAgendaStatus(novaAgenda);
    setItensTemp([]); // Limpa o "carrinho"
    setIsModalAberto(false); // Fecha o modal
    toast({ title: "Reserva Confirmada!" });
  }

// 3. TERCEIRO: Outras funções de Gestão
const limparHorario = (id: string) => {
  const reserva = agendaStatus[id];
  const novaAgenda = { ...agendaStatus };
  Object.keys(novaAgenda).forEach(key => {
    if (novaAgenda[key].referenciaRaiz === (reserva.referenciaRaiz || id)) {
      delete novaAgenda[key];
    }
  });
  setAgendaStatus(novaAgenda);
  toast({ title: "Horário Liberado!" });
};

const handleToggleAlerta = (id: number) => {
  setClientes(prev => prev.map(c => 
    c.id === id ? { ...c, status: c.status === "ruim" ? "bom" : "ruim" } : c
  ));
};

// FINANCEIRO (Memoizado para performance)
const resumoFinanceiro = useMemo(() => {
  const reservasDoDia = Object.keys(agendaStatus).filter(key => 
    key.startsWith(diaSelecionado.toDateString()) && agendaStatus[key].isRaiz
  );
  return reservasDoDia.reduce((acc, key) => {
    const reserva = agendaStatus[key];
    if (reserva.metodo === "pix") {
      acc.pix += reserva.valorPagoAgora;
    } else {
      acc.dinheiro += reserva.valorPagoAgora;
    }
    acc.restante += reserva.restante;
    return acc;
  }, { pix: 0, dinheiro: 0, restante: 0 });
}, [agendaStatus, diaSelecionado]);

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans">
      {/* HEADER ADM */}
      <header className="border-b border-white/10 bg-black/60 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-col items-center">
            <img src="/media/logo-arena.png" alt="Logo" className="w-60 h-60 object-contain" />
            <span className="text-[20px] font-black uppercase text-[#22c55e]">BEM VINDO ATENDENTE</span>
          </div>
          </div>
          <div className="flex gap-2">
            {/* BOTÃO FECHAR CAIXA */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black">
                  <DollarSign size={16} className="mr-1"/> CAIXA
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
                <DialogHeader><DialogTitle className="italic uppercase">Resumo {diaSelecionado.toLocaleDateString()}</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[10px] text-gray-400 uppercase">PIX (Sinais)</p>
                      <p className="text-xl font-black text-[#22c55e]">R$ {resumoFinanceiro.pix.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[10px] text-gray-400 uppercase">Dinheiro</p>
                      <p className="text-xl font-black text-[#22c55e]">R$ {resumoFinanceiro.dinheiro.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex justify-between">
                    <span className="text-xs uppercase font-bold">A receber no local:</span>
                    <span className="font-black text-red-500">R$ {resumoFinanceiro.restante.toFixed(2)}</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          <Button onClick={() => setIsMaintenance(!isMaintenance)} variant={isMaintenance ? "destructive" : "outline"} size="sm">
            {isMaintenance ? "MANUTENÇÃO OFFLINE" : "MANUTENÇÃO ONLINE"}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/5 w-full md:w-fit overflow-x-auto">
            <TabsTrigger value="agenda" className="px-6 font-bold uppercase italic">Agenda Mensal</TabsTrigger>
            <TabsTrigger value="clientes" className="px-6 font-bold uppercase italic">Clientes</TabsTrigger>
            <TabsTrigger value="vip" className="px-6 font-bold uppercase italic">VIPs/Fixos</TabsTrigger>
            <TabsTrigger value="produtos" className="font-black italic uppercase px-6 bg-[#22c55e]/10 text-[#22c55e]">Produtos/Estoque</TabsTrigger>
            <TabsTrigger value="alertas" className="font-black italic uppercase px-6">Alertas/Obs</TabsTrigger>
          </TabsList>

          {/* ABA AGENDA: ESTILO GRID PREMIUM (IGUAL À FOTO) */}
           <TabsContent value="agenda" className="space-y-8">
  
  {/* 1. SEÇÃO CALENDÁRIO (OCUPANDO O TOPO) */}
  <Card className="bg-[#0c120f] border-white/5 overflow-hidden rounded-[2.5rem]">
    <div className="bg-[#22c55e] p-4 flex justify-between items-center text-black font-black uppercase text-sm">
      <button onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() - 1)))} className="hover:scale-110 transition-transform">
        <ChevronLeft />
      </button>
      <h2 className="italic tracking-widest">
        {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesAtual)}
      </h2>
      <button onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() + 1)))} className="hover:scale-110 transition-transform">
        <ChevronRight />
      </button>
    </div>
    
    <div className="grid grid-cols-7 p-6 gap-2">
      {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map(d => (
        <div key={d} className="text-center text-[10px] text-gray-500 font-black mb-2">{d}</div>
      ))}
      {diasMes.map((date, i) => (
        <button
          key={i}
          disabled={!date}
          onClick={() => date && setDiaSelecionado(date)}
          className={cn(
            "h-14 rounded-2xl flex items-center justify-center font-black text-sm transition-all border",
            !date ? "opacity-0" : "hover:bg-[#22c55e]/10 border-white/5",
            date?.toDateString() === diaSelecionado.toDateString() 
              ? "bg-[#22c55e] text-black shadow-[0_0_20px_rgba(34,197,94,0.4)] border-[#22c55e]" 
              : "text-white bg-white/5"
          )}
        >
          {date?.getDate()}
        </button>
      ))}
    </div>
  </Card>

  {/* 2. SELETOR DE DURAÇÃO (CENTRALIZADO) */}
  <div className="flex flex-col items-center gap-4 py-4">
    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Selecione a Duração do Jogo</p>
    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
      {[30, 60, 90].map((min) => (
        <button
          key={min}
          onClick={() => setDuracao(String(min))}
          className={cn(
            "px-8 py-3 rounded-xl text-[11px] font-black uppercase transition-all",
            duracao === String(min) 
              ? "bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
              : "text-gray-500 hover:text-white"
          )}
        >
          {min} MIN
        </button>
      ))}
    </div>
  </div>

  {/* 3. GRID DE HORÁRIOS (ESTILO CARDS) */}
  <div className="space-y-6">
    <div className="flex justify-between items-center border-b border-white/5 pb-4">
      <h3 className="font-black italic uppercase text-[#22c55e] flex items-center gap-2">
        <LucideCalendar size={18} /> Disponibilidade: {diaSelecionado.toLocaleDateString()}
      </h3>
      <Badge variant="outline" className="text-[10px] border-[#22c55e] text-[#22c55e] px-4 py-1">
        {duracao} MINUTOS SELECIONADOS
      </Badge>
    </div>

    <ScrollArea className="h-[600px] pr-4">
  {/* Aumentei o número de colunas para 4 no mobile e 8 em telas grandes para compactar */}
  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
    {listaHorarios.map((h) => {
      const idAgendamento = `${diaSelecionado.toDateString()}-${h}`;
      const reserva = agendaStatus[idAgendamento];
      
      const [hora, min] = h.split(":").map(Number);
      const dataFim = new Date(0, 0, 0, hora, min + parseInt(duracao));
      const fimFormatado = `${dataFim.getHours().toString().padStart(2, '0')}:${dataFim.getMinutes().toString().padStart(2, '0')}`;

      return (
        <Dialog key={h} onOpenChange={() => setItensTemp([])}>
          <DialogTrigger asChild>
            <button 
              disabled={reserva}
              className={cn(
                "relative group flex flex-col items-center justify-center p-3 rounded-[1.5rem] border transition-all h-24", // Altura reduzida de 36 para 24
                reserva 
                  ? "bg-red-500/5 border-red-500/20 opacity-60 cursor-not-allowed" 
                  : "bg-[#0c120f] border-white/5 hover:border-[#22c55e] hover:bg-[#22c55e]/5"
              )}
            >
              {/* Turno ou Label Superior */}
              <span className="text-[7px] font-black uppercase text-gray-600 mb-1">Horário</span>

              {/* Horário unificado: 09:00 - 09:30 */}
              <span className={cn(
                "text-sm font-black italic tracking-tighter leading-none",
                reserva ? "text-red-500/50" : "text-white"
              )}>
                {h} - {fimFormatado}
              </span>
              
              <div className="mt-2">
                {reserva ? (
                  <div className="flex flex-col items-center">
                     <span className="text-[7px] font-black uppercase text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full">Ocupado</span>
                     <p className="text-[8px] text-gray-500 mt-1 font-bold truncate w-16 text-center">{reserva.cliente}</p>
                  </div>
                ) : (
                  <span className="text-[7px] font-black uppercase text-[#22c55e] border border-[#22c55e]/20 px-3 py-1 rounded-full group-hover:bg-[#22c55e] group-hover:text-black transition-colors">
                    Livre
                  </span>
                )}
              </div>
            </button>
          </DialogTrigger>

          {/* O Dialog permanece igual, pois é o formulário de preenchimento */}
          <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem] max-w-md outline-none">
  <DialogHeader>
    <DialogTitle className="italic uppercase flex items-center gap-2 text-xl font-black">
      <Plus className="text-[#22c55e]" size={20} /> NOVO JOGO - {h} ÀS {fimFormatado}
    </DialogTitle>
  </DialogHeader>
  
  <div className="space-y-6 pt-4">
    {/* NOME DO ATLETA */}
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Nome do Atleta Responsável</label>
      <Input 
        placeholder="Quem vai pagar?" 
        className="bg-white/5 border-white/10 h-14 rounded-xl text-white focus-visible:ring-[#22c55e]" 
        id={`atleta-${h}`} 
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      {/* SELEÇÃO DE PAGAMENTO */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Pagamento</label>
        <select 
          value={metodoPgto} 
          onChange={(e) => setMetodoPgto(e.target.value)}
          className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-[#22c55e] cursor-pointer"
        >
          <option value="pix" className="bg-[#0c120f]">PIX (Sinal 50%)</option>
    <option value="dinheiro" className="bg-[#0c120f]">Dinheiro (Local)</option>
        </select>
      </div>

      {/* DURAÇÃO (FIXA OU EDITÁVEL) */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Duração</label>
        <div className="h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-sm font-black text-[#22c55e]">
          {duracao} MIN
        </div>
      </div>
    </div>

    {/* Dentro do seu DialogContent, acima do botão Confirmar */}
{itensCarrinho.length > 0 && (
  <div className="space-y-2 border-t border-white/5 pt-4">
    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Itens Adicionais</label>
    <div className="max-h-24 overflow-y-auto space-y-2">
      {itensCarrinho.map((item) => (
        <div key={item.idUnico} className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
          <span className="text-xs">{item.nome} - R$ {item.preco}</span>
          <button 
            onClick={() => removerDoCarrinho(item.idUnico)}
            className="text-red-500 hover:text-red-400 p-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
    <div className="text-[#22c55e] font-black text-right text-sm">
      TOTAL ITENS: R$ {itensCarrinho.reduce((acc, item) => acc + item.preco, 0)}
    </div>
  </div>
)}
    { /* BOTÃO FINAL */}
    <Button 
      className="w-full bg-[#22c55e] hover:bg-[#1ba850] text-black font-black uppercase h-16 rounded-2xl text-base shadow-lg shadow-[#22c55e]/10 transition-all active:scale-95"
      onClick={() => {
        const input = document.getElementById(`atleta-${h}`) as HTMLInputElement;
        handleAgendar(h, input?.value);
      }}
    >
      Confirmar reserva
    </Button>
  </div>
</DialogContent>
        </Dialog>
      );
    })}
  </div>
</ScrollArea>
  </div>
</TabsContent>

{/* PRODUTOS/ESTOQUE */}
<TabsContent value="produtos">
  <Card className="bg-[#0c120f] border-white/5 p-6 rounded-[2.5rem]">
    <h3 className="text-xl font-black italic uppercase mb-6 flex items-center gap-2">
      <Package className="text-[#22c55e]" /> Controle de Estoque e Vendas
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {estoque.map(item => (
        <div key={item.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between">
          <div>
            <Badge className={item.tipo === 'venda' ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}>
              {item.tipo.toUpperCase()}
            </Badge>
            <p className="font-bold text-lg mt-2">{item.nome}</p>
            <p className="text-[#22c55e] font-black">R$ {item.preco.toFixed(2)}</p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-xs font-bold text-gray-500 uppercase">Estoque: {item.qtd}</span>
            <Button 
  className="bg-white/10 hover:bg-[#22c55e] hover:text-black transition-all"
  onClick={() => adicionarAoCarrinho(item)}
>
  Vender/Alugar
</Button>
          </div>
        </div>
      ))}
    </div>
  </Card>
</TabsContent>

{/* ALERTAS/OBS */}
<TabsContent value="alertas">
  <Card className="bg-[#0c120f] border-white/5 p-6 rounded-[2.5rem]">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-black italic uppercase flex items-center gap-2">
        <BellRing className="text-yellow-500" /> Alertas e Observações
      </h3>
      <Button onClick={() => { setNovoAlertaForm({ cliente_id: "", tipo: "neutra", observacao: "" }); setModalNovoAlertaAberto(true); }} className="bg-[#22c55e] text-black font-black rounded-xl">+ NOVO ALERTA</Button>
    </div>
    <div className="space-y-3">
      {alertas.map(alerta => (
        <div key={alerta.id} className={cn(
          "p-4 rounded-2xl border flex items-start gap-4",
          alerta.tipo === "negativa" ? "bg-red-500/5 border-red-500/20" : alerta.tipo === "positiva" ? "bg-[#22c55e]/5 border-[#22c55e]/20" : "bg-blue-500/5 border-blue-500/20"
        )}>
          <div className={alerta.tipo === "negativa" ? "text-red-500" : alerta.tipo === "positiva" ? "text-[#22c55e]" : "text-blue-400"}>
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="font-black uppercase text-sm">{alerta.cliente}</p>
            <p className="text-sm text-gray-400 italic">"{alerta.obs}"</p>
          </div>
        </div>
      ))}
    </div>
    <Dialog open={modalNovoAlertaAberto} onOpenChange={setModalNovoAlertaAberto}>
      <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
        <DialogHeader><DialogTitle className="italic uppercase font-black">Criar novo alerta</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500">Cliente</label>
            <Select value={novoAlertaForm.cliente_id} onValueChange={v => setNovoAlertaForm(prev => ({ ...prev, cliente_id: v }))}>
              <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>
                {clientes.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.nome} – {c.telefone}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500">Tipo</label>
            <Select value={novoAlertaForm.tipo} onValueChange={v => setNovoAlertaForm(prev => ({ ...prev, tipo: v as "positiva" | "negativa" | "neutra" }))}>
              <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="positiva">Positiva (boa)</SelectItem>
                <SelectItem value="negativa">Negativa (ruim)</SelectItem>
                <SelectItem value="neutra">Neutra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500">Observação</label>
            <Textarea value={novoAlertaForm.observacao} onChange={e => setNovoAlertaForm(prev => ({ ...prev, observacao: e.target.value }))} className="bg-white/5 border-white/10 mt-1 min-h-[80px]" placeholder="Descreva a observação..." />
          </div>
          <Button className="w-full bg-[#22c55e] text-black font-black" onClick={() => {
            if (!novoAlertaForm.cliente_id || !novoAlertaForm.observacao.trim()) { toast({ variant: "destructive", title: "Preencha cliente e observação." }); return; }
            fetch(`${API}/observacoes-clientes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cliente_id: Number(novoAlertaForm.cliente_id), tipo: novoAlertaForm.tipo, observacao: novoAlertaForm.observacao.trim(), funcionario_id: Number(localStorage.getItem("userId") || 1) }) })
              .then(r => r.json()).then(() => { toast({ title: "Alerta criado!" }); setModalNovoAlertaAberto(false); fetch(`${API}/observacoes-clientes`).then(r => r.json()).then((rows: any[]) => setAlertas((rows || []).map((o: any) => ({ id: o.id, cliente: o.cliente_nome, cliente_id: o.cliente_id, obs: o.observacao, tipo: o.tipo || "neutra" })))); }).catch(() => toast({ variant: "destructive", title: "Erro ao criar alerta." }));
          }}>Salvar alerta</Button>
        </div>
      </DialogContent>
    </Dialog>
  </Card>
</TabsContent>

          {/* ABA CLIENTES: BLACKLIST E COMENTÁRIOS */}
          <TabsContent value="clientes">
  <Card className="bg-[#0c120f] border-white/5 p-8 rounded-[2.5rem]">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h3 className="text-2xl font-black italic uppercase">Gestão de Atletas</h3>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Total de {clientes.length} cadastrados</p>
      </div>
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        <Input 
          placeholder="Buscar por nome ou fone..." 
          className="pl-10 bg-white/5 border-white/10 rounded-xl" 
          onChange={(e) => setFiltroNome(e.target.value)} 
        />
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      {clientes
        .filter(c => c.nome.toLowerCase().includes(filtroNome.toLowerCase()) || c.telefone.includes(filtroNome))
        .map(c => {
          // Verificamos se este card específico está em modo de edição
          const isEditando = editandoId === c.id;

          function handleToggleAlerta(id: number): void {
            throw new Error("Function not implemented.");
          }

          function handleSalvarObs(id: number, novaObs: string) {
            throw new Error("Function not implemented.");
          }

          return (
            <div key={c.id} className={cn(
              "p-6 rounded-[2.5rem] border transition-all duration-300",
              c.status === "ruim" 
                ? "bg-red-500/5 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.05)]" 
                : "bg-white/5 border-white/10"
            )}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-full border",
                    c.status === "ruim" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/5 border-white/10 text-gray-400"
                  )}>
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="font-black uppercase italic leading-none">{c.nome}</p>
                    <p className="text-[10px] text-gray-500 font-bold mt-1">{c.telefone}</p>
                  </div>
                </div>
                {c.isVip && (
                  <Badge className="bg-[#22c55e] text-black font-black text-[9px] px-3 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                    VIP
                  </Badge>
                )}
              </div>

              {/* ÁREA DE OBSERVAÇÃO DINÂMICA */}
              <div className={cn(
                "p-4 rounded-2xl border transition-all",
                isEditando ? "bg-black/60 border-[#22c55e]/50" : "bg-black/40 border-white/5"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black text-gray-500 uppercase flex items-center gap-1">
                    <MessageSquare size={10} /> Nota do Atendente
                  </p>
                </div>
                
                {isEditando ? (
                  <textarea
                    className="w-full bg-transparent text-sm italic text-[#22c55e] outline-none resize-none h-20"
                    defaultValue={c.obs}
                    id={`obs-${c.id}`}
                    autoFocus
                  />
                ) : (
                  <p className="text-xs italic text-gray-400 leading-relaxed">"{c.obs}"</p>
                )}
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={() => {
                    if (isEditando) {
                      const novaObs = (document.getElementById(`obs-${c.id}`) as HTMLTextAreaElement).value;
                      handleSalvarObs(c.id, novaObs);
                    } else {
                      setEditandoId(c.id)
                    }
                  }}
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "w-full border-white/10 text-[10px] font-black uppercase h-10 rounded-xl",
                    isEditando && "bg-[#22c55e] text-black border-[#22c55e] hover:bg-[#1da850]"
                  )}
                >
                  {isEditando ? "Salvar" : "Editar Nota"}
                </Button>

                <Button 
                  onClick={() => handleToggleAlerta(c.id)}
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "w-full text-[10px] font-black uppercase h-10 rounded-xl transition-all",
                    c.status === "ruim" 
                      ? "bg-red-500 text-white border-red-500 hover:bg-red-600" 
                      : "text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10"
                  )}
                >
                  <AlertTriangle size={12} className="mr-1" />
                  {c.status === "ruim" ? "Remover Alerta" : "Marcar Alerta"}
                </Button>
              </div>
            </div>
          );
        })}
    </div>
  </Card>
</TabsContent>

          {/* ABA VIP/FIXO: PRÉ-RESERVA */}
<TabsContent value="vip">
  <Card className="bg-[#0c120f] border-white/5 p-8 rounded-[2.5rem]">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-black italic uppercase flex items-center gap-3">
        <Crown className="text-[#22c55e]" /> Horários Fixos (Mensalistas)
      </h3>

      {/* MODAL DE NOVO VIP INTEGRADO AO BOTÃO */}
      <Dialog open={isModalVipAberto} onOpenChange={setIsModalVipAberto}>
        <DialogTrigger asChild>
          <Button className="bg-[#22c55e] hover:bg-[#1da850] text-black font-black uppercase gap-2 px-6 h-12 rounded-2xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <Plus size={18} strokeWidth={3} /> NOVO VIP
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2.5rem] max-w-lg p-8">
          <DialogHeader>
            <DialogTitle className="italic uppercase flex items-center gap-3 text-2xl font-black">
              <Crown className="text-[#22c55e]" size={24} /> Cadastrar Mensalista
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nome do Atleta / Grupo</label>
              <Input 
                id="vip-nome"
                placeholder="Ex: João Silva (Pelada dos Amigos)" 
                className="bg-white/5 border-white/10 h-14 rounded-xl focus:border-[#22c55e]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Dia Fixo</label>
  {/* Removido o 'id'. O defaultValue vai no Select, e usamos onValueChange para capturar o valor */}
  <Select defaultValue="SEG" onValueChange={(value) => setNovoVip({ ...novoVip, dia: value })}>
    <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-xl text-white">
      <SelectValue placeholder="Selecione o dia" />
    </SelectTrigger>
    <SelectContent className="bg-[#0c120f] border-white/10 text-white">
      {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map(d => (
        <SelectItem 
          key={d} 
          value={d} 
          className="focus:bg-[#22c55e] focus:text-black font-bold uppercase"
        >
          {d}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Horário</label>
                <Input id="vip-hora" type="time" defaultValue="19:00" className="bg-white/5 border-white/10 h-14 rounded-xl" />
              </div>
            </div>
            <Button 
              className="w-full bg-[#22c55e] text-black font-black uppercase h-16 rounded-2xl text-lg"
              onClick={() => {
                const nome = (document.getElementById('vip-nome') as HTMLInputElement).value;
                const hora = (document.getElementById('vip-hora') as HTMLInputElement).value;
                // Aqui você chamaria sua função de salvar
                setIsModalVipAberto(false);
              }}
            >
              ATIVAR HORÁRIO FIXO
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    {/* LISTA DE MENSALISTAS */}
    <div className="space-y-4">
      {/* Exemplo de Card de Mensalista Dinâmico */}
      {mensalistas.map((m) => (
        <div key={m.id} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex justify-between items-center group hover:border-[#22c55e]/30 transition-all">
  <div className="flex items-center gap-6">
    <div className="text-center bg-black/40 p-3 rounded-2xl min-w-[70px]">
      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Dia</p>
      <p className="text-xl font-black text-[#22c55e] italic">{m.dia}</p>
    </div>
    <div>
      <div className="flex items-center gap-2">
        <p className="font-black italic uppercase text-lg text-white">{m.nome}</p>
        <Badge className="bg-[#22c55e]/10 text-[#22c55e] text-[8px] font-black border-none">MENSALISTA</Badge>
      </div>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
        Toda {m.dia} às {m.horario} • {m.metodoPgto}
      </p>
    </div>
  </div>

  <div className="flex items-center gap-4">
    {/* Botão EDITAR */}
    <button 
      onClick={() => handleEditarMensalista(m)}
      className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors"
    >
      Editar
    </button>

    {/* Botão SUSPENDER */}
    <button 
      onClick={() => handleSuspenderMensalista(m.id)}
      className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors"
    >
      Suspender
    </button>
  </div>
        </div>
      ))}

      {mensalistas.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
          <p className="text-gray-600 italic font-bold">Nenhum mensalista fixo cadastrado.</p>
        </div>
      )}
    </div>
  </Card>
</TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const Separator = ({ className }: { className?: string }) => <div className={`h-[1px] w-full ${className}`} />;

export default AtendenteDashboard;

function setAgendaStatus(novaAgenda: any) {
  throw new Error("Function not implemented.");
}


function toast(arg0: { title: string; }) {
  throw new Error("Function not implemented.");
}


function setClientes(arg0: (prev: any) => any) {
  throw new Error("Function not implemented.");
}


function setEditandoId(arg0: null) {
  throw new Error("Function not implemented.");
}
function buscarMensalistas() {
  throw new Error("Function not implemented.");
}

