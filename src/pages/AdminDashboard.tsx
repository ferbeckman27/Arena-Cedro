import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarDays, Clock, Users, DollarSign, TrendingUp, 
  LogOut, AlertTriangle, Check, X, Wrench,
  BarChart3, FileText, Trophy
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

// --- MOCK DATA ---

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

// --- COMPONENT ---

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // ESTADOS PRINCIPAIS
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(startOfToday());
  const [isBookingDetailOpen, setIsBookingDetailOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // MOCK DE FIDELIDADE (Simulando Banco de Dados)
  const [usersFidelity, setUsersFidelity] = useState([
    { id: "1", name: "João Silva", gamesPlayed: 7 },
    { id: "2", name: "Maria Santos", gamesPlayed: 9 },
  ]);

  // MOCK DE AGENDAMENTOS PENDENTES
  const [pendingBookings, setPendingBookings] = useState([
    { id: "1", clientName: "João Silva", date: new Date(), hour: 19, price: 120, paymentMethod: "pix" },
    { id: "2", clientName: "Maria Santos", date: new Date(), hour: 20, price: 120, paymentMethod: "dinheiro" },
  ]);

  // FUNÇÃO PARA CONFIRMAR E DAR PONTO NA FIDELIDADE
  const handleConfirmAndAwardPoint = (booking: any) => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-arena.png" className="w-10 h-10 object-contain" alt="Logo" />
            <div>
              <h1 className="font-display text-lg font-bold">Arena Cedro</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold text-primary">Admin 2026</p>
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

          <TabsContent value="pendentes">
            <div className="glass-card rounded-2xl overflow-hidden border">
              <div className="p-4 bg-muted/30 border-b font-bold text-sm">Aguardando Validação de PIX / Pagamento</div>
              <div className="divide-y">
                {pendingBookings.map(b => (
                  <div key={b.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {b.clientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{b.clientName}</p>
                        <p className="text-xs text-muted-foreground uppercase">{b.paymentMethod} • R$ {b.price},00</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => {}}>Recusar</Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleConfirmAndAwardPoint(b)}>
                        <Check className="w-4 h-4 mr-2" /> Confirmar e Pontuar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
};

export default AdminDashboard;