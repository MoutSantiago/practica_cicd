# Reflexión · B2 Headers básicos

Se aplican los 5 headers en **todas las rutas** (`source: "**"`) de `firebase.json`. Como el proyecto es export estático servido por Firebase Hosting, este es el lugar correcto (los `headers()` de `next.config.ts` no se emiten en `out/`).

| Header | Valor | Qué hace | Ataque que mitiga |
|---|---|---|---|
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` | Fuerza HTTPS durante 1 año en visitas futuras, también en subdominios. | **SSL stripping / downgrade MITM**: evita que un atacante en la red baje la conexión a HTTP y robe cookies o credenciales. |
| X-Content-Type-Options | `nosniff` | Prohíbe que el navegador "adivine" el tipo de archivo. | **XSS por contenido subido**: un archivo malicioso no se ejecuta como HTML/JS aunque cambie la extensión. |
| X-Frame-Options | `DENY` | Impide que el sitio se embeeba en un iframe (de ningún origen). | **Clickjacking**: evita que un sitio malicioso oculte tu página y haga clics no deseados por el usuario. |
| Referrer-Policy | `strict-origin-when-cross-origin` | Hacia otros sitios envía solo el origen, no la ruta ni parámetros. | **Filtración de datos vía Referer**: no expone URLs internas ni tokens de sesión a sitios externos. |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | Deshabilita cámara, micrófono y geolocalización. | **Espionaje sensorial / rastreo**: bloquea el acceso a sensores aunque un script malicioso lo solicite. |

## Verificación

```bash
npm run build && npm run serve
node scripts/check-headers.mjs http://localhost:5000
```

Los 5 headers aparecen presentes en `/`, `/cursos`, el 404 y los assets estáticos.
