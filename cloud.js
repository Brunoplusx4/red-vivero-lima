(() => {
  const config = window.VIVERO_BACKEND_CONFIG || {};
  const SESSION_KEY = "viveroCloudAdminSession";
  const CATALOG_ID = "main";

  const configured = () => Boolean(config.supabaseUrl && config.supabaseAnonKey);

  function projectUrl() {
    const url = new URL(config.supabaseUrl);
    url.pathname = url.pathname.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
    if (url.pathname && url.pathname !== "/") {
      throw new Error("Usa la Project URL de Supabase, no una URL de una ruta específica de API.");
    }
    return url.origin;
  }

  async function request(path, options = {}, accessToken) {
    if (!configured()) {
      throw new Error("Falta configurar la URL y la clave pública de Supabase en backend-config.js.");
    }

    const response = await fetch(`${projectUrl()}${path}`, {
      ...options,
      headers: {
        apikey: config.supabaseAnonKey,
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers
      }
    });

    const responseText = await response.text();
    let payload = null;
    if (responseText) {
      try {
        payload = JSON.parse(responseText);
      } catch {
        throw new Error(`Supabase devolvió una respuesta no válida (${response.status}).`);
      }
    }

    if (!response.ok) {
      throw new Error(payload?.msg || payload?.message || payload?.hint || `Error de Supabase (${response.status}).`);
    }

    return payload;
  }

  function getSession() {
    const serialized = localStorage.getItem(SESSION_KEY);
    if (!serialized) return null;

    try {
      return JSON.parse(serialized);
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at || Math.floor(Date.now() / 1000) + (session.expires_in || 3600),
      user: session.user
    }));
  }

  function validateCatalog(data) {
    if (!data || typeof data !== "object" ||
        !Array.isArray(data.viveros) || !Array.isArray(data.productos) ||
        typeof data.whatsappOperador !== "string") {
      throw new Error("La base de datos contiene un catálogo incompleto. Revisa los datos antes de editar.");
    }
    return data;
  }

  async function authenticatedSession() {
    const session = getSession();
    if (!session) throw new Error("Inicia sesión para continuar.");

    if (session.expires_at > Math.floor(Date.now() / 1000) + 60) return session;

    try {
      const refreshed = await request("/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        body: JSON.stringify({ refresh_token: session.refresh_token })
      });
      saveSession(refreshed);
      return getSession();
    } catch (error) {
      localStorage.removeItem(SESSION_KEY);
      throw new Error(`La sesión venció. Vuelve a iniciar sesión. ${error.message}`);
    }
  }

  async function loadCatalog() {
    const rows = await request(`/rest/v1/catalog?select=data&id=eq.${CATALOG_ID}`);
    if (!Array.isArray(rows) || rows.length === 0 || rows[0].data?._setupRequired) return null;
    return validateCatalog(rows[0].data);
  }

  async function signIn(email, password) {
    const session = await request("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    saveSession(session);
    return session.user;
  }

  async function saveCatalog(data) {
    validateCatalog(data);
    const session = await authenticatedSession();
    const rows = await request(`/rest/v1/catalog?id=eq.${CATALOG_ID}&select=id`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ data, updated_at: new Date().toISOString() })
    }, session.access_token);

    if (!Array.isArray(rows) || rows.length !== 1) {
      throw new Error("No se guardó el catálogo. Revisa la política de administrador en Supabase.");
    }
  }

  async function uploadImage(file) {
    const mimeExtensions = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif"
    };
    const extension = mimeExtensions[file.type];
    if (!extension) throw new Error("Usa una imagen JPG, PNG, WebP o GIF.");
    if (file.size > 5 * 1024 * 1024) throw new Error("La imagen supera el límite de 5 MB.");

    const session = await authenticatedSession();
    const objectPath = `images/${crypto.randomUUID()}.${extension}`;
    await request(`/storage/v1/object/catalog-media/${objectPath}`, {
      method: "POST",
      headers: { "Content-Type": file.type, "x-upsert": "false" },
      body: file
    }, session.access_token);

    return `${projectUrl()}/storage/v1/object/public/catalog-media/${objectPath}`;
  }

  window.ViveroCloud = {
    isConfigured: configured,
    getSession,
    loadCatalog,
    signIn,
    saveCatalog,
    uploadImage,
    signOut() {
      localStorage.removeItem(SESSION_KEY);
    }
  };
})();
