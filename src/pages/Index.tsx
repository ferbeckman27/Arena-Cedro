import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, Clock, Users, ChevronRight, 
  Instagram, Facebook, PlayCircle, Camera, Sun, Moon
} from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
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

            <Button className="gradient-primary glow-primary text-lg px-8 py-6 rounded-xl" onClick={() => navigate("/login")}>
              Agendar Agora <ChevronRight className="w-5 h-5 ml-2" />
            </Button>

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
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                {feature.showAction && (
                  <Button variant="outline" className="border-primary text-primary" onClick={() => navigate("/login")}>{feature.actionText}</Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer (Atualizado 2026) */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col items-center gap-6 text-center">
          <div className="flex gap-4">
            <a href="https://www.instagram.com/arenacedrofut7/" target="_blank" className="hover:text-primary transition-colors"><Instagram /></a>
            <a href="#" className="hover:text-primary transition-colors"><Facebook /></a>
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
    </div>
  );
};

export default Index;