# Data Safety de Play Console — respuestas por app

Este documento traduce las `capabilities` de [`content/games.json`](../content/games.json) al
formulario **Política → Contenido de la app → Seguridad de los datos** de Play Console. El
objetivo es que las tres apps declaren lo mismo que dice su política publicada: la
inconsistencia entre el formulario y la política es uno de los motivos de rechazo más comunes,
y es 100% evitable.

> **Regla:** si cambia una `capability` en `games.json`, hay que regenerar los documentos
> (`node tools/build-legal.mjs`) **y** actualizar el formulario de esa app. Van juntos, siempre.

---

## Matriz de capabilities (estado actual del código, verificado)

| Capability | Blocky: Sync & Fit | Sketch Buddy | Dual Dots |
|---|---|---|---|
| `ads` (AdMob) | ✅ IDs reales, en producción | ⚠️ código listo, IDs de prueba | ❌ no implementado (Fase 7 congelada) |
| `personalizedAds` | ❌ sin CMP | ❌ sin CMP | ❌ sin CMP |
| `iap` (Play Billing) | ✅ addon vendorizado | ⚠️ `IAPManager` en sandbox | ❌ no implementado |
| `playGames` (leaderboards) | ✅ leaderboard real `CgkI_MeG7KMIEAIQAQ` | ⚠️ `TODO(Play Console)`, sandbox | ❌ no registrado |
| `cloudSave` (Snapshots) | ✅ | ❌ | ❌ |
| `ugc` | ❌ | ❌ | ❌ |
| `account` (login propio) | ❌ | ❌ | ❌ |
| Firebase / Crashlytics | ❌ **no existe en ningún repo** | ❌ | ❌ |

