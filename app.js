const state = {
  currentRoute: "home",
  currentUser: null,
  currentProviderProfile: null,

  isEditingProfile: false,
  isPasswordRecoveryMode: false,
  profileDraftBackup: null,

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

const SERVICE_ALIASES = {
  "eletricista": "Eletricista",
  "encanador": "Encanador",
  "bombeiro hidraulico": "Encanador",
  "bombeiro hidráulico": "Encanador",
  "pedreiro": "Pedreiro",
  "pintor": "Pintor",
  "diarista": "Diarista",
  "faxineira": "Diarista",
  "faxineiro": "Diarista",
  "montador de moveis": "Montador de móveis",
  "montador de móveis": "Montador de móveis",
  "marceneiro": "Marceneiro",
  "chaveiro": "Chaveiro",
  "jardineiro": "Jardineiro",
  "vidraceiro": "Vidraceiro",
  "tecnico de informatica": "Técnico de informática",
  "técnico de informática": "Técnico de informática",
  "instalador de ar condicionado": "Instalador de ar-condicionado",
  "instalador de ar-condicionado": "Instalador de ar-condicionado",
  "mecanico": "Mecânico",
  "mecânico": "Mecânico",
  "borracheiro": "Borracheiro",
  "motorista": "Motorista",
  "entregador": "Entregador",
  "passeador de caes": "Passeador de cães",
  "passeador de cães": "Passeador de cães",
  "personal": "Personal trainer",
  "personal trainer": "Personal trainer",
  "baba": "Babá",
  "babá": "Babá",
  "cuidador de idosos": "Cuidador de idosos",
  "freteiro": "Freteiro",
  "serralheiro": "Serralheiro",
  "soldador": "Soldador",
  "gesseiro": "Gesseiro",
  "azulejista": "Azulejista",
  "tecnico em celular": "Técnico em celular",
  "técnico em celular": "Técnico em celular",
  "fotografo": "Fotógrafo",
  "fotógrafo": "Fotógrafo",
  "professor particular": "Professor particular",
  "manicure": "Manicure",
  "cabeleireiro": "Cabeleireiro",
  "maquiador": "Maquiador"
};

const SERVICE_OPTIONS = [
  "Eletricista",
  "Encanador",
  "Pedreiro",
  "Pintor",
  "Diarista",
  "Montador de móveis",
  "Marceneiro",
  "Chaveiro",
  "Jardineiro",
  "Vidraceiro",
  "Técnico de informática",
  "Instalador de ar-condicionado",
  "Mecânico",
  "Borracheiro",
  "Motorista",
  "Entregador",
  "Passeador de cães",
  "Personal trainer",
  "Babá",
  "Cuidador de idosos",
  "Freteiro",
  "Serralheiro",
  "Soldador",
  "Gesseiro",
  "Azulejista",
  "Técnico em celular",
  "Fotógrafo",
  "Professor particular",
  "Manicure",
  "Cabeleireiro",
  "Maquiador"
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

async function savePendingProviderProfileInAuthMetadata(payload) {
  if (!supabase || !payload) return;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) return;

  const currentMetadata = session.user.user_metadata || {};

  await supabase.auth.updateUser({
    data: {
      ...currentMetadata,
      pending_provider_profile: payload
    }
  });
}

async function getPendingProviderProfileFromAuthMetadata() {
  if (!supabase) return null;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session?.user?.user_metadata?.pending_provider_profile || null;
}

async function clearPendingProviderProfileFromAuthMetadata() {
  if (!supabase) return;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) return;

  const metadata = { ...(session.user.user_metadata || {}) };
  delete metadata.pending_provider_profile;

  await supabase.auth.updateUser({
    data: metadata
  });
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
    location: `POINT(${Number(payload?.longitude)} ${Number(payload?.latitude)})`,
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
    box.textContent = "Seu link de recuperação foi validado. Defina sua nova senha abaixo para concluir o processo.";
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
    return "Seu e-mail ainda não foi confirmado. Abra a mensagem enviada para sua caixa de entrada e clique no link de confirmação.";
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
      const topbar = document.querySelector(".topbar");
      const targetTop = target ? target.getBoundingClientRect().top + window.scrollY : 0;
      const offset = (topbar?.offsetHeight || 0) + 16;

      window.scrollTo({
        top: Math.max(targetTop - offset, 0),
        behavior: "smooth"
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
  renderProviders(sortProviders(state.providers));
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
      badge.textContent = "Boost";
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

      await incrementProviderViews(provider.id);
      await loadPublicProfile();
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
  if (!provider) return;

  const newViews = Number(provider.visualizacoes || 0) + 1;

  const { error } = await supabase
    .from("prestadores")
    .update({ visualizacoes: newViews })
    .eq("id", providerId);

  if (!error) {
    provider.visualizacoes = newViews;

    if (state.currentProviderProfile?.id === providerId) {
      state.currentProviderProfile.visualizacoes = newViews;
      $("statViews").textContent = String(newViews);
    }
  }
}

async function incrementWhatsappClicks(providerId) {
  if (!providerId || !supabase) return;

  const provider = state.providers.find(p => p.id === providerId);
  if (!provider) return;

  const newClicks = Number(provider.cliques_whatsapp || 0) + 1;

  const { error } = await supabase
    .from("prestadores")
    .update({ cliques_whatsapp: newClicks })
    .eq("id", providerId);

  if (!error) {
    provider.cliques_whatsapp = newClicks;

    if (state.currentProviderProfile?.id === providerId) {
      state.currentProviderProfile.cliques_whatsapp = newClicks;
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
    if (!supabase) return;

    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });

      if (error) throw error;

      state.currentUser = null;
      state.currentProviderProfile = null;
      state.isEditingProfile = false;
      state.profileDraftBackup = null;
      state.providerUrgentCalls = [];
      state.myUrgentResponses = [];
      state.myUrgentCallId = null;

      clearRealtimeChannels();
      refreshAuthUI();
      updateDashboardUI();
      navigate("home");
      showAlert("Você saiu da conta.", "success");
    } catch (error) {
      showAlert(error.message || "Erro ao sair da conta.", "error");
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

      if (error) throw error;

      results = (data || [])
        .filter(provider => !provider.bloqueado)
        .filter(provider => providerMatchesService(provider, service))
        .map(provider => {
          let distanceKm = null;

          if (state.userLocation) {
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
          return typeof provider.distanceKm === "number" && provider.distanceKm <= radiusKm;
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      state.currentUser = data.user || null;
      state.isPasswordRecoveryMode = false;
      updatePasswordRecoveryUI();

      await loadMyProvider(true);
      refreshAuthUI();
      redirectAfterAuth({ silent: false });
    } catch (error) {
      console.error(error);
      showAlert(mapAuthErrorMessage(error), "error");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });

  $("btnForgotPassword")?.addEventListener("click", async () => {
    if (!supabase) {
      showAlert("Supabase não configurado corretamente.", "error");
      return;
    }

    const email = $("loginEmail").value.trim();
    const button = $("btnForgotPassword");

    if (!isValidEmail(email)) {
      showAlert("Digite seu e-mail antes de solicitar a recuperação de senha.", "error");
      return;
    }

    try {
      setButtonLoading(button, true, "Enviando link...");

      const redirectUrl = `${window.location.origin}${window.location.pathname}`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) throw error;

      showAlert(
        "Enviamos o link de recuperação para seu e-mail. Abra a mensagem e clique no link para definir uma nova senha.",
        "success"
      );
    } catch (error) {
      console.error(error);
      showAlert(mapAuthErrorMessage(error), "error");
    } finally {
      setButtonLoading(button, false);
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

    const rawServices = normalizeServicesInput($("registerService").value);

    const payload = {
      nome: safeTrim($("registerName").value, 120),
      email: safeTrim($("registerEmail").value, 160),
      password: $("registerPassword").value,
      passwordConfirm: $("registerPasswordConfirm").value,
      whatsapp: normalizeWhatsappBR($("registerWhatsapp").value),
      servicos: rawServices,
      servico: rawServices[0] || "",
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

      const assinaturaAte =
        Number(count || 0) < 500
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
        await savePendingProviderProfileInAuthMetadata(pendingProfile);
        await loadMyProvider(true);
      } else {
        state.currentProviderProfile = null;
      }

      $("formRegister").reset();
      state.providerRegisterLocation = null;
      $("providerLocationText").textContent = "não definida";

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

  $("btnSaveProfile")?.classList.toggle("hidden", !isEditing);
  $("btnCancelEditProfile")?.classList.toggle("hidden", !isEditing);
  $("btnToggleEditProfile")?.classList.toggle("hidden", isEditing || !state.currentProviderProfile);

  const profileServiceHint = $("profileServiceHint");
  if (profileServiceHint) {
    profileServiceHint.classList.toggle("hidden", !isEditing);
  }
}

function bindDashboard() {
  $("btnToggleEditProfile")?.addEventListener("click", () => {
    if (!state.currentProviderProfile) {
      showAlert("Seu perfil de prestador ainda não foi encontrado.", "error");
      return;
    }

    state.profileDraftBackup = {
      nome: $("profileName").value,
      whatsapp: $("profileWhatsapp").value,
      servicos: $("profileService").value,
      experiencia_anos: $("profileExperience").value,
      preco_medio: $("profilePrice").value,
      raio_km: $("profileRadius").value,
      descricao: $("profileDescription").value,
      atende_emergencia: $("profileEmergency").checked,
      latitude: state.currentProviderProfile.latitude,
      longitude: state.currentProviderProfile.longitude
    };

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
    $("profileService").value = backup.servicos || "";
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

    if (!state.currentUser || !state.currentProviderProfile) {
      showAlert("Faça login para salvar o perfil.", "error");
      return;
    }

    const submitBtn = $("btnSaveProfile");

    const rawServices = normalizeServicesInput($("profileService").value);
    const nome = $("profileName").value.trim();
    const whatsapp = normalizeWhatsappBR($("profileWhatsapp").value);
    const experiencia = Number($("profileExperience").value || 0);
    const preco = Number($("profilePrice").value || 0);
    const raio = Number($("profileRadius").value || 10);
    const descricao = $("profileDescription").value.trim();

    if (!nome) {
      showAlert("Informe seu nome profissional.", "error");
      return;
    }

    if (!whatsapp) {
      showAlert("Digite um WhatsApp válido com DDD.", "error");
      return;
    }

    if (!rawServices.length) {
      showAlert("Informe pelo menos um serviço.", "error");
      return;
    }

    if (!Number.isFinite(experiencia) || experiencia < 0) {
      showAlert("Informe anos de experiência válidos.", "error");
      return;
    }

    if (!Number.isFinite(preco) || preco < 0) {
      showAlert("Informe um preço médio válido.", "error");
      return;
    }

    const lat = Number(state.currentProviderProfile.latitude);
    const lng = Number(state.currentProviderProfile.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      showAlert("Atualize sua localização antes de salvar o perfil.", "error");
      return;
    }

    const updated = {
      nome,
      whatsapp,
      servicos: rawServices,
      servico: rawServices[0],
      experiencia_anos: experiencia,
      preco_medio: preco,
      raio_km: raio,
      descricao,
      atende_emergencia: $("profileEmergency").checked,
      latitude: lat,
      longitude: lng,
      location: `POINT(${lng} ${lat})`
    };

    try {
      setButtonLoading(submitBtn, true, "Salvando...");

      const { error } = await supabase
        .from("prestadores")
        .update(updated)
        .eq("id", state.currentProviderProfile.id)
        .eq("user_id", state.currentUser.id);

      if (error) throw error;

      state.currentProviderProfile = {
        ...state.currentProviderProfile,
        ...updated
      };

      const idx = state.providers.findIndex(p => p.id === state.currentProviderProfile.id);
      if (idx >= 0) {
        state.providers[idx] = {
          ...state.providers[idx],
          ...updated
        };
      }

      renderProviders(sortProviders(state.providers));
      updateDashboardUI();
      state.profileDraftBackup = null;
      setProfileEditMode(false);
      showAlert("Perfil salvo com sucesso.", "success");
    } catch (error) {
      console.error(error);
      showAlert(mapAuthErrorMessage(error) || "Erro ao salvar perfil.", "error");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });

  $("btnRefreshUrgentRequests")?.addEventListener("click", async () => {
    await loadProviderUrgentCalls();
  });
}

function bindChangePassword() {
  $("formChangePassword")?.addEventListener("submit", async event => {
    event.preventDefault();

    if (!state.currentUser) {
      showAlert("Faça login para alterar a senha.", "error");
      return;
    }

    const submitBtn = $("formChangePassword")?.querySelector('button[type="submit"]');
    const newPassword = $("newPassword").value;
    const confirmNewPassword = $("confirmNewPassword").value;

    if (newPassword.length < 6) {
      showAlert("A nova senha deve ter pelo menos 6 caracteres.", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showAlert("A confirmação da nova senha não confere.", "error");
      return;
    }

    try {
      setButtonLoading(submitBtn, true, "Atualizando senha...");

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      $("formChangePassword").reset();
      state.isPasswordRecoveryMode = false;
      updatePasswordRecoveryUI();

      showAlert("Senha atualizada com sucesso. Sua conta já está pronta para uso.", "success");
    } catch (error) {
      console.error(error);
      showAlert(mapAuthErrorMessage(error) || "Erro ao atualizar senha.", "error");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

function bindPayments() {
  $("btnBuyBoost")?.addEventListener("click", async () => {
    await startCheckout("boost");
  });

  $("btnBuySubscription")?.addEventListener("click", async () => {
    await startCheckout("assinatura");
  });

  $("btnRefreshPlan")?.addEventListener("click", async () => {
    await loadMyProvider(true);
    showAlert("Status do plano atualizado.", "success");
  });
}

async function startCheckout(tipo) {
  if (!state.currentUser || !state.currentProviderProfile) {
    showAlert("Faça login como prestador.", "error");
    return;
  }

  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token || ""}`
      },
      body: JSON.stringify({
        tipo,
        prestadorId: state.currentProviderProfile.id,
        nomePrestador: state.currentProviderProfile.nome,
        emailPrestador: state.currentUser.email
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Erro ao iniciar pagamento.");
    }

    if (!data.checkoutUrl) {
      throw new Error("A URL do checkout não foi retornada.");
    }

    window.location.href = data.checkoutUrl;
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Erro ao iniciar pagamento.", "error");
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
        location: `POINT(${state.urgentLocation.longitude} ${state.urgentLocation.latitude})`,
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

  if (!profile) {
    $("profileName").value = "";
    $("profileWhatsapp").value = "";
    $("profileService").value = "";
    $("profileExperience").value = "";
    $("profilePrice").value = "";
    $("profileRadius").value = "10";
    $("profileDescription").value = "";
    $("profileEmergency").checked = false;
    $("profileLocationText").textContent = "não definida";

    $("statViews").textContent = "0";
    $("statWhatsapp").textContent = "0";
    $("statRating").textContent = "0.0";
    $("statPlan").textContent = logged ? "Perfil em configuração" : "Sem login";
    $("planMessage").textContent = logged
      ? "Sua conta está autenticada. Assim que o perfil de prestador for localizado ou finalizado, o status do seu plano aparecerá aqui."
      : "Faça login para ver o status do plano."
    $("providerUrgentCallsList").innerHTML = "";

    $("btnToggleEditProfile")?.classList.toggle("hidden", !profile);

    setProfileEditMode(false);
    updateMissingProfileNotice();
    return;
  }

  $("profileName").value = profile.nome || "";
  $("profileWhatsapp").value = profile.whatsapp || "";
  $("profileService").value = getProviderServices(profile).join(", ");
  $("profileExperience").value = Number(profile.experiencia_anos || 0);
  $("profilePrice").value = Number(profile.preco_medio || 0);
  $("profileRadius").value = String(profile.raio_km || 10);
  $("profileDescription").value = profile.descricao || "";
  $("profileEmergency").checked = !!profile.atende_emergencia;

  if (profile.latitude && profile.longitude) {
    $("profileLocationText").textContent = formatCoords(profile.latitude, profile.longitude);
  } else {
    $("profileLocationText").textContent = "não definida";
  }

  $("statViews").textContent = String(Number(profile.visualizacoes || 0));
  $("statWhatsapp").textContent = String(Number(profile.cliques_whatsapp || 0));
  $("statRating").textContent = Number(profile.avaliacao_media || 0).toFixed(1);

  const now = new Date();
  const assinaturaAtiva =
    profile.assinatura_ate && new Date(profile.assinatura_ate) > now;

  const boostAtivo = isBoostActive(profile);


      const promoLancamentoAtiva =
    profile.assinatura_ate && new Date(profile.assinatura_ate) > now;

  $("statPlan").textContent = assinaturaAtiva ? "Assinatura ativa" : (promoLancamentoAtiva ? "Promoção de lançamento" : "Plano gratuito");

  const partes = [];

  if (assinaturaAtiva) {
    partes.push(`Assinatura ativa até ${formatDateTimeBR(profile.assinatura_ate)}.`);
  } else if (promoLancamentoAtiva) {
    partes.push(`Você está no período promocional gratuito até ${formatDateTimeBR(profile.assinatura_ate)}.`);
  } else {
    partes.push("Você está no plano gratuito no momento, sem assinatura ativa.");
  }

  if (boostAtivo) {
    partes.push(
      `Boost ativo${profile.boost_ate ? ` até ${formatDateTimeBR(profile.boost_ate)}` : ""}.`
    );
  } else {
    partes.push("Boost inativo.");
  }

  $("planMessage").textContent = partes.join(" ");

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

  if (!state.currentProviderProfile) {
    container.innerHTML = `
      <div class="card">
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

  state.providerUrgentCalls = (data || [])
  .map(item => item.chamado)
  .filter(Boolean);

  for (const call of state.providerUrgentCalls) {
    if (call.status === "aberto" && call.expira_em && new Date(call.expira_em) <= new Date()) {
      await supabase
        .from("chamados")
        .update({ status: "expirado", encerrado_em: new Date().toISOString() })
        .eq("id", call.id)
        .eq("status", "aberto");

      call.status = "expirado";
    }
  }

  state.providerUrgentCalls = state.providerUrgentCalls.filter(call => call.status === "aberto");

  renderProviderUrgentCalls(state.providerUrgentCalls);
}

function renderProviderUrgentCalls(calls) {
  const container = $("providerUrgentCallsList");
  container.innerHTML = "";

  if (!calls.length) {
    container.innerHTML = `
      <div class="card urgent-empty-card">
        <h3>Nenhum chamado por enquanto</h3>
        <p class="muted">Quando surgirem chamados próximos da sua região, eles aparecerão aqui.</p>
      </div>
    `;
    return;
  }

  calls.forEach(call => {
    const article = document.createElement("article");
    article.className = "provider-card";

    const chosen = call.prestador_escolhido_id === state.currentProviderProfile.id;
    const closed = call.status === "fechado";

    article.innerHTML = `
      <div class="provider-top">
        <div>
          <h4 class="provider-name">${escapeHtml(call.servico || "Chamado urgente")}</h4>
          <p class="provider-service">Contato: ${escapeHtml(call.cliente_contato || "não informado")}</p>
        </div>
        <div class="provider-badges">
          ${closed ? `<span class="badge">Fechado</span>` : `<span class="badge badge-emergency">Aberto</span>`}
          ${chosen ? `<span class="badge badge-boost">Você foi escolhido</span>` : ``}
        </div>
      </div>

      <p class="provider-description">${escapeHtml(call.descricao || "")}</p>

      <div class="provider-meta">
        <span class="meta-pill">Criado em ${formatDateTimeBR(call.created_at)}</span>
        <span class="meta-pill">Status: ${escapeHtml(call.status || "aberto")}</span>
      </div>

      ${
        closed
          ? ``
          : `
          <div class="inline-form">
            <textarea id="responseMessage-${call.id}" rows="3" placeholder="Ex: Posso atender em 20 minutos."></textarea>
            <div class="actions">
              <button class="btn" type="button" data-respond-call="${call.id}">Responder chamado</button>
            </div>
          </div>
        `
      }
    `;

    container.appendChild(article);
  });

  container.querySelectorAll("[data-respond-call]").forEach(button => {
    button.addEventListener("click", async () => {
      const chamadoId = button.getAttribute("data-respond-call");
      const textarea = $(`responseMessage-${chamadoId}`);
      const mensagem = textarea.value.trim();

      if (!mensagem) {
        showAlert("Digite uma mensagem para responder o chamado.", "error");
        return;
      }

      await respondToUrgentCall(chamadoId, mensagem);
      textarea.value = "";
    });
  });
}

async function respondToUrgentCall(chamadoId, mensagem) {
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

    if (error) throw error;

    showAlert("Resposta enviada com sucesso.", "success");
    await loadProviderUrgentCalls();
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Erro ao responder chamado.", "error");
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
      <div class="card">
        <h3>Ainda sem respostas</h3>
        <p class="muted">Assim que os prestadores responderem, elas aparecerão aqui.</p>
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
            ? ``
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
      await chooseUrgentProvider(prestadorId);
    });
  });

  container.querySelectorAll("[data-rate-provider]").forEach(button => {
    button.addEventListener("click", async () => {
      const prestadorId = button.getAttribute("data-rate-provider");
      await avaliarPrestador(prestadorId);
    });
  });
}

async function chooseUrgentProvider(prestadorId) {
  if (!state.myUrgentCallId) {
    showAlert("Nenhum chamado encontrado.", "error");
    return;
  }

  try {
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

    if (error) throw error;

    showAlert("Prestador escolhido com sucesso.", "success");
    await loadMyUrgentResponses();
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Erro ao escolher prestador.", "error");
  }
}

async function processPaymentReturn() {
  const url = new URL(window.location.href);
  const pagamento = url.searchParams.get("pagamento");
  const orderNsu = url.searchParams.get("order_nsu");

  if (!pagamento) return;

  if (pagamento === "sucesso") {
    showAlert(
      orderNsu
        ? `Retorno do pagamento recebido. Pedido: ${orderNsu}. Agora clique em "Atualizar status" para confirmar no sistema.`
        : `Retorno do pagamento recebido. Clique em "Atualizar status" para confirmar no sistema.`,
      "info"
    );
  } else {
    showAlert("Retorno do pagamento identificado.", "info");
  }
}

function clearRealtimeChannels() {
  if (!supabase || !state.realtimeChannels.length) return;

  state.realtimeChannels.forEach(channel => {
    supabase.removeChannel(channel);
  });

  state.realtimeChannels = [];
}

function initRealtime() {
  if (!supabase) return;

  clearRealtimeChannels();

  const channelUrgentCalls = supabase
    .channel("chamados-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chamados_destinatarios"
      },
      async payload => {
        if (!state.currentProviderProfile) return;

        if (payload.new.prestador_id === state.currentProviderProfile.id) {
          showAlert("Novo chamado urgente disponível!", "info");
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
        event: "INSERT",
        schema: "public",
        table: "chamado_respostas"
      },
      async payload => {
        if (!state.myUrgentCallId) return;

        if (payload.new.chamado_id === state.myUrgentCallId) {
          showAlert("Um prestador respondeu seu chamado!", "success");
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
        event: "UPDATE",
        schema: "public",
        table: "chamados"
      },
      async payload => {
        if (payload.new.id === state.myUrgentCallId && payload.new.status === "fechado") {
          showAlert("Chamado finalizado.", "info");
          await loadMyUrgentResponses();
        }
      }
    )
    .subscribe();

  state.realtimeChannels.push(channelUrgentCalls, channelResponses, channelStatus);
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
      if (error) throw error;
      handled = true;
    } else if (queryParams.has("token_hash") && queryParams.has("type")) {
      const type = queryParams.get("type");
      const token_hash = queryParams.get("token_hash");

      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash
      });

      if (error) throw error;
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

async function restoreSession() {
  if (!supabase) return;

  await processAuthCallbackFromUrl();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  state.currentUser = session?.user || null;
  refreshAuthUI();

  if (state.currentUser) {
    await loadMyProvider(true);
    initRealtime();

    const currentScreen = document.querySelector(".screen.active")?.id || "";
    const isAuthScreen =
      currentScreen === "screen-login" || currentScreen === "screen-register";

    if (isAuthScreen || state.currentRoute === "login" || state.currentRoute === "register") {
      redirectAfterAuth({ silent: true });
    }
  } else {
    state.currentProviderProfile = null;
    state.isEditingProfile = false;
    state.profileDraftBackup = null;
    state.providerUrgentCalls = [];
    state.myUrgentResponses = [];
    state.myUrgentCallId = null;
    updateDashboardUI();
    clearRealtimeChannels();
  }

  supabase.auth.onAuthStateChange(async (event, sessionNow) => {
    state.currentUser = sessionNow?.user || null;
    refreshAuthUI();

    state.isPasswordRecoveryMode = false;
    updatePasswordRecoveryUI();

    if (state.currentUser) {
      await loadMyProvider(true);
      initRealtime();

      if (event === "SIGNED_IN") {
        redirectAfterAuth({ silent: false });
        return;
      }

      if (event === "TOKEN_REFRESHED") {
        updateDashboardUI();
        return;
      }

      if (event === "USER_UPDATED") {
        await loadMyProvider(true);
        updateDashboardUI();
        return;
      }

      if (event === "PASSWORD_RECOVERY") {
        state.isPasswordRecoveryMode = true;
        navigate("dashboard");
        updatePasswordRecoveryUI();
        showAlert("Link de recuperação validado. Agora defina sua nova senha no painel.", "success");
        return;
      }
    } else {
      state.currentProviderProfile = null;
      state.isEditingProfile = false;
      state.profileDraftBackup = null;
      state.providerUrgentCalls = [];
      state.myUrgentResponses = [];
      state.myUrgentCallId = null;
      updateDashboardUI();
      clearRealtimeChannels();
    }
  });
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

  const services = getProviderServices(data);
  const whatsappLink = toWhatsappLink(
    data.whatsapp,
    `Olá ${data.nome || ""}, encontrei seu perfil no seufaztudo e gostaria de solicitar um orçamento.`
  );

  container.innerHTML = `
    <article class="public-profile-card">
      <div class="public-profile-header">
        <div>
          <span class="tag">Prestador verificado na plataforma</span>
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
    </article>
  `;

  const publicWhatsappBtn = $("publicProfileWhatsappBtn");
  if (publicWhatsappBtn) {
    publicWhatsappBtn.addEventListener("click", async () => {
      await incrementWhatsappClicks(data.id);
    });
  }

  navigate("provider-profile");
}

async function avaliarPrestador(prestadorId) {
  const notaTexto = prompt("Dê uma nota de 1 a 5:");
  if (notaTexto === null) return;

  const nota = Number(notaTexto);
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    showAlert("Nota inválida. Use de 1 a 5.", "error");
    return;
  }

  const comentario = (prompt("Comentário opcional:") || "").trim().slice(0, 500);

  try {
    const { error } = await supabase
      .from("avaliacoes")
      .insert({
        prestador_id: prestadorId,
        chamado_id: state.myUrgentCallId,
        nota,
        comentario
      });

    if (error) throw error;

    const { data: ratings, error: ratingsError } = await supabase
      .from("avaliacoes")
      .select("nota")
      .eq("prestador_id", prestadorId);

    if (ratingsError) throw ratingsError;

    const media =
      ratings.length > 0
        ? ratings.reduce((acc, item) => acc + Number(item.nota || 0), 0) / ratings.length
        : 0;

    const { error: updateRatingError } = await supabase
      .from("prestadores")
      .update({ avaliacao_media: Number(media.toFixed(1)) })
      .eq("id", prestadorId);

    if (updateRatingError) throw updateRatingError;

    showAlert("Avaliação enviada com sucesso.", "success");
    await fetchProviders();
    await loadMyUrgentResponses();
  } catch (error) {
    showAlert(error.message || "Erro ao enviar avaliação.", "error");
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

  setupServiceAutocomplete("searchService", "searchServiceSuggestions", "searchServiceHint");
  setupServiceAutocomplete("registerService", "registerServiceSuggestions", "registerServiceHint");
  setupServiceAutocomplete("profileService", "profileServiceSuggestions", "profileServiceHint");
  setupServiceAutocomplete("urgentService", "urgentServiceSuggestions", "urgentServiceHint");

  await restoreSession();
  fetchProviders();
  initRealtime();
  processPaymentReturn();

  await loadPublicProfile();

  renderSearchEmptyState("initial");

  const footerYear = document.getElementById("footerYear");
if (footerYear) {
  footerYear.textContent = String(new Date().getFullYear());
}

});