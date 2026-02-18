import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Package, BarChart3, Calendar, Settings, 
  LogOut, ShieldCheck, Download, AlertOctagon, 
  UserCheck, Star, Search, DollarSign, Clock, 
  MessageSquare, AlertTriangle, FileText, TrendingUp, 
  Info, Plus, X, Check, ChevronLeft, ChevronRight,
  Trash2,
  CheckCircle2
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";


function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- ESTADOS ---
  const [duracaoFiltro, setDuracaoFiltro] = useState(60);
  const [emManutencao, setEmManutencao] = useState(localStorage.getItem("arena_manutencao") === "true");
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date());
  const [promoAtiva, setPromoAtiva] = useState(localStorage.getItem("arena_promo_ativa") === "true");
  const [promoTexto, setPromoTexto] = useState(localStorage.getItem("arena_promo_texto") || "Promoção Relâmpago!");
  const [promoLink, setPromoLink] = useState(localStorage.getItem("arena_promo_link") || "");
  const [depoimentos, setDepoimentos] = useState([
  { 
    id: 1, 
    autor: "Marcos Silva", 
    texto: "Arena nota 10!", 
    data: "15/02/2026", 
    status: "pendente" 
  },
  { 
    id: 2, 
    autor: "Ricardo Souza", 
    texto: "Melhor campo da região!", 
    data: "16/02/2026", 
    status: "aprovado" 
  },
  { 
    id: 3, 
    autor: "Jhonny", 
    texto: "Não gostei do atendimento", 
    data: "17/02/2026", 
    status: "rejeitado" 
  },
]);

  const [slotDetalhe, setSlotDetalhe] = useState<any>(null);
  const [isModalDetalheAberto, setIsModalDetalheAberto] = useState(false);

  const CLIENTES_VIP = [
  { id: 1, nome: "Racha do Morro", responsavel: "Carlos Silva", dia: "Segunda", hora: "20:00", status: "Pago" },
  { id: 2, nome: "Amigos do Edinho", responsavel: "Edson Jr", dia: "Quarta", hora: "19:00", status: "Atrasado" },
  { id: 3, nome: "Amigos da Bola", responsavel: "Jose Luis", dia: "Sexta", hora: "18:30", status: "Pago" },
];

