# SunSof Games — sitio legal

Documentos legales de todas las apps del estudio, servidos como sitio estático.

**Nada de HTML se edita a mano.** El HTML de la raíz y de `games/` es *generado*: el contenido
vive en `content/` y se compila con un script sin dependencias.

```bash
node tools/build-legal.mjs      # regenera los 9 archivos HTML
```

## Estructura

```
content/games.json        ← FUENTE DE VERDAD: catálogo, paquetes, colores, capabilities, fechas
content/clauses.mjs       ← el texto legal, con bloques condicionales por capability
tools/build-legal.mjs     ← generador (Node ≥18, cero dependencias)
assets/legal.css          ← una sola hoja de estilos para todo el sitio
assets/icons/<slug>.png   ← icono por juego

index.html                ← GENERADO · hub del estudio, 5 idiomas
privacy-policy.html       ← GENERADO · política del estudio (URL histórica de Blocky)
terms-conditions.html     ← GENERADO · términos del estudio (URL histórica de Blocky)
games/<slug>/privacy.html ← GENERADO · política por app → esta URL va en Play Console
games/<slug>/terms.html   ← GENERADO · términos por app

docs/DATA_SAFETY.md       ← cómo responder el formulario de Play Console de cada app
```

## Por qué está armado así

- **Un solo texto legal, varias apps.** Antes el texto vivía duplicado en dos HTML con el nombre
  de Blocky incrustado. Cada juego nuevo habría significado copiar ~25 KB de HTML y mantener
  copias divergentes. Ahora una corrección legal se hace en un lugar y baja a todas las apps.
- **Salida estática, no render en el navegador.** Un revisor de Play, un crawler o un usuario con
  JS bloqueado tiene que *ver* el texto. Un documento legal que necesita JavaScript para existir
  puede aparecer vacío justo cuando importa.
- **Capabilities en vez de un texto único.** Cada cláusula que depende de lo que la app
  realmente hace (anuncios, compras, leaderboards, cloud save, contenido de usuario) está
  detrás de un flag. Así una app offline no declara recolección que no ocurre, y una con
  anuncios declara todo lo que Play exige. Las capabilities deben coincidir con el formulario de
  Data Safety — ver [`docs/DATA_SAFETY.md`](docs/DATA_SAFETY.md).
- **Las URLs de la raíz no se rompen nunca.** Blocky ya está publicado apuntando a
  `/privacy-policy.html` y `/terms-conditions.html`. Siguen existiendo, cubren todo el catálogo y
  se regeneran con el resto.

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
4. Commit. Las dos URLs nuevas ya existen y quedan listas para pegar en Play Console.

No hay paso 5: el hub, el selector de idioma, los documentos del estudio y los enlaces cruzados
se actualizan solos.

## Cambiar el texto legal

Editá `content/clauses.mjs` y regenerá. Al terminar:

- Subí la `effectiveDate` de las apps afectadas en `games.json` si el cambio es material, y
  poné la fecha anterior en `previousEffectiveDate` (el documento lo menciona solo).
- Si el cambio afecta qué datos se recopilan, actualizá también el Data Safety de esas apps.

## Publicación

El sitio es estático: cualquier host sirve. Con GitHub Pages, publicar la rama `main` desde la
raíz alcanza; los enlaces son todos relativos, así que funciona igual en
`https://sunsof.games/` o en `https://usuario.github.io/legal-documents/`.

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
