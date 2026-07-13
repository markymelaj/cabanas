# Corrección de instalación en Vercel

El `package-lock.json` original fue generado en un entorno privado y contenía URLs de un registry interno inaccesible desde Vercel. Esta versión reemplaza esas URLs por `https://registry.npmjs.org/` y agrega `.npmrc` para evitar que vuelvan a quedar hosts privados en el lockfile.

## Despliegue

1. Reemplaza en GitHub el `package-lock.json` por el de esta carpeta.
2. Sube también el archivo `.npmrc`.
3. En Vercel abre el despliegue fallido y selecciona **Redeploy**.
4. Desactiva **Use existing Build Cache** / selecciona **Redeploy without cache**.

No es necesario cambiar el comando de build. Vercel puede seguir usando `npm install` y `npm run build`.
