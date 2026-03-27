const state = {
  currentRoute: "home",
  currentUser: null,
  currentProviderProfile: null,

  userLocation: null,
  providerRegisterLocation: null,
  urgentLocation: null,

  myUrgentCallId: null,
  providerUrgentCalls: [],
  myUrgentResponses: [],
  providers: [],

  realtimeChannels: []
};

const routes = ["home", "login", "register", "dashboard", "urgent", "terms", "privacy", "payments", "legal"];

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

  window.scrollTo({ top: 0, behavior: "smooth" });
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
  const cleanPhone = String(phone || "").replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || "")}`;
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
    const boostA = a.boost_ativo ? 1 : 0;
    const boostB = b.boost_ativo ? 1 : 0;
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

  state.providers = data || [];
  renderProviders(sortProviders(state.providers));
}

function renderProviders(list) {
  const container = $("providersList");
  const template = $("providerCardTemplate");
  if (!container || !template) return;

  container.innerHTML = "";
  $("resultsCount").textContent = `${list.length} resultado${list.length === 1 ? "" : "s"}`;

  if (!list.length) {
    container.innerHTML = `
      <div class="card">
        <h3>Nenhum prestador encontrado</h3>
        <p class="muted">Tente mudar o serviço, o raio ou usar sua localização.</p>
      </div>
    `;
    return;
  }

  list.forEach(provider => {
    const fragment = template.content.cloneNode(true);

    fragment.querySelector(".provider-name").textContent = provider.nome || "Prestador";
    fragment.querySelector(".provider-service").textContent = provider.servico || "Serviço não informado";
    fragment.querySelector(".provider-description").textContent =
      provider.descricao || "Sem descrição cadastrada.";

    const badges = fragment.querySelector(".provider-badges");

    if (provider.boost_ativo) {
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
      showAlert(
        `${provider.nome || "Prestador"} • ${provider.servico || "Serviço"} • ${formatCurrency(
          provider.preco_medio
        )} • ⭐ ${Number(provider.avaliacao_media || 0).toFixed(1)}`,
        "info"
      );

      await incrementProviderViews(provider.id);
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

function bindNavigation() {
  document.querySelectorAll("[data-route]").forEach(button => {
    button.addEventListener("click", () => {
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

    const { error } = await supabase.auth.signOut();

    if (error) {
      showAlert(error.message, "error");
      return;
    }

    state.currentUser = null;
    state.currentProviderProfile = null;
    refreshAuthUI();
    navigate("home");
    showAlert("Você saiu da conta.", "success");
  });
}

function bindHome() {
  $("btnUseLocation")?.addEventListener("click", async () => {
    try {
      const coords = await getCurrentPosition();
      state.userLocation = coords;
      $("userLocationText").textContent = formatCoords(coords.latitude, coords.longitude);
      showAlert("Localização capturada com sucesso.", "success");
    } catch (error) {
      showAlert("Não foi possível obter sua localização.", "error");
    }
  });

  $("btnSearch")?.addEventListener("click", handleSearchProviders);
}

async function handleSearchProviders() {
  const service = $("searchService").value.trim();
  const radiusKm = Number($("searchRadius").value || 10);

  if (!state.userLocation) {
    showAlert("Ative sua localização primeiro.", "error");
    return;
  }

  if (!supabase) {
    showAlert("Supabase não configurado corretamente.", "error");
    return;
  }

  try {
    let results = null;

    const rpcResponse = await supabase.rpc("buscar_prestadores", {
      user_lat: state.userLocation.latitude,
      user_lng: state.userLocation.longitude,
      raio_metros: radiusKm * 1000,
      servico_busca: service || null
    });

    if (!rpcResponse.error && Array.isArray(rpcResponse.data)) {
      results = rpcResponse.data.map(provider => ({
        ...provider,
        distanceKm:
          typeof provider.distancia === "number"
            ? provider.distancia / 1000
            : null
      }));
    }

    if (!results) {
      const { data, error } = await supabase.from("prestadores").select("*");

      if (error) throw error;

      results = (data || [])
        .filter(provider => {
          const matchesService = !service
            ? true
            : String(provider.servico || "")
                .toLowerCase()
                .includes(service.toLowerCase());

          const distanceKm = calculateDistanceKm(
            state.userLocation.latitude,
            state.userLocation.longitude,
            Number(provider.latitude),
            Number(provider.longitude)
          );

          provider.distanceKm = distanceKm;

          const withinRadius =
            typeof distanceKm === "number" && distanceKm <= radiusKm;

          return matchesService && withinRadius;
        })
        .map(provider => ({
          ...provider,
          distanceKm: provider.distanceKm
        }));
    }

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

    const email = $("loginEmail").value.trim();
    const password = $("loginPassword").value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showAlert(error.message, "error");
      return;
    }

    state.currentUser = data.user || null;
    await loadMyProvider();
    refreshAuthUI();
    navigate("dashboard");
    showAlert("Login realizado com sucesso.", "success");
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

    const payload = {
      nome: safeTrim($("registerName").value, 120),
      email: safeTrim($("registerEmail").value, 160),
      password: $("registerPassword").value,
      whatsapp: safeTrim($("registerWhatsapp").value, 20),
      servico: safeTrim($("registerService").value, 120),
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

    if (!isValidPhone(payload.whatsapp)) {
      showAlert("WhatsApp inválido. Use DDD + número.", "error");
      return;
    }

    if (!payload.servico) {
      showAlert("Informe o serviço principal.", "error");
      return;
    }

    if (payload.experiencia_anos === null || payload.preco_medio === null || payload.raio_km === null) {
      showAlert("Preencha corretamente experiência, preço e raio.", "error");
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password
      });

      if (authError) {
        throw authError;
      }

      const user = authData.user;

      if (!user) {
        throw new Error("Não foi possível criar o usuário.");
      }

      const { count, error: countError } = await supabase
        .from("prestadores")
        .select("*", { count: "exact", head: true });

      if (countError) {
        throw countError;
      }

      const assinaturaAte =
        Number(count || 0) < 500
          ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
          : null;

      const { error: insertError } = await supabase
        .from("prestadores")
        .insert({
          user_id: user.id,
          nome: payload.nome,
          descricao: payload.descricao,
          servico: payload.servico,
          experiencia_anos: payload.experiencia_anos,
          preco_medio: payload.preco_medio,
          whatsapp: payload.whatsapp,
          atende_emergencia: payload.atende_emergencia,
          raio_km: payload.raio_km,
          latitude: payload.latitude,
          longitude: payload.longitude,
          location: `POINT(${payload.longitude} ${payload.latitude})`,
          assinatura_ate: assinaturaAte,
          boost_ativo: false,
          avaliacao_media: 0,
          visualizacoes: 0,
          cliques_whatsapp: 0
        });

      if (insertError) {
        throw insertError;
      }

      state.currentUser = user;

      $("formRegister").reset();
      state.providerRegisterLocation = null;
      $("providerLocationText").textContent = "não definida";

      await fetchProviders();
      await loadMyProvider();
      refreshAuthUI();
      navigate("dashboard");

      showAlert("Cadastro realizado com sucesso.", "success");
    } catch (error) {
      console.error(error);
      showAlert(error.message || "Erro ao cadastrar prestador.", "error");
    }
  });
}

function bindDashboard() {
  $("btnProfileLocation")?.addEventListener("click", async () => {
    if (!state.currentProviderProfile) {
      showAlert("Faça login primeiro.", "error");
      return;
    }

    try {
      const coords = await getCurrentPosition();
      state.currentProviderProfile.latitude = coords.latitude;
      state.currentProviderProfile.longitude = coords.longitude;
      $("profileLocationText").textContent = formatCoords(coords.latitude, coords.longitude);
      showAlert("Localização atualizada.", "success");
    } catch (error) {
      showAlert("Não foi possível atualizar a localização.", "error");
    }
  });

  $("formProfile")?.addEventListener("submit", async event => {
    event.preventDefault();

    if (!state.currentUser || !state.currentProviderProfile) {
      showAlert("Faça login para salvar o perfil.", "error");
      return;
    }

    const updated = {
      nome: $("profileName").value.trim(),
      whatsapp: $("profileWhatsapp").value.trim(),
      servico: $("profileService").value.trim(),
      experiencia_anos: Number($("profileExperience").value || 0),
      preco_medio: Number($("profilePrice").value || 0),
      raio_km: Number($("profileRadius").value || 10),
      descricao: $("profileDescription").value.trim(),
      atende_emergencia: $("profileEmergency").checked,
      latitude: Number(state.currentProviderProfile.latitude),
      longitude: Number(state.currentProviderProfile.longitude),
      location: `POINT(${Number(state.currentProviderProfile.longitude)} ${Number(
        state.currentProviderProfile.latitude
      )})`
    };

    try {
      const { error } = await supabase
        .from("prestadores")
        .update(updated)
        .eq("id", state.currentProviderProfile.id);

      if (error) throw error;

      state.currentProviderProfile = {
        ...state.currentProviderProfile,
        ...updated
      };

      const idx = state.providers.findIndex(p => p.id === state.currentProviderProfile.id);
      if (idx >= 0) {
        state.providers[idx] = {
          ...state.providers[idx],
          ...state.currentProviderProfile
        };
      }

      renderProviders(sortProviders(state.providers));
      updateDashboardUI();
      showAlert("Perfil salvo com sucesso.", "success");
    } catch (error) {
      console.error(error);
      showAlert(error.message || "Erro ao salvar perfil.", "error");
    }
  });

  $("btnRefreshUrgentRequests")?.addEventListener("click", async () => {
    await loadProviderUrgentCalls();
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
      showAlert("Localização do chamado capturada.", "success");
    } catch (error) {
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

  if (!state.urgentLocation) {
    showAlert("Defina a localização do chamado.", "error");
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

  localStorage.setItem("lastCallTime", Date.now());

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
    const { data: chamadoData, error: chamadoError } = await supabase
      .from("chamados")
      .insert({
        servico,
        cliente_contato: clienteContato,
        descricao,
        latitude: state.urgentLocation.latitude,
        longitude: state.urgentLocation.longitude,
        location: `POINT(${state.urgentLocation.longitude} ${state.urgentLocation.latitude})`,
        status: "aberto"
      })
      .select()
      .single();

    if (chamadoError) {
      throw chamadoError;
    }

    state.myUrgentCallId = chamadoData.id;

    let nearbyProviders = null;

    const rpcResponse = await supabase.rpc("buscar_prestadores", {
      user_lat: state.urgentLocation.latitude,
      user_lng: state.urgentLocation.longitude,
      raio_metros: 10000,
      servico_busca: servico || null
    });

    if (!rpcResponse.error && Array.isArray(rpcResponse.data)) {
      nearbyProviders = rpcResponse.data.filter(provider => provider.atende_emergencia);
    }

    if (!nearbyProviders) {
      const { data: providersData, error: providersError } = await supabase
        .from("prestadores")
        .select("*")
        .eq("atende_emergencia", true);

      if (providersError) {
        throw providersError;
      }

      nearbyProviders = (providersData || []).filter(provider => {
        const serviceMatch = String(provider.servico || "")
          .toLowerCase()
          .includes(servico.toLowerCase());

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

      if (destinatariosError) {
        throw destinatariosError;
      }
    }

    $("formUrgent").reset();
    $("urgentResponsesList").innerHTML = "";
    showAlert("Chamado urgente enviado com sucesso.", "success");
    await loadMyUrgentResponses();
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Erro ao enviar chamado urgente.", "error");
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
    refreshAuthUI();
    if (!silent) updateDashboardUI();
    return;
  }

  const { data, error } = await supabase
    .from("prestadores")
    .select("*")
    .eq("user_id", state.currentUser.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    if (!silent) showAlert("Erro ao carregar seu perfil.", "error");
    return;
  }

  state.currentProviderProfile = data || null;
  refreshAuthUI();
  updateDashboardUI();

  if (state.currentProviderProfile) {
    await loadProviderUrgentCalls();
  }
}

function updateDashboardUI() {
  const profile = state.currentProviderProfile;

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
    $("statPlan").textContent = "Sem perfil";
    $("planMessage").textContent = "Faça login para ver o status do plano.";
    $("providerUrgentCallsList").innerHTML = "";

    return;
    }

  $("profileName").value = profile.nome || "";
  $("profileWhatsapp").value = profile.whatsapp || "";
  $("profileService").value = profile.servico || "";
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

  const boostAtivo =
    (profile.boost_ate && new Date(profile.boost_ate) > now) || !!profile.boost_ativo;

  $("statPlan").textContent = assinaturaAtiva ? "Assinatura ativa" : "Grátis / sem assinatura";

  const partes = [];

  if (assinaturaAtiva) {
    partes.push(`Assinatura ativa até ${formatDateTimeBR(profile.assinatura_ate)}`);
  } else {
    partes.push("Sem assinatura ativa no momento.");
  }

  if (boostAtivo) {
    partes.push(
      `Boost ativo${profile.boost_ate ? ` até ${formatDateTimeBR(profile.boost_ate)}` : ""}.`
    );
  } else {
    partes.push("Boost inativo.");
  }

  $("planMessage").textContent = partes.join(" ");
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
        created_at
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

  renderProviderUrgentCalls(state.providerUrgentCalls);
}

function renderProviderUrgentCalls(calls) {
  const container = $("providerUrgentCallsList");
  container.innerHTML = "";

  if (!calls.length) {
    container.innerHTML = `
      <div class="card">
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
      <div class="card">
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
        prestador_escolhido_id
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

  const fechado =
    state.myUrgentCallId &&
    responses.some(response => response.chamado?.status === "fechado");

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
          <p class="provider-service">${escapeHtml(prestador?.servico || "Serviço")}</p>
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

async function restoreSession() {
  if (!supabase) return;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  state.currentUser = session?.user || null;
  refreshAuthUI();

  if (state.currentUser) {
    await loadMyProvider(true);
  }

  supabase.auth.onAuthStateChange(async (_event, sessionNow) => {
    state.currentUser = sessionNow?.user || null;
    refreshAuthUI();

    if (state.currentUser) {
      await loadMyProvider(true);
      initRealtime();
    } else {
      state.currentProviderProfile = null;
      updateDashboardUI();
      clearRealtimeChannels();
    }
  });
}


async function loadPublicProfile() {
  const url = new URL(window.location.href);
  const prestadorId = url.searchParams.get("prestador");

  if (!prestadorId) return;

  const { data, error } = await supabase
    .from("prestadores")
    .select("*")
    .eq("id", prestadorId)
    .single();

  if (error || !data) return;

  renderProviders([data]);
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

  await restoreSession();
  await fetchProviders();
  initRealtime();
  processPaymentReturn();
  loadPublicProfile();

  const footerYear = document.getElementById("footerYear");
if (footerYear) {
  footerYear.textContent = String(new Date().getFullYear());
}

});