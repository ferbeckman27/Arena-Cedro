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

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [regPassword, setRegPassword] = useState("");

  // ESTA É A LÓGICA QUE ESTÁ FALTANDO NO SEU ARQUIVO E CAUSA O ERRO VERMELHO
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
      {/* Fundo com a foto da Arena */}
      <div className="absolute inset-0 z-0">
        <img src={heroArena} className="w-full h-full object-cover opacity-30" alt="Arena Background" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#060a08] via-transparent to-[#060a08]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <img src="/logo-arena.png" alt="Arena Cedro" className="w-32 h-32 md:w-40 md:h-40 object-contain" />
        </div>

        <div className="bg-black/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 p-1 rounded-2xl h-14">
              <TabsTrigger value="login" className="rounded-xl font-black uppercase italic data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-black uppercase italic data-[state=active]:bg-[#22c55e] data-[state=active]:text-black">Cadastrar</TabsTrigger>
            </TabsList>

            {/* ABA DE LOGIN - LIMPA (Sem texto de Admin) */}
            <TabsContent value="login" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white ml-1 uppercase text-[10px] font-bold tracking-widest">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <Input type="email" placeholder="seu@email.com" className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white focus:border-[#22c55e]" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white ml-1 uppercase text-[10px] font-bold tracking-widest">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white focus:border-[#22c55e]" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-500 hover:text-white">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Checkbox id="remember" className="border-white/20 data-[state=checked]:bg-[#22c55e] data-[state=checked]:text-black" />
                  <label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer select-none">
                    Salvar senha para não precisar logar novamente
                  </label>
                </div>

                <Button className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black h-14 rounded-2xl text-xl uppercase italic shadow-lg shadow-[#22c55e]/20">
                  Entrar no Sistema
                </Button>
              </div>
            </TabsContent>

            {/* ABA DE CADASTRO - COM VALIDAÇÃO E OLHINHO */}
            <TabsContent value="register" className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nome" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                <Input placeholder="Sobrenome" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
              </div>
              <Input placeholder="WhatsApp" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
              <Input type="email" placeholder="E-mail" className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
              
              <div className="space-y-2">
                <div className="relative">
                  <Input 
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

                {/* CHECKLIST QUE ESTAVA VERMELHO NO SEU PRINT */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-[11px]">
                    {passwordValidations.hasMinLength ? <CheckCircle2 className="w-4 h-4 text-[#22c55e]" /> : <Circle className="w-4 h-4 text-gray-600" />}
                    <span className={passwordValidations.hasMinLength ? "text-white" : "text-gray-500"}>Mínimo de 8 caracteres</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    {passwordValidations.hasSpecialChar ? <CheckCircle2 className="w-4 h-4 text-[#22c55e]" /> : <Circle className="w-4 h-4 text-gray-600" />}
                    <span className={passwordValidations.hasSpecialChar ? "text-white" : "text-gray-500"}>Um caractere especial (@, #, !, $)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    {passwordValidations.noRepeatedNumbers ? <CheckCircle2 className="w-4 h-4 text-[#22c55e]" /> : <Circle className="w-4 h-4 text-gray-600" />}
                    <span className={passwordValidations.noRepeatedNumbers ? "text-white" : "text-gray-500"}>Sem números repetidos</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black h-14 rounded-2xl text-xl uppercase italic disabled:opacity-30"
                disabled={!passwordValidations.isValid}
              >
                Finalizar Cadastro
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <p className="text-[11px] text-gray-500 uppercase tracking-widest">
              Ao continuar, você aceita nossos{" "}
              <Dialog>
                <DialogTrigger className="text-[#22c55e] hover:underline font-bold">Termos de Uso</DialogTrigger>
                <DialogContent className="bg-[#0a0f0d] border-white/10 text-white rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="text-[#22c55e] uppercase italic font-black">Termos de Privacidade</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-gray-400 p-4">Seus dados são protegidos pela LGPD e usados apenas para seus agendamentos na Arena Cedro.</p>
                </DialogContent>
              </Dialog>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;