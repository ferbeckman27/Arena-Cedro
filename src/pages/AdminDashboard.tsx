import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfToday, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarDays, Clock, Users, DollarSign, TrendingUp, 
  LogOut, Settings, AlertTriangle, Check, X, Wrench,
  BarChart3, FileText, Bell, Eye
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
import { Input } from "@/components/ui/input";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
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

const paymentMethodData = [
  { name: "PIX", value: 65, color: "hsl(142, 76%, 45%)" },
  { name: "Dinheiro", value: 35, color: "hsl(38, 92%, 50%)" },
];

const monthlyRevenueData = [
  { month: "Jul", receita: 12500 },
  { month: "Ago", receita: 14200 },
  { month: "Set", receita: 15800 },
  { month: "Out", receita: 13900 },
  { month: "Nov", receita: 16500 },
  { month: "Dez", receita: 18200 },
  { month: "Jan", receita: 17800 },
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
  const [schedule, setSchedule] = useState<DaySchedule[]>(generateMockSchedule());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>(mockPendingBookings);
  const [isBookingDetailOpen, setIsBookingDetailOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<PendingBooking | null>(null);
  const [isSlotDetailOpen, setIsSlotDetailOpen] = useState(false);
  const [paymentDestination, setPaymentDestination] = useState("arena");
  const [reportPeriod, setReportPeriod] = useState("week");

  const selectedDaySchedule = selectedDate 
    ? schedule.find(s => format(s.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
    : null;

  const handleSelectSlot = (slot: TimeSlot, duration: number) => {
    setSelectedSlot(slot);
    
    // If slot is pending or unavailable, show details
    if (slot.status === "pending" || slot.status === "unavailable") {
      const booking = pendingBookings.find(b => b.time === slot.time);
      if (booking) {
        setSelectedBooking(booking);
        setIsBookingDetailOpen(true);
      } else {
        // Show slot details modal for unavailable slots
        setIsSlotDetailOpen(true);
      }
    }
  };

  const handleConfirmBooking = (booking: PendingBooking) => {
    setPendingBookings(prev => prev.filter(b => b.id !== booking.id));
    setIsBookingDetailOpen(false);
    toast({
      title: "Reserva confirmada! ✅",
      description: `Pagamento de ${booking.clientName} validado.`,
    });
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
                <p className="text-xs text-muted-foreground">Painel Administrativo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Maintenance Toggle */}
              <div className="hidden md:flex items-center gap-2">
                <Switch
                  id="maintenance"
                  checked={maintenanceMode}
                  onCheckedChange={handleMaintenanceToggle}
                />
                <Label htmlFor="maintenance" className="text-sm flex items-center gap-1">
                  <Wrench className="w-4 h-4" />
                  Manutenção
                </Label>
              </div>

              <Button 
                onClick={() => navigate("/admin/login")}
                className="w-10 h-10 p-0"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Maintenance Alert */}
      {maintenanceMode && (
        <div className="bg-status-maintenance/20 border-b border-status-maintenance/50 py-3">
          <div className="container mx-auto px-4 flex items-center gap-2 text-status-maintenance">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Modo Manutenção Ativo - Novos agendamentos estão bloqueados</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className="text-xs text-status-available font-medium">+12%</span>
            </div>
            <p className="text-2xl font-bold font-display">R$ {totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Receita Semanal</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CalendarDays className="w-8 h-8 text-accent" />
              <span className="text-xs text-status-available font-medium">+8%</span>
            </div>
            <p className="text-2xl font-bold font-display">{totalBookings}</p>
            <p className="text-sm text-muted-foreground">Reservas Totais</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-status-pending" />
            </div>
            <p className="text-2xl font-bold font-display">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <p className="text-2xl font-bold font-display">156</p>
            <p className="text-sm text-muted-foreground">Clientes Ativos</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="agenda" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="pendentes" className="gap-2">
              <Clock className="w-4 h-4" />
              Pendentes ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
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
                  onSelectSlot={handleSelectSlot}
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

          {/* Reports Tab */}
          <TabsContent value="relatorios" className="space-y-6">
            {/* Period Filter */}
            <div className="flex items-center gap-4">
              <Label>Período:</Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue by Day/Shift */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold mb-6">Receita por Turno</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Legend />
                      <Bar dataKey="diurno" name="Diurno" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="noturno" name="Noturno" fill="hsl(142, 76%, 45%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold mb-6">Métodos de Pagamento</h3>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Revenue Trend */}
              <div className="glass-card rounded-2xl p-6 lg:col-span-2">
                <h3 className="font-display text-lg font-bold mb-6">Evolução da Receita Mensal</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenueData}>
                      <defs>
                        <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, "Receita"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="receita" 
                        stroke="hsl(142, 76%, 45%)" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorReceita)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
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
