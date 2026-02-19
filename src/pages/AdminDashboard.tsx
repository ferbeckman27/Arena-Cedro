import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Package, BarChart3, Calendar, Settings, 
  LogOut, ShieldCheck, Download, AlertOctagon, 
  UserCheck, Star, Search, DollarSign, Clock, 
  MessageSquare, AlertTriangle, FileText, TrendingUp, 
  Info, Plus, X, Check, ChevronLeft, ChevronRight,
  Trash2,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";

const API = "http://localhost:3001/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [duracaoFiltro, setDuracaoFiltro] = useState(60);
  const [emManutencao, setEmManutencao] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date());
  const [detalhesAgenda, setDetalhesAgenda] = useState<any[]>([]);
  const [agendaSlots, setAgendaSlots] = useState<any[]>([]);
  const [promoAtiva, setPromoAtiva] = useState(localStorage.getItem("arena_promo_ativa") === "true");
  const [promoTexto, setPromoTexto] = useState(localStorage.getItem("arena_promo_texto") || "Promoção Relâmpago!");
  const [promoLink, setPromoLink] = useState(localStorage.getItem("arena_promo_link") || "");
  const [depoimentos, setDepoimentos] = useState<{ id: number; autor: string; texto: string; data: string; status: 'pendente' | 'aprovado' | 'rejeitado' }[]>([]);
  const refPendentesDepoimentos = useRef(0);

  const [slotDetalhe, setSlotDetalhe] = useState<any>(null);
  const [isModalDetalheAberto, setIsModalDetalheAberto] = useState(false);

 const [vipsReais, setVipsReais] = useState([]);

