import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, Clock, Users, ChevronRight, 
  Instagram, Facebook, Sun, Moon, Phone, MapPin
} from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import logoArena from "@/assets/logo-arena.png"; 
import { LocationLink } from "@/components/booking/LocationLink"; 

export const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <CalendarDays className="w-8 h-8" />,
      title: "Agendamento Fácil",
      description: "Reserve seu horário em segundos pelo nosso sistema online.",
      cta: (
        <Button 
          size="sm"
          className="mt-3 gradient-primary"
          onClick={() => navigate("/login")}
        >
          Agendar Agora
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      ),
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Horários Flexíveis",
      description: "Funcionamos das 8h às 22h, todos os dias. Agendamentos de 30 min a 2 horas.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Campo Society",
      description: "Gramado sintético de alta qualidade para suas partidas.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroArena})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in space-y-6 max-w-3xl mx-auto flex flex-col items-center">
            <button 
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 text-sm hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Ver horários disponíveis - Clique aqui</span>
            </button>

            <img 
              src={logoArena} 
              alt="Arena Cedro Logo" 
              className="w-32 h-32 md:w-48 md:h-48 object-contain mb-2 animate-float" 
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                className="gradient-primary glow-primary text-lg px-8 py-6 rounded-xl"
                onClick={() => navigate("/login")}
              >
                Agendar Agora
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="flex flex-col items-center gap-6 mt-8">
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
                  <Sun className="text-yellow-500 w-6 h-6" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Diurno (8h-17h)</p>
                    <p className="font-bold text-green-400">R$ 80/hora</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm border border-white/10 p-4 rounded-2xl">
                  <Moon className="text-blue-400 w-6 h-6" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">Noturno (18h-22h)</p>
                    <p className="font-bold text-green-400">R$ 120/hora</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-card rounded-2xl p-8 text-center hover:border-primary/50 transition-all">
                <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center text-primary-foreground">{feature.icon}</div>
                <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                {feature.cta}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display text-xl font-bold mb-4">Arena Cedro</h3>
              <p className="text-muted-foreground">O melhor campo de futebol society da região.</p>
            </div>

            <div>
              <h4 className="font-display font-bold mb-4">Contato</h4>
              <div className="space-y-2 text-muted-foreground">
                <a href="tel:+5598999910535" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="w-4 h-4" /> (98) 99991-0535
                </a>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Av. Trindade, 3126, Matinha, SJ de Ribamar-MA
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-display font-bold mb-4">Redes Sociais</h4>
              <div className="flex gap-4 mb-6">
                <a href="https://www.instagram.com/arenacedrofut7/" target="_blank" rel="noreferrer" className="hover:text-primary"><Instagram /></a>
                <a href="#" className="hover:text-primary"><Facebook /></a>
              </div>
              <Button variant="link" className="p-0 text-xs text-muted-foreground" onClick={() => navigate("/admin/login")}>
                Área Administrativa
              </Button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border flex flex-col items-center gap-4">
            <LocationLink />
            <p className="text-xs text-muted-foreground">© 2026 Arena Cedro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;