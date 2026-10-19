(() => {
  const config = window.RED_VIVERO_CONFIG;
  const $ = (selector) => document.querySelector(selector);
  let activeFilter = "Todo";

  const waLink = (message) => `https://wa.me/${config.whatsappOperador}?text=${encodeURIComponent(message)}`;
  const categories = ["Todo", ...new Set(config.productos.map(p => p.categoria))];
  const formatText = (value) => String(value || "").replace(/[<>]/g, "");

  function initBrand() {
    document.title = `${config.nombre} | Stock mayorista`;
    $("#brandName").textContent = config.nombre;
    $("#footerName").textContent = config.nombre;
    $("#updatedAt").textContent = config.fechaActualizacion;
  }

  function renderFilters() {
    const filters = $("#filters");
    filters.innerHTML = categories.map(category => `<button type="button" class="filter ${category === activeFilter ? "active" : ""}" data-filter="${category}">${category}</button>`).join("");
    filters.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      renderFilters();
      renderCatalog();
    }));
  }

  function renderCatalog() {
    const visible = activeFilter === "Todo" ? config.productos : config.productos.filter(p => p.categoria === activeFilter);
    $("#stockCount").textContent = `${visible.length} referencias publicadas · Actualiza el stock antes de compartir.`;
    $("#catalogGrid").innerHTML = visible.length ? visible.map(p => `
      <article class="product-card">
        <div class="product-visual" style="--tone1:${p.tono1};--tone2:${p.tono2}">${p.imagen ? `<img class="product-image" src="${p.imagen}" alt="${p.nombre}" />` : `<span class="plant-icon" aria-hidden="true">${p.icono}</span>`}<span class="stock-badge">${p.cantidad}</span></div>
        <div class="product-content">
          <span class="product-meta">${p.categoria} · ${p.zona}</span>
          <h3>${p.nombre}</h3><p>${p.tamano}</p><p>${p.minimo}</p>
          <div class="product-footer"><span class="price">${p.precio}</span><button class="mini-button" data-product="${p.id}">Consultar</button></div>
        </div>
      </article>`).join("") : `<div class="empty">No hay productos en esta categoría por ahora.</div>`;
    document.querySelectorAll("[data-product]").forEach(button => button.addEventListener("click", () => openProduct(button.dataset.product)));
  }

  function openProduct(id) {
    const p = config.productos.find(item => item.id === id);
    const dialog = $("#productDialog");
    $("#dialogContent").innerHTML = `<div class="dialog-body"><p class="eyebrow">${p.categoria} · ${p.zona}</p><h2>${p.nombre}</h2><p>${p.descripcion}</p><div class="dialog-details"><div><small>Tamaño</small>${p.tamano}</div><div><small>Precio</small>${p.precio}</div><div><small>Compra mínima</small>${p.minimo}</div><div><small>Disponibilidad</small>${p.cantidad}</div></div><a class="button button-primary" href="${waLink(`Hola. Busco ${p.nombre} (${p.tamano}). Necesito consultar disponibilidad, precio y condiciones de recojo.`)}" target="_blank" rel="noopener">Consultar por WhatsApp</a></div>`;
    dialog.showModal();
  }

  function initForm() {
    $("#requestForm").addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const code = `RV-${Date.now().toString().slice(-6)}`;
      const request = Object.fromEntries(form.entries());
      const saved = JSON.parse(localStorage.getItem("redViveroSolicitudes") || "[]");
      saved.unshift({code, createdAt:new Date().toISOString(), ...request});
      localStorage.setItem("redViveroSolicitudes", JSON.stringify(saved.slice(0, 50)));
      const message = `*Solicitud ${code}*\n\n*Nombre / empresa:* ${formatText(request.nombre)}\n*WhatsApp:* ${formatText(request.whatsapp)}\n*Planta:* ${formatText(request.planta)}\n*Cantidad:* ${formatText(request.cantidad)}\n*Tamaño:* ${formatText(request.tamano || "No indicado")}\n*Fecha:* ${formatText(request.fecha || "No indicada")}\n*Zona:* ${formatText(request.zona || "No indicada")}\n*Alternativas:* ${formatText(request.alternativas)}\n*Notas:* ${formatText(request.notas || "Ninguna")}\n\nEntiendo que el stock se confirma directamente con el productor.`;
      window.open(waLink(message), "_blank", "noopener");
      event.currentTarget.reset();
    });
  }

  function initActions() {
    $(".dialog-close").addEventListener("click", () => $("#productDialog").close());
    $("#supplierButton").addEventListener("click", () => window.open(waLink("Hola. Soy productor y quiero conocer los requisitos para publicar mi stock mayorista en la red."), "_blank", "noopener"));
    $("#footerWhatsApp").addEventListener("click", () => window.open(waLink("Hola. Quiero hacer una consulta sobre Red Vivero Lima."), "_blank", "noopener"));
    $("#shareCatalog").addEventListener("click", async () => {
      const shareData = {title:config.nombre, text:"Consulta disponibilidad mayorista de plantas en Lima", url:window.location.href};
      try { if (navigator.share) await navigator.share(shareData); else { await navigator.clipboard.writeText(window.location.href); alert("Enlace copiado."); } } catch (_) {}
    });
  }

  initBrand(); renderFilters(); renderCatalog(); initForm(); initActions();
})();
