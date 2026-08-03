#!/usr/bin/env node
/* ============================================================================
   SunSof Games — generador del sitio legal.

       node tools/build-legal.mjs

   Lee content/games.json + content/clauses.mjs y ESCRIBE HTML ESTÁTICO:

       index.html                        hub del estudio (5 idiomas)
       privacy-policy.html               ÚNICA política, cubre TODOS los juegos
       terms-conditions.html             ÚNICOS términos, cubren TODOS los juegos

   Una sola política para todo el catálogo, no una por juego: Play Console acepta
   perfectamente una URL de política compartida entre varias apps del mismo
   desarrollador, y mantener N copias del mismo texto (con pequeñas variaciones de
   capabilities) era puro costo de mantenimiento sin beneficio legal real.

   ¿Por qué generar estático en vez de renderizar con JS en el navegador?
   Porque un revisor de Play, un crawler o un usuario con JS bloqueado tiene que
   VER el texto legal. Un documento legal que depende de JavaScript para existir
   es un documento legal que puede aparecer vacío justo cuando importa. El DRY
   vive en las fuentes (content/), no en el runtime.

   Todo el HTML de salida está marcado como generado: no se edita a mano.
   ========================================================================== */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  privacySections,
  termsSections,
  privacyIntro,
  termsIntro,
  contactsHtml,
} from "../content/clauses.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const registry = JSON.parse(await readFile(join(ROOT, "content/games.json"), "utf8"));
const { studio, games } = registry;

const GENERATED_BY = "tools/build-legal.mjs";

/* --------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------ */

