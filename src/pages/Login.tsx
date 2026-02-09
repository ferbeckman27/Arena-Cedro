import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, EyeOff, Lock, Mail, User, Phone, CheckCircle2, Circle } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import logoArena from "./media/logo-arena.png";
import { toast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [regPassword, setRegPassword] = useState("");

// 1. FUNÇÃO PARA O LOGIN (CLIENTE)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Agora mandamos para o /dashboard em vez de /
    navigate("/clientdashboard"); 

    toast({
      title: "Bem-vindo de volta!",
      description: "Você acessou sua conta com sucesso.",
    });
  };

  // 2. FUNÇÃO PARA O CADASTRO (CLIENTE)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordValidations.isValid) {
      // Após o cadastro, também mandamos para o dashboard com a nova conta criada
      navigate("/clientdashboard"); 

      toast({
        title: "Cadastro realizado!",
        description: "Agora você já pode agendar seus horários, ver suas reservas e produtos.",
      });
    }
  };

  const passwordValidations = useMemo(() => {
    const hasMinLength = regPassword.length >= 8;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(regPassword);
    const noRepeatedNumbers = !/(\d)\1\1/.test(regPassword);
    
    return {
      hasMinLength,
      hasSpecialChar,
      noRepeatedNumbers,
      isValid: hasMinLength && hasSpecialChar && noRepeatedNumbers
    };
  }, [regPassword]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a08] p-4 relative overflow-hidden">
      {/* ... Fundo e Logo permanecem iguais ... */}

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
      <div className="flex justify-center mb-10 scale-110"> {/* Adicionei scale para um ajuste fino se necessário */}
        <img 
          src="/media/logo-arena.png" 
          alt="Arena Cedro" 
          className="w-48 h-48 md:w-64 md:h-64 object-contain transition-transform hover:scale-105" 
         />
       </div>

       <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden border-b border-white/5 py-20">
        <div className="absolute inset-0 z-0">
          <img src={heroArena} className="w-full h-full object-cover opacity-30" alt="Background Arena" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-transparent to-[#060a08]" />
        </div>

        <div className="bg-black/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl font-black uppercase italic data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-black uppercase italic data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Cadastrar</TabsTrigger>
            </TabsList>

            {/* ABA DE LOGIN */}
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-6"> {/* ADICIONADO FORM E ONSUBMIT */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white ml-1 uppercase text-[10px] font-bold tracking-widest">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                      <Input required type="email" placeholder="seu@email.com" className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white focus:border-[#22c55e]" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white ml-1 uppercase text-[10px] font-bold tracking-widest">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                      <Input 
                        required
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white focus:border-[#22c55e]" 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-500 hover:text-white">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black h-14 rounded-2xl text-xl uppercase italic shadow-lg shadow-[#22c55e]/20 mt-4">
                    Entrar no Sistema
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* ABA DE CADASTRO */}
            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-5"> {/* ADICIONADO FORM E ONSUBMIT */}
                <div className="grid grid-cols-2 gap-4">
                  <Input required placeholder="Nome" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                  <Input required placeholder="Sobrenome" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                </div>
                <Input required placeholder="WhatsApp" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                <Input required type="email" placeholder="E-mail" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                
                <div className="space-y-2">
                  <div className="relative">
                    <Input 
                      required
                      type={showRegPassword ? "text" : "password"} 
                      placeholder="Criar Senha" 
                      className="bg-white/5 border-white/10 h-12 pr-12 rounded-xl text-white"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-4 top-3.5 text-gray-500">
                      {showRegPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Checklist visual permanece igual */}
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                     {/* ... seu checklist ... */}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black h-14 rounded-2xl text-xl uppercase italic disabled:opacity-30"
                  disabled={!passwordValidations.isValid}
                >
                  Finalizar Cadastro
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          {/* ... Footer de Termos ... */}
        </div>
      </div>
    </div>
  );
};

export default Login;