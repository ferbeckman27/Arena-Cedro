import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TimeSlot {
  time: string; // Format: "HH:MM" (e.g., "08:00", "08:30")
  status: "available" | "pending" | "unavailable" | "maintenance";
  price: number;
  bookedBy?: string;
  duration?: number; // Duration in minutes (30, 60, 90, etc.)
}

export interface DaySchedule {
  date: Date;
  slots: TimeSlot[];
  hasMaintenance?: boolean;
}

interface BookingCalendarProps {
  schedule: DaySchedule[];
  onSelectDay: (date: Date) => void;
  selectedDate: Date | null;
  isAdmin?: boolean;
}

export const BookingCalendar = ({ schedule, onSelectDay, selectedDate, isAdmin = false }: BookingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getDayStatus = (date: Date): "available" | "pending" | "unavailable" | "maintenance" | "mixed" | null => {
    const daySchedule = schedule.find(s => isSameDay(s.date, date));
    if (!daySchedule) return null;
    
    if (daySchedule.hasMaintenance) return "maintenance";
    
    const statuses = daySchedule.slots.map(s => s.status);
    const uniqueStatuses = [...new Set(statuses)];
    
    if (uniqueStatuses.length === 1) return uniqueStatuses[0];
    if (statuses.every(s => s === "unavailable")) return "unavailable";
    if (statuses.some(s => s === "available")) return "available";
    if (statuses.some(s => s === "pending")) return "pending";
    
    return "mixed";
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "available":
        return "bg-status-available/20 border-status-available text-status-available";
      case "pending":
        return "bg-status-pending/20 border-status-pending text-status-pending";
      case "unavailable":
        return "bg-status-unavailable/20 border-status-unavailable text-status-unavailable";
      case "maintenance":
        return "bg-status-maintenance/20 border-status-maintenance text-status-maintenance";
      case "mixed":
        return "bg-primary/10 border-primary text-foreground";
      default:
        return "border-border text-muted-foreground";
    }
  };

  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  return (
    <div className="glass-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 text-[10px] sm:text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-status-available" /> <span>Livre</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-status-pending" /> <span>Pendente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-status-maintenance" /> <span>Manutenção</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-muted-foreground">
        {weekDays.map((day) => <div key={day} className="py-2">{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => <div key={`empty-${index}`} className="aspect-square" />)}
        {days.map((day) => {
          const status = getDayStatus(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isPastDay = isPast(day) && !isToday(day);
          const isDisabled = isPastDay && !isAdmin;

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isDisabled && onSelectDay(day)}
              disabled={isDisabled}
              className={cn(
                "aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all",
                status ? getStatusColor(status) : "border-transparent",
                isToday(day) && "ring-2 ring-primary ring-offset-1",
                isSelected && "ring-2 ring-accent ring-offset-1 scale-95",
                isDisabled && "opacity-30 cursor-not-allowed grayscale",
                !isDisabled && "hover:scale-105 cursor-pointer"
              )}
            >
              <span className="text-sm font-bold">{format(day, "d")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