/** Escapa texto para atributos y títulos. */
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** El nombre del juego con `&` escapado para usarlo dentro del cuerpo del HTML. */
const nameHtml = (s) => String(s).replace(/&(?!amp;|lt;|gt;|#)/g, "&amp;");

/** Prefijo relativo hasta la raíz del sitio según la profundidad de la página. */
const upTo = (depth) => (depth === 0 ? "" : "../".repeat(depth));

/**
 * Reindenta un bloque de HTML de las cláusulas a `pad` espacios y descarta las
 * líneas vacías. Sin el descarte, cada condicional apagado (por ejemplo el
 * bloque de Play Games en un juego sin leaderboards) dejaría una línea en
 * blanco en el archivo publicado — inocuo para el navegador, pero convierte el
 * diff de una regeneración en ruido.
 */
const indentBlock = (html, pad) =>
  html
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => " ".repeat(pad) + l)
    .join("\n");

/** rgba() a partir del hex de acento, para el glow suave. */
function accentSoft(hex, alpha = 0.18) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Une nombres en prosa: "A, B and C". */
function prose(list) {
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

/* --------------------------------------------------------------------------
   Shell común de los documentos legales
   ------------------------------------------------------------------------ */
function renderDoc({
  depth,
  title,
  metaDescription,
  docKind, // "privacy" | "terms"
  heading,
  subtitle,
  appIdChip,
  accent,
  iconFile,
  effectiveDate,
  intro,
  sections,
  privacyHref,
  termsHref,
  hubHref,
}) {
  const up = upTo(depth);
  const toc = sections
    .map((sec) => `          <li><a href="#${sec.id}">${sec.title}</a></li>`)
    .join("\n");

  const body = sections
    .map(
      (sec) => `        <section id="${sec.id}">
          <h2>${sec.title}</h2>
${indentBlock(sec.html, 10)}
        </section>`
    )
    .join("\n\n");

  const mark = iconFile
    ? `<div class="brand-mark"><img src="${up}assets/icons/${iconFile}" alt="" width="60" height="60" /></div>`
    : `<div class="brand-mark">S</div>`;

  return `<!doctype html>
<!-- GENERADO por ${GENERATED_BY} — no editar a mano.
     El texto vive en content/clauses.mjs y los datos en content/games.json. -->
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(metaDescription)}" />
    <meta name="robots" content="index, follow" />
    <link rel="icon" href="${up}assets/icons/${iconFile || "blocky-sync-fit.png"}" />
    <link rel="stylesheet" href="${up}assets/legal.css" />
    <style>
      :root { --accent: ${accent}; --accent-soft: ${accentSoft(accent)}; }
    </style>
  </head>
  <body id="top">
    <div class="wrap">
      <header class="hero">
        ${mark}
        <span class="eyebrow">${nameHtml(studio.name)}</span>
        <h1>${heading}</h1>
        <p class="subtitle">${subtitle}</p>
        ${appIdChip ? `<div><span class="app-id">${esc(appIdChip)}</span></div>` : ""}
        <nav class="doc-switch" aria-label="Legal documents">
          <a href="${hubHref}" class="inactive">🏠 ${nameHtml(studio.name)}</a>
          <a href="${privacyHref}" class="${docKind === "privacy" ? "active" : "inactive"}"${
            docKind === "privacy" ? ' aria-current="page"' : ""
          }>🔒 Privacy Policy</a>
          <a href="${termsHref}" class="${docKind === "terms" ? "active" : "inactive"}"${
            docKind === "terms" ? ' aria-current="page"' : ""
          }>📜 Terms &amp; Conditions</a>
        </nav>
      </header>

      <main class="card">
        <span class="updated-badge">✦ Effective as of ${effectiveDate}</span>

        <ul class="toc">
${toc}
        </ul>

${indentBlock(intro, 8)}

${body}
      </main>

      <footer class="site-footer">
        <div class="brand">${nameHtml(studio.name)}</div>
        <p>
          © ${studio.copyrightYear} ${nameHtml(studio.name)}. All rights reserved. ·
          <a href="${hubHref}">${nameHtml(studio.name)}</a> ·
          <a href="${privacyHref}">Privacy Policy</a> ·
          <a href="${termsHref}">Terms &amp; Conditions</a>
        </p>
        <p><a href="mailto:${studio.contact}">${studio.contact}</a></p>
      </footer>
    </div>

    <a class="back-to-top" href="#top" aria-label="Back to top">↑</a>
  </body>
</html>
`;
}

/* --------------------------------------------------------------------------
   Documentos del estudio — ÚNICA fuente de verdad legal para las tres apps.
   Antes existía también un privacy.html/terms.html por juego (games/<slug>/),
   pero mantener tres copias del mismo texto (con pequeñas variaciones de
   capabilities) resultó ser puro costo de mantenimiento: Play Console acepta
   perfectamente una sola URL de política compartida entre varias apps del
   mismo desarrollador, así que un solo documento — con la UNIÓN de las
   capabilities de todos los juegos — cubre a los tres sin duplicar nada.
   Se despliega en dos rutas idénticas (raíz del hosting y /legal/) porque la
   raíz es la URL histórica que probablemente ya está cargada en Play Console
   para Blocky; ver tools/deploy notes en README.md.
   ------------------------------------------------------------------------ */
async function buildStudioDocs() {
  const caps = {};
  for (const g of games) {
    for (const [k, v] of Object.entries(g.capabilities)) caps[k] = caps[k] || v;
  }

  // El contacto principal es el del estudio; los correos históricos siguen
  // listados porque son los que los usuarios ya vieron en versiones anteriores.
  const legacy = [...new Set(games.flatMap((g) => g.extraContacts || []))];
  const contacts = contactsHtml([studio.contact, ...legacy]);

  const names = games.map((g) => nameHtml(g.name));
  const ctx = {
    caps,
    contacts,
    studio,
    appLabel: `our apps`,
    scopeSentence: `the mobile applications ${prose(
      names.map((n) => `<strong>${n}</strong>`)
    )}, together with any related services`,
    effectiveDate: registry.games[0].effectiveDate,
    previousEffectiveDate: registry.games[0].previousEffectiveDate,
    privacyHref: "privacy-policy.html",
    termsHref: "terms-conditions.html",
  };

  const common = {
    depth: 0,
    accent: "#00f2fe",
    iconFile: null,
    effectiveDate: ctx.effectiveDate,
    appIdChip: null,
    privacyHref: "privacy-policy.html",
    termsHref: "terms-conditions.html",
    hubHref: "index.html",
  };

  await writeFile(
    join(ROOT, "privacy-policy.html"),
    renderDoc({
      ...common,
      title: `Privacy Policy — ${studio.name}`,
      metaDescription: `Privacy Policy covering all mobile games published by ${studio.name}.`,
      docKind: "privacy",
      heading: "Privacy Policy",
      subtitle: `How our apps collect, use, and protect your data.`,
      intro: privacyIntro(ctx),
      sections: privacySections(ctx),
    })
  );

  await writeFile(
    join(ROOT, "terms-conditions.html"),
    renderDoc({
      ...common,
      title: `Terms & Conditions — ${studio.name}`,
      metaDescription: `Terms and Conditions covering all mobile games published by ${studio.name}.`,
      docKind: "terms",
      heading: "Terms &amp; Conditions",
      subtitle: `The agreement governing your use of our apps.`,
      intro: termsIntro(ctx),
      sections: termsSections(ctx),
    })
  );

  return ["privacy-policy.html", "terms-conditions.html"];
}

/* --------------------------------------------------------------------------
   Hub del estudio (index.html) — multiidioma, con enlaces por juego
   ------------------------------------------------------------------------ */
const HUB_I18N = {
  es: {
    tagline: "Estudio independiente de videojuegos móviles hiper-casuales.",
    gamesLabel: "Nuestros juegos",
    soon: "Próximamente",
    legalLabel: "Documentos del estudio",
    privacyTitle: "Política de Privacidad",
    privacyDesc: "Cómo recopilamos, usamos y protegemos tus datos.",
    termsTitle: "Términos y Condiciones",
    termsDesc: "El acuerdo que rige el uso de nuestras aplicaciones.",
    rights: "Todos los derechos reservados.",
  },
  en: {
    tagline: "Independent studio crafting hyper-casual mobile games.",
    gamesLabel: "Our games",
    soon: "Coming soon",
    legalLabel: "Studio documents",
    privacyTitle: "Privacy Policy",
    privacyDesc: "How we collect, use, and protect your data.",
    termsTitle: "Terms &amp; Conditions",
    termsDesc: "The agreement governing the use of our apps.",
    rights: "All rights reserved.",
  },
  pt: {
    tagline: "Estúdio independente de jogos móveis hiper-casuais.",
    gamesLabel: "Nossos jogos",
    soon: "Em breve",
    legalLabel: "Documentos do estúdio",
    privacyTitle: "Política de Privacidade",
    privacyDesc: "Como coletamos, usamos e protegemos seus dados.",
    termsTitle: "Termos e Condições",
    termsDesc: "O acordo que rege o uso dos nossos aplicativos.",
    rights: "Todos os direitos reservados.",
  },
  fr: {
    tagline: "Studio indépendant de jeux mobiles hyper-casual.",
    gamesLabel: "Nos jeux",
    soon: "Bientôt disponible",
    legalLabel: "Documents du studio",
    privacyTitle: "Politique de Confidentialité",
    privacyDesc: "Comment nous collectons, utilisons et protégeons vos données.",
    termsTitle: "Conditions Générales",
    termsDesc: "L'accord régissant l'utilisation de nos applications.",
    rights: "Tous droits réservés.",
  },
  de: {
    tagline: "Unabhängiges Studio für Hyper-Casual-Mobile-Games.",
    gamesLabel: "Unsere Spiele",
    soon: "Demnächst",
    legalLabel: "Studio-Dokumente",
    privacyTitle: "Datenschutzrichtlinie",
    privacyDesc: "Wie wir deine Daten erheben, nutzen und schützen.",
    termsTitle: "Allgemeine Geschäftsbedingungen",
    termsDesc: "Die Vereinbarung zur Nutzung unserer Apps.",
    rights: "Alle Rechte vorbehalten.",
  },
};

async function buildHub() {
  const langs = Object.keys(HUB_I18N);

  // Las descripciones por juego se inyectan en el diccionario de cada idioma
  // desde el registro, para que agregar un juego no toque este archivo.
  const dict = {};
  for (const lang of langs) {
    dict[lang] = { ...HUB_I18N[lang] };
    for (const g of games) {
      dict[lang][`game_${g.slug}`] = g.tagline[lang] || g.tagline.en;
    }
  }

  const cards = games
    .map(
      (g) => `          <div class="game-card">
            <img class="game-icon" src="assets/icons/${g.icon}" alt="" width="48" height="48" />
            <div class="game-meta">
              <h3>${nameHtml(g.name)}</h3>
              <p data-i18n="game_${g.slug}"></p>
            </div>
            ${g.status === "soon" ? `<span class="game-soon" data-i18n="soon"></span>` : ""}
          </div>`
    )
    .join("\n");

  const html = `<!doctype html>
<!-- GENERADO por ${GENERATED_BY} — no editar a mano.
     Los juegos y sus descripciones viven en content/games.json. -->
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(studio.name)}</title>
    <meta name="description" content="${esc(studio.name)} — independent mobile game studio. Games catalog and legal documents." />
    <link rel="icon" href="assets/icons/${games[0].icon}" />
    <link rel="stylesheet" href="assets/legal.css" />
  </head>
  <body>
    <div class="lang-switch" id="langSwitch"></div>

    <div class="wrap">
      <header class="hero">
        <div class="brand-mark">S</div>
        <h1>${nameHtml(studio.name)}</h1>
        <p class="subtitle" data-i18n="tagline"></p>
      </header>

      <section class="hub-section">
        <div class="section-label" data-i18n="gamesLabel"></div>
        <div class="game-list">
${cards}
        </div>
      </section>

      <section class="hub-section">
        <div class="section-label" data-i18n="legalLabel"></div>
        <div class="legal-grid">
          <a class="legal-card privacy" href="privacy-policy.html">
            <span class="icon">🔒</span>
            <h3 data-i18n="privacyTitle"></h3>
            <p data-i18n="privacyDesc"></p>
          </a>
          <a class="legal-card terms" href="terms-conditions.html">
            <span class="icon">📜</span>
            <h3 data-i18n="termsTitle"></h3>
            <p data-i18n="termsDesc"></p>
          </a>
        </div>
      </section>

      <footer class="site-footer">
        <p>
          © ${studio.copyrightYear} ${nameHtml(studio.name)}. <span data-i18n="rights"></span> ·
          <a href="mailto:${studio.contact}">${studio.contact}</a>
        </p>
      </footer>
    </div>

    <script>
      var I18N = ${JSON.stringify(dict, null, 6).replace(/\n/g, "\n      ")};

      var SUPPORTED = ${JSON.stringify(langs)};
      var LABELS = ${JSON.stringify(
        Object.fromEntries(langs.map((l) => [l, l.toUpperCase()]))
      )};

      function detectLang() {
        var saved = localStorage.getItem("sunsof_lang");
        if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
        var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
        return SUPPORTED.indexOf(nav) !== -1 ? nav : "en";
      }

      function applyLang(lang) {
        var d = I18N[lang] || I18N.en;
        document.documentElement.setAttribute("lang", lang);
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
          var key = el.getAttribute("data-i18n");
          if (d[key] != null) el.innerHTML = d[key];
        });
        document.querySelectorAll("#langSwitch button").forEach(function (btn) {
          btn.classList.toggle("active", btn.dataset.lang === lang);
        });
        localStorage.setItem("sunsof_lang", lang);
      }

      var switchEl = document.getElementById("langSwitch");
      SUPPORTED.forEach(function (lang) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.lang = lang;
        btn.textContent = LABELS[lang];
        btn.addEventListener("click", function () { applyLang(lang); });
        switchEl.appendChild(btn);
      });

      applyLang(detectLang());
    </script>
  </body>
</html>
`;

  await writeFile(join(ROOT, "index.html"), html);
  return ["index.html"];
}

/* --------------------------------------------------------------------------
   Main
   ------------------------------------------------------------------------ */
const written = [];
written.push(...(await buildHub()));
written.push(...(await buildStudioDocs()));

console.log(`SunSof Games — sitio legal generado (${written.length} archivos):`);
for (const f of written) console.log(`  · ${f}`);
console.log(`\nJuegos en el registro: ${games.map((g) => g.name).join(", ")}`);
