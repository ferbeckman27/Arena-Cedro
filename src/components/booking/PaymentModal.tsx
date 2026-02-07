import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { QrCode, Banknote, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

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
  const pricePerHour = hour >= 18 ? 120 : 80;
  const totalPrice = (pricePerHour * duration) / 60;

  const handleConfirm = () => {
    setIsProcessing(true);

    // 1. GERAR PDF DO COMPROVANTE
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("ARENA CEDRO - COMPROVANTE DE RESERVA", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.text(`Data: ${format(date, "dd/MM/yyyy")}`, 20, 40);
    doc.text(`Horário: ${slot.time}`, 20, 50);
    doc.text(`Total: R$ ${totalPrice.toFixed(2)}`, 20, 60);
    doc.text(`Método: ${paymentMethod.toUpperCase()}`, 20, 70);
    doc.save(`reserva-arena-${slot.time}.pdf`);

    setTimeout(() => {
      setIsProcessing(false);
      
      // 2. DISPARAR WHATSAPP AUTOMÁTICO
      const msg = `*ARENA CEDRO - RESERVA CONFIRMADA*%0A%0A` +
                  `📅 *Data:* ${format(date, "dd/MM/yyyy")}%0A` +
                  `⏰ *Horário:* ${slot.time}%0A` +
                  `💰 *Valor:* R$ ${totalPrice.toFixed(2)}%0A` +
                  `📖 *Regras:* ${window.location.origin}/docs/regras-arena.pdf`;
      
      window.open(`https://wa.me/5598900000000?text=${msg}`, '_blank');

      onConfirm(paymentMethod, totalPrice);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-[#0c120f] border-white/10 text-white rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase italic text-[#22c55e]">Confirmar Reserva</DialogTitle>
          <DialogDescription className="text-gray-400">Finalize seu agendamento abaixo.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 uppercase font-bold">Resumo:</span>
              <span className="font-black italic text-[#22c55e]">R$ {totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-lg font-black italic">{format(date, "dd/MM/yyyy")} às {slot.time}</p>
          </div>

          <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "pix" | "dinheiro")} className="grid grid-cols-2 gap-4">
            <Label className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer ${paymentMethod === "pix" ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5"}`}>
              <RadioGroupItem value="pix" className="sr-only" />
              <QrCode className={paymentMethod === "pix" ? "text-[#22c55e]" : ""} />
              <span className="text-[10px] font-black uppercase">PIX</span>
            </Label>
            <Label className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer ${paymentMethod === "dinheiro" ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5"}`}>
              <RadioGroupItem value="dinheiro" className="sr-only" />
              <Banknote className={paymentMethod === "dinheiro" ? "text-[#22c55e]" : ""} />
              <span className="text-[10px] font-black uppercase">Dinheiro</span>
            </Label>
          </RadioGroup>

          <Button className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14 rounded-2xl" onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? "Processando..." : "Confirmar e Receber PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};