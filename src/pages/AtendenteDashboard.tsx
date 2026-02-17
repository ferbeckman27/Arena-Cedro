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
  Bell, ChevronLeft, ChevronRight, Crown, Plus, Search, DollarSign
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

  // Dados Simulados (Em um app real viriam do Banco/API)
  const produtos = [
    { id: 1, nome: "Gatorade", preco: 10 },
    { id: 2, nome: "Água 500ml", preco: 5 },
    { id: 3, nome: "Aluguel Colete", preco: 8 },
    { id: 4, nome: "Bola Penalty S11", preco: 120 }
  ];

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

const handleAgendar = (horaInicio: string, clienteNome: string) => {
    if (!clienteNome) return toast({ variant: "destructive", title: "Nome obrigatório" });
    
    const duracaoMin = parseInt(duracao, 10);
    if (!verificarDisponibilidade(horaInicio, duracaoMin)) {
      return toast({ variant: "destructive", title: "Conflito de Horário!", description: "Este período invade uma reserva existente." });
    }

    const horaH = parseInt(horaInicio.split(":")[0]);
    const valorBase = horaH >= 18 ? 120 : 80;
    const valorReserva = valorBase * (duracaoMin / 60);
    const totalProdutos = itensTemp.reduce((acc, item) => acc + item.preco, 0);
    const totalGeral = valorReserva + totalProdutos;

    // Regra de Pagamento
    const valorSinal = metodoPgto === "pix" ? totalGeral * 0.5 : totalGeral;

    const idDataRaiz = `${diaSelecionado.toDateString()}-${horaInicio}`;
    const slotsNecessarios = duracaoMin / 30;
    const novaAgenda = { ...agendaStatus };

    // Marca o slot principal e os slots subsequentes como "BLOQUEADO"
    for (let i = 0; i < slotsNecessarios; i++) {
    const indexBase = listaHorarios.indexOf(horaInicio);
    const horaOcupada = listaHorarios[indexBase + i];

    // Se a horaOcupada não existir (fim da lista), paramos o loop
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
      // Se quiser salvar os itens apenas no primeiro bloco:
      itens: i === 0 ? itensTemp : [] 
    };
  }

    setAgendaStatus(novaAgenda);
    toast({ title: "Reserva Confirmada!" });
  };

  const limparHorario = (id: string) => {
    const reserva = agendaStatus[id];
    const novaAgenda = { ...agendaStatus };
    
    // Remove todos os slots vinculados a essa reserva
    Object.keys(novaAgenda).forEach(key => {
      if (novaAgenda[key].referenciaRaiz === (reserva.referenciaRaiz || id)) {
        delete novaAgenda[key];
      }
    });

    setAgendaStatus(novaAgenda);
    toast({ title: "Horário Liberado!" });
  };

