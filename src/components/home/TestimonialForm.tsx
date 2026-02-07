import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, ArrowLeft } from "lucide-react";

const TestimonialForm = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);

  return (
    <div className="min-h-screen bg-[#060a08] text-white p-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-md">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Voltar para o início
        </button>

        <h1 className="text-4xl font-black uppercase italic mb-2 tracking-tighter">Sua Opinião</h1>
        <p className="text-gray-400 mb-8 font-medium">Conte para outros atletas como foi sua experiência na Arena Cedro.</p>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-primary">Nome Completo</label>
            <Input className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-[#22c55e] text-lg" placeholder="Seu nome" />
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-primary">Avaliação (1 a 5 estrelas)</label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={`w-10 h-10 cursor-pointer transition-all ${rating >= s ? "fill-[#facc15] text-[#facc15] scale-110" : "text-gray-700 hover:text-gray-500"}`} 
                  onClick={() => setRating(s)} 
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-primary">Seu Comentário</label>
            <Textarea className="bg-white/5 border-white/10 rounded-2xl min-h-[120px] text-lg" placeholder="O que achou do gramado, iluminação e atendimento?" />
          </div>

          <Button 
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black h-16 rounded-2xl text-xl uppercase italic shadow-lg shadow-[#22c55e]/10" 
            onClick={() => {
              alert("Obrigado pelo seu depoimento!");
              navigate("/");
            }}
          >
            Publicar Depoimento
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialForm;
