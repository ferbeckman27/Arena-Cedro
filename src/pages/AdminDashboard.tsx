import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Package, BarChart3, Calendar, Settings, 
  LogOut, ShieldCheck, Download, AlertOctagon, 
  UserCheck, Star, MoreHorizontal, Search, 
  DollarSign, Clock, MessageSquare, AlertTriangle, 
  FileText, TrendingUp, Info
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [duracaoFiltro, setDuracaoFiltro] = useState(60); // 30, 60 ou 90 min 

// Função para gerar os slots com base na duração escolhida
const gerarSlots = () => {
  const slots = [];
  // Gera turnos (8h às 17h e 18h às 22h)
  const janelas = [
    { start: 8, end: 17.5, turno: 'diurno' }, 
    { start: 18, end: 22.5, turno: 'noturno' }
  ];

  janelas.forEach(janela => {
    for (let hora = janela.start; hora < janela.end; hora += 0.5) {
      const h = Math.floor(hora);
      const m = (hora % 1) * 60;
      const inicioFormatado = `${h.toString().padStart(2, '0')}:${m === 0 ? '00' : '30'}`;
      
      // Cálculo do fim baseado na duração (30, 60 ou 90 min)
      const dataFim = new Date(0, 0, 0, h, m + duracaoFiltro);
      const fimFormatado = `${dataFim.getHours().toString().padStart(2, '0')}:${dataFim.getMinutes().toString().padStart(2, '0')}`;
      
      const precoBase = janela.turno === 'diurno' ? 80 : 120;
      // Multiplicador de preço por tempo (ex: 1h30 custa 1.5x o valor)
      const valorFinal = (precoBase * (duracaoFiltro / 60));

      slots.push({
        inicio: inicioFormatado,
        fim: fimFormatado,
        turno: janela.turno,
        valor: valorFinal,
        status: Math.random() > 0.7 ? 'reservado' : 'livre' // Simulação
      });
    }
  });
  return slots;
};

