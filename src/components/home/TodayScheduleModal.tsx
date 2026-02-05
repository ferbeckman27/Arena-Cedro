import { format, startOfToday, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeSlotPreview {
  time: string;
  status: "available" | "pending" | "unavailable";
  price: number;
}

interface TodayScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

// Mock data for today's schedule with 30-min intervals
const generateTodaySlots = (): TimeSlotPreview[] => {
  const slots: TimeSlotPreview[] = [];
  
  // Diurnal: 08:00 - 17:30 (R$ 80/hour = R$ 40/30min)
  for (let hour = 8; hour < 18; hour++) {
    for (let half = 0; half < 2; half++) {
      if (hour === 17 && half === 1) continue; // Stop at 17:30
      const random = Math.random();
      let status: TimeSlotPreview["status"] = "available";
      if (random > 0.7) status = "unavailable";
      else if (random > 0.5) status = "pending";
      
      slots.push({
        time: `${hour.toString().padStart(2, "0")}:${half === 0 ? "00" : "30"}`,
        status,
        price: 40, // R$ 80/hour = R$ 40/30min
      });
    }
  }
  
  // Nocturnal: 18:00 - 22:00 (R$ 120/hour = R$ 60/30min)
  for (let hour = 18; hour <= 22; hour++) {
    for (let half = 0; half < 2; half++) {
      if (hour === 22 && half === 1) continue; // Stop at 22:00
      const random = Math.random();
      let status: TimeSlotPreview["status"] = "available";
      if (random > 0.6) status = "unavailable";
      else if (random > 0.4) status = "pending";
      
      slots.push({
        time: `${hour.toString().padStart(2, "0")}:${half === 0 ? "00" : "30"}`,
        status,
        price: 60, // R$ 120/hour = R$ 60/30min
      });
    }
  }
  
  return slots;
};

const todaySlots = generateTodaySlots();

const getStatusStyles = (status: string) => {
  switch (status) {
    case "available":
      return "bg-status-available/20 border-status-available text-status-available";
    case "pending":
      return "bg-status-pending/20 border-status-pending text-status-pending";
    case "unavailable":
      return "bg-status-unavailable/20 border-status-unavailable text-status-unavailable";
    default:
      return "";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "available":
      return <Check className="w-3 h-3" />;
    case "pending":
      return <Clock className="w-3 h-3" />;
    case "unavailable":
      return <X className="w-3 h-3" />;
    default:
      return null;
  }
};

export const TodayScheduleModal = ({ isOpen, onClose, onLoginClick }: TodayScheduleModalProps) => {
  const today = startOfToday();
  const diurnalSlots = todaySlots.filter(s => parseInt(s.time) < 18);
  const nocturnalSlots = todaySlots.filter(s => parseInt(s.time) >= 18);
  const availableCount = todaySlots.filter(s => s.status === "available").length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Horários de Hoje - {format(today, "dd 'de' MMMM", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-available" />
            <span>Disponível ({availableCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-pending" />
            <span>Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-unavailable" />
            <span>Indisponível</span>
          </div>
        </div>

        {/* Diurnal Slots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">☀️ Turno Diurno (08h - 17h)</h4>
            <span className="text-sm text-primary font-semibold">R$ 80,00/hora</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {diurnalSlots.map((slot, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-2 rounded-lg border-2 flex flex-col items-center text-xs",
                  getStatusStyles(slot.status)
                )}
              >
                <div className="flex items-center gap-1">
                  {getStatusIcon(slot.status)}
                  <span className="font-medium">{slot.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border my-4" />

        {/* Nocturnal Slots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">🌙 Turno Noturno (18h - 22h)</h4>
            <span className="text-sm text-primary font-semibold">R$ 120,00/hora</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {nocturnalSlots.map((slot, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-2 rounded-lg border-2 flex flex-col items-center text-xs",
                  getStatusStyles(slot.status)
                )}
              >
                <div className="flex items-center gap-1">
                  {getStatusIcon(slot.status)}
                  <span className="font-medium">{slot.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            Faça login para reservar seu horário
          </p>
          <Button 
            className="gradient-primary glow-primary px-8"
            onClick={() => {
              onClose();
              onLoginClick();
            }}
          >
            Agendar Agora
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
