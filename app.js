const state = {
  currentRoute: "home",
  currentUser: null,
  currentProviderProfile: null,

  isEditingProfile: false,
  isPasswordRecoveryMode: false,
  profileDraftBackup: null,

  registerAdditionalServices: [],
  profileAdditionalServices: [],

  publicRatingValue: 0,

  userLocation: null,
  providerRegisterLocation: null,
  urgentLocation: null,

  myUrgentCallId: null,
  providerUrgentCalls: [],
  myUrgentResponses: [],
  providers: [],

  realtimeChannels: []
};

const routes = ["home", "provider-profile", "login", "register", "dashboard", "urgent", "terms", "privacy", "payments", "legal"];


const PENDING_PROVIDER_PROFILE_KEY = "seufaztudo_pending_provider_profile";
const PUBLIC_RATING_STORAGE_KEY = "seufaztudo_public_ratings";

const SERVICE_ALIASES = {
  "eletricista": "Eletricista",
  "eletrica": "Eletricista",
  "elétrica": "Eletricista",
  "encanador": "Encanador",
  "encanamento": "Encanador",
  "bombeiro hidraulico": "Encanador",
  "bombeiro hidráulico": "Encanador",
  "hidraulico": "Encanador",
  "hidráulico": "Encanador",
  "pedreiro": "Pedreiro",
  "alvenaria": "Pedreiro",
  "pintor": "Pintor",
  "pintura": "Pintor",
  "diarista": "Diarista",
  "faxineira": "Diarista",
  "faxineiro": "Diarista",
  "limpeza": "Diarista",
  "montador de moveis": "Montador de móveis",
  "montador de móveis": "Montador de móveis",
  "montador": "Montador de móveis",
  "marceneiro": "Marceneiro",
  "chaveiro": "Chaveiro",
  "jardineiro": "Jardineiro",
  "jardinagem": "Jardineiro",
  "vidraceiro": "Vidraceiro",
  "vidraceiro/box": "Vidraceiro",
  "tecnico de informatica": "Técnico de informática",
  "técnico de informática": "Técnico de informática",
  "informatica": "Técnico de informática",
  "informática": "Técnico de informática",
  "formatacao": "Técnico de informática",
  "formatação": "Técnico de informática",
  "instalador de ar condicionado": "Instalador de ar-condicionado",
  "instalador de ar-condicionado": "Instalador de ar-condicionado",
  "ar condicionado": "Instalador de ar-condicionado",
  "mecanico": "Mecânico",
  "mecânico": "Mecânico",
  "mecanica": "Mecânico",
  "mecânica": "Mecânico",
  "borracheiro": "Borracheiro",
  "motorista": "Motorista",
  "entregador": "Entregador",
  "moto boy": "Entregador",
  "motoboy": "Entregador",
  "frete": "Freteiro",
  "freteiro": "Freteiro",
  "mudanca": "Freteiro",
  "mudança": "Freteiro",
  "passeador de caes": "Passeador de cães",
  "passeador de cães": "Passeador de cães",
  "dog walker": "Passeador de cães",
  "personal": "Personal trainer",
  "personal trainer": "Personal trainer",
  "treinador": "Personal trainer",
  "baba": "Babá",
  "babá": "Babá",
  "cuidador de idosos": "Cuidador de idosos",
  "cuidadora de idosos": "Cuidador de idosos",
  "serralheiro": "Serralheiro",
  "soldador": "Soldador",
  "gesseiro": "Gesseiro",
  "azulejista": "Azulejista",
  "rejunte": "Azulejista",
  "tecnico em celular": "Técnico em celular",
  "técnico em celular": "Técnico em celular",
  "conserto de celular": "Técnico em celular",
  "fotografo": "Fotógrafo",
  "fotógrafo": "Fotógrafo",
  "professor particular": "Professor particular",
  "aulas particulares": "Professor particular",
  "manicure": "Manicure",
  "pedicure": "Manicure",
  "cabeleireiro": "Cabeleireiro",
  "barbeiro": "Barbeiro",
  "maquiador": "Maquiador",
  "maquiagem": "Maquiador",
  "designer de sobrancelhas": "Designer de sobrancelhas",
  "sobrancelha": "Designer de sobrancelhas",
  "depiladora": "Depiladora",
  "depilador": "Depiladora",
  "lavador de sofa": "Lavagem de sofá",
  "lavador de sofá": "Lavagem de sofá",
  "lavagem de sofa": "Lavagem de sofá",
  "lavagem de sofá": "Lavagem de sofá",
  "dedetizador": "Dedetizador",
  "dedetizacao": "Dedetizador",
  "dedetização": "Dedetizador",
  "desentupidor": "Desentupidor",
  "desentupimento": "Desentupidor",
  "instalador de camera": "Instalador de câmeras",
  "instalador de câmera": "Instalador de câmeras",
  "camera de seguranca": "Instalador de câmeras",
  "câmera de segurança": "Instalador de câmeras",
  "porteiro": "Porteiro",
  "zelador": "Zelador",
  "marido de aluguel": "Marido de aluguel",
  "faz tudo": "Marido de aluguel",
  "reformas": "Marido de aluguel",
  "instalador de tv": "Instalador de TV",
  "instalador de televisão": "Instalador de TV",
  "tv": "Instalador de TV",
  "limpeza pos obra": "Limpeza pós-obra",
  "limpeza pós obra": "Limpeza pós-obra",
  "limpeza pós-obra": "Limpeza pós-obra"
};

const SERVICE_OPTIONS = [
  "Eletricista",
  "Encanador",
  "Desentupidor",
  "Pedreiro",
  "Pintor",
  "Diarista",
  "Limpeza pós-obra",
  "Montador de móveis",
  "Marceneiro",
  "Chaveiro",
  "Jardineiro",
  "Vidraceiro",
  "Técnico de informática",
  "Técnico em celular",
  "Instalador de ar-condicionado",
  "Instalador de TV",
  "Instalador de câmeras",
  "Mecânico",
  "Borracheiro",
  "Motorista",
  "Entregador",
  "Freteiro",
  "Passeador de cães",
  "Personal trainer",
  "Babá",
  "Cuidador de idosos",
  "Serralheiro",
  "Soldador",
  "Gesseiro",
  "Azulejista",
  "Fotógrafo",
  "Professor particular",
  "Manicure",
  "Cabeleireiro",
  "Barbeiro",
  "Maquiador",
  "Designer de sobrancelhas",
  "Depiladora",
  "Lavagem de sofá",
  "Dedetizador",
  "Porteiro",
  "Zelador",
  "Marido de aluguel"
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeWhatsappBR(value) {
  let digits = String(value || "").replace(/\D/g, "");

  if (!digits) return "";

  
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  
  if (!digits.startsWith("55")) {
    digits = "55" + digits;
  }

 
  if (digits.length < 12 || digits.length > 13) {
    return "";
  }

  return digits;
}

function normalizeService(value) {
  const normalized = normalizeText(value);
  return SERVICE_ALIASES[normalized] || safeTrim(value, 120);
}

function normalizeServicesInput(value) {
  return String(value || "")
    .split(",")
    .map(s => normalizeService(s))
    .filter(Boolean)
    .filter((service, index, arr) => arr.indexOf(service) === index);
}

function getProviderServices(provider) {
  if (Array.isArray(provider?.servicos) && provider.servicos.length) {
    return provider.servicos.filter(Boolean);
  }

  if (provider?.servico) {
    return [provider.servico];
  }

  return [];
}

function sanitizeSingleService(value) {
  const normalized = normalizeService(value);
  return normalized ? safeTrim(normalized, 120) : "";
}

function buildProviderServices(primaryService, additionalServices = []) {
  const primary = sanitizeSingleService(primaryService);
  const extras = additionalServices
    .map(sanitizeSingleService)
    .filter(Boolean);

  const merged = [primary, ...extras].filter(Boolean);
  return merged.filter((service, index, arr) => arr.indexOf(service) === index);
}

function renderServiceTags(containerId, services, options = {}) {
  const container = $(containerId);
  if (!container) return;

  const {
    removable = false,
    onRemove = null
  } = options;

  if (!services.length) {
    container.innerHTML = `<span class="small-muted">Nenhum serviço adicional.</span>`;
    return;
  }

  container.innerHTML = "";

  services.forEach((service, index) => {
    const tag = document.createElement("div");
    tag.className = "service-tag";
    tag.innerHTML = `
      <span>${escapeHtml(service)}</span>
      ${
        removable
          ? `<button type="button" class="service-tag-remove" data-remove-service-index="${index}">×</button>`
          : ``
      }
    `;
    container.appendChild(tag);
  });

  if (removable && typeof onRemove === "function") {
    container.querySelectorAll("[data-remove-service-index]").forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.getAttribute("data-remove-service-index"));
        onRemove(index);
      });
    });
  }
}

function addRegisterAdditionalService() {
  const input = $("registerAdditionalService");
  if (!input) return;

  const value = sanitizeSingleService(input.value);
  const primary = sanitizeSingleService($("registerService")?.value);

  if (!value) {
    showAlert("Digite um serviço válido para adicionar.", "error");
    return;
  }

  if (value === primary || state.registerAdditionalServices.includes(value)) {
    showAlert("Esse serviço já foi adicionado.", "info");
    return;
  }

  state.registerAdditionalServices.push(value);
  input.value = "";
  $("registerAdditionalServiceSuggestions")?.classList.add("hidden");
  renderServiceTags("registerServicesList", state.registerAdditionalServices, {
    removable: true,
    onRemove: index => {
      state.registerAdditionalServices.splice(index, 1);
      renderServiceTags("registerServicesList", state.registerAdditionalServices, {
        removable: true,
        onRemove: idx => {
          state.registerAdditionalServices.splice(idx, 1);
          renderServiceTags("registerServicesList", state.registerAdditionalServices, {
            removable: true,
            onRemove: arguments.callee
          });
        }
      });
    }
  });
}

function renderRegisterServices() {
  renderServiceTags("registerServicesList", state.registerAdditionalServices, {
    removable: true,
    onRemove: index => {
      state.registerAdditionalServices.splice(index, 1);
      renderRegisterServices();
    }
  });
}

function addProfileAdditionalService() {
  const input = $("profileAdditionalService");
  if (!input) return;

  const value = sanitizeSingleService(input.value);
  const primary = sanitizeSingleService($("profileService")?.value);

  if (!value) {
    showAlert("Digite um serviço válido para adicionar.", "error");
    return;
  }

  if (value === primary || state.profileAdditionalServices.includes(value)) {
    showAlert("Esse serviço já foi adicionado.", "info");
    return;
  }

  state.profileAdditionalServices.push(value);
  input.value = "";
  $("profileAdditionalServiceSuggestions")?.classList.add("hidden");
  renderProfileServices();
}

function renderProfileServices() {
  renderServiceTags("profileServicesList", state.profileAdditionalServices, {
    removable: state.isEditingProfile,
    onRemove: index => {
      state.profileAdditionalServices.splice(index, 1);
      renderProfileServices();
    }
  });
}

function providerMatchesService(provider, serviceQuery) {
  const normalizedQuery = normalizeText(serviceQuery);

  if (!normalizedQuery) return false;

  const services = getProviderServices(provider);

  return services.some(service =>
    normalizeText(service).includes(normalizedQuery)
  );
}

function getServiceMatches(query) {
  const term = normalizeText(query);

  if (!term) return [];

  return SERVICE_OPTIONS.filter(service => {
    const normalized = normalizeText(service);
    return normalized.includes(term);
  }).slice(0, 8);
}

function renderServiceSuggestions(inputId, boxId, hintId) {
  const input = $(inputId);
  const box = $(boxId);
  const hint = $(hintId);

  if (!input || !box || !hint) return;

  const value = input.value.trim();
  const matches = getServiceMatches(value);

  if (!value) {
    box.innerHTML = "";
    box.classList.add("hidden");
    hint.textContent = "";
    hint.classList.add("hidden");
    return;
  }

  if (!matches.length) {
    box.innerHTML = `<div class="autocomplete-item-empty">Nenhum serviço encontrado</div>`;
    box.classList.remove("hidden");
    hint.textContent = "Você pode continuar digitando mesmo assim.";
    hint.classList.remove("hidden");
    return;
  }

  hint.textContent = "";
  hint.classList.add("hidden");

  box.innerHTML = matches
    .map(service => `<button type="button" class="autocomplete-item" data-service-value="${escapeHtml(service)}">${escapeHtml(service)}</button>`)
    .join("");

  box.classList.remove("hidden");

  box.querySelectorAll("[data-service-value]").forEach(button => {
    button.addEventListener("click", () => {
      input.value = button.getAttribute("data-service-value") || "";
      box.innerHTML = "";
      box.classList.add("hidden");
      hint.textContent = "";
      hint.classList.add("hidden");
    });
  });
}

function setupServiceAutocomplete(inputId, boxId, hintId) {
  const input = $(inputId);
  const box = $(boxId);
  const hint = $(hintId);

  if (!input || !box || !hint) return;

  input.addEventListener("input", () => {
    renderServiceSuggestions(inputId, boxId, hintId);
  });

  input.addEventListener("focus", () => {
    renderServiceSuggestions(inputId, boxId, hintId);
  });

  document.addEventListener("click", event => {
    const clickedInside =
      event.target === input ||
      box.contains(event.target);

    if (!clickedInside) {
      box.classList.add("hidden");
    }
  });
}

