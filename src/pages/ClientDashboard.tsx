import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfToday } from "date-fns";
import { CalendarDays, Clock, User, LogOut, History, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingCalendar, type DaySchedule, type TimeSlot } from "@/components/booking/BookingCalendar";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { PaymentModal } from "@/components/booking/PaymentModal";
import { useToast } from "@/hooks/use-toast";

// Generate mock schedule data with 30-minute intervals
const generateMockSchedule = (): DaySchedule[] => {
  const today = startOfToday();
  const schedule: DaySchedule[] = [];

  for (let i = 0; i < 60; i++) {
    const date = addDays(today, i);
    const slots: TimeSlot[] = [];

    // Diurnal slots (8h - 17h30) with 30-min intervals
    for (let hour = 8; hour < 18; hour++) {
      for (let half = 0; half < 2; half++) {
        if (hour === 17 && half === 1) continue; // Stop at 17:30
        const random = Math.random();
        let status: TimeSlot["status"] = "available";
        if (random > 0.7) status = "unavailable";
        else if (random > 0.5) status = "pending";

        slots.push({
          time: `${hour.toString().padStart(2, "0")}:${half === 0 ? "00" : "30"}`,
          status,
          price: 40, // R$ 80/hour = R$ 40 per 30 min
          bookedBy: status !== "available" ? "Cliente" : undefined,
        });
      }
    }

    // Nocturnal slots (18h - 22h) with 30-min intervals
    for (let hour = 18; hour <= 22; hour++) {
      for (let half = 0; half < 2; half++) {
        if (hour === 22 && half === 1) continue; // Stop at 22:00
        const random = Math.random();
        let status: TimeSlot["status"] = "available";
        if (random > 0.6) status = "unavailable";
        else if (random > 0.4) status = "pending";

        slots.push({
          time: `${hour.toString().padStart(2, "0")}:${half === 0 ? "00" : "30"}`,
          status,
          price: 60, // R$ 120/hour = R$ 60 per 30 min
          bookedBy: status !== "available" ? "Cliente" : undefined,
        });
      }
    }

    schedule.push({ date, slots });
  }

  return schedule;
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schedule] = useState<DaySchedule[]>(generateMockSchedule());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const selectedDaySchedule = selectedDate 
    ? schedule.find(s => format(s.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
    : null;

  const handleSelectSlot = (slot: TimeSlot, duration: number) => {
    if (slot.status === "available") {
      setSelectedSlot(slot);
      setSelectedDuration(duration);
      setIsPaymentOpen(true);
    }
  };

  const handleConfirmBooking = (paymentMethod: "pix" | "dinheiro") => {
    setIsPaymentOpen(false);
    setSelectedSlot(null);
    toast({
      title: "Reserva realizada! ⚽",
      description: paymentMethod === "pix" 
        ? "Aguardando confirmação do pagamento PIX."
        : "Efetue o pagamento no local.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary-foreground" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">Arena Cedro</h1>
                <p className="text-xs text-muted-foreground">Futebol Society</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button className="hidden sm:flex gap-2">
                  <History className="w-4 h-4" />
                  Minhas Reservas
                </Button>
              <Button 
                onClick={() => navigate("/")}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="font-display text-3xl font-bold mb-2">
            Olá, <span className="text-gradient">Jogador!</span>
          </h2>
          <p className="text-muted-foreground">
            Escolha uma data e horário para reservar o campo. Agendamentos flexíveis de 30 min a 2 horas.
          </p>
        </div>

        {/* Price Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center">
              <span className="text-2xl">☀️</span>
            </div>
            <div>
              <h3 className="font-display font-bold">Turno Diurno</h3>
              <p className="text-sm text-muted-foreground">08h às 17h</p>
              <p className="text-lg font-bold text-primary">R$ 80,00/hora</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="text-2xl">🌙</span>
            </div>
            <div>
              <h3 className="font-display font-bold">Turno Noturno</h3>
              <p className="text-sm text-muted-foreground">18h às 22h</p>
              <p className="text-lg font-bold text-primary">R$ 120,00/hora</p>
            </div>
          </div>
        </div>

        {/* Calendar and Slots */}
        <div className="grid lg:grid-cols-2 gap-6">
          <BookingCalendar
            schedule={schedule}
            onSelectDay={setSelectedDate}
            selectedDate={selectedDate}
          />

          {selectedDate && selectedDaySchedule ? (
            <TimeSlotGrid
              date={selectedDate}
              slots={selectedDaySchedule.slots}
              onSelectSlot={handleSelectSlot}
              selectedSlot={selectedSlot}
            />
          ) : (
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <CalendarDays className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="font-display text-lg font-bold mb-2">Selecione uma data</h3>
              <p className="text-muted-foreground">
                Clique em um dia no calendário para ver os horários disponíveis.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        slot={selectedSlot}
        date={selectedDate}
        duration={selectedDuration}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
};

export default ClientDashboard;
