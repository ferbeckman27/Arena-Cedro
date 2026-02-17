import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Circle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  ShoppingCart,
  LogOut,
  Star,
  Package,
  AlertTriangle,
  CreditCard,
  Send,
  User,
  MapPin,
  Phone,
  Mail,
  Crown,
  CalendarCheck,
  History,
  RefreshCcw,
  Banknote,
  Trophy,
  CircleCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- TIPOS ---
interface Product {
  id: number;
  nome: string;
  preco: number;
  tipo: 'venda' | 'aluguel';
}

interface CompraAntiga {
  id: string;
  data: string;
  item: string;
  valor: number;
  produtoOriginal: Product;
}

export const FidelityCard = ({ count }: { count: number }) => {
  const totalSlots = 10;
  
  return (
    <Card className="p-6 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black italic uppercase tracking-tighter text-[#22c55e] flex items-center gap-2">
          <Trophy className={count >= 10 ? "text-yellow-500 animate-bounce" : "text-gray-500"} />
          Cartão Fidelidade
        </h3>
        <Badge variant="outline" className="border-[#22c55e] text-[#22c55e] font-bold">
          {count}/10
        </Badge>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: totalSlots }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            {i < count ? (
              <CircleCheck className="w-8 h-8 text-green-500 fill-green-500/20" />
            ) : (
              <Circle className="w-8 h-8 text-white/10" />
            )}
            <span className="text-[10px] text-gray-500 font-bold">{i + 1}º</span>
          </div>
        ))}
      </div>
      
      {count >= 10 ? (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-center">
          <p className="text-green-400 font-bold text-sm">🎉 Parabéns! Próximo jogo é GRÁTIS!</p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-gray-500 text-center font-medium">
          Complete 10 jogos e o 11º é por nossa conta!
        </p>
      )}
    </Card>
  );
};

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- ESTADOS ---
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [emManutencao, setEmManutencao] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date());
 const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState<"pix" | "dinheiro">("pix");

  // Estados VIP e Compras
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [reservasFixas, setReservasFixas] = useState<any[]>([]);
  const pixCode = "00020126580014BR.GOV.BCB.PIX0136arena-cedro-pix-991234567-88520400005303986";
  
  const [userData] = useState({
    nome: "João Silva",
    email: "joao.silva@email.com",
    telefone: "(88) 99123-4567",
    isVip: true
  });

  const [review, setReview] = useState({ nome: "", estrelas: 5, texto: "" });

  const produtos: Product[] = [
    { id: 1, nome: "Bola Penalty S11", preco: 180, tipo: 'venda' },
    { id: 2, nome: "Aluguel de Colete (Un)", preco: 8, tipo: 'aluguel' },
    { id: 3, nome: "Gatorade 500ml", preco: 10, tipo: 'venda' },
  ];

  const [historicoCompras] = useState<CompraAntiga[]>([
    { id: "101", data: "10/02/2026", item: "Gatorade 500ml", valor: 10, produtoOriginal: produtos[2] },
  ]);