function setButtonLoading(button, isLoading, loadingText) {
  if (!button) return;

  if (isLoading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }
    button.disabled = true;
    button.textContent = loadingText || "Carregando...";
    return;
  }

  button.disabled = false;
  if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
  }
}

async function withRequestTimeout(promise, timeoutMs, timeoutMessage) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage || "A operação demorou mais que o esperado."));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function syncCurrentProviderPaymentStatus(options = {}) {
  const {
    button = null,
    loadingText = "Atualizando...",
    showAlerts = true
  } = options;

  try {
    if (button) {
      setButtonLoading(button, true, loadingText);
    }

    if (!supabase) {
      throw new Error("Supabase não configurado corretamente.");
    }

    if (!state.currentUser) {
      throw new Error("Faça login novamente.");
    }

    if (!state.currentProviderProfile?.id) {
      await loadMyProvider(true);
    }

    if (!state.currentProviderProfile?.id) {
      throw new Error("Seu perfil de prestador não foi encontrado.");
    }

    const {
      data: { session }
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error("Sua sessão expirou. Entre novamente.");
    }

    const response = await withRequestTimeout(
      fetch("/api/check-payment-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          prestadorId: state.currentProviderProfile.id
        })
      }),
      20000,
      "A atualização do status demorou demais. Tente novamente."
    );

    const rawText = await response.text();

    let result = null;
    try {
      result = rawText ? JSON.parse(rawText) : null;
    } catch (_error) {
      result = { raw: rawText };
    }

    if (!response.ok) {
      console.error("Erro ao sincronizar pagamentos:", result);
      throw new Error(
        result?.error ||
        result?.details ||
        "Não foi possível atualizar o status do plano."
      );
    }

    state.currentProviderProfile = result?.profile || state.currentProviderProfile;

    await fetchProviders();
    updateDashboardUI();

    if (showAlerts) {
      const checked = Number(result?.checked || 0);
      const profile = result?.profile || state.currentProviderProfile;

      const assinaturaAtiva =
        !!profile?.assinatura_ate &&
        new Date(profile.assinatura_ate) > new Date();

      const boostAtivo = isBoostActive(profile);

      if (checked > 0) {
        showAlert("Status sincronizado com a InfinitePay com sucesso.", "success");
      } else if (assinaturaAtiva || boostAtivo) {
        showAlert("Seu pagamento já foi confirmado e o painel foi atualizado.", "success");
      } else {
        showAlert("Nenhum pagamento pendente precisou de sincronização.", "info");
      }
    }

    return result;
  } catch (error) {
    if (showAlerts) {
      showAlert(error.message || "Erro ao atualizar status do plano.", "error");
    }
    throw error;
  } finally {
    if (button) {
      setButtonLoading(button, false);
    }
  }
}

async function startCheckoutFlow(tipo) {
  if (!supabase) {
    throw new Error("Supabase não configurado corretamente.");
  }

  if (!state.currentUser) {
    throw new Error("Faça login para continuar.");
  }

  if (!state.currentProviderProfile?.id) {
    await loadMyProvider(true);
  }

  if (!state.currentProviderProfile?.id) {
    throw new Error("Seu perfil de prestador não foi encontrado.");
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  const payload = {
    tipo,
    prestadorId: state.currentProviderProfile.id,
    nomePrestador: state.currentProviderProfile.nome || state.currentUser.email || "Prestador",
    emailPrestador: state.currentProviderProfile.email || state.currentUser.email || ""
  };

  const response = await withRequestTimeout(
    fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    }),
    20000,
    "A criação do checkout demorou demais. Tente novamente."
  );

  const rawText = await response.text();

  let result = null;
  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch (_error) {
    result = { raw: rawText };
  }

    if (!response.ok) {
    console.error("Erro ao criar checkout:", result);

    const detailedMessage =
      result?.error ||
      result?.details ||
      result?.infinitepay_response?.message ||
      result?.infinitepay_response?.error ||
      result?.infinitepay_response?.details ||
      "Não foi possível criar o checkout.";

    throw new Error(detailedMessage);
  }

  if (!result?.url) {
    console.error("Resposta sem URL de checkout:", result);
    throw new Error("O checkout foi criado sem URL de redirecionamento.");
  }

  return result;
}

function setupPasswordToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach(button => {
    button.addEventListener("click", () => {
      const inputId = button.getAttribute("data-toggle-password");
      const input = document.getElementById(inputId);
      if (!input) return;

      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      button.textContent = showing ? "Mostrar" : "Ocultar";
    });
  });
}

function savePendingProviderProfile(payload) {
  if (!payload) return;
  localStorage.setItem(PENDING_PROVIDER_PROFILE_KEY, JSON.stringify(payload));
}

