import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, Phone, Clock, CreditCard, AlertTriangle, 
  Trash2, CheckCircle2, MessageSquare, Tag 
} from "lucide-react";

const DESCONTO_PIX_ONLINE = 10;

interface ReservaProps {
  isOpen: boolean;
  onClose: () => void;
  reserva: {
    cliente: string;
    telefone: string;
    horario: string;
    tipo: "Avulso" | "VIP/Fixo";
    status: "Pendente" | "Confirmado";
    valor: number;
    pagamento: "PIX" | "Dinheiro";
    obsCliente?: string;
  };
}

export const DetalhamentoReserva = ({ isOpen, onClose, reserva }: ReservaProps) => {
  const isPix = reserva.pagamento === "PIX";
  const valorComDesconto = isPix ? Math.max(reserva.valor - DESCONTO_PIX_ONLINE, 0) : reserva.valor;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0c120f] border-white/10 text-white max-w-md rounded-[2.5rem]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
              Detalhes da Reserva
            </DialogTitle>
            <Badge className={reserva.status === "Confirmado" ? "bg-green-500" : "bg-yellow-500 animate-pulse"}>
              {reserva.status.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* INFO CLIENTE */}
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="w-12 h-12 bg-[#22c55e]/20 rounded-full flex items-center justify-center">
              <User className="text-[#22c55e]" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-tight">{reserva.cliente}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Phone size={12} /> {reserva.telefone}
              </p>
            </div>
          </div>

          {/* ALERTA DE CLIENTE */}
          {reserva.obsCliente && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex gap-3 items-start">
              <AlertTriangle className="text-red-500 shrink-0" size={18} />
              <p className="text-[11px] text-red-200 italic leading-tight">
                <span className="font-bold uppercase block mb-1">Nota do Atendente:</span>
                "{reserva.obsCliente}"
              </p>
            </div>
          )}

          {/* INFO JOGO */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-gray-500">Horário e Turno</p>
              <p className="text-sm font-bold flex items-center gap-2">
                <Clock size={14} className="text-[#22c55e]" /> {reserva.horario}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-gray-500">Valor Original</p>
              <p className={`text-sm font-bold ${isPix ? "line-through text-gray-500" : "text-[#22c55e]"}`}>
                R$ {reserva.valor.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-gray-500">Tipo de Reserva</p>
              <Badge variant="outline" className="border-white/20 text-[10px]">{reserva.tipo}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-gray-500">Pagamento</p>
              <p className="text-sm font-bold flex items-center gap-2">
                <CreditCard size={14} /> {reserva.pagamento}
              </p>
            </div>
          </div>

          {/* DESCONTO PIX */}
          {isPix && (
            <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#22c55e] text-xs font-bold uppercase">
                  <Tag size={14} /> Desconto PIX Online
                </span>
                <span className="text-[#22c55e] font-black text-sm">- R$ {DESCONTO_PIX_ONLINE.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#22c55e]/20 pt-1">
                <span className="text-xs text-gray-400 font-bold uppercase">Total cobrado</span>
                <span className="text-[#22c55e] font-black text-lg">R$ {valorComDesconto.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="grid grid-cols-2 gap-3 sm:justify-start">
          <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold uppercase text-[10px] gap-2 rounded-xl">
            <MessageSquare size={16} /> Enviar Confirm.
          </Button>

          {reserva.status === "Pendente" && (
            <Button className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold uppercase text-[10px] gap-2 rounded-xl">
              <CheckCircle2 size={16} /> Confirmar Pago
            </Button>
          )}

          <Button variant="ghost" className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold uppercase text-[10px] gap-2 rounded-xl border border-red-500/20">
            <Trash2 size={16} /> Cancelar Reserva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