const valorApenasReserva = useMemo(() => {
    if (!horarioSelecionado) return 0;
    const horaInicio = parseInt(horarioSelecionado.split(":")[0]);
    const valorBase = horaInicio >= 18 ? 120 : 80;
    return valorBase * (selectedDuration / 60);
  }, [horarioSelecionado, selectedDuration]);

  // Total Geral (Itens + Reserva)
  const totalGeral = useMemo(() => {
    const totalItens = cart.reduce((acc, item) => acc + item.preco, 0);
    return totalItens + valorApenasReserva;
  }, [cart, valorApenasReserva]);

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // --- FUNÇÕES ---
  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    toast({ title: "Adicionado!", description: `${product.nome} no carrinho.` });
  };

  const handleReservaFixa = () => {
    if (!horarioSelecionado) return toast({ variant: "destructive", title: "Selecione um horário!" });
    const diaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(diaSelecionado);
    setReservasFixas([...reservasFixas, { id: Date.now(), dia: diaSemana, hora: `${horarioSelecionado}:00` }]);
    toast({ title: "VIP: Horário Fixo Registrado!", description: `Sua pré-reserva para toda(o) ${diaSemana} foi salva.` });
  };

  const handleFinalizePedido = () => {
    if (metodoPagamento === "dinheiro") {
      toast({ title: "Confirmado!", description: "Sua reserva/pedido foi registrado para pagamento no local." });
      setIsCheckoutOpen(false);
      setCart([]);
      setHorarioSelecionado(null);
    } else {
      navigator.clipboard.writeText(pixCode);
      toast({ title: "Código Copiado!", description: "Pague no app do seu banco para confirmar." });
    }
  };

  const handleSubmitReview = () => {
    if (!review.texto) return toast({ variant: "destructive", title: "Escreva algo!" });
    toast({ title: "Obrigado!", description: "Sua avaliação foi enviada." });
    setReview({ nome: "", estrelas: 5, texto: "" });
  };

  const gerarHorarios = () => {
  const blocos = [
    "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:30", // Bloco de 1h30
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
  "21:00 - 22:30"  // Bloco de 1h30
  ];
  return blocos;
};

  if (emManutencao) return (
    <div className="min-h-screen bg-[#060a08] flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle size={60} className="text-red-500 animate-pulse mb-4" />
      <h1 className="text-4xl font-black text-white italic uppercase">Arena em Pausa</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-col items-center gap-1">
            <img src="/logo-arena.png" alt="Logo" className="w-40 h-40 object-contain" />
            <h1 className="text-[10px] font-black italic uppercase tracking-widest text-[#22c55e]">Arena Cedro</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate("/login")} className="text-red-500 hover:bg-red-500/10"><LogOut size={22} /></Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs defaultValue="agendar" className="space-y-8">
          <TabsList className="bg-white/5 p-1 rounded-2xl w-full max-w-2xl mx-auto h-16 grid grid-cols-4 border border-white/5">
            <TabsTrigger value="agendar" className="rounded-xl font-bold uppercase italic">Agenda</TabsTrigger>
            <TabsTrigger value="loja" className="rounded-xl font-bold uppercase italic">Loja</TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl font-bold uppercase italic">Avaliar</TabsTrigger>
            <TabsTrigger value="perfil" className="rounded-xl font-bold uppercase italic">Minha Conta</TabsTrigger>
          </TabsList>

          {/* AGENDA */}
          <TabsContent value="agendar" className="space-y-6">
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                <Card className="bg-white border-none overflow-hidden rounded-[2.5rem] shadow-2xl">
                  <div className="bg-[#22c55e] p-6 flex items-center justify-between text-black">
                    <button onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() - 1)))}><ChevronLeft size={24} /></button>
                    <h2 className="text-xl font-black uppercase italic">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesAtual)}</h2>
                    <button onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() + 1)))}><ChevronRight size={24} /></button>
                  </div>
                  <div className="grid grid-cols-7 text-center bg-gray-50 text-[10px] font-black text-gray-400 py-2">
                    {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7">
                    {/* Lógica da folhinha simplificada */}
                    {Array.from({ length: 31 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setDiaSelecionado(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i + 1))}
                        className={cn(
                          "h-14 md:h-20 border-r border-b border-gray-50 flex flex-col items-center justify-center font-black",
                          diaSelecionado.getDate() === i + 1 ? "bg-[#22c55e] text-black" : "bg-white text-black hover:bg-gray-100"
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <Card className="bg-black/40 border-white/5 p-6 rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2"><Clock className="text-[#22c55e]" size={20}/><h3 className="font-black uppercase italic text-sm">Horários</h3></div>
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                      {[60, 90].map(m => (
                        <button key={m} onClick={() => setSelectedDuration(m)} className={cn("px-4 py-2 rounded-lg text-[10px] font-black", selectedDuration === m ? "bg-[#22c55e] text-black" : "text-gray-500")}>{m}M</button>
                      ))}
                    </div>
                  </div>
                  <ScrollArea className="h-[320px] pr-4">
  <div className="grid grid-cols-1 gap-3">
    {gerarHorarios().map((intervalo) => (
      <button
        key={intervalo}
        onClick={() => setHorarioSelecionado(intervalo as any)}
        className={cn(
          "w-full py-4 rounded-xl border font-black text-lg transition-all shadow-lg",
          horarioSelecionado === intervalo 
            ? "border-[#22c55e] bg-[#22c55e]/20 text-[#22c55e]" 
            : "border-gray-800 bg-black text-[#3b82f6] hover:border-[#3b82f6]/50"
        )}
      >
        {intervalo}
      </button>
    ))}
  </div>
</ScrollArea>
                  <div className="mt-6 space-y-3">
                    <Button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14 rounded-2xl">Reservar</Button>
                    {userData.isVip && (
                      <Button onClick={handleReservaFixa} variant="outline" className="w-full border-[#22c55e] text-[#22c55e] font-black uppercase italic h-14 rounded-2xl gap-2">
                        <Crown size={18} /> Reserva Fixa VIP
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* LOJA */}
          <TabsContent value="loja">
             <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {produtos.map(p => (
                    <Card key={p.id} className="bg-black/40 border-white/5 p-4 rounded-[2rem]">
                      <div className="flex justify-between items-center text-white">
                        <div className="flex items-center gap-3"><Package className="text-[#22c55e]"/><h4 className="font-bold text-sm uppercase italic">{p.nome}</h4></div>
                        <Button onClick={() => addToCart(p)} className="bg-[#22c55e] text-black rounded-xl"><ShoppingCart size={18}/></Button>
                      </div>
                    </Card>
                  ))}
                </div>
                <Card className="bg-[#0c120f] border-white/10 p-6 rounded-[2rem] h-fit">
                   <h3 className="italic font-black uppercase mb-4">Carrinho</h3>
                   <div className="flex justify-between font-black text-2xl text-[#22c55e] mb-4"><span>Total:</span><span>R$ {totalGeral.toFixed(2)}</span></div>
                   <Button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-[#22c55e] text-black font-black italic h-12 rounded-xl">Finalizar</Button>
                </Card>
             </div>
          </TabsContent>

          {/* FEEDBACK */}
          <TabsContent value="feedback">
            <Card className="bg-black/40 border-white/5 p-8 rounded-[2.5rem] max-w-2xl mx-auto">
              <CardTitle className="text-3xl font-black uppercase italic mb-6">Sua <span className="text-[#22c55e]">Opinião</span></CardTitle>
              <div className="space-y-4 text-white">
                <Input placeholder="Seu Nome" className="bg-white/5 border-white/10" value={review.nome} onChange={(e) => setReview({...review, nome: e.target.value})} />
                <div className="flex gap-2">
                   {[1,2,3,4,5].map(n => <Star key={n} onClick={() => setReview({...review, estrelas: n})} className={cn(review.estrelas >= n ? "text-yellow-400 fill-yellow-400" : "text-gray-600")} />)}
                </div>
                <Textarea placeholder="Como foi sua experiência?" className="bg-white/5 border-white/10" value={review.texto} onChange={(e) => setReview({...review, texto: e.target.value})} />
                <Button onClick={handleSubmitReview} className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14 rounded-2xl">Publicar</Button>
              </div>
            </Card>
          </TabsContent>

          {/* PERFIL (RESERVA FIXA + HISTÓRICO) */}
          <TabsContent value="perfil">
             <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-black/40 border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center">
                   <User size={48} className="text-[#22c55e] mb-4" />
                   <h3 className="font-black italic uppercase">{userData.nome}</h3>
                   {userData.isVip && <Badge className="bg-[#22c55e] text-black font-black mt-2">VIP</Badge>}
                </Card>
                <div className="md:col-span-2 space-y-6">
                   <Card className="bg-black/40 border-white/5 p-6 rounded-[2.5rem]">
                      <h4 className="text-[#22c55e] text-xs font-black uppercase italic mb-4 flex items-center gap-2"><CalendarCheck size={16}/> Horários Fixos</h4>
                      {reservasFixas.map((r, i) => (
                        <div key={i} className="flex justify-between bg-white/5 p-3 rounded-xl mb-2 border border-white/5 font-bold uppercase text-xs">
                           <span>{r.dia}s</span><span className="text-[#22c55e]">{r.hora}</span>
                        </div>
                      ))}
                   </Card>
                   <Card className="bg-black/40 border-white/5 p-6 rounded-[2.5rem]">
                      <h4 className="text-[#22c55e] text-xs font-black uppercase italic mb-4 flex items-center gap-2"><History size={16}/> Compras e Recompra</h4>
                      {historicoCompras.map(c => (
                        <div key={c.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                           <div><p className="font-bold text-xs uppercase">{c.item}</p><p className="text-[9px] text-gray-500">{c.data}</p></div>
                           <Button onClick={() => addToCart(c.produtoOriginal)} size="sm" variant="outline" className="border-[#22c55e] text-[#22c55e] text-[10px] gap-2"><RefreshCcw size={12}/> Comprar Denovo</Button>
                        </div>
                      ))}
                   </Card>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL DE PAGAMENTO UNIFICADO */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-[#0c120f] border-white/10 text-white max-w-[420px] rounded-[2.5rem] p-8 outline-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase text-[#22c55e] flex items-center gap-2">
              <ShoppingCart size={20} /> Checkout Arena
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* RESUMO DO PEDIDO */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
              <p className="text-[10px] font-black uppercase text-gray-500 italic">Resumo do Pedido</p>
              
              {/* Se houver reserva selecionada */}
              {horarioSelecionado && (
                <div className="flex justify-between items-center text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={14} className="text-[#22c55e]"/>
                    <span>Reserva ({horarioSelecionado})</span>
                  </div>
                  <span>R$ {valorApenasReserva.toFixed(2)}</span>
                </div>
              )}

              {/* Lista de Produtos no Carrinho */}
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Package size={14} />
                    <span>{item.nome}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>R$ {item.preco.toFixed(2)}</span>
                    <button onClick={() => removeFromCart(idx)} className="text-red-500 hover:scale-110 transition-transform">
                      <CircleCheck className="rotate-45" size={14} /> {/* X de remover */}
                    </button>
                  </div>
                </div>
              ))}

              {(!horarioSelecionado && cart.length === 0) && (
                <p className="text-center text-xs text-gray-500 py-2">Nenhum item selecionado.</p>
              )}

              <Separator className="bg-white/10" />
              <div className="flex justify-between items-center font-black text-lg text-[#22c55e] italic">
                <span>TOTAL:</span>
                <span>R$ {totalGeral.toFixed(2)}</span>
              </div>
            </div>

            {/* SELEÇÃO DE PAGAMENTO */}
            <RadioGroup defaultValue="pix" onValueChange={(v) => setMetodoPagamento(v as any)} className="grid grid-cols-2 gap-4">
              <div className={cn("flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all", metodoPagamento === "pix" ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5")}>
                <Label htmlFor="pix" className="flex items-center gap-2 font-bold text-xs cursor-pointer"><CreditCard size={14}/> PIX</Label>
                <RadioGroupItem value="pix" id="pix" />
              </div>
              <div className={cn("flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all", metodoPagamento === "dinheiro" ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5")}>
                <Label htmlFor="dinheiro" className="flex items-center gap-2 font-bold text-xs cursor-pointer"><Banknote size={14}/> LOCAL</Label>
                <RadioGroupItem value="dinheiro" id="dinheiro" />
              </div>
            </RadioGroup>

            {/* QR CODE OU AVISO DE DINHEIRO */}
            <div className="bg-black/60 p-4 rounded-3xl border border-white/5 text-center">
               {metodoPagamento === "pix" ? (
                 <div className="flex flex-col items-center gap-3">
                   <div className="bg-white p-2 rounded-xl"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${pixCode}`} className="w-28 h-28" /></div>
                   <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Aguardando pagamento...</p>
                 </div>
               ) : (
                 <div className="py-4">
                   <Banknote size={32} className="mx-auto text-[#22c55e] mb-2"/>
                   <p className="text-xs font-bold uppercase italic leading-tight text-gray-300">Pague na recepção ao chegar na Arena.</p>
                 </div>
               )}
            </div>

            <Button 
              onClick={handleFinalizePedido} 
              disabled={!horarioSelecionado && cart.length === 0}
              className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition-transform"
            >
               {metodoPagamento === "pix" ? "Copiar Código e Finalizar" : "Confirmar Agendamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClienteDashboard;