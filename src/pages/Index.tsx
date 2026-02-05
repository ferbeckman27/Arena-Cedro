import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, Clock, Users, ChevronRight, 
  Instagram, Facebook, Sun, Moon, Phone, MapPin,
  Camera, PlayCircle, Star
} from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import logoArena from "@/assets/logo-arena.png"; 
import { LocationLink } from "@/components/booking/LocationLink"; 

export const Index = () => {
  const navigate = useNavigate();

  // Dados dos depoimentos (Comentários)
  const [testimonials] = useState([
    { name: "Ricardo Oliveira", text: "Melhor gramado society que já joguei em Ribamar!", rating: 5 },
    { name: "Felipe Souza", text: "Estrutura nota 10 e o atendimento é excelente.", rating: 5 },
    { name: "André Santos", text: "Ambiente familiar e muito organizado. Recomendo!", rating: 5 },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section - DESIGN ATUALIZADO CONFORME A IMAGEM */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroArena})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/20" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in space-y-8 max-w-4xl mx-auto flex flex-col items-center">
            
            {/* Status de Horários */}
            <button 
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-6 py-2 text-sm text-green-400 hover:bg-green-500/20 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Horários disponíveis hoje</span>
            </button>

            {/* Nome da Arena com Fonte Grossa e Degradê da Imagem */}
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none">
                <span className="bg-gradient-to-r from-[#4ade80] to-[#facc15] bg-clip-text text-transparent italic">
                  Arena Cedro
                </span>
              </h1>
              
              {/* Frases de Efeito da Imagem */}
              <div className="space-y-2">
                <p className="text-xl md:text-3xl font-light tracking-wide text-gray-200">
                  O melhor campo de futebol society da região.
                </p>
                <p className="text-xl md:text-3xl font-light tracking-wide text-gray-200">
                  Reserve seu horário e venha jogar!
                </p>
              </div>
            </div>

            {/* Botão Agendar Agora */}
            <Button 
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-2xl px-16 py-8 rounded-2xl shadow-lg shadow-green-500/20 hover:scale-105 transition-all"
              onClick={() => navigate("/login")}
            >
              Agendar Agora <ChevronRight className="w-6 h-6 ml-2" />
            </Button>

            {/* Preços por Turno */}
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                <Sun className="text-yellow-500 w-6 h-6" />
                <div className="text-left">
                  <p className="text-xs uppercase text-gray-400">Diurno (8h-17h)</p>
                  <p className="font-bold text-2xl text-green-400">R$ 80/hora</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                <Moon className="text-blue-400 w-6 h-6" />
                <div className="text-left">
                  <p className="text-xs uppercase text-gray-400">Noturno (18h-22h)</p>
                  <p className="font-bold text-2xl text-green-400">R$ 120/hora</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galeria de Fotos e Vídeos */}
      <section className="py-24 bg-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold mb-12">Estrutura Profissional</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative rounded-2xl overflow-hidden aspect-video bg-muted flex items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all cursor-pointer">
              <Camera className="w-10 h-10 text-primary/40 group-hover:scale-110 transition-transform" />
              <span className="absolute bottom-4 left-4 text-sm font-medium">Fotos do Campo</span>
            </div>
            <div className="group relative rounded-2xl overflow-hidden aspect-video bg-muted flex items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all cursor-pointer">
              <PlayCircle className="w-10 h-10 text-primary/40 group-hover:scale-110 transition-transform" />
              <span className="absolute bottom-4 left-4 text-sm font-medium">Vídeo do Gramado</span>
            </div>
            <div className="group relative rounded-2xl overflow-hidden aspect-video bg-muted flex items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all cursor-pointer">
              <Camera className="w-10 h-10 text-primary/40 group-hover:scale-110 transition-transform" />
              <span className="absolute bottom-4 left-4 text-sm font-medium">Vestiários e Bar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comentários dos Atletas */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold mb-16">O que os atletas dizem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-all">
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, index) => <Star key={index} className="w-4 h-4 fill-primary text-primary" />)}
                </div>
                <p className="italic text-gray-300 mb-6">"{t.text}"</p>
                <p className="font-bold text-sm text-primary">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-4 flex flex-col items-center gap-6">
          <div className="flex gap-6">
             <a href="https://www.instagram.com/arenacedrofut7/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors"><Instagram /></a>
             <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Facebook /></a>
          </div>
          <div className="text-center space-y-2">
            <p className="flex items-center justify-center gap-2 text-sm text-gray-400"><Phone className="w-4 h-4" /> (98) 99991-0535</p>
            <LocationLink />
          </div>
          <p className="text-xs text-gray-600">© 2026 Arena Cedro. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;