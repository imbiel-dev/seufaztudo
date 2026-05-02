const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLIC_KEY =
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const INFINITEPAY_HANDLE = process.env.INFINITEPAY_HANDLE;

  if (
    !SUPABASE_URL ||
    !SUPABASE_PUBLIC_KEY ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    !INFINITEPAY_HANDLE
  ) {
    return res.status(500).json({
      error: "Variáveis de ambiente obrigatórias não configuradas."
    });
  }

  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({ error: "Token ausente" });
    }

    const supabaseAuth = createClient(
      SUPABASE_URL,
      SUPABASE_PUBLIC_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !authData?.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    const {
      prestadorId,
      orderNsu: returnOrderNsu = null,
      transactionNsu: returnTransactionNsu = null,
      transactionId: returnTransactionId = null,
      slug: returnSlug = null,
      receiptUrl: returnReceiptUrl = null,
      captureMethod: returnCaptureMethod = null
    } = req.body || {};

    if (!prestadorId) {
      return res.status(400).json({ error: "prestadorId é obrigatório" });
    }

    const { data: prestador, error: prestadorError } = await supabase
      .from("prestadores")
      .select("id, user_id")
      .eq("id", prestadorId)
      .maybeSingle();

    if (prestadorError) {
      return res.status(500).json({ error: prestadorError.message });
    }

    if (!prestador || prestador.user_id !== authData.user.id) {
      return res.status(403).json({ error: "Prestador inválido para este usuário" });
    }

    const { data: pagamentosData, error: pagamentosError } = await supabase
      .from("pagamentos")
      .select("*")
      .eq("prestador_id", prestadorId)
      .in("tipo", ["boost", "assinatura"])
      .order("created_at", { ascending: false })
      .limit(10);

    if (pagamentosError) {
      return res.status(500).json({ error: pagamentosError.message });
    }

    let pagamentos = pagamentosData || [];

const normalizedReturnTransaction =
  returnTransactionNsu || returnTransactionId || null;

if (returnOrderNsu) {
  const pagamentoRetorno = pagamentos.find(
    pagamento => pagamento.order_nsu === returnOrderNsu
  );

  if (pagamentoRetorno) {
    const updatedReturnPayload = {
      transaction_nsu: normalizedReturnTransaction || pagamentoRetorno.transaction_nsu || null,
      transacao_nsu: normalizedReturnTransaction || pagamentoRetorno.transacao_nsu || null,
      invoice_slug: returnSlug || pagamentoRetorno.invoice_slug || null,
      receipt_url: returnReceiptUrl || pagamentoRetorno.receipt_url || null,
      capture_method: returnCaptureMethod || pagamentoRetorno.capture_method || null,
      updated_at: new Date().toISOString(),
      raw_payload: {
        ...(pagamentoRetorno.raw_payload || {}),
        payment_return: {
          order_nsu: returnOrderNsu,
          transaction_nsu: normalizedReturnTransaction,
          slug: returnSlug,
          receipt_url: returnReceiptUrl,
          capture_method: returnCaptureMethod,
          received_at: new Date().toISOString()
        }
      }
    };

    const { error: returnUpdateError } = await supabase
      .from("pagamentos")
      .update(updatedReturnPayload)
      .eq("id", pagamentoRetorno.id);

    if (returnUpdateError) {
      return res.status(500).json({ error: returnUpdateError.message });
    }

    pagamentos = pagamentos.map(pagamento =>
      pagamento.id === pagamentoRetorno.id
        ? { ...pagamento, ...updatedReturnPayload }
        : pagamento
    );
  }
}

    const pendentes = (pagamentos || []).filter(pagamento => {
  return (
    pagamento.status !== "pago" &&
    pagamento.order_nsu &&
    (
      pagamento.transaction_nsu ||
      pagamento.transacao_nsu ||
      pagamento.invoice_slug ||
      pagamento.receipt_url
    )
  );
});

    const resultados = [];

    for (const pagamento of pendentes) {
      let paymentCheckData = null;
let paid = pagamento.status === "pago";

if (!paid) {
  const payload = {
    handle: INFINITEPAY_HANDLE,
    order_nsu: pagamento.order_nsu,
    transaction_nsu: pagamento.transaction_nsu || pagamento.transacao_nsu || undefined,
    slug: pagamento.invoice_slug || undefined
  };

  const response = await fetch("https://api.infinitepay.io/invoices/public/checkout/payment_check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const rawText = await response.text();

  try {
    paymentCheckData = rawText ? JSON.parse(rawText) : null;
  } catch (_error) {
    paymentCheckData = { raw: rawText };
  }

  resultados.push({
    pagamento_id: pagamento.id,
    order_nsu: pagamento.order_nsu,
    response_ok: response.ok,
    payment_check: paymentCheckData
  });

  if (!response.ok) {
    continue;
  }

  paid = !!paymentCheckData?.paid;
} else {
  resultados.push({
    pagamento_id: pagamento.id,
    order_nsu: pagamento.order_nsu,
    response_ok: true,
    already_paid: true
  });
}

if (!paid) {
  continue;
}

      const pagamentoUpdate = {
  status: "pago",
  transaction_nsu: pagamento.transaction_nsu || pagamento.transacao_nsu || null,
  transacao_nsu: pagamento.transacao_nsu || pagamento.transaction_nsu || null,
  invoice_slug: pagamento.invoice_slug || null,
  receipt_url: pagamento.receipt_url || null,
  capture_method: paymentCheckData?.capture_method || pagamento.capture_method || null,
  paid_at: pagamento.paid_at || new Date().toISOString(),
  pago_em: pagamento.pago_em || new Date().toISOString(),
  updated_at: new Date().toISOString(),
  raw_payload: {
    ...(pagamento.raw_payload || {}),
    payment_check: paymentCheckData
  }
};

      const { error: pagamentoUpdateError } = await supabase
        .from("pagamentos")
        .update(pagamentoUpdate)
        .eq("id", pagamento.id);

      if (pagamentoUpdateError) {
        return res.status(500).json({ error: pagamentoUpdateError.message });
      }

      const { data: prestadorAtual, error: prestadorAtualError } = await supabase
        .from("prestadores")
        .select("id, boost_ate, assinatura_ate")
        .eq("id", prestadorId)
        .maybeSingle();

      if (prestadorAtualError) {
        return res.status(500).json({ error: prestadorAtualError.message });
      }

      if (!prestadorAtual) {
        continue;
      }

      const now = new Date();

      if (pagamento.tipo === "boost") {
  const boostJaAtivo =
    prestadorAtual.boost_ate &&
    new Date(prestadorAtual.boost_ate) > now;

  if (!boostJaAtivo) {
    const boostAte = new Date(now);
    boostAte.setDate(boostAte.getDate() + Number(pagamento.dias || 7));

    const { error: boostError } = await supabase
      .from("prestadores")
      .update({
        boost_ativo: true,
        boost_ate: boostAte.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", prestadorId);

    if (boostError) {
      return res.status(500).json({ error: boostError.message });
    }
  }
}

      if (pagamento.tipo === "assinatura") {
        const assinaturaBase =
          prestadorAtual.assinatura_ate && new Date(prestadorAtual.assinatura_ate) > now
            ? new Date(prestadorAtual.assinatura_ate)
            : now;

        const assinaturaAte = new Date(assinaturaBase);
        assinaturaAte.setDate(assinaturaAte.getDate() + Number(pagamento.dias || 30));

        const { error: assinaturaError } = await supabase
          .from("prestadores")
          .update({
            assinatura_ate: assinaturaAte.toISOString(),
            promo_lancamento: false,
            updated_at: new Date().toISOString()
          })
          .eq("id", prestadorId);

        if (assinaturaError) {
          return res.status(500).json({ error: assinaturaError.message });
        }
      }
    }

    const { data: perfilAtualizado, error: perfilAtualizadoError } = await supabase
      .from("prestadores")
      .select("*")
      .eq("id", prestadorId)
      .maybeSingle();

    if (perfilAtualizadoError) {
      return res.status(500).json({ error: perfilAtualizadoError.message });
    }

    return res.status(200).json({
      success: true,
      checked: pendentes.length,
      results: resultados,
      profile: perfilAtualizado || null
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Erro interno ao consultar status do pagamento."
    });
  }
};