import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Send, ArrowLeft } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import logoArena from "./media/logo-arena2.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const emailLower = email.toLowerCase();

    // LÓGICA DE DIRECIONAMENTO COM "CHAVE" DE ACESSO
    if (emailLower.endsWith("@admincedro.com")) {
      // SALVAMOS A CHAVE AQUI
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("userRole", "admin");
      
      toast({
        title: "Acesso Administrador",
        description: "Redirecionando para o painel administrativo...",
      });
      navigate("/admindashboard");
    } 
    else if (emailLower.endsWith("@atendcedro.com")) {
      // SALVAMOS A CHAVE DE ATENDENTE
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("userRole", "atendente");

      toast({
        title: "Acesso Atendente",
        description: "Redirecionando para o painel de atendente...",
      });
      navigate("/atendentedashboard"); // Ou a rota do atendente
    } 
    else {
      toast({
        variant: "destructive",
        title: "E-mail inválido",
        description: "Use um e-mail @admincedro.com ou @atendcedro.com",
      });
    }
  };

  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Solicitação Enviada",
      description: "Aguarde o e-mail de confirmação da diretoria.",
    });
    setActiveTab("adminlogin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a08] p-4 relative overflow-hidden">
      
      {/* BOTÃO VOLTAR PARA O SITE (FIXO NO TOPO) */}
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-[#22c55e] transition-all group"
      >
        <div className="bg-white/5 p-2 rounded-full border border-white/10 group-hover:border-[#22c55e]/50 group-hover:bg-[#22c55e]/10">
          <ArrowLeft size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest italic">Voltar ao site</span>
      </button>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={heroArena} className="w-full h-full object-cover opacity-20" alt="Arena Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-[#060a08]/50 to-transparent" />
      </div>

      {/* Logo */}
<div className="flex justify-center mb-10 scale-110"> {/* Adicionei scale para um ajuste fino se necessário */}
  <img 
    src="/media/logo-arena2.png" 
    alt="Arena Cedro" 
    className="w-[550px] md:w-[550px] h-auto object-contain drop-shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-float" />
</div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8 space-y-2">
          <div className="bg-[#22c55e]/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-[#22c55e]/30">
            <ShieldCheck className="w-10 h-10 text-[#22c55e]" />
          </div>
          <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">Portal Corporativo</h1>
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Arena Cedro</p>
        </div>

        <div className="bg-[#0c120f] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-black">Acessar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-bold uppercase data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Solicitar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">E-mail Corporativo</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                      <Input 
                        required 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario" 
                        className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white focus:border-[#22c55e]" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                      <Input 
                        required 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white focus:border-[#22c55e]" 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-600">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-white hover:bg-gray-200 text-black font-black h-14 rounded-2xl text-lg uppercase italic transition-transform active:scale-95">
                    Entrar no Painel
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRequestAccess} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input required placeholder="Nome" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                  <Input required placeholder="Sobrenome" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                </div>
                <Select required onValueChange={setRole}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white">
                    <SelectValue placeholder="Cargo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c120f] border-white/10 text-white">
                    <SelectItem value="atendente">Atendente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <Input required type="email" placeholder="E-mail Pessoal" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                <Button type="submit" className="w-full bg-[#22c55e] hover:bg-[#22c55e]/90 text-black font-black h-14 rounded-2xl text-lg uppercase italic gap-2">
                  <Send size={20} /> Enviar Pedido
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