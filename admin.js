(() => {
  const STORAGE_KEY = "redViveroCustomConfig";
  let state = JSON.parse(JSON.stringify(window.RED_VIVERO_CONFIG));
  let adminInitialized = false;

  // Elementos DOM
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  let adminMap = null;
  let adminMarker = null;

  // -------------------------------------------------------------
  // UTILIDADES
  // -------------------------------------------------------------
  function showToast(text, isError = false) {
    const toast = $("#toastMessage");
    $("#toastText").textContent = text;
    $("#toastIcon").textContent = isError ? "⚠️" : "✅";
    toast.style.display = "flex";
    toast.style.background = isError ? "#991b1b" : "#154a3a";
    setTimeout(() => {
      toast.style.display = "none";
    }, 3500);
  }

  function saveToLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateSalesPitch();
    window.ViveroCloud.saveCatalog(state)
      .then(() => showToast("Cambios guardados en la nube y publicados en el catálogo."))
      .catch(error => {
        console.error("No se pudo guardar el catálogo en la nube:", error);
        showToast(`No se guardó en la nube: ${error.message}`, true);
      });
  }

  function exportDataJs() {
    const fileContent = `/*\n  RED VIVERO LIMA - CONFIGURACIÓN CENTRAL DE DATOS\n  Generado automáticamente desde la Estación de Trabajo\n*/\nwindow.RED_VIVERO_CONFIG = ${JSON.stringify(state, null, 2)};\n`;
    const blob = new Blob([fileContent], { type: "text/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.js";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Copia de respaldo descargada.");
  }

  // Conversión de archivo local a DataURL (Base64)
  function handleFileInput(inputElement, targetUrlElement, onComplete) {
    inputElement.addEventListener("change", async e => {
      const input = e.currentTarget;
      const file = input.files[0];
      if (!file) return;
      input.disabled = true;
      try {
        const imageUrl = await window.ViveroCloud.uploadImage(file);
        targetUrlElement.value = imageUrl;
        if (onComplete) onComplete(imageUrl);
        showToast("Imagen subida. Guarda los cambios para publicarla.");
      } catch (error) {
        console.error("No se pudo subir la imagen:", error);
        showToast(`No se subió la imagen: ${error.message}`, true);
      } finally {
        input.disabled = false;
        input.value = "";
      }
    });
  }

  // -------------------------------------------------------------
  // GESTIÓN DE TABS
  // -------------------------------------------------------------
  function initTabs() {
    $$(".admin-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        $$(".admin-tab-btn").forEach(b => b.classList.remove("active"));
        $$(".admin-tab-pane").forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        const tabId = btn.dataset.tab;
        $(`#${tabId}`).classList.add("active");

        if (tabId === "tab-viveros" && adminMap) {
          setTimeout(() => adminMap.invalidateSize(), 200);
        }
      });
    });
  }

  // -------------------------------------------------------------
  // MAPA SELECTOR EN ADMIN
  // -------------------------------------------------------------
  function initAdminMap() {
    const lat = state.publicidad?.viveroDestacado?.lat || -12.2749;
    const lng = state.publicidad?.viveroDestacado?.lng || -76.8719;

    adminMap = L.map("adminMapPicker").setView([lat, lng], 11);
    L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    }).addTo(adminMap);

    adminMarker = L.marker([lat, lng], { draggable: true }).addTo(adminMap);

    adminMarker.on("dragend", e => {
      const pos = e.target.getLatLng();
      $("#viveroLat").value = pos.lat.toFixed(5);
      $("#viveroLng").value = pos.lng.toFixed(5);
    });

    adminMap.on("click", e => {
      adminMarker.setLatLng(e.latlng);
      $("#viveroLat").value = e.latlng.lat.toFixed(5);
      $("#viveroLng").value = e.latlng.lng.toFixed(5);
    });
  }

  window.setQuickCoords = (lat, lng) => {
    $("#viveroLat").value = lat;
    $("#viveroLng").value = lng;
    if (adminMap && adminMarker) {
      adminMarker.setLatLng([lat, lng]);
      adminMap.setView([lat, lng], 12);
    }
  };

  // -------------------------------------------------------------
  // TAB 1: PUBLICIDAD Y MONETIZACIÓN
  // -------------------------------------------------------------
  function populateAdViverosSelect() {
    const select = $("#adViveroSelect");
    const prodViveroSelect = $("#prodViveroSelect");

    const optionsHtml = state.viveros.map(v => `<option value="${v.id}">${v.nombre} (${v.zona})</option>`).join("");
    select.innerHTML = optionsHtml;
    prodViveroSelect.innerHTML = optionsHtml;

    if (state.publicidad?.viveroDestacado?.id) {
      select.value = state.publicidad.viveroDestacado.id;
    }
  }

  function initPublicidadTab() {
    const pub = state.publicidad || {};
    const dest = pub.viveroDestacado || {};

    $("#adActive").checked = pub.activo !== false;
    $("#adBadge").value = dest.badge || "⭐ VIVERO DESTACADO DEL MES · ESPACIO PATROCINADO";
    $("#adSlogan").value = dest.slogan || "";
    $("#adDesc").value = dest.descripcion || "";
    $("#adImageUrl").value = dest.imagen || "assets/vivero_destacado.jpg";
    $("#adVideoUrl").value = dest.videoUrl || "";
    $("#adWhatsApp").value = dest.whatsapp || state.whatsappOperador;
    $("#adBtnText").value = dest.botonTexto || "Consultar con el Vivero Destacado";

    // Previews
    const updatePreview = () => {
      const selectedVivero = state.viveros.find(v => v.id === $("#adViveroSelect").value) || {};
      $("#prevBadge").textContent = $("#adBadge").value;
      $("#prevTitle").textContent = selectedVivero.nombre || "Nombre del Vivero";
      $("#prevSlogan").textContent = $("#adSlogan").value;
      $("#prevZona").textContent = selectedVivero.zona || "Lima";
      $("#prevWa").textContent = $("#adWhatsApp").value;
    };

    $("#adViveroSelect").addEventListener("change", () => {
      const v = state.viveros.find(item => item.id === $("#adViveroSelect").value);
      if (v) {
        if (!$("#adSlogan").value || $("#adSlogan").value.includes("Producción")) {
          $("#adSlogan").value = `Especialistas en ${v.especialidad || "plantas de calidad"} al por mayor.`;
        }
        if (v.whatsapp) $("#adWhatsApp").value = v.whatsapp;
        if (v.imagen) $("#adImageUrl").value = v.imagen;
      }
      updatePreview();
    });

    ["adBadge", "adSlogan", "adDesc", "adWhatsApp"].forEach(id => {
      $(`#${id}`).addEventListener("input", updatePreview);
    });

    handleFileInput($("#adImageFile"), $("#adImageUrl"), () => updatePreview());

    // Tarifas
    if (pub.tarifarioSugerido) {
      $("#rateWeekly").value = pub.tarifarioSugerido.portadaSemanal || "A coordinar durante el piloto";
      $("#rateMonthly").value = pub.tarifarioSugerido.portadaMensual || "Por validar con viveros";
      $("#rateMap").value = pub.tarifarioSugerido.pinVipMapa || "Por validar con viveros";
      $("#ratePack").value = pub.tarifarioSugerido.packCompleto || "Por validar con viveros";
    }

    ["rateWeekly", "rateMonthly", "rateMap", "ratePack"].forEach(id => {
      $(`#${id}`).addEventListener("input", updateSalesPitch);
    });

    populateAdViverosSelect();

    $("#btnCopyPitch").addEventListener("click", () => {
      navigator.clipboard.writeText($("#salesPitchText").value);
      showToast("Mensaje comercial copiado al portapapeles.");
    });

    $("#btnSendPitchWa").addEventListener("click", () => {
      const text = encodeURIComponent($("#salesPitchText").value);
      window.open(`https://wa.me/?text=${text}`, "_blank");
    });

    updatePreview();
    updateSalesPitch();
  }

  function updateSalesPitch() {
    const weekly = $("#rateWeekly").value;
    const monthly = $("#rateMonthly").value;
    const mapPlan = $("#rateMap").value;
    const pack = $("#ratePack").value;

    const pitch = `Hola, te saluda ${state.nombre}. Estamos armando un catálogo digital de viveros y plantas en Lima para facilitar que las personas encuentren especies, tamaños, zonas y disponibilidad.

Estamos invitando a viveros a participar en una prueba inicial. La ficha puede incluir especialidades, productos y fotos autorizadas; las consultas se coordinan por WhatsApp y cada vivero confirma su stock y condiciones.

Todavía estamos validando el servicio y no prometemos ventas ni un volumen de visitas. Si te interesa conocer el piloto y conversar sobre una posible promoción (${weekly}; perfil mensual: ${monthly}; ubicación: ${mapPlan}; paquete: ${pack}), ¿te puedo enviar los detalles?`;

    $("#salesPitchText").value = pitch;
  }

  function savePublicidadState() {
    const selectedVivero = state.viveros.find(v => v.id === $("#adViveroSelect").value) || {};
    state.publicidad = {
      activo: $("#adActive").checked,
      viveroDestacado: {
        id: selectedVivero.id || "vivero-destacado",
        nombre: selectedVivero.nombre || "Vivero Destacado",
        badge: $("#adBadge").value,
        slogan: $("#adSlogan").value,
        descripcion: $("#adDesc").value,
        imagen: $("#adImageUrl").value || selectedVivero.imagen || "assets/vivero_destacado.jpg",
        videoUrl: $("#adVideoUrl").value,
        zona: selectedVivero.zona || "Lima",
        direccion: selectedVivero.direccion || "",
        whatsapp: $("#adWhatsApp").value || selectedVivero.whatsapp || state.whatsappOperador,
        lat: selectedVivero.lat || -12.2749,
        lng: selectedVivero.lng || -76.8719,
        botonTexto: $("#adBtnText").value
      },
      banners: state.publicidad?.banners || [],
      tarifarioSugerido: {
        portadaSemanal: $("#rateWeekly").value,
        portadaMensual: $("#rateMonthly").value,
        pinVipMapa: $("#rateMap").value,
        packCompleto: $("#ratePack").value
      }
    };
  }

  // -------------------------------------------------------------
  // TAB 2: VIVEROS Y PRODUCTORES
  // -------------------------------------------------------------
  function renderViverosTable() {
    const tbody = $("#viverosTableBody");
    $("#viverosCount").textContent = state.viveros.length;

    tbody.innerHTML = state.viveros.map((v, index) => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:0.7rem;">
            ${v.imagen ? `<img class="thumb-preview" src="${v.imagen}" alt="${v.nombre}" />` : `<div class="thumb-preview" style="display:grid;place-items:center;font-size:1.5rem;">${v.logo || "🌱"}</div>`}
            <div>
              <strong>${v.nombre}</strong><br />
              <small style="color:#5f7069;">Contacto: ${v.productor || "No especificado"}</small>
            </div>
          </div>
        </td>
        <td>${v.zona}</td>
        <td>${v.especialidad || "—"}</td>
        <td><a href="https://wa.me/${v.whatsapp}" target="_blank" style="color:#15803d;font-weight:700;text-decoration:none;">📲 ${v.whatsapp}</a></td>
        <td><span class="item-badge ${v.esVip ? "vip" : ""}">${v.esVip ? "VIP Patrocinado ⭐" : "Asociado"}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-secondary btn-mini" onclick="editVivero(${index})">Editar</button>
            <button class="btn btn-danger btn-mini" onclick="deleteVivero(${index})">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join("");

    populateAdViverosSelect();
  }

  function initViverosTab() {
    handleFileInput($("#viveroImageFile"), $("#viveroImageUrl"));

    $("#formVivero").addEventListener("submit", e => {
      e.preventDefault();
      const editId = $("#viveroEditId").value;
      const existente = state.viveros.find(v => v.id === editId) || {};
      const nuevoVivero = {
        ...existente,
        id: editId || `vivero-${Date.now().toString().slice(-5)}`,
        nombre: $("#viveroNombre").value.trim(),
        productor: $("#viveroProductor").value.trim(),
        zona: $("#viveroZona").value,
        direccion: $("#viveroDireccion").value.trim(),
        whatsapp: $("#viveroWhatsApp").value.trim().replace(/[^0-9]/g, ""),
        especialidad: $("#viveroEspecialidad").value.trim(),
        logo: $("#viveroIcono").value.trim() || "🌿",
        esVip: $("#viveroEsVip").checked,
        badge: $("#viveroEsVip").checked ? "Vivero Verificado VIP ⭐" : "Productor Asociado",
        imagen: $("#viveroImageUrl").value.trim(),
        lat: parseFloat($("#viveroLat").value) || -12.2749,
        lng: parseFloat($("#viveroLng").value) || -76.8719,
        descripcion: $("#viveroDescripcion").value.trim() || `Especialistas en ${$("#viveroEspecialidad").value || "plantas al por mayor"} con recojo en ${$("#viveroZona").value}.`
      };

      if (editId) {
        const index = state.viveros.findIndex(v => v.id === editId);
        if (index !== -1) state.viveros[index] = nuevoVivero;
        showToast("Vivero actualizado.");
      } else {
        state.viveros.push(nuevoVivero);
        showToast("Nuevo vivero añadido.");
      }

      resetViveroForm();
      saveToLocal();
      renderViverosTable();
    });

    $("#btnCancelEditVivero").addEventListener("click", resetViveroForm);
  }

  window.editVivero = index => {
    const v = state.viveros[index];
    if (!v) return;
    $("#viveroEditId").value = v.id;
    $("#viveroNombre").value = v.nombre;
    $("#viveroProductor").value = v.productor || "";
    $("#viveroZona").value = v.zona || "Lurín";
    $("#viveroDireccion").value = v.direccion || "";
    $("#viveroWhatsApp").value = v.whatsapp || "";
    $("#viveroEspecialidad").value = v.especialidad || "";
    $("#viveroIcono").value = v.logo || "🌿";
    $("#viveroEsVip").checked = !!v.esVip;
    $("#viveroImageUrl").value = v.imagen || "";
    $("#viveroDescripcion").value = v.descripcion || "";
    $("#viveroLat").value = v.lat || -12.2749;
    $("#viveroLng").value = v.lng || -76.8719;

    if (adminMap && adminMarker) {
      adminMarker.setLatLng([v.lat || -12.2749, v.lng || -76.8719]);
      adminMap.setView([v.lat || -12.2749, v.lng || -76.8719], 12);
    }

    $("#viveroFormTitle").textContent = `Editar Vivero: ${v.nombre}`;
    $("#btnSaveVivero").textContent = "Actualizar Vivero";
    $("#btnCancelEditVivero").style.display = "inline-block";
    $("#formVivero").scrollIntoView({ behavior: "smooth" });
  };

  window.deleteVivero = index => {
    const v = state.viveros[index];
    if (!v) return;
    if (confirm(`¿Estás seguro de eliminar "${v.nombre}"? También se removerán sus plantas asociadas del catálogo.`)) {
      const vId = v.id;
      state.viveros.splice(index, 1);
      // Eliminar también las plantas asociadas a este vivero
      state.productos = state.productos.filter(p => p.viveroId !== vId);
      // Si era el vivero destacado de publicidad, reasignar
      if (state.publicidad?.viveroDestacado?.id === vId) {
        if (state.viveros.length > 0) {
          state.publicidad.viveroDestacado.id = state.viveros[0].id;
          state.publicidad.viveroDestacado.nombre = state.viveros[0].nombre;
          state.publicidad.viveroDestacado.zona = state.viveros[0].zona;
          state.publicidad.viveroDestacado.whatsapp = state.viveros[0].whatsapp || state.whatsappOperador;
        } else {
          state.publicidad.activo = false;
        }
      }
      saveToLocal();
      renderViverosTable();
      renderProductosTable();
      showToast("Vivero y sus plantas eliminados del catálogo.");
    }
  };

  function resetViveroForm() {
    $("#viveroEditId").value = "";
    $("#formVivero").reset();
    $("#viveroFormTitle").textContent = "Añadir Nuevo Productor / Vivero";
    $("#btnSaveVivero").textContent = "Guardar Productor / Vivero";
    $("#btnCancelEditVivero").style.display = "none";
  }

  // -------------------------------------------------------------
  // TAB 3: CATÁLOGO DE PRODUCTOS
  // -------------------------------------------------------------
  function renderProductosTable(filterText = "") {
    const tbody = $("#productosTableBody");
    const filtered = state.productos.filter(p => {
      const query = filterText.toLowerCase();
      return (
        p.nombre.toLowerCase().includes(query) ||
        p.categoria.toLowerCase().includes(query) ||
        (p.zona && p.zona.toLowerCase().includes(query))
      );
    });

    $("#productosCount").textContent = state.productos.length;

    tbody.innerHTML = filtered.map((p, index) => {
      const realIndex = state.productos.findIndex(item => item.id === p.id);
      const v = state.viveros.find(viv => viv.id === p.viveroId) || {};
      return `
        <tr>
          <td>
            ${p.imagen ? `<img class="thumb-preview" src="${p.imagen}" alt="${p.nombre}" />` : `<div class="thumb-preview" style="display:grid;place-items:center;font-size:1.5rem;">${p.icono || "🌿"}</div>`}
          </td>
          <td>
            <strong>${p.nombre}</strong>
            ${p.esDestacado ? `<span class="item-badge vip" style="margin-left:0.3rem;">Destacado ⭐</span>` : ""}
            <br />
            <small style="color:#5f7069;">${p.tamano || "Tamaño estándar"}</small>
          </td>
          <td><span class="item-badge">${p.categoria}</span></td>
          <td>
            <strong>${v.nombre || "Vivero Independiente"}</strong><br />
            <small style="color:#5f7069;">${p.zona || v.zona || "Lima"}</small>
          </td>
          <td><strong>${p.precio}</strong></td>
          <td>${p.minimo || "Sin mínimo"}</td>
          <td><span class="item-badge" style="background:#dcfce7;color:#166534;">${p.cantidad}</span></td>
          <td>
            <div class="action-btns">
              <button class="btn btn-secondary btn-mini" onclick="editProducto(${realIndex})">Editar</button>
              <button class="btn btn-danger btn-mini" onclick="deleteProducto(${realIndex})">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  function initProductosTab() {
    handleFileInput($("#prodImageFile"), $("#prodImageUrl"));

    $("#searchAdminProd").addEventListener("input", e => {
      renderProductosTable(e.target.value);
    });

    $("#formProducto").addEventListener("submit", e => {
      e.preventDefault();
      const editId = $("#productoEditId").value;
      const vId = $("#prodViveroSelect").value;
      const vObj = state.viveros.find(v => v.id === vId) || {};
      const existente = state.productos.find(p => p.id === editId) || {};
      const priceNumValue = $("#prodPrecioNum").value.trim();

      const nuevoProd = {
        ...existente,
        id: editId || `prod-${Date.now().toString().slice(-6)}`,
        nombre: $("#prodNombre").value.trim(),
        categoria: $("#prodCategoria").value,
        viveroId: vId,
        zona: $("#prodZona").value.trim() || vObj.zona || "Lurín",
        tamano: $("#prodTamano").value.trim() || "Estándar",
        precio: $("#prodPrecio").value.trim() || "Cotizar",
        minimo: $("#prodMinimo").value.trim() || "Mín. 1 unidad",
        cantidad: $("#prodStock").value.trim() || "Consultar disponibilidad",
        direccionRecojo: $("#prodRecojo").value.trim() || vObj.direccion || "",
        estadoPlanta: $("#prodEstado").value.trim(),
        fechaFoto: $("#prodFechaFoto").value.trim(),
        precioNum: priceNumValue ? Number(priceNumValue) : (existente.precioNum || 0),
        icono: $("#prodIcono").value.trim() || "🌿",
        imagen: $("#prodImageUrl").value.trim(),
        videoUrl: $("#prodVideoUrl").value.trim(),
        esDestacado: $("#prodEsDestacado").checked,
        tono1: existente.tono1 || "#4b8a55",
        tono2: existente.tono2 || "#bfd6a9",
        descripcion: $("#prodDesc").value.trim() || `${$("#prodNombre").value} listo para venta mayorista.`
      };

      if (editId) {
        const index = state.productos.findIndex(p => p.id === editId);
        if (index !== -1) state.productos[index] = nuevoProd;
        showToast("Producto actualizado en el catálogo.");
      } else {
        state.productos.unshift(nuevoProd);
        showToast("Nueva planta agregada al catálogo.");
      }

      resetProductoForm();
      saveToLocal();
      renderProductosTable();
    });

    $("#btnCancelEditProducto").addEventListener("click", resetProductoForm);
  }

  window.editProducto = index => {
    const p = state.productos[index];
    if (!p) return;
    $("#productoEditId").value = p.id;
    $("#prodNombre").value = p.nombre;
    $("#prodCategoria").value = p.categoria;
    $("#prodViveroSelect").value = p.viveroId || state.viveros[0]?.id || "";
    $("#prodZona").value = p.zona || "";
    $("#prodTamano").value = p.tamano || "";
    $("#prodPrecio").value = p.precio || "";
    $("#prodPrecioNum").value = p.precioNum || "";
    $("#prodMinimo").value = p.minimo || "";
    $("#prodStock").value = p.cantidad || "Disponible";
    $("#prodRecojo").value = p.direccionRecojo || "";
    $("#prodEstado").value = p.estadoPlanta || "";
    $("#prodFechaFoto").value = p.fechaFoto || "";
    $("#prodIcono").value = p.icono || "🌿";
    $("#prodImageUrl").value = p.imagen || "";
    $("#prodVideoUrl").value = p.videoUrl || "";
    $("#prodEsDestacado").checked = !!p.esDestacado;
    $("#prodDesc").value = p.descripcion || "";

    $("#productoFormTitle").textContent = `Editar Planta: ${p.nombre}`;
    $("#btnSaveProducto").textContent = "Actualizar Producto";
    $("#btnCancelEditProducto").style.display = "inline-block";
    $("#formProducto").scrollIntoView({ behavior: "smooth" });
  };

  window.deleteProducto = index => {
    const p = state.productos[index];
    if (!p) return;
    if (confirm(`¿Eliminar "${p.nombre}" del catálogo?`)) {
      state.productos.splice(index, 1);
      saveToLocal();
      renderProductosTable();
      showToast("Producto eliminado del catálogo.");
    }
  };

  function resetProductoForm() {
    $("#productoEditId").value = "";
    $("#formProducto").reset();
    $("#prodStock").value = "";
    $("#productoFormTitle").textContent = "Añadir Planta o Insumo al Catálogo";
    $("#btnSaveProducto").textContent = "Guardar Producto en el Catálogo";
    $("#btnCancelEditProducto").style.display = "none";
  }

  // -------------------------------------------------------------
  // TAB 4: CONFIGURACIÓN
  // -------------------------------------------------------------
  function initConfigTab() {
    $("#confNombre").value = state.nombre;
    $("#confWa").value = state.whatsappOperador;
    $("#confFecha").value = state.fechaActualizacion;
    if ($("#confGmapsKey")) $("#confGmapsKey").value = state.googleMapsApiKey || "";

    $("#btnResetDefaults").addEventListener("click", () => {
      if (confirm("¿Seguro que deseas restaurar los datos iniciales? Se sobrescribirán los cambios no exportados.")) {
        localStorage.removeItem(STORAGE_KEY);
        state = JSON.parse(JSON.stringify(window.RED_VIVERO_CONFIG));
        saveToLocal();
        initBrand();
        renderViverosTable();
        renderProductosTable();
      }
    });
  }

  // -------------------------------------------------------------
  // GUARDADO GLOBAL
  // -------------------------------------------------------------
  function initGlobalActions() {
    $("#btnSaveLocal").addEventListener("click", () => {
      savePublicidadState();
      state.nombre = $("#confNombre").value.trim() || state.nombre;
      state.whatsappOperador = $("#confWa").value.trim().replace(/[^0-9]/g, "") || state.whatsappOperador;
      state.fechaActualizacion = $("#confFecha").value.trim() || state.fechaActualizacion;
      if ($("#confGmapsKey")) state.googleMapsApiKey = $("#confGmapsKey").value.trim();
      saveToLocal();
    });

    $("#btnExportDataJs").addEventListener("click", () => {
      savePublicidadState();
      state.nombre = $("#confNombre").value.trim() || state.nombre;
      state.whatsappOperador = $("#confWa").value.trim().replace(/[^0-9]/g, "") || state.whatsappOperador;
      state.fechaActualizacion = $("#confFecha").value.trim() || state.fechaActualizacion;
      if ($("#confGmapsKey")) state.googleMapsApiKey = $("#confGmapsKey").value.trim();

      saveToLocal();
      exportDataJs();
    });

    // Guardado con atajo de teclado Ctrl+S
    window.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        $("#btnSaveLocal").click();
      }
    });
  }

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // INICIALIZACIÓN
  // -------------------------------------------------------------
  function initializeAdmin() {
    if (adminInitialized) return;
    adminInitialized = true;
    $("#adminSidebar").hidden = false;
    $("#adminMain").hidden = false;
    $("#cloudLoginScreen").hidden = true;
    initTabs();
    initAdminMap();
    initPublicidadTab();
    initViverosTab();
    initProductosTab();
    initConfigTab();
    initGlobalActions();
    renderViverosTable();
    renderProductosTable();
  }

  async function openAdmin(session) {
    if (session?.user?.app_metadata?.role !== "catalog_admin") {
      throw new Error("Esta cuenta no tiene permisos de administrador del catálogo.");
    }

    const remoteCatalog = await window.ViveroCloud.loadCatalog();
    if (remoteCatalog) {
      state = remoteCatalog;
    } else {
      state = JSON.parse(JSON.stringify(window.RED_VIVERO_CONFIG));
      await window.ViveroCloud.saveCatalog(state);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $("#adminUserStatus").textContent = session.user.email;
    initializeAdmin();
  }

  function showLoginError(message) {
    $("#cloudLoginError").textContent = message;
  }

  $("#cloudLoginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const submit = $("#cloudLoginSubmit");
    submit.disabled = true;
    submit.textContent = "Conectando…";
    showLoginError("");

    try {
      if (!window.ViveroCloud.isConfigured()) {
        throw new Error("Falta configurar Supabase. Sigue los pasos de configuración del proyecto.");
      }

      await window.ViveroCloud.signIn($("#cloudLoginEmail").value.trim(), $("#cloudLoginPassword").value);
      await openAdmin(window.ViveroCloud.getSession());
    } catch (error) {
      window.ViveroCloud.signOut();
      showLoginError(error.message);
    } finally {
      submit.disabled = false;
      submit.textContent = "Iniciar sesión";
    }
  });

  $("#btnLogout").addEventListener("click", () => {
    window.ViveroCloud.signOut();
    window.location.reload();
  });

  if (!window.ViveroCloud.isConfigured()) {
    showLoginError("Este panel aún requiere la configuración pública del proyecto Supabase.");
  } else {
    const session = window.ViveroCloud.getSession();
    if (session) {
      openAdmin(session).catch(error => {
        window.ViveroCloud.signOut();
        showLoginError(error.message);
      });
    }
  }
})();
