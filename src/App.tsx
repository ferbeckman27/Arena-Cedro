import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
          {/* Rota Pública */}
          <Route path="/" element={<Index />} />
          
          {/* Rotas do Cliente */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          {/* ADICIONE ESTA ROTA ABAIXO: É para onde o cliente vai após o login */}
          <Route path="/dashboard" element={<Index />} /> {/* Por enquanto mandando para Index, troque pela página certa depois */}
          
          {/* Rota de Depoimentos */}
          <Route path="/depoimentos" element={<TestimonialForm />} />
          
          {/* Rotas Administrativas */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AtendenteDashboard />} />
          
          {/* Rota de fallback */}
          <Route path="*" element={<Index />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;