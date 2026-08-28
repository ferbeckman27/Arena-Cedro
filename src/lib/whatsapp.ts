// Utilidades de confirmação de reserva via WhatsApp (links wa.me)

export const ARENA_WHATSAPP = "5598999910535";

export interface ReservaWhatsApp {
  clienteNome: string;
  clienteTelefone?: string | null;
  data: string; // dd/MM/yyyy
  horario: string;
  horarioFim?: string;
  duracao?: number;
  tipo?: string;
  valorTotal: number;
  valorPago?: number;
  formaPagamento?: string;
  status?: string;
  itens?: { nome: string; quantidade: number; tipo: string }[];
  observacoes?: string;
  reservaId?: number | null;
}

const nl = "%0A";

function linha(label: string, valor?: string | number | null) {
  if (valor === undefined || valor === null || valor === "") return "";
  return `${label} ${valor}${nl}`;
}

/** Monta a mensagem completa da reserva (já URL-encoded para wa.me). */
export function montarMensagemReserva(r: ReservaWhatsApp, destino: "cliente" | "arena"): string {
  const titulo =
    destino === "cliente"
      ? `*ARENA CEDRO — RESERVA CONFIRMADA* ⚽${nl}${nl}`
      : `*NOVO AGENDAMENTO — ARENA CEDRO* ⚽${nl}${nl}`;

  const itensTexto = (r.itens || [])
    .map((i) => `• ${i.quantidade}x ${i.nome} (${i.tipo === "aluguel" ? "aluguel" : "venda"})`)
    .join(nl);

  const restante = Math.max(r.valorTotal - (r.valorPago || 0), 0);

  const corpo =
    titulo +
    linha("👤 *Cliente:*", r.clienteNome) +
    (destino === "arena" ? linha("📱 *Telefone:*", r.clienteTelefone || "não informado") : "") +
    linha("📅 *Data:*", r.data) +
    linha("⏰ *Horário:*", r.horarioFim ? `${r.horario} às ${r.horarioFim}` : r.horario) +
    linha("⏱️ *Duração:*", r.duracao ? `${r.duracao} min` : null) +
    linha("📋 *Tipo:*", r.tipo) +
    linha("💰 *Valor total:*", `R$ ${r.valorTotal.toFixed(2)}`) +
    (r.valorPago ? linha("✅ *Pago:*", `R$ ${r.valorPago.toFixed(2)}`) : "") +
    (r.valorPago && restante > 0 ? linha("⚠️ *Restante na arena:*", `R$ ${restante.toFixed(2)}`) : "") +
    linha("💳 *Pagamento:*", r.formaPagamento) +
    linha("🔖 *Status:*", r.status) +
    (r.reservaId ? linha("🧾 *Reserva nº*", r.reservaId) : "") +
    (itensTexto ? `${nl}🛒 *Itens:*${nl}${itensTexto}${nl}` : "") +
    linha("📝 *Obs.:*", r.observacoes);

  const rodape =
    destino === "cliente"
      ? `${nl}Cancelamento/remarcação: até 24h antes, pelo WhatsApp (98) 99991-0535.${nl}📖 Regras: ${window.location.origin}/regras-arena.pdf`
      : `${nl}Confirmação automática gerada pelo sistema.`;

  return corpo + rodape;
}

function abrir(numero: string, texto: string) {
  window.open(`https://wa.me/${numero}?text=${texto}`, "_blank", "noopener,noreferrer");
}

/** Abre o WhatsApp do cliente com a confirmação. */
export function enviarConfirmacaoCliente(r: ReservaWhatsApp) {
  const tel = (r.clienteTelefone || "").replace(/\D/g, "");
  if (!tel) return false;
  const numero = tel.startsWith("55") ? tel : `55${tel}`;
  abrir(numero, montarMensagemReserva(r, "cliente"));
  return true;
}

/** Abre o WhatsApp da arena com os dados do agendamento. */
export function enviarConfirmacaoArena(r: ReservaWhatsApp) {
  abrir(ARENA_WHATSAPP, montarMensagemReserva(r, "arena"));
  return true;
}

/**
 * Dispara as duas confirmações (cliente e arena).
 * A segunda abertura é adiada para evitar bloqueio de pop-up.
 */
export function enviarConfirmacoesReserva(r: ReservaWhatsApp) {
  const enviouCliente = enviarConfirmacaoCliente(r);
  window.setTimeout(() => enviarConfirmacaoArena(r), enviouCliente ? 800 : 0);
  return enviouCliente;
}
