import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, Users, ChevronRight, Star,
  Instagram, Facebook, Phone, MapPin, Camera, 
  PlayCircle, MessageSquare, ArrowRight 
} from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import { Badge } from "@/components/ui/badge";

// Função auxiliar para evitar erro de compilação na variável slotsHoje
const gerarSlotsAgenda = (duracao: number) => {
  // Esta função pode ser personalizada, aqui ela retorna um placeholder 
  // já que você usa o slotsBase mais abaixo para o grid detalhado.
  return []; 
};

export const Index = () => {
  const navigate = useNavigate();
  const [mostrarAgenda, setMostrarAgenda] = useState(false);
  const [duracaoDesejada, setDuracaoDesejada] = useState(60); // 30, 60 ou 90
  const [comentarios, setComentarios] = useState<any[]>([]);
  
  const PALAVRAS_BLOQUEADAS = ["Porra", "Merda", "Lixo", "Bosta"];
  
  // Lógica de Blocos Flexíveis (Sua atualização)
  const slotsBase = [
    { inicio: "08:00", fim30: "08:30", fim60: "09:00", fim90: "09:30", s: "livre" },
    { inicio: "09:30", fim30: "10:00", fim60: "10:30", fim90: "11:00", s: "ocupado" },
    { inicio: "18:00", fim30: "18:30", fim60: "19:00", fim90: "19:30", s: "livre" },
    { inicio: "19:30", fim30: "20:00", fim60: "20:30", fim90: "21:00", s: "livre" },
    { inicio: "21:00", fim30: "21:30", fim60: "22:00", fim90: "22:30", s: "livre" },
  ];

  const filtrarTexto = (texto: string) => {
    let textoLimpo = texto;
    PALAVRAS_BLOQUEADAS.forEach(palavra => {
      const regex = new RegExp(palavra, "gi");
      textoLimpo = textoLimpo.replace(regex, "****");
    });
    return textoLimpo;
  };

  useEffect(() => {
    const carregarDepoimentos = () => {
      const salvos = JSON.parse(localStorage.getItem("arena_reviews") || "[]");
      const filtrados = salvos.map((c: any) => ({
        ...c,
        texto: filtrarTexto(c.texto),
        nome: filtrarTexto(c.nome)
      }));
      setComentarios(filtrados.slice(0, 3));
    };
    carregarDepoimentos();
  }, []);

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans selection:bg-[#22c55e]/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden border-b border-white/5 py-20">
        <div className="absolute inset-0 z-0">
          <img src={heroArena} className="w-full h-full object-cover opacity-30" alt="Background Arena" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-transparent to-[#060a08]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center">
          
          <button 
            onClick={() => setMostrarAgenda(!mostrarAgenda)}
            className="mb-8 px-6 py-2.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 flex items-center gap-2 hover:bg-[#22c55e]/20 transition-all active:scale-95 group"
          >
            <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#22c55e]">
              {mostrarAgenda ? "Fechar Agenda" : "Ver Horários Disponíveis Hoje"}
            </span>
            <ChevronRight className={`w-4 h-4 text-[#22c55e] transition-transform ${mostrarAgenda ? 'rotate-90' : ''}`} />
          </button>

          {mostrarAgenda && (
            <div className="w-full max-w-4xl mb-12 animate-in fade-in zoom-in duration-500">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
                
                <div className="flex justify-center gap-2 mb-6 bg-white/5 p-1.5 rounded-2xl w-fit mx-auto">
                  {[30, 60, 90].map(m => (
                    <button 
                      key={m} 
                      onClick={() => setDuracaoDesejada(m)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${duracaoDesejada === m ? 'bg-[#22c55e] text-black' : 'text-gray-500'}`}
                    >
                      {m} MIN
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {slotsBase.map((slot, i) => (
                    <button
                      key={i}
                      disabled={slot.s === 'ocupado'}
                      onClick={() => navigate("/login")}
                      className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all 
                        ${slot.s === 'ocupado' 
                          ? 'border-red-500/20 bg-red-500/5 opacity-40 cursor-not-allowed' 
                          : 'border-[#22c55e]/30 bg-[#22c55e]/5 hover:bg-[#22c55e] hover:text-black group'}`}
                    >
                      <span className="text-xs font-black italic">
                        {slot.inicio} - {duracaoDesejada === 30 ? slot.fim30 : duracaoDesejada === 60 ? slot.fim60 : slot.fim90}
                      </span>
                      <span className={`text-[8px] font-bold uppercase mt-1 ${slot.s === 'ocupado' ? 'text-red-500' : 'text-[#22c55e] group-hover:text-black'}`}>
                        {slot.s === 'ocupado' ? 'Reservado' : 'Livre'}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-gray-500 mt-6 uppercase font-bold tracking-widest italic">* Clique em um horário livre para realizar sua reserva</p>
              </div>
            </div>
          )}

          <div className="relative mb-6">
            <img src="/logo-arena.png" onError={(e) => { e.currentTarget.src = "/media/logo-arena.png" }} alt="Arena Cedro" className="w-[320px] md:w-[550px] h-auto object-contain drop-shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-float" />
          </div>
          
          <h1 className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl font-medium tracking-tight italic">
            O melhor campo de futebol society da região.<br/>
            Reserve seu horário e venha jogar!
          </h1>

          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button className="bg-[#22c55e] hover:bg-[#1db053] text-black text-lg py-7 rounded-2xl font-black uppercase italic transition-all active:scale-95 shadow-[0_10px_40px_-10px_rgba(34,197,94,0.5)]" onClick={() => navigate("/login")}>
              Agendar Agora <ChevronRight className="ml-1 w-5 h-5" />
            </Button>
            <div className="flex justify-center gap-4 mt-4 text-center">
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase">☀️ Diurno</p>
                <p className="text-[#22c55e] font-black italic text-lg">R$ 80</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase">🌙 Noturno</p>
                <p className="text-[#22c55e] font-black italic text-lg">R$ 120</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POR QUE ESCOLHER */}
      <section className="py-24 container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-4 italic uppercase tracking-tighter text-white">POR QUE ESCOLHER A <span className="text-[#22c55e]">ARENA CEDRO?</span></h2>
        <p className="text-gray-500 mb-16 font-medium">Infraestrutura completa para suas partidas.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center">
            <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mb-6"><Calendar className="text-black" /></div>
            <h3 className="text-xl font-bold mb-3 uppercase italic">Agendamento Fácil</h3>
            <a href="tel:98999910535" className="text-[#22c55e] font-black text-lg block hover:scale-105 transition-transform tracking-tighter">(98) 99991-0535</a>
          </div>

          <div className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center">
            <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mb-6"><Clock className="text-black" /></div>
            <h3 className="text-xl font-bold mb-3 uppercase italic">Horários Flexíveis</h3>
            <Button onClick={() => setMostrarAgenda(!mostrarAgenda)} variant="outline" className="w-full border-[#22c55e]/30 text-[#22c55e] uppercase text-[10px] font-black italic py-6">
              {mostrarAgenda ? "Fechar Agenda" : "Ver Horários Hoje"}
            </Button>
          </div>

          <div className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center">
            <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mb-6"><Users className="text-black" /></div>
            <h3 className="text-xl font-bold mb-3 uppercase italic">Campo Society</h3>
            <button onClick={() => document.getElementById('estrutura')?.scrollIntoView({ behavior: 'smooth' })} className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-[#22c55e] hover:text-black transition-all">
              <ArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* 3. ESTRUTURA (VÍDEOS E FOTOS ATUALIZADOS) */}
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

      {/* 4. DEPOIMENTOS */}
      <section className="py-24 container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-16 italic uppercase text-white">O QUE OS NOSSOS <span className="text-[#22c55e]">CLIENTES</span> DIZEM</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {comentarios.length > 0 ? comentarios.map((c, i) => (
            <div key={i} className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] text-left animate-in fade-in zoom-in">
              <div className="flex text-yellow-500 mb-4 gap-1">
                {Array.from({ length: c.estrelas }).map((_, st) => <Star key={st} size={14} fill="currentColor" />)}
              </div>
              <p className="text-gray-300 text-sm italic mb-6">"{c.texto}"</p>
              <p className="font-bold text-[#22c55e] text-xs uppercase tracking-widest">— {c.nome}</p>
            </div>
          )) : <div className="col-span-3 text-gray-600 italic">Ainda não há avaliações.</div>}
        </div>
        <Button onClick={() => navigate("/login")} variant="ghost" className="mt-12 text-gray-500 hover:text-white uppercase font-black text-xs gap-2">
          <MessageSquare size={16} /> Escrever Depoimento
        </Button>
      </section>

      {/* 5. PRONTO PARA JOGAR? */}
      <section className="py-24 container mx-auto px-4 text-center">
        <div className="bg-gradient-to-b from-[#111614] to-transparent border border-white/10 rounded-[3rem] p-12 md:p-20">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-6 text-white">PRONTO PARA <span className="text-[#22c55e]">JOGAR?</span></h2>
          <Button onClick={() => navigate("/login")} className="bg-[#22c55e] hover:bg-[#1db053] text-black px-12 py-8 rounded-2xl font-black uppercase italic text-xl shadow-2xl transition-transform hover:scale-105">
            Fazer Reserva <ChevronRight className="ml-1" />
          </Button>
        </div>
      </section>

      {/* 6. FOOTER FINAL */}
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
              <h4 className="text-[10px] uppercase font-black text-gray-500">Localização</h4>
              <a href="https://maps.google.com" target="_blank" className="flex items-center justify-center md:justify-start gap-3 text-gray-300 hover:text-[#22c55e] transition-all text-xs font-bold">
                <MapPin size={18} className="text-[#22c55e] shrink-0" /> Av. Trindade, 3126, SJ de Ribamar-MA
              </a>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black text-gray-500">Redes Sociais</h4>
              <div className="flex justify-center md:justify-start gap-4">
                <a href="https://www.instagram.com/arenacedrofut7/" target="_blank" className="p-3 bg-white/5 rounded-xl hover:bg-[#22c55e] hover:text-black transition-all"><Instagram size={20} /></a>
                <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-[#22c55e] hover:text-black transition-all"><Facebook size={20} /></a>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black text-gray-500">Acesso Restrito</h4>
              <Button variant="link" onClick={() => navigate("/admin/login")} className="text-gray-600 hover:text-white text-[10px] font-black uppercase italic p-0">Administração</Button>
            </div>
          </div>
          <p className="mt-20 text-[9px] text-gray-800 font-bold uppercase italic tracking-widest">© 2026 Arena Cedro.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;