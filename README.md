# Alto Cauce Reservas

Sistema comercial de reservas para negocios de cabañas. La demo está pensada para vender rápido: primero se prueba como huésped, después se muestra el panel del dueño.

Producto base: **cabañas**.  
Módulo opcional: **salón de eventos**.

## Qué resuelve

- Consultas de WhatsApp incompletas o desordenadas.
- Fechas que se pisan entre mensajes, llamadas y reservas manuales.
- Anticipos y saldos sin seguimiento claro.
- Dueños que necesitan operar desde el celular sin depender de planillas.
- Falta de una demo simple para cerrar clientes de alojamientos.

## Rutas principales

| Ruta | Uso |
| --- | --- |
| `/` | Landing comercial del producto |
| `/cabanas` | Flujo de reserva para huésped |
| `/admin` | Panel del dueño / recepción |
| `/admin/reservas` | Gestión de reservas de cabañas |
| `/admin/reservas/nueva` | Crear reserva manual |
| `/admin/disponibilidad` | Bloquear fechas |
| `/salon` | Módulo opcional de cotización de eventos |

## Recorrido recomendado para vender

1. Abrir la home y explicar el problema: reservas perdidas por WhatsApp.
2. Entrar a `/cabanas` y hacer una consulta como huésped.
3. Entrar a `/admin` y mostrar cómo queda guardada.
4. Abrir `/admin/reservas`, cambiar estado y contactar por WhatsApp.
5. Mostrar que salón existe solo como módulo adicional.

## Instalación local

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Supabase

Ejecutar las migraciones en este orden:

```sql
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_integrated_operations.sql
```

La segunda migración agrega la operación real: estados extendidos, pagos, notas, configuración de salón, vista admin enriquecida y reglas de disponibilidad donde solo las reservas firmes bloquean calendario.

## Variables necesarias

Ver `.env.local.example`.

Mínimas para demo:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=demo@cabanas.cl
WHATSAPP_ADMIN_NUMBER=+56957845292
NEXT_PUBLIC_BASE_URL=https://cabanas-theta.vercel.app
```

Opcionales:

- Mercado Pago para pago online.
- Resend para emails transaccionales.
- Anthropic para recomendaciones operativas avanzadas.

## Deploy

El proyecto está preparado para Vercel.

```bash
npm run build
```

Si el repo está conectado a Vercel, cada push a `main` debería generar nuevo deploy automático.

## Nota comercial

No venderlo como “una página web”. Venderlo como:

> Sistema de reservas para cabañas que ordena WhatsApp, disponibilidad, pagos y seguimiento desde un panel simple.

