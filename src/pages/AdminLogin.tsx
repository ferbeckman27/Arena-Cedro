import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, EyeOff, Lock, Mail, User, ShieldCheck, Phone, Send } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [role, setRole] = useState<string>("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a08] p-4 relative overflow-hidden">
      {/* Background Hero */}
      <div className="absolute inset-0 z-0">
        <img src={heroArena} className="w-full h-full object-cover opacity-20" alt="Arena Background" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a08] via-[#060a08]/50 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8 space-y-2">
          <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-primary/30">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">Portal Corporativo</h1>
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Administração & Atendimento</p>
        </div>

        <div className="bg-[#0c120f] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl font-bold uppercase data-[state=active]:bg-white data-[state=active]:text-black">Acessar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-black">Solicitar Acesso</TabsTrigger>
            </TabsList>

            {/* ABA DE LOGIN (Acesso por e-mail corporativo) */}
            <TabsContent value="login" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">E-mail Corporativo (@admin ou @atend)</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                    <Input placeholder="usuario@admincedro.com" className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Senha de Acesso</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-600" />
                    <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-600">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Checkbox id="remember-admin" className="border-white/20" />
                  <label htmlFor="remember-admin" className="text-sm text-gray-500 cursor-pointer">Lembrar credenciais neste dispositivo</label>
                </div>

                <Button className="w-full bg-white hover:bg-gray-200 text-black font-black h-14 rounded-2xl text-lg uppercase italic">
                  Entrar no Painel
                </Button>
              </div>
            </TabsContent>

            {/* ABA DE SOLICITAÇÃO DE CADASTRO */}
            <TabsContent value="register" className="space-y-5">
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-4">
                <p className="text-[11px] text-primary leading-tight font-medium">
                  Seus dados serão analisados. Se aprovado, você receberá seu **E-mail Corporativo** e **Senha Temporária** no seu e-mail pessoal.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nome" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                <Input placeholder="Sobrenome" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Cargo Desejado</Label>
                <Select onValueChange={setRole}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white">
                    <SelectValue placeholder="Selecione sua função" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0c120f] border-white/10 text-white">
                    <SelectItem value="atendente">Atendente (@atendcedro.com)</SelectItem>
                    <SelectItem value="admin">Administrador (@admincedro.com)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">E-mail Pessoal (Para receber a senha)</Label>
                <Input type="email" placeholder="seuemail@gmail.com" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 text-[10px] font-bold uppercase ml-1">Telefone / WhatsApp</Label>
                <Input placeholder="(98) 99999-0000" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-black font-black h-14 rounded-2xl text-lg uppercase italic gap-2 transition-transform active:scale-95">
                <Send size={20} /> Solicitar Cadastro
              </Button>
            </TabsContent>
          </Tabs>

          {/* TERMOS CORPORATIVOS */}
          <div className="mt-8 text-center">
             <Dialog>
                <DialogTrigger className="text-[10px] text-gray-600 uppercase tracking-widest hover:text-primary transition-colors">
                  Políticas de Acesso e Dados Corporativos
                </DialogTrigger>
                <DialogContent className="bg-[#0c120f] border-white/10 text-white rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-primary uppercase italic font-black">Termos de Uso Interno</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-xs text-gray-400 py-4 leading-relaxed">
                    <p>1. O acesso ao sistema é restrito a funcionários autorizados da Arena Cedro.</p>
                    <p>2. Todas as ações realizadas com seu e-mail corporativo (@admincedro ou @atendcedro) são monitoradas e registradas.</p>
                    <p>3. Os dados dos clientes acessados neste painel são confidenciais e protegidos pela LGPD.</p>
                    <p>4. O compartilhamento de senhas resultará em suspensão imediata do acesso.</p>
                  </div>
                </DialogContent>
             </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;