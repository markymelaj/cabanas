# Alto Cauce Reservas — versión mejorada

Sistema de reservas para cabañas con experiencia pública para huéspedes, panel operativo responsive y módulo opcional de salón de eventos.

La aplicación ahora separa dos contextos que antes estaban mezclados:

- `/`: presentación comercial de **Alto Cauce Reservas**.
- `/cabanas` y `/salon`: demo realista de **Refugios del Salto**.
- `/admin`: operación del dueño o recepción.

## Mejoras principales

- Panel administrativo usable en escritorio y celular.
- Menú móvil, navegación inferior y tablas adaptadas a tarjetas.
- Check-out tratado como fecha exclusiva: una salida puede coincidir con la próxima entrada.
- Estadía mínima, capacidad, fechas pasadas y cabañas activas validadas en servidor y base.
- Protección de concurrencia contra reservas superpuestas.
- Formularios públicos con validación Zod, honeypot, límites y rate limiting.
- Cookie demo HttpOnly creada por el servidor.
- Endpoint de diagnóstico desactivado por defecto.
- Fuentes locales del sistema: el build ya no depende de Google Fonts.
- Next.js/React actualizados, ESLint configurado y pruebas automáticas de fechas.
- Cabeceras HTTP básicas de seguridad.

## Instalación

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Variables

Completa `.env.local` a partir de `.env.local.example`.

Para una demo sin registro:

```env
NEXT_PUBLIC_DEMO_ADMIN_ENABLED=true
DEMO_ADMIN_ENABLED=true
```

En una instalación real con datos de clientes, ambas deben quedar en `false` o eliminarse.

## Base de datos

Ejecutar en Supabase SQL Editor, en orden:

```text
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_integrated_operations.sql
supabase/migrations/003_no_double_booking.sql
supabase/migrations/004_hardening_rules.sql
```

La migración `003` impide superposiciones firmes incluso con solicitudes simultáneas. La `004` agrega reglas de capacidad/estadía mínima, normalización de clientes y restricciones adicionales.

Antes de aplicar `003`, corrige reservas históricas firmes que se superpongan. PostgreSQL informará el conflicto si existe.

## Verificación

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

O todo junto:

```bash
npm run check
```

## Rutas

| Ruta | Uso |
| --- | --- |
| `/` | Landing comercial de Alto Cauce |
| `/cabanas` | Demo de reserva del huésped |
| `/salon` | Cotizador opcional de eventos |
| `/admin` | Dashboard operativo |
| `/admin/reservas` | Gestión de reservas |
| `/admin/disponibilidad` | Calendario y bloqueos |
| `/admin/configuracion` | Parámetros de cabañas y operación |

## Despliegue

El proyecto queda preparado para Vercel:

```bash
npm run build
```

Configura las variables de entorno en el proyecto y aplica las cuatro migraciones antes de usar datos reales.
