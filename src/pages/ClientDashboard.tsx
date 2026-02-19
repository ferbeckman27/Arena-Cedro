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
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  LogOut,
  Star,
  Package,
  AlertTriangle,
  CreditCard,
  User,
  CalendarCheck,
  History,
  RefreshCcw,
  Banknote,
  Crown,
  CircleCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Importação do seu componente novo
import { FidelityCard } from "@/components/dashboard/FidelityCard";

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

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- ESTADOS ---
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [emManutencao] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date());
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [metodoPagamento, setMetodoPagamento] = useState<"pix" | "dinheiro">("pix");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [reservasFixas, setReservasFixas] = useState<any[]>([]);
  
  const pixCode = "00020126580014BR.GOV.BCB.PIX0136arena-cedro-pix-991234567-88520400005303986";
  
  const getAuth = (key: string) => sessionStorage.getItem(key) || localStorage.getItem(key);
  const [userData, setUserData] = useState({
  id: getAuth("userId") || "",
  nome: getAuth("userName") || "Jogador",
  email: getAuth("userEmail") || "",
  isVip: getAuth("userRole") === "vip"
});

// Adicione um useEffect para buscar o progresso de fidelidade real do banco
const [progressoFidelidade, setProgressoFidelidade] = useState(0);

useEffect(() => {
  const carregarDadosReais = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/fidelidade/${userData.id}`);
      const data = await response.json();
      setProgressoFidelidade(data.totalConcluido);
    } catch (e) {
      console.log("Erro ao carregar fidelidade");
    }
  };
  if(userData.id) carregarDadosReais();
}, [userData.id]);

  const [review, setReview] = useState({ nome: "", estrelas: 5, texto: "" });

  const produtos: Product[] = [
    { id: 1, nome: "Bola Penalty S11", preco: 180, tipo: 'venda' },
    { id: 2, nome: "Aluguel de Colete (Un)", preco: 8, tipo: 'aluguel' },
    { id: 3, nome: "Gatorade 500ml", preco: 10, tipo: 'venda' },
  ];

  const [historicoCompras] = useState<CompraAntiga[]>([
    { id: "101", data: "10/02/2026", item: "Gatorade 500ml", valor: 10, produtoOriginal: produtos[2] },
  ]);

  // --- CÁLCULOS ---
  const valorApenasReserva = useMemo(() => {
    if (!horarioSelecionado) return 0;
    const horaInicio = parseInt(horarioSelecionado.split(":")[0]);
    const valorBase = horaInicio >= 18 ? 120 : 80;
    return valorBase * (selectedDuration / 60);
  }, [horarioSelecionado, selectedDuration]);

  const totalGeral = useMemo(() => {
    const totalItens = cart.reduce((acc, item) => acc + item.preco, 0);
    return totalItens + valorApenasReserva;
  }, [cart, valorApenasReserva]);

  // --- FUNÇÕES ---
  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    toast({ title: "Adicionado!", description: `${product.nome} no carrinho.` });
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    navigate("/"); 
  };

  const handleSubmitReview = () => {
    if (!review.texto) return toast({ variant: "destructive", title: "Escreva algo!" });
    toast({ title: "Obrigado!", description: "Sua avaliação foi enviada para moderação." });
    setReview({ nome: "", estrelas: 5, texto: "" });
  };

  const handleFinalizePedido = async () => {
  const reservaData = {
    cliente_id: 1, // Pegar do seu localStorage ou Contexto de Login
    data: diaSelecionado.toISOString().split('T')[0],
    horario: horarioSelecionado,
    duracao: selectedDuration,
    metodo_pagamento: metodoPagamento,
    total: totalGeral,
    itens: cart.map(item => item.id) // IDs dos produtos (Gatorade, colete, etc)
  };

  try {
    const response = await fetch("http://localhost:3001/api/finalizar-reserva", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservaData),
    });

    if (response.ok) {
      if (metodoPagamento === "pix") {
        navigator.clipboard.writeText(pixCode);
        toast({ title: "PIX Copiado!", description: "Pague para validar sua reserva." });
      } else {
        toast({ title: "Confirmado!", description: "Reserva salva! Pague na recepção." });
      }
      
      // Limpa tudo após o sucesso
      setIsCheckoutOpen(false);
      setCart([]);
      setHorarioSelecionado(null);
    }
  } catch (error) {
    toast({ variant: "destructive", title: "Erro ao salvar reserva." });
  }
};

  const gerarHorarios = () => {
  const horarios: string[] = [];
  
  // Turno Manhã/Tarde: 08:00 às 17:00
  for (let hora = 8; hora <= 16; hora++) {
    horarios.push(`${hora.toString().padStart(2, '0')}:00`);
    horarios.push(`${hora.toString().padStart(2, '0')}:30`);
  }

  // Turno Noite: 18:00 às 22:00
  for (let hora = 18; hora <= 22; hora++) {
    horarios.push(`${hora.toString().padStart(2, '0')}:00`);
    horarios.push(`${hora.toString().padStart(2, '0')}:30`);
  }

  return horarios;
};

  if (emManutencao) return (
    <div className="min-h-screen bg-[#060a08] flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle size={60} className="text-red-500 animate-pulse mb-4" />
      <h1 className="text-4xl font-black text-white italic uppercase">Arena em Pausa</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans">
      <header className="border-b border-white/10 bg-black/60 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-col items-center">
            <img src="/media/logo-arena.png" alt="Logo" className="w-40 h-40 object-contain" />
          <span className="text-[20px] font-black uppercase text-[#22c55e] tracking-[0.2em]">BEM VINDO AO PAINEL DO CLIENTE</span>
        </div>
        </div>
        <button onClick={handleLogout} className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all">
          <LogOut size={20} />
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* --- INTEGRAÇÃO DO COMPONENTE FIDELITYCARD --- */}
        <div className="mb-12">
          <FidelityCard count={progressoFidelidade} />
        </div>

        <Tabs defaultValue="agendar" className="space-y-8">
          <TabsList className="bg-white/5 p-1 rounded-2xl w-full max-w-2xl mx-auto h-16 grid grid-cols-4 border border-white/5">
            <TabsTrigger value="agendar" className="rounded-xl font-bold uppercase italic">Agenda</TabsTrigger>
            <TabsTrigger value="loja" className="rounded-xl font-bold uppercase italic">Loja</TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl font-bold uppercase italic">Avaliar</TabsTrigger>
            <TabsTrigger value="perfil" className="rounded-xl font-bold uppercase italic">Perfil</TabsTrigger>
          </TabsList>

          {/* AGENDA */}
          <TabsContent value="agendar" className="grid lg:grid-cols-12 gap-8 outline-none">
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

            <div className="lg:col-span-5">
              <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="text-[#22c55e]" size={20}/>
                    <h3 className="font-black uppercase italic text-sm">Horários Disponíveis</h3>
                  </div>
                  <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
  {[30, 60, 90].map(m => (
    <button 
      key={m} 
      onClick={() => {
        setSelectedDuration(m);
        setHorarioSelecionado(""); // Limpa seleção ao mudar duração
      }} 
      className={cn(
        "px-4 py-2 rounded-lg text-[10px] font-black transition-all", 
        selectedDuration === m ? "bg-[#22c55e] text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "text-gray-500 hover:text-gray-300"
      )}
    >
      {m}M
    </button>
  ))}
</div>
                </div>
                
                <ScrollArea className="h-[400px] pr-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {gerarHorarios().map((hora) => {
      // Cálculo do Horário de Término
      const [h, m] = hora.split(":").map(Number);
      const dataFim = new Date(0, 0, 0, h, m + selectedDuration);
      const fim = `${dataFim.getHours().toString().padStart(2, '0')}:${dataFim.getMinutes().toString().padStart(2, '0')}`;
      
      const isSelecionado = horarioSelecionado === hora;

      return (
        <button
          key={hora}
          onClick={() => setHorarioSelecionado(hora)}
          className={cn(
            "p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all h-20",
            isSelecionado 
              ? "border-[#22c55e] bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
              : "border-white/5 bg-white/5 text-white hover:border-white/20"
          )}
        >
          {/* Exibição: 09:00 - 09:30 */}
          <span className="text-sm font-black italic tracking-tighter">
            {hora} — {fim}
          </span>
          
          <span className={cn(
            "text-[9px] font-bold uppercase mt-1", 
            isSelecionado ? "text-black/60" : "text-[#22c55e]"
          )}>
            Livre
          </span>
        </button>
      );
    })}
  </div>
</ScrollArea>

                <Button 
                  disabled={!horarioSelecionado}
                  onClick={() => setIsCheckoutOpen(true)} 
                  className="w-full bg-[#22c55e] hover:bg-[#1eb054] text-black font-black uppercase italic h-14 rounded-2xl mt-6 transition-all"
                >
                  Reservar Agora
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* LOJA */}
          <TabsContent value="loja" className="grid lg:grid-cols-3 gap-8 outline-none">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {produtos.map(p => (
                <Card key={p.id} className="bg-white/5 border-white/10 p-6 rounded-[2rem] group hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#22c55e]/10 rounded-xl flex items-center justify-center text-[#22c55e]">
                        <Package size={24}/>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm uppercase italic text-white">{p.nome}</h4>
                        <p className="text-[#22c55e] font-black">R$ {p.preco.toFixed(2)}</p>
                      </div>
                    </div>
                    <Button onClick={() => addToCart(p)} size="icon" className="bg-[#22c55e] text-black rounded-xl hover:scale-110 transition-transform">
                      <ShoppingCart size={18}/>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[2.5rem] h-fit sticky top-24">
               <h3 className="italic font-black uppercase mb-6 flex items-center gap-2">
                 <ShoppingCart size={20} className="text-[#22c55e]"/> Seu Carrinho
               </h3>
               <div className="space-y-4 mb-8">
                 {cart.length === 0 ? (
                   <p className="text-gray-500 text-xs italic">Carrinho vazio...</p>
                 ) : (
                   cart.map((item, i) => (
                     <div key={i} className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                       <span>{item.nome}</span>
                       <span>R$ {item.preco.toFixed(2)}</span>
                     </div>
                   ))
                 )}
               </div>
               <Separator className="bg-white/10 mb-4" />
               <div className="flex justify-between font-black text-2xl text-[#22c55e] mb-6 italic">
                 <span>Total:</span>
                 <span>R$ {totalGeral.toFixed(2)}</span>
               </div>
               <Button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-[#22c55e] text-black font-black italic h-14 rounded-2xl shadow-lg shadow-[#22c55e]/10">Finalizar Pedido</Button>
            </Card>
          </TabsContent>

          {/* FEEDBACK */}
          <TabsContent value="feedback" className="outline-none">
            <Card className="bg-white/5 border-white/10 p-10 rounded-[3rem] max-w-2xl mx-auto backdrop-blur-md">
              <div className="text-center mb-8">
                <Star className="mx-auto text-[#22c55e] mb-4 fill-[#22c55e]" size={40} />
                <h2 className="text-3xl font-black uppercase italic text-white">Sua <span className="text-[#22c55e]">Opinião</span></h2>
                <p className="text-gray-500 text-xs font-bold uppercase mt-2 tracking-widest">Ajude-nos a melhorar a Arena</p>
              </div>
              <div className="space-y-6">
                <Input placeholder="Seu Nome" className="bg-white/5 border-white/10 h-14 rounded-xl" value={review.nome} onChange={(e) => setReview({...review, nome: e.target.value})} />
                <div className="flex justify-center gap-3">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setReview({...review, estrelas: n})}>
                        <Star className={cn("w-8 h-8 transition-all", review.estrelas >= n ? "text-yellow-400 fill-yellow-400 scale-110" : "text-gray-700")} />
                      </button>
                    ))}
                </div>
                <Textarea placeholder="Como foi sua experiência na Arena?" className="bg-white/5 border-white/10 min-h-[120px] rounded-xl" value={review.texto} onChange={(e) => setReview({...review, texto: e.target.value})} />
                <Button onClick={handleSubmitReview} className="w-full bg-[#22c55e] text-black font-black uppercase italic h-16 rounded-2xl text-lg transition-all hover:tracking-widest">Enviar Avaliação</Button>
              </div>
            </Card>
          </TabsContent>

          {/* PERFIL */}
          <TabsContent value="perfil" className="grid md:grid-cols-3 gap-8 outline-none">
            <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-[#22c55e]/20 rounded-full flex items-center justify-center border-2 border-[#22c55e]">
                    <User size={48} className="text-[#22c55e]" />
                  </div>
                  {userData.isVip && <div className="absolute -top-2 -right-2 bg-yellow-500 p-2 rounded-full text-black animate-bounce"><Crown size={16}/></div>}
                </div>
                <h3 className="font-black italic uppercase text-xl mt-4 text-white">{userData.nome}</h3>
                <p className="text-gray-500 text-xs font-bold">{userData.email}</p>
                <Badge className="bg-[#22c55e] text-black font-black mt-4 px-4 py-1 rounded-full uppercase italic">Membro Ouro</Badge>
            </Card>
            
            <div className="md:col-span-2 space-y-6">
                <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem]">
                  <h4 className="text-[#22c55e] text-xs font-black uppercase italic mb-6 flex items-center gap-2 tracking-widest"><CalendarCheck size={18}/> Horários Fixos (VIP)</h4>
                  {reservasFixas.length === 0 ? (
                    <p className="text-gray-500 text-xs italic">Nenhuma reserva fixa registrada.</p>
                  ) : (
                    reservasFixas.map((r, i) => (
                      <div key={i} className="flex justify-between bg-black/40 p-4 rounded-2xl mb-3 border border-white/5 items-center">
                          <span className="font-black uppercase text-xs italic">{r.dia}s</span>
                          <span className="bg-[#22c55e] text-black px-3 py-1 rounded-lg font-black text-xs">{r.hora}</span>
                      </div>
                    ))
                  )}
                </Card>

                <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem]">
                  <h4 className="text-[#22c55e] text-xs font-black uppercase italic mb-6 flex items-center gap-2 tracking-widest"><History size={18}/> Histórico Recente</h4>
                  <div className="space-y-3">
                    {historicoCompras.map(c => (
                      <div key={c.id} className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                          <div>
                            <p className="font-black text-xs uppercase text-white italic">{c.item}</p>
                            <p className="text-[10px] text-gray-500 font-bold">{c.data}</p>
                          </div>
                          <Button onClick={() => addToCart(c.produtoOriginal)} size="sm" variant="outline" className="border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black text-[10px] font-black uppercase italic gap-2 transition-all">
                            <RefreshCcw size={12}/> Recomprar
                          </Button>
                      </div>
                    ))}
                  </div>
                </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL DE CHECKOUT UNIFICADO */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-[#0c120f] border-white/10 text-white max-w-[420px] rounded-[3rem] p-8 outline-none backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase text-[#22c55e] flex items-center gap-3">
              <ShoppingCart size={24} /> Checkout
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
              <p className="text-[10px] font-black uppercase text-gray-500 italic tracking-widest">Itens do Pedido</p>
              
              {horarioSelecionado && (
                <div className="flex justify-between items-center text-sm font-bold bg-[#22c55e]/5 p-3 rounded-xl border border-[#22c55e]/20">
                  <div className="flex items-center gap-2 text-[#22c55e]">
                    <CalendarCheck size={16}/>
                    <span>Quadra ({horarioSelecionado})</span>
                  </div>
                  <span className="text-white">R$ {valorApenasReserva.toFixed(2)}</span>
                </div>
              )}

              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm font-bold px-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Package size={14} />
                    <span>{item.nome}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>R$ {item.preco.toFixed(2)}</span>
                    <button onClick={() => removeFromCart(idx)} className="text-red-500 hover:scale-125 transition-all">
                      <CircleCheck className="rotate-45" size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <Separator className="bg-white/10" />
              <div className="flex justify-between items-center font-black text-2xl text-[#22c55e] italic pt-2">
                <span>TOTAL:</span>
                <span>R$ {totalGeral.toFixed(2)}</span>
              </div>
            </div>

            <RadioGroup defaultValue="pix" onValueChange={(v) => setMetodoPagamento(v as any)} className="grid grid-cols-2 gap-4">
              <div className={cn("flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all gap-2", metodoPagamento === "pix" ? "border-[#22c55e] bg-[#22c55e]/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : "border-white/5")}>
                <RadioGroupItem value="pix" id="pix" className="sr-only" />
                <Label htmlFor="pix" className="flex flex-col items-center gap-2 font-black text-[10px] uppercase cursor-pointer">
                  <CreditCard size={20} className={metodoPagamento === "pix" ? "text-[#22c55e]" : "text-gray-600"}/> PIX ONLINE
                </Label>
              </div>
              <div className={cn("flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all gap-2", metodoPagamento === "dinheiro" ? "border-[#22c55e] bg-[#22c55e]/10" : "border-white/5")}>
                <RadioGroupItem value="dinheiro" id="dinheiro" className="sr-only" />
                <Label htmlFor="dinheiro" className="flex flex-col items-center gap-2 font-black text-[10px] uppercase cursor-pointer">
                  <Banknote size={20} className={metodoPagamento === "dinheiro" ? "text-[#22c55e]" : "text-gray-600"}/> PAGAR NO LOCAL
                </Label>
              </div>
            </RadioGroup>

            <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 text-center">
               {metodoPagamento === "pix" ? (
                 <div className="flex flex-col items-center gap-4">
                   <div className="bg-white p-3 rounded-2xl shadow-xl shadow-black">
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${pixCode}`} className="w-32 h-32" alt="QR Code" />
                   </div>
                   <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] animate-pulse">Aguardando confirmação do PIX...</p>
                 </div>
               ) : (
                 <div className="py-2">
                   <p className="text-xs font-black uppercase italic leading-relaxed text-gray-300">Reserva pré-confirmada!</p>
                   <p className="text-[10px] text-[#22c55e] font-bold uppercase mt-1">Apresente seu nome na recepção.</p>
                 </div>
               )}
            </div>

            <Button 
              onClick={handleFinalizePedido} 
              className="w-full bg-[#22c55e] text-black font-black uppercase italic h-16 rounded-2xl text-lg shadow-xl shadow-[#22c55e]/10 hover:scale-[1.02] active:scale-95 transition-all"
            >
               {metodoPagamento === "pix" ? "Copiar Código e Confirmar" : "Finalizar Agendamento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClienteDashboard;