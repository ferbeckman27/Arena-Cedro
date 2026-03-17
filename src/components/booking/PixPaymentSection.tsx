import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PixPaymentSectionProps {
  valorTotal: number;
  desconto: number;
  tipoReserva: "avulsa" | "pacote";
  pixChaveEstatica: string;
  pixData?: {
    qrCodeBase64: string;
    copiaECola: string;
    valorPago: number;
    valorOriginal?: number;
    desconto?: number;
  } | null;
  isCarregando: boolean;
  onGerarPixIntegral: (valorOriginal: number, descontoValor: number) => void;
  onGerarPixLivre: (valorDigitado: number) => void;
  onTimeout: () => void;
  onConfirmarPagamento: () => void;
  timeoutMinutos?: number;
  quantidadeJogos?: number;
}

export function PixPaymentSection({
  valorTotal,
  desconto,
  tipoReserva,
  pixChaveEstatica,
  pixData,
  isCarregando,
  onGerarPixIntegral,
  onGerarPixLivre,
  onTimeout,
  onConfirmarPagamento,
  timeoutMinutos = 8,
  quantidadeJogos = 1,
}: PixPaymentSectionProps) {
  const { toast } = useToast();
  const [modoPix, setModoPix] = useState<"livre" | "integral">(tipoReserva === "pacote" ? "integral" : "livre");
  const [pixGerado, setPixGerado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [timerAtivo, setTimerAtivo] = useState(false);
  const [valorLivre, setValorLivre] = useState("");

  const valorComDesconto = Math.max(valorTotal - desconto, 0);

  useEffect(() => {
    if (!timerAtivo || tempoRestante <= 0) return;
    const interval = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          setTimerAtivo(false);
          onTimeout();
          toast({
            variant: "destructive",
            title: "⏰ Tempo Esgotado!",
            description: "O pagamento PIX expirou. O horário foi liberado.",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerAtivo, tempoRestante, onTimeout, toast]);

  const iniciarTimer = useCallback(() => {
    setTempoRestante(timeoutMinutos * 60);
    setTimerAtivo(true);
  }, [timeoutMinutos]);

  const handleGerarPix = () => {
    if (modoPix === "integral") {
      onGerarPixIntegral(valorTotal, desconto);
    } else {
      const val = parseFloat(valorLivre);
      if (!val || val <= 0) {
        toast({ variant: "destructive", title: "Digite um valor válido para adiantar." });
        return;
      }
      if (val > valorTotal) {
        toast({ variant: "destructive", title: "Valor não pode ser maior que o total da reserva." });
        return;
      }
      onGerarPixLivre(val);
    }
    setPixGerado(true);
    iniciarTimer();
  };

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
  };

  const copiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast({ title: "✅ Copiado para a área de transferência!" });
  };

  return (
    <div className="space-y-4">
      {/* Seletor de Modo PIX */}
      {!pixGerado && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setModoPix("livre")}
            className={cn(
              "p-4 rounded-2xl border-2 text-center transition-all",
              modoPix === "livre"
                ? "border-[#22c55e] bg-[#22c55e]/10"
                : "border-white/5 hover:border-white/20"
            )}
          >
            <p className="text-[10px] font-black uppercase text-[#22c55e]">PIX Adiantamento</p>
            <p className="text-[8px] text-gray-500 mt-1">Você escolhe o valor a adiantar</p>
          </button>
          <button
            onClick={() => setModoPix("integral")}
            className={cn(
              "p-4 rounded-2xl border-2 text-center transition-all",
              modoPix === "integral"
                ? "border-[#22c55e] bg-[#22c55e]/10"
                : "border-white/5 hover:border-white/20"
            )}
          >
            <p className="text-[10px] font-black uppercase text-[#22c55e]">PIX Integral</p>
            <p className="text-[8px] text-gray-500 mt-1">
              Com desconto de R$ {desconto.toFixed(0)}
            </p>
          </button>
        </div>
      )}

      {/* Resumo PIX Integral */}
      {modoPix === "integral" && !pixGerado && (
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Valor original:</span>
            <span className="text-white font-bold">R$ {valorTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#22c55e]">
            <span className="font-bold">
              Desconto PIX {tipoReserva === "pacote" ? `(${quantidadeJogos} jogos x R$10)` : "online"}:
            </span>
            <span className="font-black">- R$ {desconto.toFixed(2)}</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between">
            <span className="text-gray-300 font-bold text-sm">Total a pagar:</span>
            <span className="text-[#22c55e] font-black text-xl italic">R$ {valorComDesconto.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Resumo PIX Livre / Adiantamento */}
      {modoPix === "livre" && !pixGerado && (
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Valor total da reserva:</span>
            <span className="text-white font-bold">R$ {valorTotal.toFixed(2)}</span>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-500 mb-1 block">
              Quanto deseja adiantar? (R$)
            </label>
            <Input
              type="number"
              min="1"
              max={valorTotal}
              step="0.01"
              placeholder="Ex: 50.00"
              value={valorLivre}
              onChange={(e) => setValorLivre(e.target.value)}
              className="bg-white/5 border-white/10 text-white h-14 rounded-xl text-lg font-black text-center"
            />
          </div>
          {valorLivre && parseFloat(valorLivre) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-yellow-400 font-bold">Restante (pagar na arena):</span>
              <span className="text-yellow-400 font-black">
                R$ {Math.max(valorTotal - parseFloat(valorLivre), 0).toFixed(2)}
              </span>
            </div>
          )}
          <p className="text-[9px] text-yellow-400 font-bold">
            ⚠️ O valor restante deverá ser pago no caixa da arena antes do jogo.
          </p>
        </div>
      )}

      {/* Timer */}
      {timerAtivo && tempoRestante > 0 && (
        <div className={cn(
          "flex items-center justify-center gap-3 p-3 rounded-2xl border",
          tempoRestante < 120
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
        )}>
          <Clock size={18} />
          <span className="font-black text-lg">{formatarTempo(tempoRestante)}</span>
          <span className="text-[10px] font-bold uppercase">para confirmar</span>
        </div>
      )}

      {/* QR Code do Mercado Pago */}
      {pixGerado && pixData && (
        <div className="bg-black/60 rounded-[2rem] border border-[#22c55e]/20 p-6 flex flex-col items-center gap-4">
          <p className="text-xs font-black uppercase text-[#22c55e]">
            {modoPix === "integral"
              ? `PIX Integral — R$ ${pixData.valorPago.toFixed(2)}`
              : `PIX Adiantamento — R$ ${pixData.valorPago.toFixed(2)}`}
          </p>

          {/* Resumo de valores */}
          <div className="bg-black/40 p-3 rounded-xl border border-white/5 w-full space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-500">Valor original:</span>
              <span className="text-white font-bold">R$ {(pixData.valorOriginal || valorTotal).toFixed(2)}</span>
            </div>
            {(pixData.desconto || 0) > 0 && (
              <div className="flex justify-between text-[10px] text-[#22c55e]">
                <span className="font-bold">Desconto aplicado:</span>
                <span className="font-black">- R$ {(pixData.desconto || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-1 flex justify-between text-xs">
              <span className="text-gray-300 font-bold">Valor do PIX:</span>
              <span className="text-[#22c55e] font-black text-lg">R$ {pixData.valorPago.toFixed(2)}</span>
            </div>
            {modoPix === "livre" && (
              <div className="flex justify-between text-[10px] text-yellow-400">
                <span className="font-bold">Restante (pagar na arena):</span>
                <span className="font-black">R$ {Math.max((pixData.valorOriginal || valorTotal) - pixData.valorPago, 0).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* QR Code Image */}
          {pixData.qrCodeBase64 && (
            <img
              src={`data:image/png;base64,${pixData.qrCodeBase64}`}
              alt="QR Code PIX"
              className="w-48 h-48 rounded-xl bg-white p-2"
            />
          )}

          {/* Copia e Cola */}
          {pixData.copiaECola && (
            <div className="w-full">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Copia e Cola:</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={pixData.copiaECola}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white truncate"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#22c55e] text-[#22c55e] shrink-0"
                  onClick={() => copiarTexto(pixData.copiaECola)}
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* Loading state when pixData hasn't arrived yet */}
          {!pixData.qrCodeBase64 && !pixData.copiaECola && (
            <p className="text-yellow-400 text-xs font-bold animate-pulse">Gerando QR Code...</p>
          )}

          <Button
            onClick={onConfirmarPagamento}
            className="w-full bg-[#22c55e] text-black font-black uppercase h-12 rounded-xl"
          >
            <CheckCircle2 size={16} className="mr-2" /> Já Paguei ✅
          </Button>
        </div>
      )}

      {/* Loading state */}
      {pixGerado && !pixData && isCarregando && (
        <div className="bg-black/60 rounded-[2rem] border border-[#22c55e]/20 p-6 flex flex-col items-center gap-4">
          <p className="text-[#22c55e] font-black text-sm animate-pulse">⏳ Gerando QR Code...</p>
        </div>
      )}

      {/* Error state */}
      {pixGerado && !pixData && !isCarregando && (
        <div className="bg-black/60 rounded-[2rem] border border-red-500/20 p-6 flex flex-col items-center gap-4">
          <p className="text-red-400 font-black text-sm">❌ Erro ao gerar PIX. Tente novamente.</p>
          <Button onClick={() => setPixGerado(false)} variant="outline" className="border-red-500/20 text-red-400 rounded-xl">
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Botão Gerar */}
      {!pixGerado && (
        <Button
          disabled={isCarregando || (modoPix === "livre" && (!valorLivre || parseFloat(valorLivre) <= 0))}
          onClick={handleGerarPix}
          className="w-full bg-[#22c55e] text-black font-black uppercase h-14 rounded-2xl"
        >
          {isCarregando
            ? "Processando..."
            : modoPix === "livre"
            ? `Gerar PIX — R$ ${valorLivre ? parseFloat(valorLivre).toFixed(2) : "0.00"}`
            : `Gerar PIX Integral — R$ ${valorComDesconto.toFixed(2)}`}
        </Button>
      )}
    </div>
  );
}
