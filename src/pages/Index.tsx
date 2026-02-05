import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, Clock, Users, ChevronRight, 
  Instagram, Facebook, Sun, Moon, Phone, MapPin,
  Camera, PlayCircle, Star, LogIn, ShieldCheck, Trophy
} from "lucide-react";

// Importações das imagens (Verifique se os nomes estão corretos na sua pasta assets)
import heroArena from "@/assets/hero-arena.jpg";
import logoArena from "@/assets/logo-arena.png"; 
import { LocationLink } from "@/components/booking/LocationLink"; 

export const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans">
      
      {/* 1. NAVEGAÇÃO SUPERIOR (Login e Admin restaurados) */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logoArena} alt="Logo" className="w-12 h-12 object-contain" />
            <span className="font-black italic text-xl tracking-tighter uppercase">
              Arena <span className="text-[#4ade80]">Cedro</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="text-white hover:text-[#4ade80]" onClick={() => navigate("/login")}>
              <LogIn className="w-4 h-4 mr-2" /> Entrar
            </Button>
            <Button className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold hidden md:flex" onClick={() => navigate("/register")}>
              Cadastrar
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/login")} title="Painel Administrativo">
              <ShieldCheck className="w-5 h-5 text-white/20 hover:text-white" />
            </Button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (O visual robusto da imagem) */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroArena})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-[#060a08]/90 to-transparent" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in space-y-8 max-w-4xl mx-auto flex flex-col items-center">
            
            {/* Tag de Status */}
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 text-sm text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Horários disponíveis hoje
            </div>

            {/* Título com Degradê da Foto */}
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none uppercase italic">
              <span className="bg-gradient-to-r from-[#4ade80] to-[#facc15] bg-clip-text text-transparent">
                Arena Cedro
              </span>
            </h1>

            <div className="space-y-2">
              <p className="text-xl md:text-3xl font-light text-gray-200 italic">O melhor campo de futebol society da região.</p>
              <p className="text-xl md:text-3xl font-black uppercase tracking-widest text-[#22c55e]">Reserve seu horário e venha jogar!</p>
            </div>

            {/* BOTÃO PRINCIPAL DE AGENDAMENTO */}
            <Button 
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-2xl px-16 py-10 rounded-2xl shadow-2xl shadow-green-500/20 hover:scale-105 transition-all w-full max-w-md uppercase font-black"
              onClick={() => navigate("/login")}
            >
              Agendar Agora <ChevronRight className="w-8 h-8 ml-2" />
            </Button>

            {/* Fidelidade */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
              <Trophy className="text-yellow-500 w-8 h-8" />
              <div className="text-left">
                <p className="font-bold text-white uppercase text-xs">Programa de Fidelidade</p>
                <p className="text-sm text-gray-400">A cada 10 partidas, ganhe 1 horário grátis!</p>
              </div>
            </div>

            {/* Preços Turnos */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                <Sun className="text-yellow-500 w-8 h-8" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Diurno</p>
                  <p className="font-bold text-green-400 text-2xl">R$ 80/h</p>
                </div>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                <Moon className="text-blue-400 w-8 h-8" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Noturno</p>
                  <p className="font-bold text-green-400 text-2xl">R$ 120/h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GALERIA (Fotos e Vídeos) */}
      <section className="py-24 bg-[#0a0f0d]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-16 uppercase italic">Nossa Estrutura</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="aspect-video bg-white/5 rounded-3xl flex flex-col items-center justify-center border border-white/10 hover:border-[#4ade80]/50 transition-all cursor-pointer group">
              <Camera className="w-12 h-12 text-gray-600 group-hover:text-[#4ade80] mb-4" />
              <span className="font-bold uppercase text-xs tracking-widest">Fotos do Campo</span>
            </div>
            <div className="aspect-video bg-white/5 rounded-3xl flex flex-col items-center justify-center border border-white/10 hover:border-[#4ade80]/50 transition-all cursor-pointer group">
              <PlayCircle className="w-12 h-12 text-gray-600 group-hover:text-[#4ade80] mb-4" />
              <span className="font-bold uppercase text-xs tracking-widest">Vídeo Promocional</span>
            </div>
            <div className="aspect-video bg-white/5 rounded-3xl flex flex-col items-center justify-center border border-white/10 hover:border-[#4ade80]/50 transition-all cursor-pointer group">
              <Users className="w-12 h-12 text-gray-600 group-hover:text-[#4ade80] mb-4" />
              <span className="font-bold uppercase text-xs tracking-widest">Vestiários / Bar</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMENTÁRIOS */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-16 uppercase">O que dizem os atletas</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
             <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                <div className="flex text-yellow-500 mb-4"><Star className="fill-current w-4" /><Star className="fill-current w-4" /><Star className="fill-current w-4" /><Star className="fill-current w-4" /><Star className="fill-current w-4" /></div>
                <p className="text-gray-300 italic mb-4 text-lg">"Gramado impecável e o sistema de agendamento facilita muito a nossa vida!"</p>
                <p className="font-bold text-[#4ade80] uppercase text-sm">- Ricardo Oliveira</p>
             </div>
             <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                <div className="flex text-yellow-500 mb-4"><Star className="fill-current w-4" /><Star className="fill-current w-4" /><Star className="fill-current w-4" /><Star className="fill-current w-4" /><Star className="fill-current w-4" /></div>
                <p className="text-gray-300 italic mb-4 text-lg">"Melhor arena de Ribamar. O cartão fidelidade é um diferencial gigante."</p>
                <p className="font-bold text-[#4ade80] uppercase text-sm">- Felipe Souza</p>
             </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-16 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-8 mb-8">
            <a href="https://www.instagram.com/arenacedrofut7/" target="_blank" className="hover:text-[#4ade80] transition-colors"><Instagram className="w-8 h-8" /></a>
            <a href="#" className="hover:text-[#4ade80] transition-colors"><Facebook className="w-8 h-8" /></a>
          </div>
          <LocationLink />
          <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em] mt-12">
            © 2026 Arena Cedro | Matinha, São José de Ribamar - MA
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;