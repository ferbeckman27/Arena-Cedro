import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TimeSlot } from "./BookingCalendar";

interface TimeSlotGridProps {
  date: Date;
  slots: TimeSlot[];
  onSelectSlot: (slot: TimeSlot) => void;
  selectedSlot: TimeSlot | null;
  isAdmin?: boolean;
}

export const TimeSlotGrid = ({ date, slots, onSelectSlot, selectedSlot, isAdmin = false }: TimeSlotGridProps) => {
  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <Check className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "unavailable":
        return <X className="w-4 h-4" />;
      case "maintenance":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "available":
        return "bg-status-available/10 border-status-available/50 hover:bg-status-available/20 hover:border-status-available";
      case "pending":
        return "bg-status-pending/10 border-status-pending/50 hover:bg-status-pending/20 hover:border-status-pending";
      case "unavailable":
        return "bg-status-unavailable/10 border-status-unavailable/50 cursor-not-allowed opacity-60";
      case "maintenance":
        return "bg-status-maintenance/10 border-status-maintenance/50 cursor-not-allowed opacity-60";
      default:
        return "";
    }
  };

  const diurnalSlots = slots.filter(s => s.hour >= 8 && s.hour < 18);
  const nocturnalSlots = slots.filter(s => s.hour >= 18 && s.hour <= 22);

  const renderSlotSection = (sectionSlots: TimeSlot[], title: string, priceLabel: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground">{title}</h4>
        <span className="text-sm text-primary font-semibold">{priceLabel}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {sectionSlots.map((slot) => {
          const isSelected = selectedSlot?.hour === slot.hour;
          const isClickable = slot.status === "available" || (isAdmin && slot.status !== "maintenance");
          
          return (
            <button
              key={slot.hour}
              onClick={() => isClickable && onSelectSlot(slot)}
              disabled={!isClickable}
              className={cn(
                "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1",
                getStatusClass(slot.status),
                isSelected && "ring-2 ring-accent ring-offset-2 ring-offset-background",
                isClickable && "cursor-pointer"
              )}
            >
              <div className="flex items-center gap-1">
                {getStatusIcon(slot.status)}
                <span className="font-medium">{formatHour(slot.hour)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                R$ {slot.price.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">
          Horários - {format(date, "dd 'de' MMMM", { locale: ptBR })}
        </h3>
      </div>

      {renderSlotSection(diurnalSlots, "☀️ Turno Diurno (08h - 17h)", "R$ 80,00/hora")}
      
      <div className="border-t border-border" />
      
      {renderSlotSection(nocturnalSlots, "🌙 Turno Noturno (18h - 22h)", "R$ 120,00/hora")}
    </div>
  );
};
