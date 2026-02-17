import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Package, BarChart3, Calendar, Settings, 
  LogOut, ShieldCheck, Download, AlertOctagon, 
  UserCheck, Star, Search, DollarSign, Clock, 
  MessageSquare, AlertTriangle, FileText, TrendingUp, 
  Info, Plus, X, Check, ChevronLeft, ChevronRight
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

// --- MOCKS DE DADOS ---
const CLIENTES_VIP = [
  { id: 1, nome: "Racha do Morro", responsavel: "Carlos Silva", dia: "Segunda", hora: "20:00", status: "Pago" },
  { id: 2, nome: "Amigos do Edinho", responsavel: "Edson Jr", dia: "Quarta", hora: "19:00", status: "Atrasado" },
];

const PRODUTOS = [
  { id: 1, nome: "Bola S11 Pro", tipo: "Venda", preco: 180, estoque: 4 },
  { id: 2, nome: "Aluguel Colete", tipo: "Aluguel", preco: 5, estoque: 30 },
  { id: 3, nome: "Gatorade", tipo: "Venda", preco: 8, estoque: 45 },
];

const AdminDashboard = () => {
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
    { id: 1, autor: "Marcos Silva", texto: "Arena nota 10!", data: "15/02/2026" },
    { id: 2, autor: "Ricardo Souza", texto: "Melhor campo da região!", data: "16/02/2026" },
    { id: 3, autor: "Jhonny", texto: "Não gostei do atendimento", data: "17/02/2026" },
  ]);

  interface Depoimento {
  id: number;
  autor: string;
  texto: string;
  data: string;
}

  // --- GERADOR DE SLOTS DINÂMICOS ---
  const slotsCalculados = useMemo(() => {
    const slots = [];
    const janelas = [{ start: 8, end: 17.5, t: 'diurno', p: 80 }, { start: 18, end: 22.5, t: 'noturno', p: 120 }];
    janelas.forEach(j => {
      for (let hora = j.start; hora < j.end; hora += 0.5) {
        const h = Math.floor(hora);
        const m = (hora % 1) * 60;
        const dataFim = new Date(0, 0, 0, h, m + duracaoFiltro);
        slots.push({
          inicio: `${h.toString().padStart(2, '0')}:${m === 0 ? '00' : '30'}`,
          fim: `${dataFim.getHours().toString().padStart(2, '0')}:${dataFim.getMinutes().toString().padStart(2, '0')}`,
          turno: j.t,
          valor: j.p * (duracaoFiltro / 60),
          status: Math.random() > 0.8 ? 'reservado' : 'livre'
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
    setDepoimentos(prev => prev.filter(item => item.id !== id));
    
    toast({
      title: acao === 'aprovado' ? "Publicado!" : "Removido!",
      description: acao === 'aprovado' 
        ? "O comentário agora está visível no site." 
        : "O depoimento foi excluído permanentemente.",
      variant: acao === 'rejeitado' ? "destructive" : "default",
    });
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
              <img src="/logo-arena.png" alt="Logo" className="w-16 h-16 object-contain" />
              <span className="text-[8px] font-black uppercase text-[#22c55e] tracking-[0.2em]">Arena Cedro</span>
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
            <Button variant="ghost" className="text-red-500" onClick={() => navigate("/")}><LogOut size={20}/></Button>
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
          </TabsList>

          {/* CONTEÚDO AGENDA */}
          <TabsContent value="agenda" className="grid lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-4 bg-[#0c120f] border-white/5 rounded-[2.5rem] p-6">
              <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() - 1)))}><ChevronLeft/></Button>
                <h2 className="font-black uppercase italic">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesAtual)}</h2>
                <Button variant="ghost" onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() + 1)))}><ChevronRight/></Button>
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

          {/* ABA COMENTÁRIOS (DEPOIMENTOS) */}
          <TabsContent value="depoimentos">
            <Card className="bg-[#0c120f] border-white/5 p-6 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="text-[#22c55e]" size={28} />
                <h2 className="text-2xl font-black italic uppercase">Moderação de Comentários</h2>
              </div>
              
              <div className="grid gap-4">
                {depoimentos.length > 0 ? depoimentos.map((d) => (
                  <div key={d.id} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[#22c55e] font-black uppercase text-xs italic">{d.autor}</span>
                        <span className="text-[10px] text-gray-600 font-bold">{d.data}</span>
                      </div>
                      <p className="text-gray-300 italic text-sm">"{d.texto}"</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => gerenciarDepoimento(d.id, 'rejeitar')}
                        className="flex-1 md:flex-none border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-xl"
                      >
                        <X size={16} className="mr-1" /> Rejeitar
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => gerenciarDepoimento(d.id, 'aprovar')}
                        className="flex-1 md:flex-none bg-[#22c55e] text-black font-bold rounded-xl"
                      >
                        <Check size={16} className="mr-1" /> Aprovar
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20 text-gray-600">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="italic font-bold">Nenhum novo comentário para moderar.</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* ABA VIP */}
          <TabsContent value="vip">
            <Card className="bg-[#0c120f] border-white/5 rounded-[2rem] overflow-hidden">
              <Table>
                <TableHeader><TableRow className="border-white/5 uppercase font-bold text-[10px]">
                  <TableHead>Grupo</TableHead><TableHead>Dia/Hora</TableHead><TableHead>Financeiro</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {CLIENTES_VIP.map(vip => (
                    <TableRow key={vip.id} className="border-white/5">
                      <TableCell className="font-black italic">{vip.nome}</TableCell>
                      <TableCell>{vip.dia} às {vip.hora}</TableCell>
                      <TableCell><Badge className={vip.status === 'Pago' ? "bg-[#22c55e]" : "bg-red-500"}>{vip.status}</Badge></TableCell>
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
                         <TableHead className="text-right">Status</TableHead>
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
                         <TableCell className="text-right text-[10px] font-black text-gray-500">TURNO NOITE</TableCell>
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
};

export default AdminDashboard;