import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // Adicionado para "Salvar Senha"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Lock, Mail, CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados para Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [saveSession, setSaveSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados para Cadastro
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  const [activeTab, setActiveTab] = useState("login");

  // 1. LÓGICA DE LOGIN CONECTADA AO BACKEND
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/login-unificado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        // Se o cliente marcou "Salvar Senha", usamos LocalStorage, se não, SessionStorage
        const storage = saveSession ? localStorage : sessionStorage;
        storage.setItem("token", data.token);
        storage.setItem("userName", data.nome);

        toast({ title: "Bem-vindo de volta!", description: "Acesso realizado com sucesso." });
        navigate("/clientdashboard");
      } else {
        toast({ variant: "destructive", title: "Erro", description: data.message });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro de Conexão", description: "Servidor fora do ar." });
    }
  };

  // 2. LÓGICA DE CADASTRO DE CLIENTE
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValidations.isValid) return;

    try {
      const response = await fetch("http://localhost:3001/api/cadastro-cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, sobrenome, email: regEmail, telefone, senha: regPassword }),
      });

      if (response.ok) {
        toast({ title: "Cadastro realizado!", description: "Agora faça seu login." });
        setActiveTab("login");
      } else {
        toast({ variant: "destructive", title: "Erro ao cadastrar", description: "E-mail já em uso." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha na conexão." });
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
    <div className="min-h-screen w-full bg-[#060a08] relative overflow-hidden flex items-center justify-center p-4">
      {/* Botão Voltar */}
      <button onClick={() => navigate("/")} className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-[#22c55e] transition-all group">
        <div className="bg-white/5 p-2 rounded-full border border-white/10 group-hover:border-[#22c55e]/50 group-hover:bg-[#22c55e]/10">
          <ArrowLeft size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest italic">Voltar ao site</span>
      </button>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={heroArena} className="w-full h-full object-cover opacity-30" alt="Background Arena" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-transparent to-[#060a08]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex justify-center mb-10">
          <img src="/media/logo-arena2.png" alt="Arena Cedro" className="w-[450px] h-auto object-contain drop-shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-float" />
        </div>

        <div className="bg-black/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl font-black uppercase italic">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-black uppercase italic">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white ml-1 uppercase text-[10px] font-bold tracking-widest">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                      <Input required type="email" value={loginEmail} onChange={(e)=>setLoginEmail(e.target.value)} placeholder="seu@email.com" className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white ml-1 uppercase text-[10px] font-bold tracking-widest">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                      <Input required type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e)=>setLoginPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-500">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Checkbox Salvar Senha */}
                  <div className="flex items-center space-x-2 ml-1">
                    <Checkbox id="save" checked={saveSession} onCheckedChange={(checked) => setSaveSession(checked as boolean)} className="border-white/20 data-[state=checked]:bg-[#22c55e]" />
                    <label htmlFor="save" className="text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">Desejo salvar minha senha neste dispositivo</label>
                  </div>

                  <Button type="submit" className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black h-14 rounded-2xl text-xl uppercase italic mt-4">
                    Entrar no Sistema
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input required placeholder="Nome" value={nome} onChange={(e)=>setNome(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                  <Input required placeholder="Sobrenome" value={sobrenome} onChange={(e)=>setSobrenome(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                </div>
                <Input required placeholder="WhatsApp (ex: 98991223344)" value={telefone} onChange={(e)=>setTelefone(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                <Input required type="email" placeholder="E-mail" value={regEmail} onChange={(e)=>setRegEmail(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                
                <div className="space-y-2">
                  <div className="relative">
                    <Input required type={showRegPassword ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Criar Senha Segura" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-4 top-3.5 text-gray-500">
                      {showRegPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Requisitos de Segurança:</p>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordValidations.hasMinLength ? <CheckCircle2 className="w-3 h-3 text-[#22c55e]" /> : <Circle className="w-3 h-3 text-gray-600" />}
                      <span className={passwordValidations.hasMinLength ? "text-white" : "text-gray-500"}>8+ caracteres</span>
                      
                      {passwordValidations.hasSpecialChar ? <CheckCircle2 className="w-3 h-3 text-[#22c55e]" /> : <Circle className="w-3 h-3 text-gray-600" />}
                      <span className={passwordValidations.hasSpecialChar ? "text-white" : "text-gray-500"}>Caractere especial (@, #, !)</span>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={!passwordValidations.isValid} className="w-full bg-[#22c55e] text-black font-black h-14 rounded-2xl text-xl uppercase italic disabled:opacity-30">
                  Finalizar Cadastro
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
            <p>© 2026 Arena Cedro</p>
            <div className="flex justify-center gap-4 mt-2">
                <button onClick={() => alert("Abrir modal de Termos")} className="underline">Termos de Uso</button>
                <button onClick={() => alert("Abrir modal de Políticas")} className="underline">Privacidade</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;