const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({
      error: "Variáveis de ambiente obrigatórias não configuradas."
    });
  }

  try {
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
      nota,
      chamadoId = null
    } = req.body || {};

    if (!prestadorId) {
      return res.status(400).json({ error: "prestadorId é obrigatório." });
    }

    const notaNumero = Number(nota);

    if (!Number.isInteger(notaNumero) || notaNumero < 1 || notaNumero > 5) {
      return res.status(400).json({ error: "A nota deve ser um inteiro entre 1 e 5." });
    }

    const { data: prestador, error: prestadorError } = await supabase
      .from("prestadores")
      .select("id")
      .eq("id", prestadorId)
      .maybeSingle();

    if (prestadorError) {
      return res.status(500).json({ error: prestadorError.message });
    }

    if (!prestador) {
      return res.status(404).json({ error: "Prestador não encontrado." });
    }

    const insertPayload = {
      prestador_id: prestadorId,
      nota: notaNumero
    };

    if (chamadoId) {
      insertPayload.chamado_id = chamadoId;
    }

    const { error: insertError } = await supabase
      .from("avaliacoes")
      .insert(insertPayload);

    if (insertError) {
      const normalized = String(insertError.message || "").toLowerCase();

      if (normalized.includes("duplicate")) {
        return res.status(409).json({ error: "Esta avaliação já foi registrada." });
      }

      return res.status(500).json({ error: insertError.message });
    }

    const { data: ratings, error: ratingsError } = await supabase
      .from("avaliacoes")
      .select("nota")
      .eq("prestador_id", prestadorId);

    if (ratingsError) {
      return res.status(500).json({ error: ratingsError.message });
    }

    const totalAvaliacoes = Array.isArray(ratings) ? ratings.length : 0;
    const media =
      totalAvaliacoes > 0
        ? ratings.reduce((acc, item) => acc + Number(item.nota || 0), 0) / totalAvaliacoes
        : 0;

    const avaliacaoMedia = Number(media.toFixed(1));

    const { error: updateError } = await supabase
      .from("prestadores")
      .update({
        avaliacao_media: avaliacaoMedia
      })
      .eq("id", prestadorId);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({
      success: true,
      avaliacao_media: avaliacaoMedia,
      total_avaliacoes: totalAvaliacoes
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Erro interno ao enviar avaliação."
    });
  }
};