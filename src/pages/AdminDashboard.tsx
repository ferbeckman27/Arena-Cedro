import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Package, BarChart3, Calendar, Settings, 
  LogOut, ShieldCheck, Download, AlertOctagon, 
  UserCheck, Star, MoreHorizontal, Search, 
  DollarSign, Clock, MessageSquare, AlertTriangle, 
  FileText, TrendingUp, Info, Plus, X, Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- MOCKS DE DADOS ---
const CLIENTES_VIP = [
  { id: 1, nome: "Racha do Morro", responsavel: "Carlos Silva", dia: "Segunda", hora: "20:00", pagamento: "Mensal", status: "Pago" },
  { id: 2, nome: "Amigos do Edinho", responsavel: "Edson Jr", dia: "Quarta", hora: "19:00", pagamento: "Pendente", status: "Atrasado" },
];

const PRODUTOS = [
  { id: 1, nome: "Bola S11 Pro", tipo: "Venda", preco: 180, estoque: 4, vendidos: 12 },
  { id: 2, nome: "Aluguel Colete", tipo: "Aluguel", preco: 5, estoque: 30, alugados: 154 },
  { id: 3, nome: "Gatorade", tipo: "Venda", preco: 8, estoque: 45, vendidos: 89 },
];

const CONFIG_AGENDA = {
  diurno: { inicio: 8, fim: 17, preco: 80 },
  noturno: { inicio: 18, fim: 22, preco: 120 }
};

const PALAVRAS_BLOQUEADAS = [
  // Termos Gerais
  "Porra", "Merda", "Lixo", "Bosta", "Caralho", "Puta", "Putaria", 
  "Vagabundo", "Desgraça", "Inferno", "Cacete", "Fodase", "Foder",
  
  // Ofensas Diretas
  "Corno", "Otário", "Verme", "Inútil", "Escroto", "Ladrão", "Safado",
  
  // Variações e termos comuns em avaliações fakes
  "Lixo", "Horrível", "Péssimo", "Fraude", "Engano"
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [duracaoFiltro, setDuracaoFiltro] = useState(60); // 30, 60 ou 90 min 

// Função para gerar os slots com base na duração escolhida
// --- GERADOR DE SLOTS (30, 60, 90) ---
  const gerarSlots = () => {
    const slots = [];
    const janelas = [{ start: 8, end: 17.5, t: 'diurno' }, { start: 18, end: 22.5, t: 'noturno' }];
    janelas.forEach(j => {
      for (let hora = j.start; hora < j.end; hora += 0.5) {
        const h = Math.floor(hora);
        const m = (hora % 1) * 60;
        const dataFim = new Date(0, 0, 0, h, m + duracaoFiltro);
        slots.push({
          inicio: `${h.toString().padStart(2, '0')}:${m === 0 ? '00' : '30'}`,
          fim: `${dataFim.getHours().toString().padStart(2, '0')}:${dataFim.getMinutes().toString().padStart(2, '0')}`,
          turno: j.t,
          valor: (j.t === 'diurno' ? 80 : 120) * (duracaoFiltro / 60)
        });
      }
    });
    return slots;
  };

const slotsCalculados = useMemo(() => gerarSlots(), [duracaoFiltro]);

  // --- ESTADOS ---
  const [emManutencao, setEmManutencao] = useState(localStorage.getItem("arena_manutencao") === "true");
  const [selectedReserva, setSelectedReserva] = useState<any>(null);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date());
  const [promoAtiva, setPromoAtiva] = useState(localStorage.getItem("arena_promo_ativa") === "true");
  const [promoTexto, setPromoTexto] = useState(localStorage.getItem("arena_promo_texto") || "Promoção Relâmpago!");
  const [promoLink, setPromoLink] = useState(localStorage.getItem("arena_promo_link") || "");

  // --- CONTROLE DE MANUTENÇÃO ---
  const handleToggleManutencao = () => {
    const novoEstado = !emManutencao;
    setEmManutencao(novoEstado);
    localStorage.setItem("arena_manutencao", String(novoEstado));
    window.dispatchEvent(new Event('storage'));
    toast({
      variant: novoEstado ? "destructive" : "default",
      title: novoEstado ? "⚠️ SISTEMA BLOQUEADO" : "✅ SISTEMA LIBERADO",
      description: novoEstado ? "Clientes não podem agendar agora, campo em manutenção." : "Agendamentos voltaram ao normal.",
    });
  };

