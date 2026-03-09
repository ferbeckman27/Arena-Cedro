import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  ShieldCheck,
  Download,
  AlertOctagon,
  UserCheck,
  Star,
  Search,
  DollarSign,
  Clock,
  MessageSquare,
  AlertTriangle,
  FileText,
  TrendingUp,
  Info,
  Plus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  UserPlus,
  Eye,
  EyeOff,
  Circle,
  Lock,
  Activity,
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

import { supabase } from "@/lib/supabase";

interface Produto {
  id: number;
  nome: string;
  tipo: "venda" | "aluguel" | "ambos";
  preco: number;
  preco_venda?: number;
  preco_aluguel?: number;
  estoque: number;
}

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

  const [depoimentos, setDepoimentos] = useState<
    { id: number; autor: string; texto: string; data: string; status: "pendente" | "aprovado" | "rejeitado" }[]
  >([]);
  const refPendentesDepoimentos = useRef(0);

  const [slotDetalhe, setSlotDetalhe] = useState<any>(null);
  const [isModalDetalheAberto, setIsModalDetalheAberto] = useState(false);

  const [vipsReais, setVipsReais] = useState([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [listaEquipe, setListaEquipe] = useState<any[]>([]);

  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [editandoProduto, setEditandoProduto] = useState<any | null>(null);
  const [formProduto, setFormProduto] = useState({
    nome: "",
    tipo: "venda" as "venda" | "aluguel" | "ambos",
    preco_venda: "",
    preco_aluguel: "",
    quantidade_estoque: "",
  });

  // Employee registration states
  const [novoFuncNome, setNovoFuncNome] = useState("");
  const [novoFuncSobrenome, setNovoFuncSobrenome] = useState("");
  const [novoFuncTelefone, setNovoFuncTelefone] = useState("");
  const [novoFuncSenha, setNovoFuncSenha] = useState("");
  const [showFuncSenha, setShowFuncSenha] = useState(false);
  const [loadingCadastro, setLoadingCadastro] = useState(false);
  const [novoFuncEmail, setNovoFuncEmail] = useState("");

  // STATS reais
  const [statsReais, setStatsReais] = useState({
    receitaMensal: 0,
    ocupacao: 0,
    clientesVip: 0,
    alertas: 0,
    acessosDiarios: 0,
  });

  // Relatórios - filtros de período
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const [sinteticoInicio, setSinteticoInicio] = useState(primeiroDiaMes.toISOString().slice(0, 10));
  const [sinteticoFim, setSinteticoFim] = useState(hoje.toISOString().slice(0, 10));
  const [analiticoInicio, setAnaliticoInicio] = useState(primeiroDiaMes.toISOString().slice(0, 10));
  const [analiticoFim, setAnaliticoFim] = useState(hoje.toISOString().slice(0, 10));
  const [comissaoInicio, setComissaoInicio] = useState(primeiroDiaMes.toISOString().slice(0, 10));
  const [comissaoFim, setComissaoFim] = useState(hoje.toISOString().slice(0, 10));

  // Relatório sintético - dados reais
  const [dadosSintetico, setDadosSintetico] = useState({
    faturamentoTotal: 0,
    jogosPagos: 0,
    mediaDiaria: 0,
    acessosDiarios: 0,
    acessosMensais: 0,
  });

  // Financeiro - Caixa
  const [caixaData, setCaixaData] = useState(hoje.toISOString().slice(0, 10));
  const [dadosCaixa, setDadosCaixa] = useState({
    pix: 0,
    dinheiro: 0,
    totalRecebido: 0,
    totalAReceber: 0,
  });

  // --- FUNÇÕES DE SOM E ESTILO ---
  const playApito = () => {
    const audio = new Audio("/sound/apito.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const getCorStatus = (status: string) => {
    switch (status) {
      case "reservado":
      case "confirmada":
        return "bg-red-500/5 border-red-500/20 hover:border-red-500/50";
      case "pendente":
        return "bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/50";
      case "livre":
      default:
        return "bg-[#0c120f] border-white/5 hover:border-[#22c55e]/50 shadow-xl";
    }
  };

  const getCorStatusBadge = (status: string) => {
    switch (status) {
      case "reservado":
      case "confirmada":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pendente":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20";
    }
  };

  // --- CARREGAMENTO DE DADOS (SUPABASE) ---

  const carregarDadosIniciais = async () => {
    // 1. VIPs
    const { data: vips } = await supabase.from("clientes").select("*").eq("tipo", "mensalista");
    if (vips) setVipsReais(vips);

    // 2. Equipe
    const { data: equipe } = await supabase.from("funcionarios").select("*").order("nome");
    if (equipe) setListaEquipe(equipe);

    // 3. Manutenção
    const { data: config } = await supabase.from("configuracoes").select("valor").eq("chave", "manutencao").single();
    if (config) setEmManutencao(config.valor === "true");

    // 4. Depoimentos
    const { data: deps } = await supabase
      .from("depoimentos")
      .select("*")
      .order("data_publicacao", { ascending: false });
    if (deps) {
      setDepoimentos(
        deps.map((d) => ({
          id: d.id,
          autor: d.autor,
          texto: d.comentario,
          data: d.data_publicacao ? new Date(d.data_publicacao).toLocaleDateString("pt-BR") : "",
          status: d.aprovado ? "aprovado" : "pendente",
        })),
      );
    }
    carregarProdutos();
    carregarStatsReais();
  };

  const carregarStatsReais = async () => {
    const mesInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
    const mesFim = hoje.toISOString().slice(0, 10);

    // Receita mensal
    const { data: reservasMes } = await supabase
      .from("reservas")
      .select("valor_total, status, pago")
      .gte("data_reserva", mesInicio)
      .lte("data_reserva", mesFim);

    const receitaMensal = reservasMes?.filter(r => r.status === "confirmada" || r.pago)
      .reduce((acc, r) => acc + Number(r.valor_total || 0), 0) || 0;

    // Ocupação do dia
    const { data: reservasHoje } = await supabase
      .from("reservas")
      .select("id")
      .eq("data_reserva", mesFim)
      .in("status", ["confirmada", "pendente"]);
    const totalSlotsDia = 26; // slots possíveis por dia
    const ocupacao = reservasHoje ? Math.round((reservasHoje.length / totalSlotsDia) * 100) : 0;

    // Clientes VIP
    const { count: vipCount } = await supabase.from("clientes").select("id", { count: "exact", head: true }).eq("tipo", "mensalista");

    // Alertas (reservas pendentes de pagamento)
    const { count: alertasCount } = await supabase
      .from("reservas")
      .select("id", { count: "exact", head: true })
      .eq("status", "pendente")
      .eq("pago", false);

    // Acessos diários (funcionários que acessaram hoje)
    const hojeStr = hoje.toISOString().slice(0, 10);
    const { data: acessosHoje } = await supabase
      .from("funcionarios")
      .select("ultimo_acesso")
      .not("ultimo_acesso", "is", null);
    const acessosDiarios = acessosHoje?.filter(f => f.ultimo_acesso && f.ultimo_acesso.slice(0, 10) === hojeStr).length || 0;

    setStatsReais({
      receitaMensal,
      ocupacao,
      clientesVip: vipCount || 0,
      alertas: alertasCount || 0,
      acessosDiarios,
    });
  };

  const carregarProdutos = async () => {
    const { data } = await supabase.from("produtos").select("*").order("nome");
    if (data) {
      setProdutos(
        data.map((p) => ({
          id: p.id,
          nome: p.nome,
          tipo: p.tipo,
          preco: p.preco_venda ?? p.preco_aluguel ?? 0,
          preco_venda: p.preco_venda,
          preco_aluguel: p.preco_aluguel,
          estoque: p.quantidade_estoque ?? 0,
        })),
      );
    }
  };

  // Carregar dados do relatório sintético
  const carregarDadosSintetico = async () => {
    const { data: reservas } = await supabase
      .from("reservas")
      .select("valor_total, status, pago, data_reserva")
      .gte("data_reserva", sinteticoInicio)
      .lte("data_reserva", sinteticoFim);

    const reservasPagas = reservas?.filter(r => r.status === "confirmada" || r.pago) || [];
    const faturamentoTotal = reservasPagas.reduce((acc, r) => acc + Number(r.valor_total || 0), 0);
    const jogosPagos = reservasPagas.length;

    // Dias no período
    const d1 = new Date(sinteticoInicio);
    const d2 = new Date(sinteticoFim);
    const diasPeriodo = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const mediaDiaria = faturamentoTotal / diasPeriodo;

    // Acessos no período
    const { data: funcs } = await supabase.from("funcionarios").select("total_acessos");
    const acessosMensais = funcs?.reduce((acc, f) => acc + (f.total_acessos || 0), 0) || 0;

    // Acessos diários (hoje)
    const hojeStr = hoje.toISOString().slice(0, 10);
    const { data: acessosHoje } = await supabase.from("funcionarios").select("ultimo_acesso").not("ultimo_acesso", "is", null);
    const acessosDiarios = acessosHoje?.filter(f => f.ultimo_acesso?.slice(0, 10) === hojeStr).length || 0;

    setDadosSintetico({
      faturamentoTotal,
      jogosPagos,
      mediaDiaria,
      acessosDiarios,
      acessosMensais,
    });
  };

  // Carregar dados do caixa
  const carregarCaixa = async () => {
    const { data: reservasDia } = await supabase
      .from("reservas")
      .select("valor_total, forma_pagamento, pago, status, valor_restante")
      .eq("data_reserva", caixaData);

    const pagas = reservasDia?.filter(r => r.pago || r.status === "confirmada") || [];
    const pendentes = reservasDia?.filter(r => !r.pago && r.status === "pendente") || [];

    const pix = pagas.filter(r => r.forma_pagamento === "pix").reduce((acc, r) => acc + Number(r.valor_total || 0), 0);
    const dinheiro = pagas.filter(r => r.forma_pagamento === "dinheiro" || r.forma_pagamento === "local").reduce((acc, r) => acc + Number(r.valor_total || 0), 0);
    const totalRecebido = pix + dinheiro;
    const totalAReceber = pendentes.reduce((acc, r) => acc + Number(r.valor_restante || r.valor_total || 0), 0);

    setDadosCaixa({ pix, dinheiro, totalRecebido, totalAReceber });
  };

  const diasMes = useMemo<(Date | null)[]>(() => {
    const start = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const end = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < start.getDay(); i++) days.push(null);
    for (let i = 1; i <= end.getDate(); i++) days.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i));
    return days;
  }, [mesAtual]);

  const dataStr = diaSelecionado.toISOString().slice(0, 10);
  useEffect(() => {
    const carregarAgenda = async () => {
      const { data: agenda } = await supabase.from("agenda").select("*").eq("data", dataStr);
      if (agenda) {
        setAgendaSlots(
          agenda.map((a) => ({
            inicio: String(a.horario_inicio).slice(0, 5),
            fim: a.horario_fim ? String(a.horario_fim).slice(0, 5) : "",
            turno: (a.turno || "").toLowerCase(),
            status: a.status === "confirmada" ? "reservado" : "livre",
          })),
        );
      }
      const { data: detalhes } = await supabase.from("reservas_detalhes").select("*").eq("data_reserva", dataStr);
      setDetalhesAgenda(detalhes || []);
    };
    carregarAgenda();
  }, [dataStr]);

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    carregarDadosSintetico();
  }, [sinteticoInicio, sinteticoFim]);

  useEffect(() => {
    carregarCaixa();
  }, [caixaData]);

  useEffect(() => {
    const pendentes = depoimentos.filter((d) => d.status === "pendente").length;
    if (pendentes > refPendentesDepoimentos.current) {
      playApito();
      refPendentesDepoimentos.current = pendentes;
    }
    if (pendentes === 0) refPendentesDepoimentos.current = 0;
  }, [depoimentos]);

  // --- LÓGICA DE NEGÓCIO ---

  const handleToggleManutencao = async () => {
    const novoEstado = !emManutencao;
    await supabase
      .from("configuracoes")
      .update({ valor: String(novoEstado) })
      .eq("chave", "manutencao");
    setEmManutencao(novoEstado);
    localStorage.setItem("arena_manutencao", String(novoEstado));
    window.dispatchEvent(new Event("storage"));
    toast({ title: novoEstado ? "SISTEMA BLOQUEADO" : "SISTEMA ONLINE" });
  };

  const processarComentario = async (id: number, acao: "aprovado" | "rejeitado" | "pendente") => {
    if (acao === "rejeitado") {
      await supabase.from("depoimentos").delete().eq("id", id);
      setDepoimentos((prev) => prev.filter((item) => item.id !== id));
    } else {
      await supabase
        .from("depoimentos")
        .update({ aprovado: acao === "aprovado" })
        .eq("id", id);
      setDepoimentos((prev) => prev.map((item) => (item.id === id ? { ...item, status: acao } : item)));
    }
    toast({ title: "Moderação concluída." });
  };

  const gerarEstruturaAgenda = (duracaoMinutos: number) => {
    const slots = [];
    const periodos = [
      { inicio: 9, fim: 17.5 },
      { inicio: 18, fim: 22 },
    ];

    for (const periodo of periodos) {
      let atual = periodo.inicio;
      while (atual + duracaoMinutos / 60 <= periodo.fim) {
        const horas = Math.floor(atual);
        const minutos = (atual % 1) * 60;
        const inicio = `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;

        const totalMinutosFim = horas * 60 + minutos + duracaoMinutos;
        const fim = `${String(Math.floor(totalMinutosFim / 60)).padStart(2, "0")}:${String(totalMinutosFim % 60).padStart(2, "0")}`;

        slots.push({
          inicio,
          fim,
          turno: horas >= 18 ? "noturno" : "diurno",
          status: "livre",
        });
        atual += 0.5;
      }
    }
    return slots;
  };

  const salvarProduto = async () => {
    const payload = {
      nome: formProduto.nome,
      tipo: formProduto.tipo,
      preco_venda: formProduto.tipo !== "venda" ? Number(formProduto.preco_venda) : 0,
      preco_aluguel: formProduto.tipo !== "aluguel" ? Number(formProduto.preco_aluguel) : 0,
      quantidade_estoque: Number(formProduto.quantidade_estoque) || 0,
    };
    if (editandoProduto) {
      await supabase.from("produtos").update(payload).eq("id", editandoProduto.id);
    } else {
      await supabase.from("produtos").insert([payload]);
    }
    setModalProdutoAberto(false);
    carregarProdutos();
    toast({ title: "Produto salvo!" });
  };

  const excluirProduto = async (id: number) => {
    if (confirm("Excluir produto?")) {
      await supabase.from("produtos").delete().eq("id", id);
      carregarProdutos();
    }
  };

  const handleToggleStatusEquipe = async (id: string, statusAtual: boolean) => {
    if (confirm(`Deseja ${statusAtual ? "DESATIVAR" : "ATIVAR"} este funcionário?`)) {
      const { error } = await supabase.from("funcionarios").update({ ativo: !statusAtual }).eq("id", id);
      if (error) {
        toast({ variant: "destructive", title: "Erro na operação", description: error.message });
      } else {
        toast({ title: statusAtual ? "Funcionário Desativado" : "Funcionário Ativado" });
        setListaEquipe((prev) => prev.map((f) => (f.id === id ? { ...f, ativo: !statusAtual } : f)));
      }
    }
  };

  const editarFuncionario = async (funcionario: any) => {
    const novoTelefone = prompt("Editar Telefone:", funcionario.telefone);
    const novoTurno = prompt("Editar Turno (DIURNO/NOTURNO):", funcionario.turno);
    if (novoTelefone || novoTurno) {
      const { error } = await supabase
        .from("funcionarios")
        .update({
          telefone: novoTelefone || funcionario.telefone,
          turno: novoTurno || funcionario.turno,
        })
        .eq("id", funcionario.id);
      if (error) {
        toast({ variant: "destructive", title: "Erro ao atualizar", description: error.message });
      } else {
        toast({ title: "Dados atualizados com sucesso!" });
        carregarDadosIniciais();
      }
    }
  };

  // --- VALIDAÇÃO SENHA FUNCIONÁRIO ---
  const funcPasswordValidations = useMemo(() => {
    const hasExactLength = novoFuncSenha.length === 8;
    const hasUpperCase = /[A-Z]/.test(novoFuncSenha);
    const hasLowerCase = /[a-z]/.test(novoFuncSenha);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(novoFuncSenha);
    const hasNumber = /\d/.test(novoFuncSenha);
    const nums = novoFuncSenha.match(/\d/g) || [];
    const noRepeatedNumbers = nums.length === new Set(nums).size;
    return {
      hasExactLength, hasUpperCase, hasLowerCase, hasSpecialChar, hasNumber, noRepeatedNumbers,
      isValid: hasExactLength && hasUpperCase && hasLowerCase && hasSpecialChar && hasNumber && noRepeatedNumbers,
    };
  }, [novoFuncSenha]);

  // --- CADASTRO DE FUNCIONÁRIO ---
  const handleCadastrarFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcPasswordValidations.isValid) {
      return toast({ variant: "destructive", title: "Senha Inválida", description: "A senha não atende aos requisitos." });
    }
    if (!novoFuncEmail.toLowerCase().endsWith("@atendcedro.com")) {
      return toast({ variant: "destructive", title: "E-mail Inválido", description: "O e-mail deve obrigatoriamente terminar com @atendcedro.com" });
    }
    setLoadingCadastro(true);
    try {
      const nomeLimpo = novoFuncNome.trim().toLowerCase().replace(/\s+/g, "");
      const sobrenomeLimpo = novoFuncSobrenome.trim().toLowerCase().replace(/\s+/g, "");
      const emailFinal = `${nomeLimpo}.${sobrenomeLimpo}@atendcedro.com`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailFinal,
        password: novoFuncSenha,
        options: { data: { display_name: `${novoFuncNome} ${novoFuncSobrenome}`, role: "atendente" } },
      });
      if (authError) throw authError;
      if (authData.user) {
        const { error: dbError } = await supabase.from("funcionarios").insert([{
          id: authData.user.id,
          nome: novoFuncNome.trim(),
          sobrenome: novoFuncSobrenome.trim(),
          email_corporativo: emailFinal,
          telefone: novoFuncTelefone,
          tipo: "atendente",
          ativo: true,
        }]);
        if (dbError) throw new Error("Erro ao salvar no banco: " + dbError.message);
      }
      toast({ title: "Funcionário Cadastrado!", description: `O acesso para ${emailFinal} foi criado com sucesso.` });
      setNovoFuncNome(""); setNovoFuncSobrenome(""); setNovoFuncEmail(""); setNovoFuncTelefone(""); setNovoFuncSenha("");
      carregarDadosIniciais();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro no Cadastro", description: error.message });
    } finally {
      setLoadingCadastro(false);
    }
  };

  // --- RELATÓRIOS PDF ---

  const baixarPdfSintetico = async () => {
    try {
      const { data: reservas } = await supabase
        .from("reservas")
        .select("valor_total, tipo, status, pago")
        .gte("data_reserva", sinteticoInicio)
        .lte("data_reserva", sinteticoFim);

      const reservasPagas = reservas?.filter(r => r.status === "confirmada" || r.pago) || [];
      const totalAvulsas = reservasPagas.filter(r => r.tipo === "avulsa").reduce((acc, cur) => acc + Number(cur.valor_total), 0);
      const totalVIP = reservasPagas.filter(r => r.tipo === "VIP" || r.tipo === "fixa").reduce((acc, cur) => acc + Number(cur.valor_total), 0);

      const { data: pagProdutos } = await supabase
        .from("pagamentos")
        .select("valor")
        .eq("tipo", "produto")
        .eq("status", "pago");
      const totalProdutos = pagProdutos?.reduce((acc, cur) => acc + Number(cur.valor), 0) || 0;
      const faturamentoTotal = totalAvulsas + totalVIP + totalProdutos;

      // Acessos
      const { data: funcs } = await supabase.from("funcionarios").select("total_acessos");
      const acessosTotal = funcs?.reduce((acc, f) => acc + (f.total_acessos || 0), 0) || 0;

      const d1 = new Date(sinteticoInicio);
      const d2 = new Date(sinteticoFim);
      const diasPeriodo = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1);

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setFont(undefined, "bold");
      doc.text("RELATÓRIO SINTÉTICO - ARENA CEDRO", 20, 25);
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(100);
      doc.text(`Data de emissão: ${new Date().toLocaleDateString("pt-BR")}`, 20, 32);
      doc.text(`Período: ${new Date(sinteticoInicio).toLocaleDateString("pt-BR")} a ${new Date(sinteticoFim).toLocaleDateString("pt-BR")}`, 20, 38);
      doc.setDrawColor(200);
      doc.line(20, 42, 190, 42);
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Faturamento Horas Avulsas:`, 20, 55);
      doc.text(`R$ ${totalAvulsas.toFixed(2).replace(".", ",")}`, 140, 55);
      doc.text(`Faturamento Contratos VIP:`, 20, 65);
      doc.text(`R$ ${totalVIP.toFixed(2).replace(".", ",")}`, 140, 65);
      doc.text(`Venda de Produtos (Cantina/Loja):`, 20, 75);
      doc.text(`R$ ${totalProdutos.toFixed(2).replace(".", ",")}`, 140, 75);
      doc.line(20, 85, 190, 85);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text(`FATURAMENTO TOTAL:`, 20, 98);
      doc.text(`R$ ${faturamentoTotal.toFixed(2).replace(".", ",")}`, 120, 98);
      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      doc.text(`Jogos Pagos: ${reservasPagas.length}`, 20, 112);
      doc.text(`Média Diária: R$ ${(faturamentoTotal / diasPeriodo).toFixed(2).replace(".", ",")}`, 20, 122);
      doc.text(`Total de Acessos (equipe): ${acessosTotal}`, 20, 132);
      doc.text(`Acessos Diários (média): ${Math.round(acessosTotal / diasPeriodo)}`, 20, 142);

      doc.save(`Sintetico_Arena_Cedro_${new Date().toLocaleDateString("pt-BR")}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({ variant: "destructive", title: "Erro ao gerar relatório." });
    }
  };

  const baixarPdfAnalitico = async () => {
    try {
      const { data: reservas } = await supabase
        .from("reservas")
        .select("valor_total, tipo, status, pago, comissao_valor")
        .gte("data_reserva", analiticoInicio)
        .lte("data_reserva", analiticoFim);

      const reservasPagas = reservas?.filter(r => r.status === "confirmada" || r.pago) || [];
      const totalAvulsas = reservasPagas.filter(r => r.tipo === "avulsa").reduce((acc, cur) => acc + Number(cur.valor_total || 0), 0);
      const totalVIP = reservasPagas.filter(r => r.tipo === "VIP" || r.tipo === "fixa").reduce((acc, cur) => acc + Number(cur.valor_total || 0), 0);
      const comissoes = reservasPagas.reduce((acc, cur) => acc + Number(cur.comissao_valor || 0), 0);

      const { data: pagProdutos } = await supabase.from("pagamentos").select("valor").eq("tipo", "produto").eq("status", "pago");
      const totalProdutos = pagProdutos?.reduce((acc, cur) => acc + Number(cur.valor), 0) || 0;

      const faturamentoBruto = totalAvulsas + totalVIP + totalProdutos;
      const saldoLiquido = faturamentoBruto - comissoes;

      // Ocupação
      const totalReservas = reservas?.length || 0;
      const d1 = new Date(analiticoInicio);
      const d2 = new Date(analiticoFim);
      const diasPeriodo = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const taxaOcupacao = totalReservas > 0 ? Math.min(100, (totalReservas / (diasPeriodo * 26)) * 100) : 0;

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.text("RELATÓRIO ANALÍTICO - ARENA CEDRO", 20, 20);
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(100);
      doc.text(`Período: ${new Date(analiticoInicio).toLocaleDateString("pt-BR")} a ${new Date(analiticoFim).toLocaleDateString("pt-BR")}`, 20, 28);
      doc.setDrawColor(200);
      doc.line(20, 32, 190, 32);
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Horas Avulsas: R$ ${totalAvulsas.toFixed(2).replace(".", ",")}`, 20, 45);
      doc.text(`Contratos VIP: R$ ${totalVIP.toFixed(2).replace(".", ",")}`, 20, 55);
      doc.text(`Venda de Produtos: R$ ${totalProdutos.toFixed(2).replace(".", ",")}`, 20, 65);
      doc.line(20, 72, 190, 72);
      doc.text(`Comissão Atendentes (5%): - R$ ${comissoes.toFixed(2).replace(".", ",")}`, 20, 82);
      doc.text(`Taxa de Ocupação: ${taxaOcupacao.toFixed(1)}%`, 20, 95);
      doc.setFont(undefined, "bold");
      doc.setFontSize(14);
      doc.text(`SALDO LÍQUIDO: R$ ${saldoLiquido.toFixed(2).replace(".", ",")}`, 20, 110);

      doc.save(`Analitico_Arena_Cedro_${new Date().toLocaleDateString("pt-BR")}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({ variant: "destructive", title: "Erro ao gerar relatório." });
    }
  };

  // --- AUXILIARES ---
  const slotsCalculados = useMemo(() => {
    const gradeMestre = gerarEstruturaAgenda(duracaoFiltro);
    const detalhesPorHorario: Record<string, any> = {};
    detalhesAgenda.forEach((d) => {
      detalhesPorHorario[String(d.horario_inicio).slice(0, 5)] = d;
    });

    return gradeMestre.map((slotVazio) => {
      const reservaReal = detalhesPorHorario[slotVazio.inicio];
      const valorPadrao = (slotVazio.turno === "noturno" ? 120 : 80) * (duracaoFiltro / 60);

      if (reservaReal) {
        const slotStatus = reservaReal.pago ? "reservado" : (reservaReal.status === "pendente" ? "pendente" : "reservado");
        return {
          ...slotVazio,
          status: slotStatus,
          valor: reservaReal.valor_total || valorPadrao,
          reserva: {
            cliente: reservaReal.cliente_nome,
            pagamento: reservaReal.forma_pagamento,
            obs: reservaReal.observacoes,
            tipo: reservaReal.tipo,
            pago: reservaReal.pago,
            valor_total: reservaReal.valor_total,
            valor_sinal: reservaReal.valor_sinal,
          },
        };
      }
      return { ...slotVazio, valor: valorPadrao, reserva: null };
    });
  }, [detalhesAgenda, duracaoFiltro]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  const abrirDetalheSlot = (slot: any) => {
    if (slot.status === "reservado" || slot.status === "pendente") {
      setSlotDetalhe({
        inicio: slot.inicio,
        fim: slot.fim,
        cliente: slot.reserva?.cliente || "Não informado",
        reservadoPor: slot.reserva?.reservadoPor || "Cliente (App)",
        pagamento: slot.reserva?.pagamento || "Pendente",
        obs: slot.reserva?.obs || "",
        valor: slot.valor,
        tipo: slot.reserva?.tipo || "avulsa",
        pago: slot.reserva?.pago || false,
        valorSinal: slot.reserva?.valor_sinal || 0,
        valorTotal: slot.reserva?.valor_total || slot.valor,
        status: slot.status,
      });
      setIsModalDetalheAberto(true);
    } else {
      toast({ title: "Horário Livre", description: `O horário das ${slot.inicio} está disponível para reserva.` });
    }
  };

  const handlePagarVip = async (id: number) => {
    const { error } = await supabase.from("clientes").update({ status_pagamento: "em_dia" }).eq("id", id);
    if (!error) {
      setVipsReais((prev) => prev.map((v: any) => (v.id === id ? { ...v, status_pagamento: "em_dia" } : v)));
      toast({ title: "Mensalidade confirmada." });
    } else {
      toast({ variant: "destructive", title: "Erro ao confirmar mensalidade." });
    }
  };

  const salvarPromocao = () => {
    localStorage.setItem("arena_promo_ativa", String(promoAtiva));
    localStorage.setItem("arena_promo_texto", promoTexto);
    localStorage.setItem("arena_promo_link", promoLink);
    toast({ title: "Marketing Atualizado!", description: "As alterações já estão no site." });
  };

  const [relatorioComissoes, setRelatorioComissoes] = useState<any[]>([]);

  const carregarComissoes = async () => {
    const { data } = await supabase
      .from("reservas")
      .select("comissao_valor, atendente_id, funcionario_id, data_reserva")
      .gt("comissao_valor", 0)
      .gte("data_reserva", comissaoInicio)
      .lte("data_reserva", comissaoFim);

    if (data) {
      // Buscar nomes dos funcionários
      const ids = [...new Set(data.map(d => d.atendente_id || d.funcionario_id).filter(Boolean))];
      const { data: funcs } = await supabase.from("funcionarios").select("id, nome, sobrenome").in("id", ids.length > 0 ? ids : ["none"]);
      const nomeMap: Record<string, string> = {};
      funcs?.forEach(f => { nomeMap[f.id] = `${f.nome} ${f.sobrenome || ""}`.trim(); });

      const agrupado = data.reduce((acc: any, curr: any) => {
        const id = curr.atendente_id || curr.funcionario_id;
        const nome = nomeMap[id] || "Atendente";
        if (!acc[nome]) acc[nome] = 0;
        acc[nome] += Number(curr.comissao_valor);
        return acc;
      }, {});

      const lista = Object.entries(agrupado).map(([nome, total]) => ({ nome, total }));
      setRelatorioComissoes(lista);
    }
  };

  useEffect(() => {
    carregarComissoes();
  }, [comissaoInicio, comissaoFim]);

  const calcularFidelidade = (totalReservas: number) => {
    const progresso = totalReservas % 10;
    const completou = totalReservas > 0 && totalReservas % 10 === 0;
    return { progresso, completou };
  };

  const formatarMoeda = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans pb-10">
      {/* HEADER */}
      <header className="w-full bg-[#0c120f] border-b border-white/5 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <img src="/media/logo-arena.png" alt="Logo" className="h-40 md:h-48 w-auto object-contain transition-transform hover:scale-105" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-[#22c55e] tracking-[0.3em] leading-none mb-1">Painel Operacional</span>
                <span className="text-[20px] font-black uppercase text-[#22c55e] tracking-[0.2em]">Bem Vindo Administrador</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <p className="text-[10px] font-black text-gray-500 uppercase italic">Status do Sistema</p>
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-bold", emManutencao ? "text-red-500" : "text-[#22c55e]")}>{emManutencao ? "MANUTENÇÃO" : "OPERACIONAL"}</span>
                <Switch checked={emManutencao} onCheckedChange={handleToggleManutencao} />
              </div>
            </div>
            <Button variant="ghost" className="text-red-500" onClick={() => navigate("/adminlogin")}><LogOut size={20} /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
        {/* STATS REAIS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Receita Mensal", val: formatarMoeda(statsReais.receitaMensal), icon: DollarSign, color: "text-[#22c55e]" },
            { label: "Ocupação Hoje", val: `${statsReais.ocupacao}%`, icon: TrendingUp, color: "text-blue-400" },
            { label: "Clientes VIP", val: String(statsReais.clientesVip), icon: Star, color: "text-yellow-500" },
            { label: "Alertas", val: `${statsReais.alertas} Pendentes`, icon: AlertTriangle, color: "text-red-500" },
            { label: "Acessos Hoje", val: String(statsReais.acessosDiarios), icon: Activity, color: "text-purple-400" },
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
            <TabsTrigger value="cadastro" className="px-6 font-bold uppercase italic text-[#22c55e]">+ Funcionário</TabsTrigger>
            <TabsTrigger value="comentarios" className="px-6 font-bold uppercase italic">Depoimentos</TabsTrigger>
            <TabsTrigger value="financeiro" className="px-6 font-bold uppercase italic">Financeiro</TabsTrigger>
          </TabsList>

          {/* CONTEÚDO AGENDA */}
          <TabsContent value="agenda" className="grid lg:grid-cols-12 gap-6 outline-none">
            <Card className="lg:col-span-4 bg-[#0c120f] border-white/5 rounded-[2.5rem] p-6 h-fit">
              <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" size="icon" className="hover:bg-white/5 text-white" onClick={() => setMesAtual((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}><ChevronLeft size={20} /></Button>
                <h2 className="font-black uppercase italic text-sm tracking-tighter text-[#22c55e]">{new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(mesAtual)}</h2>
                <Button variant="ghost" size="icon" className="hover:bg-white/5 text-white" onClick={() => setMesAtual((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}><ChevronRight size={20} /></Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (<span key={i} className="text-[10px] font-black text-gray-600">{d}</span>))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {diasMes.map((date, i) => (
                  <button key={i} disabled={!date} onClick={() => date && setDiaSelecionado(date)} className={cn("h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all", !date ? "opacity-0" : "hover:bg-[#22c55e]/20", date?.toDateString() === diaSelecionado.toDateString() ? "bg-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "text-white bg-white/5")}>
                    {date?.getDate()}
                  </button>
                ))}
              </div>
            </Card>

            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 p-5 rounded-[2rem] border border-white/10 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Dia Selecionado</p>
                  <p className="font-black italic uppercase text-lg text-white">{diaSelecionado.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                  {[30, 60, 90].map((m) => (
                    <button key={m} onClick={() => setDuracaoFiltro(m)} className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all", duracaoFiltro === m ? "bg-[#22c55e] text-black shadow-lg" : "text-gray-500 hover:text-white")}>{m} Min</button>
                  ))}
                </div>
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {slotsCalculados.map((slot, i) => {
                    const isReservado = slot.status === "reservado" || slot.status === "ocupado";
                    const horaInt = parseInt(slot.inicio.split(":")[0]);
                    const isNoturno = horaInt >= 18;
                    const precoBase = isNoturno ? 140 : 100;
                    const valorExibir = (precoBase / 60) * duracaoFiltro;
                    const labelTurno = horaInt < 12 ? "Manhã" : horaInt < 18 ? "Tarde" : "Noite";

                    return (
                      <button key={i} onClick={() => abrirDetalheSlot(slot)} className={cn("p-5 rounded-[2rem] border text-center transition-all relative overflow-hidden group flex flex-col items-center justify-center gap-1", isReservado ? "bg-red-500/5 border-red-500/20 hover:border-red-500/50" : "bg-[#0c120f] border-white/5 hover:border-[#22c55e]/50 shadow-xl")}>
                        <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">{labelTurno}</span>
                        {/* Horário no formato 09:00-09:30 */}
                        <p className="text-xl font-black italic text-white group-hover:scale-110 transition-transform">
                          {slot.inicio}-{slot.fim}
                        </p>
                        <div className={cn("mt-2 px-3 py-0.5 rounded-full text-[8px] font-black uppercase border", isReservado ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20")}>{isReservado ? "OCUPADO" : "LIVRE"}</div>
                        {isReservado ? (
                          <p className="text-[10px] font-bold text-red-400 truncate mt-2 w-full px-2">👤 {slot.reserva?.cliente || "Agendado"}</p>
                        ) : (
                          <p className="text-[10px] font-bold text-gray-400 italic mt-2 tracking-tight">R$ {valorExibir.toFixed(2).replace(".", ",")}</p>
                        )}
                        {!isReservado && <div className="absolute inset-0 bg-gradient-to-tr from-[#22c55e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>

              <Dialog open={isModalDetalheAberto} onOpenChange={setIsModalDetalheAberto}>
                <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2.5rem] p-8 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="italic uppercase font-black text-2xl flex items-center gap-3 text-[#22c55e]">
                      <div className="w-2 h-8 bg-[#22c55e] rounded-full" /> Detalhes do Horário
                    </DialogTitle>
                  </DialogHeader>
                  {slotDetalhe && (
                    <div className="space-y-6 pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          <p className="text-[10px] text-gray-500 font-black uppercase">Horário</p>
                          <p className="text-2xl font-black italic text-[#22c55e]">{slotDetalhe.inicio}-{slotDetalhe.fim}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                          <p className="text-[10px] text-gray-500 font-black uppercase">Valor</p>
                          <p className="text-2xl font-black italic text-white">R$ {Number(slotDetalhe.valor).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Cliente:</span><span className="font-bold">{slotDetalhe.cliente}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Reservado por:</span><span className="font-bold">{slotDetalhe.reservadoPor}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Pagamento:</span><span className="font-bold">{slotDetalhe.pagamento}</span></div>
                      </div>
                      {slotDetalhe.obs && (
                        <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl">
                          <p className="text-[10px] text-yellow-500 font-black uppercase mb-1">Observações</p>
                          <p className="text-sm italic text-gray-300">{slotDetalhe.obs}</p>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          {/* ABA RELATÓRIOS */}
          <TabsContent value="relatorios" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* SINTÉTICO */}
              <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[3rem] border-t-4 border-t-[#22c55e]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase">Sintético</h3>
                    <p className="text-gray-500 text-xs italic">Resumo de desempenho por período</p>
                  </div>
                  <BarChart3 className="text-[#22c55e]" size={32} />
                </div>

                {/* Filtro de período */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <Label className="text-[10px] uppercase text-gray-500 font-bold">Início</Label>
                    <Input type="date" value={sinteticoInicio} onChange={e => setSinteticoInicio(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-gray-500 font-bold">Final</Label>
                    <Input type="date" value={sinteticoFim} onChange={e => setSinteticoFim(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-sm font-bold text-gray-400">Faturamento Total</span>
                    <span className="text-xl font-black text-[#22c55e]">{formatarMoeda(dadosSintetico.faturamentoTotal)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Jogos Pagos</p>
                      <p className="text-lg font-black italic">{dadosSintetico.jogosPagos}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Média Diária</p>
                      <p className="text-lg font-black italic">{formatarMoeda(dadosSintetico.mediaDiaria)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Acessos Diários</p>
                      <p className="text-lg font-black italic">{dadosSintetico.acessosDiarios}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Acessos no Período</p>
                      <p className="text-lg font-black italic">{dadosSintetico.acessosMensais}</p>
                    </div>
                  </div>
                </div>
                <Button onClick={baixarPdfSintetico} className="w-full bg-[#22c55e] text-black font-black uppercase italic h-14 rounded-2xl">
                  <Download size={18} className="mr-2" /> Baixar PDF Sintético
                </Button>
              </Card>

              {/* ANALÍTICO */}
              <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[3rem] border-t-4 border-t-blue-500 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase text-white">Analítico</h3>
                    <p className="text-gray-500 text-xs italic">Detalhamento por categoria e setor</p>
                  </div>
                  <FileText className="text-blue-500" size={32} />
                </div>

                {/* Filtro de período */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <Label className="text-[10px] uppercase text-gray-500 font-bold">Início</Label>
                    <Input type="date" value={analiticoInicio} onChange={e => setAnaliticoInicio(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-gray-500 font-bold">Final</Label>
                    <Input type="date" value={analiticoFim} onChange={e => setAnaliticoFim(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Os dados serão calculados ao baixar o PDF</p>
                </div>

                <Button onClick={baixarPdfAnalitico} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase italic h-14 rounded-2xl transition-all active:scale-95 flex gap-2">
                  <FileText size={18} /> Baixar PDF Analítico
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* ABA PRODUTOS */}
          <TabsContent value="produtos">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black italic uppercase text-white flex items-center gap-3"><Package className="text-[#22c55e]" /> Inventário de Produtos</h3>
                <Button onClick={() => { setEditandoProduto(null); setFormProduto({ nome: "", tipo: "venda", preco_venda: "", preco_aluguel: "", quantidade_estoque: "" }); setModalProdutoAberto(true); }} className="bg-[#22c55e] text-black font-black uppercase rounded-xl h-12">+ CADASTRAR PRODUTO</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {produtos.map((p) => (
                  <Card key={p.id} className="bg-[#0c120f] border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group">
                    <Badge className={cn("absolute top-4 right-4 font-black italic", p.tipo === "venda" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400")}>{String(p.tipo).toUpperCase()}</Badge>
                    <div className="mt-4">
                      <p className="text-xl font-black italic uppercase text-white">{p.nome}</p>
                      <div className="mt-6 flex flex-col gap-3">
                        <div className="flex justify-between items-end">
                          <div className="space-y-2">
                            {(p.tipo === "venda" || p.tipo === "ambos") && ( 
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase leading-none">Venda</p>
                          <p className="text-xl font-black text-[#22c55e]">R$ {Number(p.preco_venda || p.preco || 0).toFixed(2)}</p>
                        </div>
                      )}
                            {(p.tipo === "aluguel" || p.tipo === "ambos") && (
                         <div>
                           <p className="text-[10px] font-black text-gray-500 uppercase leading-none">Aluguel</p>
                           <p className="text-xl font-black text-purple-400">R$ {Number(p.preco_aluguel || 0).toFixed(2)}</p>
                         </div>
                      )}
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-500 uppercase">Estoque</p>
                        <p className={cn("text-xl font-black italic", p.estoque < 10 ? "text-red-500" : "text-white")}> {p.estoque} UN</p>
                    </div>
                  </div>
                </div>
              </div>
                    <div className="grid grid-cols-2 gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" onClick={() => { setEditandoProduto(p); setFormProduto({ nome: p.nome, tipo: p.tipo as any, preco_venda: String(p.preco_venda ?? p.preco ?? ""), preco_aluguel: String(p.preco_aluguel ?? ""), quantidade_estoque: String(p.estoque) }); setModalProdutoAberto(true); }} className="border-white/10 text-[10px] font-black uppercase">Editar</Button>
                      <Button variant="outline" onClick={() => excluirProduto(p.id)} className="border-red-500/20 text-red-500 text-[10px] font-black uppercase">Excluir</Button>
                    </div>
                  </Card>
                ))}
              </div>
              <Dialog open={modalProdutoAberto} onOpenChange={setModalProdutoAberto}>
                <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
                  <DialogHeader><DialogTitle className="italic uppercase font-black">{editandoProduto ? "Editar produto" : "Cadastrar novo produto"}</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div><Label className="text-[10px] uppercase">Nome</Label><Input value={formProduto.nome} onChange={(e) => setFormProduto((prev) => ({ ...prev, nome: e.target.value }))} className="bg-white/5 mt-1" placeholder="Nome do produto" /></div>
                    <div><Label className="text-[10px] uppercase">Tipo</Label><select value={formProduto.tipo} onChange={(e) => setFormProduto((prev) => ({ ...prev, tipo: e.target.value as any }))} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 mt-1"><option value="venda">Venda</option><option value="aluguel">Aluguel</option><option value="ambos">Ambos</option></select></div>
                    {formProduto.tipo !== "aluguel" && (<div><Label className="text-[10px] uppercase">Preço venda (R$)</Label><Input type="number" value={formProduto.preco_venda} onChange={(e) => setFormProduto((prev) => ({ ...prev, preco_venda: e.target.value }))} className="bg-white/5 mt-1" /></div>)}
                    {formProduto.tipo !== "venda" && (<div><Label className="text-[10px] uppercase">Preço aluguel (R$)</Label><Input type="number" value={formProduto.preco_aluguel} onChange={(e) => setFormProduto((prev) => ({ ...prev, preco_aluguel: e.target.value }))} className="bg-white/5 mt-1" /></div>)}
                    <div><Label className="text-[10px] uppercase">Estoque</Label><Input type="number" value={formProduto.quantidade_estoque} onChange={(e) => setFormProduto((prev) => ({ ...prev, quantidade_estoque: e.target.value }))} className="bg-white/5 mt-1" /></div>
                    <DialogFooter><Button variant="outline" onClick={() => setModalProdutoAberto(false)}>Cancelar</Button><Button className="bg-[#22c55e] text-black" onClick={salvarProduto}>Salvar</Button></DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          {/* ABA DEPOIMENTOS */}
          <TabsContent value="comentarios" className="outline-none">
            <div className="grid md:grid-cols-2 gap-6">
              {["pendente", "aprovado"].map((tipo) => (
                <Card key={tipo} className="bg-[#0c120f] border-white/5 p-8 rounded-[2.5rem] min-h-[600px] flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black italic uppercase flex items-center gap-3 text-white">
                      {tipo === "pendente" ? (<><AlertTriangle className="text-yellow-500" size={24} /> Em Análise</>) : (<><CheckCircle2 className="text-[#22c55e]" size={24} /> Publicados</>)}
                    </h3>
                    <Badge className={cn("font-black px-3 py-1 rounded-full text-[10px] border-none", tipo === "pendente" ? "bg-yellow-500/10 text-yellow-500" : "bg-[#22c55e]/10 text-[#22c55e]")}>{depoimentos.filter((d: any) => d.status === tipo).length} ITENS</Badge>
                  </div>
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {depoimentos.filter((d: any) => d.status === tipo).length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] opacity-20"><p className="italic font-bold text-gray-500">Esperando Depoimentos...</p></div>
                      ) : (
                        depoimentos.filter((d: any) => d.status === tipo).map((d: any) => (
                          <div key={d.id} className="p-5 bg-white/5 border border-white/10 rounded-[2rem] group hover:border-[#22c55e]/30 transition-all duration-300">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="text-[10px] text-[#22c55e] font-black uppercase tracking-tighter">{d.autor}</p>
                                <div className="flex gap-0.5 mt-1">{[...Array(5)].map((_, i) => (<Star key={i} size={10} fill={i < (Number(d.estrelas) || 0) ? "#eab308" : "transparent"} className={i < (Number(d.estrelas) || 0) ? "text-yellow-500" : "text-gray-600/40"} />))}</div>
                                <p className="text-[9px] text-gray-600 font-bold mt-1 uppercase">{d.data}</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => processarComentario(d.id, "rejeitado")} className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></Button>
                            </div>
                            <p className="text-sm italic text-gray-300 leading-relaxed mb-5">"{d.texto}"</p>
                            <div className="flex gap-2">
                              {tipo === "pendente" ? (
                                <Button onClick={() => processarComentario(d.id, "aprovado")} className="w-full bg-[#22c55e] hover:bg-[#1da850] text-black font-black text-[10px] uppercase h-10 rounded-xl shadow-lg shadow-[#22c55e]/10"><Check size={14} className="mr-2" /> Aprovar no Mural</Button>
                              ) : (
                                <Button onClick={() => processarComentario(d.id, "pendente")} variant="outline" className="w-full border-white/10 text-gray-500 font-black text-[10px] uppercase h-10 rounded-xl hover:bg-white/5 hover:text-white">Remover do Mural</Button>
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

          {/* ABA VIP */}
          <TabsContent value="vip">
            <Card className="bg-[#0c120f] border-white/5 rounded-[2rem] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 uppercase font-black text-[10px]">
                    <TableHead>Grupo/Nome</TableHead>
                    <TableHead>Dia/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fidelidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vipsReais.length > 0 ? (
                    vipsReais.map((vip: any, i) => {
                      const progressoFidelidade = (vip.reservas_concluidas || 0) % 10;
                      const ganhouGratuidade = vip.reservas_concluidas > 0 && vip.reservas_concluidas % 10 === 0;
                      return (
                        <TableRow key={i} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                          <TableCell className="font-black italic uppercase text-[#22c55e]">{vip.nome}</TableCell>
                          <TableCell className="text-gray-300 font-medium">{vip.dia_fixo || "—"} às {vip.horario_fixo ? vip.horario_fixo.substring(0, 5) : "--:--"}</TableCell>
                          <TableCell><Badge className={vip.status_pagamento === "em_atraso" ? "bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1" : "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20 px-3 py-1"}>{vip.status_pagamento === "em_atraso" ? "Em atraso" : "Em dia"}</Badge></TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1.5 min-w-[120px]">
                              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                                <span className={ganhouGratuidade ? "text-yellow-500 animate-pulse" : "text-gray-500"}>{ganhouGratuidade ? "★ Próximo Grátis" : "Progresso"}</span>
                                <span className="text-white">{progressoFidelidade}/10</span>
                              </div>
                              <div className="w-full bg-white/5 h-2 rounded-full border border-white/5 overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${ganhouGratuidade ? "bg-yellow-500" : "bg-[#22c55e]"}`} style={{ width: `${ganhouGratuidade ? 100 : progressoFidelidade * 10}%` }} />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {vip.status_pagamento === "em_atraso" && (
                              <Button size="sm" onClick={() => handlePagarVip(vip.id)} className="bg-[#22c55e] text-black font-black text-[9px] uppercase h-8 rounded-xl">Confirmar Pgto</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center py-24 text-gray-500 italic text-lg">Nenhum cliente VIP encontrado.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* FINANCEIRO - CAIXA + COMISSÕES */}
          <TabsContent value="financeiro">
            <div className="space-y-8">
              {/* CAIXA DO DIA */}
              <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[3rem] border-t-4 border-t-[#22c55e]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-xl font-black italic uppercase text-white flex items-center gap-2">
                    <DollarSign className="text-[#22c55e]" /> Caixa do Dia
                  </h2>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] uppercase text-gray-500 font-bold">Data:</Label>
                    <Input type="date" value={caixaData} onChange={e => { setCaixaData(e.target.value); }} className="bg-white/5 border-white/10 text-white w-44" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Pgto Pix</p>
                    <p className="text-2xl font-black text-blue-400">{formatarMoeda(dadosCaixa.pix)}</p>
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Pgto Dinheiro</p>
                    <p className="text-2xl font-black text-green-400">{formatarMoeda(dadosCaixa.dinheiro)}</p>
                  </div>
                  <div className="p-5 bg-[#22c55e]/5 rounded-2xl border border-[#22c55e]/20">
                    <p className="text-[10px] text-[#22c55e] font-bold uppercase">Total Recebido</p>
                    <p className="text-2xl font-black text-[#22c55e]">{formatarMoeda(dadosCaixa.totalRecebido)}</p>
                  </div>
                  <div className="p-5 bg-red-500/5 rounded-2xl border border-red-500/20">
                    <p className="text-[10px] text-red-500 font-bold uppercase">Total a Receber</p>
                    <p className="text-2xl font-black text-red-400">{formatarMoeda(dadosCaixa.totalAReceber)}</p>
                  </div>
                </div>
              </Card>

              {/* COMISSÕES */}
              <Card className="bg-[#0c120f] border-white/10 p-8 rounded-[3rem]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-xl font-black italic uppercase text-white flex items-center gap-2">
                    <DollarSign className="text-[#22c55e]" /> Relatório de Comissões
                  </h2>
                </div>

                {/* Filtro de período */}
                <div className="grid grid-cols-2 gap-3 mb-6 max-w-md">
                  <div>
                    <Label className="text-[10px] uppercase text-gray-500 font-bold">Início</Label>
                    <Input type="date" value={comissaoInicio} onChange={e => setComissaoInicio(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-gray-500 font-bold">Final</Label>
                    <Input type="date" value={comissaoFim} onChange={e => setComissaoFim(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatorioComissoes.map((item, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex justify-between items-center hover:bg-white/10 transition-all">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Funcionário</p>
                        <p className="text-lg font-black italic text-white uppercase">{item.nome}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-[#22c55e] tracking-widest">Total a Pagar</p>
                        <p className="text-2xl font-black text-[#22c55e]">R$ {Number(item.total).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {relatorioComissoes.length === 0 && (<p className="text-gray-500 italic">Nenhuma comissão registrada no período.</p>)}
                </div>
              </Card>
            </div>
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
                    <TableHead>E-mail</TableHead>
                    <TableHead>Acessos</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead className="text-right">Gestão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listaEquipe.length > 0 ? (
                    listaEquipe.map((membro: any) => (
                      <TableRow key={membro.id} className={`border-white/5 transition-opacity ${!membro.ativo ? "opacity-40" : ""}`}>
                        <TableCell className={`font-bold italic uppercase ${!membro.ativo ? "line-through text-gray-600" : ""}`}>
                          {membro.nome} {membro.sobrenome}
                          {!membro.ativo && (<span className="ml-2 text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-black not-italic inline-block align-middle">BLOQUEADO</span>)}
                        </TableCell>
                        <TableCell className="text-gray-400 text-xs">{membro.email_corporativo || membro.email || "—"}</TableCell>
                        <TableCell className="font-black text-[#22c55e]">{membro.total_acessos || 0}</TableCell>
                        <TableCell className="text-xs text-gray-400">{membro.ultimo_acesso ? new Date(membro.ultimo_acesso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "Nunca"}</TableCell>
                        <TableCell className="text-[10px] font-black text-gray-500 uppercase">{membro.turno || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className={`h-8 rounded-xl border border-white/10 ${membro.ativo ? "text-red-500 hover:bg-red-500/10" : "text-green-500 hover:bg-green-500/10"}`} onClick={() => handleToggleStatusEquipe(membro.id, membro.ativo)}>
                            {membro.ativo ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                            <span className="ml-2 text-[9px] font-black uppercase">{membro.ativo ? "Bloquear" : "Ativar"}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 opacity-50 italic">Carregando equipe ou nenhum atendente cadastrado...</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* CADASTRO DE FUNCIONÁRIO */}
          <TabsContent value="cadastro">
            <Card className="bg-[#0c120f] border-white/5 p-8 rounded-[2.5rem] max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-[#22c55e]/20 p-3 rounded-2xl border border-[#22c55e]/30"><UserPlus className="text-[#22c55e]" size={28} /></div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase text-white">Cadastrar Funcionário</h3>
                  <p className="text-gray-500 text-xs">Preencha os dados abaixo</p>
                </div>
              </div>
              <form onSubmit={handleCadastrarFuncionario} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Nome</Label><Input required value={novoFuncNome} onChange={(e) => setNovoFuncNome(e.target.value)} placeholder="Nome" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" /></div>
                  <div className="space-y-2"><Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Sobrenome</Label><Input required value={novoFuncSobrenome} onChange={(e) => setNovoFuncSobrenome(e.target.value)} placeholder="Sobrenome" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">E-mail do Atendente</label>
                  <input type="email" placeholder="exemplo@atendcedro.com" value={novoFuncEmail} onChange={(e) => setNovoFuncEmail(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-[#22c55e]" required />
                </div>
                <div className="space-y-2"><Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Telefone</Label><Input required value={novoFuncTelefone} onChange={(e) => setNovoFuncTelefone(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" /></div>
                <div className="space-y-2">
                  <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Senha (8 caracteres)</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                    <Input required value={novoFuncSenha} onChange={(e) => setNovoFuncSenha(e.target.value)} type={showFuncSenha ? "text" : "password"} placeholder="Senha segura" maxLength={8} className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white" />
                    <button type="button" onClick={() => setShowFuncSenha(!showFuncSenha)} className="absolute right-4 top-3.5 text-gray-600">{showFuncSenha ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Requisitos de Segurança:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { ok: funcPasswordValidations.hasExactLength, label: "Exatamente 8 caracteres" },
                      { ok: funcPasswordValidations.hasUpperCase, label: "Letra maiúscula" },
                      { ok: funcPasswordValidations.hasLowerCase, label: "Letra minúscula" },
                      { ok: funcPasswordValidations.hasSpecialChar, label: "Caractere especial" },
                      { ok: funcPasswordValidations.hasNumber, label: "Número" },
                      { ok: funcPasswordValidations.noRepeatedNumbers, label: "Sem números repetidos" },
                    ].map((rule, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px]">
                        {rule.ok ? <CheckCircle2 className="w-3 h-3 text-[#22c55e]" /> : <Circle className="w-3 h-3 text-gray-600" />}
                        <span className={rule.ok ? "text-white" : "text-gray-500"}>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button disabled={loadingCadastro || !funcPasswordValidations.isValid} type="submit" className="w-full bg-[#22c55e] hover:bg-[#1bb054] text-black font-black h-14 rounded-2xl uppercase italic transition-all disabled:opacity-30 flex items-center gap-2">
                  <UserPlus size={20} /> {loadingCadastro ? "Cadastrando..." : "Cadastrar Funcionário"}
                </Button>
              </form>
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
