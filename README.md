# Vivero Contreras — catálogo de plantas y viveros aliados

El sitio presenta primero el catálogo y la información de Vivero Contreras. La estructura también permite incorporar viveros aliados y sus productos. Todas las consultas del sitio llegan al WhatsApp definido en `whatsappOperador`; la disponibilidad, los precios y las entregas deben confirmarse antes de cerrar cada pedido.

## Configuración inicial

1. Abre `data.js`.
2. Cambia `nombre` si quieres usar otro nombre.
3. Configura `whatsappOperador` con tu WhatsApp Business: código `51` + tu número, sin `+`, espacios o guiones.
4. `viveroPrincipalId` identifica el vivero que aparece primero. Actualiza su perfil y los productos en `viveros` y `productos`.
5. Cambia `fechaActualizacion` y publica solo disponibilidad que hayas confirmado. Retira los productos que ya no estén disponibles.
6. Abre `index.html` para probar el catálogo y verifica que las consultas de producto, vivero y solicitud abran tu WhatsApp.

El panel experimental de administración no se publica: es local al navegador, no sincroniza los cambios con GitHub y su clave no es una protección real. Para añadir un vivero aliado, agrega su ficha a `viveros` y vincula sus productos mediante `viveroId` en `data.js`.

## Sitio publicado

El proyecto se publica con GitHub Pages en `https://brunoplusx4.github.io/red-vivero-lima/`.

Para actualizar el catálogo, edita `data.js`, confirma precios y stock, actualiza `fechaActualizacion` y publica los cambios en la rama `main`. Las consultas de la web se dirigen al WhatsApp indicado en `whatsappOperador`.

```powershell
git add index.html styles.css app.js data.js README.md assets
git commit -m "Publicar catálogo de Vivero Contreras"
git push origin main
```

Después de subirlos, espera la publicación de GitHub Pages y prueba el enlace desde un celular.

## Configurar WhatsApp Business (30 minutos)

Usa un número exclusivo si es posible. No conectes automatizaciones ni envíes mensajes masivos.

1. Instala **WhatsApp Business** desde la tienda oficial.
2. Registra el número que pondrás en `data.js`.
3. Perfil de empresa:
   - Nombre: `Vivero Contreras`
   - Categoría: `Servicio empresarial` o `Compras y ventas`
   - Descripción: `Vivero de plantas ornamentales en Lurín. Consulta disponibilidad, tamaños, precios y opciones de recojo por WhatsApp.`
4. Configura mensaje de bienvenida:

   ```text
   Hola, gracias por escribir a Vivero Contreras.
   Para ayudarte, indícanos: planta, cantidad, tamaño y distrito.
   Confirmaremos disponibilidad, precio y opciones de recojo o entrega.
   ```

5. Configura respuestas rápidas:

   ```text
   /solicitud
   Indica: planta, cantidad, tamaño, fecha requerida y distrito para recojo/entrega.

   /stock
   Te compartimos disponibilidad referencial. Antes de separar, confirma directamente con el productor.

   /reglas
   Confirma disponibilidad, precio y condiciones de recojo o entrega antes de separar o pagar tu pedido.

   /productor
   Para sumar un vivero necesitamos: nombre, zona, contacto autorizado, especialidad, fotos reales y productos disponibles.
   ```

6. Crea etiquetas de seguimiento según tu operación, por ejemplo: `Cliente nuevo`, `Solicitud nueva`, `En seguimiento`, `Pedido coordinado`, `Cerrada`.

7. Envía el enlace del sitio solo a personas que acepten recibirlo. No copies el mismo mensaje a grupos ni contactos no interesados.

## Para añadir fotos

El proyecto incluye imágenes en `assets/`. Usa solo fotos propias o autorizadas; guarda las nuevas imágenes allí y actualiza la propiedad `imagen` del vivero o producto correspondiente en `data.js`. Comprime las fotos para que el catálogo cargue rápido.

## Regla de seguridad y confianza

- Nunca recibas pagos de separación durante el piloto: comprador paga directo al productor.
- Nunca publiques dirección privada ni teléfono de un productor sin permiso.
- No prometas inventario; escribe siempre `Stock sujeto a confirmación`.
- No agregues un proveedor solo porque envió un mensaje: usa referencias o una validación presencial.
- No te responsabilices por transporte, estado de la planta o entregas hasta que exista un acuerdo formal separado.

## Para añadir fotos reales después

Comprueba que la foto corresponde al producto anunciado y que tienes autorización para publicarla.
