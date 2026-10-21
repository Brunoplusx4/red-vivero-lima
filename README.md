# Vivero Contreras — catálogo de plantas y viveros aliados

El sitio presenta el catálogo de Vivero Contreras y permite incorporar viveros aliados. Las consultas llegan al WhatsApp definido por `whatsappOperador`; confirma disponibilidad, precios y condiciones de entrega directamente antes de cerrar cada venta.

## Sitio publicado

El catálogo se publica con GitHub Pages en `https://brunoplusx4.github.io/red-vivero-lima/`. El panel independiente está en `https://brunoplusx4.github.io/red-vivero-lima/admin.html`.

## Activar la administración en línea

GitHub Pages aloja la web y Supabase proporciona la base de datos, autenticación y almacenamiento de imágenes. El panel no podrá iniciar sesión ni sincronizar hasta completar estos pasos:

1. Crea un proyecto en Supabase. Desactiva el registro público en Authentication y crea tu usuario administrador.
2. En **SQL Editor**, ejecuta el contenido completo de `supabase-schema.sql`.
3. Asigna el rol de administrador a tu usuario. Reemplaza el correo por el de tu cuenta y confirma que se actualizó una fila:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
       || '{"role":"catalog_admin"}'::jsonb
   where email = 'TU_CORREO';
   ```

   Cierra sesión e inicia sesión nuevamente para que Supabase emita un token con el rol actualizado.
4. En **Project Settings → API Keys**, copia la **Project URL** y la clave pública **Publishable** (o la clave pública `anon` heredada). Configúralas en `backend-config.js`:

   ```js
   window.VIVERO_BACKEND_CONFIG = {
     supabaseUrl: "TU_PROJECT_URL",
     supabaseAnonKey: "TU_CLAVE_PUBLICA"
   };
   ```

   La URL y la clave pública están diseñadas para el navegador. **Nunca** uses en el sitio una clave `Secret`, `service_role` ni una contraseña.
5. Publica los cambios del repositorio en GitHub. La primera sesión autorizada inicializa el catálogo de Supabase a partir de `data.js`.
6. Abre el panel desde el teléfono e inicia sesión. Desde el menú del navegador puedes añadirlo a la pantalla de inicio. Al guardar, los cambios se sincronizan con Supabase y la web pública vuelve a consultar el catálogo cada minuto.

Las políticas RLS del esquema permiten leer el catálogo y solo permiten cambios a usuarios con `app_metadata.role = catalog_admin`. Las imágenes admitidas son JPG, PNG, WebP o GIF, con un límite de 5 MB. El bucket sirve las imágenes públicamente para mostrarlas en el catálogo.

Si Supabase no responde, la página muestra los datos iniciales de `data.js` con un aviso de que podrían estar desactualizados. Verifica conexión y disponibilidad antes de confirmar precios o stock.

## Copia de seguridad

El botón **Descargar copia** del panel exporta una copia local `data.js`. En el flujo normal no es necesario reemplazar ese archivo ni volver a publicar GitHub Pages para cada cambio. `data.js` queda como catálogo inicial y respaldo.

## WhatsApp Business

Configura `whatsappOperador` en el catálogo con el código de país y número, sin `+`, espacios ni guiones. Todas las consultas públicas se dirigen a ese número. Usa un perfil de WhatsApp Business con el nombre y la descripción de tu vivero, y confirma pedidos y pagos directamente con el comprador.
