---
name: Sales & Rentals
description: Product sales/rentals — both attached to bookings AND direct counter sales without a booking
type: feature
---
Produtos podem ser vendidos/alugados de duas formas:

1. **Anexados à reserva** (carrinho `itensCarrinho` na criação da reserva).
2. **Venda direta de balcão** (carrinho `vendaDiretaCarrinho` na aba **Produtos** do AtendenteDashboard):
   - Cada item escolhe modo `venda` ou `aluguel` via botões `+ Vender` / `+ Alugar`.
   - Suporta ajuste de quantidade (+/−) e remoção (lixeira).
   - Ao finalizar, cria uma `reservas` com `tipo='venda_direta'`, `data_reserva=hoje`, `horario_inicio=hora_atual`, `duracao=0`, `status='confirmada'`, `pago=false`.
   - Itens vão para `itens_reserva` com tipo correspondente.
   - Estoque é decrementado imediatamente para venda E aluguel.
   - Aparece no **Financeiro** do dia para baixa via "Dar Baixa" (PIX/dinheiro).
   - Aluguéis pendentes mostram botão "📦 Devolver ao Estoque" no Financeiro, que chama RPC `devolver_estoque_aluguel` (incrementa estoque + marca itens como `pago=true`).

Label no Financeiro: reservas com `tipo='venda_direta'` aparecem como "🛒 Venda Direta" em vez do horário.

## Pacote 4 jogos — regra de desconto e datas
- Desconto de R$40 (R$10 por jogo) **só** se aplica quando o método é **PIX** ou **Dinheiro** (pagamento antecipado/no ato).
- **"Antes do jogo"** (pagamento na hora) e **"Fidelidade"** **NÃO** recebem desconto: cobra o valor cheio do pacote.
- Cálculo em `handleAgendar` e UI de resumo usam `aplicaDescontoPacote = tipo === 'pacote' && (metodo === 'pix' || metodo === 'dinheiro')`.
- **Datas dos 4 jogos**: ao criar pacote, o sistema insere **4 registros** em `reservas`, um para cada mês (mesmo dia/horário): mês atual, +1, +2, +3. Cada registro recebe `valor_total = totalGeral/4` e observação `Pacote 4 jogos - Jogo N/4 [PACOTE-{timestamp}]` para vincular as 4. Isso garante que os 4 horários ficam reservados/visíveis no calendário em cada mês.