const salvarPromocao = () => {
  localStorage.setItem("arena_promo_ativa", String(promoAtiva));
  localStorage.setItem("arena_promo_texto", promoTexto);
  localStorage.setItem("arena_promo_link", promoLink);
  
  toast({
    title: "Campanha Atualizada!",
    description: promoAtiva ? "O pop-up está visível para os clientes." : "Pop-up desativado.",
  });
};

// Estado de Depoimentos
  const [depoimentos, setDepoimentos] = useState([
    { id: 1, autor: "Marcos Silva", texto: "Arena nota 10, iluminação incrível!", status: "pendente" },
    { id: 2, autor: "Jhonny", texto: "Este lugar é um lixo", status: "pendente" }, // Será pego pelo filtro
  ]);

// --- LÓGICA DO CALENDÁRIO (IGUAL AO ATENDENTE) ---
  const diasMes = useMemo(() => {
    const start = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const end = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const days = [];
    for (let i = 0; i < start.getDay(); i++) days.push(null);
    for (let i = 1; i <= end.getDate(); i++) days.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i));
    return days;
  }, [mesAtual]);

// --- MODERAÇÃO DE DEPOIMENTOS ---
  const aprovarDepoimento = (id: number, texto: string) => {
    const temPalavraBloqueada = ["lixo", "roubo", "palavrao"].some(p => texto.toLowerCase().includes(p));
    if (temPalavraBloqueada) {
      toast({ variant: "destructive", title: "Bloqueado!", description: "Contém palavras impróprias." });
      return;
    }
    setDepoimentos(depoimentos.map(d => d.id === id ? { ...d, status: "aprovado" } : d));
    toast({ title: "Aprovado!", description: "O depoimento agora é público." });
  };

const tocarApito = () => {
  const audio = new Audio('/sound/apito.mp3'); // Certifique-se que o arquivo está em public/sounds/apito.mp3
  audio.play().catch(e => console.log("Erro ao tocar áudio (interação necessária):", e));
};

