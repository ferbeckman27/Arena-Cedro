import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Star, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Estados dos formulários
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login realizado!",
        description: "Bem-vindo à Arena Cedro!",
      });
      navigate("/dashboard");
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Cadastro realizado!",
        description: "Sua conta foi criada com sucesso.",
      });
      setActiveTab("login");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a08] p-4 relative overflow-hidden">
      {/* Imagem de Fundo (Hero) */}
      <div className="absolute inset-0 z-0">
        <img src={heroArena} className="w-full h-full object-cover opacity-30" alt="Arena Background" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060a08] via-[#060a08]/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
        
        {/* Lado Esquerdo: Branding / Social Proof */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center text-black font-black text-xl">A</div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Arena <span className="text-primary">Cedro</span></h2>
          </div>
          <p className="text-xl text-gray-400 font-medium">O melhor campo de futebol society da região. Faça seu login para reservar.</p>
          
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
            <div className="flex text-yellow-500 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="fill-current w-5 h-5" />)}
            </div>
            <p className="italic text-gray-200 text-lg">"Estrutura impecável e o processo de agendamento pelo site é muito rápido. Nota 10!"</p>
            <p className="text-primary font-black mt-3 uppercase text-xs tracking-widest">— Carlos Mendes, Atleta</p>
          </div>
        </div>

        {/* Lado Direito: Formulário com Abas */}
        <div className="bg-black/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl font-bold uppercase tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-black">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-bold uppercase tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-black">Cadastrar</TabsTrigger>
            </TabsList>

            {/* CONTEÚDO: LOGIN */}
            <TabsContent value="login" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase italic">Acesse sua Conta</h1>
                <p className="text-gray-400">Insira seus dados de cliente abaixo.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white ml-1">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <Input id="email" type="email" placeholder="seu@email.com" className="bg-white/5 border-white/10 text-white h-12 pl-10 rounded-xl focus:ring-primary" required value={email} onChange={(e)=>setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pass" className="text-white ml-1">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <Input id="pass" type={showPassword ? "text" : "password"} placeholder="••••••••" className="bg-white/5 border-white/10 text-white h-12 pl-10 rounded-xl focus:ring-primary" required value={password} onChange={(e)=>setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-500 hover:text-white">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-black font-black h-14 rounded-2xl text-lg uppercase tracking-widest transition-all hover:scale-[1.02]" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar agora"}
                </Button>
              </form>
            </TabsContent>

            {/* CONTEÚDO: CADASTRO */}
            <TabsContent value="register" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase italic">Crie sua Conta</h1>
                <p className="text-gray-400">Cadastre-se para começar a agendar.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white ml-1">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <Input placeholder="Seu nome" className="bg-white/5 border-white/10 text-white h-12 pl-10 rounded-xl" required value={name} onChange={(e)=>setName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white ml-1">WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <Input placeholder="(98) 99999-0000" className="bg-white/5 border-white/10 text-white h-12 pl-10 rounded-xl" required value={phone} onChange={(e)=>setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white ml-1">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <Input type="email" placeholder="seu@email.com" className="bg-white/5 border-white/10 text-white h-12 pl-10 rounded-xl" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white ml-1">Crie uma Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                    <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 text-white h-12 pl-10 rounded-xl" required />
                  </div>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-black font-black h-14 rounded-2xl text-lg uppercase tracking-widest transition-all hover:scale-[1.02]" disabled={isLoading}>
                  {isLoading ? "Criando..." : "Finalizar Cadastro"}
                </Button>
              </form>

              {/* Card VIP exclusivo para Clientes */}
              <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 flex items-center gap-4">
                <Star className="w-8 h-8 text-accent fill-accent" />
                <div>
                  <h4 className="text-sm font-bold text-accent uppercase tracking-tighter">Seja Cliente VIP</h4>
                  <p className="text-xs text-gray-400">Garanta seu horário fixo semanal com descontos.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <p className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-[0.2em]">
            Ao continuar, você concorda com nossos <span className="text-primary cursor-pointer hover:underline">Termos de Uso</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
