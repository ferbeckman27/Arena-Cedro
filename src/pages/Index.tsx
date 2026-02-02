import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Users, Star, ChevronRight, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <CalendarDays className="w-8 h-8" />,
      title: "Agendamento Fácil",
      description: "Reserve seu horário em segundos pelo nosso sistema online.",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Horários Flexíveis",
      description: "Funcionamos das 8h às 22h, todos os dias da semana.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Campo Society",
      description: "Gramado sintético de alta qualidade para suas partidas.",
    },
  ];

  const testimonials = [
    {
      name: "Carlos Mendes",
      text: "Excelente estrutura! Gramado sintético de qualidade e iluminação perfeita para os jogos noturnos.",
      rating: 5,
    },
    {
      name: "João Silva",
      text: "Melhor arena da região. Agendamento super prático pelo site!",
      rating: 5,
    },
    {
      name: "Pedro Santos",
      text: "Atendimento nota 10 e campo impecável. Recomendo demais!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroArena})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
              <span>Horários disponíveis hoje</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold">
              <span className="text-gradient">Arena Cedro</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              O melhor campo de futebol society da região. Reserve seu horário e venha jogar!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                className="gradient-primary glow-primary text-lg px-8 py-6 rounded-xl"
                onClick={() => navigate("/login")}
              >
                Agendar Agora
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                className="text-lg px-8 py-6 rounded-xl border-2 border-primary bg-background/20 text-white hover:bg-primary hover:text-white transition-all duration-300"
                onClick={() => navigate("/admin/login")}
              >
                Área Admin
              </Button>
            </div>

            {/* Pricing Pills */}
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <div className="glass-card rounded-full px-6 py-3 flex items-center gap-3">
                <span className="text-2xl">☀️</span>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Diurno (8h-17h)</p>
                  <p className="font-bold text-primary">R$ 80/hora</p>
                </div>
              </div>
              <div className="glass-card rounded-full px-6 py-3 flex items-center gap-3">
                <span className="text-2xl">🌙</span>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Noturno (18h-22h)</p>
                  <p className="font-bold text-primary">R$ 120/hora</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground flex justify-center pt-2">
            <div className="w-1 h-2 bg-muted-foreground rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">
              Por que escolher a <span className="text-gradient">Arena Cedro</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Infraestrutura completa para suas partidas de futebol society.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass-card rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center text-primary-foreground">
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">
              O que nossos <span className="text-gradient">clientes</span> dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-foreground/90 italic mb-4">"{testimonial.text}"</p>
                <p className="text-sm font-medium text-muted-foreground">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="glass-card rounded-3xl p-12 max-w-3xl mx-auto">
            <h2 className="font-display text-4xl font-bold mb-4">
              Pronto para jogar?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Reserve agora seu horário e garanta sua partida!
            </p>
            <Button 
              className="gradient-primary glow-primary text-lg px-12 py-6 rounded-xl"
              onClick={() => navigate("/login")}
            >
              Fazer Reserva
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary-foreground" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold">Arena Cedro</h3>
              </div>
              <p className="text-muted-foreground">
                O melhor campo de futebol society da região.
              </p>
            </div>

            <div>
              <h4 className="font-display font-bold mb-4">Contato</h4>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  (98) 99991-0535
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Av. Trindade, 3126, Matinha, SJ de Ribamar-MA
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-display font-bold mb-4">Redes Sociais</h4>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/arenacedrofut7/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 Arena Cedro. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
