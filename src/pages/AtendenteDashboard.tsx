import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, MessageSquare, QrCode, 
  UserPlus, ShoppingBag, Search, CheckCircle, AlertCircle, Volume2 
} from "lucide-react";
import { DetalhamentoReserva } from "@/components/atendente/DetalhamentoReserva";
import { useToast } from "@/hooks/use-toast";

const AtendenteDashboard = () => {
  const { toast } = useToast();
  
  // 1. ESTADOS E REFS
  const [modalAberto, setModalAberto] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 2. CONFIGURAÇÃO DO SOM (APITO)
  useEffect(() => {
    // Certifique-se de colocar o arquivo em: public/sound/apito.mp3
    audioRef.current = new Audio("/sound/apito.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  const dispararAlerta = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.error("Erro ao tocar som:", err));
    }
    toast({
      title: "⚽ NOVA RESERVA RECEBIDA!",
      description: "Um novo PIX pendente apareceu no mapa de quadra.",
      className: "bg-yellow-500 text-black font-black border-none",
    });
  };

  // 3. DADOS SIMULADOS
  const horariosDia = [
    { hora: "08:00 - 09:00", status: "livre" },
    { hora: "09:00 - 10:00", status: "livre" },
    { 
      hora: "19:00 - 20:30", 
      status: "pendente", 
      cliente: "Novo Cliente (Site)", 
      telefone: "98900000000",
      pagamento: "PIX",
      valor: 120 
    },
    { 
      hora: "20:30 - 22:00", 
      status: "ocupado", 
      cliente: "Ricardo Oliveira (VIP)", 
      telefone: "98911111111",
      pagamento: "Mensalista",
      valor: 150
    },
  ];

  const abrirDetalhes = (dados: any) => {
    setReservaSelecionada(dados);
    setModalAberto(true);
  };

  return (
    <div className="min-h-screen bg-[#060a08] text-white p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LADO ESQUERDO: GESTÃO DE QUADRA */}
      <div className="lg:col-span-8 space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Operação Atendimento</h1>
            <p className="text-[#22c55e] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" /> Arena Aberta - Turno Atual
            </p>
          </div>
          <div className="flex gap-2">
            {/* BOTÃO DE TESTE DO ALERTA */}
            <Button 
              variant="outline" 
              onClick={dispararAlerta}
              className="border-white/10 bg-white/5 text-gray-400 hover:text-white rounded-xl"
            >
              <Volume2 size={18} />
            </Button>
            <Button className="bg-[#22c55e] hover:bg-[#1db053] text-black font-black uppercase italic gap-2 rounded-xl text-xs">
              <UserPlus size={18} /> Novo Cliente Manual
            </Button>
          </div>
        </header>

        <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-black uppercase italic flex items-center gap-2 text-lg">
              <Calendar className="text-[#22c55e]" /> Mapa de Quadra
            </h2>
            <div className="flex gap-2 text-[10px] font-bold uppercase">
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Livre</Badge>
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pendente</Badge>
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Ocupado</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {horariosDia.map((item, i) => (
              <Button 
                key={i} 
                variant="outline" 
                onClick={() => abrirDetalhes({
                  cliente: item.cliente || "Disponível",
                  telefone: item.telefone || "",
                  horario: item.hora,
                  status: item.status === "pendente" ? "Aguardando Confirmação" : "Confirmado",
                  valor: item.valor || 0,
                  pagamento: item.pagamento || "N/A"
                })}
                className={`h-28 flex flex-col items-center justify-center gap-1 border-white/10 transition-all rounded-2xl group
                  ${item.status === 'livre' ? 'bg-white/5 hover:border-[#22c55e]' : ''}
                  ${item.status === 'pendente' ? 'bg-yellow-500/5 border-yellow-500/30 hover:bg-yellow-500/10 border-dashed' : ''}
                  ${item.status === 'ocupado' ? 'bg-red-500/5 border-red-500/30 hover:bg-red-500/10' : ''}
                `}
              >
                {item.status === 'pendente' && <Badge className="bg-yellow-500 text-black text-[9px] mb-1 animate-bounce px-1">PIX PENDENTE</Badge>}
                {item.status === 'ocupado' && <Badge className="bg-red-500 text-white text-[9px] mb-1 px-1">OCUPADO</Badge>}
                
                <span className="text-[10px] text-gray-500 uppercase font-bold group-hover:text-white transition-colors">{item.hora}</span>
                <span className={`text-lg font-black italic ${item.status === 'livre' ? 'text-white' : 'text-gray-200'}`}>
                  {item.cliente ? item.cliente.split(' ')[0] : "LIVRE"}
                </span>
                
                {item.status === 'livre' && <span className="text-[9px] text-[#22c55e] font-black tracking-tighter italic">RESERVAR</span>}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-[#22c55e]/10 to-transparent border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-black uppercase italic mb-1 flex items-center gap-2 text-white">
              <Search size={16} className="text-[#22c55e]" /> Check-in de Jogador
            </h3>
            <p className="text-[10px] text-gray-500 uppercase">Consultar histórico e fidelidade</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs flex-1 md:w-64 outline-none focus:border-[#22c55e]" placeholder="CPF ou Telefone..." />
            <Button className="bg-white text-black font-black uppercase text-[10px] px-6 rounded-xl hover:bg-[#22c55e] transition-all">Buscar</Button>
          </div>
        </Card>
      </div>

      {/* LADO DIREITO: FINANCEIRO E CONVENIÊNCIA */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] text-center border-b-4 border-b-[#22c55e]">
          <h2 className="font-black uppercase italic mb-6 flex items-center justify-center gap-2 text-xs">
            <QrCode className="text-[#22c55e]" size={16} /> Terminal de Cobrança
          </h2>
          <div className="bg-white p-4 rounded-3xl w-40 h-40 mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.15)] flex items-center justify-center">
              <QrCode size={110} className="text-black opacity-10" />
          </div>
          <div className="space-y-2">
            <Button className="w-full bg-[#22c55e] text-black font-black uppercase italic py-7 text-sm rounded-2xl shadow-lg hover:scale-[1.02] transition-transform">
              Gerar PIX Arena
            </Button>
            <Button variant="ghost" className="w-full text-[9px] text-gray-500 hover:text-white uppercase font-black">
              Confirmar Recebimento Manual
            </Button>
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem]">
          <h2 className="font-black uppercase italic mb-4 flex items-center gap-2 text-xs">
            <ShoppingBag size={18} className="text-[#22c55e]" /> PDV - Venda Rápida
          </h2>
          <div className="space-y-2">
             {[
               { n: "Água Mineral", v: "4,00" },
               { n: "Aluguel Kit Coletes", v: "15,00" },
               { n: "Gatorade (Sabores)", v: "8,50" }
             ].map((prod, i) => (
               <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#22c55e]/50 cursor-pointer transition-all group">
                  <span className="text-[10px] font-bold uppercase group-hover:text-[#22c55e]">{prod.n}</span>
                  <span className="font-black text-[#22c55e] text-xs font-mono">R$ {prod.v}</span>
               </div>
             ))}
          </div>
        </Card>

        <Card className="bg-yellow-500/5 border-yellow-500/20 p-5 rounded-[2rem]">
          <h3 className="text-[10px] font-black uppercase text-yellow-500 mb-3 flex items-center gap-2">
            <AlertCircle size={14} /> Notas do Atendimento
          </h3>
          <textarea 
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[11px] text-gray-400 h-24 resize-none focus:outline-none focus:border-yellow-500/50 transition-all" 
            placeholder="Anotações do turno..." 
          />
        </Card>
      </div>

      {/* MODAL DE DETALHAMENTO INTEGRADO */}
      {reservaSelecionada && (
        <DetalhamentoReserva 
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          reserva={reservaSelecionada}
        />
      )}
    </div>
  );
};

export default AtendenteDashboard;