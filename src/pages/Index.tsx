import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, Users, ChevronRight, Star,
  Instagram, Facebook, Phone, MapPin, Camera, 
  PlayCircle, MessageSquare, ArrowDown, 
  ShieldCheck, X, Bell
} from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import { Badge } from "@/components/ui/badge";
import  TestimonialForm  from "@/components/home/TestimonialForm";
// Função auxiliar para evitar erro de compilação na variável slotsHoje
const gerarSlotsAgenda = (duracao: number) => {
  const slotsBase = [
  // --- TURNO DIURNO (R$ 80,00/h) ---
  { inicio: "08:00", fim30: "08:30", fim60: "09:00", fim90: "09:30", s: "livre" },
  { inicio: "09:30", fim30: "10:00", fim60: "10:30", fim90: "11:00", s: "reservado" },
  { inicio: "11:00", fim30: "11:30", fim60: "12:00", fim90: "12:30", s: "livre" },
  { inicio: "12:30", fim30: "13:00", fim60: "13:30", fim90: "14:00", s: "livre" },
  { inicio: "14:00", fim30: "14:30", fim60: "15:00", fim90: "15:30", s: "livre" },
  { inicio: "15:30", fim30: "16:00", fim60: "16:30", fim90: "17:00", s: "livre" },
  { inicio: "17:00", fim30: "17:30", fim60: "18:00", fim90: "18:30", s: "livre" },

  // --- TURNO NOTURNO (R$ 120,00/h) ---
  { inicio: "18:00", fim30: "18:30", fim60: "19:00", fim90: "19:30", s: "livre" },
  { inicio: "19:30", fim30: "20:00", fim60: "20:30", fim90: "21:00", s: "reservado" },
  { inicio: "21:00", fim30: "21:30", fim60: "22:00", fim90: "22:00", s: "livre" },
];
  return slotsBase.map((slot) => {
    const hora = parseInt(slot.inicio.split(":")[0]);
    const isNoturno = hora >= 18;
    
    // Se a duração for 90min no último slot, ele trava em 22:00 para não ultrapassar
    const fim = duracao === 30 ? slot.fim30 : duracao === 60 ? slot.fim60 : slot.fim90;
    
    const precoBase = isNoturno ? 120 : 80;
    const valor = (precoBase / 60) * duracao;

    return {
      inicio: slot.inicio,
      fim: fim,
      turno: isNoturno ? "noturno" : "diurno",
      valor: valor,
      status: slot.s === "reservado" || slot.s === "ocupado" ? "reservado" : "livre",
    };
  });
};

