import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, Clock, Trophy, Star, 
  ShoppingBag, History, CheckCircle2 
} from "lucide-react";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { useToast } from "@/hooks/use-toast";
import { PaymentModal } from "@/components/booking/PaymentModal"; // Importe seu componente aqui

const ClientDashboard = () => {
  const { toast } = useToast();
  
  // Estados de Agendamento
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [duracao, setDuracao] = useState("60");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [totalReserva, setTotalReserva] = useState(0);
  
  // Estados do Modal e Histórico
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [minhasReservas, setMinhasReservas] = useState<any[]>([]);
  const [fidelidade, setFidelidade] = useState(7);

  // Cálculo de Preço Dinâmico
  useEffect(() => {
    if (!horarioInicio) return;
    const hora = parseInt(horarioInicio.split(":")[0]);
    const precoPorBloco = hora >= 18 ? 60 : 40; 
    const blocos = parseInt(duracao) / 30;
    setTotalReserva(precoPorBloco * blocos);
  }, [horarioInicio, duracao]);

  const handleOpenPayment = () => {
    if (!horarioInicio) {
      toast({ 
        title: "Horário não selecionado", 
        description: "Por favor, escolha um horário antes de prosseguir.",
        variant: "destructive"
      });
      return;
    }
    setSelectedSlot({ id: "1", time: horarioInicio, available: true });
    setIsPaymentOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#060a08] text-white p-4 md:p-8 space-y-6">
      
      {/* HEADER CLIENTE */}
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/10">
        <div>
          <h1 className="text-xl font-black uppercase italic">Olá, Jogador! ⚽</h1>
          <p className="text-[#22c55e] text-[10px] font-bold uppercase tracking-widest">Arena Cedro - Sua área exclusiva</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase font-bold">Status Fidelidade</p>
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            <span className="font-black italic text-white">{fidelidade}/10</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="agendar" className="w-full">
        <TabsList className="grid grid-cols-4 bg-white/5 border border-white/10 h-16 rounded-2xl mb-8">
          <TabsTrigger value="agendar" className="rounded-xl font-bold uppercase italic text-xs data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Agendar</TabsTrigger>
          <TabsTrigger value="produtos" className="rounded-xl font-bold uppercase italic text-xs data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Loja/Aluguel</TabsTrigger>
          <TabsTrigger value="reservas" className="rounded-xl font-bold uppercase italic text-xs data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Minhas Reservas</TabsTrigger>
          <TabsTrigger value="vip" className="rounded-xl font-bold uppercase italic text-xs data-[state=active]:bg-yellow-500 data-[state=active]:text-black">Área VIP</TabsTrigger>
        </TabsList>

        {/* ABA AGENDAR */}
        <TabsContent value="agendar" className="grid lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7 bg-white/5 border-white/10 p-6 rounded-[2rem]">
            <h3 className="font-black uppercase italic mb-4 flex items-center gap-2"><CalendarIcon className="text-[#22c55e]" /> 1. Escolha a Data</h3>
            <BookingCalendar isAdmin={false} onSelectDay={setSelectedDate} selectedDate={selectedDate} schedule={[]} />
            <div className="mt-6 flex gap-3">
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Livre</Badge>
              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pendente</Badge>
              <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Ocupado</Badge>
            </div>
          </Card>

          <Card className="lg:col-span-5 bg-white/5 border-white/10 p-6 rounded-[2rem] space-y-6">
            <h3 className="font-black uppercase italic flex items-center gap-2"><Clock className="text-[#22c55e]" /> 2. Configurar Horário</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500">Duração da Partida</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {["30", "60", "90"].map((m) => (
                    <Button 
                      key={m}
                      variant={duracao === m ? "default" : "outline"}
                      className={duracao === m ? "bg-[#22c55e] text-black border-none" : "border-white/10 text-white"}
                      onClick={() => setDuracao(m)}
                    >
                      {m} min
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500">Horário Disponível</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 mt-1 text-white outline-none"
                  onChange={(e) => setHorarioInicio(e.target.value)}
                  value={horarioInicio}
                >
                  <option value="">Selecione...</option>
                  <option value="09:00">09:00 (Diurno)</option>
                  <option value="19:00">19:00 (Noturno)</option>
                  <option value="20:00">20:00 (Noturno)</option>
                </select>
              </div>

              {totalReserva > 0 && (
                <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 p-4 rounded-2xl text-center">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total a pagar</p>
                  <h2 className="text-3xl font-black italic text-[#22c55e]">R$ {totalReserva.toFixed(2)}</h2>
                  <Button onClick={handleOpenPayment} className="w-full mt-4 bg-[#22c55e] text-black font-black uppercase italic hover:bg-[#1db053]">
                    Ir para Pagamento
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ABA PRODUTOS */}
        <TabsContent value="produtos">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { nome: "Bola Penalty S11", preco: 15, tipo: "aluguel" },
              { nome: "Kit Coletes (10un)", preco: 20, tipo: "aluguel" },
              { nome: "Gatorade 500ml", preco: 8, tipo: "venda" },
            ].map((prod, i) => (
              <Card key={i} className="bg-white/5 border-white/10 p-6 rounded-[2rem] hover:border-[#22c55e] transition-all group">
                <ShoppingBag className="text-gray-500 group-hover:text-[#22c55e] mb-4" />
                <h4 className="font-black uppercase italic text-white">{prod.nome}</h4>
                <p className="text-xs text-gray-500 uppercase">{prod.tipo}</p>
                <p className="text-xl font-black text-[#22c55e] mt-2">R$ {prod.preco.toFixed(2)}</p>
                <Button className="w-full mt-4 bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black font-bold uppercase text-[10px]">
                  Adicionar ao PIX
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ABA MINHAS RESERVAS */}
        <TabsContent value="reservas">
          <Card className="bg-white/5 border-white/10 p-6 rounded-[2rem]">
            <h3 className="font-black uppercase italic mb-6 flex items-center gap-2"><History className="text-[#22c55e]"/> Histórico</h3>
            <div className="space-y-4">
              {minhasReservas.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Nenhuma reserva recente encontrada.</p>
              ) : (
                minhasReservas.map((res, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#22c55e]/20 p-3 rounded-full"><CheckCircle2 className="text-[#22c55e]" /></div>
                      <div>
                        <p className="font-bold italic uppercase text-white">{res.horario}</p>
                        <p className="text-[10px] text-gray-500">{res.valor}</p>
                      </div>
                    </div>
                    <Badge className={res.status === "Pago" ? "bg-[#22c55e] text-black" : "bg-yellow-500 text-black"}>
                      {res.status.toUpperCase()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ABA VIP */}
        <TabsContent value="vip">
          <Card className="bg-yellow-500/5 border border-yellow-500/20 p-8 rounded-[3rem] text-center max-w-2xl mx-auto">
            <Star className="text-yellow-500 mx-auto mb-4" size={40} />
            <h2 className="text-2xl font-black uppercase italic text-yellow-500">Área VIP - Horário Fixo</h2>
            <p className="text-gray-400 text-sm mt-2 mb-6">Solicite um horário fixo semanal para sua equipe.</p>
            <Button className="bg-yellow-500 text-black font-black uppercase italic w-full hover:bg-yellow-600">Solicitar Proposta</Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* COMPONENTE DE PAGAMENTO (MODAL) */}
      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        slot={selectedSlot}
        date={selectedDate}
        duration={Number(duracao)}
        onConfirm={(metodo, valor) => {
          const novaReserva = {
            horario: `${horarioInicio} (${duracao}min)`,
            valor: `R$ ${valor.toFixed(2)}`,
            status: metodo === "pix" ? "Pendente" : "Confirmado"
          };
          setMinhasReservas([novaReserva, ...minhasReservas]);
          toast({ 
            title: "Sucesso!", 
            description: "Comprovante gerado e enviado para o seu WhatsApp." 
          });
        }}
      />
    </div>
  );
};

export default ClientDashboard;