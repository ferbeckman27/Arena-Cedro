import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Lock, Mail, Phone, CheckCircle2, Circle, ArrowLeft, KeyRound } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface PasswordRules {
  hasMinLength: boolean;
  hasSpecialChar: boolean;
  noRepeatedNumbers: boolean;
  isValid: boolean;
}

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [saveSession, setSaveSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Register states
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  const [activeTab, setActiveTab] = useState("login");

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

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

  const forgotPasswordValidations = useMemo(() => {
    const hasMinLength = newPassword.length >= 8;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const noRepeatedNumbers = !/(\d)\1\1/.test(newPassword);
    return {
      hasMinLength,
      hasSpecialChar,
      noRepeatedNumbers,
      isValid: hasMinLength && hasSpecialChar && noRepeatedNumbers
    };
  }, [newPassword]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', loginEmail)
        .eq('senha', loginPassword)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const usuario = data;
        const storage = saveSession ? localStorage : sessionStorage;
        storage.setItem("userName", usuario.nome);
        storage.setItem("userRole", usuario.tipo || "cliente");
        storage.setItem("userId", String(usuario.id));
        storage.setItem("userEmail", usuario.email || "");

        toast({ title: "Bem-vindo de volta!", description: "Acesso realizado com sucesso." });
        
        if (usuario.tipo === 'administrador') navigate("/admin");
        else if (usuario.tipo === 'atendente') navigate("/atendimento");
        else navigate("/clientdashboard");
      } else {
        toast({ variant: "destructive", title: "Erro", description: "E-mail ou senha incorretos." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro de Conexão", description: error.message });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValidations.isValid) {
      toast({ variant: "destructive", title: "Senha Fraca", description: "Sua senha não atende aos requisitos de segurança." });
      return;
    }

    try {
      const { error } = await supabase.from('clientes').insert([{
        nome,
        sobrenome,
        email: regEmail.trim(),
        telefone: telefone.trim(),
        senha: regPassword 
      }]);
      
      if (error) throw error;
      toast({ title: "Cadastro realizado!", description: "Agora faça seu login." });
      setLoginEmail(regEmail);
      setActiveTab("login");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao cadastrar", description: "E-mail já está em uso." });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordValidations.isValid) {
      return toast({ variant: "destructive", title: "Senha Fraca", description: "Sua senha não atende aos requisitos." });
    }
    if (newPassword !== confirmPassword) {
      return toast({ variant: "destructive", title: "Senhas diferentes", description: "A confirmação de senha não confere." });
    }

    try {
      const { data, error } = await supabase.rpc('redefinir_senha_cliente', {
        p_email: forgotEmail.trim(),
        p_nova_senha: newPassword
      });

      if (error) throw error;
      if (!data) {
        toast({ variant: "destructive", title: "E-mail não encontrado", description: "Nenhum cliente com este e-mail." });
        return;
      }

      toast({ title: "Senha redefinida!", description: "Use sua nova senha para entrar." });
      setShowForgotPassword(false);
      setForgotEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setLoginEmail(forgotEmail);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen w-full bg-[#060a08] relative overflow-hidden flex items-center justify-center p-4">
        <button onClick={() => setShowForgotPassword(false)} className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-[#22c55e] transition-all group">
          <div className="bg-white/5 p-2 rounded-full border border-white/10 group-hover:border-[#22c55e]/50 group-hover:bg-[#22c55e]/10">
            <ArrowLeft size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest italic">Voltar ao login</span>
        </button>

        <div className="absolute inset-0 z-0">
          <img src={heroArena} className="w-full h-full object-cover opacity-30" alt="Background Arena" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-transparent to-[#060a08]" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="flex justify-center mb-10">
            <img src="/media/logo-arena2.png" alt="Arena Cedro" className="w-[450px] h-auto object-contain drop-shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-float" />
          </div>

          <div className="bg-black/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <h2 className="text-center text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center justify-center gap-2">
              <KeyRound size={16} className="text-[#22c55e]" /> Redefinir Senha
            </h2>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white ml-1 uppercase text-[10px] font-bold tracking-widest">E-mail cadastrado</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  <Input required type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="seu@email.com" className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white ml-1 uppercase text-[10px] font-bold tracking-widest">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  <Input required type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha segura" className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-3.5 text-gray-500">
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white ml-1 uppercase text-[10px] font-bold tracking-widest">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  <Input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white" />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Requisitos de Segurança:</p>
                <div className="flex items-center gap-2 text-xs">
                  {forgotPasswordValidations.hasMinLength ? <CheckCircle2 className="w-3 h-3 text-[#22c55e]" /> : <Circle className="w-3 h-3 text-gray-600" />}
                  <span className={forgotPasswordValidations.hasMinLength ? "text-white" : "text-gray-500"}>8+ caracteres</span>
                  
                  {forgotPasswordValidations.hasSpecialChar ? <CheckCircle2 className="w-3 h-3 text-[#22c55e]" /> : <Circle className="w-3 h-3 text-gray-600" />}
                  <span className={forgotPasswordValidations.hasSpecialChar ? "text-white" : "text-gray-500"}>Caractere especial (@, #, !)</span>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={!forgotPasswordValidations.isValid || newPassword !== confirmPassword}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black h-14 rounded-2xl text-xl uppercase italic mt-4 disabled:opacity-30"
              >
                Salvar Nova Senha
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#060a08] relative overflow-hidden flex items-center justify-center p-4">
      <button onClick={() => navigate("/")} className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-[#22c55e] transition-all group">
        <div className="bg-white/5 p-2 rounded-full border border-white/10 group-hover:border-[#22c55e]/50 group-hover:bg-[#22c55e]/10">
          <ArrowLeft size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest italic">Voltar ao site</span>
      </button>

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

                  <div className="flex items-center space-x-2 ml-1">
                    <Checkbox id="save" checked={saveSession} onCheckedChange={(checked) => setSaveSession(checked as boolean)} className="border-white/20 data-[state=checked]:bg-[#22c55e]" />
                    <label htmlFor="save" className="text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">Desejo salvar minha senha neste dispositivo</label>
                  </div>

                  <Button type="submit" className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black h-14 rounded-2xl text-xl uppercase italic mt-4">
                    Entrar no Sistema
                  </Button>

                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-center text-xs text-gray-500 hover:text-[#22c55e] transition-colors uppercase tracking-widest font-bold"
                  >
                    <KeyRound size={14} className="inline mr-2" />
                    Esqueci minha senha
                  </button>
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
