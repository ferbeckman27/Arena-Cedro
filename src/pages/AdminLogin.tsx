import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, UserPlus, ArrowLeft } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";
import { supabase } from '@/lib/supabase';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  
  // Estados para Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Estados para Cadastro (Operado pelo Admin)
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [role, setRole] = useState<string>("");
  const [telefone, setTelefone] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  // --- VALIDAÇÃO DE SENHA ---
  const validarSenha = (senha: string) => {
    if (senha.length !== 8) return "A senha deve ter exatamente 8 caracteres.";
    if (!/[a-zA-Z]/.test(senha)) return "A senha deve conter letras.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) return "A senha deve conter caracteres especiais.";

    const numerosEncontrados = senha.match(/\d/g);
    if (!numerosEncontrados) return "A senha deve conter pelo menos um número.";

    const temRepetido = numerosEncontrados.some((num, idx) => numerosEncontrados.indexOf(num) !== idx);
    if (temRepetido) return "Os números na senha não podem ser repetidos.";

    return null;
  };

  // --- FUNÇÃO DE LOGIN ---
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw new Error("Credenciais corporativas inválidas.");

      const userEmail = data.user?.email || "";
      
      toast({ title: "Bem-vindo!", description: "Acesso autorizado." });
      
      if (userEmail.endsWith('@admincedro.com')) {
        navigate("/admindashboard");
      } else {
        navigate("/atendentedashboard");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Falha no Login", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÃO DE CADASTRO (Cria no Auth e na Tabela Funcionarios) ---
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const erroSenha = validarSenha(novaSenha);
    if (erroSenha) {
      toast({ variant: "destructive", title: "Senha Inválida", description: erroSenha });
      return;
    }

    setLoading(true);
    try {
      // 1. Gera o e-mail automático
      const sufixo = role === "administrador" ? "@admincedro.com" : "@atendcedro.com";
      const emailGerado = `${nome.toLowerCase()}${sobrenome.toLowerCase()}${sufixo}`;

      // 2. Cria o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailGerado,
        password: novaSenha,
      });

      if (authError) throw authError;

      // 3. Salva os dados na sua tabela 'funcionarios' usando o UUID gerado
      if (authData.user) {
        const { error: dbError } = await supabase
          .from('funcionarios')
          .insert([{
            id: authData.user.id, // Liga o perfil ao Auth
            nome,
            sobrenome,
            email_corporativo: emailGerado,
            telefone,
            tipo: role
          }]);

        if (dbError) throw dbError;
      }

      toast({
        title: "Sucesso!",
        description: `Funcionário ${nome} cadastrado como ${role}.`,
      });
      
      // Limpeza
      setNome(""); setSobrenome(""); setNovaSenha(""); setTelefone("");
      setActiveTab("login");

    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro no Cadastro", description: error.message });
    } finally {
      setLoading(false);
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
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Cedro Arena</p>
        </div>

        <div className="bg-[#0c120f] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl font-bold uppercase tracking-widest">Acessar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Novo Funcionário</TabsTrigger>
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

                  <Button disabled={loading} type="submit" className="w-full bg-[#22c55e] hover:bg-[#1bb054] text-black font-black h-14 rounded-2xl uppercase italic transition-all">
                    {loading ? "Autenticando..." : "Entrar no Sistema"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input required placeholder="Nome" value={nome} onChange={(e)=>setNome(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 rounded-xl" />
                  <Input required placeholder="Sobrenome" value={sobrenome} onChange={(e)=>setSobrenome(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 rounded-xl" />
                </div>
                
                <Input required placeholder="Telefone" value={telefone} onChange={(e)=>setTelefone(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 rounded-xl" />
                
                <Select required onValueChange={setRole}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                    <SelectValue placeholder="Tipo de Acesso" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c120f] text-white border-white/10">
                    <SelectItem value="atendente">Atendente (@atendcedro.com)</SelectItem>
                    <SelectItem value="administrador">Administrador (@admincedro.com)</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-1">
                  <Input 
                    required 
                    type="password"
                    placeholder="Definir Senha (8 caracteres)" 
                    value={novaSenha} 
                    onChange={(e)=>setNovaSenha(e.target.value)} 
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl" 
                  />
                  <p className="text-[9px] text-[#22c55e] uppercase px-1 font-bold italic">Regra: 8 dígitos, símbolos e s/ números repetidos.</p>
                </div>

                <Button disabled={loading} type="submit" className="w-full bg-white text-black font-black h-14 rounded-2xl uppercase italic gap-2 hover:bg-gray-200">
                  <UserPlus size={20} /> {loading ? "Cadastrando..." : "Cadastrar Funcionário"}
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