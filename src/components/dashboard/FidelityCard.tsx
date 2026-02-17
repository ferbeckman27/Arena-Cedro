import { Trophy, CircleCheck, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const FidelityCard = ({ count }: { count: number }) => {
  const totalSlots = 10;
  const ganhouBonus = count >= 10;
  
  return (
    <div className="p-8 rounded-[2.5rem] border border-[#22c55e]/20 bg-gradient-to-br from-[#111614] to-black backdrop-blur-sm shadow-2xl relative overflow-hidden group">
      {/* Brilho de fundo quando ganha */}
      {ganhouBonus && (
        <div className="absolute inset-0 bg-[#22c55e]/5 animate-pulse pointer-events-none" />
      )}

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="font-black italic uppercase tracking-tighter text-white flex items-center gap-2 text-lg">
            <Trophy className={cn("transition-all duration-500", ganhouBonus ? "text-[#22c55e] scale-125" : "text-gray-600")} />
            Fidelidade <span className="text-[#22c55e]">Arena</span>
          </h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            {ganhouBonus ? "Recompensa disponível!" : `Faltam ${10 - count} partidas para o prêmio`}
          </p>
        </div>
        <Badge className="bg-[#22c55e] text-black font-black px-3 py-1 rounded-full">
          {count}/10
        </Badge>
      </div>
      
      <div className="grid grid-cols-5 md:grid-cols-10 gap-3 relative z-10">
        {Array.from({ length: totalSlots }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500",
              i < count 
                ? "bg-[#22c55e] border-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                : "border-white/5 bg-white/5"
            )}>
              {i < count ? (
                <CircleCheck className="w-6 h-6 text-black" />
              ) : (
                <Circle className="w-6 h-6 text-white/10" />
              )}
            </div>
            <span className="text-[9px] text-gray-600 font-black">{i + 1}º</span>
          </div>
        ))}
      </div>
      
      {ganhouBonus ? (
        <div className="mt-8 p-4 bg-[#22c55e] rounded-2xl text-center animate-bounce shadow-xl shadow-[#22c55e]/20">
          <p className="text-black font-black text-sm uppercase italic">🎉 PARABÉNS! O PRÓXIMO JOGO É GRÁTIS!</p>
          <p className="text-black/70 text-[9px] font-bold uppercase mt-1">
            Resgate disponível: Seg a Sex (08h às 17h). O contador será resetado após o uso.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
           <div className="h-[1px] w-full bg-white/5"></div>
           <p className="text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">Arena Cedro Club</p>
           <div className="h-[1px] w-full bg-white/5"></div>
        </div>
      )}
    </div>
  );
};