Los documentos generados declaran las capabilities marcadas en `games.json`, que hoy están
puestas en el **estado de lanzamiento previsto** (Sketch Buddy y Dual Dots con anuncios y
compras). Ver [Pendientes antes de publicar](#pendientes-antes-de-publicar): si alguno sale
sin esas funciones, hay que apagar la capability y regenerar.

---

## Respuestas del formulario

### Tipos de datos — recopilados / compartidos

| Sección → tipo de dato | Blocky | Sketch Buddy | Dual Dots | Finalidad | ¿Compartido? |
|---|---|---|---|---|---|
| **ID de dispositivo u otros** → ID de publicidad | Sí | Sí | Sí | Publicidad o marketing; Análisis | **Sí** (a AdMob) |
| **Actividad en la app** → Interacciones con la app | Sí | Sí | Sí | Publicidad o marketing; Análisis | **Sí** (a AdMob) |
| **Info financiera** → Historial de compras | Sí | Sí | Sí | Funcionalidad de la app | No |
| **Info personal** → IDs de usuario | Sí (player ID de Play Games) | Sí | No | Funcionalidad de la app | No |
| **Ubicación** → Ubicación aproximada | Sí¹ | Sí¹ | Sí¹ | Publicidad o marketing | **Sí** (a AdMob) |
| **Mensajes, fotos, contactos, audio, archivos, salud, calendario** | No | No | No | — | — |
| **Registros de fallos / Diagnósticos** | No² | No² | No² | — | — |

¹ AdMob puede inferir ubicación aproximada a partir de la IP para servir y medir anuncios.
Google indica declararla cuando se usa AdMob; es lo conservador y correcto.
Si en el futuro se elimina la publicidad, esta fila pasa a "No".

² Ninguna app integra Crashlytics ni un SDK de reporte de fallos. Los fallos que recoge
**Android Vitals / Google Play** por su cuenta **no se declaran** en este formulario (Play
excluye explícitamente lo que recopila la propia plataforma). Por eso va "No", y por eso se
quitó Firebase/Crashlytics de la lista de terceros que arrastraba la política vieja de Blocky:
declaraba SDKs que no están en el proyecto.

### Para cada dato declarado

- **¿Es obligatorio?** → *La recopilación de datos es obligatoria* para el ID de publicidad,
  interacciones e ubicación aproximada (la app no funciona sin anuncios en su modelo gratuito).
  El historial de compras y los IDs de usuario → *Los usuarios pueden elegir* (compras e inicio
  de sesión en Play Games son opcionales).
- **¿Se procesa efímeramente?** → No.
- **¿Los datos están encriptados en tránsito?** → **Sí** (todo el tráfico va por SDKs de Google
  sobre HTTPS/TLS).
- **¿Ofreces una forma de solicitar la eliminación de datos?** → **Sí** →
  URL: `https://sunsof.games/privacy-policy.html#opt-out` (o el correo
  `support@sunsof.games`). La política tiene la sección `#opt-out` justamente para esto.
- **¿La app cumple la Política de Familias?** → **No** (ninguna app está dirigida a menores;
  clasificación de contenido para público general 13+).
- **¿Revisión de seguridad independiente?** → No.

### Clasificación de contenido (IARC) y público objetivo

- Público objetivo: **13 años o más**. Coincide con la cláusula de elegibilidad de los términos.
- No dirigida a niños → **no** marcar "Diseñada para familias".
- Anuncios: **Sí, la app contiene anuncios** (las tres, según el plan de lanzamiento) →
  hay que marcarlo también en la ficha de Play Store.
- Compras dentro de la app: **Sí** (las tres, según el plan).

### URL a pegar en las TRES apps

Una sola política, una sola URL — la misma en Play Console para Blocky, Sketch Buddy y Dual Dots.
Google acepta explícitamente una política compartida entre varias apps del mismo desarrollador
(no es obligatorio tener una por app); dejar de mantener tres copias casi idénticas del mismo
texto elimina el riesgo de que se desincronicen entre sí.

| Documento | URL |
|---|---|
| Política de Privacidad | `https://sunsof.games/privacy-policy.html` |
| Términos y Condiciones | `https://sunsof.games/terms-conditions.html` |

El mismo contenido se sirve también en `https://sunsof.games/legal/privacy-policy.html` (y su
equivalente de términos) — es una copia idéntica dentro del hub de documentos, no un documento
distinto. No importa cuál de las dos URLs quede cargada en Play Console: las dos dicen lo mismo
porque las dos salen del mismo `node tools/build-legal.mjs`.

---

## Pendientes antes de publicar

Ordenados por lo que bloquea una publicación:

1. **Dual Dots — decidir anuncios/compras antes del envío.** Hoy el repo **no tiene**
   `AdManager` ni `IAPManager` (Fase 7 congelada en su `ARCHITECTURE.md`), pero su política
   declara anuncios y compras porque así se definió el lanzamiento. Las dos salidas válidas:
   - Implementás la Fase 7 antes de publicar → todo queda coherente, no toques nada.
   - Publicás v1.0 sin anuncios ni compras → poné `"ads": false, "iap": false` en
     `games.json`, corré `node tools/build-legal.mjs`, y en el formulario respondé
     "No se recopilan datos". Es la declaración más limpia que puede tener una app.

2. **Sketch Buddy — IDs reales de AdMob.** `AdManager.gd` tiene `AD_UNIT_* = ""` e
   `IS_TESTING = true`, o sea unidades de prueba de Google. Publicar así no viola nada legal,
   pero no genera ingresos y el Data Safety ya declara publicidad. Pegar los ad units y poner
   `IS_TESTING = false` antes del release.

3. **Sketch Buddy — ID del leaderboard.** `SocialManager.gd` tiene
   `TODO(Play Console): ID del leaderboard`. Mientras siga en sandbox, la política declara
   Play Games sin que exista: si no llega para v1.0, poner `"playGames": false` y regenerar.

4. **Anuncios no personalizados de verdad, en las tres apps.** Los documentos afirman que la
   publicidad se sirve en modo **no personalizado**, porque ninguna app tiene un CMP (no hay
   UMP/`ConsentInformation` en el addon de AdMob ni en `AdManager.gd`). Para que la afirmación
   sea cierta hay que forzarlo en el código: `RequestConfiguration` del addon + el extra
   `npa = "1"` en cada request de anuncio. Si en cambio integrás el UMP SDK y mostrás el
   mensaje de consentimiento, poné `"personalizedAds": true` y regenerá — el texto cambia solo.
   > Ojo: para tráfico del EEE/Reino Unido, AdMob **exige** un CMP certificado desde 2024. Sin
   > CMP puede limitar el servicio de anuncios en esas regiones. Servir NPA es la posición
   > legalmente defendible mientras no haya CMP, no una optimización.

5. **`support@sunsof.games` operativo.** Los tres documentos lo publican como canal de
   privacidad, de derechos GDPR/CCPA y de reportes. Tiene que recibir correo y ser leído: los
   plazos de respuesta del GDPR (1 mes) corren desde que el usuario escribe.

6. **Blocky — actualizar la ficha si querés la URL específica.** No es obligatorio: la URL del
   estudio sigue válida y ya apunta a un documento correcto y actualizado.
