import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarDays, Clock, Users, DollarSign, TrendingUp, 
  LogOut, AlertTriangle, Check, X, Wrench,
  BarChart3, FileText, Trophy, Settings, Bell, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingCalendar, type DaySchedule, type TimeSlot } from "@/components/booking/BookingCalendar";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

// Generate mock schedule data with 30-minute intervals
const generateMockSchedule = (): DaySchedule[] => {
  const today = startOfToday();
  const schedule: DaySchedule[] = [];

  for (let i = -30; i < 60; i++) {
    const date = addDays(today, i);
    const slots: TimeSlot[] = [];

    // Diurnal slots (8h - 17h30) with 30-min intervals
    for (let hour = 8; hour < 18; hour++) {
      for (let half = 0; half < 2; half++) {
        if (hour === 17 && half === 1) continue;
        const random = Math.random();
        let status: TimeSlot["status"] = "available";
        if (random > 0.7) status = "unavailable";
        else if (random > 0.5) status = "pending";

        slots.push({
          time: `${hour.toString().padStart(2, "0")}:${half === 0 ? "00" : "30"}`,
          status,
          price: 40,
          bookedBy: status !== "available" ? "João Silva" : undefined,
        });
      }
    }

    // Nocturnal slots (18h - 22h) with 30-min intervals
    for (let hour = 18; hour <= 22; hour++) {
      for (let half = 0; half < 2; half++) {
        if (hour === 22 && half === 1) continue;
        const random = Math.random();
        let status: TimeSlot["status"] = "available";
        if (random > 0.6) status = "unavailable";
        else if (random > 0.4) status = "pending";

        slots.push({
          time: `${hour.toString().padStart(2, "0")}:${half === 0 ? "00" : "30"}`,
          status,
          price: 60,
          bookedBy: status !== "available" ? "Carlos Mendes" : undefined,
        });
      }
    }

    schedule.push({ date, slots });
  }

  return schedule;
};

// Mock data for charts
const revenueData = [
  { name: "Seg", diurno: 320, noturno: 480 },
  { name: "Ter", diurno: 240, noturno: 360 },
  { name: "Qua", diurno: 400, noturno: 600 },
  { name: "Qui", diurno: 320, noturno: 480 },
  { name: "Sex", diurno: 480, noturno: 720 },
  { name: "Sáb", diurno: 640, noturno: 840 },
  { name: "Dom", diurno: 560, noturno: 600 },
];

const monthlyRevenueData = [
  { month: "Jan/26", receita: 17800 },
  { month: "Fev/26", receita: 19500 }, // Previsão 2026
];

interface PendingBooking {
  id: string;
  clientName: string;
  clientPhone: string;
  date: Date;
  time: string;
  duration: number;
  price: number;
  paymentMethod: "pix" | "dinheiro";
}

