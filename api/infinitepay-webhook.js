const { createClient } = require("@supabase/supabase-js");

function isValidWebhookSecret(req) {
  const possibleSecrets = [
    req.headers["x-webhook-secret"],
    req.headers["x-infinitepay-secret"],
    req.headers["x-signature"],
    req.headers["authorization"]
  ].filter(Boolean);

  if (!process.env.INFINITEPAY_WEBHOOK_SECRET) {
    return false;
  }

  return possibleSecrets.some(value => {
    const normalized = String(value).replace(/^Bearer\s+/i, "").trim();
    return normalized === process.env.INFINITEPAY_WEBHOOK_SECRET;
  });
}

function normalizeStatus(value) {
  const status = String(value || "").toLowerCase().trim();

  if ([
    "paid",
    "approved",
    "completed",
    "success",
    "succeeded",
    "confirmed"
  ].includes(status)) return "pago";

  if ([
    "pending",
    "waiting_payment",
    "waiting",
    "processing",
    "in_process"
  ].includes(status)) return "pendente";

  if ([
    "cancelled",
    "canceled",
    "failed",
    "refused",
    "expired",
    "chargeback"
  ].includes(status)) return "falhou";

  return status || "desconhecido";
}

function pick(obj, paths) {
  for (const path of paths) {
    const parts = path.split(".");
    let current = obj;

    for (const part of parts) {
      if (current && Object.prototype.hasOwnProperty.call(current, part)) {
        current = current[part];
      } else {
        current = undefined;
        break;
      }
    }

    if (current !== undefined && current !== null && current !== "") {
      return current;
    }
  }
  return null;
}

function addDays(baseDate, days) {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + Number(days || 0));
  return result;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

    if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.INFINITEPAY_WEBHOOK_SECRET
  ) {
    return res.status(500).json({
      error: "Variáveis de ambiente obrigatórias do webhook não configuradas."
    });
  }

  if (!isValidWebhookSecret(req)) {
    return res.status(401).json({ error: "Webhook não autorizado" });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const body = req.body || {};

        const orderNsu = pick(body, [
      "order_nsu",
      "orderNsu",
      "data.order_nsu",
      "data.orderNsu",
      "invoice.order_nsu",
      "payment.order_nsu",
      "invoice.orderNsu",
      "payment.orderNsu",
      "metadata.order_nsu",
      "metadata.orderNsu"
    ]);

        const rawStatus = pick(body, [
      "status",
      "payment_status",
      "paymentStatus",
      "data.status",
      "invoice.status",
      "payment.status",
      "invoice.payment_status",
      "invoice.paymentStatus",
      "data.payment_status",
      "data.paymentStatus"
    ]);

    const transactionNsu = pick(body, [
      "transaction_nsu",
      "transactionNsu",
      "data.transaction_nsu",
      "invoice.transaction_nsu",
      "payment.id",
      "id"
    ]);

    if (!orderNsu) {
      return res.status(400).json({ error: "order_nsu não encontrado no payload" });
    }

    const normalizedStatus = normalizeStatus(rawStatus);

    const { data: pagamento, error: pagamentoError } = await supabase
      .from("pagamentos")
      .select("*")
      .eq("order_nsu", orderNsu)
      .maybeSingle();

    if (pagamentoError) {
      return res.status(500).json({ error: pagamentoError.message });
    }

    if (!pagamento) {
      return res.status(404).json({ error: "Pagamento não encontrado" });
    }

    if (pagamento.status === "pago" && normalizedStatus === "pago") {
  return res.status(200).json({
    success: true,
    orderNsu,
    status: "pago",
    duplicate: true
  });
}

    const pagamentoUpdate = {
      status: normalizedStatus,
      transacao_nsu: transactionNsu || pagamento.transacao_nsu || null,
      raw_payload: body
    };

    if (normalizedStatus === "pago") {
      pagamentoUpdate.pago_em = new Date().toISOString();
    }

    const { error: pagamentoUpdateError } = await supabase
      .from("pagamentos")
      .update(pagamentoUpdate)
      .eq("id", pagamento.id);

    if (pagamentoUpdateError) {
      return res.status(500).json({ error: pagamentoUpdateError.message });
    }

    if (normalizedStatus === "pago") {
      const { data: prestador, error: prestadorError } = await supabase
        .from("prestadores")
        .select("id, boost_ativo, boost_ate, assinatura_ate")
        .eq("id", pagamento.prestador_id)
        .maybeSingle();

      if (prestadorError) {
        return res.status(500).json({ error: prestadorError.message });
      }

      if (prestador) {
        if (pagamento.tipo === "boost") {
          const base = prestador.boost_ate && new Date(prestador.boost_ate) > new Date()
            ? new Date(prestador.boost_ate)
            : new Date();

          const boostAte = addDays(base, pagamento.dias || 7);

          const { error } = await supabase
            .from("prestadores")
            .update({
              boost_ativo: true,
              boost_ate: boostAte.toISOString()
            })
            .eq("id", prestador.id);

          if (error) {
            return res.status(500).json({ error: error.message });
          }
        }

        if (pagamento.tipo === "assinatura") {
          const base = prestador.assinatura_ate && new Date(prestador.assinatura_ate) > new Date()
            ? new Date(prestador.assinatura_ate)
            : new Date();

          const assinaturaAte = addDays(base, pagamento.dias || 30);

          const { error } = await supabase
            .from("prestadores")
            .update({
              assinatura_ate: assinaturaAte.toISOString()
            })
            .eq("id", prestador.id);

          if (error) {
            return res.status(500).json({ error: error.message });
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      orderNsu,
      status: normalizedStatus
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Erro interno no webhook"
    });
  }
};