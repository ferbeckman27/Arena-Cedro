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
import { 
  Calendar as CalendarIcon, 
  MessageCircle, 
  ShoppingCart, 
  LogOut, 
  Star, 
  Package, 
  AlertTriangle,
  CreditCard,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- TIPOS ---
interface Product {
  id: number;
  nome: string;
  preco: number;
  tipo: 'venda' | 'aluguel';
  estoque: number;
}

interface Review {
  id: string;
  nome: string;
  estrelas: number;
  texto: string;
  data: string;
}

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- ESTADOS ---
  const [cart, setCart] = useState<Product[]>([]);
  const [fidelidade] = useState(7); 
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [emManutencao, setEmManutencao] = useState(false);
  const [agendaStatus, setAgendaStatus] = useState<Record<number, string>>({});

  // Estados do Pix e Comentários
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [pixCode] = useState("00020126580014BR.GOV.BCB.PIX0136arena-cedro-pix-991234567-88520400005303986");
  const [review, setReview] = useState({ nome: "", estrelas: 5, texto: "" });
  const [minhasAvaliacoes, setMinhasAvaliacoes] = useState<Review[]>([]);

  useEffect(() => {
    const checkStatus = () => {
      setEmManutencao(localStorage.getItem("arena_manutencao") === "true");
      const agendaSalva = localStorage.getItem("arena_agenda");
      if (agendaSalva) setAgendaStatus(JSON.parse(agendaSalva));
      
      // Carregar avaliações globais e filtrar as minhas (simulado)
      const reviewsSalvas = JSON.parse(localStorage.getItem("arena_reviews") || "[]");
      setMinhasAvaliacoes(reviewsSalvas);
    };

    checkStatus();
    window.addEventListener('focus', checkStatus);
    return () => window.removeEventListener('focus', checkStatus);
  }, []);

  // --- LOGICA DE PRODUTOS E PREÇO ---
  const produtos: Product[] = [
    { id: 1, nome: "Bola Penalty S11", preco: 180, tipo: 'venda', estoque: 5 },
    { id: 2, nome: "Aluguel de Colete (Un)", preco: 5, tipo: 'aluguel', estoque: 30 },
    { id: 3, nome: "Gatorade 500ml", preco: 8, tipo: 'venda', estoque: 50 },
  ];

  const calculateBookingPrice = (hour: number) => {
    const rate = (hour >= 8 && hour < 18) ? 80 : 120;
    return (rate / 60) * selectedDuration;
  };

  const totalCart = useMemo(() => cart.reduce((acc, item) => acc + item.preco, 0), [cart]);

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    toast({ title: "Adicionado!", description: `${product.nome} no carrinho.` });
  };

  // --- FUNÇÕES DE AÇÃO ---
  const handleFinalizePix = () => {
    if (cart.length === 0) return toast({ variant: "destructive", title: "Carrinho vazio!" });
    setIsPixModalOpen(true);
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    toast({ title: "Copiado!", description: "Cole o código no seu aplicativo do banco." });
  };

  const handleSubmitReview = () => {
    if (!review.nome || !review.texto) return toast({ title: "Ops!", description: "Preencha nome e comentário." });

    const newReview: Review = {
      id: Date.now().toString(),
      ...review,
      data: new Date().toLocaleDateString('pt-BR')
    };

    const reviewsExistentes = JSON.parse(localStorage.getItem("arena_reviews") || "[]");
    const updatedReviews = [newReview, ...reviewsExistentes];
    
    localStorage.setItem("arena_reviews", JSON.stringify(updatedReviews));
    setMinhasAvaliacoes(updatedReviews);
    setReview({ nome: "", estrelas: 5, texto: "" });
    
    toast({ title: "Avaliação Enviada!", description: "Seu comentário já está na página inicial." });
  };

  if (emManutencao) {
    return (
      <div className="min-h-screen bg-[#060a08] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={60} className="text-red-500 animate-pulse mb-4" />
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Arena em Pausa</h1>
        <Button onClick={() => window.location.reload()} className="mt-8 bg-[#22c55e] text-black font-bold">ATUALIZAR</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/media/logo-arena.png" alt="Logo" className="w-12 h-12" />
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-[#22c55e]">Arena Cedro</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate("/login")} className="text-red-500 hover:bg-red-500/10">
            <LogOut size={22} />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs defaultValue="agendar" className="space-y-8">
          <TabsList className="bg-white/5 p-1 rounded-2xl w-full max-w-2xl mx-auto h-16 grid grid-cols-4 border border-white/5">
            <TabsTrigger value="agendar" className="rounded-xl font-bold uppercase italic">Agenda</TabsTrigger>
            <TabsTrigger value="loja" className="rounded-xl font-bold uppercase italic">Loja</TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl font-bold uppercase italic">Avaliar</TabsTrigger>
            <TabsTrigger value="perfil" className="rounded-xl font-bold uppercase italic">Conta</TabsTrigger>
          </TabsList>

          {/* AGENDA */}
          <TabsContent value="agendar" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
               <Card className="bg-black/40 border-white/5 text-white p-6 rounded-[2rem]">
                <CardHeader className="p-0 mb-4 font-black italic uppercase flex flex-row items-center gap-2">
                  <CalendarIcon className="text-[#22c55e]" /> Dia do Jogo
                </CardHeader>
                <input type="date" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-[#22c55e]" defaultValue="2024-05-20" />
              </Card>

              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 12 }, (_, i) => i + 8).map(h => (
                  <button key={h} className="p-4 rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/5 flex flex-col items-center">
                    <span className="font-black text-lg">{h}:00</span>
                    <span className="text-[10px] text-[#22c55e] font-bold italic">R$ {calculateBookingPrice(h).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* LOJA */}
          <TabsContent value="loja">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {produtos.map(p => (
                  <Card key={p.id} className="bg-black/40 border-white/5 text-white p-4 rounded-[2rem]">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Package className="text-[#22c55e]" />
                        <div><h4 className="font-bold text-sm uppercase italic">{p.nome}</h4><p className="text-[#22c55e] font-black">R$ {p.preco.toFixed(2)}</p></div>
                      </div>
                      <Button onClick={() => addToCart(p)} size="icon" className="bg-[#22c55e] text-black"><ShoppingCart size={18} /></Button>
                    </div>
                  </Card>
                ))}
              </div>
              <Card className="bg-[#0c120f] border-white/10 text-white rounded-[2rem] p-6 h-fit">
                <CardTitle className="italic uppercase mb-4 flex items-center gap-2"><ShoppingCart size={20}/> Carrinho</CardTitle>
                <div className="space-y-3 mb-6">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs border-b border-white/5 pb-2">
                      <span>{item.nome}</span><span className="text-[#22c55e] font-bold">R$ {item.preco}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-black text-xl italic uppercase mb-4"><span>Total:</span><span className="text-[#22c55e]">R$ {totalCart.toFixed(2)}</span></div>
                <Button onClick={handleFinalizePix} className="w-full bg-[#22c55e] text-black font-black italic uppercase h-12 rounded-xl">Finalizar PIX</Button>
              </Card>
            </div>
          </TabsContent>

          {/* ABA DE FEEDBACK (NOVO) */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-black/40 border-white/5 text-white p-6 rounded-[2rem]">
                <CardHeader className="p-0 mb-4"><CardTitle className="italic uppercase">O que achou da Arena?</CardTitle></CardHeader>
                <div className="space-y-4">
                  <Input 
                    placeholder="Seu Nome e Sobrenome" 
                    className="bg-white/5 border-white/10" 
                    value={review.nome}
                    onChange={(e) => setReview({...review, nome: e.target.value})}
                  />
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(num => (
                      <Star 
                        key={num} 
                        size={24} 
                        className={`cursor-pointer ${review.estrelas >= num ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}`}
                        onClick={() => setReview({...review, estrelas: num})}
                      />
                    ))}
                  </div>
                  <Textarea 
                    placeholder="Escreva aqui seu depoimento..." 
                    className="bg-white/5 border-white/10 h-32"
                    value={review.texto}
                    onChange={(e) => setReview({...review, texto: e.target.value})}
                  />
                  <Button onClick={handleSubmitReview} className="w-full bg-[#22c55e] text-black font-black uppercase italic gap-2">
                    <Send size={18} /> Publicar Comentário
                  </Button>
                </div>
              </Card>

              <Card className="bg-black/40 border-white/5 text-white p-6 rounded-[2rem]">
                <CardTitle className="italic uppercase mb-6">Meus Comentários</CardTitle>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {minhasAvaliacoes.map(item => (
                      <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-xs uppercase">{item.nome}</span>
                          <span className="text-[10px] text-gray-500">{item.data}</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {Array.from({length: 5}).map((_, i) => (
                            <Star key={i} size={10} className={i < item.estrelas ? "fill-yellow-500 text-yellow-500" : "text-gray-700"} />
                          ))}
                        </div>
                        <p className="text-sm text-gray-300 italic">"{item.texto}"</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL PIX COPIA E COLA */}
      <Dialog open={isPixModalOpen} onOpenChange={setIsPixModalOpen}>
        <DialogContent className="bg-[#0c120f] border-white/10 text-white max-w-sm rounded-[2rem]">
          <DialogHeader className="items-center">
            <DialogTitle className="italic uppercase flex gap-2"><CreditCard className="text-[#22c55e]"/> Pagamento PIX</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4 space-y-4 text-center">
            <div className="bg-white p-3 rounded-2xl w-40 h-40">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${pixCode}`} alt="QR" className="w-full h-full" />
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase">Valor a pagar</p>
              <p className="text-3xl font-black text-[#22c55e]">R$ {totalCart.toFixed(2)}</p>
            </div>
            <div className="w-full bg-black/40 p-3 rounded-xl border border-white/5 flex items-center gap-2">
              <span className="text-[10px] text-gray-400 truncate flex-1">{pixCode}</span>
              <Button onClick={copyPixCode} size="sm" className="bg-[#22c55e] text-black text-[10px] font-bold h-7">COPIAR</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClienteDashboard;