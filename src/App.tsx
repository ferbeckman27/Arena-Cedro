import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Importações das páginas
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AtendenteDashboard from "./pages/AtendenteDashboard";
import TestimonialForm from "@/components/home/TestimonialForm"; // Caminho que você solicitou

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Rota Pública - Landing Page */}
          <Route path="/" element={<Index />} />
          
          {/* Rota do Cliente */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} /> {/* Login gerencia ambos por abas */}
          
          {/* Rota de Depoimentos */}
          <Route path="/depoimentos" element={<TestimonialForm />} />
          
          {/* Rotas Administrativas */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AtendenteDashboard />} /> {/* ROTA DO PAINEL ADICIONADA */}
          
          {/* Rota de fallback (404) ou Dashboard (quando criar) */}
          <Route path="*" element={<Index />} />
        </Routes>
        {/* O Toaster deve estar FORA do Routes mas DENTRO do BrowserRouter/Provider */}
        <Toaster />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;