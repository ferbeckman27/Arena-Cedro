import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Send, ArrowLeft } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import { supabase } from '@/lib/supabase';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  // Estados para os inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [emailPessoal, setEmailPessoal] = useState("");
  const [role, setRole] = useState<string>("");

  // FUNÇÃO DE LOGIN (CONECTADA AO BANCO)
  const handleAdminLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // 1. Busca o funcionário pelo e-mail e verifica a senha usando o crypt do Postgres
    // Usamos o RPC (Remote Procedure Call) para maior segurança ou uma query direta:
    const { data, error } = await supabase
      .from('funcionarios')
      .select('id, nome, tipo, senha')
      .eq('email', email)
      .single();

    if (error || !data) throw new Error("Usuário não encontrado.");

    // 2. Verifica a senha comparando o hash
    // Nota: Em um ambiente real Supabase Auth é o ideal, mas seguindo sua lógica de banco:
    const { data: passwordMatch } = await supabase.rpc('verificar_senha_funcionario', {
      pass: password,
      stored_hash: data.senha
    });

    // Se você não criou a função RPC acima, use esta lógica simplificada de comparação direta (se não houver crypt)
    // ou busque o registro onde o crypt bata:
    const { data: userValid, error: loginError } = await supabase
      .rpc('login_funcionario', { p_email: email, p_senha: password });

    if (loginError || !userValid || userValid.length === 0) {
      return toast({
        variant: "destructive",
        title: "Erro de Acesso",
        description: "E-mail ou senha inválidos.",
      });
    }

    const funcionario = userValid[0];

    // 3. Salva a sessão localmente
    localStorage.setItem("userName", funcionario.nome);
    localStorage.setItem("userRole", funcionario.tipo);
    localStorage.setItem("userId", String(funcionario.id));
    
    toast({
      title: `Bem-vindo, ${funcionario.nome}!`,
      description: "Acesso administrativo autorizado.",
    });
    
    // 4. Redireciona baseado no cargo
    navigate(funcionario.tipo === "administrador" ? "/admin" : "/atendimento");

  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Falha no Login",
      description: error.message || "Erro ao conectar com o banco.",
    });
  }
};

  // FUNÇÃO DE SOLICITAR CADASTRO (ENVIA PARA O BANCO)
  const handleRequestAccess = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const { error } = await supabase
      .from('funcionarios')
      .insert([{ 
        nome, 
        sobrenome, 
        email_pessoal: emailPessoal, 
        tipo: role,
        email: `${nome.toLowerCase()}@atendcedro.com`, // Sugestão de e-mail corporativo
        senha: 'PENDENTE_CADASTRO' // Senha provisória até aprovação
      }]);

    if (error) throw error;

    toast({
      title: "Solicitação Enviada",
      description: "O administrador revisará seu acesso em breve.",
    });
    
    setActiveTab("adminlogin"); 
  } catch (error: any) {
    toast({ 
      variant: "destructive", 
      title: "Erro ao enviar solicitação",
      description: "E-mail já cadastrado ou erro no servidor."
    });
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a08] p-4 relative overflow-hidden">
      {/* BOTÃO VOLTAR */}
      <button onClick={() => navigate("/")} className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-[#22c55e] transition-all group">
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
              <TabsTrigger value="login" className="rounded-xl font-bold uppercase">Acessar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-bold uppercase">Solicitar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">E-mail Corporativo</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                      <Input 
                        required type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@admincedro.com" 
                        className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                      <Input 
                        required value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white" 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-600">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-white text-black font-black h-14 rounded-2xl uppercase italic">
                    Entrar no Painel
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRequestAccess} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input required placeholder="Nome" value={nome} onChange={(e)=>setNome(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                  <Input required placeholder="Sobrenome" value={sobrenome} onChange={(e)=>setSobrenome(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                </div>
                <Select required onValueChange={setRole}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Cargo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c120f] text-white">
                    <SelectItem value="atendente">Atendente</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <Input required type="email" placeholder="E-mail Pessoal" value={emailPessoal} onChange={(e)=>setEmailPessoal(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                <Button type="submit" className="w-full bg-[#22c55e] text-black font-black h-14 rounded-2xl uppercase italic gap-2">
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