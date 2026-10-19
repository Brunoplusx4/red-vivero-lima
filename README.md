# Red Vivero Lima — MVP de red mayorista

Este proyecto es un catálogo estático y un canal de consultas para una red B2B de productores, viveros, revendedores y paisajistas. No es un marketplace: no procesa pagos, no garantiza stock y no coordina transporte.

## Antes de hacer público el sitio (15 minutos)

1. Abre `data.js`.
2. Cambia `nombre` si quieres usar otro nombre.
3. Cambia `whatsappOperador: "51999999999"` por **tu WhatsApp Business**: código `51` + tu número, sin `+`, espacios o guiones. Ejemplo: `51987654321`.
4. Cambia `fechaActualizacion` por la hora real.
5. Sustituye cada producto de ejemplo por stock confirmado de un productor. Borra lo que no tenga stock.
6. Guarda los archivos y abre `index.html` con doble clic para probar.

No publiques el sitio mientras el número de ejemplo siga puesto.

## Publicar gratis en menos de 15 minutos: GitHub Pages

1. Crea una cuenta en [GitHub](https://github.com) si no tienes una.
2. Pulsa **New repository** y nómbralo `red-vivero-lima`.
3. Déjalo como **Public** y créalo.
4. Sube `index.html`, `styles.css`, `app.js` y `data.js` usando **Add file → Upload files**. Sube también las carpetas si quieres conservar tus plantillas.
5. Ve a **Settings → Pages**.
6. En **Build and deployment**, elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`; pulsa **Save**.
7. Espera uno o dos minutos. GitHub mostrará una dirección parecida a `https://tuusuario.github.io/red-vivero-lima/`.
8. Abre esa dirección desde el celular y prueba una consulta. Debe abrir tu WhatsApp Business con un mensaje completo.

Para actualizar stock más adelante, edita `data.js` desde GitHub, haz **Commit changes** y actualiza la fecha. El enlace no cambia.

## Configurar WhatsApp Business (30 minutos)

Usa un número exclusivo si es posible. No conectes automatizaciones ni envíes mensajes masivos.

1. Instala **WhatsApp Business** desde la tienda oficial.
2. Registra el número que pondrás en `data.js`.
3. Perfil de empresa:
   - Nombre: `Red Vivero Lima | Mayorista`
   - Categoría: `Servicio empresarial` o `Compras y ventas`
   - Descripción: `Canal de consulta de disponibilidad mayorista de plantas. Stock, precio, separación y transporte se confirman directamente con cada productor.`
4. Configura mensaje de bienvenida:

   ```text
   Hola, gracias por escribir a Red Vivero Lima.
   Para buscar una planta, indícanos: especie, cantidad, tamaño, fecha y distrito.
   El stock, precio, separación y transporte se confirman directamente con el productor.
   ```

5. Configura respuestas rápidas:

   ```text
   /solicitud
   Indica: planta, cantidad, tamaño, fecha requerida y distrito para recojo/entrega.

   /stock
   Te compartimos disponibilidad referencial. Antes de separar, confirma directamente con el productor.

   /reglas
   Red Vivero Lima conecta consultas. No recibe pagos de plantas ni garantiza stock, calidad, transporte o entrega.

   /productor
   Para participar necesitamos: nombre del vivero, zona, contacto, referencias, fotos reales, stock, mínimo de compra y frecuencia de actualización.
   ```

6. Crea etiquetas: `Comprador nuevo`, `Productor`, `Solicitud nueva`, `Buscando`, `Opciones enviadas`, `Separada`, `Cerrada`, `No disponible`.

7. Envía el enlace del sitio solo a personas que acepten recibirlo. No copies el mismo mensaje a grupos ni contactos no interesados.

## Operación diaria: 20–30 minutos

1. Al comenzar el día, pregunta a cada productor inscrito qué stock quiere publicar.
2. Cambia la fecha y los productos en `data.js`; elimina los que no estén confirmados.
3. Revisa WhatsApp y registra cada consulta en `operacion/solicitudes.csv` o en una hoja de Google Sheets con las mismas columnas.
4. Consulta disponibilidad al productor; nunca confirmes por él.
5. Presenta opciones al comprador, con zona, cantidad y condición de recojo.
6. Cuando productor y comprador cierren, actualiza el estado a `Cerrada`.

## Regla de seguridad y confianza

- Nunca recibas pagos de separación durante el piloto: comprador paga directo al productor.
- Nunca publiques dirección privada ni teléfono de un productor sin permiso.
- No prometas inventario; escribe siempre `Stock sujeto a confirmación`.
- No agregues un proveedor solo porque envió un mensaje: usa referencias o una validación presencial.
- No te responsabilices por transporte, estado de la planta o entregas hasta que exista un acuerdo formal separado.

## Para añadir fotos reales después

Esta versión usa iconos para poder lanzarse hoy. Crea `assets/productos/`, guarda fotos comprimidas con nombres simples, por ejemplo `bugambilia.jpg`, y agrega una propiedad `imagen:"assets/productos/bugambilia.jpg"` a cada producto en `data.js`. Ejemplo:

```js
{ id:"bugambilia", nombre:"Bugambilia", imagen:"assets/productos/bugambilia.jpg", ... }
```

Hazlo solo cuando tengas fotos autorizadas y stock real.