function getPendingProviderProfile() {
  try {
    const raw = localStorage.getItem(PENDING_PROVIDER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function clearPendingProviderProfile() {
  localStorage.removeItem(PENDING_PROVIDER_PROFILE_KEY);
}

function getPublicRatedProviders() {
  try {
    const raw = localStorage.getItem(PUBLIC_RATING_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_error) {
    return {};
  }
}

function hasPublicRatedProvider(providerId) {
  const ratings = getPublicRatedProviders();
  return !!ratings[String(providerId)];
}

function markPublicRatedProvider(providerId, nota) {
  const ratings = getPublicRatedProviders();
  ratings[String(providerId)] = {
    nota,
    created_at: new Date().toISOString()
  };
  localStorage.setItem(PUBLIC_RATING_STORAGE_KEY, JSON.stringify(ratings));
}

function applyProviderRatingLocally(prestadorId, roundedMedia) {
  const providerId = String(prestadorId);
  const numericRating = Number(roundedMedia || 0);

  if (state.currentProviderProfile && String(state.currentProviderProfile.id) === providerId) {
    state.currentProviderProfile.avaliacao_media = numericRating;
  }

  const providerIndex = state.providers.findIndex(item => String(item.id) === providerId);
  if (providerIndex >= 0) {
    state.providers[providerIndex].avaliacao_media = numericRating;
  }

  const statRating = $("statRating");
  if (statRating && state.currentProviderProfile && String(state.currentProviderProfile.id) === providerId) {
    statRating.textContent = numericRating.toFixed(1);
  }
}

async function recalculateProviderRating(prestadorId) {
  const { data: ratings, error: ratingsError } = await supabase
    .from("avaliacoes")
    .select("nota")
    .eq("prestador_id", prestadorId);

  if (ratingsError) {
    throw ratingsError;
  }

  const media =
    Array.isArray(ratings) && ratings.length > 0
      ? ratings.reduce((acc, item) => acc + Number(item.nota || 0), 0) / ratings.length
      : 0;

  const roundedMedia = Number(media.toFixed(1));

  const { error: updateRatingError } = await supabase
    .from("prestadores")
    .update({ avaliacao_media: roundedMedia })
    .eq("id", prestadorId);

  if (updateRatingError) {
    throw updateRatingError;
  }

  applyProviderRatingLocally(prestadorId, roundedMedia);
  return roundedMedia;
}

function mapRatingErrorMessage(error) {
  const raw = String(error?.message || error || "").trim();
  const normalized = raw.toLowerCase();

  if (!raw) {
    return "Erro ao enviar avaliação.";
  }

  if (
    normalized.includes("row-level security") ||
    normalized.includes("permission denied") ||
    normalized.includes("not allowed")
  ) {
    return "A avaliação foi bloqueada por permissão do banco. Precisamos ajustar o RLS da tabela de avaliações e da tabela de prestadores.";
  }

  if (normalized.includes("duplicate")) {
    return "Esta avaliação já foi registrada.";
  }

  return raw;
}

async function getPendingProviderProfileFromAuthMetadata() {
  if (!supabase) return null;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session?.user?.user_metadata?.pending_provider_profile || null;
}

async function clearPendingProviderProfileFromAuthMetadata() {
  if (!supabase) return false;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) return false;

  const currentMetadata = session.user.user_metadata || {};

  if (!Object.prototype.hasOwnProperty.call(currentMetadata, "pending_provider_profile")) {
    return false;
  }

  const { pending_provider_profile, ...metadataWithoutPending } = currentMetadata;

  try {
    const { error } = await supabase.auth.updateUser({
      data: metadataWithoutPending
    });

    if (error) {
      console.error("Erro ao limpar metadata pendente:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao limpar metadata pendente:", error);
    return false;
  }
}

function sanitizeProviderInsertPayload(payload, userId) {
  return {
    user_id: userId,
    email: safeTrim(payload?.email, 160),
    nome: safeTrim(payload?.nome, 120),
    descricao: safeTrim(payload?.descricao, 1000),
    servico: safeTrim(payload?.servico, 120),
    servicos: Array.isArray(payload?.servicos) ? payload.servicos.slice(0, 20) : [],
    experiencia_anos: Number(payload?.experiencia_anos || 0),
    preco_medio: Number(payload?.preco_medio || 0),
    whatsapp: normalizeWhatsappBR(payload?.whatsapp),
    atende_emergencia: !!payload?.atende_emergencia,
    raio_km: Number(payload?.raio_km || 0),
    latitude: Number(payload?.latitude),
    longitude: Number(payload?.longitude),
    assinatura_ate: payload?.assinatura_ate || null,
    boost_ativo: !!payload?.boost_ativo,
    avaliacao_media: Number(payload?.avaliacao_media || 0),
    visualizacoes: Number(payload?.visualizacoes || 0),
    cliques_whatsapp: Number(payload?.cliques_whatsapp || 0),
    bloqueado: false
  };
}

async function ensureProviderProfileForCurrentUser() {
  if (!supabase || !state.currentUser) return null;

  const currentUserId = state.currentUser.id;
  const currentEmail = String(state.currentUser.email || "").trim().toLowerCase();

  const { data: existingByUserId, error: existingByUserIdError } = await supabase
    .from("prestadores")
    .select("*")
    .eq("user_id", currentUserId)
    .maybeSingle();

    if (Array.isArray(existingByUserId)) {
  console.warn("Mais de um perfil encontrado para o mesmo usuário.");
}

  if (existingByUserIdError) throw existingByUserIdError;

  if (existingByUserId) {
    clearPendingProviderProfile();
    await clearPendingProviderProfileFromAuthMetadata();
    return existingByUserId;
  }

  let pending = getPendingProviderProfile();

  if (!pending) {
    pending = await getPendingProviderProfileFromAuthMetadata();
  }

  const pendingEmail = String(pending?.email || "").trim().toLowerCase();

  if (pending && pendingEmail && pendingEmail === currentEmail) {
    const insertPayload = sanitizeProviderInsertPayload(pending, currentUserId);

    const { error: insertError } = await supabase
      .from("prestadores")
      .insert(insertPayload);

    if (insertError) {
      const duplicateConflict =
        String(insertError.message || "").toLowerCase().includes("duplicate") ||
        String(insertError.message || "").toLowerCase().includes("unique");

      if (!duplicateConflict) {
        throw insertError;
      }
    }

    const { data: createdOrExisting, error: createdOrExistingError } = await supabase
      .from("prestadores")
      .select("*")
      .eq("user_id", currentUserId)
      .maybeSingle();

    if (createdOrExistingError) throw createdOrExistingError;

    if (createdOrExisting) {
      clearPendingProviderProfile();
      await clearPendingProviderProfileFromAuthMetadata();
      return createdOrExisting;
    }
  }

  if (currentEmail) {
    const { data: existingByEmail, error: existingByEmailError } = await supabase
      .from("prestadores")
      .select("*")
      .ilike("email", currentEmail)
      .is("user_id", null)
      .maybeSingle();

    if (existingByEmailError) throw existingByEmailError;

    if (existingByEmail) {
      const { error: attachError } = await supabase
        .from("prestadores")
        .update({ user_id: currentUserId })
        .eq("id", existingByEmail.id)
        .is("user_id", null);

      if (attachError) throw attachError;

      const { data: attachedProfile, error: attachedProfileError } = await supabase
        .from("prestadores")
        .select("*")
        .eq("id", existingByEmail.id)
        .maybeSingle();

      if (attachedProfileError) throw attachedProfileError;

      if (attachedProfile) {
        clearPendingProviderProfile();
        await clearPendingProviderProfileFromAuthMetadata();
        return attachedProfile;
      }
    }
  }

  return null;
}

function $(id) {
  return document.getElementById(id);
}

function showAlert(message, type = "info") {
  const box = $("alertBox");
  if (!box) return;

  box.textContent = message;
  box.className = `alert alert-${type}`;
  box.classList.remove("hidden");

  clearTimeout(showAlert._timer);
  showAlert._timer = setTimeout(() => {
    box.classList.add("hidden");
  }, 5000);
}

function updatePasswordRecoveryUI() {
  const box = $("passwordRecoveryNotice");
  if (!box) return;

  box.classList.toggle("hidden", !state.isPasswordRecoveryMode);

    if (state.isPasswordRecoveryMode) {
    box.textContent = "Seu link de recuperação foi validado. Defina sua nova senha abaixo para concluir o processo. Se você abriu este link pelo e-mail, pode continuar normalmente.";
  }
}

function mapAuthErrorMessage(error) {
  const raw =
    String(error?.message || error || "")
      .trim();

  const normalized = raw.toLowerCase();

  if (!raw) {
    return "Ocorreu um erro de autenticação.";
  }

    if (normalized.includes("email not confirmed")) {
    return "Seu e-mail ainda não foi confirmado. Abra a mensagem enviada, confira também spam, lixo eletrônico e promoções, e clique no link de confirmação.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha inválidos.";
  }

  if (normalized.includes("user already registered")) {
    return "Este e-mail já está cadastrado. Tente entrar ou recuperar sua senha.";
  }

  if (normalized.includes("signup is disabled")) {
    return "O cadastro está temporariamente indisponível.";
  }

  if (normalized.includes("password should be at least")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }

  if (normalized.includes("unable to validate email address")) {
    return "Digite um e-mail válido.";
  }

  if (normalized.includes("email rate limit exceeded")) {
    return "Muitas tentativas em pouco tempo. Aguarde um pouco antes de tentar de novo.";
  }

  if (normalized.includes("for security purposes")) {
    return "Por segurança, aguarde um pouco antes de repetir esta ação.";
  }

  if (normalized.includes("token has expired") || normalized.includes("otp expired")) {
    return "Este link expirou. Solicite um novo link e tente novamente.";
  }

  if (normalized.includes("invalid token") || normalized.includes("otp")) {
    return "O link usado é inválido ou já foi utilizado. Solicite um novo.";
  }

  return raw;
}

function navigate(route) {
  if (!routes.includes(route)) {
    route = "home";
  }

  state.currentRoute = route;

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = $(`screen-${route}`);
  if (target) {
    target.classList.add("active");
  }

  if (route !== "provider-profile") {
    const container = $("publicProfileContainer");
    if (container) {
      container.innerHTML = "";
    }
  }

  requestAnimationFrame(() => {
    document.body.classList.remove("topbar-hidden");

    const topbar = document.querySelector(".topbar");
    const topbarHeight = topbar?.offsetHeight || 0;
    const extraSpacing = 16;
    const targetTop = target ? target.getBoundingClientRect().top + window.scrollY : 0;

    window.scrollTo({
      top: Math.max(targetTop - topbarHeight - extraSpacing, 0),
      behavior: "instant"
    });
  });
}

function refreshAuthUI() {
  const logged = !!state.currentUser;

  $("btnDashboard")?.classList.toggle("hidden", !logged);
  $("btnLogout")?.classList.toggle("hidden", !logged);

  document.querySelector('[data-route="login"]')?.classList.toggle("hidden", logged);
  document.querySelector('[data-route="register"]')?.classList.toggle("hidden", logged);
}

function setupTopbarScroll() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateTopbar() {
    const currentScrollY = Math.max(window.scrollY, 0);
    const scrollDelta = currentScrollY - lastScrollY;
    const passedThreshold = currentScrollY > 120;

    document.body.classList.toggle("topbar-scrolled", passedThreshold);

    if (passedThreshold && scrollDelta > 8) {
      document.body.classList.add("topbar-hidden");
    } else if (scrollDelta < -8 || currentScrollY <= 120) {
      document.body.classList.remove("topbar-hidden");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateTopbar);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", () => {
    document.body.classList.remove("topbar-hidden");
  });

  updateTopbar();
}

function formatCoords(lat, lng) {
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function isBoostActive(provider) {
  if (!provider) return false;
  if (!provider.boost_ate) return !!provider.boost_ativo;
  return new Date(provider.boost_ate) > new Date();
}

function isLaunchPromoActive(provider) {
  if (!provider?.assinatura_ate) return false;
  return new Date(provider.assinatura_ate) > new Date();
}

function formatDateTimeBR(dateString) {
  if (!dateString) return "não definido";

  const date = new Date(dateString);

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createMetaPill(text) {
  const span = document.createElement("span");
  span.className = "meta-pill";
  span.textContent = text;
  return span;
}

function toWhatsappLink(phone, message) {
  const normalized = normalizeWhatsappBR(phone);

  if (!normalized) return null;

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message || "")}`;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    [lat1, lon1, lat2, lon2].some(v => typeof v !== "number" || Number.isNaN(v))
  ) {
    return null;
  }

  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function sortProviders(list) {
  return [...list].sort((a, b) => {
    const boostA = isBoostActive(a) ? 1 : 0;
    const boostB = isBoostActive(b) ? 1 : 0;
    if (boostB !== boostA) return boostB - boostA;

    const ratingA = Number(a.avaliacao_media || 0);
    const ratingB = Number(b.avaliacao_media || 0);
    if (ratingB !== ratingA) return ratingB - ratingA;

    const expA = Number(a.experiencia_anos || 0);
    const expB = Number(b.experiencia_anos || 0);
    if (expB !== expA) return expB - expA;

    const distA = typeof a.distanceKm === "number" ? a.distanceKm : Infinity;
    const distB = typeof b.distanceKm === "number" ? b.distanceKm : Infinity;
    return distA - distB;
  });
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  });
}

async function fetchProviders() {
  if (!supabase) {
    showAlert("Supabase não configurado corretamente.", "error");
    return;
  }

  const { data, error } = await supabase
    .from("prestadores")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    showAlert("Erro ao carregar prestadores.", "error");
    return;
  }

  state.providers = (data || []).filter(provider => !provider.bloqueado);
}

function renderSearchEmptyState(mode = "initial", options = {}) {
  const container = $("providersList");
  const resultsCount = $("resultsCount");

  if (!container || !resultsCount) return;

  if (mode === "initial") {
    resultsCount.textContent = "Preencha a busca para começar";
    container.innerHTML = `
      <div class="card search-empty-card">
        <h3>Encontre prestadores perto de você</h3>
        <p class="muted">
          Digite o serviço que você procura e, se quiser resultados mais próximos, permita o acesso à sua localização.
        </p>
        <div class="search-empty-tips">
          <span class="meta-pill">Ex: eletricista</span>
          <span class="meta-pill">Ex: encanador</span>
          <span class="meta-pill">Ex: diarista</span>
        </div>
      </div>
    `;
    return;
  }

  if (mode === "missing-location") {
    resultsCount.textContent = "Localização não definida";
    container.innerHTML = `
      <div class="card search-empty-card">
        <h3>Ative sua localização para ordenar por proximidade</h3>
        <p class="muted">
          Você ainda pode buscar pelo serviço mesmo sem localização, mas os resultados ficarão mais gerais e sem distância precisa.
        </p>
      </div>
    `;
    return;
  }

  if (mode === "no-results") {
    const serviceText = escapeHtml(options.service || "serviço informado");

    resultsCount.textContent = "0 resultados";
    container.innerHTML = `
      <div class="card search-empty-card">
        <h3>Nenhum prestador encontrado</h3>
        <p class="muted">
          Não encontramos resultados para <strong>${serviceText}</strong> com os filtros atuais.
        </p>
        <div class="search-empty-tips">
          <span class="meta-pill">Tente outro nome de serviço</span>
          <span class="meta-pill">Aumente o raio de busca</span>
          <span class="meta-pill">Use sua localização</span>
        </div>
      </div>
    `;
  }
}

function renderProviders(list) {
  const container = $("providersList");
  const template = $("providerCardTemplate");
  if (!container || !template) return;

  container.innerHTML = "";
  $("resultsCount").textContent = `${list.length} resultado${list.length === 1 ? "" : "s"}`;

  if (!list.length) {
    renderSearchEmptyState("no-results");
    return;
  }

  list.forEach(provider => {
    if (provider.bloqueado) return;

    const fragment = template.content.cloneNode(true);
    const servicesText = getProviderServices(provider).join(", ") || "Serviço não informado";

    fragment.querySelector(".provider-name").textContent = provider.nome || "Prestador";
    fragment.querySelector(".provider-service").textContent = servicesText;
    fragment.querySelector(".provider-description").textContent =
      provider.descricao || "Sem descrição cadastrada.";

    const badges = fragment.querySelector(".provider-badges");

        if (isBoostActive(provider)) {
      const badge = document.createElement("span");
      badge.className = "badge badge-boost";
      badge.textContent = "Boost ativo";
      badges.appendChild(badge);
    }

    if (provider.atende_emergencia) {
      const badge = document.createElement("span");
      badge.className = "badge badge-emergency";
      badge.textContent = "Emergência";
      badges.appendChild(badge);
    }

    const meta = fragment.querySelector(".provider-meta");
    meta.appendChild(createMetaPill(`${Number(provider.experiencia_anos || 0)} anos de experiência`));
    meta.appendChild(createMetaPill(formatCurrency(provider.preco_medio)));
    meta.appendChild(createMetaPill(`⭐ ${Number(provider.avaliacao_media || 0).toFixed(1)}`));
    meta.appendChild(createMetaPill(`Atende até ${Number(provider.raio_km || 0)} km`));

    if (typeof provider.distanceKm === "number") {
      meta.appendChild(createMetaPill(`${provider.distanceKm.toFixed(1)} km de você`));
    }

    const viewProfileBtn = fragment.querySelector(".btn-view-profile");
viewProfileBtn.addEventListener("click", async () => {
  const url = new URL(window.location.href);
  url.searchParams.set("prestador", provider.id);
  window.history.pushState({}, "", url);

  navigate("provider-profile");

  const profileContainer = $("publicProfileContainer");
  if (profileContainer) {
    profileContainer.innerHTML = `
      <div class="card">
        <h3>Carregando perfil...</h3>
        <p class="muted">Estamos abrindo o perfil do prestador.</p>
      </div>
    `;
  }

  try {
    await loadPublicProfile();
  } catch (error) {
    console.error("Erro ao abrir perfil público:", error);
    showAlert("Não foi possível abrir o perfil do prestador.", "error");
  }
});

    const whatsappBtn = fragment.querySelector(".btn-whatsapp");
    whatsappBtn.href = toWhatsappLink(
      provider.whatsapp,
      `Olá ${provider.nome || ""}, encontrei seu perfil no seufaztudo e gostaria de solicitar um orçamento.`
    );

    whatsappBtn.addEventListener("click", async () => {
      await incrementWhatsappClicks(provider.id);
    });

    container.appendChild(fragment);
  });
}

async function incrementProviderViews(providerId) {
  if (!providerId || !supabase) return;

  const provider = state.providers.find(p => p.id === providerId);
  const currentViews = Number(provider?.visualizacoes || 0);
  const newViews = currentViews + 1;

  const { error } = await supabase
    .from("prestadores")
    .update({ visualizacoes: newViews })
    .eq("id", providerId);

  if (error) {
    console.error("Erro ao incrementar visualizações:", error);
    return;
  }

  if (provider) {
    provider.visualizacoes = newViews;
  }

  if (state.currentProviderProfile?.id === providerId) {
    state.currentProviderProfile.visualizacoes = newViews;
    if ($("statViews")) {
      $("statViews").textContent = String(newViews);
    }
  }
}

async function incrementWhatsappClicks(providerId) {
  if (!providerId || !supabase) return;

  const provider = state.providers.find(p => p.id === providerId);
  const currentClicks = Number(provider?.cliques_whatsapp || 0);
  const newClicks = currentClicks + 1;

  const { error } = await supabase
    .from("prestadores")
    .update({ cliques_whatsapp: newClicks })
    .eq("id", providerId);

  if (error) {
    console.error("Erro ao incrementar cliques no WhatsApp:", error);
    return;
  }

  if (provider) {
    provider.cliques_whatsapp = newClicks;
  }

  if (state.currentProviderProfile?.id === providerId) {
    state.currentProviderProfile.cliques_whatsapp = newClicks;
    if ($("statWhatsapp")) {
      $("statWhatsapp").textContent = String(newClicks);
    }
  }
}

function bindPublicProfile() {
  $("btnBackToHomeFromProfile")?.addEventListener("click", () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("prestador");
    window.history.pushState({}, "", url);
    navigate("home");
    renderSearchEmptyState("initial");
  });
}

function bindNavigation() {
  document.querySelectorAll("[data-route]").forEach(button => {
    button.addEventListener("click", event => {
      if (button.tagName === "A") {
        event.preventDefault();
      }

      const route = button.getAttribute("data-route");

      if (route === "dashboard" && !state.currentUser) {
        showAlert("Faça login para acessar o dashboard.", "error");
        navigate("login");
        return;
      }

      navigate(route);
    });
  });

    $("btnLogout")?.addEventListener("click", async () => {
  try {
    await supabase.auth.signOut();

    showAlert("Você saiu da conta.", "info");

    navigate("home");
  } catch (error) {
    console.error(error);
    showAlert("Erro ao sair da conta.", "error");
  }
});
}

function bindHome() {
  $("btnUseLocation")?.addEventListener("click", async () => {
    try {
      const coords = await getCurrentPosition();
      state.userLocation = coords;
      $("userLocationText").textContent = formatCoords(coords.latitude, coords.longitude);
      $("searchLocationHelp").textContent =
        "Localização ativa. Agora a busca pode ordenar e filtrar por proximidade.";
      showAlert("Localização capturada com sucesso.", "success");
    } catch (error) {
      console.error(error);
      state.userLocation = null;
      $("userLocationText").textContent = "não definida";
      $("searchLocationHelp").textContent =
        "Não foi possível usar sua localização. Você ainda pode buscar pelo serviço, mas os resultados serão mais gerais.";
      renderSearchEmptyState("missing-location");
      showAlert("Não foi possível obter sua localização. Você ainda pode buscar sem ela.", "info");
    }
  });

  $("btnSearch")?.addEventListener("click", handleSearchProviders);

  $("btnClearSearch")?.addEventListener("click", () => {
    $("searchService").value = "";
    $("searchRadius").value = "10";
    $("searchServiceSuggestions")?.classList.add("hidden");
    $("searchServiceHint")?.classList.add("hidden");
    renderSearchEmptyState("initial");
  });
}

async function handleSearchProviders() {
  const rawService = $("searchService").value.trim();
  const service = normalizeService(rawService);
  const radiusKm = Number($("searchRadius").value || 10);

  if (!rawService) {
    showAlert("Digite o serviço que você está procurando.", "error");
    renderSearchEmptyState("initial");
    return;
  }

  if (!supabase) {
    showAlert("Supabase não configurado corretamente.", "error");
    return;
  }

  try {
    let results = null;

    if (
      state.userLocation &&
      typeof supabase.rpc === "function"
    ) {
      const rpcResponse = await supabase.rpc("buscar_prestadores", {
        user_lat: state.userLocation.latitude,
        user_lng: state.userLocation.longitude,
        raio_metros: radiusKm * 1000,
        servico_busca: service
      });

      if (!rpcResponse.error && Array.isArray(rpcResponse.data)) {
        results = rpcResponse.data
          .map(provider => ({
            ...provider,
            distanceKm:
              typeof provider.distancia === "number"
                ? provider.distancia / 1000
                : calculateDistanceKm(
                    state.userLocation.latitude,
                    state.userLocation.longitude,
                    Number(provider.latitude),
                    Number(provider.longitude)
                  )
          }))
          .filter(provider => !provider.bloqueado)
          .filter(provider => providerMatchesService(provider, service))
          .filter(provider => typeof provider.distanceKm === "number" && provider.distanceKm <= radiusKm);
      }
    }

        if (!results) {
      const { data, error } = await supabase
        .from("prestadores")
        .select("*");

      if (error) {
        console.error("Erro ao inserir avaliação:", error);
        throw error;
      }

      results = (data || [])
        .filter(provider => !provider.bloqueado)
        .filter(provider => providerMatchesService(provider, service))
        .map(provider => {
          let distanceKm = null;

          if (
            state.userLocation &&
            Number.isFinite(Number(provider.latitude)) &&
            Number.isFinite(Number(provider.longitude))
          ) {
            distanceKm = calculateDistanceKm(
              state.userLocation.latitude,
              state.userLocation.longitude,
              Number(provider.latitude),
              Number(provider.longitude)
            );
          }

          return {
            ...provider,
            distanceKm
          };
        })
        .filter(provider => {
          if (!state.userLocation) return true;
          if (provider.distanceKm === null) return false;
          return provider.distanceKm <= radiusKm;
        });
    }

    if (!results.length) {
      renderSearchEmptyState("no-results", { service: rawService });
      return;
    }

    $("resultsCount").textContent = `${results.length} resultado${results.length === 1 ? "" : "s"}`;
    renderProviders(sortProviders(results));
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Erro ao buscar prestadores.", "error");
  }
}

function bindLogin() {
  $("formLogin")?.addEventListener("submit", async event => {
    event.preventDefault();

    if (!supabase) {
      showAlert("Supabase não configurado corretamente.", "error");
      return;
    }

    const submitBtn = $("formLogin")?.querySelector('button[type="submit"]');
    const email = $("loginEmail").value.trim();
    const password = $("loginPassword").value;

    if (!isValidEmail(email)) {
      showAlert("Digite um e-mail válido.", "error");
      return;
    }

    if (!password) {
      showAlert("Digite sua senha.", "error");
      return;
    }

    try {
  setButtonLoading(submitBtn, true, "Entrando...");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("Erro no login:", error);
    throw error;
  }

  showAlert("Login recebido. Finalizando entrada...", "info");
} catch (error) {
  console.error(error);
  showAlert(mapAuthErrorMessage(error), "error");
} finally {
  setButtonLoading(submitBtn, false);
}
  });

  $("btnForgotPassword")?.addEventListener("click", async () => {
  const email = $("loginEmail")?.value?.trim();

  if (!email) {
    showAlert("Digite seu e-mail para recuperar a senha.", "error");
    return;
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`
    });

    if (error) {
      console.error(error);
      throw error;
    }

        showAlert("E-mail de recuperação enviado. Verifique sua caixa de entrada e também spam, lixo eletrônico ou promoções.", "success");
  } catch (error) {
    console.error(error);
    showAlert("Erro ao enviar e-mail de recuperação.", "error");
  }
});
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isValidPhone(value) {
  return /^\d{10,13}$/.test(String(value || "").replace(/\D/g, ""));
}

