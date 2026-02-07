import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Send } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import { useToast } from "@/hooks/use-toast"; // Importe o toast para feedback visual

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [role, setRole] = useState<string>("");

  // 1. FUNÇÃO PARA ACESSAR O PAINEL
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulação de login: aqui você validaria as credenciais
    toast({
      title: "Acesso Autorizado",
      description: "Bem-vindo ao portal corporativo.",
    });

    // REDIRECIONA PARA A ROTA DO APP.TSX
    navigate("/admin/dashboard");
  };

  // 2. FUNÇÃO PARA SOLICITAR ACESSO
  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Solicitação Enviada",
      description: "Seus dados foram enviados para análise da diretoria.",
    });
    setActiveTab("login"); // Volta para a aba de login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a08] p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={heroArena} className="w-full h-full object-cover opacity-20" alt="Arena Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-[#060a08]/50 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8 space-y-2">
          <div className="bg-[#22c55e]/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-[#22c55e]/30">
            <ShieldCheck className="w-10 h-10 text-[#22c55e]" />
          </div>
          <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">Portal Corporativo</h1>
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Administração & Atendimento</p>
        </div>

        <div className="bg-[#0c120f] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-black">Acessar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-bold uppercase data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Solicitar Acesso</TabsTrigger>
            </TabsList>

            {/* ABA DE LOGIN */}
            <TabsContent value="login">
              <form onSubmit={handleAdminLogin} className="space-y-6"> {/* FORM ADICIONADO */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">E-mail Corporativo</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                      <Input required type="email" placeholder="usuario@admincedro.com" className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white focus:border-[#22c55e]" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Senha de Acesso</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                      <Input required type={showPassword ? "text" : "password"} placeholder="••••••••" className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white focus:border-[#22c55e]" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-600">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-white hover:bg-gray-200 text-black font-black h-14 rounded-2xl text-lg uppercase italic mt-4 transition-transform active:scale-95">
                    Entrar no Painel
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* ABA DE SOLICITAÇÃO */}
            <TabsContent value="register">
              <form onSubmit={handleRequestAccess} className="space-y-5"> {/* FORM ADICIONADO */}
                <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 p-4 rounded-2xl mb-4 text-[11px] text-[#22c55e] leading-tight font-medium">
                   Seus dados serão analisados pela diretoria.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input required placeholder="Nome" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                  <Input required placeholder="Sobrenome" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Cargo Desejado</Label>
                  <Select required onValueChange={setRole}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white">
                      <SelectValue placeholder="Selecione sua função" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0c120f] border-white/10 text-white">
                      <SelectItem value="atendente">Atendente (@atendcedro.com)</SelectItem>
                      <SelectItem value="admin">Administrador (@admincedro.com)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Input required type="email" placeholder="E-mail Pessoal" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                <Input required placeholder="Telefone / WhatsApp" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />

                <Button type="submit" className="w-full bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-black h-14 rounded-2xl text-lg uppercase italic gap-2 transition-transform active:scale-95">
                  <Send size={20} /> Solicitar Cadastro
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;