import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Check, X, AlertTriangle } from "lucide-react";
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
  const formatHour = (hour: number) => `${hour.toString().padStart(2, "0")}:00`;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <Check className="w-3 h-3" />;
      case "pending": return <Clock className="w-3 h-3" />;
      case "unavailable": return <X className="w-3 h-3" />;
      case "maintenance": return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "available": return "bg-status-available/10 border-status-available/30 hover:bg-status-available/20 hover:border-status-available";
      case "pending": return "bg-status-pending/10 border-status-pending/30 hover:bg-status-pending/20 hover:border-status-pending";
      case "unavailable": return "bg-status-unavailable/5 border-status-unavailable/20 opacity-60 cursor-not-allowed";
      case "maintenance": return "bg-status-maintenance/5 border-status-maintenance/20 opacity-60 cursor-not-allowed";
      default: return "";
    }
  };

  const diurnalSlots = slots.filter(s => s.hour >= 8 && s.hour < 18);
  const nocturnalSlots = slots.filter(s => s.hour >= 18 && s.hour <= 22);

  const renderSlotSection = (sectionSlots: TimeSlot[], title: string, priceLabel: string) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-l-4 border-primary pl-3">
        <h4 className="font-bold text-sm text-foreground">{title}</h4>
        <span className="text-xs font-bold px-2 py-1 bg-primary/10 rounded-full text-primary">{priceLabel}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
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
                isSelected && "ring-2 ring-accent ring-offset-2 scale-95",
                isClickable && "cursor-pointer"
              )}
            >
              <div className="flex items-center gap-1.5">
                {getStatusIcon(slot.status)}
                <span className="font-bold text-sm">{formatHour(slot.hour)}</span>
              </div>
              <span className="text-[10px] opacity-70">R$ {slot.price.toFixed(2)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl p-6 space-y-8 border border-border animate-in fade-in slide-in-from-bottom-4">
      <h3 className="font-display text-lg font-bold flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        {format(date, "dd 'de' MMMM", { locale: ptBR })}
      </h3>

      {renderSlotSection(diurnalSlots, "Turno Diurno", "R$ 80,00/h")}
      <div className="h-px bg-border w-full" />
      {renderSlotSection(nocturnalSlots, "Turno Noturno", "R$ 120,00/h")}
    </div>
  );
};