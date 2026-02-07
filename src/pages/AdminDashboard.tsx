import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CalendarDays, Clock, Users, DollarSign, TrendingUp, 
  LogOut, AlertTriangle, Check, X, Wrench,
  BarChart3, FileText, Trophy, Settings, Bell, Eye, Package, Download, AlertOctagon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";

// --- MOCK DATA ---
const generateMockSchedule = (): DaySchedule[] => {
  const today = startOfToday();
  const schedule: DaySchedule[] = [];
  for (let i = -30; i < 60; i++) {
    const date = addDays(today, i);
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour < 22; hour++) {
      for (let half = 0; half < 2; half++) {
        const status: TimeSlot["status"] = Math.random() > 0.7 ? "unavailable" : "available";
        slots.push({
          time: `${hour.toString().padStart(2, "0")}:${half === 0 ? "00" : "30"}`,
          status,
          price: hour >= 18 ? 120 : 80,
          bookedBy: status === "unavailable" ? "Cliente VIP" : undefined,
        });
      }
    }
    schedule.push({ date, slots });
  }
  return schedule;
};

const revenueData = [
  { name: "Seg", diurno: 320, noturno: 480 },
  { name: "Ter", diurno: 240, noturno: 360 },
  { name: "Qua", diurno: 400, noturno: 600 },
  { name: "Qui", diurno: 320, noturno: 480 },
  { name: "Sex", diurno: 480, noturno: 720 },
  { name: "Sáb", diurno: 640, noturno: 840 },
  { name: "Dom", diurno: 560, noturno: 600 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // ESTADOS
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(startOfToday());
  const [isBookingDetailOpen, setIsBookingDetailOpen] = useState(false);
  const [isSlotDetailOpen, setIsSlotDetailOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [schedule] = useState<DaySchedule[]>(generateMockSchedule());
  const [usersFidelity] = useState([
    { id: "1", name: "João Silva", gamesPlayed: 7 },
    { id: "2", name: "Maria Santos", gamesPlayed: 9 },
    { id: "3", name: "Ricardo T.", gamesPlayed: 10 },
  ]);

  const selectedDaySchedule = selectedDate 
    ? schedule.find(day => day.date.toDateString() === selectedDate.toDateString())
    : null;

  return (
    <div className="min-h-screen bg-[#060a08] text-white p-4 md:p-8 space-y-8">
      
      {/* HEADER ESTILO MASTER ADMIN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-[#22c55e]">Master Admin</h1>
          <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase">Gestão Estratégica Arena Cedro</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="uppercase font-black text-xs border-white/10 bg-white/5">
            Relatório Sintético (PDF)
          </Button>
          <Button className="uppercase font-black text-xs bg-[#22c55e] text-black hover:bg-[#16a34a]">
            <Download className="mr-2 w-4 h-4" /> Relatório Analítico (PDF)
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/login")} className="text-red-500">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* MÉTRICAS DE PERFORMANCE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-white/10 p-6 hover:border-[#22c55e]/50 transition-colors">
          <TrendingUp className="text-[#22c55e] mb-2" />
          <p className="text-gray-500 text-[10px] uppercase font-bold">Faturamento Total (Mês)</p>
          <h3 className="text-2xl font-black italic">R$ 18.250,00</h3>
          <p className="text-[10px] text-[#22c55e] mt-1 font-bold">+12% vs Dez/25</p>
        </Card>
        <Card className="bg-white/5 border-white/10 p-6">
          <Users className="text-blue-500 mb-2" />
          <p className="text-gray-500 text-[10px] uppercase font-bold">Mensalistas VIP</p>
          <h3 className="text-2xl font-black italic">12 Horários Fixos</h3>
        </Card>
        <Card className="bg-white/5 border-white/10 p-6">
          <Package className="text-yellow-500 mb-2" />
          <p className="text-gray-500 text-[10px] uppercase font-bold">Itens em Estoque</p>
          <h3 className="text-2xl font-black italic">45 Unidades</h3>
        </Card>
        <Card className="bg-white/5 border-white/10 p-6">
          <AlertOctagon className="text-red-500 mb-2" />
          <p className="text-gray-500 text-[10px] uppercase font-bold">Alertas Pendentes</p>
          <h3 className="text-2xl font-black italic">03 Alertas</h3>
        </Card>
      </div>

      {/* MANUTENÇÃO GLOBAL */}
      <Card className={`p-6 transition-all border ${maintenanceMode ? 'bg-red-950/40 border-red-500' : 'bg-white/5 border-white/10'} rounded-3xl flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <Wrench className={maintenanceMode ? "text-red-500" : "text-gray-500"} />
          <div>
            <h3 className={`font-black uppercase italic ${maintenanceMode ? 'text-red-500' : 'text-white'}`}>Modo de Manutenção</h3>
            <p className="text-xs text-gray-400">Bloqueia agendamentos automáticos para clientes no site.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
        </div>
      </Card>

      {/* SISTEMA DE ABAS PRINCIPAIS */}
      <Tabs defaultValue="agenda" className="space-y-6">
        <TabsList className="bg-white/5 p-1 border border-white/10 h-14 rounded-2xl">
          <TabsTrigger value="agenda" className="rounded-xl font-bold uppercase italic data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Agenda Master</TabsTrigger>
          <TabsTrigger value="relatorios" className="rounded-xl font-bold uppercase italic data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Financeiro & Estoque</TabsTrigger>
          <TabsTrigger value="fidelidade" className="rounded-xl font-bold uppercase italic data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Fidelidade VIP</TabsTrigger>
        </TabsList>

        {/* ABA AGENDA */}
        <TabsContent value="agenda" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
              <BookingCalendar
                schedule={schedule}
                onSelectDay={setSelectedDate}
                selectedDate={selectedDate}
                isAdmin
              />
            </div>

            {selectedDate && selectedDaySchedule ? (
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
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
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center">
                <CalendarDays className="w-16 h-16 text-gray-700 mb-4" />
                <h3 className="font-black uppercase italic">Selecione uma data</h3>
                <p className="text-gray-500 text-sm">Clique em um dia para gerenciar os horários da Arena.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ABA RELATÓRIOS E ESTOQUE */}
        <TabsContent value="relatorios" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* GRÁFICO FINANCEIRO */}
            <Card className="bg-white/5 border-white/10 p-6 rounded-[2rem]">
              <h3 className="font-black uppercase italic mb-6 flex items-center gap-2">
                <BarChart3 className="text-[#22c55e]" /> Receita por Turno
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#666'}} />
                    <Tooltip contentStyle={{backgroundColor: '#0c120f', border: '1px solid #ffffff10'}} />
                    <Bar dataKey="diurno" name="Diurno" fill="#eab308" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="noturno" name="Noturno" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* CONTROLE DE ESTOQUE */}
            <Card className="bg-white/5 border-white/10 p-6 rounded-[2rem]">
              <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2">
                <Package className="text-yellow-500" /> Controle de Materiais
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/10">
                    <tr>
                      <th className="pb-4">Item</th>
                      <th className="pb-4 text-center">Total</th>
                      <th className="pb-4 text-right">Lucro Acum.</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold">Bola Penalty S11</td>
                      <td className="py-4 text-center">06</td>
                      <td className="py-4 text-right text-[#22c55e] font-bold">R$ 450,00</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold">Colete Treino (Kit)</td>
                      <td className="py-4 text-center">20</td>
                      <td className="py-4 text-right text-[#22c55e] font-bold">R$ 820,00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ABA FIDELIDADE */}
        <TabsContent value="fidelidade">
           <Card className="bg-white/5 border-white/10 p-8 rounded-[2rem]">
              <h3 className="font-black uppercase italic mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Ranking de Fidelidade (10 + 1)
              </h3>
              <div className="grid gap-4">
                {usersFidelity.sort((a,b) => b.gamesPlayed - a.gamesPlayed).map(u => (
                  <div key={u.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#22c55e]/10 flex items-center justify-center font-bold text-[#22c55e]">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-bold uppercase italic">{u.name}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-1 md:max-w-md">
                      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${u.gamesPlayed >= 10 ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-[#22c55e]'}`} 
                          style={{ width: `${(u.gamesPlayed / 10) * 100}%` }} 
                        />
                      </div>
                      <span className="text-xs font-black min-w-[50px]">{u.gamesPlayed}/10 JOGOS</span>
                    </div>
                    {u.gamesPlayed >= 10 && (
                      <Badge className="bg-yellow-500 text-black font-black uppercase italic">Prêmio Disponível</Badge>
                    )}
                  </div>
                ))}
              </div>
           </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL DE DETALHES DO HORÁRIO (QUANDO CLICA NA AGENDA) */}
      <Dialog open={isSlotDetailOpen} onOpenChange={setIsSlotDetailOpen}>
        <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic ">Informações do Horário</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-4 py-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Status</p>
                  <p className={`font-black uppercase italic ${selectedSlot.status === 'available' ? 'text-[#22c55e]' : 'text-red-500'}`}>
                    {selectedSlot.status === 'available' ? 'Livre' : 'Ocupado'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Valor Base</p>
                  <p className="font-black italic text-white">R$ {selectedSlot.price},00</p>
                </div>
                {selectedSlot.bookedBy && (
                  <div className="col-span-2 border-t border-white/5 pt-4">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Reservado por:</p>
                    <p className="font-black uppercase text-[#22c55e]">{selectedSlot.bookedBy}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 bg-white text-black font-black uppercase italic" onClick={() => setIsSlotDetailOpen(false)}>Fechar</Button>
                {selectedSlot.status !== 'available' && (
                  <Button variant="destructive" className="flex-1 font-black uppercase italic">Cancelar Reserva</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;