function safeTrim(value, max = 255) {
  return String(value || "").trim().slice(0, max);
}

function toPositiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function bindRegister() {
  $("btnRegisterLocation")?.addEventListener("click", async () => {
    try {
      const coords = await getCurrentPosition();
      state.providerRegisterLocation = coords;
      $("providerLocationText").textContent = formatCoords(coords.latitude, coords.longitude);
      showAlert("Localização do prestador capturada.", "success");
    } catch (error) {
      showAlert("Não foi possível obter sua localização.", "error");
    }
  });

    $("btnAddRegisterService")?.addEventListener("click", () => {
    addRegisterAdditionalService();
  });

  $("registerAdditionalService")?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      addRegisterAdditionalService();
    }
  });

  renderRegisterServices();

  $("formRegister")?.addEventListener("submit", async event => {
    event.preventDefault();

    if (!supabase) {
      showAlert("Supabase não configurado corretamente.", "error");
      return;
    }

    if (!state.providerRegisterLocation) {
      showAlert("Defina a localização do prestador antes de continuar.", "error");
      return;
    }

    const primaryService = sanitizeSingleService($("registerService").value);
    const allServices = buildProviderServices(primaryService, state.registerAdditionalServices);

    const payload = {
      nome: safeTrim($("registerName").value, 120),
      email: safeTrim($("registerEmail").value, 160),
      password: $("registerPassword").value,
      passwordConfirm: $("registerPasswordConfirm").value,
      whatsapp: normalizeWhatsappBR($("registerWhatsapp").value),
      servicos: allServices,
      servico: primaryService,
      experiencia_anos: toPositiveNumber($("registerExperience").value),
      preco_medio: toPositiveNumber($("registerPrice").value),
      raio_km: toPositiveNumber($("registerRadius").value),
      descricao: safeTrim($("registerDescription").value, 1000),
      atende_emergencia: $("registerEmergency").checked,
      latitude: Number(state.providerRegisterLocation.latitude),
      longitude: Number(state.providerRegisterLocation.longitude)
    };

    if (!payload.nome || payload.nome.length < 3) {
      showAlert("Nome inválido.", "error");
      return;
    }

    if (!isValidEmail(payload.email)) {
      showAlert("Email inválido.", "error");
      return;
    }

    if (!payload.password || payload.password.length < 6) {
      showAlert("A senha deve ter pelo menos 6 caracteres.", "error");
      return;
    }

    if (payload.password !== payload.passwordConfirm) {
      showAlert("As senhas do cadastro não coincidem.", "error");
      return;
    }

    if (!payload.whatsapp) {
      showAlert("Digite um WhatsApp válido com DDD.", "error");
      return;
    }

    if (!payload.servicos.length) {
      showAlert("Informe pelo menos um serviço.", "error");
      return;
    }

    if (
      payload.experiencia_anos === null ||
      payload.preco_medio === null ||
      payload.raio_km === null
    ) {
      showAlert("Preencha corretamente experiência, preço e raio.", "error");
      return;
    }

          const submitBtn = $("formRegister")?.querySelector('button[type="submit"]');

    try {
      setButtonLoading(submitBtn, true, "Criando conta...");

      const { count, error: countError } = await supabase
        .from("prestadores")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      const promoLancamento = Number(count || 0) < 500;
    const assinaturaAte =
      promoLancamento
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const pendingProfile = {
        email: payload.email,
        nome: payload.nome,
        descricao: payload.descricao,
        servico: payload.servico,
        servicos: payload.servicos,
        experiencia_anos: payload.experiencia_anos,
        preco_medio: payload.preco_medio,
        whatsapp: payload.whatsapp,
        atende_emergencia: payload.atende_emergencia,
        raio_km: payload.raio_km,
        latitude: payload.latitude,
        longitude: payload.longitude,
        assinatura_ate: assinaturaAte,
        promo_lancamento: promoLancamento,
        boost_ativo: false,
        avaliacao_media: 0,
        visualizacoes: 0,
        cliques_whatsapp: 0,
        bloqueado: false,
        created_at_client: new Date().toISOString()
      };

      savePendingProviderProfile(pendingProfile);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            pending_provider_profile: pendingProfile
          }
        }
      });

      if (authError) throw authError;

      const user = authData.user || null;
      const session = authData.session || null;

      state.currentUser = session?.user || null;
      refreshAuthUI();

      if (session?.user?.id) {
        await loadMyProvider(true);
      } else {
        state.currentProviderProfile = null;
      }

      $("formRegister").reset();
      state.providerRegisterLocation = null;
      $("providerLocationText").textContent = "não definida";
      state.registerAdditionalServices = [];
      renderRegisterServices();
    

      await fetchProviders();
      updateDashboardUI();

      if (session?.user?.id && state.currentProviderProfile) {
        navigate("dashboard");
        showAlert("Cadastro concluído com sucesso. Sua conta já entrou automaticamente.", "success");
      } else {
        navigate("login");
        showAlert(
          "Conta criada com sucesso. Agora confirme seu e-mail no link enviado para sua caixa de entrada. Depois disso, ao entrar, você será levado direto ao dashboard.",
          "success"
        );
      }
    } catch (error) {
      console.error(error);
      showAlert(
        mapAuthErrorMessage(error) ||
        "Erro ao cadastrar prestador. Revise o RLS da tabela prestadores e tente novamente.",
        "error"
      );
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

function setProfileEditMode(isEditing) {
  state.isEditingProfile = isEditing;

  const ids = [
    "profileName",
    "profileWhatsapp",
    "profileService",
    "profileExperience",
    "profilePrice",
    "profileRadius",
    "profileDescription"
  ];

  ids.forEach(id => {
    const el = $(id);
    if (el) {
      el.disabled = !isEditing;
    }
  });

  if ($("profileEmergency")) {
    $("profileEmergency").disabled = !isEditing;
  }

  if ($("btnProfileLocation")) {
    $("btnProfileLocation").disabled = !isEditing;
  }

    if ($("profileAdditionalService")) {
    $("profileAdditionalService").disabled = !isEditing;
  }

  if ($("btnAddProfileService")) {
    $("btnAddProfileService").disabled = !isEditing;
  }

  const additionalHint = $("profileAdditionalServiceHint");
  if (additionalHint) {
    additionalHint.classList.toggle("hidden", !isEditing);
  }

  renderProfileServices();

  $("btnSaveProfile")?.classList.toggle("hidden", !isEditing);
  $("btnCancelEditProfile")?.classList.toggle("hidden", !isEditing);
  $("btnToggleEditProfile")?.classList.toggle("hidden", isEditing || !state.currentProviderProfile);

  const profileServiceHint = $("profileServiceHint");
  if (profileServiceHint) {
    profileServiceHint.classList.toggle("hidden", !isEditing);
  }
}

function bindDashboard() {
    $("btnAddProfileService")?.addEventListener("click", () => {
    if (!state.isEditingProfile) {
      showAlert("Ative a edição do perfil antes de adicionar serviços.", "error");
      return;
    }
    addProfileAdditionalService();
  });

  $("btnRefreshUrgentRequests")?.addEventListener("click", async () => {
  const button = $("btnRefreshUrgentRequests");

  try {
    setButtonLoading(button, true, "Atualizando chamados...");
    await loadProviderUrgentCalls();
    showAlert("Chamados atualizados com sucesso.", "success");
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Erro ao atualizar chamados.", "error");
  } finally {
    setButtonLoading(button, false);
  }
});

  $("profileAdditionalService")?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!state.isEditingProfile) return;
      addProfileAdditionalService();
    }
  });
  
  $("btnToggleEditProfile")?.addEventListener("click", async () => {
  if (!state.currentProviderProfile) {
    await loadMyProvider(true);
  }

  if (!state.currentProviderProfile) {
    showAlert("Seu perfil de prestador ainda não foi encontrado.", "error");
    return;
  }

    state.profileDraftBackup = {
      nome: $("profileName")?.value || "",
      whatsapp: $("profileWhatsapp")?.value || "",
      servico_principal: $("profileService")?.value || "",
      servicos_adicionais: [...state.profileAdditionalServices],
      experiencia_anos: $("profileExperience")?.value || "",
      preco_medio: $("profilePrice")?.value || "",
      raio_km: $("profileRadius")?.value || "",
      descricao: $("profileDescription")?.value || "",
      atende_emergencia: $("profileEmergency")?.checked || false,
      latitude: state.currentProviderProfile?.latitude ?? null,
      longitude: state.currentProviderProfile?.longitude ?? null
    };

    const currentServices = getProviderServices(state.currentProviderProfile);
    state.profileAdditionalServices = currentServices.slice(1);
    renderProfileServices();

    setProfileEditMode(true);
  });

  $("btnCancelEditProfile")?.addEventListener("click", () => {
    const backup = state.profileDraftBackup;

    if (!backup) {
      setProfileEditMode(false);
      return;
    }

    $("profileName").value = backup.nome || "";
    $("profileWhatsapp").value = backup.whatsapp || "";
    $("profileService").value = backup.servico_principal || "";
    state.profileAdditionalServices = Array.isArray(backup.servicos_adicionais)
      ? [...backup.servicos_adicionais]
      : [];
    renderProfileServices();
    $("profileExperience").value = backup.experiencia_anos || 0;
    $("profilePrice").value = backup.preco_medio || 0;
    $("profileRadius").value = String(backup.raio_km || 10);
    $("profileDescription").value = backup.descricao || "";
    $("profileEmergency").checked = !!backup.atende_emergencia;

    state.currentProviderProfile.latitude = backup.latitude;
    state.currentProviderProfile.longitude = backup.longitude;

    if (backup.latitude && backup.longitude) {
      $("profileLocationText").textContent = formatCoords(backup.latitude, backup.longitude);
    } else {
      $("profileLocationText").textContent = "não definida";
    }

    state.profileDraftBackup = null;
    setProfileEditMode(false);
    showAlert("Alterações descartadas.", "info");
  });

  $("btnProfileLocation")?.addEventListener("click", async () => {
    if (!state.isEditingProfile) {
      showAlert("Ative a edição do perfil antes de atualizar a localização.", "error");
      return;
    }

    try {
      const coords = await getCurrentPosition();

      state.currentProviderProfile.latitude = coords.latitude;
      state.currentProviderProfile.longitude = coords.longitude;

      $("profileLocationText").textContent = formatCoords(coords.latitude, coords.longitude);
      showAlert("Localização atualizada.", "success");
    } catch (error) {
      console.error(error);
      showAlert("Não foi possível atualizar a localização.", "error");
    }
  });

 $("formProfile")?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!supabase) {
    showAlert("Supabase não configurado corretamente.", "error");
    return;
  }

  if (!state.currentUser) {
    showAlert("Faça login novamente para salvar seu perfil.", "error");
    navigate("login");
    return;
  }

  const button = $("btnSaveProfile");

  try {
    setButtonLoading(button, true, "Salvando...");

    if (!state.currentProviderProfile?.id) {
      await loadMyProvider(true);
    }

    if (!state.currentProviderProfile?.id) {
      throw new Error("Seu perfil de prestador não foi encontrado.");
    }

    const primaryService = sanitizeSingleService($("profileService")?.value);
    const allServices = buildProviderServices(primaryService, state.profileAdditionalServices);

    if (!$("profileName")?.value?.trim()) {
      throw new Error("Digite seu nome.");
    }

    if (!primaryService) {
      throw new Error("Digite um serviço principal válido.");
    }

    const whatsapp = normalizeWhatsappBR($("profileWhatsapp")?.value);
    if (!whatsapp) {
      throw new Error("Digite um WhatsApp válido com DDD.");
    }

    const latitude =
      Number.isFinite(Number(state.currentProviderProfile?.latitude))
        ? Number(state.currentProviderProfile.latitude)
        : null;

    const longitude =
      Number.isFinite(Number(state.currentProviderProfile?.longitude))
        ? Number(state.currentProviderProfile.longitude)
        : null;

    const updatePayload = {
      nome: safeTrim($("profileName")?.value, 120),
      whatsapp,
      servico: primaryService,
      servicos: allServices,
      experiencia_anos: toPositiveNumber($("profileExperience")?.value) ?? 0,
      preco_medio: toPositiveNumber($("profilePrice")?.value) ?? 0,
      raio_km: toPositiveNumber($("profileRadius")?.value) ?? 10,
      descricao: safeTrim($("profileDescription")?.value, 1000),
      atende_emergencia: !!$("profileEmergency")?.checked,
      latitude,
      longitude,
      email: safeTrim(state.currentUser.email, 160)
    };

    const response = await withRequestTimeout(
      supabase
        .from("prestadores")
        .update(updatePayload)
        .eq("id", state.currentProviderProfile.id)
        .eq("user_id", state.currentUser.id)
        .select("*")
        .maybeSingle(),
      15000,
      "O salvamento do perfil demorou demais. Verifique sua conexão e tente novamente."
    );

    const { data, error } = response;

    if (error) {
      console.error("Erro ao salvar perfil:", error);
      throw error;
    }

    if (!data) {
      throw new Error("O perfil não retornou após a atualização.");
    }

    state.currentProviderProfile = data;
    state.profileDraftBackup = null;

    updateDashboardUI();
    setProfileEditMode(false);

    showAlert("Perfil atualizado com sucesso.", "success");
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Erro ao salvar perfil.", "error");
  } finally {
    setButtonLoading(button, false);
  }
});
}

