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

  // Simulação da agenda para visualização rápida
  const horariosSimulados = [
    { h: "08:00", s: "livre" }, { h: "09:00", s: "ocupado" },
    { h: "18:00", s: "livre" }, { h: "19:00", s: "livre" },
    { h: "20:00", s: "ocupado" }, { h: "21:00", s: "livre" },
  ];

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans selection:bg-[#22c55e]/30">
      
      {/* 1. HERO SECTION (Baseado na Foto Editada) */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img src={heroArena} className="w-full h-full object-cover opacity-30" alt="Background Arena" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-transparent to-[#060a08]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center">
          {/* Badge de Horários */}
          <div className="mb-8 px-4 py-1.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/5 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300">Horários disponíveis hoje</span>
          </div>

          {/* Logo Centralizada */}
          <img 
      src="/logo-arena.png" // Se estiver na raiz da pasta public
      onError={(e) => { e.currentTarget.src = "/media/logo-arena.png" }} // Tenta o caminho alternativo se o primeiro der erro
      alt="Arena Cedro" 
      className="w-64 md:w-80 h-auto mb-6 object-contain brightness-110 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
    />
          
          <h1 className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl font-medium tracking-tight">
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

            {/* Preços Diurno/Noturno da Foto */}
            <div className="flex justify-center gap-4 mt-4">
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3">
                <span className="text-xl">☀️</span>
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Diurno (8h-17h)</p>
                  <p className="text-[#22c55e] font-black">R$ 80/hora</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3">
                <span className="text-xl">🌙</span>
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Noturno (18h-22h)</p>
                  <p className="text-[#22c55e] font-black">R$ 120/hora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POR QUE ESCOLHER (Cards da Foto) */}
      <section className="py-24 container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-4 italic uppercase tracking-tighter text-white">
          POR QUE ESCOLHER A <span className="text-[#22c55e]">ARENA CEDRO?</span>
        </h2>
        <p className="text-gray-500 text-center mb-16 font-medium">Infraestrutura completa para suas partidas de futebol society.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Agendamento Fácil */}
          <div className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] text-center hover:border-[#22c55e]/20 transition-all">
            <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#22c55e]/20">
              <Calendar className="text-black w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tighter italic">Agendamento Fácil</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Reserve seu horário em segundos pelo nosso sistema online.</p>
            <div className="space-y-3">
              <a href="tel:98999910535" className="text-[#22c55e] font-black text-sm block">(98) 99991-0535</a>
              <Button onClick={() => navigate("/login")} size="sm" variant="outline" className="border-white/10 text-[10px] uppercase font-bold py-4">Login / Cadastro</Button>
            </div>
          </div>

          {/* Card 2: Horários Flexíveis */}
          <div className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] text-center hover:border-[#22c55e]/20 transition-all">
            <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="text-black w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tighter italic">Horários Flexíveis</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Funcionamos das 8h às 22h, todos os dias da semana.</p>
            <Button 
              onClick={() => setMostrarAgenda(!mostrarAgenda)} 
              variant="outline" 
              className="w-full border-[#22c55e]/30 text-[#22c55e] uppercase text-[10px] font-black italic"
            >
              {mostrarAgenda ? "Ocultar Agenda" : "Ver Agenda de Hoje"}
            </Button>
            {mostrarAgenda && (
              <div className="grid grid-cols-2 gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                {horariosSimulados.map((h, i) => (
                  <div key={i} className={`p-2 rounded-lg border text-[10px] font-bold ${h.s === 'livre' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'}`}>
                    {h.h}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Campo Society */}
          <div className="bg-[#111614] border border-white/5 p-8 rounded-[2rem] text-center hover:border-[#22c55e]/20 transition-all flex flex-col items-center">
            <div className="w-16 h-16 bg-[#22c55e] rounded-2xl flex items-center justify-center mb-6">
              <Users className="text-black w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-tighter italic">Campo Society</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Gramado sintético de alta qualidade para suas partidas.</p>
            <button 
              onClick={() => document.getElementById('estrutura')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-[#22c55e] hover:text-black transition-all group"
            >
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
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

      {/* 4. DEPOIMENTOS (Conforme a Foto) */}
      <section className="py-24 container mx-auto px-4">
  <h2 className="text-3xl md:text-5xl font-black text-center mb-16 italic uppercase leading-none text-white">
    O QUE OS NOSSOS <span className="text-[#22c55e]">CLIENTES</span> DIZEM
  </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { n: "Carlos Mendes", t: "Excelente estrutura! Gramado sintético de qualidade e iluminação perfeita para os jogos noturnos." },
            { n: "João Silva", t: "Melhor arena da região. Agendamento super prático pelo site!" },
            { n: "Pedro Santos", t: "Atendimento nota 10 e campo impecável. Recomendo demais!" }
          ].map((d, i) => (
            <div key={i} className="bg-[#111614] border border-white/5 p-8 rounded-[2rem]">
              <div className="flex text-yellow-500 mb-4 gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-gray-300 text-sm italic mb-6 leading-relaxed">"{d.t}"</p>
              <p className="font-bold text-gray-500 text-xs uppercase tracking-widest">— {d.n}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            onClick={() => navigate("/depoimentos")}
            variant="ghost" 
            className="text-gray-500 hover:text-white gap-2 uppercase font-black text-xs"
          >
            <MessageSquare size={16} /> Escrever Depoimento
          </Button>
        </div>
      </section>

      {/* 5. PRONTO PARA JOGAR? (Call to Action da Foto) */}
      <section className="py-24 container mx-auto px-4">
  <div className="bg-gradient-to-b from-[#111614] to-transparent border border-white/10 rounded-[3rem] p-12 md:p-20 text-center max-w-4xl mx-auto">
    <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-6 text-white">
      PRONTO PARA <span className="text-[#22c55e]">JOGAR?</span>
    </h2>
    <p className="text-gray-500 mb-10 text-lg font-medium italic">Reserve agora seu horário e garanta sua partida!</p>
    
    <Button 
      onClick={() => navigate("/login")}
      className="bg-[#22c55e] hover:bg-[#1db053] text-black px-12 py-8 rounded-2xl font-black uppercase italic text-xl shadow-2xl shadow-[#22c55e]/20 transition-transform hover:scale-105"
    >
      Fazer Reserva <ChevronRight className="ml-1" />
    </Button>
  </div>
</section>

      {/* 6. FOOTER FINAL (Links e Contatos) */}
      <footer className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          
          {/* Logo Footer */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#22c55e] rounded-full flex items-center justify-center">
              <Users size={16} className="text-black" />
            </div>
            <span className="text-xl font-black italic uppercase">Arena Cedro</span>
          </div>
          <p className="text-gray-600 text-sm max-w-xs mb-12">O melhor campo de futebol society da região.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 w-full max-w-5xl border-t border-white/5 pt-12">
            
            {/* Contato */}
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-500">Contato</h4>
              <a href="tel:98999910535" className="flex items-center justify-center gap-3 text-gray-300 hover:text-[#22c55e] transition-colors group">
                <Phone size={18} className="text-[#22c55e]" /> 
                <span className="font-black">(98) 99991-0535</span>
              </a>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-500">Localização</h4>
              <a href="https://maps.google.com" target="_blank" className="flex items-center justify-center gap-3 text-gray-300 hover:text-[#22c55e] transition-colors px-4">
                <MapPin size={18} className="text-[#22c55e] shrink-0" />
                <span className="text-xs font-bold leading-tight">Av. Trindade, 3126, Matinha, SJ de Ribamar-MA</span>
              </a>
            </div>

            {/* Redes Sociais */}
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-500">Redes Sociais</h4>
              <div className="flex justify-center gap-4">
                <a href="https://www.instagram.com/arenacedrofut7/" className="p-4 bg-white/5 rounded-2xl hover:bg-[#22c55e] hover:text-black transition-all">
                  <Instagram size={20} />
                </a>
                <a href="#" className="p-4 bg-white/5 rounded-2xl hover:bg-[#22c55e] hover:text-black transition-all">
                  <Facebook size={20} />
                </a>
              </div>
            </div>

            {/* Admin */}
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-500">Acesso</h4>
              <Button 
                variant="link" 
                onClick={() => navigate("/admin/login")}
                className="text-gray-600 hover:text-white text-[10px] font-black uppercase italic"
              >
                Acesso Administrativo
              </Button>
            </div>
          </div>

          <p className="mt-20 text-[10px] text-gray-800 font-bold uppercase tracking-widest italic">
            © 2026 Arena Cedro. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;