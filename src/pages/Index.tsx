import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, Clock, Users, ChevronRight, Star,
  Instagram, Facebook, Phone, MapPin, Camera, PlayCircle, MessageSquare
} from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import logoArena from "@/assets/logo-arena.png"; 
import { LocationLink } from "@/components/booking/LocationLink";

export const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060a08] text-white font-sans">
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroArena} className="w-full h-full object-cover opacity-40" alt="Arena Cedro" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-transparent to-[#060a08]/70" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center">
          {/* LOGO NO LUGAR DO NOME */}
          <img src="/logo-arena.png" alt="Arena Cedro" className="w-48 h-48 md:w-64 md:h-64 object-contain mb-6 animate-float" />
          
          <h1 className="hidden">Arena Cedro</h1> {/* SEO apenas */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl uppercase tracking-widest font-bold italic">
            O melhor gramado society da região
          </p>

          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button 
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xl py-8 rounded-2xl shadow-xl font-black uppercase italic"
              onClick={() => navigate("/login")}
            >
              Agendar Agora <ChevronRight className="ml-2" />
            </Button>

            {/* HORÁRIOS DISPONÍVEIS HOJE */}
            <button 
              onClick={() => navigate("/login")}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
            >
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-bold uppercase text-sm tracking-tighter">Ver Horários Livres Hoje</span>
            </button>
          </div>
        </div>
      </section>

      {/* HORÁRIOS FLEXÍVEIS (Explicação do Sistema de 30min a 1h30) */}
      <section className="py-20 border-y border-white/5">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center text-left">
          <div className="space-y-6">
            <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center text-primary">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black uppercase italic">Horários Flexíveis</h2>
            <p className="text-gray-400 leading-relaxed">
              Aqui você decide o tempo do seu racha! Reserve blocos clicáveis de <span className="text-white font-bold">30min, 1h ou até 1h30</span>. 
              Visualize nossa agenda em tempo real: <span className="text-green-500 font-bold">Verde para Livre</span> e <span className="text-red-500 font-bold">Vermelho para Reservado</span>.
            </p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black" onClick={() => navigate("/login")}>
              Ver Agenda Interativa
            </Button>
          </div>
          <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
             {/* Exemplo visual da agenda */}
             <div className="grid grid-cols-2 gap-2 opacity-50 select-none">
                <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-lg text-xs text-center">08:00 - 08:30</div>
                <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg text-xs text-center">08:30 - 09:30</div>
                <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-lg text-xs text-center">09:30 - 11:00</div>
             </div>
          </div>
        </div>
      </section>

      {/* NOSSA ESTRUTURA (Fotos e Vídeos) */}
      <section className="py-24 bg-[#0a0f0d]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-4xl font-black uppercase italic">Nossa Estrutura</h2>
            <p className="text-gray-400 mt-2">Gramado sintético profissional. Confira as imagens reais abaixo.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative aspect-video bg-muted rounded-3xl overflow-hidden border border-white/10">
              <Camera className="absolute inset-0 m-auto w-12 h-12 text-white/20 group-hover:scale-110 transition-transform" />
              <img src="/src/assets/media/campo-1.jpg" className="w-full h-full object-cover opacity-60" alt="Campo" />
            </div>
            <div className="group relative aspect-video bg-muted rounded-3xl overflow-hidden border border-white/10">
              <Camera className="absolute inset-0 m-auto w-12 h-12 text-white/20 group-hover:scale-110 transition-transform" />
              <img src="/src/assets/media/campo-2.jpg" className="w-full h-full object-cover opacity-60" alt="Campo" />
            </div>
            <div className="group relative aspect-video bg-muted rounded-3xl overflow-hidden border border-white/10">
              <Camera className="absolute inset-0 m-auto w-12 h-12 text-white/20 group-hover:scale-110 transition-transform" />
              <img src="/src/assets/media/campo-3.jpg" className="w-full h-full object-cover opacity-60" alt="Campo" />
            </div>
            <div className="group relative aspect-video bg-muted rounded-3xl overflow-hidden border border-white/10">
              <PlayCircle className="absolute inset-0 m-auto w-12 h-12 text-white/20 group-hover:scale-110 transition-transform" />
              <video src="/src/assets/media/video-1.mp4" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="group relative aspect-video bg-muted rounded-3xl overflow-hidden border border-white/10">
              <PlayCircle className="absolute inset-0 m-auto w-12 h-12 text-white/20 group-hover:scale-110 transition-transform" />
              <video src="/src/assets/media/video-2.mp4" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="group relative aspect-video bg-muted rounded-3xl overflow-hidden border border-white/10">
              <PlayCircle className="absolute inset-0 m-auto w-12 h-12 text-white/20 group-hover:scale-110 transition-transform" />
              <video src="/src/assets/media/video-3.mp4" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="group relative aspect-video bg-muted rounded-3xl overflow-hidden border border-white/10">
              <PlayCircle className="absolute inset-0 m-auto w-12 h-12 text-white/20 group-hover:scale-110 transition-transform" />
              <video src="/src/assets/media/video-4.mp4" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="group relative aspect-video bg-muted rounded-3xl overflow-hidden border border-white/10">
              <PlayCircle className="absolute inset-0 m-auto w-12 h-12 text-white/20 group-hover:scale-110 transition-transform" />
              <video src="/src/assets/media/video-5.mp4" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="group relative aspect-video bg-muted rounded-3xl overflow-hidden border border-white/10">
              <PlayCircle className="absolute inset-0 m-auto w-12 h-12 text-white/20 group-hover:scale-110 transition-transform" />
              <video src="/src/assets/media/video-6.mp4" className="w-full h-full object-cover opacity-60" />
            </div>
            <div className="group relative aspect-video bg-muted rounded-3xl overflow-hidden border border-white/10">
              <Camera className="absolute inset-0 m-auto w-12 h-12 text-white/20 group-hover:scale-110 transition-transform" />
              <img src="/src/assets/media/campo-4.jpg" className="w-full h-full object-cover opacity-60" alt="Vestiário" />
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-black uppercase italic mb-12">O que nossos clientes dizem</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-left">
              <div className="flex text-yellow-500 mb-4"><Star className="fill-current w-4" /><Star className="fill-current w-4" /><Star className="fill-current w-4" /><Star className="fill-current w-4" /><Star className="fill-current w-4" /></div>
              <p className="italic text-gray-300 mb-4">"Melhor arena de Ribamar. O sistema de agendar pelo site é muito fácil."</p>
              <p className="font-bold text-primary">— Ricardo Oliveira</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full px-8 py-6 border-white/20 text-white hover:bg-white/10 gap-2"
            onClick={() => navigate("/depoimentos")}
          >
            <MessageSquare className="w-5 h-5" /> Escrever meu Depoimento
          </Button>
        </div>
      </section>

      {/* FOOTER (MAPS, CONTATO E ADMIN) */}
      <footer className="py-20 bg-black/80 border-t border-white/5">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12 text-center md:text-left">
          
          <div className="space-y-4">
            <h4 className="font-black uppercase tracking-widest text-primary">Contato</h4>
            <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400 font-bold">
              <Phone className="w-5 h-5 text-primary" /> (98) 99991-0535
            </div>
            <div className="flex gap-4 justify-center md:justify-start">
              <a href="https://www.instagram.com/arenacedrofut7/" target="_blank" className="text-gray-400 hover:text-primary transition-all">
                <Instagram className="w-8 h-8" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-all">
                <Facebook className="w-8 h-8" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-black uppercase tracking-widest text-primary">Localização</h4>
            <div className="rounded-2xl overflow-hidden h-40 border border-white/10 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3986.046337537332!2d-44.1352!3d-2.5458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwMzInNDQuOSJTIDQ0wrAwOCcxMS40Ilc!5e0!3m2!1spt-BR!2sbr!4v1650000000000" 
                className="w-full h-full border-0 grayscale invert opacity-70" 
                allowFullScreen 
                loading="lazy"
              ></iframe>
            </div>
            <LocationLink />
          </div>

          <div className="flex flex-col items-center md:items-end justify-center gap-4">
            {/* BOTÃO ATUALIZADO PARA A ROTA DO DASHBOARD */}
            <Button  
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-xl py-8 rounded-2xl shadow-xl font-black uppercase italic"
              onClick={() => navigate("/admin/dashboard")}
            >
              Área Administrativa <ChevronRight className="ml-2" />
            </Button>
            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-tighter italic">
              © 2026 Arena Cedro. São José de Ribamar - MA
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Index;