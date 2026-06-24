# Corrección integral de textos + acceso al panel

Este paquete reemplaza los textos visibles que sonaban internos o comerciales y deja la web orientada a un dueño real de cabañas.

## Cambios principales

- Home completa reescrita con tono profesional.
- Se eliminaron frases como:
  - "Lista para enviar a un potencial cliente"
  - "Probá el flujo público..."
  - "Diferencial comercial"
  - "El dueño entiende el valor sin explicación larga"
  - "El producto se vende..."
  - "Venta guiada"
  - "Cabañas primero. Salón si hace falta."
- Página de cabañas reescrita en español neutro/chileno: "Elige", "Marca", "Envía".
- Página de salón ajustada como módulo de eventos real, sin textos internos.
- Navbar y footer sin "demo" innecesario.
- Login admin más limpio.
- Acceso al panel de prueba por cookie, para que no dependa de que exista el usuario demo en Supabase Auth.

## Cómo aplicar

Desde la raíz del repo:

```bash
unzip alto-cauce-reservas-copy-cleanup.zip
cd cabanas_copy_cleanup
./apply_cleanup.sh ..
cd ..
npm run typecheck
npm run build
git add .
git commit -m "Limpiar textos comerciales y corregir acceso al panel"
git push origin main
```

## Importante para el panel

En Vercel agregar esta variable de entorno:

```env
NEXT_PUBLIC_DEMO_ADMIN_ENABLED=true
```

Luego redeploy. En `/admin/login` aparecerá el botón:

```txt
Entrar al panel de prueba
```

Ese botón crea una cookie temporal para entrar al admin sin depender del login de Supabase. Para producción se puede apagar poniendo la variable en `false` o eliminándola.
