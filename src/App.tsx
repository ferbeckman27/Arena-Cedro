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
        <Toaster />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;