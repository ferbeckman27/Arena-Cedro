import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { QrCode, Banknote, Copy, Check, AlertCircle, Tag, ShieldAlert } from "lucide-react";
import { calcularPrecoReserva } from "@/hooks/usePixPayment";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

const DESCONTO_PIX_ONLINE = 10;

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: TimeSlot | null;
  date: Date | null;
  duration?: number;
  onConfirm: (paymentMethod: "pix" | "dinheiro", total: number) => void;
}

export const PaymentModal = ({ isOpen, onClose, slot, date, duration = 60, onConfirm }: PaymentModalProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "dinheiro">("pix");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!slot || !date) return null;

  const hour = parseInt(slot.time.split(":")[0]);
  const totalPrice = calcularPrecoReserva(duration, hour);
  const precoComDesconto = totalPrice - DESCONTO_PIX_ONLINE;
  const valorFinal = paymentMethod === "pix" ? precoComDesconto : totalPrice;

  const handleConfirm = () => {
    setIsProcessing(true);

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("ARENA CEDRO - COMPROVANTE DE RESERVA", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${format(date, "dd/MM/yyyy")}`, 20, 40);
    doc.text(`Horário: ${slot.time}`, 20, 50);
    doc.text(`Valor original: R$ ${totalPrice.toFixed(2)}`, 20, 60);
    if (paymentMethod === "pix") {
      doc.text(`Desconto PIX online: - R$ ${DESCONTO_PIX_ONLINE.toFixed(2)}`, 20, 70);
      doc.text(`Total pago: R$ ${precoComDesconto.toFixed(2)}`, 20, 80);
    } else {
      doc.text(`Total: R$ ${totalPrice.toFixed(2)}`, 20, 70);
    }
    doc.text(`Método: ${paymentMethod.toUpperCase()}`, 20, 90);
    doc.setFontSize(9);
    doc.text("* Pagamento integral. Não há devolução do valor pago.", 20, 105);
    doc.save(`reserva-arena-${slot.time}.pdf`);

    setTimeout(() => {
      setIsProcessing(false);
      
      const msg = `*ARENA CEDRO - RESERVA CONFIRMADA*%0A%0A` +
                  `📅 *Data:* ${format(date, "dd/MM/yyyy")}%0A` +
                  `⏰ *Horário:* ${slot.time}%0A` +
                  `💰 *Valor:* R$ ${valorFinal.toFixed(2)}%0A` +
                  (paymentMethod === "pix" ? `🏷️ *Desconto PIX:* -R$ ${DESCONTO_PIX_ONLINE.toFixed(2)}%0A` : '') +
                  `📖 *Regras:* ${window.location.origin}/docs/regras-arena.pdf`;
      
      window.open(`https://wa.me/5598900000000?text=${msg}`, '_blank');

      onConfirm(paymentMethod, valorFinal);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-[#0c120f] border-white/10 text-white rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase italic text-[#22c55e]">Confirmar Reserva</DialogTitle>
          <DialogDescription className="text-gray-400">Pagamento integral com desconto exclusivo online.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Resumo de preço */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 uppercase font-bold">Data/Horário:</span>
              <span className="font-black italic">{format(date, "dd/MM/yyyy")} às {slot.time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 uppercase font-bold">Valor original:</span>
              <span className="font-bold">R$ {totalPrice.toFixed(2)}</span>
            </div>
            {paymentMethod === "pix" && (
              <div className="flex justify-between text-sm items-center">
                <span className="flex items-center gap-1 text-[#22c55e] font-bold uppercase">
                  <Tag size={14} /> Desconto PIX online:
                </span>
                <span className="font-black text-[#22c55e]">- R$ {DESCONTO_PIX_ONLINE.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-2 flex justify-between">
              <span className="text-gray-400 uppercase font-bold text-sm">Total a pagar:</span>
              <span className="font-black italic text-xl text-[#22c55e]">R$ {valorFinal.toFixed(2)}</span>
            </div>
          </div>

          {/* Método de pagamento */}
          <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "pix" | "dinheiro")} className="grid grid-cols-2 gap-4">
            <Label className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "pix" ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5"}`}>
              <RadioGroupItem value="pix" className="sr-only" />
              <QrCode className={paymentMethod === "pix" ? "text-[#22c55e]" : ""} />
              <span className="text-[10px] font-black uppercase">PIX Online</span>
              {paymentMethod === "pix" && (
                <span className="text-[9px] text-[#22c55e] font-bold">-R${DESCONTO_PIX_ONLINE}</span>
              )}
            </Label>
            <Label className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "dinheiro" ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5"}`}>
              <RadioGroupItem value="dinheiro" className="sr-only" />
              <Banknote className={paymentMethod === "dinheiro" ? "text-[#22c55e]" : ""} />
              <span className="text-[10px] font-black uppercase">No Local</span>
            </Label>
          </RadioGroup>

          {/* Aviso de não devolução */}
          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
            <ShieldAlert size={20} className="text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-200/90 leading-relaxed">
              <p className="font-bold mb-1">Política de pagamento:</p>
              <p>O pagamento é <strong>integral</strong> e <strong>não há devolução</strong> do valor pago após a confirmação. O desconto de R${DESCONTO_PIX_ONLINE} é exclusivo para reservas feitas e pagas pelo site via PIX.</p>
            </div>
          </div>

          <Button className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14 rounded-2xl hover:bg-[#16a34a] transition-colors" onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? "Processando..." : `Pagar R$ ${valorFinal.toFixed(2)} e Confirmar`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
