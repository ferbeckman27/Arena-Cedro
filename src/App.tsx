import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MessageCircle, MessageSquare } from "lucide-react"; // Importei o ícone do Whats

// Importações das Páginas
import Index from "./pages/Index";
import Login from "./pages/Login"; // Login Cliente
import AdminLogin from "./pages/AdminLogin"; // Login Admin/Atendente
import ClientDashboard from "./pages/ClientDashboard";
import AtendenteDashboard from "./pages/AtendenteDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TestimonialForm from "@/components/home/TestimonialForm";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota Pública Inicial */}
          <Route path="/" element={<Index />} />

          {/* Módulo Cliente */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/clientdashboard" element={<ClientDashboard />} />
          <Route path="/depoimentos" element={<TestimonialForm />} />

          {/* Módulo Administrativo / Atendente */}
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/atendentedashboard" element={<AtendenteDashboard />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />

          {/* Redirecionamento de Rotas Não Encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;