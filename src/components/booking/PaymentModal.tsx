import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreditCard, QrCode, Banknote, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import type { TimeSlot } from "./BookingCalendar";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: TimeSlot | null;
  date: Date | null;
  duration?: number; // Duration in minutes
  onConfirm: (paymentMethod: "pix" | "dinheiro") => void;
}

export const PaymentModal = ({ isOpen, onClose, slot, date, duration = 60, onConfirm }: PaymentModalProps) => {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "dinheiro">("pix");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const pixCode = "00020126580014br.gov.bcb.pix0136arena-cedro@email.com5204000053039865802BR5913ARENA CEDRO6008CITYNAME62070503***6304";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast({
      title: "Código PIX copiado!",
      description: "Cole no seu aplicativo de banco.",
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirm(paymentMethod);
    }, 1500);
  };

  if (!slot || !date) return null;

  const getHourFromTime = (time: string) => parseInt(time.split(":")[0]);
  const hour = getHourFromTime(slot.time);
  
  // Calculate end time based on duration
  const startMinutes = hour * 60 + parseInt(slot.time.split(":")[1] || "0");
  const endMinutes = startMinutes + duration;
  const endHour = Math.floor(endMinutes / 60);
  const endMin = endMinutes % 60;
  const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

  // Calculate price based on duration
  const pricePerHour = hour >= 18 ? 120 : 80;
  const totalPrice = (pricePerHour * duration) / 60;

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    if (remaining === 0) return `${hours}h`;
    return `${hours}h${remaining}min`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Confirmar Reserva</DialogTitle>
          <DialogDescription>
            Finalize seu agendamento escolhendo a forma de pagamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="glass-card rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">{format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Horário:</span>
              <span className="font-medium">{slot.time} - {endTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duração:</span>
              <span className="font-medium">{formatDuration(duration)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Turno:</span>
              <span className="font-medium">{hour < 18 ? "Diurno" : "Noturno"}</span>
            </div>
            <div className="border-t border-border my-2" />
            <div className="flex justify-between">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold text-primary">R$ {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Forma de Pagamento</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(v) => setPaymentMethod(v as "pix" | "dinheiro")}
              className="space-y-3"
            >
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "pix" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <RadioGroupItem value="pix" id="pix" />
                <QrCode className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">PIX</p>
                  <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                </div>
              </label>
              
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "dinheiro" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <RadioGroupItem value="dinheiro" id="dinheiro" />
                <Banknote className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Dinheiro</p>
                  <p className="text-sm text-muted-foreground">Pagar no local</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* PIX Details */}
          {paymentMethod === "pix" && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-xl p-6 flex flex-col items-center">
                <div className="w-40 h-40 bg-foreground rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-32 h-32 text-background" />
                </div>
                <p className="text-sm text-muted-foreground text-center mb-3">
                  Escaneie o QR Code ou copie o código abaixo
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyPix}
                  className="gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copiado!" : "Copiar código PIX"}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              className="flex-1 gradient-primary glow-primary"
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "Processando..." : "Confirmar Reserva"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