function bindChangePassword() {
  $("formChangePassword")?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!supabase) {
    showAlert("Supabase não configurado corretamente.", "error");
    return;
  }

  if (!state.currentUser) {
    showAlert("Faça login para alterar sua senha.", "error");
    navigate("login");
    return;
  }

  const button = $("formChangePassword")?.querySelector('button[type="submit"]');
  const newPassword = $("newPassword")?.value || "";
  const confirmNewPassword = $("confirmNewPassword")?.value || "";

  if (newPassword.length < 6) {
    showAlert("A nova senha deve ter pelo menos 6 caracteres.", "error");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    showAlert("A confirmação da nova senha não confere.", "error");
    return;
  }

  try {
    setButtonLoading(button, true, "Atualizando senha...");

    const response = await withRequestTimeout(
      supabase.auth.updateUser({
        password: newPassword
      }),
      15000,
      "A troca de senha demorou demais. Tente novamente."
    );

    const { error } = response;

    if (error) {
  console.error("Erro ao atualizar senha:", error);

  if (String(error.message || "").toLowerCase().includes("rate limit")) {
    throw new Error("Muitas tentativas em pouco tempo. Aguarde cerca de 1 a 2 minutos e tente novamente.");
  }

  throw error;
}

    $("newPassword").value = "";
    $("confirmNewPassword").value = "";
    state.isPasswordRecoveryMode = false;
    updatePasswordRecoveryUI();

    showAlert("Senha atualizada com sucesso.", "success");
  } catch (error) {
    console.error(error);
    showAlert(mapAuthErrorMessage(error), "error");
  } finally {
    setButtonLoading(button, false);
  }
});
}

function bindPayments() {
  $("btnBoost")?.addEventListener("click", async () => {
  const button = $("btnBoost");

  try {
    setButtonLoading(button, true, "Abrindo boost...");

    const result = await startCheckoutFlow("boost");

    showAlert("Checkout do boost criado com sucesso.", "success");

    if (result?.url) {
      window.location.href = result.url;
      return;
    }

    throw new Error("A InfinitePay não retornou a URL do checkout.");
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Erro ao iniciar boost.", "error");
  } finally {
    setButtonLoading(button, false);
  }
});

  $("btnSubscription")?.addEventListener("click", async () => {
  const button = $("btnSubscription");

  try {
    setButtonLoading(button, true, "Abrindo assinatura...");

    const result = await startCheckoutFlow("assinatura");

    showAlert("Checkout da assinatura criado com sucesso.", "success");

    if (result?.url) {
      window.location.href = result.url;
      return;
    }

    throw new Error("A InfinitePay não retornou a URL do checkout.");
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Erro ao iniciar assinatura.", "error");
  } finally {
    setButtonLoading(button, false);
  }
});

  $("btnRefreshPlan")?.addEventListener("click", async () => {
    const button = $("btnRefreshPlan");

    try {
      await syncCurrentProviderPaymentStatus({
        button,
        loadingText: "Atualizando...",
        showAlerts: true
      });
    } catch (error) {
      console.error(error);
    }
  });
}

async function startCheckout(tipo) {
  if (!state.currentUser) {
    showAlert("Faça login como prestador.", "error");
    return;
  }

  if (!state.currentProviderProfile) {
    await loadMyProvider(true);
  }

  if (!state.currentProviderProfile) {
    showAlert("Seu perfil de prestador ainda não foi carregado.", "error");
    return;
  }

  const button = tipo === "boost" ? $("btnBoost") : $("btnSubscription");
  const loadingText =
    tipo === "boost" ? "Abrindo boost..." : "Abrindo assinatura...";

  try {
    setButtonLoading(button, true, loadingText);

    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Sessão inválida. Faça login novamente.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        tipo,
        prestadorId: state.currentProviderProfile.id,
        nomePrestador: state.currentProviderProfile.nome,
        emailPrestador: state.currentUser.email
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error || "Erro ao iniciar pagamento.");
    }

    if (!data.checkoutUrl) {
      throw new Error("A URL do checkout não foi retornada.");
    }

    showAlert("Redirecionando para o checkout...", "info");
    window.location.assign(data.checkoutUrl);
  } catch (error) {
    console.error(error);

    if (error.name === "AbortError") {
      showAlert(
        "O checkout demorou demais para responder. Verifique se a rota /api/create-checkout está publicada e funcionando.",
        "error"
      );
    } else {
      showAlert(error.message || "Erro ao iniciar pagamento.", "error");
    }
  } finally {
    setButtonLoading(button, false);
  }
}

function bindUrgent() {
  $("btnUrgentLocation")?.addEventListener("click", async () => {
    try {
      const coords = await getCurrentPosition();
      state.urgentLocation = coords;
      $("urgentLocationText").textContent = formatCoords(coords.latitude, coords.longitude);
      $("urgentLocationHelp").textContent =
        "Localização capturada com sucesso. Agora o sistema pode buscar prestadores próximos com mais precisão.";
      showAlert("Localização do chamado capturada.", "success");
    } catch (error) {
      console.error(error);
      state.urgentLocation = null;
      $("urgentLocationText").textContent = "não definido";
      $("urgentLocationHelp").textContent =
        "Não foi possível capturar sua localização agora. Tente novamente em um local com melhor sinal ou recarregue a página antes de enviar.";
      showAlert("Não foi possível obter sua localização.", "error");
    }
  });

  $("formUrgent")?.addEventListener("submit", async event => {
    event.preventDefault();
    await createUrgentCall();
  });

  $("btnLoadMyUrgentResponses")?.addEventListener("click", async () => {
    await loadMyUrgentResponses();
  });
}

