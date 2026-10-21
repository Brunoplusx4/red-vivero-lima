(() => {
  // La configuración en la nube, cuando existe, se carga después de iniciar la página.
  const STORAGE_KEY = "redViveroCustomConfig";
  const customConfig = localStorage.getItem(STORAGE_KEY);
  let config = customConfig ? JSON.parse(customConfig) : window.RED_VIVERO_CONFIG;

  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  let activeCategory = "Todo";
  let activeSearchText = "";
  let activeZone = "Todas";
  let activeNurseryId = "Todos";
  let activeVipOnly = false;
  let activeSort = "destacados";

  let mapInstance = null;
  let nurseryMarkers = {};

  const getOperatorWhatsApp = () => config.whatsappOperador || window.RED_VIVERO_CONFIG.whatsappOperador;
  const waLink = (_number, message) => `https://wa.me/${getOperatorWhatsApp()}?text=${encodeURIComponent(message)}`;
  const formatText = value => String(value || "").replace(/[<>]/g, "");
  const getPrimaryNursery = () =>
    (config.viveros || []).find(v => v.id === config.viveroPrincipalId) || (config.viveros || [])[0];
  const isPrimaryNursery = id => getPrimaryNursery()?.id === id;

  // -------------------------------------------------------------
  // BRANDING Y ENCABEZADOS
  // -------------------------------------------------------------
  function initBrand() {
    const primaryNursery = getPrimaryNursery();
    const brandName = primaryNursery ? primaryNursery.nombre : config.nombre;
    document.title = `${brandName} | Plantas y viveros aliados`;
    $("#brandName").textContent = brandName;
    $("#footerName").textContent = brandName;
    $("#updatedAt").textContent = config.fechaActualizacion || "Consulta disponibilidad";

    const waOperador = getOperatorWhatsApp();
    const generalMessage = `Hola, quisiera información sobre ${brandName} y sus plantas.`;
    $("#footerWhatsApp").href = waLink(waOperador, generalMessage);
    const displayPhone = waOperador.startsWith("51")
      ? `+51 ${waOperador.slice(2).replace(/(\d{3})(?=\d)/g, "$1 ")}`
      : `+${waOperador.replace(/(\d{3})(?=\d)/g, "$1 ")}`;
    $("#footerWhatsApp").textContent = `WhatsApp: ${displayPhone}`;
    $("#footerWhatsApp").target = "_blank";
    $("#headerWhatsApp").href = waLink(waOperador, generalMessage);
    $("#heroWhatsApp").href = waLink(waOperador, generalMessage);

    if (primaryNursery) {
      $("#heroNurseryName").textContent = primaryNursery.nombre;
      $("#heroNurseryZone").textContent = primaryNursery.zona || "Lima";
      $("#heroNurseryAddress").textContent = primaryNursery.direccion || "Consulta el punto de recojo";
      $("#heroNurserySpecialty").textContent = primaryNursery.especialidad || "Plantas ornamentales";
    }
  }

  // -------------------------------------------------------------
  // SECCIÓN PUBLICITARIA VIP (VIVERO DESTACADO)
  // -------------------------------------------------------------
  function renderVipAd() {
    const container = $("#vipAdContainer");
    const pub = config.publicidad;

    if (!pub || pub.activo === false || !pub.viveroDestacado) {
      $("#publicidad-vip").style.display = "none";
      return;
    }

    $("#publicidad-vip").style.display = "block";
    const dest = pub.viveroDestacado;
    const vId = dest.id;
    const vObj = (config.viveros && config.viveros.find(v => v.id === vId)) || {};

    const imgUrl = dest.imagen || vObj.imagen || "assets/vivero_destacado.jpg";
    const waNumber = dest.whatsapp || vObj.whatsapp || config.whatsappOperador;

    container.innerHTML = `
      <article class="vip-ad-card">
        <div class="vip-ad-visual">
          <img class="vip-ad-img" src="${imgUrl}" alt="${dest.nombre}" />
          <span class="vip-ad-badge-top">${dest.badge || "⭐ VIVERO DESTACADO"}</span>
          ${dest.videoUrl ? `<button id="btnPlayVideoSpot" class="vip-ad-play-btn" aria-label="Ver video promocional">▶</button>` : ""}
        </div>
        <div class="vip-ad-content">
          <span class="vip-tag">${dest.badge || "NUESTRO VIVERO PRINCIPAL"}</span>
          <h2>${dest.nombre}</h2>
          <p style="font-weight:700;color:#fef08a;">${dest.slogan || ""}</p>
          <p>${dest.descripcion || ""}</p>
          <div class="vip-badges-row">
            <span class="vip-badge-item">📍 ${dest.zona || vObj.zona || "Lima"}</span>
            <span class="vip-badge-item">🌿 ${vObj.especialidad || "Plantas ornamentales"}</span>
            <span class="vip-badge-item">📲 Atención directa por WhatsApp</span>
          </div>
          <div class="vip-ad-actions">
            <a class="button button-gold" href="${waLink(waNumber, `Hola ${dest.nombre}. Vi la información de su vivero y quiero consultar por sus plantas.`)}" target="_blank" rel="noopener">
              <span>📲</span> ${dest.botonTexto || "Consultar por WhatsApp"}
            </a>
            <button class="button button-secondary" type="button" onclick="focusNurseryMap('${vId}')">
              <span>📍</span> Ver en el Mapa
            </button>
            ${dest.videoUrl ? `
              <button class="button button-secondary" type="button" onclick="openVideoModal('${dest.videoUrl}')">
                <span>🎬</span> Ver Spot de Video
              </button>
            ` : ""}
          </div>
        </div>
      </article>
    `;

    if (dest.videoUrl && $("#btnPlayVideoSpot")) {
      $("#btnPlayVideoSpot").addEventListener("click", () => openVideoModal(dest.videoUrl));
    }
  }

  // -------------------------------------------------------------
  // BUSCADOR Y FILTROS INTELIGENTES DEL CATÁLOGO
  // -------------------------------------------------------------
  function initSearchAndFilters() {
    // 1. Categorías únicas
    const categories = ["Todo", ...new Set(config.productos.map(p => p.categoria))];
    const filters = $("#filters");
    filters.innerHTML = categories
      .map(
        cat =>
          `<button type="button" class="filter ${cat === activeCategory ? "active" : ""}" data-category="${cat}">${cat}</button>`
      )
      .join("");

    filters.querySelectorAll("button").forEach(button => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        filters.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        renderCatalog();
      });
    });

    // 2. Desplegable de Zonas
    const zones = ["Todas", ...new Set(config.productos.map(p => p.zona).filter(Boolean))];
    const zoneSelect = $("#filterZone");
    zoneSelect.innerHTML = zones.map(z => `<option value="${z}">${z === "Todas" ? "📍 Todas las zonas" : `📍 ${z}`}</option>`).join("");
    zoneSelect.value = activeZone;

    const nurserySelect = $("#filterNursery");
    const nurseries = config.viveros || [];
    if (activeNurseryId !== "Todos" && !nurseries.some(v => v.id === activeNurseryId)) {
      activeNurseryId = "Todos";
    }
    nurserySelect.innerHTML = `<option value="Todos">🌱 Todos los viveros</option>${nurseries
      .map(v => `<option value="${v.id}">${v.nombre}</option>`)
      .join("")}`;
    nurserySelect.value = activeNurseryId;

    if (!zoneSelect.dataset.bound) {
      zoneSelect.addEventListener("change", e => {
        activeZone = e.target.value;
        renderCatalog();
      });
      zoneSelect.dataset.bound = "true";
    }

    if (!nurserySelect.dataset.bound) {
      nurserySelect.addEventListener("change", e => {
        activeNurseryId = e.target.value;
        renderCatalog();
      });
      nurserySelect.dataset.bound = "true";
    }

    // 3. Desplegable de Viveros VIP
    const vipSelect = $("#filterVip");
    if (!vipSelect.dataset.bound) {
      vipSelect.addEventListener("change", e => {
        activeVipOnly = e.target.value === "SoloVIP";
        renderCatalog();
      });
      vipSelect.dataset.bound = "true";
    }

    // 4. Ordenamiento
    const sortSelect = $("#sortOrder");
    if (!sortSelect.dataset.bound) {
      sortSelect.addEventListener("change", e => {
        activeSort = e.target.value;
        renderCatalog();
      });
      sortSelect.dataset.bound = "true";
    }

    // 5. Input de Búsqueda instantáneo
    let debounceTimer;
    const searchInput = $("#catalogSearch");
    if (!searchInput.dataset.bound) {
      searchInput.addEventListener("input", e => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          activeSearchText = e.target.value.trim().toLowerCase();
          renderCatalog();
        }, 150);
      });
      searchInput.dataset.bound = "true";
    }
  }

  // -------------------------------------------------------------
  // RENDERIZADO DEL CATÁLOGO DE PRODUCTOS
  // -------------------------------------------------------------
  function renderCatalog() {
    let list = [...config.productos];

    // Filtro por categoría
    if (activeCategory !== "Todo") {
      list = list.filter(p => p.categoria === activeCategory);
    }

    // Filtro por zona
    if (activeZone !== "Todas") {
      list = list.filter(p => p.zona === activeZone);
    }

    if (activeNurseryId !== "Todos") {
      list = list.filter(p => p.viveroId === activeNurseryId);
    }

    // Filtro por VIP
    if (activeVipOnly) {
      list = list.filter(p => {
        const v = config.viveros && config.viveros.find(item => item.id === p.viveroId);
        return p.esDestacado || (v && v.esVip);
      });
    }

    // Filtro por texto en vivo
    if (activeSearchText) {
      list = list.filter(p => {
        const v = config.viveros && config.viveros.find(item => item.id === p.viveroId);
        const vName = v ? v.nombre.toLowerCase() : "";
        return (
          p.nombre.toLowerCase().includes(activeSearchText) ||
          p.categoria.toLowerCase().includes(activeSearchText) ||
          (p.zona && p.zona.toLowerCase().includes(activeSearchText)) ||
          vName.includes(activeSearchText) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(activeSearchText))
        );
      });
    }

    // Ordenamiento
    if (activeSort === "az") {
      list.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (activeSort === "precio-menor") {
      list.sort((a, b) => (a.precioNum || 0) - (b.precioNum || 0));
    } else if (activeSort === "precio-mayor") {
      list.sort((a, b) => (b.precioNum || 0) - (a.precioNum || 0));
    } else {
      const primaryNurseryId = getPrimaryNursery()?.id;
      list.sort((a, b) => {
        const primaryDifference = Number(b.viveroId === primaryNurseryId) - Number(a.viveroId === primaryNurseryId);
        return primaryDifference || Number(b.esDestacado) - Number(a.esDestacado);
      });
    }

    const grid = $("#catalogGrid");
    const counter = $("#stockCount");
    counter.innerHTML = `<span>🌿</span> Mostrando <strong>${list.length}</strong> plantas y referencias disponibles.`;

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:3rem 1.5rem;background:#fff;border-radius:1rem;border:1px dashed var(--line);">
          <span style="font-size:3rem;">🔍</span>
          <h3 style="margin:0.8rem 0 0.3rem;">No se encontraron plantas con estos filtros</h3>
          <p style="color:var(--muted);margin-bottom:1.2rem;">Prueba con otra búsqueda o cuéntanos qué planta necesitas.</p>
          <a class="button button-primary" href="#solicitud">Solicitar planta no encontrada</a>
        </div>
      `;
      return;
    }

    grid.innerHTML = list
      .map(p => {
        const v = config.viveros && config.viveros.find(item => item.id === p.viveroId);
        const isPrimary = v && isPrimaryNursery(v.id);
        const isSponsored = p.esDestacado || (v && v.esVip);
        const waTarget = (v && v.whatsapp) || config.whatsappOperador;

        return `
        <article class="product-card ${isSponsored ? "sponsored" : ""}">
          <div class="product-visual" style="--tone1:${p.tono1 || "#4b8a55"};--tone2:${p.tono2 || "#bfd6a9"}">
            ${p.imagen ? `<img class="product-image" src="${p.imagen}" alt="${p.nombre}" loading="lazy" />` : `<span class="plant-icon" aria-hidden="true">${p.icono || "🌿"}</span>`}
            <span class="stock-badge">${p.cantidad || "Disponible"}</span>
            ${isPrimary ? `<span class="sponsored-badge">🌿 Nuestro vivero</span>` : isSponsored ? `<span class="sponsored-badge">⭐ Destacado</span>` : ""}
          </div>
          <div class="product-content">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="product-meta">${p.categoria} · 📍 ${p.zona || "Lima"}</span>
            </div>
            <h3>${p.nombre}</h3>
            ${v ? `<span class="product-nursery">${isPrimary ? "🌱 Nuestro vivero" : `🌱 Vivero aliado: ${v.nombre}`}</span>` : ""}
            <p class="product-size">${p.tamano || "Tamaño estándar de vivero"}</p>
            <span class="product-min">${p.minimo || "Consultar lote"}</span>
            <div class="product-footer">
              <span class="price">${p.precio}</span>
              <div style="display:flex;gap:0.4rem;">
                <button class="mini-button" style="background:#eef5ec;color:#154a3a;" onclick="openProductModal('${p.id}')">Ficha</button>
                <a class="mini-button" href="${waLink(waTarget, `Hola, quiero consultar por *${p.nombre}* (${p.tamano || "tamaño por confirmar"}) a ${p.precio}. ¿Me confirman disponibilidad y condiciones?`)}" target="_blank" rel="noopener">Consultar</a>
              </div>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  }

  // -------------------------------------------------------------
  // MODALES (PRODUCTO Y VIDEO)
  // -------------------------------------------------------------
  window.openProductModal = id => {
    const p = config.productos.find(item => item.id === id);
    if (!p) return;
    const v = config.viveros && config.viveros.find(item => item.id === p.viveroId);
    const waTarget = config.whatsappOperador;

    const dialog = $("#productDialog");
    $("#dialogContent").innerHTML = `
      <div class="dialog-body">
        ${p.imagen ? `<div class="dialog-img-holder"><img src="${p.imagen}" alt="${p.nombre}" /></div>` : ""}
        <p class="eyebrow">${p.categoria} · 📍 ${p.zona || "Lima"}</p>
        <h2>${p.nombre}</h2>
        ${v ? `<p style="font-weight:700;color:var(--leaf);">${isPrimaryNursery(v.id) ? "Nuestro vivero" : "Vivero aliado"}: ${v.nombre} · ${v.zona || "Lima"}</p>` : ""}
        <p style="color:var(--muted);">${p.descripcion || "Planta producida y lista para comercialización al por mayor en viveros de Lima."}</p>

        <div class="dialog-details">
          <div><small>Tamaño / Presentación</small>${p.tamano || "Estándar"}</div>
          <div><small>Precio mayorista</small><strong>${p.precio}</strong></div>
          <div><small>Compra mínima</small>${p.minimo || "Mín. 1 unidad"}</div>
          <div><small>Disponibilidad</small>${p.cantidad || "Disponible"}</div>
          <div><small>Recojo</small>${p.direccionRecojo || (v && v.direccion) || "Consultar por WhatsApp"}</div>
          <div><small>Estado de la planta</small>${p.estadoPlanta || "Consultar estado actual"}</div>
          <div><small>Foto / información actualizada</small>${p.fechaFoto || "Consultar fecha reciente"}</div>
        </div>

        <div style="display:flex;gap:0.8rem;flex-wrap:wrap;margin-top:1.2rem;">
          <a class="button button-primary" href="${waLink(waTarget, `Hola. Deseo cotizar *${p.nombre}* (${p.tamano || ""}) del vivero ${v ? v.nombre : ""}. ¿Tienen stock disponible para entrega?`)}" target="_blank" rel="noopener">
            <span>📲</span> Consultar por WhatsApp
          </a>
          ${v ? `<button class="button button-secondary" type="button" onclick="focusNurseryMap('${v.id}');$('#productDialog').close();"><span>📍</span> Ver ubicación en mapa</button>` : ""}
          ${p.videoUrl ? `<button class="button button-secondary" type="button" onclick="openVideoModal('${p.videoUrl}')"><span>🎬</span> Ver video de la planta</button>` : ""}
        </div>
      </div>
    `;
    dialog.showModal();
  };

  window.openVideoModal = videoUrl => {
    if (!videoUrl) return;
    const videoDialog = $("#videoDialog");
    const container = $("#videoContainer");

    // Si es YouTube
    let embedUrl = videoUrl;
    if (videoUrl.includes("youtube.com/watch?v=")) {
      const videoId = videoUrl.split("v=")[1].split("&")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else if (videoUrl.includes("youtu.be/")) {
      const videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    if (embedUrl.includes("youtube.com/embed")) {
      container.innerHTML = `
        <iframe width="100%" height="420" src="${embedUrl}" title="Video promocional" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius:12px;border:none;"></iframe>
      `;
    } else {
      container.innerHTML = `
        <video controls autoplay style="width:100%;max-height:450px;border-radius:12px;">
          <source src="${videoUrl}" type="video/mp4" />
          Tu navegador no soporta reproducción de video directa.
        </video>
      `;
    }

    videoDialog.showModal();
  };

  // -------------------------------------------------------------
  // MAPA INTERACTIVO DE LIMA (LEAFLET)
  // -------------------------------------------------------------
  function initLeafletMap() {
    const mapElement = $("#viverosMap");
    if (!mapElement) return;

    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
      nurseryMarkers = {};
    }

    // Centro inicial: Lima Metropolitano
    mapInstance = L.map("viverosMap").setView([-12.15, -76.96], 11);

    L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    }).addTo(mapInstance);

    const viveros = config.viveros || [];

    viveros.forEach(v => {
      if (!v.lat || !v.lng) return;

      const isVip = !!v.esVip;
      // Icono personalizado con HTML / CSS
      const iconHtml = `
        <div style="background:${isVip ? "linear-gradient(135deg,#f59e0b,#d97706)" : "#15803d"};color:#fff;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:1.1rem;box-shadow:0 4px 12px rgba(0,0,0,0.3);border:2px solid #fff;">
          ${v.logo || "🌱"}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-marker",
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([v.lat, v.lng], { icon: customIcon }).addTo(mapInstance);

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}`;
      const waNumber = v.whatsapp || config.whatsappOperador;

      const popupContent = `
        <div class="nursery-popup">
          <span style="font-size:0.75rem;font-weight:800;color:${isVip ? "#d97706" : "#15803d"};text-transform:uppercase;">
            ${isVip ? "⭐ Vivero Verificado VIP" : "Productor Asociado"}
          </span>
          <h4>${v.nombre}</h4>
          <p><strong>Contacto:</strong> ${v.productor || "Encargado"}<br />
          <strong>Zona:</strong> ${v.zona}<br />
          <strong>Dirección:</strong> ${v.direccion || "Consultar punto de recojo"}<br />
          <strong>Especialidad:</strong> ${v.especialidad || "Plantas al por mayor"}</p>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.5rem;">
            <a class="nursery-popup-link" href="${waLink(waNumber, `Hola, quiero consultar por ${v.nombre} y su disponibilidad de plantas.`)}" target="_blank" rel="noopener">
              📲 WhatsApp
            </a>
            <a class="nursery-popup-link" href="${googleMapsUrl}" target="_blank" rel="noopener" style="background:#2563eb;">
              🚗 Cómo llegar
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      nurseryMarkers[v.id] = marker;
    });
  }

  window.focusMapZone = zone => {
    if (!mapInstance) return;
    const coords = {
      todo: { lat: -12.15, lng: -76.96, zoom: 11 },
      lurin: { lat: -12.2749, lng: -76.8719, zoom: 13 },
      ves: { lat: -12.2085, lng: -76.9360, zoom: 14 },
      acho: { lat: -12.0402, lng: -77.0225, zoom: 14 },
      carabayllo: { lat: -11.8900, lng: -77.0350, zoom: 13 }
    };
    const target = coords[zone] || coords.todo;
    mapInstance.setView([target.lat, target.lng], target.zoom);
  };

  window.focusNurseryMap = id => {
    const marker = nurseryMarkers[id];
    const v = config.viveros && config.viveros.find(item => item.id === id);
    if (v && mapInstance) {
      $("#mapa-lima").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        mapInstance.setView([v.lat, v.lng], 15);
        if (marker) marker.openPopup();
      }, 500);
    }
  };

  // -------------------------------------------------------------
  // DIRECTORIO DE VIVEROS Y CAPTACIÓN DE PUBLICIDAD
  // -------------------------------------------------------------
  function renderNurseriesGrid() {
    const grid = $("#nurseriesGrid");
    const viveros = config.viveros || [];
    const waOperador = config.whatsappOperador || "51903227351";

    const cardsHtml = viveros
      .map(v => {
        const isPrimary = isPrimaryNursery(v.id);
        const isVip = !!v.esVip;
        const waTarget = v.whatsapp || waOperador;
          return `
          <div class="nursery-card ${isPrimary ? "primary" : isVip ? "vip" : ""}">
            <div class="nursery-header">
              <div class="nursery-logo">${v.logo || "🌱"}</div>
              <div>
                <span style="font-size:0.75rem;font-weight:800;color:${isVip ? "#d97706" : "var(--leaf)"};">
                  ${isPrimary ? "NUESTRO VIVERO" : "VIVERO ALIADO"}
              </span>
              <h3>${v.nombre}</h3>
              <p>📍 ${v.zona} · ${v.productor || "Contacto de ventas"}</p>
            </div>
          </div>
          <p style="font-size:0.88rem;color:var(--muted);">${v.descripcion || `Especialistas en ${v.especialidad || "plantas ornamentales"} al por mayor.`}</p>
          <div style="font-size:0.82rem;background:#f2f6f1;padding:0.4rem 0.7rem;border-radius:6px;font-weight:600;">
            🌿 <strong>Especialidad:</strong> ${v.especialidad || "Plantas en general"}
          </div>
          <div style="display:flex;gap:0.5rem;margin-top:auto;padding-top:0.6rem;">
            <a class="button button-primary" style="flex:1;padding:0.55rem;font-size:0.82rem;" href="${waLink(waTarget, `Hola, quiero consultar por ${v.nombre} y su disponibilidad de plantas.`)}" target="_blank" rel="noopener">
              📲 Contactar
            </a>
            <button class="button button-secondary" style="padding:0.55rem 0.8rem;font-size:0.82rem;" onclick="focusNurseryMap('${v.id}')">
              📍 Mapa
            </button>
          </div>
        </div>
      `;
      })
      .join("");

    // Tarjeta publicitaria para atraer más viveros
    const adSalesCard = `
      <div class="ad-sales-card">
        <span class="vip-tag" style="background:#fef08a;color:#78350f;">📢 ESPACIO COMERCIAL DISPONIBLE</span>
        <h3>¿Tienes un vivero? Súmalo a la red.</h3>
        <p>
          Presenta tu vivero, comparte tus plantas disponibles y recibe consultas centralizadas por WhatsApp.
        </p>
        <ul style="margin:0.2rem 0;padding-left:1.2rem;font-size:0.88rem;color:#bbf7d0;line-height:1.5;">
          <li>Ficha con zona, especialidad, fotos y ubicación.</li>
          <li>Productos con precio, tamaño y disponibilidad.</li>
          <li>Espacios destacados y promoción para tu vivero.</li>
        </ul>
        <p>Consulta por WhatsApp las opciones, requisitos y tarifas para participar.</p>
        <a class="button button-gold" style="margin-top:0.5rem;" href="${waLink(waOperador, "Hola, tengo un vivero y me interesa sumarlo a la red. ¿Me compartes información?")}" target="_blank" rel="noopener">
          <span>🤝</span> Quiero sumar mi vivero
        </a>
      </div>
    `;

    grid.innerHTML = cardsHtml + adSalesCard;
  }

  // -------------------------------------------------------------
  // FORMULARIO "BUSCO PLANTA"
  // -------------------------------------------------------------
  function initRequestForm() {
    $("#requestForm").addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const code = `RV-${Date.now().toString().slice(-6)}`;
      const request = Object.fromEntries(form.entries());

      const saved = JSON.parse(localStorage.getItem("redViveroSolicitudes") || "[]");
      saved.unshift({ code, createdAt: new Date().toISOString(), ...request });
      localStorage.setItem("redViveroSolicitudes", JSON.stringify(saved.slice(0, 50)));

      const message = `*SOLICITUD DE PLANTAS ${code}*\n\n*Nombre / Empresa:* ${formatText(request.nombre)}\n*WhatsApp:* ${formatText(request.whatsapp)}\n*Planta / Especie:* ${formatText(request.planta)}\n*Cantidad:* ${formatText(request.cantidad)}\n*Presentación:* ${formatText(request.tamano || "No indicada")}\n*Fecha requerida:* ${formatText(request.fecha || "No indicada")}\n*Zona:* ${formatText(request.zona || "No indicada")}\n*Alternativas:* ${formatText(request.alternativas)}\n*Notas adicionales:* ${formatText(request.notas || "Ninguna")}\n\n_Enviado desde el catálogo de Vivero Contreras._`;

      window.open(waLink(config.whatsappOperador, message), "_blank", "noopener");
      event.currentTarget.reset();
    });
  }

  // -------------------------------------------------------------
  // CIERRE DE DIALOGS Y ACCIONES GENERALES
  // -------------------------------------------------------------
  function initActions() {
    $$(".dialog-close").forEach(btn => {
      btn.addEventListener("click", e => {
        const dialog = e.target.closest("dialog");
        if (dialog) dialog.close();
        // Si es video, detener reproducción
        if ($("#videoContainer")) $("#videoContainer").innerHTML = "";
      });
    });

    $("#shareCatalog").addEventListener("click", async () => {
      const shareData = {
        title: config.nombre,
        text: "Consulta disponibilidad mayorista de plantas, viveros y flores en Lima",
        url: window.location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(window.location.href);
          alert("¡Enlace del catálogo copiado al portapapeles!");
        }
      } catch (_) {}
    });
  }

  // Atajo secreto para que solo el dueño pueda ir al panel desde el catálogo
  function initSecretAdminShortcut() {
    window.addEventListener("keydown", e => {
      // Atajo: Ctrl + Shift + A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        window.location.href = "admin.html";
      }
    });

    // Atajo 2: 3 clics rápidos seguidos en el logo 🌱
    let clickCount = 0;
    let clickTimer = null;
    const brandMark = $(".brand-mark");
    if (brandMark) {
      brandMark.style.cursor = "pointer";
      brandMark.title = "Vivero Contreras";
      brandMark.addEventListener("click", () => {
        clickCount++;
        clearTimeout(clickTimer);
        if (clickCount >= 3) {
          window.location.href = "admin.html";
        }
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 1200);
      });
    }
  }

  function renderCatalogDataNotice(message) {
    const notice = $("#catalogDataNotice");
    if (!notice) return;
    notice.textContent = message;
    notice.hidden = !message;
  }

  async function loadCloudCatalog() {
    if (!window.ViveroCloud?.isConfigured()) return;

    try {
      const remoteConfig = await window.ViveroCloud.loadCatalog();
      if (!remoteConfig) {
        renderCatalogDataNotice("El catálogo en línea aún no está configurado. Se muestran los datos iniciales.");
        return;
      }

      config = remoteConfig;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      renderCatalogDataNotice("");
      initBrand();
      renderVipAd();
      initSearchAndFilters();
      renderCatalog();
      initLeafletMap();
      renderNurseriesGrid();
    } catch (error) {
      console.error("No se pudo cargar el catálogo en línea:", error);
      renderCatalogDataNotice("No se pudo actualizar el catálogo en línea. La información mostrada puede estar desactualizada.");
    }
  }

  // Sincronización en tiempo real si el admin guarda cambios en otra pestaña
  window.addEventListener("storage", e => {
    if (e.key === STORAGE_KEY && e.newValue) {
      const updated = JSON.parse(e.newValue);
      config = updated;
      initBrand();
      renderVipAd();
      initSearchAndFilters();
      renderCatalog();
      initLeafletMap();
      renderNurseriesGrid();
    }
  });

  // -------------------------------------------------------------
  // EJECUCIÓN INICIAL
  // -------------------------------------------------------------
  initBrand();
  renderVipAd();
  initSearchAndFilters();
  renderCatalog();
  initLeafletMap();
  renderNurseriesGrid();
  initRequestForm();
  initActions();
  initSecretAdminShortcut();
  loadCloudCatalog();
  window.setInterval(() => {
    if (document.visibilityState === "visible") loadCloudCatalog();
  }, 60000);
})();
