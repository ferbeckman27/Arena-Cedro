import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, Calendar as LucideCalendar, ShoppingBag, AlertTriangle, 
  LogOut, CheckCircle, XCircle, Megaphone, Star, MessageSquare, Trophy, Bell 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AtendenteDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- ESTADOS ---
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [agendaStatus, setAgendaStatus] = useState<Record<number, string>>({});

  // Sincronizar estados iniciais ao carregar a página
  useEffect(() => {
    const manutencaoSalva = localStorage.getItem("arena_manutencao") === "true";
    setIsMaintenance(manutencaoSalva);

    const agendaSalva = localStorage.getItem("arena_agenda");
    if (agendaSalva) {
      setAgendaStatus(JSON.parse(agendaSalva));
    }
  }, []);

  // --- SONS ---
  const playWhistle = () => {
    // Certifique-se que o arquivo está em public/sounds/apito.mp3
    new Audio('/sound/apito.mp3').play().catch(() => console.log("Som: Apito!"));
  };

  const playGoal = () => {
    // Certifique-se que o arquivo está em public/sounds/torcida.mp3
    new Audio('/sound/torcida.mp3').play().catch(() => console.log("Som: Torcida!"));
  };

  // --- FUNÇÕES ---
  
  // 1. CONFIRMAR PAGAMENTO (Muda cor para Vermelho)
  const handleConfirmPayment = (hora: number) => {
    const novaAgenda = { ...agendaStatus, [hora]: 'reservado' };
    setAgendaStatus(novaAgenda);
    
    // Salva para o painel do cliente ler
    localStorage.setItem("arena_agenda", JSON.stringify(novaAgenda));
    
    playGoal();
    toast({
      title: "Pagamento Confirmado!",
      description: `O horário das ${hora}:00 agora está marcado como RESERVADO.`,
    });
  };

  // 2. ATIVAR MANUTENÇÃO (Trava site do cliente)
  const toggleMaintenance = () => {
    const novoStatus = !isMaintenance;
    setIsMaintenance(novoStatus);
    
    // Salva para o painel do cliente ler
    localStorage.setItem("arena_manutencao", novoStatus.toString());

    toast({
      variant: novoStatus ? "destructive" : "default",
      title: novoStatus ? "Modo Manutenção Ativo" : "Sistema Online",
      description: novoStatus ? "Clientes estão bloqueados de agendar." : "Agendamentos liberados.",
    });
  };

  const clientes = [
    { id: 1, nome: "João Silva", status: "bom", jogos: 8, obs: "Paga sempre no prazo, respeita as regras." },
    { id: 2, nome: "Ricardo Melo", status: "alerta", jogos: 3, obs: "Já faltou 2 vezes sem avisar e não pagou o aluguel da bola." }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white">
      <header className="border-b border-white/10 bg-black/60 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/media/logo-arena.png" className="w-12 h-12" />
            <div>
              <h1 className="text-lg font-black uppercase italic tracking-tighter text-[#22c55e]">Arena Cedro Admin</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={toggleMaintenance} 
              variant={isMaintenance ? "destructive" : "outline"}
              className={`font-bold text-xs ${isMaintenance ? 'animate-pulse' : ''}`}
            >
              <AlertTriangle size={16} className="mr-2" />
              {isMaintenance ? "Manutenção Ativa" : "Status: Normal"}
            </Button>
            <Button onClick={() => navigate("/login")} variant="ghost" size="icon" className="text-red-500">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="bg-white/5 w-full justify-start overflow-x-auto h-14 rounded-xl border border-white/10">
            <TabsTrigger value="agenda" className="font-bold uppercase italic">Agenda Geral</TabsTrigger>
            <TabsTrigger value="clientes" className="font-bold uppercase italic">Gestão de Clientes</TabsTrigger>
            <TabsTrigger value="vendas" className="font-bold uppercase italic">Vendas/Aluguel</TabsTrigger>
            <TabsTrigger value="vip" className="font-bold uppercase italic">Horários Fixos</TabsTrigger>
          </TabsList>

          <TabsContent value="agenda" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#121815] border-white/5 text-white">
                <CardHeader><CardTitle className="text-sm uppercase text-gray-400">Status em Tempo Real</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 bg-[#22c55e] rounded-full"/> Disponível</div>
                  <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 bg-yellow-500 rounded-full"/> Pendente (PIX)</div>
                  <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 bg-red-600 rounded-full"/> Reservado / Pago</div>
                </CardContent>
              </Card>
              
              <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 8).map(h => {
                  const status = agendaStatus[h] || (h === 14 ? 'pendente' : 'disponivel');
                  
                  return (
                    <Dialog key={h}>
                      <DialogTrigger asChild>
                        <button className={`p-4 rounded-xl border font-black text-sm transition-all
                          ${status === 'reservado' ? 'bg-red-600/20 border-red-600 text-red-500' : 
                            status === 'pendente' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 
                            'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e] hover:scale-105'}`}
                        >
                          {h}:00
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#121815] border-white/10 text-white">
                        <DialogHeader>
                          <DialogTitle className="italic uppercase">Gerenciar Horário: {h}:00</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-xs text-gray-400 uppercase font-bold">Status Atual</p>
                            <p className="text-lg font-black uppercase text-[#22c55e]">{status}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2">
                            {status !== 'reservado' && (
                              <Button className="bg-[#22c55e] text-black font-black uppercase" onClick={() => handleConfirmPayment(h)}>
                                <CheckCircle className="mr-2" size={18} /> Confirmar Pagamento
                              </Button>
                            )}
                            <Button variant="destructive" className="font-bold uppercase">
                              <XCircle className="mr-2" size={18} /> Cancelar Reserva
                            </Button>
                          </div>
                          <Separator className="bg-white/10" />
                          <p className="text-[10px] text-gray-500 font-bold uppercase italic">
                            Dica: Confirmar pagamento envia o PDF automaticamente para o cliente.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </div>
            </div>
          </TabsContent>
          
          {/* ... demais conteúdos das Tabs mantidos iguais ... */}
          <TabsContent value="clientes">
            <Card className="bg-[#121815] border-white/5 text-white p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black italic uppercase">Gestão de Atletas</h3>
                <Button className="bg-[#22c55e] text-black font-bold">Cadastrar Novo</Button>
              </div>
              <div className="space-y-4">
                {clientes.map(c => (
                  <div key={c.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 p-3 rounded-full"><Users size={20} /></div>
                      <div>
                        <p className="font-bold">{c.nome} {c.status === "alerta" && "⚠️"}</p>
                        <p className="text-xs text-[#22c55e] font-bold">Fidelidade: {c.jogos}/10</p>
                      </div>
                    </div>
                    {c.status === "alerta" && (
                      <div className="max-w-[250px] text-right">
                        <Badge variant="destructive" className="mb-1 text-[9px]">BLACKLIST / ALERTA</Badge>
                        <p className="text-[10px] text-gray-400 italic">"{c.obs}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <div className="fixed bottom-4 left-4 flex gap-2">
         <Button onClick={playWhistle} size="sm" variant="secondary" className="rounded-full opacity-30 hover:opacity-100 bg-white/10 border-white/10">
           <Bell size={16} />
         </Button>
      </div>
    </div>
  );
};

const Separator = ({ className }: { className?: string }) => <div className={`h-[1px] w-full ${className}`} />;

export default AtendenteDashboard;