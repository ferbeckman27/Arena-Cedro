import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, Clock, Users, ChevronRight, 
  Instagram, Facebook, PlayCircle, Camera, Sun, Moon
} from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
<<<<<<< HEAD
import logoArena from "@/assets/logo-arena.png"; 
import { LocationLink } from "@/components/booking/LocationLink"; 

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <CalendarDays className="w-8 h-8" />,
      title: "Agendamento Fácil",
      description: "Reserve seu horário em segundos. Dúvidas? Ligue: (98) 99991-0535",
      showAction: true,
      actionText: "Agendar Agora"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Horários Flexíveis",
      description: "Agende blocos de 30min ou 1h30 conforme sua necessidade.",
      showAction: true,
      actionText: "Ver Agenda"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Campo Society",
      description: "Gramado sintético profissional. Confira as imagens reais abaixo.",
      showAction: false
=======
import { TodayScheduleModal } from "@/components/home/TodayScheduleModal";
import { TestimonialForm } from "@/components/home/TestimonialForm";
import { GallerySection } from "@/components/home/GallerySection";

const Index = () => {
  const navigate = useNavigate();
  const [isTodayScheduleOpen, setIsTodayScheduleOpen] = useState(false);
  const [testimonials, setTestimonials] = useState([
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
>>>>>>> 7a057f196b89602815a1222cd7f11df58fb94e4c
    },
  ]);

  const features = [
    {
      icon: <CalendarDays className="w-8 h-8" />,
      title: "Agendamento Fácil",
      description: (
        <>
          Reserve seu horário em segundos pelo nosso sistema online.
          <br />
          <a href="tel:+5598999910535" className="text-primary hover:underline font-medium">
            📞 (98) 99991-0535
          </a>
        </>
      ),
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

  const handleNewTestimonial = (data: { name: string; text: string; rating: number }) => {
    setTestimonials(prev => [data, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroArena})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
<<<<<<< HEAD
          <div className="animate-fade-in space-y-6 max-w-3xl mx-auto flex flex-col items-center">
=======
          <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
            <button 
              onClick={() => setIsTodayScheduleOpen(true)}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 text-sm hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
              <span>Horários disponíveis hoje - Clique para ver</span>
            </button>
>>>>>>> 7a057f196b89602815a1222cd7f11df58fb94e4c
            
            {/* 1. LOGO ADICIONADA ACIMA DO NOME */}
            <img 
              src={logoArena} 
              alt="Arena Cedro Logo" 
              className="w-32 h-32 md:w-48 md:h-48 object-contain mb-2 animate-float" 
            />

            <h1 className="font-display text-5xl md:text-7xl font-bold">
              <span className="text-gradient">Arena Cedro</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              O melhor campo de futebol society da região. Reserve seu horário e venha jogar!
            </p>

<<<<<<< HEAD
            <Button className="gradient-primary glow-primary text-lg px-8 py-6 rounded-xl" onClick={() => navigate("/login")}>
              Agendar Agora <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
=======
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                className="gradient-primary glow-primary text-lg px-8 py-6 rounded-xl"
                onClick={() => navigate("/login")}
              >
                Agendar Agora
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
>>>>>>> 7a057f196b89602815a1222cd7f11df58fb94e4c

            {/* 2. VALORES DOS TURNOS E BOTÃO DE HORÁRIOS ABAIXO */}
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

              {/* BOTÃO "HORÁRIOS DISPONÍVEIS HOJE" ABAIXO DOS VALORES */}
              <button 
                onClick={() => navigate("/login")} 
                className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-all rounded-full px-6 py-2.5 text-sm text-green-400 font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Horários disponíveis hoje - Clique para ver</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO GALERIA (Conforme nota na Foto 2) */}
      <section className="py-24 bg-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-bold mb-12">Estrutura Real</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group relative rounded-2xl overflow-hidden aspect-video bg-muted flex items-center justify-center border-2 border-dashed border-primary/30">
              <Camera className="w-10 h-10 text-primary/40 group-hover:scale-110 transition-transform" />
              <span className="absolute bottom-4 left-4 text-sm font-medium">Fotos do Campo</span>
            </div>
            <div className="group relative rounded-2xl overflow-hidden aspect-video bg-muted flex items-center justify-center border-2 border-dashed border-primary/30">
              <PlayCircle className="w-10 h-10 text-primary/40 group-hover:scale-110 transition-transform" />
              <span className="absolute bottom-4 left-4 text-sm font-medium">Vídeo do Gramado</span>
            </div>
            <div className="group relative rounded-2xl overflow-hidden aspect-video bg-muted flex items-center justify-center border-2 border-dashed border-primary/30">
              <Camera className="w-10 h-10 text-primary/40 group-hover:scale-110 transition-transform" />
              <span className="absolute bottom-4 left-4 text-sm font-medium">Vestiários e Bar</span>
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
<<<<<<< HEAD
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                {feature.showAction && (
                  <Button variant="outline" className="border-primary text-primary" onClick={() => navigate("/login")}>{feature.actionText}</Button>
                )}
=======
                <p className="text-muted-foreground">{feature.description}</p>
                {feature.cta}
>>>>>>> 7a057f196b89602815a1222cd7f11df58fb94e4c
              </div>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* Footer (Atualizado 2026) */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col items-center gap-6 text-center">
          <div className="flex gap-4">
            <a href="https://www.instagram.com/arenacedrofut7/" target="_blank" className="hover:text-primary transition-colors"><Instagram /></a>
            <a href="#" className="hover:text-primary transition-colors"><Facebook /></a>
=======
      {/* Gallery Section */}
      <GallerySection />

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">
              O que nossos <span className="text-gradient">clientes</span> dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 6).map((testimonial, index) => (
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

          {/* Testimonial Form */}
          <div className="mt-12 max-w-md mx-auto">
            <TestimonialForm onSubmit={handleNewTestimonial} />
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
                <a href="tel:+5598999910535" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="w-4 h-4" />
                  (98) 99991-0535
                </a>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Av. Trindade, 3126, Matinha, SJ de Ribamar-MA
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-display font-bold mb-4">Redes Sociais</h4>
              <div className="flex gap-4 mb-6">
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
              
              {/* Admin Link - moved to footer */}
              <Button 
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/admin/login")}
              >
                Área Administrativa
              </Button>
            </div>
>>>>>>> 7a057f196b89602815a1222cd7f11df58fb94e4c
          </div>
          <div>
            <h4 className="font-bold mb-2">Localização</h4>
            <LocationLink />
          </div>
          <Button variant="link" className="text-muted-foreground hover:text-primary text-xs" onClick={() => navigate("/admin/login")}>
            Acesso Restrito: Área Administrativa / Atendentes
          </Button>
          <p className="text-xs text-muted-foreground">© 2026 Arena Cedro. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Today Schedule Modal */}
      <TodayScheduleModal 
        isOpen={isTodayScheduleOpen}
        onClose={() => setIsTodayScheduleOpen(false)}
        onLoginClick={() => navigate("/login")}
      />
    </div>
  );
};

export default Index;