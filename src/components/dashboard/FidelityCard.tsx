import { Trophy, CircleCheck, Circle } from "lucide-react";

export const FidelityCard = ({ gamesPlayed = 0 }) => {
  const totalSlots = 10;
  
  return (
    <div className="glass-card p-6 rounded-2xl border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Trophy className="text-yellow-500 w-5 h-5" />
          Cartão Fidelidade Arena
        </h3>
        <span className="text-sm font-medium text-primary">{gamesPlayed}/10</span>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: totalSlots }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            {i < gamesPlayed ? (
              <CircleCheck className="w-8 h-8 text-green-500 fill-green-500/20" />
            ) : (
              <Circle className="w-8 h-8 text-muted-foreground/30" />
            )}
            <span className="text-[10px] text-muted-foreground">{i + 1}º</span>
          </div>
        ))}
      </div>
      
      {gamesPlayed >= 10 ? (
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