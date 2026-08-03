# SunSof Games — sitio legal

Documentos legales de todas las apps del estudio, servidos como sitio estático.

**Nada de HTML se edita a mano.** El hub y los dos documentos legales son *generados*: el
contenido vive en `content/` y se compila con un script sin dependencias.

```bash
node tools/build-legal.mjs      # regenera index.html, privacy-policy.html, terms-conditions.html
```

## Estructura

```
content/games.json          ← FUENTE DE VERDAD: catálogo, paquetes, colores, capabilities, fechas
content/clauses.mjs         ← el texto legal, con bloques condicionales por capability
tools/build-legal.mjs       ← generador (Node ≥18, cero dependencias)
assets/legal.css            ← una sola hoja de estilos para todo el sitio
assets/icons/<slug>.png     ← icono por juego

index.html                  ← GENERADO · hub del estudio, 5 idiomas
privacy-policy.html         ← GENERADO · ÚNICA política, cubre TODOS los juegos → URL de Play Console
terms-conditions.html       ← GENERADO · ÚNICOS términos, cubren TODOS los juegos

docs/DATA_SAFETY.md         ← cómo responder el formulario de Play Console de cada app
```

## Por qué está armado así

- **Una sola política para las tres apps, no una por juego.** Hubo una versión con
  `games/<slug>/privacy.html` y `terms.html` por app; se retiró porque Play Console acepta
  perfectamente una URL de política compartida entre varias apps del mismo desarrollador, y
  mantener N copias del mismo texto (con pequeñas variaciones de capabilities) era puro costo de
  mantenimiento sin ninguna ganancia legal — cualquier corrección tenía que aplicarse N veces y
  arriesgaba desincronizarse. Ahora hay un solo documento con la **unión** de las capabilities de
  todos los juegos.
- **Salida estática, no render en el navegador.** Un revisor de Play, un crawler o un usuario con
  JS bloqueado tiene que *ver* el texto. Un documento legal que necesita JavaScript para existir
  puede aparecer vacío justo cuando importa.
- **Capabilities en vez de un texto único.** Cada cláusula que depende de lo que ALGUNO de los
  juegos hace (anuncios, compras, leaderboards, cloud save, contenido de usuario) está detrás de
  un flag, y el documento final declara la unión — así el texto nunca miente por defecto (dice de
  más para el juego más simple, nunca de menos para el más complejo). Ver
  [`docs/DATA_SAFETY.md`](docs/DATA_SAFETY.md).
- **Se despliega en dos rutas con el mismo contenido:** `sunsof.games/privacy-policy.html` (raíz
  del hosting, la URL corta e histórica) y `sunsof.games/legal/privacy-policy.html` (dentro del
  hub). No son dos documentos — son dos copias del mismo archivo generado, así que no importa cuál
  de las dos quede cargada en Play Console.

## Agregar el juego #4

1. Copiá el icono a `assets/icons/<slug>.png` (512×512 sirve).
2. Agregá un bloque en `games` dentro de `content/games.json`:

```json
{
  "slug": "mi-juego",
  "name": "Mi Juego",
  "package": "com.sunsofgames.mijuego",
  "accent": "#37e6c4",
  "icon": "mi-juego.png",
  "status": "soon",
  "effectiveDate": "2026-08-15",
  "capabilities": {
    "ads": true, "personalizedAds": false, "iap": true,
    "playGames": false, "cloudSave": false, "ugc": false, "account": false
  },
  "tagline": { "es": "...", "en": "...", "pt": "...", "fr": "...", "de": "..." }
}
```

3. `node tools/build-legal.mjs`
4. Commit. `privacy-policy.html`/`terms-conditions.html` ya declaran las capabilities del juego
   nuevo — no hace falta ninguna URL adicional para pegar en Play Console, es la misma de siempre.

No hay paso más allá de eso: el hub, el selector de idioma y los enlaces cruzados se actualizan
solos. Este repo no incluye landings de producto por juego — solo el hub del estudio y los dos
documentos legales.

## Cambiar el texto legal

Editá `content/clauses.mjs` y regenerá. Al terminar:

- Subí la `effectiveDate` de las apps afectadas en `games.json` si el cambio es material, y
  poné la fecha anterior en `previousEffectiveDate` (el documento lo menciona solo).
- Si el cambio afecta qué datos se recopilan, actualizá también el Data Safety de esas apps.

## Publicación

El sitio es estático: cualquier host sirve. Hoy se despliega a mano por FTP/SFTP al hosting real
(`sunsof.games`, hosting compartido, no GitHub Pages) en **dos rutas**: `public_html/` (raíz —
`privacy-policy.html`/`terms-conditions.html` ahí son la URL corta e histórica) y
`public_html/legal/` (el hub completo, incluido `index.html`). Los enlaces del sitio son todos
relativos, así que funcionaría igual si algún día se sirve desde GitHub Pages en cambio.

`sunsof.games/` (la raíz) también aloja una landing de marketing separada, con su propio
`index.html` no generado por este repo — no confundir con `sunsof.games/legal/`, el hub que sí
genera `tools/build-legal.mjs`.

## AdMob (app-ads.txt)

**Ya está unificado — no requiere el mismo trabajo que los documentos legales.** El ID de
publisher de AdMob (`pub-5936611591709338`) es de la CUENTA, no de la app, así que un solo
`app-ads.txt` en la raíz del dominio (`sunsof.games/app-ads.txt`) cubre a las tres apps por
diseño del propio estándar IAB — no hay nada que generar ni duplicar. Ese archivo no vive en este
repo (es parte del hosting de la landing de marketing); si alguna vez se agrega un segundo SDK de
ads con otro publisher ID, se agrega como una línea más al mismo archivo, nunca un archivo nuevo.

## Capabilities disponibles

| Flag | Qué activa |
|---|---|
| `ads` | Secciones de publicidad (privacidad y términos), AdMob en la lista de terceros, ID de publicidad y ubicación aproximada en la recolección |
| `personalizedAds` | Con CMP: texto de consentimiento y "sharing" bajo CPRA. Sin CMP: afirma modo **no personalizado** |
| `iap` | Compras, artículos virtuales, reembolsos vía tienda, retención de registros de compra, controles parentales de compra |
| `playGames` | Leaderboards, visibilidad pública del nombre de jugador, reglas de juego limpio y sanciones |
| `cloudSave` | Sincronización de progreso en la cuenta de Google del jugador y sus límites de garantía |
| `ugc` | Sección completa de contenido de usuario, moderación y cumplimiento del DSA. Con `false` emite la cláusula "sin contenido de usuario" |
| `account` | Reservado para cuando exista login propio: hoy en `false` la política afirma que no hay credenciales |
