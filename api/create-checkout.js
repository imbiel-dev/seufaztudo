const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({ error: "Token ausente" });
    }

    const supabaseAuth = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !authData?.user) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const authenticatedUserId = authData.user.id;

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
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
      .select("id, user_id, nome, bloqueado")
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

    const orderNsu = `seufaztudo_${tipo}_${crypto.randomUUID()}`;

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
        gateway: "infinitepay"
      });

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    const payload = {
      handle: process.env.INFINITEPAY_HANDLE,
      items: [
        {
          quantity: 1,
          price: valorCentavos,
          description: descricao
        }
      ],
      order_nsu: orderNsu,
      redirect_url: `${process.env.APP_BASE_URL}/?pagamento=sucesso&order_nsu=${orderNsu}`,
      webhook_url: `${process.env.APP_BASE_URL}/api/infinitepay-webhook`,
      customer: {
        name: nomePrestador || prestador.nome || "Prestador seufaztudo",
        email: emailPrestador || authData.user.email || ""
      }
    };

    const response = await fetch("https://api.infinitepay.io/invoices/public/checkout/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      await supabase
        .from("pagamentos")
        .update({
          status: "falhou",
          raw_payload: data
        })
        .eq("order_nsu", orderNsu);

      return res.status(500).json({
        error: data?.message || data?.error || "Erro ao criar checkout na InfinitePay"
      });
    }

    const checkoutUrl =
      data?.checkout_url ||
      data?.url ||
      data?.link ||
      data?.invoice_url ||
      null;

    if (!checkoutUrl) {
      await supabase
        .from("pagamentos")
        .update({
          status: "falhou",
          raw_payload: data
        })
        .eq("order_nsu", orderNsu);

      return res.status(500).json({
        error: "Checkout criado, mas a URL não foi encontrada na resposta"
      });
    }

    await supabase
      .from("pagamentos")
      .update({
        checkout_url: checkoutUrl,
        raw_payload: data
      })
      .eq("order_nsu", orderNsu);

    return res.status(200).json({
      success: true,
      checkoutUrl,
      orderNsu
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Erro interno"
    });
  }
};