import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PixResponse {
  id: number;
  copiaECola: string;
  qrCodeBase64: string;
  ticketUrl: string;
  valorPago: number;
  valorOriginal: number;
  desconto: number;
  valorRestante: number;
}

// Tabela de preços por duração e turno
const PRECOS: Record<number, { diurno: number; noturno: number }> = {
  30: { diurno: 50, noturno: 70 },
  60: { diurno: 100, noturno: 140 },
  90: { diurno: 150, noturno: 210 },
};

export function calcularPrecoReserva(duracaoMinutos: number, horaInicio: number): number {
  const turno = horaInicio >= 18 ? 'noturno' : 'diurno';
  const precos = PRECOS[duracaoMinutos];
  if (!precos) {
    // Fallback proporcional
    const base = turno === 'noturno' ? 140 : 100;
    return (base * duracaoMinutos) / 60;
  }
  return precos[turno];
}

export function usePixPayment() {
  const { toast } = useToast();
  const [isCarregandoPix, setIsCarregandoPix] = useState(false);
  const [pixData, setPixData] = useState<PixResponse | null>(null);

  const gerarPagamentoPix = async (
    valor: number,
    descricao: string,
    reservaId?: number,
    clienteId?: number,
    email?: string,
    tipoPagamento?: string
  ): Promise<PixResponse | null> => {
    setIsCarregandoPix(true);
    setPixData(null);

    try {
      const { data, error } = await supabase.functions.invoke('criar-pix', {
        body: {
          valor,
          descricao,
          reserva_id: reservaId,
          cliente_id: clienteId,
          email: email || 'cliente@arena.com',
          tipo_pagamento: tipoPagamento || 'integral',
        },
      });

      if (error) throw error;

      if (data?.id) {
        setPixData(data as PixResponse);
        return data as PixResponse;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (err: any) {
      console.error('Erro ao gerar PIX:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar PIX',
        description: err.message || 'Tente novamente.',
      });
      return null;
    } finally {
      setIsCarregandoPix(false);
    }
  };

  const limparPix = () => {
    setPixData(null);
  };

  return {
    isCarregandoPix,
    pixData,
    gerarPagamentoPix,
    limparPix,
  };
}