const slotsCalculados = useMemo(() => gerarSlots(), [duracaoFiltro]);

  // --- ESTADOS ---
  const [emManutencao, setEmManutencao] = useState(localStorage.getItem("arena_manutencao") === "true");
  const [selectedReserva, setSelectedReserva] = useState<any>(null);

  // --- CONTROLE DE MANUTENÇÃO ---
  const handleToggleManutencao = () => {
    const novoEstado = !emManutencao;
    setEmManutencao(novoEstado);
    localStorage.setItem("arena_manutencao", String(novoEstado));
    toast({
      variant: novoEstado ? "destructive" : "default",
      title: novoEstado ? "Manutenção Ativada" : "Sistema Liberado",
      description: novoEstado ? "Clientes não podem agendar agora." : "Agendamentos voltaram ao normal.",
    });
  };

  // --- SIMULAÇÃO DE DOWNLOAD PDF ---
  const downloadRelatorio = (tipo: 'sintetico' | 'analitico') => {
    toast({ title: `Gerando PDF ${tipo}...`, description: "O download iniciará em instantes." });
  };

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans selection:bg-[#22c55e]/30">
      
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#22c55e] p-2 rounded-xl text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter">Admin <span className="text-[#22c55e]">Cedro</span></h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Gestão de Alto Nível</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={handleToggleManutencao}
              variant="outline" 
              className={`text-[10px] font-black uppercase border-white/10 h-10 px-4 ${emManutencao ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'hover:bg-white/5'}`}
            >
              <AlertOctagon size={16} className="mr-2" /> {emManutencao ? "Manutenção Ativa" : "Modo Manutenção"}
            </Button>
            <Separator orientation="vertical" className="h-6 bg-white/10" />
            <Button onClick={() => navigate("/login")} variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
              <LogOut size={22} />
            </Button>
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
            <TabsTrigger value="agenda" className="flex-1 font-bold uppercase italic py-3">Agenda Interativa</TabsTrigger>
            <TabsTrigger value="vip" className="flex-1 font-bold uppercase italic py-3">VIP & Fixos</TabsTrigger>
            <TabsTrigger value="estoque" className="flex-1 font-bold uppercase italic py-3">Estoque/Produtos</TabsTrigger>
            <TabsTrigger value="relatorios" className="flex-1 font-bold uppercase italic py-3">Relatórios</TabsTrigger>
            <TabsTrigger value="equipe" className="flex-1 font-bold uppercase italic py-3">Performance Equipe</TabsTrigger>
          </TabsList>

          {/* --- ABA AGENDA INTERATIVA --- */}
          <TabsContent value="agenda">
  <Card className="bg-black/40 border-white/5 text-white rounded-[2rem] overflow-hidden">
    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h3 className="font-black uppercase italic text-xl">Gestão de Horários</h3>
        <p className="text-[10px] text-[#22c55e] font-bold uppercase">Preços: Diurno R$80 | Noturno R$120 (Ref. 1h)</p>
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
            {min === 30 ? '30 Min' : min === 60 ? '1 Hora' : '1h 30min'}
          </button>
        ))}
      </div>
    </div>

    <ScrollArea className="h-[600px] p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {slotsCalculados.map((slot, i) => (
          <Dialog key={i}>
            <DialogTrigger asChild>
              <button className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden group
                ${slot.status === 'reservado' 
                  ? 'border-red-500/20 bg-red-500/5 opacity-60' 
                  : 'border-[#22c55e]/20 bg-white/5 hover:border-[#22c55e]/50'}`}>
                
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                    slot.turno === 'diurno' ? 'bg-orange-500/20 text-orange-500' : 'bg-purple-500/20 text-purple-400'
                  }`}>
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
                <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-bold">Horário Selecionado</p>
                    <p className="text-xl font-black italic">{slot.inicio} às {slot.fim}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-gray-500 font-bold">Valor Total</p>
                    <p className="text-xl font-black italic text-[#22c55e]">R$ {slot.valor.toFixed(2)}</p>
                  </div>
                </div>

                {slot.status === 'reservado' ? (
                  <>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Responsável</p>
                      <p className="font-black text-[#22c55e]">CLAUDIO OLIVEIRA (Atendente: Bruna)</p>
                    </div>
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                      <p className="text-[10px] uppercase text-red-500 font-bold mb-1 italic">Alerta do Sistema</p>
                      <p className="text-xs italic">"Cliente solicitou 12 coletes extras e bola oficial."</p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Input placeholder="Nome do Cliente" className="bg-white/5 border-white/10" />
                    <Input placeholder="Telefone" className="bg-white/5 border-white/10" />
                    <select className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-sm">
                      <option>Dinheiro (Local)</option>
                      <option>PIX Antecipado</option>
                      <option>Cortesia / Fidelidade</option>
                    </select>
                  </div>
                )}
              </div>

              <DialogFooter>
                {slot.status === 'livre' ? (
                  <Button className="w-full bg-[#22c55e] text-black font-black uppercase italic h-12">Confirmar Agendamento</Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button variant="outline" className="border-red-500 text-red-500 font-black uppercase italic">Cancelar</Button>
                    <Button className="bg-[#22c55e] text-black font-black uppercase italic">Editar</Button>
                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </ScrollArea>
  </Card>
</TabsContent>

          {/* --- ABA VIP & FIXOS --- */}
          <TabsContent value="vip">
            <Card className="bg-[#0c120f] border-white/5 text-white rounded-[2rem] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-6">
                <CardTitle className="italic uppercase">Contratos Fixos / VIP</CardTitle>
                <Button className="bg-[#22c55e] text-black font-bold text-xs uppercase">+ Novo VIP</Button>
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

          {/* --- ABA ESTOQUE --- */}
          <TabsContent value="estoque">
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

          {/* --- ABA RELATÓRIOS --- */}
          <TabsContent value="relatorios">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-[#0c120f] to-black border-white/10 text-white rounded-[3rem] p-8 text-center border-t-4 border-t-[#22c55e]">
                <BarChart3 size={48} className="mx-auto text-[#22c55e] mb-4" />
                <h3 className="text-2xl font-black italic uppercase mb-2">Relatório Sintético</h3>
                <p className="text-gray-500 text-sm mb-8 italic">Resumo de faturamento, reservas e turnos em uma única página.</p>
                <Button onClick={() => downloadRelatorio('sintetico')} className="w-full bg-[#22c55e] text-black font-black uppercase italic py-7 rounded-2xl shadow-xl">
                  Baixar Sintético (PDF)
                </Button>
              </Card>

              <Card className="bg-gradient-to-br from-[#0c120f] to-black border-white/10 text-white rounded-[3rem] p-8 text-center border-t-4 border-t-blue-500">
                <FileText size={48} className="mx-auto text-blue-500 mb-4" />
                <h3 className="text-2xl font-black italic uppercase mb-2">Relatório Analítico</h3>
                <p className="text-gray-500 text-sm mb-8 italic">Detalhado por cliente, produto, forma de pagamento e desempenho de equipe.</p>
                <Button onClick={() => downloadRelatorio('analitico')} className="w-full bg-blue-500 text-white font-black uppercase italic py-7 rounded-2xl shadow-xl">
                  Baixar Analítico (PDF)
                </Button>
              </Card>
            </div>
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