export const Index = () => {
  const navigate = useNavigate();
  const [mostrarAgenda, setMostrarAgenda] = useState(false);
  const [duracaoDesejada, setDuracaoDesejada] = useState(60); // 30, 60 ou 90
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [duracaoFiltro, setDuracaoFiltro] = useState(60);
  const slotsCalculados = gerarSlotsAgenda(duracaoFiltro); 
  
  const PALAVRAS_BLOQUEADAS = [
  // Termos Gerais
  "Porra", "Merda", "Lixo", "Bosta", "Caralho", "Puta", "Putaria", 
  "Vagabundo", "Desgraça", "Inferno", "Cacete", "Fodase", "Foder",
  
  // Ofensas Diretas
  "Corno", "Otário", "Verme", "Inútil", "Escroto", "Ladrão", "Safado",
  
  // Variações e termos comuns em avaliações fakes
  "Lixo", "Horrível", "Péssimo", "Fraude", "Engano"
];
  
const censurarTexto = (texto: string) => {
  let textoCensurado = texto;
  PALAVRAS_BLOQUEADAS.forEach((palavra) => {
    const regex = new RegExp(palavra, "gi"); // "gi" faz ignorar maiúsculas/minúsculas
    textoCensurado = textoCensurado.replace(regex, "****");
  });
  return textoCensurado;
};

  useEffect(() => {
    const carregarDepoimentos = () => {
      const salvos = JSON.parse(localStorage.getItem("arena_reviews") || "[]");
      const filtrados = salvos.map((c: any) => ({
        ...c,
        texto: censurarTexto(c.texto),
        nome: censurarTexto(c.nome)
      }));
      setComentarios(filtrados.slice(0, 3));
    };
    carregarDepoimentos();
  }, []);

  const PromoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [promoData, setPromoData] = useState({ texto: "", link: "" });

  useEffect(() => {
    // Verifica se existe promoção ativa no localStorage
    const ativa = localStorage.getItem("arena_promo_ativa") === "true";
    const texto = localStorage.getItem("arena_promo_texto") || "Garanta seu racha hoje!";
    const link = localStorage.getItem("arena_promo_link") || "#";

    if (ativa) {
      setPromoData({ texto, link });
      // Delay de 2 segundos para aparecer (não assustar o cliente logo de cara)
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-[#0c120f] border border-[#22c55e]/30 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.2)] animate-in zoom-in duration-300">
        
        {/* Botão Fechar */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-[#22c55e]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#22c55e]/30">
            <Bell className="text-[#22c55e] animate-bounce" size={32} />
          </div>

          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22c55e] mb-2">Aviso Importante</h3>
          <p className="text-xl font-black italic uppercase text-white leading-tight mb-8">
            "{promoData.texto}"
          </p>

          <a 
            href={promoData.link}
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-[#22c55e] hover:bg-[#1db053] text-black font-black py-4 rounded-2xl uppercase italic transition-all active:scale-95 shadow-[0_10px_30px_-10px_rgba(34,197,94,0.5)]"
          >
            Aproveitar Agora <ChevronRight size={20} />
          </a>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            Talvez mais tarde
          </button>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans selection:bg-[#22c55e]/30">
      <PromoPopup />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden border-b border-white/5 py-20">
        <div className="absolute inset-0 z-0">
          <img src={heroArena} className="w-full h-full object-cover opacity-30" alt="Background Arena" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-transparent to-[#060a08]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center">
          
          {/* BOTÃO PRINCIPAL COM SETA DINÂMICA */}
          <button 
            onClick={() => setMostrarAgenda(!mostrarAgenda)}
            className="mb-8 px-6 py-2.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 flex items-center gap-2 hover:bg-[#22c55e]/20 transition-all active:scale-95 group"
          >
            <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#22c55e]">
              {mostrarAgenda ? "FECHAR AGENDA" : "VER HORÁRIOS DISPONÍVEIS HOJE"}
            </span>
            {/* Troca de ícone: ChevronUp quando aberto */}
            {mostrarAgenda ? (
              <ArrowDown className="w-4 h-4 text-[#22c55e] rotate-180 transition-transform duration-300" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#22c55e]" />
            )}
          </button>

          {/* GRADE DE HORÁRIOS QUE ATUALIZA */}
          {mostrarAgenda && (
            <div className="w-full max-w-4xl mb-12 animate-in fade-in zoom-in duration-500">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
                
                {/* SELETOR DE MINUTOS - ATUALIZA O duracaoFiltro */}
                <div className="flex justify-center gap-2 mb-6 bg-white/5 p-1.5 rounded-2xl w-fit mx-auto">
                  {[30, 60, 90].map(m => (
                    <button 
                      key={m} 
                      onClick={() => setDuracaoFiltro(m)} // Agora altera a variável correta
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${duracaoFiltro === m ? 'bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/40' : 'text-gray-500'}`}
                    >
                      {m} MIN
                    </button>
                  ))}
                </div>

                {/* GRID QUE MUDE CONFORME OS MINUTOS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {slotsCalculados.map((slot, i) => (
                    <button
                      key={i}
                      disabled={slot.status === 'reservado'} 
                      onClick={() => navigate("/login")}
                      className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all 
                        ${slot.status === 'reservado' 
                          ? 'border-red-500/20 bg-red-500/5 opacity-40 cursor-not-allowed' 
                          : 'border-[#22c55e]/30 bg-[#22c55e]/5 hover:bg-[#22c55e] hover:text-black group'}`}
                    >
                      <span className="text-xs font-black italic">
                        {slot.inicio} - {slot.fim}
                      </span>
                      <span className={`text-[8px] font-bold uppercase mt-1 ${slot.status === 'reservado' ? 'text-red-500' : 'text-[#22c55e] group-hover:text-black'}`}>
                        {slot.status === 'reservado' ? 'Reservado' : 'Livre'}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-gray-500 mt-6 uppercase font-bold tracking-widest italic">* Clique em um horário livre para realizar sua reserva</p>
              </div>
            </div>
          )}

          <div className="relative mb-6">
            <img src="/logo-arena.png" onError={(e) => { e.currentTarget.src = "/media/logo-arena.png" }} alt="Arena Cedro" className="w-[450px] md:w-[850px] h-auto object-contain drop-shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-float" />
          </div>
          
          <h1 className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl font-medium tracking-tight italic">
            O melhor campo de futebol society da região.<br/>
            Reserve seu horário e venha jogar!
          </h1>

          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button className="bg-[#22c55e] hover:bg-[#1db053] text-black text-lg py-7 rounded-2xl font-black uppercase italic transition-all active:scale-95 shadow-[0_10px_40px_-10px_rgba(34,197,94,0.5)]" onClick={() => navigate("/login")}>
              Agendar Agora <ChevronRight className="ml-1 w-5 h-5" />
            </Button>
            <div className="flex justify-center gap-6 mt-6 text-center">
  {/* CARD DIURNO */}
  <div className="bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] min-w-[140px] backdrop-blur-sm transition-transform hover:scale-105">
    <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">☀️ Diurno</p>
    <p className="text-[#22c55e] font-black italic text-3xl drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
      R$ 80
      <span className="text-[10px] text-gray-500 not-italic ml-1 uppercase">/h</span>
    </p>
  </div>

  {/* CARD NOTURNO */}
  <div className="bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] min-w-[140px] backdrop-blur-sm transition-transform hover:scale-105">
    <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">🌙 Noturno</p>
    <p className="text-[#22c55e] font-black italic text-3xl drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
      R$ 120
      <span className="text-[10px] text-gray-500 not-italic ml-1 uppercase">/h</span>
    </p>
  </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POR QUE ESCOLHER */}
<section className="py-24 container mx-auto px-4 text-center">
  <h2 className="text-3xl md:text-5xl font-black mb-4 italic uppercase tracking-tighter text-white">
    POR QUE ESCOLHER A <span className="text-[#22c55e]">ARENA CEDRO?</span>
  </h2>
  <p className="text-gray-500 mb-16 font-medium">Infraestrutura completa para suas partidas.</p>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
    {/* AGENDAMENTO */}
    <div className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center group hover:border-[#22c55e]/30 transition-all">
      <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#22c55e]/20">
        <Calendar className="text-black" />
      </div>
      <h3 className="text-xl font-bold mb-2 uppercase italic text-white">Agendamento Fácil</h3>
      <p className="text-gray-500 text-sm mb-6">Reserve seu horário online em segundos, sem complicações ou espera.</p>
      
      <Button 
        onClick={() => navigate("/login")} 
        className="w-full bg-[#22c55e] hover:bg-[#1db053] text-black font-black uppercase italic py-6 rounded-xl mb-4"
      >
        Fazer Reserva
      </Button>
      
      <a href="tel:98999910535" className="text-[#22c55e]/50 font-bold text-xs hover:text-[#22c55e] transition-colors tracking-widest">
        OU LIGUE: (98) 99991-0535
      </a>
    </div>

    {/* CARD HORÁRIOS FLEXÍVEIS (ESTILO IGUAL À HERO) */}
    <div className={`bg-[#111614] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center transition-all ${mostrarAgenda ? 'md:col-span-1 border-[#22c55e]/30' : 'hover:border-[#22c55e]/30'}`}>
      <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#22c55e]/20">
        <Clock className="text-black" />
      </div>
      <h3 className="text-xl font-bold mb-2 uppercase italic text-white">Horários Flexíveis</h3>
      <p className="text-gray-500 text-sm mb-8 text-center">
        Funcionamos todos os dias, das 08h às 22h, para o seu racha nunca parar.
      </p>

      {/* BOTÃO CLICÁVEL IGUAL À HERO */}
      <button 
        onClick={() => {
          setMostrarAgenda(!mostrarAgenda);
          if (!mostrarAgenda) {
            // Pequeno scroll suave para focar na agenda se necessário
            const el = document.getElementById('secao-por-que');
            el?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className={`px-6 py-2.5 rounded-full border flex items-center gap-2 transition-all active:scale-95 group ${
          mostrarAgenda ? 'border-red-500/30 bg-red-500/10' : 'border-[#22c55e]/30 bg-[#22c55e]/10'
        }`}
      >
        <span className={`w-2 h-2 rounded-full animate-pulse ${mostrarAgenda ? 'bg-red-500' : 'bg-[#22c55e]'}`} />
        <span className={`text-[10px] uppercase tracking-widest font-extrabold ${mostrarAgenda ? 'text-red-500' : 'text-[#22c55e]'}`}>
          {mostrarAgenda ? "FECHAR AGENDA" : "VER AGENDA COMPLETA"}
        </span>
        {mostrarAgenda ? (
          <ArrowDown className="w-4 h-4 text-red-500 rotate-180 transition-transform duration-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#22c55e]" />
        )}
      </button>

      {/* CONTEÚDO DA AGENDA DINÂMICA (APARECE DENTRO DO CARD) */}
      {mostrarAgenda && (
        <div className="w-full mt-8 animate-in fade-in zoom-in duration-500">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-[2rem] shadow-2xl">
            
            {/* SELETOR DE MINUTOS */}
            <div className="flex justify-center gap-1 mb-6 bg-white/5 p-1 rounded-xl w-fit mx-auto">
              {[30, 60, 90].map(m => (
                <button 
                  key={m} 
                  onClick={() => setDuracaoFiltro(m)} 
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${duracaoFiltro === m ? 'bg-[#22c55e] text-black' : 'text-gray-500'}`}
                >
                  {m} MIN
                </button>
              ))}
            </div>

            {/* GRID DE HORÁRIOS REAL */}
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {slotsCalculados.slice(0, 8).map((slot, i) => ( // Mostra os 8 primeiros ou todos
                <button
                  key={i}
                  disabled={slot.status === 'reservado'} 
                  onClick={() => navigate("/login")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all 
                    ${slot.status === 'reservado' 
                      ? 'border-red-500/20 bg-red-500/5 opacity-40 cursor-not-allowed' 
                      : 'border-[#22c55e]/30 bg-[#22c55e]/5 hover:bg-[#22c55e] hover:text-black group'}`}
                >
                  <span className="text-[10px] font-black italic">{slot.inicio}</span>
                  <span className={`text-[7px] font-bold uppercase ${slot.status === 'reservado' ? 'text-red-500' : 'text-[#22c55e] group-hover:text-black'}`}>
                    {slot.status === 'reservado' ? 'Ocupado' : 'Livre'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* ESTRUTURA */}
    <div className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center group hover:border-[#22c55e]/30 transition-all">
      <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#22c55e]/20">
        <Users className="text-black" />
      </div>
      <h3 className="text-xl font-bold mb-2 uppercase italic text-white">Campo Society</h3>
      <p className="text-gray-500 text-sm mb-6">Grama sintética premium e iluminação profissional para o seu melhor jogo.</p>
      
      <button onClick={() => document.getElementById('estrutura')?.scrollIntoView({ behavior: 'smooth' })} className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-[#22c55e] hover:text-black transition-all">
        <ArrowDown />
      </button>
    </div>
  </div>
</section>

      {/* 4. ESTRUTURA (VÍDEOS E FOTOS ATUALIZADOS) */}
      <section id="estrutura" className="py-24 bg-[#0a0f0d] border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase text-white">NOSSA <span className="text-[#22c55e]">ESTRUTURA</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <div className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5">
              <img src="/media/campo-1.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Campo 1" />
            </div>
            <div className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5">
              <img src="/media/campo-2.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Campo 2" />
            </div>
            <div className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5">
              <img src="/media/campo-4.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Campo 4" />
            </div>
            <div className="col-span-2 aspect-video md:aspect-auto bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5">
              <img src="/media/campohorizontal-3.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Campo Horizontal" />
              <div className="absolute bottom-6 left-6 z-20"><Badge className="bg-[#22c55e] text-black font-black italic">VISTA AMPLA</Badge></div>
            </div>
            {/* Loop de Vídeos */}
            {[1, 2, 3, 4, 5, 6].map((v) => (
              <div key={v} className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5">
                <PlayCircle className="absolute inset-0 m-auto text-white/80 z-20" size={48} />
                <video src={`/media/video-${v}.mp4`} className="w-full h-full object-cover" muted loop playsInline onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DEPOIMENTOS */}
<section className="py-24 bg-black/20">
  <div className="container mx-auto px-4">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-5xl font-black mb-4 italic uppercase tracking-tighter text-white">
        O QUE OS NOSSOS <span className="text-[#22c55e]">CLIENTES</span> DIZEM
      </h2>
      <p className="text-gray-500 font-medium">Quem joga na Arena Cedro, aprova.</p>
    </div>
    </div>

    {/* Grid de Depoimentos */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {[
        { nome: "MARCOS OLIVEIRA", texto: "Grama muito boa e iluminação excelente. O sistema de reserva pelo site é o melhor da cidade.", estrelas: 5 },
        { nome: "FELIPE SANTOS", texto: "Ambiente familiar e muito organizado. Os coletes estão sempre limpos e a cerveja gelada!", estrelas: 5 },
        { nome: "ANDRÉ COSTA", texto: "Jogo aqui toda semana. Praticidade total para marcar o horário do pessoal do trabalho.", estrelas: 5 }
      ].map((review, i) => (
        <div key={i} className="bg-[#111614] p-8 rounded-[2rem] border border-white/5 relative">
          <div className="flex gap-1 mb-4 text-[#22c55e]">
            {Array.from({ length: review.estrelas }).map((_, s) => (
              <Star key={s} size={14} fill="currentColor" />
            ))}
          </div>
          <p className="text-gray-300 italic mb-6">"{review.texto}"</p>
          <p className="text-[#22c55e] font-black text-xs tracking-widest uppercase">{review.nome}</p>
        </div>
      ))}
    </div> {/* FIM DA GRID */}
</section> {/* FIM DA SECTION */}

      {/* 6. PRONTO PARA JOGAR? */}
      <section className="py-24 container mx-auto px-4 text-center">
        <div className="bg-gradient-to-b from-[#111614] to-transparent border border-white/10 rounded-[3rem] p-12 md:p-20">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-6 text-white">PRONTO PARA <span className="text-[#22c55e]">JOGAR?</span></h2>
          <Button onClick={() => navigate("/login")} className="bg-[#22c55e] hover:bg-[#1db053] text-black px-12 py-8 rounded-2xl font-black uppercase italic text-xl shadow-2xl transition-transform hover:scale-105">
            Fazer Reserva <ChevronRight className="ml-1" />
          </Button>
        </div>
      </section>

      {/* 8. BOTÃO WHATSAPP - APENAS NA INDEX */}
      <a
        href="https://wa.me/5598999910535?text=Olá!%20Vi%20os%20horários%20disponíveis%20no%20site%20da%20Arena%20Cedro%20e%20gostaria%20de%20fazer%20uma%20reserva."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[50] w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform group animate-bounce-slow"
      >
        {/* Efeito de Ondas de Pulso (Opcional, mas fica profissa) */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
        
        <MessageSquare size={32} fill="currentColor" className="relative z-10" />
        
        {/* Etiqueta Flutuante ao passar o mouse */}
        <span className="absolute right-20 bg-white text-black text-[10px] font-black uppercase py-2 px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
          Chamar no WhatsApp
        </span>
      </a>

      {/* 7. FOOTER FINAL */}
      <footer className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#22c55e] rounded-full flex items-center justify-center"><Users size={20} className="text-black" /></div>
            <span className="text-2xl font-black italic uppercase">Arena Cedro</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 w-full max-w-5xl text-center md:text-left border-t border-white/5 pt-12">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black text-gray-500">Contato</h4>
              <a href="tel:98999910535" className="flex items-center justify-center md:justify-start gap-3 text-white hover:text-[#22c55e] transition-all font-black italic">
                <Phone size={18} className="text-[#22c55e]" /> (98) 99991-0535
              </a>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black text-gray-500 italic tracking-widest">Localização</h4>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Av.+Trindade,+3126,+Matinha,+São+José+de+Ribamar+-+MA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start gap-3 text-gray-300 hover:text-[#22c55e] transition-all text-xs font-bold group"
              >
                <div className="bg-[#22c55e]/10 p-2 rounded-lg group-hover:bg-[#22c55e] transition-all">
                   <MapPin size={18} className="text-[#22c55e] group-hover:text-black shrink-0" />
                </div>
                <span className="leading-relaxed">
                  Av. Trindade, 3126, Matinha,<br /> 
                  SJ de Ribamar-MA
                </span>
              </a>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black text-gray-500">Redes Sociais</h4>
              <div className="flex justify-center md:justify-start gap-4">
                <a href="https://www.instagram.com/arenacedrofut7/" target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-[#22c55e] hover:text-black transition-all"><Instagram size={40} /></a>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black text-gray-500">Acesso Restrito</h4>
              <Button 
  className="bg-[#22c55e] hover:bg-[#1db053] text-black text-[10px] md:text-xs py-5 px-6 rounded-xl font-black uppercase italic transition-all active:scale-95 shadow-[0_5px_20px_-5px_rgba(34,197,94,0.4)]" 
  onClick={() => navigate("/adminlogin")}
>
  <ShieldCheck className="mr-1.5 w-3.5 h-3.5" />
  Área Administrativa
</Button>
            </div>
          </div>
          <p className="mt-20 text-[9px] text-gray-800 font-bold uppercase italic tracking-widest">© 2026 Arena Cedro.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;