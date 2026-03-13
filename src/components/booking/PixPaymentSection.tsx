import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PixPaymentSectionProps {
  valorTotal: number;
  desconto: number;
  tipoReserva: "avulsa" | "fixa";
  pixChaveEstatica: string;
  pixData?: {
    qrCodeBase64: string;
    copiaECola: string;
    valorPago: number;
  } | null;
  isCarregando: boolean;
  onGerarPixIntegral: (valorOriginal: number) => void;
  onTimeout: () => void;
  onConfirmarPagamento: () => void;
  timeoutMinutos?: number;
}

export function PixPaymentSection({
  valorTotal,
  desconto,
  tipoReserva,
  pixChaveEstatica,
  pixData,
  isCarregando,
  onGerarPixIntegral,
  onTimeout,
  onConfirmarPagamento,
  timeoutMinutos = 8,
}: PixPaymentSectionProps) {
  const { toast } = useToast();
  const [modoPix, setModoPix] = useState<"livre" | "integral">("integral");
  const [pixGerado, setPixGerado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [timerAtivo, setTimerAtivo] = useState(false);

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
      // Pass the ORIGINAL value - the edge function applies the discount
      onGerarPixIntegral(valorTotal);
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
            <p className="text-[10px] font-black uppercase text-[#22c55e]">PIX Livre</p>
            <p className="text-[8px] text-gray-500 mt-1">QR sem valor pré-definido</p>
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
              Com desconto de R$ {desconto}
            </p>
          </button>
        </div>
      )}

      {/* Resumo de valores para integral */}
      {modoPix === "integral" && !pixGerado && (
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Valor original:</span>
            <span className="text-white font-bold">R$ {valorTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#22c55e]">
            <span className="font-bold">Desconto PIX {tipoReserva === "fixa" ? "(4 jogos x R$10)" : "online"}:</span>
            <span className="font-black">- R$ {desconto.toFixed(2)}</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between">
            <span className="text-gray-300 font-bold text-sm">Total a pagar:</span>
            <span className="text-[#22c55e] font-black text-xl italic">R$ {valorComDesconto.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Resumo para PIX Livre */}
      {modoPix === "livre" && !pixGerado && (
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Valor da reserva:</span>
            <span className="text-white font-bold">R$ {valorTotal.toFixed(2)}</span>
          </div>
          <p className="text-[9px] text-yellow-400 font-bold">⚠️ No PIX Livre você digita o valor manualmente no app do banco.</p>
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

      {/* PIX Livre - QR estático */}
      {modoPix === "livre" && pixGerado && (
        <div className="bg-black/60 rounded-[2rem] border border-[#22c55e]/20 p-6 flex flex-col items-center gap-4">
          <p className="text-xs font-black uppercase text-[#22c55e]">PIX Livre - Escaneie e digite o valor</p>
          <p className="text-lg font-black text-white">Valor da reserva: R$ {valorTotal.toFixed(2)}</p>
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG value={pixChaveEstatica || "pix@arenacedro.com"} size={200} />
          </div>
          <div className="w-full">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Chave PIX (Copia e Cola):</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={pixChaveEstatica || "pix@arenacedro.com"}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white truncate"
              />
              <Button
                size="sm"
                variant="outline"
                className="border-[#22c55e] text-[#22c55e] shrink-0"
                onClick={() => copiarTexto(pixChaveEstatica || "pix@arenacedro.com")}
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl w-full">
            <p className="text-[10px] text-yellow-300 font-bold text-center">
              <AlertTriangle size={12} className="inline mr-1" />
              Após o pagamento, envie o comprovante ao atendente para confirmar.
            </p>
          </div>
          <Button
            onClick={onConfirmarPagamento}
            className="w-full bg-[#22c55e] text-black font-black uppercase h-12 rounded-xl"
          >
            <CheckCircle2 size={16} className="mr-2" /> Já Paguei
          </Button>
        </div>
      )}

      {/* PIX Integral - QR do Mercado Pago */}
      {modoPix === "integral" && pixGerado && pixData && (
        <div className="bg-black/60 rounded-[2rem] border border-[#22c55e]/20 p-6 flex flex-col items-center gap-4">
          <p className="text-xs font-black uppercase text-[#22c55e]">
            PIX Integral - R$ {pixData.valorPago.toFixed(2)}
          </p>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5 w-full space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-500">Valor original:</span>
              <span className="text-white font-bold">R$ {valorTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-[#22c55e]">
              <span className="font-bold">Desconto aplicado:</span>
              <span className="font-black">- R$ {desconto.toFixed(2)}</span>
            </div>
            <div className="border-t border-white/10 pt-1 flex justify-between text-xs">
              <span className="text-gray-300 font-bold">Você paga:</span>
              <span className="text-[#22c55e] font-black text-lg">R$ {pixData.valorPago.toFixed(2)}</span>
            </div>
          </div>
          {pixData.qrCodeBase64 && (
            <img
              src={`data:image/png;base64,${pixData.qrCodeBase64}`}
              alt="QR Code PIX"
              className="w-48 h-48 rounded-xl bg-white p-2"
            />
          )}
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
                  className="border-[#22c55e] text-[#22c55e]"
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

      {/* Loading state for integral when waiting for MP response */}
      {modoPix === "integral" && pixGerado && !pixData && isCarregando && (
        <div className="bg-black/60 rounded-[2rem] border border-[#22c55e]/20 p-6 flex flex-col items-center gap-4">
          <p className="text-[#22c55e] font-black text-sm animate-pulse">⏳ Gerando QR Code do Mercado Pago...</p>
        </div>
      )}

      {/* Botão Gerar */}
      {!pixGerado && (
        <Button
          disabled={isCarregando}
          onClick={handleGerarPix}
          className="w-full bg-[#22c55e] text-black font-black uppercase h-14 rounded-2xl"
        >
          {isCarregando
            ? "Processando..."
            : modoPix === "livre"
            ? `Gerar QR Code Livre (R$ ${valorTotal.toFixed(2)})`
            : `Gerar PIX - R$ ${valorComDesconto.toFixed(2)}`}
        </Button>
      )}
    </div>
  );
}