async function createUrgentCall() {
  if (!supabase) {
    showAlert("Supabase não configurado corretamente.", "error");
    return;
  }

  const submitBtn = $("btnSubmitUrgent");

  if (!state.urgentLocation) {
    showAlert("Defina a localização do chamado antes de enviar.", "error");
    return;
  }

  const servico = safeTrim($("urgentService").value, 120);
  const clienteContato = safeTrim($("urgentContact").value, 80);
  const descricao = safeTrim($("urgentDescription").value, 1000);

  const lastCall = localStorage.getItem("lastCallTime");

  if (lastCall && Date.now() - Number(lastCall) < 60000) {
    showAlert("Espere 1 minuto antes de enviar outro chamado.", "error");
    return;
  }

  if (!servico || !clienteContato || !descricao) {
    showAlert("Preencha todos os campos do chamado.", "error");
    return;
  }

  if (servico.length < 2) {
    showAlert("Serviço inválido.", "error");
    return;
  }

  if (clienteContato.length < 8) {
    showAlert("Contato inválido.", "error");
    return;
  }

  try {
    setButtonLoading(submitBtn, true, "Enviando chamado...");

    const { data: chamadoData, error: chamadoError } = await supabase
      .from("chamados")
      .insert({
        servico,
        cliente_contato: clienteContato,
        descricao,
        latitude: state.urgentLocation.latitude,
        longitude: state.urgentLocation.longitude,
        status: "aberto",
        expira_em: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (chamadoError) throw chamadoError;

    state.myUrgentCallId = chamadoData.id;
    localStorage.setItem("lastCallTime", Date.now());

    let nearbyProviders = null;

    if (typeof supabase.rpc === "function") {
      const rpcResponse = await supabase.rpc("buscar_prestadores", {
        user_lat: state.urgentLocation.latitude,
        user_lng: state.urgentLocation.longitude,
        raio_metros: 10000,
        servico_busca: servico || null
      });

      if (!rpcResponse.error && Array.isArray(rpcResponse.data)) {
        nearbyProviders = rpcResponse.data.filter(provider => provider.atende_emergencia);
      }
    }

    if (!nearbyProviders) {
      const { data: providersData, error: providersError } = await supabase
        .from("prestadores")
        .select("*")
        .eq("atende_emergencia", true);

      if (providersError) throw providersError;

      nearbyProviders = (providersData || []).filter(provider => {
        const serviceMatch = providerMatchesService(provider, servico);

        const distanceKm = calculateDistanceKm(
          state.urgentLocation.latitude,
          state.urgentLocation.longitude,
          Number(provider.latitude),
          Number(provider.longitude)
        );

        return serviceMatch && typeof distanceKm === "number" && distanceKm <= 10;
      });
    }

    if (nearbyProviders.length) {
      const destinatarios = nearbyProviders.map(provider => ({
        chamado_id: chamadoData.id,
        prestador_id: provider.id,
        status: "pendente"
      }));

      const { error: destinatariosError } = await supabase
        .from("chamados_destinatarios")
        .insert(destinatarios);

      if (destinatariosError) throw destinatariosError;
    }

    $("formUrgent").reset();
    $("urgentResponsesList").innerHTML = "";
    $("urgentLocationText").textContent = "não definido";
    $("urgentLocationHelp").textContent =
      "Sua localização ajuda a encontrar prestadores próximos mais rápido. Se não funcionar, tente novamente em um local com GPS mais preciso.";
    state.urgentLocation = null;

        showAlert("Chamado urgente enviado com sucesso.", "success");
    await loadMyUrgentResponses();

    if (state.currentProviderProfile) {
      await loadProviderUrgentCalls();
    }
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Erro ao enviar chamado urgente.", "error");
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

async function loadMyProvider(silent = false) {
  if (!supabase) return;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  state.currentUser = session?.user || null;

  if (!state.currentUser) {
    state.currentProviderProfile = null;
    state.isEditingProfile = false;
    state.profileDraftBackup = null;
    refreshAuthUI();
    updateMissingProfileNotice();
    if (!silent) updateDashboardUI();
    return;
  }

  let profile = null;

  try {
    profile = await ensureProviderProfileForCurrentUser();
  } catch (profileError) {
    console.error(profileError);
    if (!silent) {
      showAlert(mapAuthErrorMessage(profileError) || "Erro ao localizar seu perfil de prestador.", "error");
    }
  }

  if (!profile) {
    const { data: byUserId, error: byUserIdError } = await supabase
      .from("prestadores")
      .select("*")
      .eq("user_id", state.currentUser.id)
      .maybeSingle();

    if (byUserIdError) {
      console.error(byUserIdError);
      if (!silent) showAlert("Erro ao carregar seu perfil.", "error");
      return;
    }

    profile = byUserId || null;
  }

  state.currentProviderProfile = profile;
  state.isEditingProfile = false;
  state.profileDraftBackup = null;

  refreshAuthUI();
  updateMissingProfileNotice();
  updateDashboardUI();
  setProfileEditMode(false);

  if (state.currentProviderProfile) {
    await loadProviderUrgentCalls();
  }
}

function updateDashboardUI() {
  const profile = state.currentProviderProfile;
  const logged = !!state.currentUser;

  const profileName = $("profileName");
  const profileWhatsapp = $("profileWhatsapp");
  const profileService = $("profileService");
  const profileExperience = $("profileExperience");
  const profilePrice = $("profilePrice");
  const profileRadius = $("profileRadius");
  const profileDescription = $("profileDescription");
  const profileEmergency = $("profileEmergency");
  const profileLocationText = $("profileLocationText");
  const statViews = $("statViews");
  const statWhatsapp = $("statWhatsapp");
  const statRating = $("statRating");
  const statPlan = $("statPlan");
  const planMessage = $("planMessage");
  const btnBoost = $("btnBoost");
  const providerUrgentCallsList = $("providerUrgentCallsList");

  if (!profile) {
    if (profileName) profileName.value = "";
    if (profileWhatsapp) profileWhatsapp.value = "";
    if (profileService) profileService.value = "";
    if (profileExperience) profileExperience.value = "";
    if (profilePrice) profilePrice.value = "";
    if (profileRadius) profileRadius.value = "10";
    if (profileDescription) profileDescription.value = "";
    if (profileEmergency) profileEmergency.checked = false;
    if (profileLocationText) profileLocationText.textContent = "não definida";

    if (statViews) statViews.textContent = "0";
    if (statWhatsapp) statWhatsapp.textContent = "0";
    if (statRating) statRating.textContent = "0.0";
    if (statPlan) statPlan.textContent = logged ? "Perfil em configuração" : "Sem login";
    if (planMessage) {
      planMessage.textContent = logged
        ? "Sua conta está autenticada. Assim que o perfil de prestador for localizado ou finalizado, o status do seu plano aparecerá aqui."
        : "Faça login para ver o status do plano.";
    }
    if (btnBoost) {
      btnBoost.textContent = "Comprar boost 7 dias • R$ 4,99";
      btnBoost.disabled = !logged;
    }
    if (providerUrgentCallsList) providerUrgentCallsList.innerHTML = "";

    $("btnToggleEditProfile")?.classList.toggle("hidden", !profile);

    setProfileEditMode(false);
    updateMissingProfileNotice();
    return;
  }

  if (profileName) profileName.value = profile.nome || "";
  if (profileWhatsapp) profileWhatsapp.value = profile.whatsapp || "";

  const profileServices = getProviderServices(profile);
  if (profileService) profileService.value = profileServices[0] || profile.servico || "";
  state.profileAdditionalServices = profileServices.slice(1);
  renderProfileServices();

  if (profileExperience) profileExperience.value = profile.experiencia_anos ?? "";
  if (profilePrice) profilePrice.value = profile.preco_medio ?? "";
  if (profileRadius) profileRadius.value = profile.raio_km ?? "";
  if (profileDescription) profileDescription.value = profile.descricao || "";
  if (profileEmergency) profileEmergency.checked = !!profile.atende_emergencia;

  if (profileLocationText) {
    if (profile.latitude && profile.longitude) {
      profileLocationText.textContent = formatCoords(profile.latitude, profile.longitude);
    } else {
      profileLocationText.textContent = "não definida";
    }
  }

  if (statViews) statViews.textContent = String(Number(profile.visualizacoes || 0));
  if (statWhatsapp) statWhatsapp.textContent = String(Number(profile.cliques_whatsapp || 0));
  if (statRating) statRating.textContent = Number(profile.avaliacao_media || 0).toFixed(1);

  const now = new Date();
  const acessoAtivo =
  profile.assinatura_ate && new Date(profile.assinatura_ate) > now;

  const promoLancamentoAtiva =
    !!profile.promo_lancamento && acessoAtivo;

  const assinaturaAtiva =
    !profile.promo_lancamento && acessoAtivo;

  const boostAtivo = isBoostActive(profile);

  $("statPlan").textContent = assinaturaAtiva
  ? "Assinatura ativa"
  : (promoLancamentoAtiva ? "Promoção de lançamento" : "Plano gratuito");

  const partes = [];

  if (assinaturaAtiva) {
    partes.push(`Assinatura ativa até ${formatDateTimeBR(profile.assinatura_ate)}.`);
  } else if (promoLancamentoAtiva) {
    partes.push(`Você está no período promocional gratuito até ${formatDateTimeBR(profile.assinatura_ate)}. Durante esse período, não é necessário contratar assinatura.`);
  } else {
    partes.push("Você está no plano gratuito no momento, sem assinatura ativa.");
  }

    if (boostAtivo) {
    partes.push(`Boost ativo${profile.boost_ate ? ` até ${formatDateTimeBR(profile.boost_ate)}` : ""}.`);
  } else {
    partes.push("Boost inativo. Você pode ativar destaque por 7 dias quando quiser.");
  }

  if (planMessage) planMessage.textContent = partes.join(" ");

  if (btnBoost) {
    if (boostAtivo) {
      btnBoost.textContent = profile.boost_ate
        ? `Boost ativo até ${formatDateTimeBR(profile.boost_ate)}`
        : "Boost ativo";
      btnBoost.disabled = true;
    } else {
      btnBoost.textContent = "Comprar boost 7 dias • R$ 4,99";
      btnBoost.disabled = false;
    }
  }

  $("btnToggleEditProfile")?.classList.remove("hidden");

  updateMissingProfileNotice();

  if (!state.isEditingProfile) {
    setProfileEditMode(false);
  }
  updatePasswordRecoveryUI();
}

function updateMissingProfileNotice() {
  const shouldShow = !!state.currentUser && !state.currentProviderProfile;
  $("providerMissingProfileNotice")?.classList.toggle("hidden", !shouldShow);
}

async function loadProviderUrgentCalls() {
  const container = $("providerUrgentCallsList");
  if (!container) return;

  if (!state.currentProviderProfile) {
    container.innerHTML = `
      <div class="card urgent-empty-card">
        <h3>Faça login</h3>
        <p class="muted">Entre como prestador para visualizar chamados urgentes.</p>
      </div>
    `;
    return;
  }

  const { data, error } = await supabase
    .from("chamados_destinatarios")
    .select(`
      id,
      status,
      chamado:chamados (
        id,
        servico,
        cliente_contato,
        descricao,
        status,
        prestador_escolhido_id,
        created_at,
        expira_em
      )
    `)
    .eq("prestador_id", state.currentProviderProfile.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    showAlert("Erro ao carregar chamados urgentes.", "error");
    container.innerHTML = "";
    return;
  }

  const mergedCalls = (data || [])
    .filter(item => item.chamado)
    .map(item => ({
      ...item.chamado,
      destinatario_status: item.status,
      destinatario_id: item.id
    }));

  for (const call of mergedCalls) {
    if (call.status === "aberto" && call.expira_em && new Date(call.expira_em) <= new Date()) {
      await supabase
        .from("chamados")
        .update({ status: "expirado", encerrado_em: new Date().toISOString() })
        .eq("id", call.id)
        .eq("status", "aberto");

      call.status = "expirado";
    }
  }

  state.providerUrgentCalls = mergedCalls.filter(call => call.status === "aberto");
  renderProviderUrgentCalls(state.providerUrgentCalls);
}

function renderProviderUrgentCalls(calls) {
  const container = $("providerUrgentCallsList");
  if (!container) return;

  container.innerHTML = "";

  if (!calls.length) {
    container.innerHTML = `
      <div class="card urgent-empty-card">
        <h3>Nenhum chamado por enquanto</h3>
        <p class="muted">Quando surgirem chamados próximos da sua região, eles aparecerão aqui automaticamente.</p>
      </div>
    `;
    return;
  }

  calls.forEach(call => {
    const article = document.createElement("article");
    article.className = "provider-card";

    const chosen = call.prestador_escolhido_id === state.currentProviderProfile?.id;
    const alreadyResponded =
      call.destinatario_status === "respondido" || call.destinatario_status === "enviada";

    article.innerHTML = `
      <div class="provider-top">
        <div>
          <h4 class="provider-name">${escapeHtml(call.servico || "Chamado urgente")}</h4>
          <p class="provider-service">Contato: ${escapeHtml(call.cliente_contato || "não informado")}</p>
        </div>
        <div class="provider-badges">
          <span class="badge badge-emergency">Aberto</span>
          ${chosen ? `<span class="badge badge-boost">Você foi escolhido</span>` : ``}
          ${alreadyResponded ? `<span class="badge">Respondido</span>` : ``}
        </div>
      </div>

      <p class="provider-description">${escapeHtml(call.descricao || "")}</p>

      <div class="provider-meta">
        <span class="meta-pill">Criado em ${formatDateTimeBR(call.created_at)}</span>
        <span class="meta-pill">Status: ${escapeHtml(call.status || "aberto")}</span>
      </div>

      <div class="inline-form urgent-response-form">
        <textarea
          id="responseMessage-${call.id}"
          rows="3"
          placeholder="Ex: Posso atender em 20 minutos."
          ${alreadyResponded ? "disabled" : ""}
        ></textarea>

        <div class="actions">
          <button
            class="btn"
            type="button"
            data-respond-call="${call.id}"
            ${alreadyResponded ? "disabled" : ""}
          >
            ${alreadyResponded ? "Resposta enviada" : "Responder chamado"}
          </button>
        </div>
      </div>
    `;

    container.appendChild(article);
  });

  container.querySelectorAll("[data-respond-call]").forEach(button => {
    button.addEventListener("click", async () => {
      const chamadoId = button.getAttribute("data-respond-call");
      const textarea = $(`responseMessage-${chamadoId}`);
      const mensagem = textarea?.value.trim() || "";

      if (!mensagem) {
        showAlert("Digite uma mensagem para responder o chamado.", "error");
        return;
      }

      await respondToUrgentCall(chamadoId, mensagem, button, textarea);
    });
  });
}

async function respondToUrgentCall(chamadoId, mensagem, button = null, textarea = null) {
  const call = state.providerUrgentCalls.find(c => c.id === chamadoId);

  if (call && call.status === "fechado") {
    showAlert("Este chamado já foi encerrado.", "error");
    return;
  }

  if (!state.currentProviderProfile) {
    showAlert("Faça login como prestador.", "error");
    return;
  }

  try {
    setButtonLoading(button, true, "Enviando resposta...");

    const { error } = await supabase
      .from("chamado_respostas")
      .upsert(
        {
          chamado_id: chamadoId,
          prestador_id: state.currentProviderProfile.id,
          mensagem,
          status: "enviada"
        },
        {
          onConflict: "chamado_id,prestador_id"
        }
      );

    if (error) {
      console.error("Erro ao inserir avaliação:", error);
      throw error;
    }

    const { error: destinatarioError } = await supabase
      .from("chamados_destinatarios")
      .update({ status: "respondido" })
      .eq("chamado_id", chamadoId)
      .eq("prestador_id", state.currentProviderProfile.id);

    if (destinatarioError) throw destinatarioError;

    if (textarea) {
      textarea.value = "";
      textarea.disabled = true;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Resposta enviada";
    }

    showAlert("Resposta enviada com sucesso.", "success");
    await loadProviderUrgentCalls();
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Erro ao responder chamado.", "error");
  } finally {
    if (button && button.textContent !== "Resposta enviada") {
      setButtonLoading(button, false);
    }
  }
}

async function loadMyUrgentResponses() {
  const container = $("urgentResponsesList");

  if (!state.myUrgentCallId) {
    container.innerHTML = `
      <div class="card urgent-empty-card">
        <h3>Nenhum chamado enviado ainda</h3>
        <p class="muted">Envie um chamado urgente para ver respostas aqui.</p>
      </div>
    `;
    return;
  }

  const { data, error } = await supabase
    .from("chamado_respostas")
    .select(`
      id,
      mensagem,
      status,
      created_at,
      chamado:chamados(
        id,
        status,
        prestador_escolhido_id,
        expira_em
      ),
      prestador:prestadores (
        id,
        nome,
        servico,
        whatsapp,
        experiencia_anos,
        preco_medio,
        avaliacao_media,
        atende_emergencia
      )
    `)
    .eq("chamado_id", state.myUrgentCallId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    showAlert("Erro ao carregar respostas do chamado.", "error");
    renderUrgentResponses([]);
    return;
  }

  state.myUrgentResponses = data || [];
  renderUrgentResponses(state.myUrgentResponses);
}

function renderUrgentResponses(responses) {
  const container = $("urgentResponsesList");
  if (!container) return;

  container.innerHTML = "";

  const expirado =
    responses.length > 0 &&
    responses[0].chamado?.status === "aberto" &&
    responses[0].chamado?.expira_em &&
    new Date(responses[0].chamado.expira_em) <= new Date();

  const fechado =
    state.myUrgentCallId &&
    responses.some(response => response.chamado?.status === "fechado");

  if (expirado) {
    container.innerHTML = `
      <div class="card urgent-empty-card">
        <h3>Chamado expirado</h3>
        <p class="muted">Nenhum prestador foi escolhido a tempo. Você pode criar um novo chamado.</p>
      </div>
    `;
    return;
  }

  if (!responses.length) {
    container.innerHTML = `
      <div class="card urgent-empty-card">
        <h3>Ainda sem respostas</h3>
        <p class="muted">Assim que os prestadores responderem, elas aparecerão aqui automaticamente.</p>
      </div>
    `;
    return;
  }

  responses.forEach(response => {
    const prestador = response.prestador;
    const escolhido =
      response.chamado?.prestador_escolhido_id &&
      response.chamado?.prestador_escolhido_id === prestador?.id;

    const article = document.createElement("article");
    article.className = "provider-card";

    article.innerHTML = `
      <div class="provider-top">
        <div>
          <h4 class="provider-name">${escapeHtml(prestador?.nome || "Prestador")}</h4>
          <p class="provider-service">${escapeHtml(getProviderServices(prestador).join(", ") || "Serviço")}</p>
        </div>
        <div class="provider-badges">
          ${escolhido ? `<span class="badge badge-boost">Escolhido</span>` : ``}
          ${prestador?.atende_emergencia ? `<span class="badge badge-emergency">Emergência</span>` : ``}
        </div>
      </div>

      <p class="provider-description">${escapeHtml(response.mensagem || "")}</p>

      <div class="provider-meta">
        <span class="meta-pill">${Number(prestador?.experiencia_anos || 0)} anos</span>
        <span class="meta-pill">${formatCurrency(prestador?.preco_medio)}</span>
        <span class="meta-pill">⭐ ${Number(prestador?.avaliacao_media || 0).toFixed(1)}</span>
        <span class="meta-pill">Respondido em ${formatDateTimeBR(response.created_at)}</span>
      </div>

      <div class="provider-actions">
        <a class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer"
          href="${toWhatsappLink(
            prestador?.whatsapp,
            `Olá ${prestador?.nome || ""}, vi sua resposta no seufaztudo e quero falar sobre meu chamado urgente.`
          )}">
          WhatsApp
        </a>
        ${
          fechado
            ? `<button class="btn btn-secondary" type="button" disabled>Chamado encerrado</button>`
            : `<button class="btn" type="button" data-choose-provider="${prestador?.id}">Escolher prestador</button>
               <button class="btn btn-secondary" type="button" data-rate-provider="${prestador?.id}">Avaliar</button>`
        }
      </div>
    `;

    container.appendChild(article);
  });

  container.querySelectorAll("[data-choose-provider]").forEach(button => {
    button.addEventListener("click", async () => {
      const prestadorId = button.getAttribute("data-choose-provider");
      await chooseUrgentProvider(prestadorId, button);
    });
  });

  container.querySelectorAll("[data-rate-provider]").forEach(button => {
    button.addEventListener("click", async () => {
      const prestadorId = button.getAttribute("data-rate-provider");
      await avaliarPrestador(prestadorId);
    });
  });
}

async function chooseUrgentProvider(prestadorId, button = null) {
  if (!state.myUrgentCallId) {
    showAlert("Nenhum chamado encontrado.", "error");
    return;
  }

  try {
    if (button) {
      setButtonLoading(button, true, "Escolhendo...");
    }

    const { data: currentCall, error: currentError } = await supabase
      .from("chamados")
      .select("status")
      .eq("id", state.myUrgentCallId)
      .single();

    if (currentError) throw currentError;

    if (currentCall.status === "fechado") {
      showAlert("Este chamado já foi finalizado.", "error");
      return;
    }

    const { error } = await supabase
      .from("chamados")
      .update({
        status: "fechado",
        prestador_escolhido_id: prestadorId
      })
      .eq("id", state.myUrgentCallId);

    if (error) {
      console.error("Erro ao inserir avaliação:", error);
      throw error;
    }

    showAlert("Prestador escolhido com sucesso.", "success");
    await loadMyUrgentResponses();
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Erro ao escolher prestador.", "error");
  } finally {
    if (button) {
      setButtonLoading(button, false);
    }
  }
}

async function processPaymentReturn() {
  const url = new URL(window.location.href);
  const pagamento = url.searchParams.get("pagamento");
  const orderNsu = url.searchParams.get("order_nsu");

  if (!pagamento) return;

  try {
    if (pagamento === "sucesso") {
      if (!state.currentUser) {
        showAlert(
          orderNsu
            ? `Pagamento concluído. Pedido: ${orderNsu}. Faça login para atualizar seu painel automaticamente.`
            : "Pagamento concluído. Faça login para atualizar seu painel automaticamente.",
          "info"
        );
        return;
      }

      if (!state.currentProviderProfile?.id) {
        await loadMyProvider(true);
      }

      navigate("dashboard");

      await syncCurrentProviderPaymentStatus({
        showAlerts: false
      });

      const profile = state.currentProviderProfile;

      const assinaturaAtiva =
        !!profile?.assinatura_ate &&
        new Date(profile.assinatura_ate) > new Date();

      const boostAtivo = isBoostActive(profile);

      if (assinaturaAtiva || boostAtivo) {
        showAlert(
          orderNsu
            ? `Pagamento confirmado com sucesso. Pedido: ${orderNsu}. Seu painel já foi atualizado.`
            : "Pagamento confirmado com sucesso. Seu painel já foi atualizado.",
          "success"
        );
      } else {
        showAlert(
          orderNsu
            ? `Pagamento identificado. Pedido: ${orderNsu}. Ainda aguardando confirmação final da InfinitePay.`
            : "Pagamento identificado. Ainda aguardando confirmação final da InfinitePay.",
          "info"
        );
      }
    } else if (pagamento === "cancelado") {
      showAlert("O pagamento foi cancelado.", "info");
    } else {
      showAlert("Retorno do pagamento identificado.", "info");
    }
  } catch (error) {
    console.error("Erro no retorno do pagamento:", error);
    showAlert(
      error.message || "Não foi possível atualizar automaticamente o status do pagamento.",
      "error"
    );
  } finally {
    url.searchParams.delete("pagamento");
    url.searchParams.delete("order_nsu");
    window.history.replaceState({}, document.title, url.pathname + url.search);
  }
}

function clearRealtimeChannels() {
  if (!supabase || !state.realtimeChannels.length) return;

  state.realtimeChannels.forEach(channel => {
    supabase.removeChannel(channel);
  });

  state.realtimeChannels = [];
}

function clearUserSessionState() {
  state.currentUser = null;
  state.currentProviderProfile = null;
  state.isEditingProfile = false;
  state.isPasswordRecoveryMode = false;
  state.profileDraftBackup = null;

  state.providerUrgentCalls = [];
  state.myUrgentResponses = [];
  state.myUrgentCallId = null;
  state.profileAdditionalServices = [];

  clearRealtimeChannels();
  refreshAuthUI();
  updateDashboardUI();
  updatePasswordRecoveryUI();
}

function initRealtime() {
  if (!supabase) return;

  clearRealtimeChannels();

  const channelUrgentRecipients = supabase
    .channel("chamados-destinatarios-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chamados_destinatarios"
      },
      async payload => {
        if (!state.currentProviderProfile) return;

        const matchesProvider =
          payload.new?.prestador_id === state.currentProviderProfile.id ||
          payload.old?.prestador_id === state.currentProviderProfile.id;

        if (matchesProvider) {
          showAlert("Atualização em chamados urgentes recebida.", "info");
          await loadProviderUrgentCalls();
        }
      }
    )
    .subscribe();

  const channelResponses = supabase
    .channel("respostas-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chamado_respostas"
      },
      async payload => {
        if (!state.myUrgentCallId) return;

        const matchesCall =
          payload.new?.chamado_id === state.myUrgentCallId ||
          payload.old?.chamado_id === state.myUrgentCallId;

        if (matchesCall) {
          showAlert("Atualização nas respostas do seu chamado.", "success");
          await loadMyUrgentResponses();
        }
      }
    )
    .subscribe();

  const channelStatus = supabase
    .channel("chamados-status")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chamados"
      },
      async payload => {
        const changedCallId = payload.new?.id || payload.old?.id;

        if (changedCallId && changedCallId === state.myUrgentCallId) {
          await loadMyUrgentResponses();
        }

        if (state.currentProviderProfile) {
          await loadProviderUrgentCalls();
        }
      }
    )
    .subscribe();

    const channelProviders = supabase
    .channel("prestadores-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "prestadores"
      },
      async payload => {
        const changedProvider = payload.new || payload.old;
        if (!changedProvider?.id) return;

        const changedProviderId = String(changedProvider.id);

        const providerIndex = state.providers.findIndex(
          provider => String(provider.id) === changedProviderId
        );

        if (providerIndex >= 0 && payload.new) {
          state.providers[providerIndex] = {
            ...state.providers[providerIndex],
            ...payload.new
          };
        }

        if (
          state.currentProviderProfile &&
          String(state.currentProviderProfile.id) === changedProviderId &&
          payload.new
        ) {
          state.currentProviderProfile = {
            ...state.currentProviderProfile,
            ...payload.new
          };
          updateDashboardUI();
        }

        const prestadorParam = new URL(window.location.href).searchParams.get("prestador");
        if (prestadorParam && String(prestadorParam) === changedProviderId) {
          await loadPublicProfile();
        }
      }
    )
    .subscribe();

  state.realtimeChannels.push(
    channelUrgentRecipients,
    channelResponses,
    channelStatus,
    channelProviders
  );
}

