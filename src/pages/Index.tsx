import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Clock, Users, ChevronRight, Star,
  Instagram, Facebook, Phone, MapPin, Camera, 
  PlayCircle, MessageSquare, ArrowRight 
} from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import { LocationLink } from "@/components/booking/LocationLink";
import { Badge } from "@/components/ui/badge";

export const Index = () => {
  const navigate = useNavigate();
  const [mostrarAgenda, setMostrarAgenda] = useState(false);
  const [duracaoDesejada, setDuracaoDesejada] = useState(60); // Padrão 1h (60 min)

  // Lógica de Blocos Flexíveis (Simulação)
  const slotsBase = [
    { inicio: "08:00", fim30: "08:30", fim60: "09:00", fim90: "09:30", s: "livre" },
    { inicio: "09:30", fim30: "10:00", fim60: "10:30", fim90: "11:00", s: "ocupado" },
    { inicio: "18:00", fim30: "18:30", fim60: "19:00", fim90: "19:30", s: "livre" },
    { inicio: "19:30", fim30: "20:00", fim60: "20:30", fim90: "21:00", s: "livre" },
    { inicio: "21:00", fim30: "21:30", fim60: "22:00", fim90: "22:30", s: "livre" },
  ];

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans selection:bg-[#22c55e]/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img src={heroArena} className="w-full h-full object-cover opacity-30" alt="Background Arena" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-transparent to-[#060a08]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center">
          <div className="mb-8 px-4 py-1.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/5 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300">Horários disponíveis hoje</span>
          </div>

          {/* Logo Ampliada e com Flutuação */}
          <div className="relative mb-6">
            <img 
              src="/logo-arena.png" 
              onError={(e) => { e.currentTarget.src = "/media/logo-arena.png" }}
              alt="Arena Cedro" 
              className="w-[320px] md:w-[550px] h-auto object-contain drop-shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-float"
            />
          </div>
          
          <h1 className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl font-medium tracking-tight italic">
            O melhor campo de futebol society da região.<br/>
            Reserve seu horário e venha jogar!
          </h1>

          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button 
              className="bg-[#22c55e] hover:bg-[#1db053] text-black text-lg py-7 rounded-2xl font-black uppercase italic transition-all active:scale-95 shadow-[0_10px_40px_-10px_rgba(34,197,94,0.5)]"
              onClick={() => navigate("/login")}
            >
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
        <h2 className="text-3xl md:text-5xl font-black mb-4 italic uppercase tracking-tighter text-white">
          POR QUE ESCOLHER A <span className="text-[#22c55e]">ARENA CEDRO?</span>
        </h2>
        <p className="text-gray-500 mb-16 font-medium">Infraestrutura completa para suas partidas.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center">
            <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mb-6"><Calendar className="text-black" /></div>
            <h3 className="text-xl font-bold mb-3 uppercase italic">Agendamento Fácil</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Fale conosco ou use o portal.</p>
            <div className="space-y-4">
              <a href="tel:98999910535" className="text-[#22c55e] font-black text-lg block hover:scale-105 transition-transform tracking-tighter">(98) 99991-0535</a>
              <Button onClick={() => navigate("/login")} size="sm" variant="outline" className="border-white/10 text-[10px] uppercase font-bold px-8">Login / Cadastro</Button>
            </div>
          </div>

          {/* Card 2: Horários Flexíveis (Com a Agenda) */}
          <div className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center">
            <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mb-6"><Clock className="text-black" /></div>
            <h3 className="text-xl font-bold mb-3 uppercase italic">Horários Flexíveis</h3>
            <p className="text-gray-500 text-sm mb-6">Escolha o tempo do seu racha.</p>
            
            <Button 
              onClick={() => setMostrarAgenda(!mostrarAgenda)} 
              variant="outline" 
              className="w-full border-[#22c55e]/30 text-[#22c55e] uppercase text-[10px] font-black italic py-6 mb-4"
            >
              {mostrarAgenda ? "Fechar Agenda" : "Ver Horários Hoje"}
            </Button>

            {mostrarAgenda && (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-center gap-1 bg-black/40 p-1 rounded-xl">
                  {[30, 60, 90].map(m => (
                    <button key={m} onClick={() => setDuracaoDesejada(m)} className={`flex-1 text-[9px] py-2 rounded-lg font-black uppercase ${duracaoDesejada === m ? 'bg-[#22c55e] text-black' : 'text-gray-500'}`}>
                      {m}min
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2">
                  {slotsBase.map((s, i) => (
                    <div key={i} className={`p-3 rounded-xl border text-[11px] font-black flex justify-between items-center ${s.s === 'livre' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-red-500/20 text-red-700 bg-red-500/5 opacity-50'}`}>
                      <span>{s.inicio} - {duracaoDesejada === 30 ? s.fim30 : duracaoDesejada === 60 ? s.fim60 : s.fim90}</span>
                      <span className="uppercase text-[8px]">{s.s === 'livre' ? 'Disponível' : 'Ocupado'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 3 */}
          <div className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center">
            <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mb-6"><Users className="text-black" /></div>
            <h3 className="text-xl font-bold mb-3 uppercase italic">Campo Society</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Gramado sintético profissional.</p>
            <button 
              onClick={() => document.getElementById('estrutura')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-[#22c55e] hover:text-black transition-all"
            >
              <ArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* 3. NOSSA ESTRUTURA (Fotos/Vídeos) */}
      <section id="estrutura" className="py-24 bg-[#0a0f0d] border-y border-white/5">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
        NOSSA <span className="text-[#22c55e]">ESTRUTURA</span>
      </h2>
      <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest font-bold">Imagens reais da nossa arena</p>
    </div>
    
    {/* Grid Inteligente: Colunas variáveis para aceitar fotos verticais e horizontais */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
      
      {/* FOTO 1 - VERTICAL */}
      <div className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5 shadow-2xl">
        <Camera className="absolute top-4 right-4 text-white/50 z-10" size={18} />
        <img src="/media/campo-1.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Arena Vertical 1" />
      </div>

      {/* FOTO 2 - VERTICAL */}
      <div className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5 shadow-2xl">
        <Camera className="absolute top-4 right-4 text-white/50 z-10" size={18} />
        <img src="/media/campo-2.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Arena Vertical 2" />
      </div>

      {/* FOTO 3 - VERTICAL */}
      <div className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5 shadow-2xl">
        <Camera className="absolute top-4 right-4 text-white/50 z-10" size={18} />
        <img src="/media/campo-4.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Arena Vertical 3" />
      </div>

      {/* FOTO 4 - HORIZONTAL (Ocupa 2 colunas no PC para destacar a amplitude do campo) */}
      <div className="col-span-2 aspect-video md:aspect-auto md:h-full bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5 shadow-2xl">
        <Camera className="absolute top-4 right-4 text-white/50 z-10" size={18} />
        <img src="/media/campohorizontal-3.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Vista Panorâmica do Campo" />
        <div className="absolute bottom-6 left-6 z-20">
          <Badge className="bg-[#22c55e] text-black font-black italic">VISTA AMPLA</Badge>
        </div>
      </div>
      {/* VÍDEO 1 - VERTICAL (Estilo Reels/TikTok) */}
      <div className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5 shadow-2xl">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
        <PlayCircle className="absolute inset-0 m-auto text-white/80 z-20 group-hover:scale-110 transition-transform" size={48} />
        <video 
          src="/media/video-1.mp4" 
          className="w-full h-full object-cover"
          muted loop playsInline
          onMouseOver={e => e.currentTarget.play()}
          onMouseOut={e => e.currentTarget.pause()}
        />
      </div>

      {/* VÍDEO 2 - VERTICAL */}
      <div className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5 shadow-2xl">
        <PlayCircle className="absolute inset-0 m-auto text-white/80 z-20 group-hover:scale-110 transition-transform" size={48} />
        <video 
          src="/media/video-2.mp4" 
          className="w-full h-full object-cover"
          muted loop playsInline
          onMouseOver={e => e.currentTarget.play()}
          onMouseOut={e => e.currentTarget.pause()}
        />
      </div>

      {/* VÍDEO 3 - VERTICAL */}
      <div className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5 shadow-2xl">
        <PlayCircle className="absolute inset-0 m-auto text-white/80 z-20 group-hover:scale-110 transition-transform" size={48} />
        <video 
          src="/media/video-3.mp4" 
          className="w-full h-full object-cover"
          muted loop playsInline
          onMouseOver={e => e.currentTarget.play()}
          onMouseOut={e => e.currentTarget.pause()}
        />
      </div>

      {/* VÍDEO 4 - VERTICAL */}
      <div className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5 shadow-2xl">
        <PlayCircle className="absolute inset-0 m-auto text-white/80 z-20 group-hover:scale-110 transition-transform" size={48} />
        <video 
          src="/media/video-4.mp4" 
          className="w-full h-full object-cover"
          muted loop playsInline
          onMouseOver={e => e.currentTarget.play()}
          onMouseOut={e => e.currentTarget.pause()}
        />
      </div>

      {/* VÍDEO 5 - VERTICAL */}
      <div className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5 shadow-2xl">
        <PlayCircle className="absolute inset-0 m-auto text-white/80 z-20 group-hover:scale-110 transition-transform" size={48} />
        <video 
          src="/media/video-5.mp4" 
          className="w-full h-full object-cover"
          muted loop playsInline
          onMouseOver={e => e.currentTarget.play()}
          onMouseOut={e => e.currentTarget.pause()}
        />
      </div>

      {/* VÍDEO 6 - VERTICAL */}
      <div className="aspect-[9/16] bg-white/5 rounded-3xl overflow-hidden relative group border border-white/5 shadow-2xl">
        <PlayCircle className="absolute inset-0 m-auto text-white/80 z-20 group-hover:scale-110 transition-transform" size={48} />
        <video 
          src="/media/video-6.mp4" 
          className="w-full h-full object-cover"
          muted loop playsInline
          onMouseOver={e => e.currentTarget.play()}
          onMouseOut={e => e.currentTarget.pause()}
        />
      </div>

    </div>

    <div className="mt-12 text-center">
      <p className="text-[#22c55e] text-[10px] font-black uppercase italic tracking-[0.2em] animate-pulse">
        Toque nos vídeos para ver a ação em campo
      </p>
    </div>
  </div>
</section>

      {/* 4. DEPOIMENTOS */}
      <section className="py-24 container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-16 italic uppercase text-white leading-none">
          O QUE OS NOSSOS <span className="text-[#22c55e]">CLIENTES</span> DIZEM
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {["Carlos Mendes", "João Silva", "Pedro Santos"].map((n, i) => (
            <div key={i} className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] text-left">
              <div className="flex text-yellow-500 mb-4 gap-1"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
              <p className="text-gray-300 text-sm italic mb-6">"Excelente estrutura e agendamento prático!"</p>
              <p className="font-bold text-gray-500 text-xs uppercase tracking-widest">— {n}</p>
            </div>
          ))}
        </div>
        <Button onClick={() => navigate("/depoimentos")} variant="ghost" className="mt-12 text-gray-500 hover:text-white uppercase font-black text-xs gap-2">
          <MessageSquare size={16} /> Escrever Depoimento
        </Button>
      </section>

      {/* 5. PRONTO PARA JOGAR? */}
      <section className="py-24 container mx-auto px-4 text-center">
        <div className="bg-gradient-to-b from-[#111614] to-transparent border border-white/10 rounded-[3rem] p-12 md:p-20">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-6 text-white">PRONTO PARA <span className="text-[#22c55e]">JOGAR?</span></h2>
          <p className="text-gray-500 mb-10 text-lg font-medium italic">Reserve agora e garanta sua partida!</p>
          <Button onClick={() => navigate("/login")} className="bg-[#22c55e] hover:bg-[#1db053] text-black px-12 py-8 rounded-2xl font-black uppercase italic text-xl shadow-2xl transition-transform hover:scale-105">
            Fazer Reserva <ChevronRight className="ml-1" />
          </Button>
        </div>
      </section>

      {/* 6. FOOTER FINAL */}
      <footer className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#22c55e] rounded-full flex items-center justify-center animate-pulse"><Users size={20} className="text-black" /></div>
            <span className="text-2xl font-black italic uppercase tracking-tighter">Arena Cedro</span>
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
              <a href="http://google.com/maps?q=Arena+Cedro+SJ+Ribamar" target="_blank" className="flex items-center justify-center md:justify-start gap-3 text-gray-300 hover:text-[#22c55e] transition-all text-xs font-bold leading-tight">
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
              <Button variant="link" onClick={() => navigate("/admin/login")} className="text-gray-600 hover:text-white text-[10px] font-black uppercase italic p-0">Administração / Atendentes</Button>
            </div>
          </div>
          <p className="mt-20 text-[9px] text-gray-800 font-bold uppercase italic tracking-widest">© 2026 Arena Cedro. Gramado Sintético de Qualidade.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;