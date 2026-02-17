import { Trophy, CircleCheck, Circle, } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const FidelityCard = ({ count }: { count: number }) => {

  const totalSlots = 10;
  
  return (
    // Adicionei border-white/10 e bg-white/5 para combinar com o resto do sistema
    <div className="p-6 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black italic uppercase tracking-tighter text-[#22c55e] flex items-center gap-2">
          <Trophy className={count >= 10 ? "text-yellow-500 animate-bounce" : "text-gray-500"} />
          Cartão Fidelidade
        </h3>
        <Badge variant="outline" className="border-[#22c55e] text-[#22c55e] font-bold">
          {count}/10
        </Badge>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: totalSlots }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            {i < count ? (
              <CircleCheck className="w-8 h-8 text-green-500 fill-green-500/20" />
            ) : (
              <Circle className="w-8 h-8 text-muted-foreground/30" />
            )}
            <span className="text-[10px] text-muted-foreground">{i + 1}º</span>
          </div>
        ))}
      </div>
      
      {count >= 10 ? (
        <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center">
          <p className="text-green-400 font-bold text-sm">🎉 Parabéns! Próximo jogo é GRÁTIS!</p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Complete 10 jogos e o 11º é por nossa conta!
        </p>
      )}
    </div>
  );
};