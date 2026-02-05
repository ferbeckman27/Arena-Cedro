import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, Clock, Users, ChevronRight, 
  Instagram, Facebook, Sun, Moon, Phone, MapPin,
  Camera, PlayCircle, Star, LogIn, ShieldCheck, Trophy
} from "lucide-react";

// Certifique-se de que estas imagens estão na pasta src/assets/ ou na pasta public/
import heroArena from "@/assets/hero-arena.jpg";
import logoArena from "@/assets/logo-arena.png"; 
import { LocationLink } from "@/components/booking/LocationLink"; 

export const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      
      {/* 1. BARRA DE NAVEGAÇÃO (Login e Admin) */}
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logoArena} alt="Logo Arena" className="w-12 h-12 object-contain" />
            <span className="font-black italic text-xl tracking-tighter uppercase text-white">
              Arena <span className="text-primary">Cedro</span>
            </span>
          </div>
          
          <div className="flex gap-2 md:gap-4">
            <Button variant="ghost" className="text-white hover:text-primary" onClick={() => navigate("/login")}>
              <LogIn className="w-4 h-4 mr-2" /> Entrar
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-black font-bold hidden md:flex" onClick={() => navigate("/register")}>
              Cadastrar
            </Button>
            <Button variant="ghost" size="icon" title="Painel Admin" onClick={() => navigate("/admin/login")}>
              <ShieldCheck className="w-5 h-5 text-white/30" />
            </Button>
          </div>
        </div>
      </nav>

      {/* 2. SEÇÃO PRINCIPAL (Visual Robusto e Chamada para Ação) */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroArena})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/20" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in space-y-8 max-w-4xl mx-auto flex flex-col items-center">
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none uppercase italic">
              <span className="bg-gradient-to-r from-[#4ade80] to-[#facc15] bg-clip-text text-transparent">
                Arena Cedro
              </span>
            </h1>

            <div className="space-y-2">
              <p className="text-xl md:text-3xl font-light text-gray-200">O melhor campo de futebol society da região.</p>
              <p className="text-xl md:text-3xl font-bold uppercase tracking-widest text-primary">Reserve seu horário e venha jogar!</p>
            </div>

            <Button 
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xl px-12 py-8 rounded-2xl shadow-xl shadow-green-500/20 hover:scale-105 transition-all w-full max-w-md"
              onClick={() => navigate("/login")}
            >
              AGENDAR AGORA <ChevronRight className="w-6 h-6 ml-2" />
            </Button>

            {/* 3. PROGRAMA DE FIDELIDADE */}
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-4">
              <Trophy className="text-yellow-500 w-8 h-8" />
              <div className="text-left text-sm text-gray-300">
                <p className="font-bold text-white uppercase">Cartão Fidelidade</p>
                <p>A cada 10 partidas, a próxima é por nossa conta!</p>
              </div>
            </div>

            {/* 4. TABELA DE PREÇOS */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                <Sun className="text-yellow-500" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Diurno (08h - 17h)</p>
                  <p className="font-bold text-green-400 text-xl">R$ 80,00/h</p>
                </div>
              </div>
              <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                <Moon className="text-blue-400" />
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Noturno (18h - 22h)</p>
                  <p className="font-bold text-green-400 text-xl">R$ 120,00/h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER COM REDES SOCIAIS E LOCALIZAÇÃO */}
      <footer className="py-12 border-t border-white/5 bg-black/40 text-center">
        <div className="container mx-auto px-4 flex flex-col items-center gap-6">
          <div className="flex gap-8">
             <a href="https://www.instagram.com/arenacedrofut7/" target="_blank" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="w-8 h-8" />
             </a>
             <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="w-8 h-8" />
             </a>
          </div>
          <LocationLink />
          <div className="text-gray-500 text-sm">
            <p>Rua 02, Qd 04, Matinha (SJR) - São Luís, MA</p>
            <p className="mt-2 opacity-50 uppercase tracking-tighter">© 2026 Arena Cedro - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;