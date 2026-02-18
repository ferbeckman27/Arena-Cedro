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
  BellRing
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

  const [isModalVipAberto, setIsModalVipAberto] = useState(false);
  const [novoVip, setNovoVip] = useState({
     nome: '',
     dia: 'SEG',
     horario: '19:00',
     pagamento: 'Dinheiro'
  });

  const [mensalistas, setMensalistas] = useState<Mensalista[]>([
  // Adicione um exemplo para teste ou deixe vazio []
  { id: 1, nome: "João Silva", dia: "SEG", horario: "19:00", metodoPgto: "Dinheiro" }
 ]);

  interface Mensalista {
  id: number;
  nome: string;
  dia: string;
  horario: string;
  metodoPgto: string;
  };

  // Dados Simulados (Em um app real viriam do Banco/API)
  const [estoque, setEstoque] = useState([
  { id: 1, nome: "Bola Penalty S11", tipo: "aluguel", preco: 15, qtd: 5 },
  { id: 2, nome: "Colete Arena (Unidade)", tipo: "aluguel", preco: 5, qtd: 30 },
  { id: 3, nome: "Água Mineral 500ml", tipo: "venda", preco: 4, qtd: 100 },
  { id: 4, nome: "Gatorade", tipo: "venda", preco: 8, qtd: 45 },
]);

const listaHorarios = useMemo(() => {
    const horas = [];
    for (let h = 8; h <= 22; h++) {
      horas.push(`${h < 10 ? '0'+h : h}:00`);
      horas.push(`${h < 10 ? '0'+h : h}:30`);
    }
    return horas;
  }, []);

  const [clientes, setClientes] = useState([
    { id: 1, nome: "João Silva", status: "bom", telefone: "98 9999-8888", obs: "Cliente antigo, nota 10. Sempre atencioso, educado, respeitando as regras da arena.", isVip: true },
    { id: 2, nome: "Ricardo Melo", status: "ruim", telefone: "98 7777-6666", obs: "Já causou confusão no campo, demorou para realizar pagamento, nao tem cuidado com os produtos alugados.", isVip: false }
  ]);

  const [alertas, setAlertas] = useState([
    { id: 1, cliente: "Marcos Silva", obs: "Sempre pede para ligar os refletores 10 min antes.", tipo: "info" },
    { id: 2, cliente: "Time do Tico", obs: "Costumam atrasar o pagamento do restante.", tipo: "alerta" },
    { id: 3, cliente: "Jhonny", obs: "Não gosta de ser cobrado, mesmo com atraso.", tipo: "rejeitado" },
  ]);

  useEffect(() => {
    const manutencaoSalva = localStorage.getItem("arena_manutencao") === "true";
    setIsMaintenance(manutencaoSalva);
    const agendaSalva = localStorage.getItem("arena_agenda");
    if (agendaSalva) setAgendaStatus(JSON.parse(agendaSalva));
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
  setIsMaintenance(novoStatus);
  
  // Isso salva no navegador para o cliente ler
  localStorage.setItem("arena_manutencao", novoStatus.toString());

  // Dispara um evento manual para a mesma aba também perceber a mudança (caso teste no mesmo navegador)
  window.dispatchEvent(new Event('storage'));

  toast({
    variant: novoStatus ? "destructive" : "default",
    title: novoStatus ? "⚠️ SISTEMA BLOQUEADO" : "✅ SISTEMA LIBERADO",
    description: novoStatus 
      ? "Os clientes agora visualizam a tela de manutenção." 
      : "O agendamento voltou ao normal.",
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
  setNovoVip(novoVip); // Preenche o estado com os dados atuais
  setIsModalVipAberto(true); // Abre o modal
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
          <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem] max-w-md">
            <DialogHeader>
              <DialogTitle className="italic uppercase flex items-center gap-2">
                <Plus className="text-[#22c55e]" size={18} /> Novo Jogo - {h} às {fimFormatado}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Nome do Atleta Responsável</label>
                <Input placeholder="Quem vai pagar?" className="bg-white/5 border-white/10 h-12" id={`atleta-${h}`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Pagamento</label>
                  {/* Select Code Here... */}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Duração</label>
                  <div className="h-12 flex items-center px-4 bg-white/5 border border-white/10 rounded-md text-sm font-bold text-[#22c55e]">
                    {duracao} MIN
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-[#22c55e] text-black font-black uppercase h-14 rounded-2xl"
                onClick={() => {
                  const input = document.getElementById(`atleta-${h}`) as HTMLInputElement;
                  handleAgendar(h, input?.value);
                }}
              >
                Confirmar e Gerar Comprovante
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
            <Button size="sm" className="bg-white/10 hover:bg-[#22c55e] hover:text-black rounded-lg h-8">Vender/Alugar</Button>
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
      <Button className="bg-[#22c55e] text-black font-black rounded-xl">+ NOVO ALERTA</Button>
    </div>
    <div className="space-y-3">
      {alertas.map(alerta => (
        <div key={alerta.id} className={cn(
          "p-4 rounded-2xl border flex items-start gap-4",
          alerta.tipo === 'alerta' ? "bg-red-500/5 border-red-500/20" : "bg-blue-500/5 border-blue-500/20"
        )}>
          <div className={alerta.tipo === 'alerta' ? "text-red-500" : "text-blue-400"}>
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="font-black uppercase text-sm">{alerta.cliente}</p>
            <p className="text-sm text-gray-400 italic">"{alerta.obs}"</p>
          </div>
        </div>
      ))}
    </div>
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
