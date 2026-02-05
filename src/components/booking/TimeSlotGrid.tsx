import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Check, X, AlertTriangle, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TimeSlot } from "./BookingCalendar";

interface TimeSlotGridProps {
  date: Date;
  slots: TimeSlot[];
  onSelectSlot: (slot: TimeSlot, duration: number) => void;
  selectedSlot: TimeSlot | null;
  isAdmin?: boolean;
}

export const TimeSlotGrid = ({ date, slots, onSelectSlot, selectedSlot, isAdmin = false }: TimeSlotGridProps) => {
  const [selectedDuration, setSelectedDuration] = useState(60); // Default 60 minutes (1 hour)

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

  // Calculate price based on slot time and duration
  const calculatePrice = (slot: TimeSlot, durationMinutes: number) => {
    const hour = parseInt(slot.time.split(":")[0]);
    const pricePerHour = hour >= 18 ? 120 : 80;
    return (pricePerHour * durationMinutes) / 60;
  };

  const diurnalSlots = slots.filter(s => parseInt(s.time.split(":")[0]) < 18);
  const nocturnalSlots = slots.filter(s => parseInt(s.time.split(":")[0]) >= 18);

  const handleSelectSlot = (slot: TimeSlot) => {
    const isClickable = slot.status === "available" || (isAdmin && slot.status !== "maintenance");
    if (isClickable) {
      onSelectSlot(slot, selectedDuration);
    }
  };

  const durationOptions = [
    { value: 30, label: "30 min" },
    { value: 60, label: "1 hora" },
    { value: 90, label: "1h30" },
    { value: 120, label: "2 horas" },
  ];

  const renderSlotSection = (sectionSlots: TimeSlot[], title: string, priceLabel: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground">{title}</h4>
        <span className="text-sm text-primary font-semibold">{priceLabel}</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {sectionSlots.map((slot) => {
          const isSelected = selectedSlot?.time === slot.time;
          const isClickable = slot.status === "available" || (isAdmin && slot.status !== "maintenance");
          const price = calculatePrice(slot, selectedDuration);
          
          return (
            <button
              key={slot.time}
              onClick={() => handleSelectSlot(slot)}
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
                <span className="font-medium text-sm">{slot.time}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                R$ {price.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="font-display text-lg font-bold">
          Horários - {format(date, "dd 'de' MMMM", { locale: ptBR })}
        </h3>
        
        {/* Duration Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Duração:</span>
          <div className="flex bg-secondary rounded-lg p-1">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDuration(option.value)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-all",
                  selectedDuration === option.value
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary-foreground/10"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info about selected duration */}
      <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg px-4 py-2">
        💡 Selecionando blocos de <strong>{selectedDuration} minutos</strong>. 
        {selectedDuration >= 60 && ` Valor proporcional ao tempo escolhido.`}
      </div>

      {renderSlotSection(diurnalSlots, "☀️ Turno Diurno (08h - 17h)", "R$ 80,00/hora")}
      
      <div className="border-t border-border" />
      
      {renderSlotSection(nocturnalSlots, "🌙 Turno Noturno (18h - 22h)", "R$ 120,00/hora")}
    </div>
  );
};
