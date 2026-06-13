# Cambios aplicados a la demo

- Se cambió la presentación pública a marca genérica: Alto Cauce Reservas.
- Se eliminó la dependencia de `next/font/google` para que el build no dependa de descargar fuentes externas.
- Se agregó `lib/demo-config.ts` para centralizar marca, contacto, URL, email, imágenes y textos comerciales.
- Se ajustó la home para vender el sistema como solución para cabañas, salón de eventos o complejo mixto.
- Se agregaron planes comerciales de referencia en la landing.
- Se actualizó navegación, footer, login admin y sidebar admin con marca Alto Cauce.
- Se corrigieron textos rotos por codificación en formularios/calendario.
- Se endureció la validación admin: si `ADMIN_EMAIL` no está configurado, no se permite admin por defecto.
- Se agregó persistencia de informes IA en `operation_notes` cuando el análisis se genera desde el panel.
- Se corrigió fallback de cotización de salón para que la banquetería también compute sin base de datos activa.
- Se agregó `.eslintrc.json` y el lint queda no interactivo.
- Se agregó `.env.local.example`.
- Se ajustó `next.config.js` para build más estable en entornos con pocos recursos.

## Pruebas realizadas

- `npm run typecheck`: OK.
- `npm run lint`: OK, sin warnings ni errores.
- `npm run build`: OK con variables de entorno de prueba.
- Prueba local `/`, `/cabanas`, `/salon`, `/admin/login`, `/api/estado`: OK.
- Prueba POST `/api/reservations`: genera WhatsApp y fallback correcto cuando no hay DB.
- Prueba POST `/api/cotizacion-salon`: genera WhatsApp y calcula banquetería en fallback.