// Monitora depoimentos pendentes
useEffect(() => {
  const pendentes = depoimentos.filter(d => d.status === "pendente").length;
  if (pendentes > 0) {
    tocarApito();
  }
}, [depoimentos.length]); // Toca sempre que um novo depoimento chegar

  // --- SIMULAÇÃO DE DOWNLOAD PDF ---
  const downloadRelatorio = (tipo: 'sintetico' | 'analitico') => {
    toast({ title: `Gerando PDF ${tipo}...`, description: "O download iniciará em instantes." });
  };

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans">
      
      {/* HEADER COM LOGO E NOME EMBAIXO */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <img src="/logo-arena.png" alt="Logo" className="w-40 h-40 object-contain" />
              <span className="text-[10px] font-black uppercase text-[#22c55e] mt-1 tracking-[0.3em]">ARENA CEDRO</span>
            </div>
          </div>

          <div className="flex gap-3">
             <Button variant="outline" className="border-[#22c55e] text-[#22c55e] text-[10px] font-black uppercase">
               <ShieldCheck className="mr-2" size={14}/> Painel Administrativo
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Gestão de Alto Nível</p>
             </Button>
             <Button variant="ghost" onClick={() => navigate("/")}><LogOut size={20}/></Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        
        {/* DASHBOARD GRID - STATS RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Receita Mensal", val: "R$ 18.450", icon: DollarSign, color: "text-[#22c55e]" },
            { label: "Jogos Realizados", val: "142", icon: Calendar, color: "text-blue-400" },
            { label: "Taxa VIP", val: "85%", icon: UserCheck, color: "text-purple-400" },
            { label: "Turno Líder", val: "Noturno", icon: TrendingUp, color: "text-orange-400" },
          ].map((stat, i) => (
            <Card key={i} className="bg-white/5 border-white/5 text-white overflow-hidden relative">
              <CardContent className="p-6">
                <stat.icon className={`absolute -right-2 -bottom-2 size-20 opacity-10 ${stat.color}`} />
                <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-black italic">{stat.val}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl w-full flex overflow-x-auto h-auto">
            <TabsTrigger value="agenda" className="flex-1 font-bold uppercase italic py-3">Agenda</TabsTrigger>
            <TabsTrigger value="estoque" className="flex-1 font-bold uppercase italic py-3">Produtos/Estoque</TabsTrigger>
            <TabsTrigger value="relatorios" className="flex-1 font-bold uppercase italic py-3">Relatórios</TabsTrigger>
            <TabsTrigger value="depoimentos" className="flex-1 font-bold uppercase italic py-3">Depoimentos</TabsTrigger>
          </TabsList>

          {/* --- ABA AGENDA INTERATIVA UNIFICADA --- */}
<TabsContent value="agenda" className="grid lg:grid-cols-12 gap-6">
  
  {/* COLUNA DA ESQUERDA: CALENDÁRIO (FOLHINHA) */}
  <div className="lg:col-span-4 space-y-4">
    <Card className="bg-[#0c120f] border-white/5 rounded-[2.5rem] overflow-hidden">
      {/* Cabeçalho do Calendário */}
      <div className="bg-[#22c55e] p-4 flex justify-between items-center text-black font-black uppercase italic">
        <button onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() - 1)))}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-sm">
          {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesAtual)}
        </h2>
        <button onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() + 1)))}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dias do Mês */}
      <div className="grid grid-cols-7 p-4 gap-1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-500 mb-2">{d}</div>
        ))}
        {diasMes.map((date, i) => (
          <button
            key={i}
            disabled={!date}
            onClick={() => date && setDiaSelecionado(date)}
            className={cn(
              "h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all",
              !date ? "opacity-0" : "hover:bg-[#22c55e]/20 border border-white/5",
              date?.toDateString() === diaSelecionado.toDateString() 
                ? "bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
                : "text-white"
            )}
          >
            {date?.getDate()}
          </button>
        ))}
      </div>
    </Card>

    {/* Info Auxiliar abaixo do calendário */}
    <Card className="bg-white/5 border-white/5 p-4 rounded-2xl">
      <p className="text-[10px] text-[#22c55e] font-bold uppercase mb-1">Status do Dia</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
        <p className="text-xs font-bold text-gray-300 italic">Preços: Diurno R$80 | Noturno R$120</p>
      </div>
    </Card>
  </div>

  {/* COLUNA DA DIREITA: LISTAGEM DE HORÁRIOS */}
  <div className="lg:col-span-8 space-y-4">
    <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 p-4 rounded-3xl border border-white/10 gap-4">
      <div>
        <h3 className="font-black uppercase italic text-lg leading-tight">
          Horários disponíveis
        </h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase italic">
          Selecionado: {diaSelecionado.toLocaleDateString('pt-BR')}
        </p>
      </div>
      
      {/* Seletor de Duração do Bloco */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
        {[30, 60, 90].map((min) => (
          <button
            key={min}
            onClick={() => setDuracaoFiltro(min)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
              duracaoFiltro === min ? 'bg-[#22c55e] text-black' : 'text-gray-500 hover:text-white'
            }`}
          >
            {min === 30 ? '30 Min' : min === 60 ? '1 Hora' : '1h 30m'}
          </button>
        ))}
      </div>
    </div>

    <ScrollArea className="h-[600px] pr-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {slotsCalculados.map((slot, i) => (
          <Dialog key={i}>
            <DialogTrigger asChild>
              <button className={cn(
                "p-4 rounded-2xl border transition-all text-left relative overflow-hidden group",
                slot.status === 'reservado' 
                  ? 'border-red-500/20 bg-red-500/5 opacity-60' 
                  : 'border-white/5 bg-white/5 hover:border-[#22c55e]/50'
              )}>
                <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                    "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                    slot.turno === 'diurno' ? 'bg-orange-500/20 text-orange-500' : 'bg-purple-500/20 text-purple-400'
                  )}>
                    {slot.turno}
                  </span>
                  <p className="text-[9px] font-black text-[#22c55e]">R$ {slot.valor.toFixed(2)}</p>
                </div>

                <p className="text-lg font-black leading-none">{slot.inicio}</p>
                <p className="text-[10px] font-bold text-gray-500 mt-1 italic">Até {slot.fim}</p>
                
                {slot.status === 'reservado' && (
                  <Badge className="absolute -right-2 -bottom-2 bg-red-500 text-[8px] rotate-[-12deg]">OCUPADO</Badge>
                )}
              </button>
            </DialogTrigger>

            <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black italic uppercase">
                  {slot.status === 'livre' ? 'Nova Reserva' : 'Detalhes da Partida'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5 text-sm">
                   <span>Data: <b>{diaSelecionado.toLocaleDateString()}</b></span>
                   <span>Turno: <b className="uppercase">{slot.turno}</b></span>
                </div>
                <div className="flex justify-between p-4 bg-[#22c55e]/10 rounded-2xl border border-[#22c55e]/20">
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-bold">Horário</p>
                    <p className="text-xl font-black italic">{slot.inicio} às {slot.fim}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-gray-400 font-bold">Valor</p>
                    <p className="text-xl font-black italic text-[#22c55e]">R$ {slot.valor.toFixed(2)}</p>
                  </div>
                </div>

                {slot.status === 'reservado' ? (
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                     <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Responsável</p>
                     <p className="font-black text-[#22c55e]">MENSALISTA: RACHA DO CEDRO</p>
                   </div>
                ) : (
                  <div className="space-y-3">
                    <Input placeholder="Nome do Cliente" className="bg-white/5 border-white/10" />
                    <Input placeholder="Telefone (WhatsApp)" className="bg-white/5 border-white/10" />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button className="w-full bg-[#22c55e] text-black font-black uppercase italic h-12">
                  {slot.status === 'livre' ? 'Confirmar Agendamento' : 'Editar Reserva'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </ScrollArea>
  </div>
</TabsContent>

          {/* --- ABA VIP & FIXOS --- */}
          <TabsContent value="vip">
            <Card className="bg-[#0c120f] border-white/5 text-white rounded-[2rem] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-6">
                <CardTitle className="italic uppercase">Contratos Fixos / VIP</CardTitle>
              </CardHeader>
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 uppercase font-bold text-[10px]">
                    <TableHead>Grupo/Time</TableHead>
                    <TableHead>Dia Semanal</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Financeiro</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CLIENTES_VIP.map(vip => (
                    <TableRow key={vip.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-black italic text-lg">{vip.nome}</TableCell>
                      <TableCell className="text-sm font-bold">{vip.dia} às {vip.hora}</TableCell>
                      <TableCell className="text-xs text-gray-400 font-bold uppercase">{vip.responsavel}</TableCell>
                      <TableCell>
                        <Badge className={vip.status === 'Pago' ? 'bg-[#22c55e] text-black' : 'bg-red-500'}>
                          {vip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon"><Settings size={18} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* --- ABA PRODUTOS --- */}
          <TabsContent value="produtos">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#0c120f] border-white/5 text-white rounded-[2rem]">
                <CardHeader><CardTitle className="italic uppercase">Inventário de Produtos</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {PRODUTOS.map(p => (
                    <div key={p.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-[#22c55e]/50 transition-all">
                      <div className="flex gap-4 items-center">
                        <div className="p-3 bg-black/40 rounded-xl group-hover:scale-110 transition-transform">
                          <Package className="text-[#22c55e]" />
                        </div>
                        <div>
                          <p className="font-bold uppercase text-sm">{p.nome}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{p.tipo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#22c55e]">R$ {p.preco}</p>
                        <p className={`text-[10px] font-bold uppercase ${p.estoque < 5 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                          Qtd: {p.estoque}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-[#0c120f] border-white/5 text-white rounded-[2rem]">
                <CardHeader><CardTitle className="italic uppercase">Financeiro de Produtos</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-end h-32 gap-1 px-4">
                    {[30, 80, 45, 90, 60, 100, 75].map((h, i) => (
                      <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-[#22c55e] rounded-t-lg opacity-40 hover:opacity-100 transition-opacity" />
                    ))}
                  </div>
                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Resumo de Vendas/Aluguéis</p>
                    <div className="flex justify-between text-2xl font-black italic">
                      <p>Total Acumulado</p>
                      <p className="text-[#22c55e]">R$ 3.840,00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ABA ESTOQUE / CADASTRO */}
          <TabsContent value="estoque">
            <Card className="bg-[#0c120f] border-white/5 p-6 rounded-[2.5rem]">
               <div className="flex justify-between mb-6">
                 <h2 className="text-2xl font-black italic uppercase">Gestão de Itens</h2>
                 <Dialog>
                   <DialogTrigger asChild><Button className="bg-[#22c55e] text-black font-black uppercase"><Plus className="mr-2"/> Novo Produto</Button></DialogTrigger>
                   <DialogContent className="bg-[#0c120f] text-white border-white/10 rounded-[2rem]">
                     <DialogHeader><DialogTitle className="italic">Cadastrar Produto</DialogTitle></DialogHeader>
                     <div className="space-y-4 mt-4">
                       <Input placeholder="Nome do Produto" className="bg-white/5" />
                       <div className="grid grid-cols-2 gap-2">
                         <Input placeholder="Preço R$" className="bg-white/5" />
                         <Input placeholder="Estoque Inicial" className="bg-white/5" />
                       </div>
                       <Button className="w-full bg-[#22c55e] text-black font-black uppercase">Salvar no Estoque</Button>
                     </div>
                   </DialogContent>
                 </Dialog>
               </div>
               <Table>
                 <TableHeader><TableRow className="border-white/5">
                   <TableHead>Item</TableHead><TableHead>Preço</TableHead><TableHead>Estoque</TableHead><TableHead>Ações</TableHead>
                 </TableRow></TableHeader>
                 <TableBody>
                   <TableRow className="border-white/5">
                     <TableCell className="font-bold">Gatorade 500ml</TableCell>
                     <TableCell className="text-[#22c55e]">R$ 10,00</TableCell>
                     <TableCell><Badge className="bg-orange-500">42 Unid.</Badge></TableCell>
                     <TableCell><Button variant="ghost" size="icon"><Settings size={16}/></Button></TableCell>
                   </TableRow>
                 </TableBody>
               </Table>
            </Card>
          </TabsContent>

          {/* ABA RELATÓRIOS (SINTÉTICO E ANALÍTICO) */}
          <TabsContent value="relatorios">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-[#0c120f] to-black border-white/10 p-8 rounded-[3rem] text-center">
                <BarChart3 size={40} className="mx-auto text-[#22c55e] mb-4" />
                <h3 className="text-xl font-black italic uppercase">Sintético</h3>
                <p className="text-xs text-gray-500 mb-6">Resumo rápido de faturamento e ocupação mensal.</p>
                <div className="p-4 bg-white/5 rounded-2xl mb-6 text-left border border-white/5">
                  <div className="flex justify-between mb-2"><span className="text-[10px] text-gray-400">Faturamento:</span> <span className="font-black">R$ 12.450</span></div>
                  <div className="flex justify-between"><span className="text-[10px] text-gray-400">Ocupação:</span> <span className="font-black">78%</span></div>
                </div>
                <Button className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14 rounded-2xl">Gerar PDF Sintético</Button>
              </Card>

              <Card className="bg-gradient-to-br from-[#0c120f] to-black border-white/10 p-8 rounded-[3rem] text-center">
                <FileText size={40} className="mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-black italic uppercase">Analítico</h3>
                <p className="text-xs text-gray-500 mb-6">Detalhamento por cliente, produto e método de pagamento.</p>
                <div className="p-4 bg-white/5 rounded-2xl mb-6 text-left border border-white/5">
                  <div className="flex justify-between mb-2"><span className="text-[10px] text-gray-400">Vendas Prod:</span> <span className="font-black">R$ 2.100</span></div>
                  <div className="flex justify-between"><span className="text-[10px] text-gray-400">Horas VIP:</span> <span className="font-black">45h</span></div>
                </div>
                <Button className="w-full bg-blue-500 text-white font-black uppercase italic h-14 rounded-2xl">Gerar PDF Analítico</Button>
              </Card>
            </div>
          </TabsContent>

          {/* ABA DEPOIMENTOS COM FILTRO DE PALAVRAS */}
          <TabsContent value="depoimentos">
            <Card className="bg-[#0c120f] border-white/5 p-6 rounded-[2.5rem]">
              <h2 className="text-2xl font-black italic uppercase mb-6 flex items-center gap-2">
                <MessageSquare className="text-[#22c55e]" /> Moderação de Feedbacks
              </h2>
              <div className="grid gap-4">
                {depoimentos.filter(d => d.status === "pendente").map(d => (
                  <div key={d.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-black text-[#22c55e] uppercase italic">{d.autor}</p>
                      <p className="text-sm italic text-gray-300 mt-1">"{d.texto}"</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setDepoimentos(depoimentos.filter(x => x.id !== d.id))} size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl">
                        <X size={16}/>
                      </Button>
                      <Button onClick={() => aprovarDepoimento(d.id, d.texto)} size="sm" className="bg-[#22c55e] text-black rounded-xl">
                        <Check size={16}/>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsTrigger value="marketing" className="flex-1 font-bold uppercase italic py-3">Promoções</TabsTrigger>

{/* CONTEÚDO DA ABA MARKETING */}
<TabsContent value="marketing">
  <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[3rem]">
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 bg-yellow-500/20 rounded-2xl text-yellow-500">
        <AlertTriangle size={32} />
      </div>
      <div>
        <h3 className="text-2xl font-black italic uppercase">Banner de Promoção</h3>
        <p className="text-gray-500 text-sm italic">Este anúncio aparecerá assim que o cliente abrir o site.</p>
      </div>
    </div>

    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
        <span className="font-bold uppercase text-xs">Ativar Pop-up no Site</span>
        <button 
          onClick={() => setPromoAtiva(!promoAtiva)}
          className={`w-14 h-7 rounded-full transition-all relative ${promoAtiva ? 'bg-[#22c55e]' : 'bg-gray-700'}`}
        >
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${promoAtiva ? 'left-8' : 'left-1'}`} />
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400">Mensagem do Banner</label>
        <Input 
          value={promoTexto} 
          onChange={(e) => setPromoTexto(e.target.value)}
          placeholder="Ex: 20% de Desconto na próxima reserva!" 
          className="bg-white/5 border-white/10 h-14 text-lg italic font-bold"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400">Link do Botão (Opcional)</label>
        <Input 
          value={promoLink}
          onChange={(e) => setPromoLink(e.target.value)}
          placeholder="https://wa.me/seu-numero" 
          className="bg-white/5 border-white/10"
        />
      </div>

      <Button onClick={salvarPromocao} className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform">
        Publicar Alterações
      </Button>
    </div>
  </Card>
</TabsContent>

          {/* --- ABA PERFORMANCE EQUIPE --- */}
          <TabsContent value="equipe">
            <Card className="bg-[#0c120f] border-white/5 text-white rounded-[2rem] overflow-hidden">
               <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 uppercase font-bold text-[10px]">
                    <TableHead>Atendente</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Nº Reservas</TableHead>
                    <TableHead>Total Recebido</TableHead>
                    <TableHead className="text-right">Fidelização</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { nome: "Bruna Oliveira", turno: "Noite", reservas: 89, valor: "7.800", pontos: 4.8 },
                    { nome: "Carla Souza", turno: "Tarde", reservas: 64, valor: "5.200", pontos: 4.5 }
                  ].map((at, i) => (
                    <TableRow key={i} className="border-white/5">
                      <TableCell className="font-black italic flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#22c55e] text-black flex items-center justify-center text-[10px]">{at.nome[0]}</div>
                        {at.nome}
                      </TableCell>
                      <TableCell><Badge variant="outline" className="border-[#22c55e] text-[#22c55e]">{at.turno}</Badge></TableCell>
                      <TableCell className="font-bold">{at.reservas}</TableCell>
                      <TableCell className="font-black text-[#22c55e]">R$ {at.valor}</TableCell>
                      <TableCell className="text-right flex justify-end gap-1">
                        <Star size={12} fill="currentColor" className="text-yellow-500" />
                        <span className="text-xs font-bold">{at.pontos}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* FOOTER */}
      <footer className="p-12 text-center text-gray-700">
        <p className="text-[10px] font-black uppercase tracking-widest italic">Arena Cedro Management System • 2026</p>
      </footer>
    </div>
  );
};

const Separator = ({ className, orientation }: { className?: string, orientation?: string }) => (
  <div className={`${className} ${orientation === 'vertical' ? 'w-[1px]' : 'h-[1px]'}`} />
);

export default AdminDashboard;