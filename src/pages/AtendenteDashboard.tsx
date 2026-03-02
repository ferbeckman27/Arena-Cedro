import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, Calendar as LucideCalendar, ShoppingBag, AlertTriangle, 
  LogOut, CheckCircle, XCircle, Star, MessageSquare, Trophy, 
  Bell, ChevronLeft, ChevronRight, Crown, Plus, Search, DollarSign,
  Package,
  AlertCircle,
  BellRing,
  Trash2,
  Clock,
  Table,
  Copy, 
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

import { supabase } from '@/lib/supabase';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@radix-ui/react-alert-dialog";

const AtendenteDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- ESTADOS ---
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date());
  const [agendaStatus, setAgendaStatus] = useState<Record<string, any>>({});
  const [filtroNome, setFiltroNome] = useState("");
  const [itensTemp, setItensTemp] = useState<any[]>([]);
  const [duracao, setDuracao] = useState<string>("60");
  const [metodoPgto, setMetodoPgto] = useState<string>("pix");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [itensCarrinho, setItensCarrinho] = useState<any[]>([]);
  const [isModalVipAberto, setIsModalVipAberto] = useState(false);
  const [modalNovoAlertaAberto, setModalNovoAlertaAberto] = useState(false);
  const [novoAlertaForm, setNovoAlertaForm] = useState({ cliente_id: "", tipo: "neutra" as "positiva" | "negativa" | "neutra", observacao: "" });
  const [pixBase64, setPixBase64] = useState<string>("");
  const [pixCopiaECola, setPixCopiaECola] = useState<string>("");
  const [isCarregandoPix, setIsCarregandoPix] = useState(false);



  const [novoVip, setNovoVip] = useState({
   nome: "",
    dia: "",
    horario: "",
    metodoPgto: "",
    observacao: ""
  });

  interface Mensalista {
    id?: number;
    nome: string;
    dia: string;
    horario: string;
    metodoPgto: string;
    observacao?: string;
    status_pagamento?: 'em_dia' | 'em_atraso';
    responsavel?: string;
  }

 interface Produto {
   id: number;
   nome: string;
   tipo: "venda" | "aluguel";
   preco: number;
   preco_venda?: number;
   preco_aluguel?: number;
   estoque: number;   
 }

 interface ReservaCompleta {
    id: number;
    data_reserva: string;
    horario_inicio: string;
    horario_fim: string;
    tipo: 'avulsa' | 'fixa';
    valor_total: number;
    valor_pago_sinal: number;
    reserva_fixa_id: number | null;
    forma_pagamento: string;
    pago: boolean;
    clientes: { nome: string } | null;
 }

  interface SlotAgenda {
    inicio: string;
    fim: string;
    turno: string;
    valor: number;
    status: string;
  }

  const [mensalistas, setMensalistas] = useState<Mensalista[]>([
  // Adicione um exemplo para teste ou deixe vazio []
  { id: 1, nome: "João Silva", dia: "SEG", horario: "19:00", metodoPgto: "Dinheiro" },
  { id: 2, nome: "Maria Oliveira", dia: "QUA", horario: "18:30", metodoPgto: "PIX" }
 ]);

  const [estoque, setEstoque] = useState<any[]>([]);
  const [clientes, setClientes] = useState<{ id: number; nome: string; sobrenome?: string; status?: string; telefone: string; obs?: string; isVip?: boolean }[]>([]);
  const [alertas, setAlertas] = useState<{ id: number; cliente: string; cliente_id?: number; obs: string; tipo: string; alerta?: boolean }[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [listaReservas, setListaReservas] = useState<ReservaCompleta[]>([]);

  const carregarReservasFinancas = async () => {
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      *,
      clientes ( nome )
    `)
    .order('data_reserva', { ascending: true });

  if (error) {
    console.error(error);
  } else {
    // Garantimos que os dados batem com a nossa interface
    setListaReservas(data as unknown as ReservaCompleta[]);
  }
};

  // --- CARREGAMENTO DE DADOS (SUPABASE) ---

  const buscarDadosIniciais = async () => {
    // 1. Manutenção
    const { data: config } = await supabase.from('configuracoes').select('valor').eq('chave', 'manutencao').single();
    if (config) setIsMaintenance(config.valor === 'true');

    // 2. Produtos
    const { data: prod } = await supabase.from('produtos').select('*');
    if (prod) setEstoque(prod);

    // 3. Clientes
    const { data: cli } = await supabase.from('clientes').select('*');
    if (cli) setClientes(cli.map(c => ({
      id: c.id,
      nome: [c.nome, c.sobrenome].filter(Boolean).join(" "),
      telefone: c.telefone || "",
      isVip: c.tipo === "mensalista"
    })));

    // 4. Observações
    const { data: obs } = await supabase.from('observacoes_clientes').select('*');
    if (obs) setAlertas(obs.map(o => ({
      id: o.id,
      cliente: o.cliente_nome,
      cliente_id: o.cliente_id,
      obs: o.observacao,
      tipo: o.tipo || "neutra",
      alerta: !!o.alerta
    })));

    buscarMensalistas();
  };

  const buscarMensalistas = async () => {
    const { data } = await supabase.from('clientes').select('*').eq('tipo', 'mensalista');
    if (data) setMensalistas(data.map(d => ({
      id: d.id,
      nome: d.nome,
      dia: d.dia_fixo,
      horario: d.horario_fixo,
      metodoPgto: d.forma_pagamento,
      status_pagamento: d.status_pagamento,
      observacao: d.observacoes
    })));
  };

  useEffect(() => { buscarDadosIniciais(); }, []);

  // --- LOGICA DE MANUTENÇÃO ---
  useEffect(() => {
    const handler = () => { setIsMaintenance(localStorage.getItem("arena_manutencao") === "true"); };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleToggleMaintenance = async () => {
    const novoStatus = !isMaintenance;
    await supabase.from('configuracoes').update({ valor: String(novoStatus) }).eq('chave', 'manutencao');
    setIsMaintenance(novoStatus);
    localStorage.setItem("arena_manutencao", String(novoStatus));
    window.dispatchEvent(new Event("storage"));
    toast({
      variant: novoStatus ? "destructive" : "default",
      title: novoStatus ? "⚠️ SISTEMA BLOQUEADO" : "✅ SISTEMA LIBERADO",
    });
  };

  // --- LÓGICA DO CALENDÁRIO ---
  const diasMes = useMemo(() => {
    const start = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const end = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const days = [];
    for (let i = 0; i < start.getDay(); i++) days.push(null);
    for (let i = 1; i <= end.getDate(); i++) days.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i));
    return days;
  }, [mesAtual]);

  const gerarSlotsAgenda = (duracaoMinutos: number): SlotAgenda[] => {
  const slots: SlotAgenda[] = [];
  let atual = new Date();
  atual.setHours(9, 0, 0); // Começa às 09:00
  const fimDia = 22; // Termina às 22:00

  while (atual.getHours() < fimDia) {
    const inicio = atual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const valorBase = atual.getHours() >= 18 ? 140 : 100;
    
    atual.setMinutes(atual.getMinutes() + duracaoMinutos);
    const fim = atual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (atual.getHours() <= fimDia) {
      slots.push({
        inicio,
        fim,
        turno: atual.getHours() >= 18 ? 'Diurno' : 'Noturno',
        valor: (valorBase * duracaoMinutos) / 60,
        status: 'livre'
      });
    }
  }
  return slots;
};

  const listaSlotsAgendamento = useMemo(() => {
  // Forçamos a tipagem como 'any' aqui para evitar o erro do .map
  const slotsCalculados = gerarSlotsAgenda(Number(duracao)) as any[];

  return slotsCalculados.map((slot) => {
    const dataFormatada = diaSelecionado.toLocaleDateString('sv-SE');

    const reservaEncontrada = listaReservas?.find((reserva) => {
      return (
        reserva.horario_inicio === slot.inicio &&
        reserva.data_reserva === dataFormatada
      );
    });

    return {
      ...slot,
      status: reservaEncontrada ? "reservado" : "livre",
      detalhes: reservaEncontrada || null
    };
  }) as SlotAgenda[];
}, [duracao, listaReservas, diaSelecionado]);

  const clientesComObs = useMemo(() => clientes.map(c => {
    const obsDoCliente = alertas.filter(a => a.cliente_id === c.id);
    const comAlerta = obsDoCliente.find(o => o.alerta);
    return { ...c, status: comAlerta ? "ruim" : "bom", obs: obsDoCliente[0]?.obs ?? c.obs ?? "—", alertaId: comAlerta?.id };
  }), [clientes, alertas]);

  // --- FUNÇÕES DE AUXÍLIO ---
  const playApito = () => { new Audio('/sound/apito.mp3').play().catch(() => {}); };
  const playTorcida = () => { new Audio('/sound/torcida.mp3').play().catch(() => {}); };

  const adicionarAoCarrinho = (produto: any) => {
    setItensCarrinho([...itensCarrinho, { ...produto, idUnico: Date.now() }]);
    toast({ title: "Adicionado", description: `${produto.nome} somado à reserva.` });
  };

  const removerDoCarrinho = (idUnico: number) => {
    setItensCarrinho(itensCarrinho.filter(item => item.idUnico !== idUnico));
  };

  const finalizarPedidoReserva = async (reservaId: number) => {
  setLoading(true);
  try {
    // 1. Pegamos o ID do funcionário logado (para o ranking da View de Performance)
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Formatamos os itens para o padrão da tabela 'itens_reserva'
    const novosItens = itensCarrinho.map(item => ({
      reserva_id: reservaId,
      produto_id: item.id,
      tipo: item.tipo, // 'venda' ou 'aluguel'
      quantidade: 1, // Você pode adicionar um campo 'quantidade' no estado se desejar
      preco_unitario: item.preco,
      subtotal: item.preco,
      pago: false
    }));

    // 3. Salvamos no Supabase
    const { error } = await supabase
      .from('itens_reserva')
      .insert(novosItens);

    if (error) throw error;

    // 4. Limpamos o carrinho e avisamos o usuário
    setItensCarrinho([]);
    toast({ 
      title: "Pedido Finalizado!", 
      description: "Itens vinculados à reserva e estoque atualizado." 
    });

  } catch (error: any) {
    toast({ 
      variant: "destructive", 
      title: "Erro ao salvar pedido", 
      description: error.message 
    });
  } finally {
    setLoading(false);
  }
};

const gerarReservasDoMes = async (reservaFixaId: number, clienteId: number, valorMensal: number) => {
  const datas = [];
  const hoje = new Date();
  
  // Exemplo: Gerar para as próximas 4 semanas
  for (let i = 0; i < 4; i++) {
    const dataReserva = new Date();
    dataReserva.setDate(hoje.getDate() + (i * 7)); // Soma 7 dias a cada volta
    
    datas.push({
      cliente_id: clienteId,
      reserva_fixa_id: reservaFixaId,
      data_reserva: dataReserva.toISOString().split('T')[0],
      horario_inicio: "19:00", // Pega do estado da reserva fixa
      tipo: 'fixa',
      valor_total: valorMensal / 4, // Divide o valor total pelas semanas
      pago: false,
      valor_pago_sinal: 0
    });
  }

  const { error } = await supabase.from('reservas').insert(datas);
  if (error) console.error("Erro ao gerar parcelas:", error);
};

const totalCarrinho = useMemo(() => {
  return itensCarrinho.reduce((acc, item) => acc + item.preco, 0);
}, [itensCarrinho]);

  const verificarDisponibilidade = (horaInicio: string, duracaoMinutos: number) => {
  // Encontramos a posição do horário de início na nossa nova lista de slots
  const indexInicio = listaSlotsAgendamento.findIndex(s => s.inicio === horaInicio);
  
  if (indexInicio === -1) return false;

  const slotsNecessarios = duracaoMinutos / 30;

  // Verificamos se os próximos blocos de 30min estão livres
  for (let i = 0; i < slotsNecessarios; i++) {
    const slotParaCheck = listaSlotsAgendamento[indexInicio + i];
    
    // Se o slot não existir (passou das 22h) ou se o status não for "livre"
    if (!slotParaCheck || slotParaCheck.status !== "livre") {
      return false;
    }
  }
  
  return true;
};

  const carregarProdutos = async () => {
  const { data } = await supabase.from('produtos').select('*').order('nome');
  if (data) {
    setProdutos(data.map(p => ({
      id: p.id,
      nome: p.nome,
      tipo: p.tipo,
      // Usamos o preco_venda ou preco_aluguel dependendo do tipo
      preco: p.preco_venda ?? p.preco_aluguel ?? 0, 
      estoque: p.quantidade_estoque ?? 0 // Garanta que o nome aqui seja igual ao da interface
    })));
  }
};

  // --- AÇÕES MENSALISTAS ---
  const handleSuspenderMensalista = async (id: number) => {
    if (window.confirm("Tem certeza que deseja suspender este horário fixo?")) {
      await supabase.from('clientes').delete().eq('id', id);
      setMensalistas(prev => prev.filter(m => m.id !== id));
      toast({ title: "Mensalista Suspenso", variant: "destructive" });
    }
  };

  const handleSalvarVip = async () => {
    const atendenteNome = localStorage.getItem("userName") || "Atendente";
    const { error } = await supabase.from('clientes').insert([{
      nome: novoVip.nome,
      tipo: 'mensalista',
      dia_fixo: novoVip.dia,
      horario_fixo: novoVip.horario,
      forma_pagamento: novoVip.metodoPgto,
      observacoes: novoVip.observacao,
      cadastrado_por: atendenteNome,
      status_pagamento: 'em_dia'
    }]);

    if (!error) {
      toast({ title: "✅ VIP CADASTRADO!" });
      setIsModalVipAberto(false);
      buscarMensalistas();
    }
  };

  const alternarStatusPagamento = async (id: number, statusAtual: string) => {
    const novoStatus = statusAtual === 'em_dia' ? 'em_atraso' : 'em_dia';
    const { error } = await supabase.from('clientes').update({ status_pagamento: novoStatus }).eq('id', id);
    if (!error) {
      setMensalistas(prev => prev.map(v => v.id === id ? { ...v, status_pagamento: novoStatus } : v));
      toast({ title: "Status Atualizado!", variant: novoStatus === 'em_dia' ? "default" : "destructive" });
    }
  };

  async function handleAgendar(slot: any, clienteNome: string, turno_id: number) {
  if (!clienteNome) return toast({ variant: "destructive", title: "Nome obrigatório" });
  
  const duracaoMin = parseInt(duracao, 10);
  setLoading(true);

  try {
    if (!verificarDisponibilidade(slot.inicio, duracaoMin)) {
      throw new Error("Conflito de Horário! Outro jogador já reservou este slot.");
    }

    const horaH = parseInt(slot.inicio.split(":")[0]);
    const valorBase = horaH >= 18 ? 120 : 80;
    const valorReserva = valorBase * (duracaoMin / 60);
    const totalProdutos = itensCarrinho.reduce((acc, item) => acc + item.preco, 0);
    const totalGeral = valorReserva + totalProdutos;
    const valorSinal = totalGeral * 0.5;

    const { data: { user } } = await supabase.auth.getUser();

    const { data: reserva, error: resError } = await supabase
      .from('reservas')
      .insert([{
        cliente_nome: clienteNome,
        data_reserva: diaSelecionado.toLocaleDateString('sv-SE'),
        horario_inicio: slot.inicio,
        horario_fim: slot.fim,
        duracao: duracaoMin,
        valor_total: totalGeral,
        forma_pagamento: metodoPgto,
        funcionario_id: user?.id,
        pago: metodoPgto !== 'pix',
        turno_id: turno_id 
      }])
      .select().single();

    if (resError) throw resError;

    if (metodoPgto === 'pix') {
      const data = (await gerarPagamentoPix(valorSinal, clienteNome)) as any;

      if (data && data.id) {

         setPixBase64(data.qrCodeBase64);
         setPixCopiaECola(data.copiaECola);

        const { error: pagError } = await supabase
          .from('pagamentos')
          .insert([{
            reserva_id: reserva.id,
            valor: valorSinal,
            status: 'pendente',
            tipo: 'sinal',
            forma_pagamento: 'pix',
            id_mercado_pago: String(data.id), 
            codigo_pix: data.copiaECola
          }]);

        if (pagError) console.error("Erro na tabela pagamentos:", pagError);
      }
    }

    if (itensCarrinho.length > 0) {
      await supabase.from('itens_reserva').insert(
        itensCarrinho.map(item => ({
          reserva_id: reserva.id,
          produto_id: item.id,
          tipo: item.tipo,
          quantidade: 1,
          preco_unitario: item.preco,
          subtotal: item.preco
        }))
      );
    }

    metodoPgto === 'pix' ? playApito() : playTorcida();
    toast({ title: "Reserva Confirmada!" });

    setItensCarrinho([]);
    buscarDadosIniciais(); 
    carregarReservasFinancas(); 
    
  } catch (error: any) {
    console.error("Erro detalhado:", error);
    toast({ variant: "destructive", title: "Erro", description: error.message });
  } finally {
    setLoading(false);
  }
}

  const limparHorario = (id: string) => {
    const reserva = agendaStatus[id];
    const novaAgenda = { ...agendaStatus };
    Object.keys(novaAgenda).forEach(key => {
      if (novaAgenda[key].referenciaRaiz === (reserva.referenciaRaiz || id)) delete novaAgenda[key];
    });
    setAgendaStatus(novaAgenda);
    toast({ title: "Horário Liberado!" });
  };

  const resumoFinanceiro = useMemo(() => {
    const reservasDoDia = Object.keys(agendaStatus).filter(key =>
      key.startsWith(diaSelecionado.toDateString()) && agendaStatus[key].isRaiz
    );
    return reservasDoDia.reduce((acc, key) => {
      const res = agendaStatus[key];
      if (res.metodo === "pix") acc.pix += res.valorPagoAgora;
      else acc.dinheiro += res.valorPagoAgora;
      acc.restante += res.restante;
      return acc;
    }, { pix: 0, dinheiro: 0, restante: 0 });
  }, [agendaStatus, diaSelecionado]);

  function handleEditarMensalista(m: Mensalista): void {
    throw new Error("Function not implemented.");
  }

  const handleLiquidarReserva = async (id: number, total: number) => {
  try {
    const { error } = await supabase
      .from('reservas')
      .update({ 
        pago: true, 
        valor_pago_sinal: total,
        data_pagamento: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) throw error;

    toast({
      title: "Pagamento Confirmado",
      description: "A reserva foi movida para o histórico de concluídas.",
      className: "bg-[#0c120f] border-[#22c55e] text-white"
    });
    
    buscarDadosIniciais(); // Função que faz o fetch novamente
  } catch (e: any) {
    toast({ variant: "destructive", title: "Erro ao quitar", description: e.message });
  }
};

const gerarPagamentoPix = async (valorCobrar: number, nomeCliente: string) => {
  setIsCarregandoPix(true);
  try {
    const response = await fetch('/api/pagamento', { // Verifique se o nome do arquivo é pagamentos.js
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        valor: valorCobrar, 
        descricao: `Reserva Arena Cedro - ${nomeCliente}` 
      })
    });

    if (!response.ok) throw new Error("Falha na comunicação com Mercado Pago");

    // ESTA LINHA É A CHAVE:
    return await response.json(); 

  } catch (error) {
    console.error("Erro no fetch do PIX:", error);
    throw error; // Repassa o erro para o handleAgendar tratar
  } finally {
    setIsCarregandoPix(false);
  }
};

const handleReserva = async (dadosDaReserva) => {
  // Pega o ID do funcionário logado
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('reservas')
    .insert([{
      ...dadosDaReserva,
      atendente_id: user.id, // Vincula a comissão a ele
      valor_total: 100, // Exemplo: R$ 100,00
      // O gatilho do banco vai calcular os R$ 5,00 sozinho
    }]);

  if (error) console.error("Erro ao salvar comissão");
};

const [totalComissao, setTotalComissao] = useState(0);

useEffect(() => {
  const buscarComissao = async () => {
    // 1. Pega o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    
    // 2. Só busca se o user existir (evita erro de 'id of undefined')
    if (user) {
      const { data, error } = await supabase
        .from('reservas')
        .select('comissao_valor')
        .eq('atendente_id', user.id);

      if (error) {
        console.error("Erro ao buscar comissões:", error);
        return;
      }

      // 3. Soma os valores (garantindo que trate números nulos)
      const total = data?.reduce((acc, curr) => acc + (Number(curr.comissao_valor) || 0), 0) || 0;
      setTotalComissao(total);
    }
  };
  
  buscarComissao();
}, []);

const carregarDadosFinanceiros = async () => {
  const { data, error } = await supabase
    .from('reservas')
    .select(`
      *,
      clientes ( nome )
    `)
    .order('data_reserva', { ascending: true });

  if (data) {
    // Forçamos o TypeScript a entender que o que veio do banco segue nossa interface
    setListaReservas(data as unknown as ReservaCompleta[]);
  }
};

const calcularFidelidade = (totalReservas: number) => {
  const progresso = totalReservas % 10;
  const completou = totalReservas > 0 && totalReservas % 10 === 0;
  return { progresso, completou };
};

const handleUsarCortesia = async (vipId: string) => {
  const confirmar = window.confirm("Deseja resgatar o prêmio? Isso resetará o contador de jogos deste cliente (subtraindo 10 jogos).");
  
  if (confirmar) {
    try {
      // 1. Pega o valor atual do cliente primeiro para garantir o cálculo
      const { data: vipAtual } = await supabase
        .from('vips')
        .select('total_reservas')
        .eq('id', vipId)
        .single();

      const novoTotal = Math.max(0, (vipAtual?.total_reservas || 0) - 10);

      // 2. Faz o update no banco de dados
      const { error } = await supabase
        .from('vips')
        .update({ total_reservas: novoTotal })
        .eq('id', vipId);

      if (error) throw error;

      // 3. Atualiza a tela na hora (Estado Local)
      // Isso faz o "vermelho" sumir e a barra de progresso esvaziar imediatamente
      setVipsReais(prev => prev.map(v => 
        v.id === vipId ? { ...v, total_reservas: novoTotal } : v
      ));

      alert("★ Cortesia aplicada! Foram deduzidos 10 jogos do saldo.");

    } catch (error) {
      console.error("Erro ao resetar fidelidade:", error);
      alert("Erro ao conectar com o banco de dados.");
    }
  }
};

  const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    // Isso força o navegador a voltar para o login e limpar a memória
    window.location.href = '/'; 
  } catch (error) {
    console.error('Erro ao sair:', error);
  }
};

async function handleFecharCaixa() {
  try {
     
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('fechamentos_caixa')
      .insert([{
        data: diaSelecionado.toLocaleDateString('sv-SE'),
        valor_pix: resumoFinanceiro.pix || 0,
        valor_dinheiro: resumoFinanceiro.dinheiro || 0,
        fechado_por: user.id
      }]);

    if (error) throw error;
    
    toast({ title: "Caixa Fechado!", description: "Os valores foram registrados com sucesso." });
  } catch (err: any) {
    toast({ variant: "destructive", title: "Erro ao fechar", description: err.message });
  }
}

  return (
  <div className="min-h-screen bg-[#060a08] text-white font-sans">
    {/* HEADER ADM - COMPACTO E FUNCIONAL */}
    <header className="w-full bg-[#0c120f] border-b border-white/5 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LADO ESQUERDO: LOGO E BOAS-VINDAS */}
        <div className="flex items-center gap-6">
          <img 
            src="/media/logo-arena.png" 
            alt="Logo" 
            className="h-40 md:h-48 w-auto object-contain transition-transform hover:scale-105" 
          />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-[#22c55e] tracking-[0.3em] leading-none mb-1">Painel Operacional</span>
            <span className="text-xl font-black italic uppercase text-white">BEM VINDO ATENDENTE</span>
          </div>
        </div>

        {/* LADO DIREITO: AÇÕES E LOGOUT */}
        <div className="flex items-center gap-3">

        {/* CARD DE COMISSÃO COMPACTO */}
  <div className="hidden sm:flex flex-col items-end bg-[#22c55e]/10 px-4 py-1.5 rounded-2xl border border-[#22c55e]/20">
    <span className="text-[9px] font-black uppercase text-[#22c55e] tracking-widest leading-none mb-1">
      Comissão (5%)
    </span>
    <div className="flex items-baseline gap-1 leading-none">
      <span className="text-[#22c55e] font-bold text-[10px] italic">R$</span>
      <span className="text-xl font-black italic text-white">
        {totalComissao.toFixed(2)}
      </span>
    </div>
  </div>
          
          {/* BOTÃO CAIXA */}
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline" size="sm" className="border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black rounded-xl font-bold">
      <DollarSign size={16} className="mr-1"/> CAIXA
    </Button>
  </DialogTrigger>
  <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem] outline-none">
    <DialogHeader>
      <DialogTitle className="italic uppercase flex items-center gap-2">
        <DollarSign className="text-[#22c55e]" size={20} />
        Resumo {diaSelecionado.toLocaleDateString()}
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-4 pt-4">
      {/* GRID DE VALORES */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-[10px] text-gray-400 uppercase font-black">PIX (Sinais)</p>
          <p className="text-xl font-black text-[#22c55e]">R$ {(resumoFinanceiro.pix || 0).toFixed(2)}</p>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-[10px] text-gray-400 uppercase font-black">Dinheiro</p>
          <p className="text-xl font-black text-[#22c55e]">R$ {(resumoFinanceiro.dinheiro || 0).toFixed(2)}</p>
        </div>
      </div>

      {/* TOTAL A RECEBER */}
      <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex justify-between items-center">
        <span className="text-xs uppercase font-black italic">A receber no local:</span>
        <span className="font-black text-red-500">R$ {(resumoFinanceiro.restante || 0).toFixed(2)}</span>
      </div>

      <Separator className="bg-white/10 my-4" />

      {/* BOTÃO DE FECHAMENTO */}
      <Button 
        onClick={() => {
          if(confirm("Deseja realmente fechar o caixa deste dia?")) {
            // Aqui você chama sua função de fechar caixa
            handleFecharCaixa();
          }
        }}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase h-14 rounded-2xl shadow-lg shadow-red-500/10 transition-all active:scale-95 flex items-center gap-2"
      >
        <Lock size={18} /> Fechar Caixa do Dia
      </Button>
      
      <p className="text-[9px] text-gray-500 text-center uppercase font-bold">
        Ao fechar, o relatório será enviado para o administrador.
      </p>
    </div>
  </DialogContent>
</Dialog>

          {/* BOTÃO MANUTENÇÃO */}
          <Button 
            onClick={() => setIsMaintenance(!isMaintenance)} 
            variant={isMaintenance ? "destructive" : "outline"} 
            size="sm"
            className="rounded-xl font-bold"
          >
            {isMaintenance ? "MANUTENÇÃO OFFLINE" : "MANUTENÇÃO ONLINE"}
          </Button>

          {/* SEPARADOR VIRTUAL */}
          <div className="w-[1px] h-8 bg-white/10 mx-2" />

      {/* BOTÃO LOGOUT COM CONFIRMAÇÃO */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            title="Sair do Sistema"
          >
            <LogOut size={22} />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase italic font-black text-xl text-red-500">
              Encerrar Sessão?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400 font-medium">
              Você está prestes a sair do painel da Arena. Certifique-se de que todas as reservas pendentes foram salvas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl uppercase font-bold text-[10px]">
              Continuar Trabalhando
            </AlertDialogCancel>
            <AlertDialogAction 
             onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-black font-black rounded-xl uppercase text-[10px]"
            >
              Sim, Sair Agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs defaultValue="agenda" className="space-y-6">
          <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/5 w-full md:w-fit overflow-x-auto">
            <TabsTrigger value="agenda" className="px-6 font-bold uppercase italic">Agenda Mensal</TabsTrigger>
            <TabsTrigger value="clientes" className="px-6 font-bold uppercase italic">Clientes</TabsTrigger>
            <TabsTrigger value="vip" className="px-6 font-bold uppercase italic">VIPs/Fixos</TabsTrigger>
            <TabsTrigger value="produtos" className="font-black italic uppercase px-6 bg-[#22c55e]/10 text-[#22c55e]">Produtos/Estoque</TabsTrigger>
            <TabsTrigger value="alertas" className="font-black italic uppercase px-6">Alertas/Obs</TabsTrigger>
             <TabsTrigger value="financeiro" className="font-black italic uppercase px-6">Financeiro</TabsTrigger>
          </TabsList>

          {/* AGENDA: ESTILO GRID PREMIUM */}
           <TabsContent value="agenda" className="space-y-8">
  
  {/* 1. SEÇÃO CALENDÁRIO */}
  <Card className="bg-[#0c120f] border-white/5 overflow-hidden rounded-[2.5rem]">
    <div className="bg-[#22c55e] p-4 flex justify-between items-center text-black font-black uppercase text-sm">
      <button onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() - 1)))} className="hover:scale-110 transition-transform">
        <ChevronLeft />
      </button>
      <h2 className="italic tracking-widest">
        {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesAtual)}
      </h2>
      <button onClick={() => setMesAtual(new Date(mesAtual.setMonth(mesAtual.getMonth() + 1)))} className="hover:scale-110 transition-transform">
        <ChevronRight />
      </button>
    </div>
    
    <div className="grid grid-cols-7 p-6 gap-2">
      {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map(d => (
        <div key={d} className="text-center text-[10px] text-gray-500 font-black mb-2">{d}</div>
      ))}
      {diasMes.map((date, i) => (
        <button
          key={i}
          disabled={!date}
          onClick={() => date && setDiaSelecionado(date)}
          className={cn(
            "h-14 rounded-2xl flex items-center justify-center font-black text-sm transition-all border",
            !date ? "opacity-0" : "hover:bg-[#22c55e]/10 border-white/5",
            date?.toDateString() === diaSelecionado.toDateString() 
              ? "bg-[#22c55e] text-black shadow-[0_0_20px_rgba(34,197,94,0.4)] border-[#22c55e]" 
              : "text-white bg-white/5"
          )}
        >
          {date?.getDate()}
        </button>
      ))}
    </div>
  </Card>

  {/* 2. SELETOR DE DURAÇÃO */}
  <div className="flex flex-col items-center gap-4 py-4">
    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Selecione a Duração do Jogo</p>
    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
      {[30, 60, 90].map((min) => (
        <button
          key={min}
          onClick={() => setDuracao(String(min))}
          className={cn(
            "px-8 py-3 rounded-xl text-[11px] font-black uppercase transition-all",
            duracao === String(min) 
              ? "bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
              : "text-gray-500 hover:text-white"
          )}
        >
          {min} MIN
        </button>
      ))}
    </div>
  </div>

  {/* 3. GRID DE HORÁRIOS */}
  <div className="space-y-6">
    <div className="flex justify-between items-center border-b border-white/5 pb-4">
      <h3 className="font-black italic uppercase text-[#22c55e] flex items-center gap-2">
        <LucideCalendar size={18} /> Disponibilidade: {diaSelecionado.toLocaleDateString()}
      </h3>
      <Badge variant="outline" className="text-[10px] border-[#22c55e] text-[#22c55e] px-4 py-1">
        {duracao} MINUTOS SELECIONADOS
      </Badge>
    </div>

    <ScrollArea className="h-[600px] pr-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {listaSlotsAgendamento.map((slot) => {
          const isOcupado = slot.status === "reservado";
          const idAgendamento = `${diaSelecionado.toDateString()}-${slot.inicio}`;
          const detalhesReserva = agendaStatus[idAgendamento];

          function gerarPagamentoPix() {
            throw new Error("Function not implemented.");
          }

          return (
            <Dialog key={slot.inicio} onOpenChange={(open) => {
              if (!open) {
                setItensTemp([]);
                setPixCopiaECola(""); // Limpa o PIX ao fechar
                setPixBase64("");
              }
            }}>
              <DialogTrigger asChild>
                <button 
                  disabled={isOcupado}
                  className={cn(
                    "relative group flex flex-col items-center justify-center p-3 rounded-[1.5rem] border transition-all h-24 w-full",
                    isOcupado 
                      ? "bg-red-500/5 border-red-500/20 opacity-60 cursor-not-allowed" 
                      : "bg-[#0c120f] border-white/5 hover:border-[#22c55e] hover:bg-[#22c55e]/5"
                  )}
                >
                  <span className="text-[7px] font-black uppercase text-gray-600 mb-1">{slot.turno}</span>
                  <span className={cn("text-[11px] font-black italic tracking-tighter leading-none whitespace-nowrap", isOcupado ? "text-red-500/50" : "text-white")}>
                    {slot.inicio} - {slot.fim}
                  </span>
                  <div className="mt-2">
                    {isOcupado ? (
                      <div className="flex flex-col items-center">
                         <span className="text-[7px] font-black uppercase text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full">Ocupado</span>
                         <p className="text-[8px] text-gray-500 mt-1 font-bold truncate w-16 text-center uppercase">{detalhesReserva?.cliente || "Reservado"}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[7px] font-black uppercase text-[#22c55e] border border-[#22c55e]/20 px-3 py-1 rounded-full group-hover:bg-[#22c55e] group-hover:text-black transition-colors">Livre</span>
                        <span className="text-[8px] font-bold text-gray-600 italic">R$ {slot.valor.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </button>
              </DialogTrigger>

              <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem] max-w-md outline-none">
                <DialogHeader>
                  <DialogTitle className="italic uppercase flex items-center gap-2 text-xl font-black">
                    <Plus className="text-[#22c55e]" size={20} /> NOVO JOGO - {slot.inicio} ÀS {slot.fim}
                  </DialogTitle>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Valor Base da Quadra: <span className="text-[#22c55e]">R$ {slot.valor.toFixed(2)}</span>
                  </p>
                </DialogHeader>
                
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Nome do Atleta Responsável</label>
                    <Input placeholder="Quem vai pagar?" className="bg-white/5 border-white/10 h-14 rounded-xl text-white focus-visible:ring-[#22c55e]" id={`atleta-${slot.inicio}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Pagamento</label>
                      <select 
                        value={metodoPgto} 
                        onChange={(e) => {
                          setMetodoPgto(e.target.value);
                          if(e.target.value === 'pix') gerarPagamentoPix(); 
                        }}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-[#22c55e] cursor-pointer"
                      >
                        <option value="pix" className="bg-[#0c120f]">PIX (Sinal 50%)</option>
                        <option value="dinheiro" className="bg-[#0c120f]">Dinheiro (Local)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Duração</label>
                      <div className="h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-sm font-black text-[#22c55e]">{duracao} MIN</div>
                    </div>
                  </div>

                  {/* ÁREA DO PIX (QR CODE E COPIA E COLA) */}
{metodoPgto === "pix" && (
  <div className="mt-2 p-5 bg-black/60 rounded-[1.5rem] border border-[#22c55e]/20 flex flex-col items-center gap-4">
    {isCarregandoPix ? (
      <div className="flex flex-col items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#22c55e]"></div>
      </div>
    ) : pixBase64 ? (
      <>
        {/* IMAGEM DO QR CODE */}
        <div className="bg-white p-2 rounded-xl">
          <img 
            src={`data:image/png;base64,${pixBase64}`} 
            className="w-28 h-28" 
            alt="QR Code" 
          />
        </div>

        {/* ESTRUTURA DE INPUT QUE VOCÊ PEDIU */}
        <div className="w-full space-y-2">
          <label htmlFor="copiar" className="text-[10px] font-bold uppercase text-gray-400 italic">
            Copiar Hash:
          </label>
          <input 
            type="text" 
            id="copiar" 
            value={pixCopiaECola} 
            readOnly 
            onClick={(e) => {
              (e.target as HTMLInputElement).select();
              navigator.clipboard.writeText(pixCopiaECola);
              toast({ title: "Copiado!" });
            }}
            className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-[10px] font-mono text-[#22c55e] outline-none cursor-pointer"
          />
          <p className="text-[8px] text-gray-500 uppercase text-center italic">Clique no código para copiar</p>
        </div>
      </>
    ) : (
      <p className="text-[10px] text-gray-600 italic uppercase font-black">Aguardando geração do PIX...</p>
    )}
  </div>
)}

{/* PRODUTOS E CARRINHO (RESUMO) */}
<div className="space-y-2">
  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Consumo</label>
  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
    {produtos.filter(p => p.estoque > 0).map(p => (
      <button 
        key={p.id} 
        onClick={() => adicionarAoCarrinho(p)} 
        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-[#22c55e]/50 text-[9px] font-black uppercase transition-all"
      >
        <span>{p.nome}</span>
        <span className="text-[#22c55e]">R$ {p.preco.toFixed(2)}</span>
      </button>
    ))}
  </div>
</div>

{/* BOTÃO FINALIZAR */}
<Button 
  disabled={isCarregandoPix}
  className="w-full bg-[#22c55e] hover:bg-[#1ba850] text-black font-black uppercase h-16 rounded-2xl text-base shadow-lg shadow-[#22c55e]/10 active:scale-95 transition-all"
  onClick={() => {
    // Se for PIX e já tiver o código, apenas copia. Se não, finaliza o agendamento.
    if (metodoPgto === "pix" && pixCopiaECola) {
      navigator.clipboard.writeText(pixCopiaECola);
      toast({ title: "PIX Copiado!" });
    }
    
    const input = document.getElementById(`atleta-${slot.inicio}`) as HTMLInputElement;
    const hora = parseInt(slot.inicio.split(":")[0]);
    const turno_id = hora >= 18 ? 2 : 1; 

    handleAgendar(slot.inicio, input?.value, turno_id);
  }}
>
  {metodoPgto === "pix" ? (pixCopiaECola ? "Copiar PIX & Finalizar" : "Gerando PIX...") : "Fazer Reserva"}
</Button>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </ScrollArea>
  </div>
</TabsContent>

{/* PRODUTOS/ESTOQUE - VERSÃO OPERACIONAL */}
<TabsContent value="produtos">
  <Card className="bg-[#0c120f] border-white/5 p-6 rounded-[2.5rem]">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-black italic uppercase flex items-center gap-2 text-white">
        <Package className="text-[#22c55e]" /> Produto/Estoque
      </h3>
      <Badge variant="outline" className="border-white/10 text-gray-500 uppercase text-[10px]">
        Modo Atendente
      </Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {produtos.map(item => (
        <div 
          key={item.id} 
          className={cn(
            "p-5 bg-white/5 border rounded-[2rem] flex flex-col justify-between transition-all",
            item.estoque <= 5 ? "border-red-500/30 bg-red-500/5" : "border-white/10"
          )}
        >
          <div>
            <div className="flex justify-between items-start">
              <Badge className={cn(
                "text-[9px] font-black uppercase",
                item.tipo === 'venda' ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
              )}>
                {item.tipo}
              </Badge>
              {item.estoque <= 5 && item.estoque > 0 && (
                <span className="text-[8px] font-black text-red-500 animate-pulse uppercase">
                  Reposição Necessária
                </span>
              )}
            </div>

            <p className="font-black italic uppercase text-white text-lg mt-3 leading-tight">
              {item.nome}
            </p>
            
            <p className="text-[#22c55e] font-black text-xl mt-1 italic">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Disponível
              </span>
              <span className={cn(
                "text-sm font-black",
                item.estoque <= 5 ? "text-red-500" : "text-white"
              )}>
                {item.estoque} UN
              </span>
            </div>
            
            <Button 
              disabled={item.estoque === 0}
              className={cn(
                "w-full h-12 rounded-xl font-black uppercase text-xs transition-all",
                item.estoque === 0 
                  ? "bg-white/5 text-gray-600 cursor-not-allowed" 
                  : "bg-white/10 hover:bg-[#22c55e] hover:text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
              )}
              onClick={() => adicionarAoCarrinho(item)}
            >
              {item.estoque === 0 ? "Esgotado" : "Vender / Alugar"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  </Card>
</TabsContent>

{/* ALERTAS/OBS */}
<TabsContent value="alertas">
  <Card className="bg-[#0c120f] border-white/5 p-6 rounded-[2.5rem]">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-black italic uppercase flex items-center gap-2">
        <BellRing className="text-yellow-500" /> Alertas e Observações
      </h3>
      <Button onClick={() => { setNovoAlertaForm({ cliente_id: "", tipo: "neutra", observacao: "" }); setModalNovoAlertaAberto(true); }} className="bg-[#22c55e] text-black font-black rounded-xl">+ NOVO ALERTA</Button>
    </div>
    <div className="space-y-3">
      {alertas.map(alerta => (
        <div key={alerta.id} className={cn(
          "p-4 rounded-2xl border flex items-start gap-4",
          alerta.tipo === "negativa" ? "bg-red-500/5 border-red-500/20" : alerta.tipo === "positiva" ? "bg-[#22c55e]/5 border-[#22c55e]/20" : "bg-blue-500/5 border-blue-500/20"
        )}>
          <div className={alerta.tipo === "negativa" ? "text-red-500" : alerta.tipo === "positiva" ? "text-[#22c55e]" : "text-blue-400"}>
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="font-black uppercase text-sm">{alerta.cliente}</p>
            <p className="text-sm text-gray-400 italic">"{alerta.obs}"</p>
          </div>
        </div>
      ))}
    </div>
    <Dialog open={modalNovoAlertaAberto} onOpenChange={setModalNovoAlertaAberto}>
      <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
        <DialogHeader><DialogTitle className="italic uppercase font-black">Criar novo alerta</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500">Cliente</label>
            <Select value={novoAlertaForm.cliente_id} onValueChange={v => setNovoAlertaForm(prev => ({ ...prev, cliente_id: v }))}>
              <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>
                {clientes.map(c => (<SelectItem key={c.id} value={String(c.id)}>{c.nome} – {c.telefone}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500">Tipo</label>
            <Select value={novoAlertaForm.tipo} onValueChange={v => setNovoAlertaForm(prev => ({ ...prev, tipo: v as "positiva" | "negativa" | "neutra" }))}>
              <SelectTrigger className="bg-white/5 border-white/10 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="positiva">Positiva (boa)</SelectItem>
                <SelectItem value="negativa">Negativa (ruim)</SelectItem>
                <SelectItem value="neutra">Neutra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-gray-500">Observação</label>
            <Textarea value={novoAlertaForm.observacao} onChange={e => setNovoAlertaForm(prev => ({ ...prev, observacao: e.target.value }))} className="bg-white/5 border-white/10 mt-1 min-h-[80px]" placeholder="Descreva a observação..." />
          </div>
          <Button 
  className="w-full bg-[#22c55e] text-black font-black" 
  onClick={async () => {
    // Validação básica
    if (!novoAlertaForm.cliente_id || !novoAlertaForm.observacao.trim()) { 
      toast({ variant: "destructive", title: "Preencha cliente e observação." }); 
      return; 
    }

    try {
      // 1. Inserir no Supabase
      const { error: insertError } = await supabase
        .from('observacoes_clientes')
        .insert([{
          cliente_id: Number(novoAlertaForm.cliente_id),
          tipo: novoAlertaForm.tipo,
          observacao: novoAlertaForm.observacao.trim(),
          funcionario_id: Number(localStorage.getItem("userId") || 1)
        }]);

      if (insertError) throw insertError;

      toast({ title: "Alerta criado!" });
      setModalNovoAlertaAberto(false);

      // 2. Recarregar lista de alertas do Supabase
      const { data: rows, error: fetchError } = await supabase
        .from('observacoes_clientes')
        .select('*');

      if (fetchError) throw fetchError;

      if (rows) {
        setAlertas(rows.map((o: any) => ({
          id: o.id,
          cliente: o.cliente_nome,
          cliente_id: o.cliente_id,
          obs: o.observacao,
          tipo: o.tipo || "neutra"
        })));
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro ao processar alerta." });
    }
  }}
>
  Salvar alerta
</Button>
        </div>
      </DialogContent>
    </Dialog>
  </Card>
</TabsContent>

{/* ABA CLIENTES: CONSULTA DE ATLETAS E FIDELIDADE */}
<TabsContent value="clientes">
  <Card className="bg-[#0c120f] border-white/5 p-8 rounded-[2.5rem]">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h3 className="text-2xl font-black italic uppercase text-white">Gestão de Atletas</h3>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">
          Total de {clientes.length} cadastrados
        </p>
      </div>
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        <input 
          placeholder="Buscar por nome ou fone..." 
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#22c55e]/50 transition-colors" 
          onChange={(e) => setFiltroNome(e.target.value)} 
        />
      </div>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clientes
        .filter(c => c.nome.toLowerCase().includes(filtroNome.toLowerCase()) || c.telefone.includes(filtroNome))
        .map((c: any) => { // <--- Adicione esse ": any" aqui
    
          // Agora o erro some, pois o TS aceita qualquer propriedade dentro de 'c'
         const total = Number(c.total_reservas || 0);
         const progresso = total % 10;
         const temPremio = total > 0 && total % 10 === 0;

          return (
            <div key={c.id} className="p-6 rounded-[2rem] border bg-white/5 border-white/10 hover:border-white/20 transition-all">
              {/* CABEÇALHO DO CARD */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-white/5 border border-white/10 text-[#22c55e]">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="font-black uppercase italic leading-none text-white">{c.nome}</p>
                    <p className="text-[10px] text-gray-500 font-bold mt-1 tracking-widest">{c.telefone}</p>
                  </div>
                </div>
                {c.isVip && (
                  <Badge className="bg-[#22c55e] text-black font-black text-[9px] px-2 py-0.5 rounded-full">
                    VIP
                  </Badge>
                )}
              </div>

              {/* BARRA DE FIDELIDADE */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Sistema de Fidelidade</p>
                  <p className={`text-xs font-black ${temPremio ? 'text-yellow-500 animate-pulse' : 'text-white'}`}>
                    {temPremio ? '★ 10/10' : `${progresso}/10`}
                  </p>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full border border-white/5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${temPremio ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-[#22c55e]'}`}
                    style={{ width: `${temPremio ? 100 : progresso * 10}%` }}
                  />
                </div>
                {temPremio && (
                  <p className="text-[8px] text-yellow-500 font-black uppercase text-center mt-1">
                    Próximo jogo é cortesia!
                  </p>
                )}
              </div>

              {/* NOTA DO ATENDENTE (ESTÁTICA) */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                <p className="text-[9px] font-black text-gray-600 uppercase flex items-center gap-1 mb-2 tracking-widest">
                  <MessageSquare size={10} /> Notas e Histórico
                </p>
                <p className="text-xs italic text-gray-400 leading-relaxed">
                  {c.obs ? `"${c.obs}"` : "Nenhuma observação registrada."}
                </p>
              </div>
            </div>
          );
        })}
    </div>
  </Card>
</TabsContent>

  {/* FINANCEIRO */}
  <TabsContent value="financeiro" className="space-y-8">
  <Card className="bg-[#0c120f] border-orange-500/20 rounded-[2.5rem] overflow-hidden">
    <div className="bg-[#facc15] p-4 flex items-center justify-between text-black font-black uppercase text-sm italic">
      <div className="flex items-center gap-2">
        <DollarSign size={18} />
        <span>Pagamentos Pendentes</span>
      </div>
    </div>
    
    <Table>
      <TableHeader className="bg-white/5">
        <TableRow className="border-white/5 text-[10px] font-black uppercase text-gray-400">
          <TableHead>Atleta</TableHead>
          <TableHead>Data / Hora</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="text-blue-400">Sinal/Pix</TableHead>
          <TableHead className="text-red-500 italic">Restante</TableHead>
          <TableHead className="text-right">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listaReservas.filter(r => !r.pago).map((res) => {
          const saldoRestante = Number(res.valor_total) - Number(res.valor_pago_sinal || 0);
          
          function handleLiquidar(id: number): void {
            throw new Error("Function not implemented.");
          }

          return (
            <TableRow key={res.id} className="border-white/5 hover:bg-white/[0.02]">
              <TableCell className="font-black italic uppercase text-white">
                {res.clientes?.nome || "Atleta"}
              </TableCell>
              <TableCell className="text-[11px] font-bold">
                {new Date(res.data_reserva).toLocaleDateString('pt-BR')} <br/>
                <span className="text-gray-500">{res.horario_inicio.slice(0,5)}</span>
              </TableCell>
              <TableCell>
  <div className="flex flex-col gap-1">
    <p className="font-black italic uppercase text-white truncate w-32">
      {res.clientes?.nome || "Atleta"}
    </p>
    <Badge className={cn(
      "text-[8px] font-black uppercase w-fit border-none",
      res.reserva_fixa_id 
        ? "bg-purple-500/20 text-purple-400" 
        : "bg-blue-500/20 text-blue-400"
    )}>
      {res.reserva_fixa_id ? "FIXA / MENSAL" : "AVULSA"}
    </Badge>
  </div>
</TableCell>
              <TableCell className="text-xs font-bold font-mono">R$ {res.valor_total}</TableCell>
              <TableCell className="text-xs font-bold text-blue-400">R$ {res.valor_pago_sinal}</TableCell>
              <TableCell className="text-sm font-black text-red-500 italic">
                R$ {saldoRestante.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  onClick={() => handleLiquidar(res.id)}
                  className="bg-red-500 hover:bg-red-600 text-black font-black text-[10px] uppercase rounded-xl h-8"
                >
                  Dar Baixa
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </Card>

  {/* SEÇÃO: RESERVAS FEITAS (PAGAS) */}
  <Card className="bg-[#0c120f] border-[#22c55e]/20 rounded-[2.5rem] overflow-hidden">
    <div className="bg-[#22c55e] p-4 text-black font-black uppercase text-sm italic">
      Reservas Concluídas / Pagas
    </div>
    <Table>
      <TableBody>
        {listaReservas.filter(r => r.pago).map((res) => (
          <TableRow key={res.id} className="border-white/5 opacity-50">
            <TableCell className="font-black italic uppercase text-white">{res.clientes?.nome}</TableCell>
            <TableCell className="text-gray-500 text-xs">
              {new Date(res.data_reserva).toLocaleDateString('pt-BR')} | {res.horario_inicio.slice(0,5)}
            </TableCell>
            <TableCell className="text-right font-black text-[#22c55e]">
              R$ {res.valor_total} (PAGO {res.forma_pagamento})
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
</TabsContent>

          {/* ABA VIP/FIXO: PRÉ-RESERVA */}
<TabsContent value="vip">
  <Card className="bg-[#0c120f] border-white/5 p-8 rounded-[2.5rem]">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-black italic uppercase flex items-center gap-3">
        <Crown className="text-[#22c55e]" /> Horários Fixos (Mensalistas)
      </h3>

      {/* MODAL DE NOVO VIP INTEGRADO AO BOTÃO */}
      <Dialog open={isModalVipAberto} onOpenChange={setIsModalVipAberto}>
        <DialogTrigger asChild>
          <Button className="bg-[#22c55e] hover:bg-[#1da850] text-black font-black uppercase gap-2 px-6 h-12 rounded-2xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <Plus size={18} strokeWidth={3} /> NOVO VIP
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2.5rem] max-w-lg p-8">
          <DialogHeader>
            <DialogTitle className="italic uppercase flex items-center gap-3 text-2xl font-black">
              <Crown className="text-[#22c55e]" size={24} /> Cadastrar Mensalista
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nome do Atleta / Grupo</label>
              <Input 
                id="vip-nome"
                placeholder="Ex: João Silva (Pelada dos Amigos)" 
                className="bg-white/5 border-white/10 h-14 rounded-xl focus:border-[#22c55e]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Dia Fixo</label>
  {/* Removido o 'id'. O defaultValue vai no Select, e usamos onValueChange para capturar o valor */}
  <Select defaultValue="SEG" onValueChange={(value) => setNovoVip({ ...novoVip, dia: value })}>
    <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-xl text-white">
      <SelectValue placeholder="Selecione o dia" />
    </SelectTrigger>
    <SelectContent className="bg-[#0c120f] border-white/10 text-white">
      {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map(d => (
        <SelectItem 
          key={d} 
          value={d} 
          className="focus:bg-[#22c55e] focus:text-black font-bold uppercase"
        >
          {d}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Horário</label>
                <Input id="vip-hora" type="time" defaultValue="19:00" className="bg-white/5 border-white/10 h-14 rounded-xl" />
              </div>
            </div>
            <Button 
              className="w-full bg-[#22c55e] text-black font-black uppercase h-16 rounded-2xl text-lg"
              onClick={() => {
                const nome = (document.getElementById('vip-nome') as HTMLInputElement).value;
                const hora = (document.getElementById('vip-hora') as HTMLInputElement).value;
                // Aqui você chamaria sua função de salvar
                setIsModalVipAberto(false);
              }}
            >
              ATIVAR HORÁRIO FIXO
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    {/* LISTA DE MENSALISTAS */}
    <div className="space-y-4">
      {/* Exemplo de Card de Mensalista Dinâmico */}
      {mensalistas.map((m) => (
        <div key={m.id} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex justify-between items-center group hover:border-[#22c55e]/30 transition-all">
  <div className="flex items-center gap-6">
    <div className="text-center bg-black/40 p-3 rounded-2xl min-w-[70px]">
      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Dia</p>
      <p className="text-xl font-black text-[#22c55e] italic">{m.dia}</p>
    </div>
    <div>
      <div className="flex items-center gap-2">
        <p className="font-black italic uppercase text-lg text-white">{m.nome}</p>
        <Badge className="bg-[#22c55e]/10 text-[#22c55e] text-[8px] font-black border-none">MENSALISTA</Badge>
      </div>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
        Toda {m.dia} às {m.horario} • {m.metodoPgto}
      </p>
    </div>
  </div>

  <div className="flex items-center gap-4">
    {/* Botão EDITAR */}
    <button 
      onClick={() => handleEditarMensalista(m)}
      className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors"
    >
      Editar
    </button>

    {/* Botão SUSPENDER */}
    <button 
      onClick={() => handleSuspenderMensalista(m.id)}
      className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors"
    >
      Suspender
    </button>
  </div>
        </div>
      ))}

      {mensalistas.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
          <p className="text-gray-600 italic font-bold">Nenhum mensalista fixo cadastrado.</p>
        </div>
      )}
    </div>
  </Card>
</TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const Separator = ({ className }: { className?: string }) => <div className={`h-[1px] w-full ${className}`} />;

export default AtendenteDashboard;

function setLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}
function gerarSlotsAgenda(duracao: string) {
  throw new Error("Function not implemented.");
}

function setVipsReais(arg0: (prev: any) => any) {
  throw new Error("Function not implemented.");
}