useEffect(() => {
  const buscarVips = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/mensalistas");
      const data = await response.json();
      setVipsReais(data);
    } catch (error) {
      console.error("Erro ao carregar VIPs:", error);
    }
  };
  buscarVips();
}, []);

  const [produtos, setProdutos] = useState<{ id: number; nome: string; tipo: string; preco: number; preco_venda?: number; preco_aluguel?: number; estoque: number }[]>([]);
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [editandoProduto, setEditandoProduto] = useState<typeof produtos[0] | null>(null);
  const [formProduto, setFormProduto] = useState({ nome: "", tipo: "venda" as "venda" | "aluguel" | "ambos", preco_venda: "", preco_aluguel: "", quantidade_estoque: "" });

  const playApito = () => {
    const audio = new Audio('/sound/apito.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };


  interface Depoimento {
  id: number;
  autor: string;
  texto: string;
  data: string;
  status: 'pendente' | 'aprovado';
  estrelas: number; // <-- Adicione esta linha
}


  useEffect(() => {
    fetch(`${API}/depoimentos`).then(r => r.json()).then((rows: any[]) => {
      const list = (rows || []).map(d => ({
        id: d.id,
        autor: d.autor,
        texto: d.comentario,
        data: d.data_publicacao ? new Date(d.data_publicacao).toLocaleDateString('pt-BR') : '',
        status: (d.aprovado ? 'aprovado' : 'pendente') as 'pendente' | 'aprovado' | 'rejeitado'
      }));
      setDepoimentos(list);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const pendentes = depoimentos.filter(d => d.status === 'pendente').length;
    if (pendentes > refPendentesDepoimentos.current) {
      playApito();
      refPendentesDepoimentos.current = pendentes;
    }
    if (pendentes === 0) refPendentesDepoimentos.current = 0;
  }, [depoimentos]);

  useEffect(() => {
    fetch(`${API}/produtos`).then(r => r.json()).then((rows: any[]) => {
      setProdutos((rows || []).map(p => ({
        id: p.id,
        nome: p.nome,
        tipo: p.tipo,
        preco: p.preco_venda ?? p.preco_aluguel ?? 0,
        preco_venda: p.preco_venda,
        preco_aluguel: p.preco_aluguel,
        estoque: p.quantidade_estoque ?? 0
      })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API}/manutencao`).then(r => r.json()).then((d: { ativo: boolean }) => {
      setEmManutencao(!!d.ativo);
      localStorage.setItem("arena_manutencao", String(d.ativo));
    }).catch(() => {});
  }, []);

  const dataStr = diaSelecionado.toISOString().slice(0, 10);
  useEffect(() => {
    fetch(`${API}/agenda?data=${dataStr}`).then(r => r.json()).then((agenda: any[]) => {
      const slots = (agenda || []).map(a => ({
        inicio: String(a.horario_inicio).slice(0, 5),
        fim: a.horario_fim ? String(a.horario_fim).slice(0, 5) : '',
        turno: (a.turno || '').toLowerCase(),
        valor: 0,
        status: a.cor_status === 'vermelho' || a.status === 'confirmada' ? 'reservado' : 'livre',
        reserva: null as any
      }));
      setAgendaSlots(slots);
    }).catch(() => setAgendaSlots([]));
    fetch(`${API}/agenda-detalhes?data=${dataStr}`).then(r => r.json()).then((detalhes: any[]) => {
      setDetalhesAgenda(detalhes || []);
    }).catch(() => setDetalhesAgenda([]));
  }, [dataStr]);

  const slotsCalculados = useMemo(() => {
    const detalhesPorHorario: Record<string, any> = {};
    detalhesAgenda.forEach(d => { detalhesPorHorario[String(d.horario_inicio).slice(0, 5)] = d; });
    return agendaSlots.map(s => {
      const det = detalhesPorHorario[s.inicio];
      const valor = det?.valor_total ?? (s.turno === 'noturno' ? 120 : 80) * (duracaoFiltro / 60);
      return {
        ...s,
        valor,
        reserva: det ? { cliente: det.cliente_nome, reservadoPor: det.reservado_por, pagamento: det.forma_pagamento, obs: det.observacoes } : null
      };
    });
  }, [agendaSlots, detalhesAgenda, duracaoFiltro]);

  const [listaEquipe, setListaEquipe] = useState([]);

useEffect(() => {
  const carregarEquipe = async () => {
    const res = await fetch("http://localhost:3001/api/equipe");
    const data = await res.json();
    setListaEquipe(data);
  };
  carregarEquipe();
}, []);

  const handleToggleManutencao = () => {
    const novoEstado = !emManutencao;
    fetch(`${API}/manutencao`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ativo: novoEstado }) })
      .then(r => r.json()).then(() => {}).catch(() => {});
    setEmManutencao(novoEstado);
    localStorage.setItem("arena_manutencao", String(novoEstado));
    window.dispatchEvent(new Event("storage"));
    toast({
      variant: novoEstado ? "destructive" : "default",
      title: novoEstado ? "SISTEMA BLOQUEADO" : "SISTEMA ONLINE",
      description: novoEstado ? "Clientes e atendentes verão o aviso de manutenção." : "Agendamentos liberados.",
    });
  };

  const salvarPromocao = () => {
    localStorage.setItem("arena_promo_ativa", String(promoAtiva));
    localStorage.setItem("arena_promo_texto", promoTexto);
    localStorage.setItem("arena_promo_link", promoLink);
    toast({ title: "Marketing Atualizado!", description: "As alterações já estão no site." });
  };

  const processarComentario = async (id: number, acao: 'aprovado' | 'rejeitado' | 'pendente') => {
  try {
    // Definimos o endpoint dinamicamente baseado na ação
    let endpoint = `http://localhost:3001/api/depoimentos/aprovar/${id}`;
    
    if (acao === 'rejeitado') {
      endpoint = `http://localhost:3001/api/depoimentos/rejeitar/${id}`;
    } else if (acao === 'pendente') {
      // Reutilizamos a rota de aprovação, mas enviando 'false' para despublicar
      endpoint = `http://localhost:3001/api/depoimentos/aprovar/${id}`;
    }

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      // Se a ação for 'aprovado', enviamos true. Caso contrário (pendente/rejeitado), enviamos false.
      body: JSON.stringify({ status: acao === 'aprovado' })
    });

    if (response.ok) {
      setDepoimentos((prev: any[]) => {
        // Se foi rejeitado, removemos da lista
        if (acao === 'rejeitado') {
          return prev.filter(item => item.id !== id);
        }
        // Se aprovado ou pendente, apenas mudamos o 'status' para ele pular de coluna
        return prev.map(item => 
          item.id === id ? { ...item, status: acao } : item
        );
      });
      
      toast({ 
        title: acao === 'aprovado' ? "✅ Publicado!" : acao === 'pendente' ? "⏳ Em análise" : "🗑️ Removido", 
        description: acao === 'aprovado' ? "Visível no site." : "Atualizado com sucesso." 
      });
    }
  } catch (error) {
    console.error("Erro na moderação:", error);
    toast({ variant: "destructive", title: "Erro ao processar" });
  }
};

  const abrirDetalheSlot = (slot: typeof slotsCalculados[0]) => {
    if (slot.reserva) setSlotDetalhe(slot.reserva); else setSlotDetalhe({ cliente: "-", reservadoPor: "-", pagamento: "-", obs: "Horário livre." });
    setIsModalDetalheAberto(true);
  };

  const getCorStatus = (status: string) => {
  switch(status) {
    case 'venda_balcao': return 'bg-yellow-500/20 border-yellow-500 text-yellow-500'; // Alerta de venda nova
    case 'pago': return 'bg-red-500/20 border-red-500 text-red-500';
    default: return 'bg-white/5 border-white/10';
  }
};

  const salvarProduto = () => { 
    if (editandoProduto) {
      fetch(`${API}/produtos/${editandoProduto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formProduto.nome || editandoProduto.nome,
          tipo: formProduto.tipo,
          preco_venda: formProduto.tipo !== "aluguel" ? Number(formProduto.preco_venda) : undefined,
          preco_aluguel: formProduto.tipo !== "venda" ? Number(formProduto.preco_aluguel) : undefined,
          quantidade_estoque: Number(formProduto.quantidade_estoque) || 0
        })
      }).then(r => r.json()).then(() => { toast({ title: "Produto atualizado!" }); setEditandoProduto(null); setModalProdutoAberto(false); carregarProdutos(); }).catch(() => toast({ variant: "destructive", title: "Erro ao atualizar." }));
    } else {
      fetch(`${API}/produtos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formProduto.nome,
          tipo: formProduto.tipo,
          preco_venda: formProduto.tipo !== "aluguel" ? Number(formProduto.preco_venda) : 0,
          preco_aluguel: formProduto.tipo !== "venda" ? Number(formProduto.preco_aluguel) : 0,
          quantidade_estoque: Number(formProduto.quantidade_estoque) || 0
        })
      }).then(r => r.json()).then(() => { toast({ title: "Produto cadastrado!" }); setModalProdutoAberto(false); setFormProduto({ nome: "", tipo: "venda", preco_venda: "", preco_aluguel: "", quantidade_estoque: "" }); carregarProdutos(); }).catch(() => toast({ variant: "destructive", title: "Erro ao cadastrar." }));
    }
  };
  const carregarProdutos = () => fetch(`${API}/produtos`).then(r => r.json()).then((rows: any[]) => setProdutos((rows || []).map(p => ({ id: p.id, nome: p.nome, tipo: p.tipo, preco: p.preco_venda ?? p.preco_aluguel ?? 0, preco_venda: p.preco_venda, preco_aluguel: p.preco_aluguel, estoque: p.quantidade_estoque ?? 0 })))).catch(() => {});
  const excluirProduto = (id: number) => {
    if (!confirm("Excluir este produto?")) return;
    fetch(`${API}/produtos/${id}`, { method: "DELETE" }).then(r => r.json()).then(() => { toast({ title: "Produto excluído." }); carregarProdutos(); }).catch(() => toast({ variant: "destructive", title: "Erro." }));
  };

  const baixarPdfSintetico = () => {
    const mes = mesAtual.getMonth() + 1, ano = mesAtual.getFullYear();
    fetch(`${API}/relatorios/sintetico?mes=${mes}&ano=${ano}`).then(r => r.json()).then((d: any) => {
      const doc = new jsPDF();
      doc.setFontSize(18); doc.text("Relatório Sintético - Arena Cedro", 20, 20);
      doc.setFontSize(12); doc.text(`Período: ${mes}/${ano}`, 20, 30);
      doc.text(`Faturamento Total: R$ ${Number(d.faturamento || 0).toFixed(2)}`, 20, 40);
      doc.text(`Total de Reservas (pagos): ${d.total_reservas || 0}`, 20, 48);
      doc.text(`Média diária: R$ ${Number(d.media_diaria || 0).toFixed(2)}`, 20, 56);
      doc.save(`relatorio-sintetico-${ano}-${mes}.pdf`);
      toast({ title: "PDF baixado!" });
    }).catch(() => toast({ variant: "destructive", title: "Erro ao gerar PDF." }));
  };
  const baixarPdfAnalitico = () => {
    const mes = mesAtual.getMonth() + 1, ano = mesAtual.getFullYear();
    fetch(`${API}/relatorios/analitico?mes=${mes}&ano=${ano}`).then(r => r.json()).then((d: any) => {
      const doc = new jsPDF();
      doc.setFontSize(18); doc.text("Relatório Analítico - Arena Cedro", 20, 20);
      doc.setFontSize(12); doc.text(`Período: ${mes}/${ano}`, 20, 30);
      doc.text(`Venda de Produtos: R$ ${Number(d.venda_produtos || 0).toFixed(2)}`, 20, 40);
      doc.text(`Horas Avulsas: R$ ${Number(d.horas_avulsas || 0).toFixed(2)}`, 20, 48);
      doc.text(`Faturamento Total: R$ ${Number(d.faturamento_total || 0).toFixed(2)}`, 20, 58);
      doc.save(`relatorio-analitico-${ano}-${mes}.pdf`);
      toast({ title: "PDF baixado!" });
    }).catch(() => toast({ variant: "destructive", title: "Erro ao gerar PDF." }));
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin"); // Exemplo de limpeza de auth
    toast({ title: "Saindo...", description: "Retornando à página inicial." });
    navigate("/");
  };

  // --- CALENDÁRIO ---
  const diasMes = useMemo(() => {
    const start = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const end = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const days = [];
    for (let i = 0; i < start.getDay(); i++) days.push(null);
    for (let i = 1; i <= end.getDate(); i++) days.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i));
    return days;
  }, [mesAtual]);


 const handleToggleStatus = async (id: number, statusAtual: boolean) => {
  const acao = statusAtual ? 'BLOQUEAR' : 'ATIVAR';
  
  // Usando um toast ou alert para confirmação
  if (confirm(`Deseja realmente ${acao} este funcionário?`)) {
    try {
      const response = await fetch(`http://localhost:3001/api/funcionarios/status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !statusAtual }) 
      });

      if (response.ok) {
        // Atualiza o estado local para refletir a mudança sem recarregar a página inteira
        setListaEquipe(prev => prev.map(f => f.id === id ? { ...f, ativo: !statusAtual } : f));
      }
    } catch (err) {
      console.error("Erro ao mudar status:", err);
    }
  }
};


  function handlePagarVip(id: any): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans pb-10">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <img src="/media/logo-arena.png" alt="Logo" className="w-60 h-60 object-contain" />
              <span className="text-[20px] font-black uppercase text-[#22c55e] tracking-[0.2em]">BEM VINDO AO PAINEL ADMINISTRATIVO</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <p className="text-[10px] font-black text-gray-500 uppercase italic">Status do Sistema</p>
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-bold", emManutencao ? "text-red-500" : "text-[#22c55e]")}>
                  {emManutencao ? "MANUTENÇÃO" : "OPERACIONAL"}
                </span>
                <Switch checked={emManutencao} onCheckedChange={handleToggleManutencao} />
              </div>
            </div>
            <Button variant="ghost" className="text-red-500" onClick={() => navigate("/")}><LogOut size={20} /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Receita Mensal", val: "R$ 18.450", icon: DollarSign, color: "text-[#22c55e]" },
            { label: "Ocupação", val: "85%", icon: TrendingUp, color: "text-blue-400" },
            { label: "Clientes VIP", val: "12", icon: Star, color: "text-yellow-500" },
            { label: "Alertas", val: "2 Pendentes", icon: AlertTriangle, color: "text-red-500" },
          ].map((stat, i) => (
            <Card key={i} className="bg-white/5 border-white/5 text-white">
              <CardContent className="p-6">
                <stat.icon className={`mb-2 ${stat.color}`} size={24} />
                <p className="text-[10px] uppercase font-bold text-gray-500">{stat.label}</p>
                <p className="text-2xl font-black italic">{stat.val}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 h-14 rounded-2xl w-full flex overflow-x-auto">
            <TabsTrigger value="agenda" className="flex-1 font-bold uppercase italic">Agenda</TabsTrigger>
            <TabsTrigger value="vip" className="flex-1 font-bold uppercase italic">VIPs</TabsTrigger>
            <TabsTrigger value="produtos" className="flex-1 font-bold uppercase italic">Produtos</TabsTrigger>
            <TabsTrigger value="marketing" className="flex-1 font-bold uppercase italic">Marketing</TabsTrigger>
            <TabsTrigger value="relatorios" className="flex-1 font-bold uppercase italic">Relatórios</TabsTrigger>
            <TabsTrigger value="equipe" className="flex-1 font-bold uppercase italic">Equipe</TabsTrigger>
            <TabsTrigger value="comentarios" className="px-6 font-bold uppercase italic">Depoimentos</TabsTrigger>
          </TabsList>

          {/* CONTEÚDO AGENDA */}
          <TabsContent value="agenda" className="grid lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-4 bg-[#0c120f] border-white/5 rounded-[2.5rem] p-6">
              <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => setMesAtual(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}><ChevronLeft /></Button>
                <h2 className="font-black uppercase italic">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesAtual)}</h2>
                <Button variant="ghost" onClick={() => setMesAtual(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}><ChevronRight /></Button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {diasMes.map((date, i) => (
                  <button
                    key={i}
                    disabled={!date}
                    onClick={() => date && setDiaSelecionado(date)}
                    className={cn(
                      "h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all",
                      !date ? "opacity-0" : "hover:bg-[#22c55e]/20",
                      date?.toDateString() === diaSelecionado.toDateString() ? "bg-[#22c55e] text-black" : "text-white"
                    )}
                  >
                    {date?.getDate()}
                  </button>
                ))}
              </div>
            </Card>

            <div className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center bg-black/40 p-4 rounded-3xl border border-white/10">
                <p className="font-black italic uppercase">Horários: {diaSelecionado.toLocaleDateString()}</p>
                <div className="flex bg-white/5 p-1 rounded-xl">
                  {[30, 60, 90].map(m => (
                    <button key={m} onClick={() => setDuracaoFiltro(m)} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase", duracaoFiltro === m ? "bg-[#22c55e] text-black" : "text-gray-500")}>
                      {m} Min
                    </button>
                  ))}
                </div>
              </div>
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {slotsCalculados.map((slot, i) => (
                    <button key={i} onClick={() => abrirDetalheSlot(slot)} className={cn("p-4 rounded-2xl border text-left transition-all hover:border-[#22c55e]/50", slot.status === 'reservado' ? "bg-red-500/10 border-red-500/20" : "bg-white/5 border-white/5")}>
                      <span className="text-[8px] font-black uppercase text-[#22c55e]">{slot.turno}</span>
                      <p className="text-xl font-black italic">{slot.inicio}</p>
                      <p className="text-[10px] font-bold text-gray-500 italic">R$ {Number(slot.valor).toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <Dialog open={isModalDetalheAberto} onOpenChange={setIsModalDetalheAberto}>
                <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
                  <DialogHeader><DialogTitle className="italic uppercase font-black">Detalhes do horário</DialogTitle></DialogHeader>
                  {slotDetalhe && (
                    <div className="space-y-4 pt-2">
                      <div><p className="text-[10px] text-gray-500 font-black uppercase">Cliente</p><p className="font-bold">{slotDetalhe.cliente}</p></div>
                      <div><p className="text-[10px] text-gray-500 font-black uppercase">Quem fez a reserva</p><p className="font-bold">{slotDetalhe.reservadoPor}</p></div>
                      <div><p className="text-[10px] text-gray-500 font-black uppercase">Modo de pagamento</p><p className="font-bold">{slotDetalhe.pagamento}</p></div>
                      <div><p className="text-[10px] text-gray-500 font-black uppercase">Observações</p><p className="text-sm italic">{slotDetalhe.obs || "—"}</p></div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          {/* ABA RELATÓRIOS (SINTÉTICO E ANALÍTICO) */}
          <TabsContent value="relatorios" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">

              {/* CARD RELATÓRIO SINTÉTICO (RESUMO) */}
              <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[3rem] border-t-4 border-t-[#22c55e]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase">Sintético</h3>
                    <p className="text-gray-500 text-xs italic">Resumo de desempenho mensal</p>
                  </div>
                  <BarChart3 className="text-[#22c55e]" size={32} />
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-sm font-bold text-gray-400">Faturamento Total</span>
                    <span className="text-xl font-black text-[#22c55e]">R$ 18.450,00</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Jogos Pagos</p>
                      <p className="text-lg font-black italic">142</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Média Diária</p>
                      <p className="text-lg font-black italic">R$ 615,00</p>
                    </div>
                  </div>
                </div>
                <Button onClick={baixarPdfSintetico} className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14 rounded-2xl">
                  Baixar PDF Sintético
                </Button>
              </Card>

              {/* CARD RELATÓRIO ANALÍTICO (DETALHADO) */}
              <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[3rem] border-t-4 border-t-blue-500">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase">Analítico</h3>
                    <p className="text-gray-500 text-xs italic">Detalhamento por categoria e setor</p>
                  </div>
                  <FileText className="text-blue-500" size={32} />
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <span className="text-gray-400">Venda de Produtos:</span>
                    <span className="font-bold">R$ 3.840,00</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <span className="text-gray-400">Contratos VIP (Fixos):</span>
                    <span className="font-bold">R$ 8.200,00</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <span className="text-gray-400">Horas Avulsas:</span>
                    <span className="font-bold">R$ 6.410,00</span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-400 pt-2 font-black">
                    <span>Taxa de Ocupação:</span>
                    <span>87.4%</span>
                  </div>
                </div>
                <Button onClick={baixarPdfAnalitico} className="w-full bg-blue-600 text-white font-black uppercase italic h-14 rounded-2xl">
                  Baixar PDF Analítico
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* ABA PRODUTOS */}
<TabsContent value="produtos">
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-2xl font-black italic uppercase text-white flex items-center gap-3">
        <Package className="text-[#22c55e]" /> Inventário de Produtos
      </h3>
      <Button onClick={() => { setEditandoProduto(null); setFormProduto({ nome: "", tipo: "venda", preco_venda: "", preco_aluguel: "", quantidade_estoque: "" }); setModalProdutoAberto(true); }} className="bg-[#22c55e] text-black font-black uppercase rounded-xl h-12">
        + CADASTRAR PRODUTO
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {produtos.map(p => (
        <Card key={p.id} className="bg-[#0c120f] border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group">
          <Badge className={cn(
            "absolute top-4 right-4 font-black italic",
            p.tipo === 'venda' ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
          )}>
            {String(p.tipo).toUpperCase()}
          </Badge>
          <div className="mt-4">
            <p className="text-xl font-black italic uppercase text-white">{p.nome}</p>
            <div className="flex justify-between items-end mt-6">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase">Preço Un.</p>
                <p className="text-2xl font-black text-[#22c55e]">R$ {Number(p.preco).toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase">Estoque</p>
                <p className={cn("text-xl font-black italic", p.estoque < 10 ? "text-red-500" : "text-white")}>{p.estoque} UN</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="outline" onClick={() => { setEditandoProduto(p); setFormProduto({ nome: p.nome, tipo: p.tipo as "venda" | "aluguel" | "ambos", preco_venda: String(p.preco_venda ?? p.preco ?? ""), preco_aluguel: String(p.preco_aluguel ?? ""), quantidade_estoque: String(p.estoque) }); setModalProdutoAberto(true); }} className="border-white/10 text-[10px] font-black uppercase">Editar</Button>
            <Button variant="outline" onClick={() => excluirProduto(p.id)} className="border-red-500/20 text-red-500 text-[10px] font-black uppercase">Excluir</Button>
          </div>
        </Card>
      ))}
    </div>

    <Dialog open={modalProdutoAberto} onOpenChange={setModalProdutoAberto}>
      <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
        <DialogHeader><DialogTitle className="italic uppercase font-black">{editandoProduto ? "Editar produto" : "Cadastrar novo produto"}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div><Label className="text-[10px] uppercase">Nome</Label><Input value={formProduto.nome} onChange={e => setFormProduto(prev => ({ ...prev, nome: e.target.value }))} className="bg-white/5 mt-1" placeholder="Nome do produto" /></div>
          <div><Label className="text-[10px] uppercase">Tipo</Label><select value={formProduto.tipo} onChange={e => setFormProduto(prev => ({ ...prev, tipo: e.target.value as "venda" | "aluguel" | "ambos" }))} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 mt-1"><option value="venda">Venda</option><option value="aluguel">Aluguel</option><option value="ambos">Ambos</option></select></div>
          {formProduto.tipo !== "aluguel" && <div><Label className="text-[10px] uppercase">Preço venda (R$)</Label><Input type="number" value={formProduto.preco_venda} onChange={e => setFormProduto(prev => ({ ...prev, preco_venda: e.target.value }))} className="bg-white/5 mt-1" /></div>}
          {formProduto.tipo !== "venda" && <div><Label className="text-[10px] uppercase">Preço aluguel (R$)</Label><Input type="number" value={formProduto.preco_aluguel} onChange={e => setFormProduto(prev => ({ ...prev, preco_aluguel: e.target.value }))} className="bg-white/5 mt-1" /></div>}
          <div><Label className="text-[10px] uppercase">Estoque</Label><Input type="number" value={formProduto.quantidade_estoque} onChange={e => setFormProduto(prev => ({ ...prev, quantidade_estoque: e.target.value }))} className="bg-white/5 mt-1" /></div>
          <DialogFooter><Button variant="outline" onClick={() => setModalProdutoAberto(false)}>Cancelar</Button><Button className="bg-[#22c55e] text-black" onClick={salvarProduto}>Salvar</Button></DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</TabsContent>

          {/* ABA DEPOIMENTOS MODERADOS */}
<TabsContent value="depoimentos" className="outline-none">
  <div className="grid md:grid-cols-2 gap-6">
    {['pendente', 'aprovado'].map((tipo) => (
      <Card key={tipo} className="bg-[#0c120f] border-white/5 p-8 rounded-[2.5rem] min-h-[600px] flex flex-col">
        {/* Cabeçalho da Coluna */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black italic uppercase flex items-center gap-3 text-white">
            {tipo === 'pendente' ? (
              <><AlertTriangle className="text-yellow-500" size={24} /> Em Análise</>
            ) : (
              <><CheckCircle2 className="text-[#22c55e]" size={24} /> Publicados</>
            )}
          </h3>
          <Badge className={cn(
            "font-black px-3 py-1 rounded-full text-[10px] border-none",
            tipo === 'pendente' ? "bg-yellow-500/10 text-yellow-500" : "bg-[#22c55e]/10 text-[#22c55e]"
          )}>
            {depoimentos.filter((d: any) => d.status === tipo).length} ITENS
          </Badge>
        </div>

        {/* Área de Rolagem dos Cards */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {depoimentos.filter((d: any) => d.status === tipo).length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] opacity-20">
                <p className="italic font-bold text-gray-500">Nada para mostrar aqui</p>
              </div>
            ) : (
              depoimentos.filter((d: any) => d.status === tipo).map((d: any) => (
                <div 
                  key={d.id} 
                  className="p-5 bg-white/5 border border-white/10 rounded-[2rem] group hover:border-[#22c55e]/30 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {/* Nome do Autor vindo do Banco */}
                      <p className="text-[10px] text-[#22c55e] font-black uppercase tracking-tighter">
                        {d.autor}
                      </p>
                      
                      {/* Estrelas Dinâmicas (Sem erro de tipagem) */}
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={10} 
                            fill={i < (Number(d.estrelas) || 0) ? "#eab308" : "transparent"} 
                            className={i < (Number(d.estrelas) || 0) ? "text-yellow-500" : "text-gray-600/40"}
                          />
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-600 font-bold mt-1 uppercase">
                        {d.data}
                      </p>
                    </div>

                    {/* Botão de Excluir (Censurar) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => processarComentario(d.id, 'rejeitado')}
                      className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  {/* Texto do Depoimento Real */}
                  <p className="text-sm italic text-gray-300 leading-relaxed mb-5">
                    "{d.texto}"
                  </p>

                  {/* Ações de Moderação */}
                  <div className="flex gap-2">
                    {tipo === 'pendente' ? (
                      <Button
                        onClick={() => processarComentario(d.id, 'aprovado')}
                        className="w-full bg-[#22c55e] hover:bg-[#1da850] text-black font-black text-[10px] uppercase h-10 rounded-xl shadow-lg shadow-[#22c55e]/10"
                      >
                        <Check size={14} className="mr-2" /> Aprovar no Mural
                      </Button>
                    ) : (
                      <Button
                        onClick={() => processarComentario(d.id, 'pendente')}
                        variant="outline"
                        className="w-full border-white/10 text-gray-500 font-black text-[10px] uppercase h-10 rounded-xl hover:bg-white/5 hover:text-white"
                      >
                        Remover do Mural
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    ))}
  </div>
</TabsContent>

          {/* ABA VIP COM BOTÃO DE ENGRENAGEM */}
          <TabsContent value="vip">
  <Card className="bg-[#0c120f] border-white/5 rounded-[2rem] overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="border-white/5 uppercase font-black text-[10px]">
          <TableHead>Grupo</TableHead>
          <TableHead>Dia/Hora</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
  {vipsReais.length > 0 ? (
    vipsReais.map((vip, i) => (
      <TableRow key={i} className="border-white/5 hover:bg-white/[0.02] transition-colors">
        <TableCell className="font-black italic uppercase text-[#22c55e]">
          {vip.nome}
        </TableCell>
        <TableCell className="text-gray-300 font-medium">
          {vip.dia_semana} às {vip.horario ? vip.horario.substring(0, 5) : "--:--"}
        </TableCell>
        <TableCell>
          <Badge className={vip.status_pagamento === "em_atraso" 
            ? "bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1" 
            : "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20 px-3 py-1"}>
            {vip.status_pagamento === "em_atraso" ? "Em atraso" : "Em dia"}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-white/10 rounded-full h-10 w-10 p-0">
                <Settings size={18} className="text-[#22c55e]" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2.5rem] p-8">
              <DialogHeader>
                <DialogTitle className="italic uppercase font-black text-[#22c55e] text-2xl">
                  Dados do Cliente VIP
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Responsável</p>
                    <p className="font-bold text-lg text-white">
                      {/* Aqui exibe o atendente real que fez o cadastro */}
                      {vip.responsavel_cadastro || vip.responsavel || "Sistema"}
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Pagamento</p>
                    <p className="font-bold text-lg text-white">
                      {vip.metodo_pagamento || "Não informado"}
                    </p>
                  </div>
                </div>
                
                <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-[1.5rem]">
                  <p className="text-[10px] text-yellow-500 font-black uppercase flex items-center gap-2 mb-3">
                    <Info size={14} /> Alerta / Observação do Atendente
                  </p>
                  <p className="text-sm italic text-gray-300 leading-relaxed">
                    "{vip.observacao || "Nenhuma observação registrada para este grupo."}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <Button 
                    className="bg-[#22c55e] hover:bg-[#1ba850] text-black font-black uppercase h-14 rounded-2xl shadow-lg"
                    onClick={() => handlePagarVip(vip.id)}
                  >
                    Confirmar Mensalidade
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-transparent hover:bg-white/5 text-white border-white/10 font-black uppercase h-14 rounded-2xl"
                  >
                    Editar Grupo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={4} className="text-center py-24 text-gray-500 italic text-lg">
        Buscando dados reais no banco...
      </TableCell>
    </TableRow>
  )}
</TableBody>
    </Table>
  </Card>
</TabsContent>

          {/* ABA MARKETING */}
          <TabsContent value="marketing">
            <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[3rem] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black italic uppercase">Banner de Promoção</h3>
                <Switch checked={promoAtiva} onCheckedChange={setPromoAtiva} />
              </div>
              <Input value={promoTexto} onChange={(e) => setPromoTexto(e.target.value)} className="bg-white/5 h-14 italic font-bold" placeholder="Texto da Promoção" />
              <Input value={promoLink} onChange={(e) => setPromoLink(e.target.value)} className="bg-white/5" placeholder="Link do Botão" />
              <Button onClick={salvarPromocao} className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14">Publicar Promoção</Button>
            </Card>
          </TabsContent>

         {/* EQUIPE */}
          <TabsContent value="equipe">
  <Card className="bg-[#0c120f] border-white/5 rounded-[2.5rem] overflow-hidden">
    <Table>
      <TableHeader className="bg-white/5">
        <TableRow className="border-white/5 text-[10px] uppercase font-black">
          <TableHead>Atendente</TableHead>
          <TableHead>Total de Vendas</TableHead>
          <TableHead>Avaliação</TableHead>
          <TableHead>Reservas</TableHead>
          <TableHead>Turno</TableHead>
          <TableHead className="text-right">Gestão</TableHead> {/* Nova Coluna */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {listaEquipe.length > 0 ? (
          listaEquipe.map((membro) => (
            <TableRow key={membro.id} className={`border-white/5 transition-opacity ${!membro.ativo ? 'opacity-40' : ''}`}>
              <TableCell className="font-bold italic uppercase">
                {membro.nome} {membro.sobrenome}
                {!membro.ativo && <span className="ml-2 text-[8px] bg-red-500 text-white px-1 rounded">BLOQUEADO</span>}
              </TableCell>
              
              <TableCell className="text-[#22c55e] font-black">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(membro.total_vendas || 0)}
              </TableCell>
              
              <TableCell className="flex gap-1 items-center">
                <Star size={12} fill="#eab308" className="text-yellow-500" />
                <span className="text-xs font-black">5.0</span>
              </TableCell>
              
              <TableCell className="font-bold italic">
                {membro.total_reservas || 0}
              </TableCell>
              
              <TableCell className="text-[10px] font-black text-gray-500 uppercase">
                {membro.turno || (membro.id % 2 === 0 ? "NOTURNO" : "DIURNO")}
              </TableCell>

              {/* COLUNA DE AÇÕES */}
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-8 rounded-xl border border-white/10 ${membro.ativo ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'}`}
                  onClick={() => handleToggleStatus(membro.id, membro.ativo)}
                >
                  {membro.ativo ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                  <span className="ml-2 text-[9px] font-black uppercase">
                    {membro.ativo ? "Bloquear" : "Ativar"}
                  </span>
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-10 opacity-50 italic">
              Carregando equipe ou nenhum atendente cadastrado...
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </Card>
</TabsContent>

        </Tabs>
      </main>

      <footer className="p-12 text-center text-gray-700">
        <p className="text-[10px] font-black uppercase tracking-widest italic">Arena Cedro Management System • 2026</p>
      </footer>
    </div>
  );
}

export default AdminDashboard;