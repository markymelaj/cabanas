# Cabañas Puerto Varas — Sistema de Reservas

Sistema de reservas completo para cabañas y salón de eventos. Stack: **Next.js 14 + Supabase + Mercado Pago + Resend + Vercel**.

---

## Setup en 5 pasos

### 1. Clonar y instalar

```bash
git clone https://github.com/TU_USUARIO/cpvaras-web.git
cd cpvaras-web
npm install
```

### 2. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** → pegar y ejecutar `supabase/migrations/001_initial_schema.sql`
3. Ir a **Authentication → Users** → crear usuario admin (email + contraseña)
4. Copiar `Project URL` y `anon key` de **Settings → API**
5. Copiar `service_role` key de la misma página

### 3. Configurar Mercado Pago

1. Crear cuenta en [mercadopago.cl](https://mercadopago.cl) (o Argentina para pruebas)
2. Ir a **Developers → Mis aplicaciones → Crear aplicación**
3. Copiar `Access Token` (producción o sandbox para pruebas)
4. En producción, registrar webhook URL: `https://TU_DOMINIO/api/webhook-mp`

### 4. Configurar Resend (emails)

1. Crear cuenta en [resend.com](https://resend.com)
2. Verificar dominio `cabanaspuertovaras.cl` en Resend
3. Crear API Key
4. Cambiar `FROM` en `.env.local` al email del dominio verificado

### 5. Variables de entorno

Copiar `.env.local.example` a `.env.local` y completar:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

MP_ACCESS_TOKEN=APP_USR-...
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-...

RESEND_API_KEY=re_...
RESEND_FROM=reservas@cabanaspuertovaras.cl
RESEND_ADMIN_EMAIL=contacto@cabanaspuertovaras.cl

WHATSAPP_ADMIN_NUMBER=+56965880268
NEXT_PUBLIC_BASE_URL=https://cabanaspuertovaras.cl
```

---

## Deploy en Vercel

```bash
# Instalar Vercel CLI (si no tienes)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

O conectar el repo en [vercel.com](https://vercel.com) y agregar las variables de entorno en **Settings → Environment Variables**.

**Importante:** Agregar todas las variables del `.env.local.example` en Vercel antes del primer deploy.

---

## Rutas del sistema

| Ruta | Descripción |
|------|-------------|
| `/` | Home público |
| `/cabanas` | Listado de cabañas |
| `/reservar/[slug]` | Flujo de reserva con calendario y pago |
| `/confirmacion` | Página post-pago |
| `/salon` | Cotizador salón de eventos |
| `/admin` | Dashboard (requiere login) |
| `/admin/reservas` | Gestión reservas cabañas |
| `/admin/salon` | Gestión cotizaciones salón |
| `/admin/disponibilidad` | Bloqueo de fechas |
| `/admin/login` | Login administrador |
| `/api/webhook-mp` | Webhook Mercado Pago |

---

## Actualizar fotos de cabañas

Las fotos se almacenan en la columna `fotos` (array de URLs) de la tabla `cabanas`.

**Opción A:** Subir a Supabase Storage y usar las URLs.
**Opción B:** Actualizar directamente en SQL Editor:

```sql
UPDATE cabanas
SET fotos = ARRAY[
  'https://tu-bucket.supabase.co/storage/v1/object/public/cabanas/foto1.jpg',
  'https://tu-bucket.supabase.co/storage/v1/object/public/cabanas/foto2.jpg'
]
WHERE slug = 'cabana-2-4';
```

---

## Precios del salón

Editar en `lib/pricing.ts`:

```ts
export const SALON_BASE_PRICE = 800_000          // Arriendo base jornada completa
export const SALON_BANQUETERIA_PER_PAX = 12_000  // Por persona
export const ANTICIPO_PERCENT = 0.30             // 30% de anticipo para cabañas
```

---

## Tecnologías

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Auth + RLS)
- **Mercado Pago** Checkout Pro
- **Resend** (emails transaccionales)
- **Tailwind CSS** + Cormorant Garamond + DM Sans
- **Vercel** (deploy automático)

---

Desarrollado por [Luminart SpA](https://luminart.cl)