function redirectAfterAuth(options = {}) {
  if (!state.currentUser) return;

  const {
    silent = false
  } = options;

  navigate("dashboard");

  if (silent) return;

  if (state.currentProviderProfile) {
    showAlert("Login realizado com sucesso. Você já está no dashboard.", "success");
  } else {
    showAlert(
      "Sua conta foi autenticada com sucesso. Estamos finalizando ou localizando seu perfil de prestador.",
      "info"
    );
  }
}

async function processAuthCallbackFromUrl() {
  if (!supabase) return false;

  const url = new URL(window.location.href);
  const hash = window.location.hash ? window.location.hash.substring(1) : "";
  const hashParams = new URLSearchParams(hash);
  const queryParams = url.searchParams;

  const hasHashTokens =
    hashParams.has("access_token") ||
    hashParams.has("refresh_token") ||
    hashParams.has("type");

  const hasQueryAuth =
    queryParams.has("token_hash") ||
    queryParams.has("type") ||
    queryParams.has("code");

  let handled = false;

  try {
    if (queryParams.has("code")) {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error("Erro ao inserir avaliação:", error);
        throw error;
      }
      handled = true;
    } else if (queryParams.has("token_hash") && queryParams.has("type")) {
      const type = queryParams.get("type");
      const token_hash = queryParams.get("token_hash");

      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash
      });

      if (error) {
        console.error("Erro ao inserir avaliação:", error);
        throw error;
      }
      handled = true;

      if (type === "recovery") {
        state.isPasswordRecoveryMode = true;
        navigate("dashboard");
        updatePasswordRecoveryUI();
        showAlert("Link de recuperação validado. Agora defina sua nova senha no painel.", "success");
      } else {
        state.isPasswordRecoveryMode = false;
        updatePasswordRecoveryUI();
        navigate("dashboard");
        showAlert("E-mail confirmado com sucesso. Sua conta já foi autenticada.", "success");
      }
    } else if (hasHashTokens) {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session?.user) {
        handled = true;

        const authType = hashParams.get("type");

        if (authType === "recovery") {
          state.isPasswordRecoveryMode = true;
          navigate("dashboard");
          updatePasswordRecoveryUI();
          showAlert("Link de recuperação validado. Agora defina sua nova senha no painel.", "success");
        } else {
          state.isPasswordRecoveryMode = false;
          updatePasswordRecoveryUI();
          navigate("dashboard");
          showAlert("E-mail confirmado com sucesso. Sua conta já foi autenticada.", "success");
        }
      }
    }
  } catch (error) {
    console.error(error);
    showAlert(mapAuthErrorMessage(error), "error");
    handled = true;
  }

  if (handled || hasQueryAuth || hasHashTokens) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  return handled;
}

