import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfToday } from "date-fns";
import { CalendarDays, Clock, User, LogOut, History, Star, Trophy, Sun } from  "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingCalendar, type DaySchedule, type TimeSlot } from "@/components/booking/BookingCalendar";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { PaymentModal } from "@/components/booking/PaymentModal";
import { useToast } from "@/hooks/use-toast";
import { FidelityCard } from "@/components/dashboard/FidelityCard";

// Mock de dados (Simulando que o usuário já tem 7 jogos para teste)
const USER_GAMES_COUNT = 7;

const generateMockSchedule = (): DaySchedule[] => {
  const today = startOfToday();
  const schedule: DaySchedule[] = [];

  for (let i = 0; i < 60; i++) {
    const date = addDays(today, i);
    const slots: TimeSlot[] = [];

    for (let hour = 8; hour < 18; hour++) {
      const random = Math.random();
      let status: TimeSlot["status"] = "available";
      if (random > 0.7) status = "unavailable";
      else if (random > 0.5) status = "pending";

      slots.push({
        hour,
        status,
        price: 80,
        bookedBy: status !== "available" ? "Cliente" : undefined,
      });
    }

    for (let hour = 18; hour <= 22; hour++) {
      const random = Math.random();
      let status: TimeSlot["status"] = "available";
      if (random > 0.6) status = "unavailable";
      else if (random > 0.4) status = "pending";

      slots.push({
        hour,
        status,
        price: 120,
        bookedBy: status !== "available" ? "Cliente" : undefined,
      });
    }

    schedule.push({ date, slots });

  }

  return schedule;
};

export const ClientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schedule] = useState<DaySchedule[]>(generateMockSchedule());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const selectedDaySchedule = selectedDate 
    ? schedule.find(s => format(s.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
    : null;

  const handleSelectSlot = (slot: TimeSlot) => {
    if (slot.status === "available") {
      setSelectedSlot(slot);
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
              <img src="/logo-arena.png" alt="Arena Cedro" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-display text-xl font-bold leading-tight">Arena Cedro</h1>
                <p className="text-[10px] uppercase tracking-wider text-green-500 font-bold">Futebol Society</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="hidden sm:flex gap-2 text-muted-foreground hover:text-primary">
                <History className="w-4 h-4" />
                Minhas Reservas
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigate("/")} className="border-border hover:bg-destructive/10 hover:text-destructive transition-colors">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Coluna da Esquerda: Perfil e Fidelidade */}
          <div className="lg:col-span-1 space-y-6">
            <div className="animate-fade-in">
              <h2 className="font-display text-3xl font-bold mb-2">
                Olá, <span className="text-gradient">Jogador!</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Gerencie suas reservas e acompanhe seus benefícios.
              </p>
            </div>

            {/* SISTEMA DE FIDELIDADE (10+1) */}
            <FidelityCard gamesPlayed={USER_GAMES_COUNT} />

            {/* Informações de Preço Rápidas */}
                        <div className="space-y-3">
                          <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-l-4 border-l-yellow-500">
                            <div className="flex items-center gap-3">
                              <Sun className="w-5 h-5 text-yellow-500" />
                            </div>
                          </div>
                        </div>
                      </div>
            
                      {/* Coluna da Direita: Calendário e Seleção */}
                      <div className="lg:col-span-2 space-y-6">
                        <BookingCalendar schedule={schedule} onSelectDay={setSelectedDate} selectedDate={selectedDate} />
                        {selectedDaySchedule && (
                          <TimeSlotGrid
                            slots={selectedDaySchedule.slots}
                            onSelectSlot={handleSelectSlot}
                            date={selectedDaySchedule.date}
                            selectedSlot={selectedSlot}
                          />
                        )}
                      </div>
                    </div>
            
  <PaymentModal
    isOpen={isPaymentOpen}
    onClose={() => setIsPaymentOpen(false)}
    onConfirm={handleConfirmBooking}
    slot={selectedSlot}
    date={selectedDate}
  />
                  </main>
                </div>
              );
            };

 export default ClientDashboard;