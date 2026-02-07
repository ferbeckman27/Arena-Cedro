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
import logoAreba from "./media/logo-arena.png";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [regPassword, setRegPassword] = useState("");

  // 1. ADICIONE ESTA FUNÇÃO PARA O LOGIN
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você adicionaria a lógica de conferir e-mail/senha
    // Como queremos que funcione agora, vamos direto para o redirecionamento:
    navigate("/"); // Redireciona para a Home (ou crie a rota /dashboard no App.tsx)
  };

  // 2. ADICIONE ESTA FUNÇÃO PARA O CADASTRO
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordValidations.isValid) {
      navigate("/"); // Redireciona após cadastrar
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
        <div className="flex justify-center mb-8">
          <img src="/media/logo-arena.png" alt="Arena Cedro" className="w-32 h-32 md:w-40 md:h-40 object-contain" />
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