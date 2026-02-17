import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react"; // Importei o ícone do Whats

// Importações das páginas
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AtendenteDashboard from "./pages/AtendenteDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard"; 
import TestimonialForm from "@/components/home/TestimonialForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/clientdashboard" element={<ClientDashboard />} />
          <Route path="/depoimentos" element={<TestimonialForm />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/atendentedashboard" element={<AtendenteDashboard />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Index />} />
        </Routes>

        {/* --- COMPONENTE FLUTUANTE DO WHATSAPP --- */}
        <a
          href="https://wa.me/5598999910535?text=Olá!%20Gostaria%20de%20agendar%20um%20horário%20na%20Arena%20Cedro."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[9999] group"
        >
          {/* Ondas de Pulsação */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75 animate-ping"></span>
          
          {/* Botão com Glow */}
          <div className="relative bg-[#22c55e] p-4 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.6)] text-black transition-all hover:scale-110 active:scale-95">
            <MessageCircle size={32} fill="currentColor" strokeWidth={1} />
            
            {/* Tooltip */}
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#0c120f] text-[#22c55e] text-[10px] font-black uppercase italic px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity border border-[#22c55e]/30 whitespace-nowrap pointer-events-none shadow-2xl">
              Chamar no WhatsApp
            </span>
          </div>
        </a>

        <Toaster />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;