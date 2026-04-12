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

    const { prestadorId } = req.body || {};

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

    const { data: pagamentos, error: pagamentosError } = await supabase
      .from("pagamentos")
      .select("*")
      .eq("prestador_id", prestadorId)
      .in("tipo", ["boost", "assinatura"])
      .order("created_at", { ascending: false })
      .limit(10);

    if (pagamentosError) {
      return res.status(500).json({ error: pagamentosError.message });
    }

    const pendentes = (pagamentos || []).filter(pagamento => {
      return (
        pagamento.status !== "pago" &&
        pagamento.order_nsu &&
        (
          pagamento.transaction_nsu ||
          pagamento.transacao_nsu ||
          pagamento.invoice_slug
        )
      );
    });

    const resultados = [];

    for (const pagamento of pendentes) {
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

      let paymentCheckData = null;
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

      const paid = !!paymentCheckData?.paid;

      if (!paid) {
        continue;
      }

      const pagamentoUpdate = {
        status: "pago",
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
        const boostBase =
          prestadorAtual.boost_ate && new Date(prestadorAtual.boost_ate) > now
            ? new Date(prestadorAtual.boost_ate)
            : now;

        const boostAte = new Date(boostBase);
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