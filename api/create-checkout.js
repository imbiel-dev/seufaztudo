const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

function normalizePhoneForInfinitePay(value) {
  let digits = String(value || "").replace(/\D/g, "");

  if (!digits) return null;

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (!digits.startsWith("55")) {
    digits = `55${digits}`;
  }

  if (digits.length < 12 || digits.length > 13) {
    return null;
  }

  return `+${digits}`;
}

function isValidCheckoutEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(value || "").trim().toLowerCase()
  );
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLIC_KEY =
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const INFINITEPAY_HANDLE = process.env.INFINITEPAY_HANDLE;
  const APP_BASE_URL = process.env.APP_BASE_URL;

  if (
    !SUPABASE_URL ||
    !SUPABASE_PUBLIC_KEY ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    !INFINITEPAY_HANDLE ||
    !APP_BASE_URL
  ) {
    return res.status(500).json({
      error: "Variáveis de ambiente obrigatórias não configuradas no backend.",
      details: {
        hasSupabaseUrl: !!SUPABASE_URL,
        hasSupabasePublicKey: !!SUPABASE_PUBLIC_KEY,
        hasSupabaseServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY,
        hasInfinitepayHandle: !!INFINITEPAY_HANDLE,
        hasAppBaseUrl: !!APP_BASE_URL
      }
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

    const authenticatedUserId = authData.user.id;

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
      tipo,
      prestadorId,
      nomePrestador,
      emailPrestador
    } = req.body || {};

    if (!tipo || !prestadorId) {
      return res.status(400).json({ error: "Dados obrigatórios ausentes" });
    }

    const { data: prestador, error: prestadorError } = await supabase
    .from("prestadores")
    .select("id, user_id, nome, email, whatsapp, bloqueado, promo_lancamento, assinatura_ate")
    .eq("id", prestadorId)
    .maybeSingle();

    if (prestadorError) {
      return res.status(500).json({ error: prestadorError.message });
    }

    if (!prestador || prestador.user_id !== authenticatedUserId) {
      return res.status(403).json({ error: "Prestador inválido para este usuário" });
    }

    if (prestador.bloqueado) {
      return res.status(403).json({ error: "Conta de prestador bloqueada" });
    }

        const acessoAtivo =
      !!prestador.assinatura_ate &&
      new Date(prestador.assinatura_ate) > new Date();

    const promoLancamentoAtiva =
      !!prestador.promo_lancamento && acessoAtivo;

    const assinaturaAtiva =
      !prestador.promo_lancamento && acessoAtivo;

    if (tipo === "assinatura") {
      if (promoLancamentoAtiva) {
        return res.status(409).json({
          error: `Você já está no período promocional gratuito até ${new Date(prestador.assinatura_ate).toLocaleString("pt-BR")}.`
        });
      }

      if (assinaturaAtiva) {
        return res.status(409).json({
          error: `Sua assinatura já está ativa até ${new Date(prestador.assinatura_ate).toLocaleString("pt-BR")}.`
        });
      }
    }

    if (tipo === "boost" && !acessoAtivo) {
      return res.status(409).json({
        error: "O boost só pode ser comprado quando o perfil estiver com acesso ativo."
      });
    }
    
    let valorCentavos = 0;
    let descricao = "";
    let dias = 0;

    if (tipo === "boost") {
      valorCentavos = 499;
      descricao = "Boost seufaztudo - 7 dias";
      dias = 7;
    } else if (tipo === "assinatura") {
      valorCentavos = 999;
      descricao = "Assinatura seufaztudo - 30 dias";
      dias = 30;
    } else {
      return res.status(400).json({ error: "Tipo de cobrança inválido" });
    }

    const safeHandle = String(INFINITEPAY_HANDLE || "").trim().replace(/^\$/, "");

if (!safeHandle) {
  return res.status(500).json({ error: "INFINITEPAY_HANDLE inválido." });
}

const orderNsu = `sftd_${tipo}_${Date.now()}`;

const { error: insertError } = await supabase
  .from("pagamentos")
  .insert({
    user_id: authenticatedUserId,
    prestador_id: prestadorId,
    tipo,
    status: "pendente",
    valor_centavos: valorCentavos,
    dias,
    order_nsu: orderNsu,
    gateway: "infinitepay",
    descricao
  });

if (insertError) {
  return res.status(500).json({ error: insertError.message });
}

const customerPhone = normalizePhoneForInfinitePay(prestador?.whatsapp);

const customerName = String(
  nomePrestador || prestador?.nome || "Prestador seufaztudo"
).trim();

const customerEmail = String(
  emailPrestador || prestador?.email || authData.user.email || ""
).trim().toLowerCase();

const payload = {
  handle: safeHandle,
  items: [
    {
      quantity: 1,
      price: valorCentavos,
      description: descricao
    }
  ],
  order_nsu: orderNsu,
  redirect_url: `${APP_BASE_URL}/?pagamento=sucesso&order_nsu=${encodeURIComponent(orderNsu)}`,
  webhook_url: `${APP_BASE_URL}/api/infinitepay-webhook`,
  metadata: {
    prestador_id: prestadorId,
    tipo,
    order_nsu: orderNsu,
    customer_name: customerName || null,
    customer_email: customerEmail || null,
    customer_phone: customerPhone || null
  }
};

    const response = await fetch("https://api.infinitepay.io/invoices/public/checkout/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const rawText = await response.text();

    let responseData = null;
    try {
      responseData = rawText ? JSON.parse(rawText) : null;
    } catch (_error) {
      responseData = { raw: rawText };
    }

        if (!response.ok) {
      console.error("Erro da InfinitePay ao criar checkout:", response.status, responseData);
      console.error("Payload enviado para a InfinitePay:", payload);

      await supabase
        .from("pagamentos")
        .update({
          status: "falhou",
          raw_payload: {
            request_payload: payload,
            response_payload: responseData,
            response_status: response.status
          }
        })
        .eq("order_nsu", orderNsu);

      const infinitepayMessage =
        responseData?.message ||
        responseData?.error ||
        responseData?.details ||
        responseData?.title ||
        (Array.isArray(responseData?.errors) ? responseData.errors.join(" | ") : null) ||
        "Falha ao criar checkout na InfinitePay.";

      return res.status(response.status).json({
        error: infinitepayMessage,
        infinitepay_status: response.status,
        infinitepay_response: responseData
      });
    }

    const checkoutUrl =
      responseData?.url ||
      responseData?.checkout_url ||
      responseData?.data?.url ||
      responseData?.data?.checkout_url ||
      responseData?.link ||
      responseData?.invoice_url ||
      null;

    const invoiceSlug =
      responseData?.slug ||
      responseData?.invoice_slug ||
      responseData?.data?.slug ||
      responseData?.data?.invoice_slug ||
      null;

    if (!checkoutUrl) {
      console.error("Resposta da InfinitePay sem URL de checkout:", responseData);

      await supabase
        .from("pagamentos")
        .update({
          status: "falhou",
          raw_payload: responseData
        })
        .eq("order_nsu", orderNsu);

      return res.status(502).json({
        error: "A InfinitePay respondeu sem URL de checkout.",
        infinitepay_response: responseData
      });
    }

    const { error: paymentUpdateError } = await supabase
  .from("pagamentos")
  .update({
    checkout_url: checkoutUrl,
    invoice_slug: invoiceSlug,
    descricao,
    raw_payload: {
      request_payload: payload,
      response_payload: responseData,
      response_status: response.status
    }
  })
  .eq("order_nsu", orderNsu);

    if (paymentUpdateError) {
      console.error("Erro ao atualizar pagamento com checkout:", paymentUpdateError);

      return res.status(500).json({
        error: "Checkout criado, mas não foi possível salvar os dados no banco.",
        details: paymentUpdateError.message
      });
    }

    return res.status(200).json({
      success: true,
      url: checkoutUrl,
      slug: invoiceSlug,
      order_nsu: orderNsu
    });
  } catch (error) {
    console.error("Erro interno em create-checkout:", error);

    return res.status(500).json({
      error: error.message || "Erro interno"
    });
  }
};