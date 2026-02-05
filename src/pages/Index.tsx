import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, Clock, Users, Star, ChevronRight, 
  Phone, MapPin, Instagram, Facebook, MessageSquare, 
  PlayCircle, Camera, Sun, Moon
} from "lucide-react";

// Importações de assets
import heroArena from "@/assets/hero-arena.jpg";
import logoArena from "@/assets/logo-arena.png"; 

// Importações de componentes
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
    },
  ];

  const testimonials = [
    {
      name: "Carlos Mendes",
      text: "Excelente estrutura! Gramado sintético de qualidade e iluminação perfeita.",
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
    <div className="min-h-screen bg-background text-foreground">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroArena})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/40" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in space-y-6 max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Logo Centralizada */}
            <img 
              src={logoArena} 
              alt="Arena Cedro Logo" 
              className="w-32 h-32 md:w-48 md:h-48 object-contain mb-2 animate-float" 
            />

            {/* Nome com Degradê */}
            <h1 className="font-display text-5xl md:text-8xl font-black tracking-tighter italic">
              <span className="bg-gradient-to-r from-[#4ade80] to-[#facc15] bg-clip-text text-transparent">
                Arena Cedro
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">
              O melhor campo de futebol society da região. Reserve seu horário e venha jogar!
            </p>

            <Button 
              className="gradient-primary glow-primary text-xl px-12 py-8 rounded-2xl hover:scale-105 transition-transform font-bold" 
              onClick={() => navigate("/login")}
            >
              Agendar Agora <ChevronRight className="w-6 h-6 ml-2" />
            </Button>

            {/* Preços e Botão de Horários */}
            <div className="flex flex-col items-center gap-6 mt-8">
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl">
                  <Sun className="text-yellow-500 w-6 h-6" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase text-gray-400 font-bold">Diurno (8h-17h)</p>
                    <p className="font-bold text-green-400 text-lg">R$ 80/hora</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl">
                  <Moon className="text-blue-400 w-6 h-6" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase text-gray-400 font-bold">Noturno (18h-22h)</p>
                    <p className="font-bold text-green-400 text-lg">R$ 120/hora</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate("/login")} 
                className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-all rounded-full px-6 py-3 text-sm text-green-400 font-bold shadow-lg"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Horários disponíveis hoje - Clique para ver</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO GALERIA --- */}
      <section className="py-24 bg-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-black mb-12 uppercase italic tracking-tight">Nossa Estrutura</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative rounded-3xl overflow-hidden aspect-video bg-muted flex items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all cursor-pointer">
              <Camera className="w-10 h-10 text-primary/40 group-hover:scale-110 transition-transform" />
              <span className="absolute bottom-4 left-4 text-xs font-bold uppercase tracking-widest">Fotos do Campo</span>
            </div>
            <div className="group relative rounded-3xl overflow-hidden aspect-video bg-muted flex items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all cursor-pointer">
              <PlayCircle className="w-10 h-10 text-primary/40 group-hover:scale-110 transition-transform" />
              <span className="absolute bottom-4 left-4 text-xs font-bold uppercase tracking-widest">Vídeo do Gramado</span>
            </div>
            <div className="group relative rounded-3xl overflow-hidden aspect-video bg-muted flex items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all cursor-pointer">
              <Camera className="w-10 h-10 text-primary/40 group-hover:scale-110 transition-transform" />
              <span className="absolute bottom-4 left-4 text-xs font-bold uppercase tracking-widest">Vestiários e Bar</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- DEPOIMENTOS --- */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-black mb-16 uppercase italic">O que os atletas dizem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card p-8 rounded-3xl border border-white/5 hover:border-primary/30 transition-all shadow-xl">
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, index) => <Star key={index} className="w-4 h-4 fill-primary text-primary" />)}
                </div>
                <p className="italic text-gray-300 mb-6 text-lg">"{t.text}"</p>
                <p className="font-black text-sm text-primary uppercase tracking-tighter">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-card rounded-3xl p-8 text-center hover:border-primary/50 transition-all shadow-lg">
                <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center text-primary-foreground shadow-lg">{feature.icon}</div>
                <h3 className="font-display text-xl font-bold mb-3 uppercase tracking-tighter">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 font-medium">{feature.description}</p>
                {feature.showAction && (
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-bold" onClick={() => navigate("/login")}>{feature.actionText}</Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-16 border-t border-border bg-black/20">
        <div className="container mx-auto px-4 flex flex-col items-center gap-8 text-center">
          <div className="flex gap-6">
            <a href="https://www.instagram.com/arenacedrofut7/" target="_blank" className="text-gray-400 hover:text-primary transition-all scale-125"><Instagram /></a>
            <a href="#" className="text-gray-400 hover:text-primary transition-all scale-125"><Facebook /></a>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-black uppercase italic tracking-widest text-primary">Localização</h4>
            <LocationLink />
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
              <Phone className="w-4 h-4 text-primary" /> (98) 99991-0535
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button variant="link" className="text-muted-foreground hover:text-primary text-xs uppercase tracking-widest" onClick={() => navigate("/admin/login")}>
              Acesso Administrativo
            </Button>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
              © 2026 Arena Cedro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;