// --- LÓGICA DE CONFLITO E BLOQUEIO ---
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
            <img src="/logo-arena.png" alt="Logo" className="w-40 h-40 object-contain" />
            <span className="text-[10px] font-black uppercase text-[#22c55e]">Painel Atendente Arena</span>
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
            {isMaintenance ? "ARENA OFFLINE" : "ARENA ONLINE"}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/5 w-full md:w-fit overflow-x-auto">
            <TabsTrigger value="agenda" className="px-6 font-bold uppercase italic">📅 Agenda Mensal</TabsTrigger>
            <TabsTrigger value="clientes" className="px-6 font-bold uppercase italic">👥 Clientes</TabsTrigger>
            <TabsTrigger value="vip" className="px-6 font-bold uppercase italic">👑 VIPs/Fixos</TabsTrigger>
          </TabsList>

          {/* ABA AGENDA: FORMATO FOLHINHA + AGENDAMENTO */}
          <TabsContent value="agenda" className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <Card className="bg-[#0c120f] border-white/5 overflow-hidden rounded-[2.5rem]">
                <div className="bg-[#22c55e] p-6 flex justify-between items-center text-black font-black uppercase">
                  <button onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() - 1)))}><ChevronLeft /></button>
                  <h2 className="italic">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesAtual)}</h2>
                  <button onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() + 1)))}><ChevronRight /></button>
                </div>
                <div className="grid grid-cols-7 p-4 gap-1">
                  {["D","S","T","Q","Q","S","S"].map(d => <div key={d} className="text-center text-[10px] text-gray-500 font-bold mb-2">{d}</div>)}
                  {diasMes.map((date, i) => (
                    <button
                      key={i}
                      disabled={!date}
                      onClick={() => date && setDiaSelecionado(date)}
                      className={cn(
                        "h-12 rounded-xl flex items-center justify-center font-black transition-all",
                        !date ? "opacity-0" : "hover:bg-[#22c55e]/20 border border-white/5",
                        date?.toDateString() === diaSelecionado.toDateString() ? "bg-[#22c55e] text-black" : "text-white"
                      )}
                    >
                      {date?.getDate()}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-black italic uppercase text-[#22c55e]">Horários: {diaSelecionado.toLocaleDateString()}</h3>
              <ScrollArea className="h-[450px] pr-4">
                <div className="space-y-3">
                  {Array.from({ length: 15 }, (_, i) => i + 8).map(h => {
                    const idAgendamento = `${diaSelecionado.toDateString()}-${h}`;
                    const reserva = agendaStatus[idAgendamento];
                    
                    return (
  <Dialog key={h} onOpenChange={() => { setItensTemp([]); setDuracao("60"); }}>
    <DialogTrigger asChild>
      <button className={cn(
        "w-full p-4 rounded-2xl border flex justify-between items-center transition-all",
        agendaStatus[`${diaSelecionado.toDateString()}-${h}`] 
          ? "bg-red-500/10 border-red-500 text-red-500" 
          : "bg-white/5 border-white/10 hover:border-[#22c55e]"
      )}>
        <span className="font-black italic">{h}</span>
        {agendaStatus[`${diaSelecionado.toDateString()}-${h}`] ? (
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase">
              {agendaStatus[`${diaSelecionado.toDateString()}-${h}`].cliente}
            </p>
            <Badge className="bg-red-500 text-white text-[8px]">OCUPADO</Badge>
          </div>
        ) : (
          <Plus size={18} className="text-[#22c55e]" />
        )}
      </button>
    </DialogTrigger>

    <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
      <DialogHeader>
        <DialogTitle className="italic uppercase">Novo Agendamento - {h}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-500">Nome do Cliente</label>
            {/* O ID AQUI DEVE SER O MESMO DO GETELEMENTBYID ABAIXO */}
            <Input placeholder="Ex: João Silva" className="bg-white/5 border-white/10" id={`atleta-${h}`} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-gray-500">Pagamento</label>
            <Select onValueChange={(val) => setMetodoPgto(val)} defaultValue="pix">
              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Forma" /></SelectTrigger>
              <SelectContent className="bg-[#0c120f] border-white/10 text-white">
                <SelectItem value="pix">PIX (50%)</SelectItem>
                <SelectItem value="money">Dinheiro (100%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-gray-500">Duração</label>
          <Select onValueChange={(val) => setDuracao(val)} defaultValue="60">
            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#0c120f] border-white/10 text-white">
              <SelectItem value="30">30 Minutos</SelectItem>
              <SelectItem value="60">1 Hora</SelectItem>
              <SelectItem value="90">1h 30min</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-white/5" />
        
        <h4 className="text-[10px] font-bold uppercase text-[#22c55e]">Oferecer Produto:</h4>
        <div className="grid grid-cols-2 gap-2">
          {produtos.map(p => (
            <Button 
              key={p.id} 
              variant="outline" 
              className="border-white/5 bg-white/5 text-[10px] justify-between"
              onClick={() => setItensTemp([...itensTemp, p])}
            >
              {p.nome} <span className="text-[#22c55e]">R$ {p.preco}</span>
            </Button>
          ))}
        </div>

        <Button 
  className="w-full bg-[#22c55e] text-black font-black uppercase h-14 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.2)]"
  onClick={() => {
    // Aqui garantimos que o ID use 'h' para bater com o Input
    const elemento = document.getElementById(`atleta-${h}`) as HTMLInputElement | null;
    const nomeAtleta = elemento?.value || "";
    
    // Passamos 'h' (que é a string do horário, ex: "08:00") e o nome
    handleAgendar(String(h), nomeAtleta);
  }}
>
  Confirmar Reserva e Gerar PIX
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

          {/* ABA CLIENTES: BLACKLIST E COMENTÁRIOS */}
          <TabsContent value="clientes">
            <Card className="bg-[#0c120f] border-white/5 p-8 rounded-[2.5rem]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h3 className="text-2xl font-black italic uppercase">Gestão de Atletas</h3>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                  <Input placeholder="Buscar por nome..." className="pl-10 bg-white/5 border-white/10" onChange={(e) => setFiltroNome(e.target.value)} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {clientes.filter(c => c.nome.toLowerCase().includes(filtroNome.toLowerCase())).map(c => (
                  <div key={c.id} className={cn(
                    "p-6 rounded-[2rem] border transition-all",
                    c.status === "ruim" ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/10"
                  )}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/5 rounded-full"><Users size={20} /></div>
                        <div>
                          <p className="font-black uppercase italic">{c.nome}</p>
                          <p className="text-xs text-gray-500 font-bold">{c.telefone}</p>
                        </div>
                      </div>
                      {c.isVip && <Badge className="bg-[#22c55e] text-black font-black">VIP</Badge>}
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Nota do Atendente:</p>
                      <p className="text-xs italic text-gray-300">"{c.obs}"</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="w-full border-white/10 text-xs">Editar</Button>
                      <Button variant="outline" size="sm" className={cn("w-full text-xs", c.status === "ruim" ? "text-red-500 border-red-500/20" : "text-yellow-500 border-yellow-500/20")}>
                        Marcar Alerta
                      </Button>
                    </div>
                  </div>
                ))}
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
                 <Button className="bg-[#22c55e] text-black font-bold uppercase italic"><Plus size={18} className="mr-2"/> Novo VIP</Button>
               </div>
               <div className="space-y-4">
                 <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Dia</p>
                        <p className="text-xl font-black text-[#22c55e] italic">SEG</p>
                      </div>
                      <div>
                        <p className="font-black italic uppercase text-lg">João Silva (VIP)</p>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Toda Segunda às 19:00 • Pago (Dinheiro)</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-red-500 font-bold uppercase text-xs">Suspender</Button>
                 </div>
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