async function handleAuthenticatedUser(event, options = {}) {
  const { silentRedirect = false } = options;

  if (!state.currentUser) return;

  if (event === "PASSWORD_RECOVERY") {
    state.isPasswordRecoveryMode = true;
    navigate("dashboard");
    updatePasswordRecoveryUI();
    showAlert("Link de recuperação validado. Agora defina sua nova senha no painel.", "success");
    return;
  }

  if (event === "USER_UPDATED") {
    updateDashboardUI();
    return;
  }

  if (event === "TOKEN_REFRESHED") {
    updateDashboardUI();
    return;
  }

  await loadMyProvider(true);
  initRealtime();

  redirectAfterAuth({ silent: silentRedirect });
}

async function restoreSession() {
  if (!supabase) return;

  await processAuthCallbackFromUrl();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  state.currentUser = session?.user || null;
  refreshAuthUI();

  if (state.currentUser) {
    const currentScreen = document.querySelector(".screen.active")?.id || "";
    const isAuthScreen =
      currentScreen === "screen-login" || currentScreen === "screen-register";

    await handleAuthenticatedUser("INITIAL_SESSION", {
      silentRedirect: !(isAuthScreen || state.currentRoute === "login" || state.currentRoute === "register")
    });

    if (isAuthScreen || state.currentRoute === "login" || state.currentRoute === "register") {
      redirectAfterAuth({ silent: true });
    }
  } else {
    clearUserSessionState();
  }

  supabase.auth.onAuthStateChange((event, sessionNow) => {
    state.currentUser = sessionNow?.user || null;
    refreshAuthUI();

    state.isPasswordRecoveryMode = false;
    updatePasswordRecoveryUI();

    if (!state.currentUser) {
      clearUserSessionState();
      return;
    }

    setTimeout(() => {
      handleAuthenticatedUser(event, {
        silentRedirect: event !== "SIGNED_IN"
      }).catch(error => {
        console.error("Erro no pós-auth:", error);
        showAlert(error.message || "Erro ao carregar sua conta.", "error");
      });
    }, 0);
  });
}

function updatePublicRatingSelector() {
  const ratingButtons = document.querySelectorAll("[data-public-rating-value]");
  const selectedText = $("publicRatingSelectedText");

  ratingButtons.forEach(button => {
    const value = Number(button.getAttribute("data-public-rating-value"));
    const isActive = value === Number(state.publicRatingValue || 0);

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (selectedText) {
    selectedText.textContent = state.publicRatingValue
      ? `Nota selecionada: ${state.publicRatingValue} de 5`
      : "Selecione uma nota de 1 a 5";
  }
}


async function loadPublicProfile() {
  if (!supabase) return;

  const url = new URL(window.location.href);
  const prestadorId = url.searchParams.get("prestador");
  const container = $("publicProfileContainer");

  if (!container) return;

  if (!prestadorId) {
    container.innerHTML = "";
    return;
  }

  const { data, error } = await supabase
    .from("prestadores")
    .select("*")
    .eq("id", prestadorId)
    .maybeSingle();

  if (error || !data || data.bloqueado) {
    container.innerHTML = `
      <div class="card">
        <h3>Perfil não encontrado</h3>
        <p class="muted">Este prestador não está disponível no momento.</p>
      </div>
    `;
    navigate("provider-profile");
    return;
  }

    await incrementProviderViews(data.id);

  const services = getProviderServices(data);
  const boostAtivo = isBoostActive(data);
  const whatsappLink = toWhatsappLink(
    data.whatsapp,
    `Olá ${data.nome || ""}, encontrei seu perfil no seufaztudo e gostaria de solicitar um orçamento.`
  );

  const alreadyRated = hasPublicRatedProvider(data.id);
  state.publicRatingValue = 0;

  container.innerHTML = `
    <article class="public-profile-card">
      <div class="public-profile-header">
        <div>
          <div class="public-profile-top-tags">
            <span class="tag">Prestador verificado na plataforma</span>
            ${boostAtivo ? `<span class="badge badge-boost">Boost ativo</span>` : ``}
            ${data.atende_emergencia ? `<span class="badge badge-emergency">Emergência</span>` : ``}
          </div>
          <h2>${escapeHtml(data.nome || "Prestador")}</h2>
          <p class="public-profile-services">${escapeHtml(services.join(", ") || "Serviço não informado")}</p>
        </div>
      </div>

      <div class="public-profile-grid">
        <div class="card">
          <h3>Sobre o profissional</h3>
          <p>${escapeHtml(data.descricao || "Sem descrição cadastrada.")}</p>
        </div>

        <div class="card">
          <h3>Informações</h3>
          <div class="provider-meta">
            <span class="meta-pill">${Number(data.experiencia_anos || 0)} anos de experiência</span>
            <span class="meta-pill">${formatCurrency(data.preco_medio)}</span>
            <span class="meta-pill">⭐ ${Number(data.avaliacao_media || 0).toFixed(1)}</span>
            <span class="meta-pill">Atende até ${Number(data.raio_km || 0)} km</span>
            ${data.atende_emergencia ? `<span class="meta-pill">Atende emergência</span>` : ""}
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Contato</h3>
        <p class="muted">Fale diretamente com o prestador para combinar orçamento, prazo e detalhes do serviço.</p>

        <div class="provider-actions">
          ${
            whatsappLink
              ? `<a id="publicProfileWhatsappBtn" class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer" href="${whatsappLink}">Falar no WhatsApp</a>`
              : `<button class="btn btn-secondary" type="button" disabled>WhatsApp não informado</button>`
          }
        </div>
      </div>

      <div class="card public-rating-card">
        <h3>Avaliação</h3>
        <p class="muted">Escolha uma nota de 1 a 5 para este prestador.</p>

        ${
          alreadyRated
            ? `
              <div class="public-rating-locked">
                <strong>Você já avaliou este prestador neste navegador.</strong>
              </div>
            `
            : `
              <div class="public-rating-selector" id="publicRatingSelector">
                <button type="button" class="public-rating-option" data-public-rating-value="1" aria-pressed="false">
                  <span class="public-rating-arrow">▸</span>
                  <span>1</span>
                </button>
                <button type="button" class="public-rating-option" data-public-rating-value="2" aria-pressed="false">
                  <span class="public-rating-arrow">▸</span>
                  <span>2</span>
                </button>
                <button type="button" class="public-rating-option" data-public-rating-value="3" aria-pressed="false">
                  <span class="public-rating-arrow">▸</span>
                  <span>3</span>
                </button>
                <button type="button" class="public-rating-option" data-public-rating-value="4" aria-pressed="false">
                  <span class="public-rating-arrow">▸</span>
                  <span>4</span>
                </button>
                <button type="button" class="public-rating-option" data-public-rating-value="5" aria-pressed="false">
                  <span class="public-rating-arrow">▸</span>
                  <span>5</span>
                </button>
              </div>

              <p id="publicRatingSelectedText" class="small-muted">Selecione uma nota de 1 a 5</p>

              <div class="provider-actions">
                <button id="btnSubmitPublicRating" class="btn btn-secondary" type="button">Enviar avaliação</button>
              </div>
            `
        }
      </div>
    </article>
  `;

  const publicWhatsappBtn = $("publicProfileWhatsappBtn");
  if (publicWhatsappBtn) {
    publicWhatsappBtn.addEventListener("click", async () => {
      await incrementWhatsappClicks(data.id);
    });
  }

  const ratingButtons = document.querySelectorAll("[data-public-rating-value]");
  ratingButtons.forEach(button => {
    button.addEventListener("click", () => {
      state.publicRatingValue = Number(button.getAttribute("data-public-rating-value"));
      updatePublicRatingSelector();
    });
  });

  updatePublicRatingSelector();

    const submitRatingBtn = $("btnSubmitPublicRating");
  if (submitRatingBtn) {
    submitRatingBtn.addEventListener("click", async () => {
      submitRatingBtn.disabled = true;

      try {
        await avaliarPrestador(data.id, {
          publicMode: true,
          notaDireta: state.publicRatingValue
        });
      } finally {
        submitRatingBtn.disabled = false;
      }
    });
  }

  navigate("provider-profile");
}

async function avaliarPrestador(prestadorId, options = {}) {
  const {
    publicMode = false,
    notaDireta = null
  } = options;

  if (!prestadorId) {
    showAlert("Prestador inválido.", "error");
    return;
  }

  if (!supabase) {
    showAlert("Supabase não configurado corretamente.", "error");
    return;
  }

  if (publicMode && hasPublicRatedProvider(prestadorId)) {
    showAlert("Você já avaliou este prestador neste navegador.", "info");
    return;
  }

  let nota = notaDireta;

  if (!publicMode) {
    const notaTexto = prompt("Dê uma nota de 1 a 5:");
    if (notaTexto === null) return;
    nota = Number(notaTexto);
  }

  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    showAlert("Selecione uma nota válida de 1 a 5.", "error");
    return;
  }

  try {
    const insertPayload = {
      prestador_id: prestadorId,
      nota
    };

    if (!publicMode && state.myUrgentCallId) {
      insertPayload.chamado_id = state.myUrgentCallId;
    }

    const { error: insertError } = await withRequestTimeout(
      supabase
        .from("avaliacoes")
        .insert(insertPayload),
      15000,
      "O envio da avaliação demorou demais. Tente novamente."
    );

    if (insertError) {
      throw insertError;
    }

    const roundedMedia = await withRequestTimeout(
      recalculateProviderRating(prestadorId),
      15000,
      "A atualização da nota média demorou demais. Tente novamente."
    );

    applyProviderRatingLocally(prestadorId, roundedMedia);
    updateDashboardUI();

    if (publicMode) {
      markPublicRatedProvider(prestadorId, nota);
      state.publicRatingValue = 0;
      updatePublicRatingSelector();
      showAlert("Avaliação enviada com sucesso.", "success");
      await loadPublicProfile();
      return;
    }

    showAlert("Avaliação enviada com sucesso.", "success");
    await loadMyUrgentResponses();
  } catch (error) {
    console.error("Erro ao enviar avaliação:", error);
    showAlert(mapRatingErrorMessage(error), "error");
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  if (!supabase) {
    showAlert("Supabase não foi inicializado. Verifique config.js e supabase.js.", "error");
    return;
  }

  bindNavigation();
  bindHome();
  bindLogin();
  bindRegister();
  bindDashboard();
  bindUrgent();
  bindPayments();

  bindPublicProfile();

  bindChangePassword();
  setupPasswordToggles();

  setupTopbarScroll();

  setupServiceAutocomplete("searchService", "searchServiceSuggestions", "searchServiceHint");
  setupServiceAutocomplete("registerService", "registerServiceSuggestions", "registerServiceHint");
  setupServiceAutocomplete("registerAdditionalService", "registerAdditionalServiceSuggestions", "registerAdditionalServiceHint");
  setupServiceAutocomplete("profileService", "profileServiceSuggestions", "profileServiceHint");
  setupServiceAutocomplete("profileAdditionalService", "profileAdditionalServiceSuggestions", "profileAdditionalServiceHint");
  setupServiceAutocomplete("urgentService", "urgentServiceSuggestions", "urgentServiceHint");
  
  await restoreSession();
  await processPaymentReturn();

  await loadPublicProfile();

  const hasPrestadorParam = new URL(window.location.href).searchParams.has("prestador");

  if (hasPrestadorParam) {
    navigate("provider-profile");
  } else {
    renderSearchEmptyState("initial");
  }

  const footerYear = document.getElementById("footerYear");
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }
});