const mockPendingBookings: PendingBooking[] = [
  { id: "1", clientName: "João Silva", clientPhone: "(11) 99999-1234", date: addDays(startOfToday(), 1), time: "19:00", duration: 60, price: 120, paymentMethod: "pix" },
  { id: "2", clientName: "Maria Santos", clientPhone: "(11) 98888-5678", date: addDays(startOfToday(), 1), time: "20:00", duration: 90, price: 180, paymentMethod: "dinheiro" },
  { id: "3", clientName: "Carlos Oliveira", clientPhone: "(11) 97777-9012", date: addDays(startOfToday(), 2), time: "10:00", duration: 60, price: 80, paymentMethod: "pix" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // ESTADOS PRINCIPAIS
  const [maintenanceMode, setMaintenanceMode] = useState(false);
const [selectedDate, setSelectedDate] = useState<Date | null>(startOfToday());
const [isBookingDetailOpen, setIsBookingDetailOpen] = useState(false);
const [selectedBooking, setSelectedBooking] = useState<PendingBooking | null>(null);
const [isSlotDetailOpen, setIsSlotDetailOpen] = useState(false);
const [paymentDestination, setPaymentDestination] = useState("arena");
const [reportPeriod, setReportPeriod] = useState("week");
const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>(mockPendingBookings);
const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
const [schedule] = useState<DaySchedule[]>(generateMockSchedule());

// MOCK DE FIDELIDADE (Simulando Banco de Dados)
const [usersFidelity, setUsersFidelity] = useState([
  { id: "1", name: "João Silva", gamesPlayed: 7 },
  { id: "2", name: "Maria Santos", gamesPlayed: 9 },
]);

// Get selected day schedule
const selectedDaySchedule = selectedDate 
  ? schedule.find(day => day.date.toDateString() === selectedDate.toDateString())
  : null;

// FUNÇÃO PARA CONFIRMAR E DAR PONTO NA FIDELIDADE
const handleConfirmBooking = (booking: PendingBooking) => {
  // 1. Remove dos pendentes
  setPendingBookings(prev => prev.filter(b => b.id !== booking.id));
  
  // 2. Lógica de Fidelidade: Procura o usuário e aumenta o contador
  setUsersFidelity(prevUsers => prevUsers.map(user => {
    if (user.name === booking.clientName) {
      const newCount = user.gamesPlayed + 1;
      
      toast({
        title: "Pagamento Confirmado! ✅",
        description: `Ponto adicionado para ${user.name}. Total: ${newCount}/10`,
      });

      if (newCount === 10) {
        toast({
          title: "🏆 PRÊMIO LIBERADO",
          description: `O cliente ${user.name} completou 10 jogos!`,
          variant: "default",
        });
      }
      return { ...user, gamesPlayed: newCount };
    }
    return user;
  }));

  setIsBookingDetailOpen(false);
};

const handleCancelBooking = (booking: PendingBooking) => {
  setPendingBookings(prev => prev.filter(b => b.id !== booking.id));
  setIsBookingDetailOpen(false);
  toast({
    title: "Reserva cancelada",
    description: `Agendamento de ${booking.clientName} foi cancelado.`,
    variant: "destructive",
  });
};

const handleMaintenanceToggle = (enabled: boolean) => {
  setMaintenanceMode(enabled);
  toast({
    title: enabled ? "Modo manutenção ativado" : "Modo manutenção desativado",
    description: enabled 
      ? "Novos agendamentos estão bloqueados."
      : "Agendamentos liberados novamente.",
  });
};

// Stats calculation
const totalRevenue = revenueData.reduce((acc, day) => acc + day.diurno + day.noturno, 0);
const totalBookings = pendingBookings.length + 45;
const pendingCount = pendingBookings.length;

const formatDuration = (mins: number) => {
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h${remaining}min`;
};
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-arena.png" className="w-10 h-10 object-contain" alt="Logo" />
            <div>
              <h1 className="font-display text-lg font-bold">Arena Cedro</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-primary">Admin 2026</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/login")}><LogOut className="w-5 h-5" /></Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Métricas Financeiras (Foto 2: Relatório Mensal) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Recebido (Mês)</p>
                <h3 className="text-2xl font-bold text-foreground">R$ 17.800,00</h3>
              </div>
              <DollarSign className="text-green-500 w-5 h-5" />
            </div>
            <p className="text-[10px] text-green-500 mt-2 font-bold">+12% em relação a Dez/25</p>
          </div>
          
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-blue-500">
            <p className="text-sm text-muted-foreground">Jogos Grátis Concedidos</p>
            <h3 className="text-2xl font-bold text-foreground">04</h3>
            <p className="text-[10px] text-muted-foreground mt-2 italic">Sistema de Fidelidade 10+1</p>
          </div>

          <div className="glass-card p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} id="maint" />
            <Label htmlFor="maint" className="ml-2 font-bold text-sm cursor-pointer">Modo Manutenção</Label>
            <p className="text-[10px] text-muted-foreground mt-2">Bloqueia agendamentos de clientes no site.</p>
          </div>
        </div>

<Tabs defaultValue="pendentes" className="space-y-6">
  <TabsList className="bg-muted/50 p-1">
    <TabsTrigger value="agenda">Agenda</TabsTrigger>
    <TabsTrigger value="pendentes" className="relative">
      Pendentes
      {pendingBookings.length > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] text-white rounded-full flex items-center justify-center">
          {pendingBookings.length}
        </span>
      )}
    </TabsTrigger>
    <TabsTrigger value="relatorios">Relatórios Financeiros</TabsTrigger>
  </TabsList>

  {/* Agenda Tab */}
  <TabsContent value="agenda" className="space-y-6">
    <div className="grid lg:grid-cols-2 gap-6">
      <BookingCalendar
        schedule={schedule}
        onSelectDay={setSelectedDate}
        selectedDate={selectedDate}
        isAdmin
      />

      {selectedDate && selectedDaySchedule ? (
        <TimeSlotGrid
          date={selectedDate}
          slots={selectedDaySchedule.slots}
          onSelectSlot={(slot) => {
            setSelectedSlot(slot);
            setIsSlotDetailOpen(true);
          }}
          selectedSlot={selectedSlot}
          isAdmin
        />
      ) : (
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <CalendarDays className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="font-display text-lg font-bold mb-2">Selecione uma data</h3>
          <p className="text-muted-foreground">
            Clique em um dia para gerenciar os horários.
          </p>
        </div>
      )}
    </div>
  </TabsContent>

  {/* Pending Bookings Tab */}
  <TabsContent value="pendentes" className="space-y-4">
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="font-display text-lg font-bold">Reservas Pendentes</h3>
        <p className="text-sm text-muted-foreground">Aguardando confirmação de pagamento</p>
      </div>
      
      {pendingBookings.length === 0 ? (
        <div className="p-12 text-center">
          <Check className="w-12 h-12 text-status-available mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma reserva pendente!</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {pendingBookings.map((booking) => (
            <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-status-pending/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-status-pending" />
                </div>
                <div>
                  <p className="font-medium">{booking.clientName}</p>
                  <p className="text-sm text-muted-foreground">{booking.clientPhone}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(booking.date, "dd/MM/yyyy", { locale: ptBR })} às {booking.time} ({formatDuration(booking.duration)}) - 
                    <span className="text-primary font-medium"> R$ {booking.price.toFixed(2)}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${booking.paymentMethod === "pix" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                  {booking.paymentMethod.toUpperCase()}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setIsBookingDetailOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-status-available border-status-available hover:bg-status-available/10"
                  onClick={() => handleConfirmBooking(booking)}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-status-unavailable border-status-unavailable hover:bg-status-unavailable/10"
                  onClick={() => handleCancelBooking(booking)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </TabsContent>

          <TabsContent value="relatorios">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl border">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Receita Semanal por Turno
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="diurno" name="Diurno" fill="#eab308" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="noturno" name="Noturno" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" /> Ranking de Fidelidade
                </h3>
                <div className="space-y-4">
                  {usersFidelity.sort((a,b) => b.gamesPlayed - a.gamesPlayed).map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="text-sm font-medium">{u.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${u.gamesPlayed * 10}%` }} />
                        </div>
                        <span className="text-xs font-bold">{u.gamesPlayed}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Booking Detail Modal */}
      <Dialog open={isBookingDetailOpen} onOpenChange={setIsBookingDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Reserva</DialogTitle>
            <DialogDescription>
              Confirme ou cancele a reserva e registre o pagamento.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="glass-card rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{selectedBooking.clientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className="font-medium">{selectedBooking.clientPhone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data/Hora:</span>
                  <span className="font-medium">
                    {format(selectedBooking.date, "dd/MM/yyyy")} às {selectedBooking.time}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duração:</span>
                  <span className="font-medium">{formatDuration(selectedBooking.duration)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pagamento:</span>
                  <span className="font-medium uppercase">{selectedBooking.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Valor:</span>
                  <span className="text-xl font-bold text-primary">R$ {selectedBooking.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Destino do Pagamento</Label>
                <Select value={paymentDestination} onValueChange={setPaymentDestination}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arena">PIX - Conta Arena Cedro</SelectItem>
                    <SelectItem value="conta">Depósito - Conta Bancária</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro em Caixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 text-status-unavailable border-status-unavailable"
                  onClick={() => handleCancelBooking(selectedBooking)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  className="flex-1 gradient-primary"
                  onClick={() => handleConfirmBooking(selectedBooking)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Slot Detail Modal (for clicking booked slots) */}
      <Dialog open={isSlotDetailOpen} onOpenChange={setIsSlotDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Horário</DialogTitle>
            <DialogDescription>
              Informações sobre este horário reservado.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSlot && selectedDate && (
            <div className="space-y-4">
              <div className="glass-card rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">{format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Horário:</span>
                  <span className="font-medium">{selectedSlot.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium capitalize ${
                    selectedSlot.status === "available" ? "text-status-available" :
                    selectedSlot.status === "pending" ? "text-status-pending" :
                    "text-status-unavailable"
                  }`}>
                    {selectedSlot.status === "available" ? "Disponível" :
                     selectedSlot.status === "pending" ? "Pendente" : "Reservado"}
                  </span>
                </div>
                {selectedSlot.bookedBy && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reservado por:</span>
                    <span className="font-medium">{selectedSlot.bookedBy}</span>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSlotDetailOpen(false)}
              >
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;