const [produtos, setProdutos] = useState([
  { id: 1, nome: "Bola Nike", tipo: "Venda", preco: 180, estoque: 4 },
  { id: 2, nome: "Aluguel Colete", tipo: "Aluguel", preco: 8, estoque: 40 },
  { id: 3, nome: "Gatorade", tipo: "Venda", preco: 10, estoque: 100 },
  { id: 4, nome: "Bola Penalty S11", tipo: "aluguel", preco: 15, estoque: 5 },
  { id: 5, nome: "Água Mineral 500ml", tipo: "venda", preco: 4, estoque: 200 },
]);


  interface Depoimento {
    id: number;
    autor: string;
    texto: string;
    data: string;
    status: 'pendente' | 'aprovado' | 'rejeitado'; // Tipagem estrita
  }

  const playApito = () => {
    const audio = new Audio('/sound/apito.mp3'); // Caminho da sua pasta media
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Erro ao tocar som:", e));
  };

  useEffect(() => {
    const pendentes = depoimentos.filter(d => d.status === 'pendente').length;

    // Se houver depoimentos pendentes, toca o apito para alertar o Admin
    if (pendentes > 0) {
      playApito();
    }
  }, [depoimentos.length]);

  useEffect(() => {
  const pendentes = depoimentos.filter(d => d.status === 'pendente').length;
  
  // Se o número de pendentes aumentou, toca o apito (feedback de nova tarefa)
  if (pendentes > 0) {
    const audio = new Audio('/sound/apito.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Aguardando interação para tocar som."));
  }
}, [depoimentos.filter(d => d.status === 'pendente').length]);

  // --- GERADOR DE SLOTS DINÂMICOS ---
  const slotsCalculados = useMemo(() => {
    const slots = [];
    const janelas = [{ start: 8, end: 17.5, t: 'diurno', p: 80 }, { start: 18, end: 22.5, t: 'noturno', p: 120 }];
    janelas.forEach(j => {
      for (let hora = j.start; hora < j.end; hora += 0.5) {
        const h = Math.floor(hora);
        const m = (hora % 1) * 60;
        const dataFim = new Date(0, 0, 0, h, m + duracaoFiltro);
        const isReservado = Math.random() > 0.5;
        slots.push({
          inicio: `${h.toString().padStart(2, '0')}:${m === 0 ? '00' : '30'}`,
          fim: `${dataFim.getHours().toString().padStart(2, '0')}:${dataFim.getMinutes().toString().padStart(2, '0')}`,
          turno: j.t,
          valor: j.p * (duracaoFiltro / 60),
          status: Math.random() > 0.8 ? 'reservado' : 'livre',
          reserva: isReservado ? {
            cliente: "Racha do tico",
            quemFeu: Math.random() > 0.5 ? "Atendente Bruna" : "Cliente (Site)",
            pagamento: "PIX",
            isVip: Math.random() > 0.7,
            obs: "Cliente chato com o horário, não deixar passar nem 1 minuto."
          } : null
        });
      }
    });
    return slots;
  }, [duracaoFiltro]);

  // --- LÓGICA DE MANUTENÇÃO ---
  const handleToggleManutencao = () => {
    const novoEstado = !emManutencao;
    setEmManutencao(novoEstado);
    localStorage.setItem("arena_manutencao", String(novoEstado));
    toast({
      variant: novoEstado ? "destructive" : "default",
      title: novoEstado ? "SISTEMA BLOQUEADO" : "SISTEMA ONLINE",
      description: novoEstado ? "Clientes verão o aviso de manutenção." : "Agendamentos liberados.",
    });
  };

  const salvarPromocao = () => {
    localStorage.setItem("arena_promo_ativa", String(promoAtiva));
    localStorage.setItem("arena_promo_texto", promoTexto);
    localStorage.setItem("arena_promo_link", promoLink);
    toast({ title: "Marketing Atualizado!", description: "As alterações já estão no site." });
  };

  const aprovarDepoimento = (id: number) => {
    setDepoimentos(depoimentos.filter(d => d.id !== id));
    toast({ title: "Depoimento Aprovado!", description: "Visível agora para todos os clientes." });
  };

  const processarComentario = (id: number, acao: 'aprovado' | 'rejeitado') => {
  if (acao === 'rejeitado') {
    playApito(); // Toca o apito na rejeição (falta!)
    setDepoimentos(prev => prev.filter(item => item.id !== id));
  } else {
    setDepoimentos(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'aprovado' } : item
    ));
  }
  
  toast({
    title: acao === 'aprovado' ? "Publicado!" : "Removido!",
    description: acao === 'aprovado' ? "Visível no site." : "Excluído permanentemente.",
    variant: acao === 'rejeitado' ? "destructive" : "default",
  });
};

  const adicionarNovoComentarioParaAnalise = (autor: string, texto: string) => {
    const novo = {
      id: Date.now(),
      autor,
      texto,
      data: new Date().toLocaleDateString('pt-BR'),
      status: 'pendente' as const
    };

    setDepoimentos(prev => [...prev, novo]);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin"); // Exemplo de limpeza de auth
    toast({ title: "Saindo...", description: "Retornando à página inicial." });
    navigate("/");
  };

  // --- CALENDÁRIO ---
  const diasMes = useMemo(() => {
    const start = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const end = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const days = [];
    for (let i = 0; i < start.getDay(); i++) days.push(null);
    for (let i = 1; i <= end.getDate(); i++) days.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i));
    return days;
  }, [mesAtual]);

  function gerenciarDepoimento(id: number, arg1: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans pb-10">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <img src="/media/logo-arena.png" alt="Logo" className="w-60 h-60 object-contain" />
              <span className="text-[20px] font-black uppercase text-[#22c55e] tracking-[0.2em]">BEM VINDO AO PAINEL ADMINISTRATIVO</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <p className="text-[10px] font-black text-gray-500 uppercase italic">Status do Sistema</p>
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-bold", emManutencao ? "text-red-500" : "text-[#22c55e]")}>
                  {emManutencao ? "MANUTENÇÃO" : "OPERACIONAL"}
                </span>
                <Switch checked={emManutencao} onCheckedChange={handleToggleManutencao} />
              </div>
            </div>
            <Button variant="ghost" className="text-red-500" onClick={() => navigate("/")}><LogOut size={20} /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Receita Mensal", val: "R$ 18.450", icon: DollarSign, color: "text-[#22c55e]" },
            { label: "Ocupação", val: "85%", icon: TrendingUp, color: "text-blue-400" },
            { label: "Clientes VIP", val: "12", icon: Star, color: "text-yellow-500" },
            { label: "Alertas", val: "2 Pendentes", icon: AlertTriangle, color: "text-red-500" },
          ].map((stat, i) => (
            <Card key={i} className="bg-white/5 border-white/5 text-white">
              <CardContent className="p-6">
                <stat.icon className={`mb-2 ${stat.color}`} size={24} />
                <p className="text-[10px] uppercase font-bold text-gray-500">{stat.label}</p>
                <p className="text-2xl font-black italic">{stat.val}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 h-14 rounded-2xl w-full flex overflow-x-auto">
            <TabsTrigger value="agenda" className="flex-1 font-bold uppercase italic">Agenda</TabsTrigger>
            <TabsTrigger value="vip" className="flex-1 font-bold uppercase italic">VIPs</TabsTrigger>
            <TabsTrigger value="produtos" className="flex-1 font-bold uppercase italic">Produtos</TabsTrigger>
            <TabsTrigger value="marketing" className="flex-1 font-bold uppercase italic">Marketing</TabsTrigger>
            <TabsTrigger value="relatorios" className="flex-1 font-bold uppercase italic">Relatórios</TabsTrigger>
            <TabsTrigger value="equipe" className="flex-1 font-bold uppercase italic">Equipe</TabsTrigger>
            <TabsTrigger value="comentarios" className="px-6 font-bold uppercase italic">Depoimentos</TabsTrigger>
          </TabsList>

          {/* CONTEÚDO AGENDA */}
          <TabsContent value="agenda" className="grid lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-4 bg-[#0c120f] border-white/5 rounded-[2.5rem] p-6">
              <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() - 1)))}><ChevronLeft /></Button>
                <h2 className="font-black uppercase italic">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesAtual)}</h2>
                <Button variant="ghost" onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() + 1)))}><ChevronRight /></Button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {diasMes.map((date, i) => (
                  <button
                    key={i}
                    disabled={!date}
                    onClick={() => date && setDiaSelecionado(date)}
                    className={cn(
                      "h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all",
                      !date ? "opacity-0" : "hover:bg-[#22c55e]/20",
                      date?.toDateString() === diaSelecionado.toDateString() ? "bg-[#22c55e] text-black" : "text-white"
                    )}
                  >
                    {date?.getDate()}
                  </button>
                ))}
              </div>
            </Card>

            <div className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center bg-black/40 p-4 rounded-3xl border border-white/10">
                <p className="font-black italic uppercase">Horários: {diaSelecionado.toLocaleDateString()}</p>
                <div className="flex bg-white/5 p-1 rounded-xl">
                  {[30, 60, 90].map(m => (
                    <button key={m} onClick={() => setDuracaoFiltro(m)} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase", duracaoFiltro === m ? "bg-[#22c55e] text-black" : "text-gray-500")}>
                      {m} Min
                    </button>
                  ))}
                </div>
              </div>
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {slotsCalculados.map((slot, i) => (
                    <button key={i} className={cn("p-4 rounded-2xl border text-left transition-all", slot.status === 'reservado' ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/5")}>
                      <span className="text-[8px] font-black uppercase text-[#22c55e]">{slot.turno}</span>
                      <p className="text-xl font-black italic">{slot.inicio}</p>
                      <p className="text-[10px] font-bold text-gray-500 italic">R$ {slot.valor.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* ABA RELATÓRIOS (SINTÉTICO E ANALÍTICO) */}
          <TabsContent value="relatorios" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">

              {/* CARD RELATÓRIO SINTÉTICO (RESUMO) */}
              <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[3rem] border-t-4 border-t-[#22c55e]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase">Sintético</h3>
                    <p className="text-gray-500 text-xs italic">Resumo de desempenho mensal</p>
                  </div>
                  <BarChart3 className="text-[#22c55e]" size={32} />
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-sm font-bold text-gray-400">Faturamento Total</span>
                    <span className="text-xl font-black text-[#22c55e]">R$ 18.450,00</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Jogos Pagos</p>
                      <p className="text-lg font-black italic">142</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Média Diária</p>
                      <p className="text-lg font-black italic">R$ 615,00</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14 rounded-2xl">
                  Baixar PDF Sintético
                </Button>
              </Card>

              {/* CARD RELATÓRIO ANALÍTICO (DETALHADO) */}
              <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[3rem] border-t-4 border-t-blue-500">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase">Analítico</h3>
                    <p className="text-gray-500 text-xs italic">Detalhamento por categoria e setor</p>
                  </div>
                  <FileText className="text-blue-500" size={32} />
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <span className="text-gray-400">Venda de Produtos:</span>
                    <span className="font-bold">R$ 3.840,00</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <span className="text-gray-400">Contratos VIP (Fixos):</span>
                    <span className="font-bold">R$ 8.200,00</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <span className="text-gray-400">Horas Avulsas:</span>
                    <span className="font-bold">R$ 6.410,00</span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-400 pt-2 font-black">
                    <span>Taxa de Ocupação:</span>
                    <span>87.4%</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 text-white font-black uppercase italic h-14 rounded-2xl">
                  Baixar PDF Analítico
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* ABA PRODUTOS */}
<TabsContent value="produtos">
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-2xl font-black italic uppercase text-white flex items-center gap-3">
        <Package className="text-[#22c55e]" /> Inventário de Produtos
      </h3>
      <Button className="bg-[#22c55e] text-black font-black uppercase rounded-xl h-12">
        + CADASTRAR PRODUTO
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {produtos.map(p => (
        <Card key={p.id} className="bg-[#0c120f] border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group">
          <Badge className={cn(
            "absolute top-4 right-4 font-black italic",
            p.tipo === 'venda' ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
          )}>
            {p.tipo.toUpperCase()}
          </Badge>
          
          <div className="mt-4">
            <p className="text-xl font-black italic uppercase text-white">{p.nome}</p>
            <div className="flex justify-between items-end mt-6">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase">Preço Un.</p>
                <p className="text-2xl font-black text-[#22c55e]">R$ {p.preco.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase">Estoque</p>
                <p className={cn(
                  "text-xl font-black italic",
                  p.estoque < 10 ? "text-red-500" : "text-white"
                )}>{p.estoque} UN</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="outline" className="border-white/10 text-[10px] font-black uppercase">Editar</Button>
            <Button variant="outline" className="border-red-500/20 text-red-500 text-[10px] font-black uppercase">Excluir</Button>
          </div>
        </Card>
      ))}
    </div>
  </div>
</TabsContent>

          {/* ABA DEPOIMENTOS MODERADOS */}
          <TabsContent value="depoimentos">
            <div className="grid md:grid-cols-2 gap-6 outline-none">
              {['pendente', 'aprovado'].map((tipo) => (
                <Card key={tipo} className="bg-[#0c120f] border-white/5 p-8 rounded-[2.5rem] min-h-[500px]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black italic uppercase flex items-center gap-3">
                      {tipo === 'pendente' ? (
                        <><AlertTriangle className="text-yellow-500" size={24} /> Em Análise</>
                      ) : (
                        <><CheckCircle2 className="text-[#22c55e]" size={24} /> Publicados</>
                      )}
                    </h3>
                    <Badge className={cn(
                      "font-black px-3 py-1 rounded-full text-[10px]",
                      tipo === 'pendente' ? "bg-yellow-500/10 text-yellow-500" : "bg-[#22c55e]/10 text-[#22c55e]"
                    )}>
                      {depoimentos.filter(d => d.status === tipo).length}
                    </Badge>
                  </div>

                  <ScrollArea className="h-[450px] pr-4">
                    <div className="space-y-4">
                      {depoimentos.filter(d => d.status === tipo).length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] opacity-20">
                          <p className="italic font-bold">Nenhum item aqui</p>
                        </div>
                      ) : (
                        depoimentos.filter(d => d.status === tipo).map(d => (
                          <div key={d.id} className="p-5 bg-white/5 border border-white/10 rounded-[2rem] group hover:border-white/20 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-[10px] text-[#22c55e] font-black uppercase tracking-tighter">{d.autor}</p>
                                <p className="text-[9px] text-gray-500 font-bold">{d.data}</p>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => processarComentario(d.id, 'rejeitado')}
                                  className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-full"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm italic text-gray-300 leading-relaxed mb-4">"{d.texto}"</p>

                            <div className="flex gap-2">
                              {tipo === 'pendente' ? (
                                <Button
                                  onClick={() => processarComentario(d.id, 'aprovado')}
                                  className="w-full bg-[#22c55e] hover:bg-[#1da850] text-black font-black text-[10px] uppercase h-10 rounded-xl"
                                >
                                  <Check size={14} className="mr-2" /> Aprovar no Site
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => {
                                    // Função para voltar para pendente se precisar re-avaliar
                                    setDepoimentos(prev => prev.map(item => item.id === d.id ? { ...item, status: 'pendente' } : item));
                                  } }
                                  variant="outline"
                                  className="w-full border-white/10 text-gray-400 font-black text-[10px] uppercase h-10 rounded-xl hover:bg-white/5"
                                >
                                  Remover do Mural
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ABA VIP COM BOTÃO DE ENGRENAGEM */}
          <TabsContent value="vip">
            <Card className="bg-[#0c120f] border-white/5 rounded-[2rem] overflow-hidden">
              <Table>
                <TableHeader><TableRow className="border-white/5 uppercase font-black text-[10px]">
                  <TableHead>Grupo</TableHead><TableHead>Dia/Hora</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {[
                    { nome: "Amigos do Edinho", dia: "Qua", hora: "19:00", pgto: "Mensal/Dinheiro", resp: "Atendente Marcos", obs: "Sempre trazem colete próprio." },
                    { nome: "Racha do Morro", dia: "Seg", hora: "18:00",pgto: "Mensal/PIX", responsavel: "Carlos Silva", obs: "Grupo grande, sempre pontuais." },
                    { nome: "Escolinha do Pedro", dia: "Sex", hora: "14:00", pgto: "Mensal/Dinheiro", responsavel: "Atendente Bruna", obs: "Sempre trazem colete próprio e super responsaveis." },
                    { nome: "Amigos da Bola", dia: "Qui", hora: "18:30", pgto: "Mensal/PIX", responsavel: "Jose Luis", obs: "Sempre atrasam pagamentos, fazem confusão e nao tem cuidado com os coletes." },
                  ].map((vip, i) => (
                    <TableRow key={i} className="border-white/5">
                      <TableCell className="font-black italic uppercase">{vip.nome}</TableCell>
                      <TableCell>{vip.dia} às {vip.hora}</TableCell>
                      <TableCell><Badge className="bg-[#22c55e]">Em dia</Badge></TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild><Button variant="ghost" size="sm"><Settings size={18} className="text-[#22c55e]" /></Button></DialogTrigger>
                          <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
                            <DialogHeader><DialogTitle className="italic uppercase font-black">Dados do Cliente VIP</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div><p className="text-[10px] text-gray-500 font-black uppercase">Responsável pela Reserva</p><p className="font-bold">{vip.resp}</p></div>
                              <div><p className="text-[10px] text-gray-500 font-black uppercase">Modo de Pagamento</p><p className="font-bold">{vip.pgto}</p></div>
                              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                <p className="text-[10px] text-yellow-500 font-black uppercase flex items-center gap-2"><Info size={12} /> Alerta / Observação</p>
                                <p className="text-sm italic mt-1">"{vip.obs}"</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ABA MARKETING */}
          <TabsContent value="marketing">
            <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[3rem] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black italic uppercase">Banner de Promoção</h3>
                <Switch checked={promoAtiva} onCheckedChange={setPromoAtiva} />
              </div>
              <Input value={promoTexto} onChange={(e) => setPromoTexto(e.target.value)} className="bg-white/5 h-14 italic font-bold" placeholder="Texto da Promoção" />
              <Input value={promoLink} onChange={(e) => setPromoLink(e.target.value)} className="bg-white/5" placeholder="Link do Botão" />
              <Button onClick={salvarPromocao} className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14">Publicar Promoção</Button>
            </Card>
          </TabsContent>

          {/* ABA EQUIPE (SIMPLES E DIRETA) */}
          <TabsContent value="equipe">
            <Card className="bg-[#0c120f] border-white/5 rounded-[2.5rem] overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 text-[10px] uppercase font-black">
                    <TableHead>Atendente</TableHead>
                    <TableHead>Total de Vendas</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Reservas</TableHead>
                    <TableHead className="text-right">Turno</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-white/5">
                    <TableCell className="font-bold italic">Bruna Oliveira</TableCell>
                    <TableCell className="text-[#22c55e] font-black">R$ 7.840,00</TableCell>
                    <TableCell className="flex gap-1 items-center">
                      <Star size={12} fill="#eab308" className="text-yellow-500" />
                      <span className="text-xs font-black">4.9</span>
                    </TableCell>
                    <TableCell className="font-bold italic">142</TableCell>
                    <TableCell className="text-right text-[10px] font-black text-gray-500">DIURNO</TableCell>
                  </TableRow>
                  <TableRow className="border-white/5">
                    <TableCell className="font-bold italic">Marcos Silva</TableCell>
                    <TableCell className="text-[#22c55e] font-black">R$ 5.620,00</TableCell>
                    <TableCell className="flex gap-1 items-center">
                      <Star size={12} fill="#eab308" className="text-yellow-500" />
                      <span className="text-xs font-black">4.7</span>
                    </TableCell>
                    <TableCell className="font-bold italic">98</TableCell>
                    <TableCell className="text-right text-[10px] font-black text-gray-500">NOTURNO</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

        </Tabs>
      </main>

      <footer className="p-12 text-center text-gray-700">
        <p className="text-[10px] font-black uppercase tracking-widest italic">Arena Cedro Management System • 2026</p>
      </footer>
    </div>
  );
}

export default AdminDashboard;