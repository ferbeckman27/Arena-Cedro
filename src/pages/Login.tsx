import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Star } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

 const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      // Alteração Foto 2: Mensagem agora engloba Atendentes e Admin
      toast({
        title: "Login realizado!",
        description: "Bem-vindo! Acesso autorizado ao painel de reservas.",
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
        description: "Agora você já pode realizar suas reservas avulsas ou solicitar plano VIP.",
      });
      setActiveTab("login");
    }, 1000);
  };

  return (
    <AuthLayout 
      title={activeTab === "login" ? "Acesse sua Conta" : "Faça parte do Time"}
      subtitle={activeTab === "login" ? "Clientes, Atendentes e Admin" : "Cadastre-se para jogar na melhor arena da região"}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="register">Cadastrar</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="space-y-6">
          {/* ... (mantenha o formulário de login igual ao anterior) */}
          
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-3 mt-4 text-xs">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <p className="text-muted-foreground">Atendentes e Administradores: use suas credenciais corporativas para acessar o painel de vendas e relatórios.</p>
          </div>
        </TabsContent>

        <TabsContent value="register" className="space-y-6">
          {/* ... (mantenha o formulário de registro, mas adicione este aviso VIP abaixo do botão) */}
          <form onSubmit={handleRegister} className="space-y-4">
             {/* ... campos de nome, email, telefone, senha ... */}
             <Button type="submit" className="w-full gradient-primary glow-primary" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Criar conta"}
             </Button>
          </form>

          {/* Destaque para Cliente Especial/VIP (Solicitado na Foto 2) */}
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-accent">Seja Cliente VIP</h4>
              <p className="text-xs text-muted-foreground">Garanta seu horário fixo toda semana com descontos exclusivos.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-center text-sm text-muted-foreground">
        Ao continuar, você concorda com nossos{" "}
        <a href="#" className="text-primary hover:underline">Termos de Uso</a>
        {" "}e{" "}
        <a href="#" className="text-primary hover:underline">Política de Privacidade</a>.
      </p>
    </AuthLayout>
  );
};

export default Login;
