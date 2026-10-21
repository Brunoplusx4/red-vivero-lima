/*
  RED VIVERO LIMA - CONFIGURACIÓN CENTRAL DE DATOS
  Puedes editar este archivo directamente o gestionarlo visualmente desde admin.html
*/
window.RED_VIVERO_CONFIG = {
  nombre: "Red de Viveros Lima",
  whatsappOperador: "51903227351",
  viveroPrincipalId: "vivero-contreras",
  googleMapsApiKey: "", // PEGA AQUÍ TU API KEY DE GOOGLE MAPS (Ejemplo: "AIzaSy...")
  fechaActualizacion: "21 de octubre de 2026 · Disponibilidad por WhatsApp",
  zonas: ["Lurín"],

  // Perfil principal del vivero propio; los demás perfiles son viveros aliados.
  publicidad: {
    activo: true,
    viveroDestacado: {
      id: "vivero-contreras",
      nombre: "Vivero Contreras",
      badge: "VIVERO PROPIO · LURÍN, LIMA",
      slogan: "Producción mayorista de bugambilias, ficus, palmeras y plantas ornamentales para obras y paisajismo.",
      descripcion: "Consulta disponibilidad, tamaños, precios por cantidad y opciones de recojo. Cada pedido se confirma directamente por WhatsApp antes de coordinar.",
      imagen: "assets/vivero_destacado.jpg",
      videoUrl: "", // Puedes pegar un enlace de YouTube o video local
      zona: "Lurín",
      direccion: "Antigua Panamericana Sur Km 35, Lurín (Valle de Lurín)",
      whatsapp: "51903227351",
      lat: -12.2749,
      lng: -76.8719,
      botonTexto: "Cotizar por WhatsApp"
    },
    banners: [
      {
        id: "banner-bugambilia",
        titulo: "Lote Especial: Bugambilias de 1 metro",
        subtitulo: "Precio mayorista desde 12 unidades · Colores fucsia, naranja y blanco",
        imagen: "assets/bugambilia.jpg",
        vivero: "Vivero Contreras",
        whatsapp: "51903227351",
        badge: "OFERTA POR TEMPORADA"
      }
    ],
    tarifarioSugerido: {
      portadaSemanal: "S/ 80",
      portadaMensual: "S/ 250",
      pinVipMapa: "S/ 50 / mes",
      packCompleto: "S/ 320 / mes (Portada + Mapa + Top Catálogo)"
    }
  },

  // Vivero propio y viveros aliados que se incorporen en el futuro.
  viveros: [
    {
      id: "vivero-contreras",
      nombre: "Vivero Contreras",
      productor: "Familia Contreras / Gilberto Contreras Velasquez",
      zona: "Lurín",
      direccion: "Antigua Panamericana Sur Km 35, Lurín",
      lat: -12.2749,
      lng: -76.8719,
      whatsapp: "51903227351",
      esVip: true,
      badge: "Vivero Verificado VIP ⭐",
      especialidad: "Bugambilias, ficus, palmeras y ornamentales",
      logo: "🌺",
      imagen: "assets/vivero_destacado.jpg",
      descripcion: "Centro productor líder con cultivo a gran escala de bugambilias en varios colores, ficus y palmeras con despacho a todo Lima y retiro en camión."
    },
    {
      id: "vivero-moscoso",
      nombre: "Vivero Moscoso",
      productor: "Familia Moscoso / sr moscoso maldonado",
      zona: "Pachacamác",
      direccion: "Antigua Panamericana Sur Km 35, Lurín",
      lat: -12.2749,
      lng: -76.8719,
      whatsapp: "51903227351",
      esVip: false,
      badge: "Vivero aliado",
      especialidad: "Bugambilias, ficus, palmeras y ornamentales",
      logo: "🌺",
      imagen: "assets/vivero_destacado.jpg",
      descripcion: "Centro productor líder con cultivo a gran escala de bugambilias en varios colores, ficus y palmeras con despacho a todo Lima y retiro en camión."
    }
  ],

  // CATÁLOGO DE PRODUCTOS MAYORISTAS
  productos: [
    {
      id: "bugambilia",
      nombre: "Bugambilia imperial",
      categoria: "Ornamentales",
      viveroId: "vivero-contreras",
      zona: "Lurín",
      direccionRecojo: "Antigua Panamericana Sur Km 35, Lurín",
      tamano: "Mediana · 80–100 cm",
      precio: "Desde S/18",
      precioNum: 18,
      minimo: "Mín. 12 unidades",
      cantidad: "85 plantas disponibles en campo",
      fechaFoto: "19 de octubre de 2026",
      estadoPlanta: "Floración activa vigorosa · Óptima sanidad vegetal en bolsa de vivero",
      icono: "🌺",
      imagen: "assets/bugambilia.jpg",
      videoUrl: "",
      esDestacado: true,
      tono1: "#d65b73",
      tono2: "#f2b8af",
      descripcion: "Planta ornamental para exterior de floración abundante. Varios colores disponibles (fucsia, naranja, blanco) para entrega en Lurín o despacho coordinado."
    },
    {
      id: "ficus",
      nombre: "Ficus benjamina",
      categoria: "Ornamentales",
      viveroId: "vivero-contreras",
      zona: "Lurín",
      direccionRecojo: "Antigua Panamericana Sur Km 35, Lurín",
      tamano: "1.2–1.5 m",
      precio: "Desde S/42",
      precioNum: 42,
      minimo: "Mín. 6 unidades",
      cantidad: "50 unidades listas para cerco",
      fechaFoto: "18 de octubre de 2026",
      estadoPlanta: "Follaje denso y verde oscuro · Excelente enraizamiento para transplante directo",
      icono: "🌿",
      imagen: "",
      videoUrl: "",
      esDestacado: true,
      tono1: "#4b8a55",
      tono2: "#bfd6a9",
      descripcion: "Ideal para cerco vivo, parques, jardines interiores y proyectos de paisajismo arquitectónico."
    },
    {
      id: "palmera",
      nombre: "Palmera areca",
      categoria: "Ornamentales",
      viveroId: "vivero-contreras",
      zona: "Lurín",
      direccionRecojo: "Antigua Panamericana Sur Km 35, Lurín",
      tamano: "1.0–1.3 m",
      precio: "Cotizar por lote",
      precioNum: 0,
      minimo: "Mín. 5 unidades",
      cantidad: "35 matas de varios tallos",
      fechaFoto: "19 de octubre de 2026",
      estadoPlanta: "Hojas abiertas sin puntas secas · Excelente porte para condominios e interiores",
      icono: "🌴",
      imagen: "",
      videoUrl: "",
      esDestacado: false,
      tono1: "#2b7860",
      tono2: "#b6dd9c",
      descripcion: "Consultar cantidad, altura exacta y condiciones de recojo por camión en Lurín."
    },
    {
      id: "tierra",
      nombre: "Tierra preparada especial",
      categoria: "Macetas e insumos",
      viveroId: "vivero-contreras",
      zona: "Lurín",
      direccionRecojo: "Antigua Panamericana Sur Km 35, Lurín",
      tamano: "Bolsa 40 L",
      precio: "Desde S/16",
      precioNum: 16,
      minimo: "Mín. 5 bolsas",
      cantidad: "100 bolsas listas para despacho",
      fechaFoto: "18 de octubre de 2026",
      estadoPlanta: "Mezcla cernida con humus, compost y cascarilla de arroz descompuesta",
      icono: "🟫",
      imagen: "",
      videoUrl: "",
      esDestacado: false,
      tono1: "#8e694c",
      tono2: "#cfad83",
      descripcion: "Sustrato premium para máxima retención de humedad y buen drenaje en todo tipo de plantas."
    }
  ]
};
