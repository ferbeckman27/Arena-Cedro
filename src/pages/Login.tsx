import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Lock, Mail, CheckCircle2, Circle } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import { toast } from "@/components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [regPassword, setRegPassword] = useState("");

  // 1. FUNÇÃO PARA O LOGIN
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/clientdashboard"); 
    toast({
      title: "Bem-vindo de volta!",
      description: "Você acessou sua conta com sucesso.",
    });
  };

  // 2. FUNÇÃO PARA O CADASTRO
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordValidations.isValid) {
      navigate("/clientdashboard"); 
      toast({
        title: "Cadastro realizado!",
        description: "Agora você já pode agendar seus horários.",
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
    // DIV PRINCIPAL (ROOT)
    <div className="min-h-screen w-full bg-[#060a08] relative overflow-hidden flex items-center justify-center p-4">
      
      {/* BACKGROUND COM IMAGEM E GRADIENTE */}
      <div className="absolute inset-0 z-0">
        <img src={heroArena} className="w-full h-full object-cover opacity-30" alt="Background Arena" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-transparent to-[#060a08]" />
      </div>

      {/* CONTAINER DO CONTEÚDO */}
      <div className="relative z-10 w-full max-w-lg">
        
        {/* LOGO */}
        <div className="flex justify-center mb-10">
          <img 
            src="/media/logo-arena.png" 
            alt="Arena Cedro" 
            className="w-48 h-48 md:w-56 md:h-56 object-contain transition-transform hover:scale-105" 
          />
        </div>

        {/* CARD DE LOGIN/REGISTRO */}
        <div className="bg-black/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl font-black uppercase italic data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-black uppercase italic data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Cadastrar</TabsTrigger>
            </TabsList>

            {/* ABA DE LOGIN */}
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
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
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
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

                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      {passwordValidations.hasMinLength ? <CheckCircle2 className="w-4 h-4 text-[#22c55e]" /> : <Circle className="w-4 h-4 text-gray-600" />}
                      <span className={passwordValidations.hasMinLength ? "text-white" : "text-gray-500"}>Mínimo 8 caracteres</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordValidations.hasSpecialChar ? <CheckCircle2 className="w-4 h-4 text-[#22c55e]" /> : <Circle className="w-4 h-4 text-gray-600" />}
                      <span className={passwordValidations.hasSpecialChar ? "text-white" : "text-gray-500"}>Um caractere especial</span>
                    </div>
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

          {/* FOOTER DE TERMOS */}
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>© 2026 Arena Cedro. Todos os direitos reservados.</p>
            <a href="/regras-arena.pdf" target="_blank" className="underline hover:text-primary">
              Regras de Uso
            </a>
          </div>
        </div> 
      </div> 
    </div> 
  );
};


export default Login;