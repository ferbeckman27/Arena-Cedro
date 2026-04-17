DELETE FROM public.pagamentos WHERE id = 51;

UPDATE public.reservas
SET valor_total = 140,
    valor_pago_sinal = 115,
    valor_restante = 25,
    pago = false,
    status = 'pendente',
    data_pagamento = NULL
WHERE id = 65;