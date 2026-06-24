#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-.}"
copy_file() {
  src="$1"
  dest="$TARGET/$1"
  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
  echo "actualizado: $dest"
}
copy_file app/page.tsx
copy_file app/layout.tsx
copy_file app/cabanas/page.tsx
copy_file app/salon/page.tsx
copy_file app/admin/login/page.tsx
copy_file components/Navbar.tsx
copy_file components/Footer.tsx
copy_file components/AdminLoginForm.tsx
copy_file components/AdminSidebar.tsx
copy_file components/AdminShell.tsx
copy_file lib/demo-config.ts
copy_file lib/admin-api.ts
copy_file middleware.ts
copy_file .env.local.example

echo "\nListo. Ejecuta: npm run typecheck && npm run build"
