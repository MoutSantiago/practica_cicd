# Reflexión · B2 Headers básicos

Se aplican los 5 headers en **todas las rutas** (`source: "**"`) de `firebase.json`. Como el proyecto es export estático servido por Firebase Hosting, este es el lugar correcto (los `headers()` de `next.config.ts` no se emiten en `out/`).

| Header | Valor | Qué hace | Ataque que mitiga |
|---|---|---|---|
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` | Fuerza HTTPS durante 1 año en visitas futuras, también en subdominios. | **SSL stripping / downgrade MITM**: evita que un atacante en la red baje la conexión a HTTP y robe cookies o credenciales. |
| X-Content-Type-Options | `nosniff` | Prohíbe que el navegador "adivine" el tipo de archivo. | **XSS por contenido subido**: un archivo malicioso no se ejecuta como HTML/JS aunque cambie la extensión. |
| X-Frame-Options | `DENY` | Impide que el sitio se embeeba en un iframe (de ningún origen). | **Clickjacking**: evita que un sitio malicioso oculte tu página y haga clics no deseados por el usuario. |
| Referrer-Policy | `strict-origin-when-cross-origin` | Hacia otros sitios envía solo el origen, no la ruta ni parámetros. | **Filtración de datos vía Referer**: no expone URLs internas ni tokens de sesión a sitios externos. |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | Deshabilita cámara, micrófono y geolocalización. | **Espionaje sensorial / rastreo**: bloquea el acceso a sensores aunque un script malicioso lo solicite. |
| Content-Security-Policy | `default-src 'self'; script-src 'self' + 8× sha256-...; style-src 'self'; img-src 'self' https://picsum.photos; object-src 'none'; base-uri 'self'; frame-ancestors 'none'` | Permite solo recursos del mismo origen, scripts en línea solo por hash exacto, e imágenes del mismo origen plus `picsum.photos`. | **XSS / inyección de scripts**: bloquea cualquier script en línea no autorizado por hash. **Imágenes de sitios no confiables**: restringe el origen de imágenes a `picsum.photos` (portada) y al propio sitio. |

## Content-Security-Policy: scripts en línea bloqueados (decisión de seguridad)

**Qué pasó.** La consola reportó:

> Content-Security-Policy: The page’s settings blocked an inline script (script-src-elem) from being executed because it violates the directive: “script-src 'self'”.

El valor anterior de `script-src` era `'self'`, que autoriza scripts **externos** del mismo origen pero **prohíbe cualquier script en línea** (`<script>...</script>` sin `src`). La exportación estática de Next.js (`out/`) genera 8 scripts en línea en `cursos.html`:
- el bootstrap de Turbopack (`id="_R_"`), y
- 7 bloques de datos de vuelo RSC (`self.__next_f.push([...])`).

Uno de ellos es exactamente el que nombra el error: `sha256-ilnvIjZbJyJS5w0wksE3EOXxyUTLJm0gObV+Pkk6lKE=`. Como `'self'` no los cubre, el navegador los bloquea y el filtro de cursos (componente de cliente) deja de funcionar.

**Qué decidí.** Reemplacé el comodín implícito por una lista de **hashes `sha256-` explícitos**, uno por cada script en línea, manteniendo `'self'` solo para los scripts externos del mismo origen:

```
script-src 'self' sha256-... (×8);
```

Esto es el **mínimo privilegio**: se ejecutan únicamente esos 8 cuerpos de script exactos y nada más.

**¿Por qué no otras opciones?**
- `script-src 'self' 'unsafe-inline'`: funciona siempre, pero autoriza *cualquier* script inyectado (incluido uno de XSS). Es la opción menos segura y se descarta.
- `nonce-`: en Firebase Hosting los `headers` son estáticos, por lo que el nonce sería público (cualquier atacante que lea la cabecera lo conoce y puede usarlo en un script inyectado). En contexto estático no aporta seguridad real sobre `'unsafe-inline'`, y Next.js no puede inyectar un nonce por-request en HTML ya prerenderizado.

**Costo de seguridad / operativo.** Los hashes están atados a la salida exacta de cada `next build`: comprobé que regenerar el build cambia al menos uno de los scripts en línea (el de datos de vuelo `0:`, que incluye un identificador de build no determinista), por lo que **cada despliegue obliga a recalcular los hashes y actualizar `firebase.json`**. Si no se hace, la app rompe de nuevo. Recomendación: automatizar con un script `postbuild` que extraiga los hashes de `out/*.html` y los escriba en `firebase.json` antes de desplegar. Mientras tanto, la política es segura pero frágil frente a rebuilds.

**Decisión para `img-src`.** `app/page.tsx` carga la portada de `https://picsum.photos/seed/programacion-avanzada/960/320` (visto en la pestaña Network: `scheme https`, `host picsum.photos`). Con `img-src 'self'` esa imagen quedaba bloqueada. Agregué `https://picsum.photos` como único origen externo permitido, que es el mínimo privilegio: es el único origen de imágenes externas del sitio (verificado buscando en todo `app/`). No se agregó `data:` ni `blob:` porque la app no las usa.

## Verificación

```bash
npm run build && npm run serve
node scripts/check-headers.mjs http://localhost:5000
```

Los 5 headers aparecen presentes en `/`, `/cursos`, el 404 y los assets estáticos.
