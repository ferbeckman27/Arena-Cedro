import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowLeft, CheckCircle2, Circle, KeyRound } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const passwordValidations = useMemo(() => {
    const hasExactLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const nums = newPassword.match(/\d/g) || [];
    const noRepeatedNumbers = nums.length === new Set(nums).size;
    return {
      hasExactLength,
      hasUpperCase,
      hasLowerCase,
      hasSpecialChar,
      hasNumber,
      noRepeatedNumbers,
      isValid: hasExactLength && hasUpperCase && hasLowerCase && hasSpecialChar && hasNumber && noRepeatedNumbers,
    };
  }, [newPassword]);

  // --- LOGIN ---
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      return toast({
        variant: "destructive",
        title: "E-mail inválido",
        description: "Use um e-mail corporativo válido.",
      });
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      const userEmail = data.user?.email || "";
      const isAdmin = userEmail.endsWith("@admincedro.com");
      localStorage.setItem("userRole", isAdmin ? "admin" : "atendente");
      localStorage.setItem("userId", data.user.id);

      // Register access count
      await supabase.rpc("registrar_acesso", { p_funcionario_id: data.user.id });

      toast({ title: "Acesso Autorizado", description: `Bem-vindo, ${userEmail.split("@")[0]}!` });
      navigate(isAdmin ? "/admindashboard" : "/atendentedashboard");
    } catch (error: any) {
      const msg =
        error.message === "Invalid login credentials"
          ? "E-mail ou senha corporativos incorretos."
          : "Erro de conexão com o servidor.";
      toast({ variant: "destructive", title: "Falha no Login", description: msg });
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes("@")) {
      return toast({
        variant: "destructive",
        title: "E-mail inválido",
        description: "Digite um e-mail corporativo válido.",
      });
    }
    if (!passwordValidations.isValid) {
      return toast({
        variant: "destructive",
        title: "Senha Inválida",
        description: "Sua senha não atende aos requisitos.",
      });
    }
    if (newPassword !== confirmPassword) {
      return toast({
        variant: "destructive",
        title: "Senhas diferentes",
        description: "A confirmação de senha não confere.",
      });
    }

    setLoading(true);
    try {
      // Find the employee by email
      const { data: func } = await supabase
        .from("funcionarios")
        .select("id")
        .or(`email_corporativo.eq.${forgotEmail.trim()},email.eq.${forgotEmail.trim()}`)
        .single();

      if (!func) {
        toast({
          variant: "destructive",
          title: "E-mail não encontrado",
          description: "Nenhum funcionário com este e-mail.",
        });
        setLoading(false);
        return;
      }

      // Update password via RPC (hashed with pgcrypto)
      await supabase.rpc("set_funcionario_senha", { p_id: func.id, p_senha: newPassword });

      toast({ title: "Senha alterada!", description: "Use sua nova senha para acessar o sistema." });
      setShowForgotPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setForgotEmail("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a08] p-4 relative overflow-hidden">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-[#22c55e] transition-all group"
      >
        <div className="bg-white/5 p-2 rounded-full border border-white/10 group-hover:border-[#22c55e]/50 group-hover:bg-[#22c55e]/10">
          <ArrowLeft size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest italic">Voltar ao site</span>
      </button>

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
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Arena Cedro</p>
        </div>

        <div className="bg-[#0c120f] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          {!showForgotPassword ? (
            <>
              <h2 className="text-center text-sm font-black uppercase tracking-widest text-gray-400 mb-6">
                Acesso Corporativo
              </h2>
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
                        className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                      <Input
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-[#22c55e] hover:bg-[#1bb054] text-black font-black h-14 rounded-2xl uppercase italic transition-all"
                  >
                    {loading ? "Autenticando..." : "Entrar no Sistema"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="w-full text-center text-xs text-gray-500 hover:text-[#22c55e] transition-colors uppercase tracking-widest font-bold mt-2"
                  >
                    <KeyRound size={14} className="inline mr-2" />
                    Esqueci minha senha
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setShowForgotPassword(false)} className="text-gray-500 hover:text-white">
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Redefinir Senha</h2>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">E-mail Corporativo</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                    <Input
                      required
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="usuario@atendcedro.com ou @admincedro.com"
                      className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                    <Input
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Nova senha (8 caracteres)"
                      className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-3.5 text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                    <Input
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type="password"
                      placeholder="Repita a nova senha"
                      className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Password rules */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Requisitos de Segurança:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { ok: passwordValidations.hasExactLength, label: "8+ caracteres" },
                      { ok: passwordValidations.hasUpperCase, label: "Letra maiúscula" },
                      { ok: passwordValidations.hasLowerCase, label: "Letra minúscula" },
                      { ok: passwordValidations.hasSpecialChar, label: "Caractere especial" },
                      { ok: passwordValidations.hasNumber, label: "Número" },
                      { ok: passwordValidations.noRepeatedNumbers, label: "Sem números repetidos" },
                    ].map((rule, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px]">
                        {rule.ok ? (
                          <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                        ) : (
                          <Circle className="w-3 h-3 text-gray-600" />
                        )}
                        <span className={rule.ok ? "text-white" : "text-gray-500"}>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  disabled={loading || !passwordValidations.isValid || newPassword !== confirmPassword}
                  type="submit"
                  className="w-full bg-[#22c55e] hover:bg-[#1bb054] text-black font-black h-14 rounded-2xl uppercase italic transition-all disabled:opacity-30"
                >
                  {loading ? "Salvando..." : "Salvar Nova Senha"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
