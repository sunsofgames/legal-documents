/* ============================================================================
   SunSof Games — biblioteca de cláusulas legales.

   UN solo texto legal para todo el catálogo. Cada cláusula que depende de lo
   que la app realmente hace vive detrás de una capability (`ads`, `iap`,
   `playGames`, `cloudSave`, `ugc`, `account`), de modo que la política de un
   juego 100% offline NO declara recolección de datos que no ocurre, y la de un
   juego con anuncios y compras SÍ declara todo lo que Play exige.

   Regla de oro al editar: las capabilities de content/games.json deben coincidir
   con el formulario de Data Safety de Play Console de esa app. Si cambia una,
   cambian las dos (ver docs/DATA_SAFETY.md).
   ========================================================================== */

/** Chip monoespaciado para correos y identificadores. */
const chip = (text) => `<span class="contact-chip">${text}</span>`;

const link = (href, text) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;

/** Lista de correos de contacto ya formateada, unida con "&". */
export function contactsHtml(emails) {
  return emails.map(chip).join(" &amp; ");
}

/* --------------------------------------------------------------------------
   SDKs de terceros. Solo se listan los que la app realmente integra: declarar
   un SDK que no está (el caso del Firebase/Crashlytics que arrastraba la
   política vieja de Blocky) contradice el Data Safety y es exactamente lo que
   un revisor marca como inconsistencia.
   ------------------------------------------------------------------------ */
export function thirdParties(caps) {
  const list = [
    {
      name: "Google Play Services",
      privacy: "https://www.google.com/policies/privacy/",
      terms: "https://policies.google.com/terms",
    },
  ];
  if (caps.ads) {
    list.push({
      name: "Google AdMob",
      privacy: "https://policies.google.com/technologies/partner-sites",
      terms: "https://developers.google.com/admob/terms",
    });
  }
  if (caps.iap) {
    list.push({
      name: "Google Play Billing",
      privacy: "https://policies.google.com/privacy",
      terms: "https://play.google.com/intl/en/about/play-terms/",
    });
  }
  if (caps.playGames || caps.cloudSave) {
    list.push({
      name: "Google Play Games Services",
      privacy: "https://policies.google.com/privacy",
      terms: "https://play.google.com/games/terms/",
    });
  }
  return list;
}

const sdkListHtml = (caps, key) =>
  `<ul>${thirdParties(caps)
    .map((s) => `<li>${link(s[key], s.name)}</li>`)
    .join("\n")}</ul>`;

/* ==========================================================================
   POLÍTICA DE PRIVACIDAD
   ctx = { appLabel, appLabelStrong, isStudioDoc, caps, contacts, effectiveDate,
           studio, package }
   ========================================================================== */
export function privacySections(ctx) {
  const { caps, contacts, appLabel } = ctx;
  const s = [];

  s.push({
    id: "collection",
    title: "Information Collection and Use",
    html: `
      <p>
        The Application collects a limited set of information when you download
        and use it. Depending on the features you use, this may include:
      </p>
      <ul>
        <li>Your device's Internet Protocol (IP) address</li>
        <li>
          The screens of the Application that you open, the time and date of your
          session, and the time spent on those screens
        </li>
        <li>Your mobile operating system and device model</li>
        <li>Crash and diagnostic information reported by the operating system</li>
        ${
          caps.ads
            ? `<li>
                 Your device's advertising identifier (Google Advertising ID) and
                 coarse, non-precise location inferred from your IP address, used
                 by the advertising partner to serve and measure advertising
               </li>`
            : ""
        }
        ${
          caps.playGames
            ? `<li>
                 Your Google Play Games player ID, public player name, and the
                 scores and achievements you choose to submit
               </li>`
            : ""
        }
        ${
          caps.iap
            ? `<li>
                 A purchase token and order identifier for each in-app purchase,
                 provided by Google Play so the Application can grant what you
                 bought
               </li>`
            : ""
        }
      </ul>
      <p>
        Your game progress, settings, unlocked content, and statistics are stored
        <strong>locally on your device</strong> by default${
          caps.cloudSave
            ? ", and are additionally synchronized to your Google account if you sign in to cloud save"
            : ""
        }.
      </p>
    `,
  });

  s.push({
    id: "not-collected",
    title: "What the Application Does Not Collect",
    html: `
      <p>
        The Service Provider does not operate its own servers or user database
        for the Application. Specifically, the Application does
        <strong>not</strong> collect:
      </p>
      <ul>
        <li>Your name, postal address, or phone number</li>
        <li>Precise (GPS-level) location</li>
        <li>Your contacts, photos, microphone input, or camera input</li>
        <li>Payment card or bank details${
          caps.iap
            ? " — all payments are processed entirely by Google Play, and the Service Provider never receives your payment instrument"
            : ""
        }</li>
        <li>Health, biometric, or other special-category personal data</li>
        ${
          caps.account
            ? ""
            : "<li>A password or account credential — the Application has no sign-up or login of its own</li>"
        }
      </ul>
    `,
  });

  s.push({
    id: "purposes",
    title: "Purposes and Legal Bases for Processing",
    html: `
      <p>
        Where the EU/UK General Data Protection Regulation (GDPR) or an
        equivalent law applies, the Service Provider processes personal data on
        the following bases:
      </p>
      <ul>
        <li>
          <strong>Performance of a contract</strong> — to deliver the
          Application's core functionality, save your progress, and provide
          support${caps.iap ? ", and to deliver and restore purchases you make" : ""}
        </li>
        <li>
          <strong>Legitimate interests</strong> — to keep the Application stable
          and secure, diagnose crashes, prevent fraud and cheating, and
          understand aggregate usage in order to improve the game
        </li>
        <li>
          <strong>Consent</strong> — for personalized advertising and any other
          non-essential tracking, where applicable law requires consent. You may
          withdraw consent at any time as described below
        </li>
        <li>
          <strong>Legal obligation</strong> — to comply with applicable law and
          respond to lawful requests
        </li>
      </ul>
    `,
  });

  s.push({
    id: "cookies",
    title: "Cookies and Tracking Technologies",
    html: `
      <p>
        The Application is not a website and does not use browser cookies of its
        own. Its third-party SDKs may use device identifiers, software
        development kits, and similar technologies to support functionality,
        measurement, or service delivery. Where required by applicable law, the
        Service Provider will obtain consent before any non-essential tracking
        technology is used.
      </p>
    `,
  });

  if (caps.ads) {
    s.push({
      id: "advertising",
      title: "Advertising",
      html: `
        <p>
          The Application displays advertising served by Google AdMob, which may
          include banner, interstitial, and rewarded (opt-in) ad formats. To
          serve and measure these ads, AdMob may process your device's
          advertising identifier, coarse location derived from your IP address,
          and information about your interaction with the ads. The Service
          Provider does not receive your advertising identifier for its own
          purposes and does not build advertising profiles about you.
        </p>
        ${
          caps.personalizedAds
            ? `<p>
                 If you are in the European Economic Area, the United Kingdom, or
                 Switzerland, you will be asked for consent before personalized
                 advertising is used, through a consent message shown when you
                 first open the Application. You can change or withdraw that
                 choice at any time from the Application's settings screen, or by
                 contacting the Service Provider.
               </p>`
            : `<p>
                 The Application does not use personalized (interest-based)
                 advertising. Where applicable law requires consent for
                 personalized advertising — including in the European Economic
                 Area, the United Kingdom, and Switzerland — advertising is
                 served in <strong>non-personalized</strong> mode, which relies on
                 contextual signals rather than on a profile of your interests.
                 If personalized advertising is introduced in a future version,
                 you will be asked for consent beforehand and this policy will be
                 updated first.
               </p>`
        }
        <p>
          Independently of the Application, you can limit ad personalization or
          reset your advertising identifier at the operating-system level, under
          <em>Settings → Google → Ads</em> on Android. Doing so does not remove
          advertising from the Application; it makes the advertising you see less
          relevant.
        </p>
        <p>
          Rewarded advertising is always optional. You choose whether to watch a
          rewarded ad in exchange for an in-game benefit, and declining one never
          restricts access to content you already own.
        </p>
      `,
    });
  }

  if (caps.iap) {
    s.push({
      id: "purchases",
      title: "In-App Purchases",
      html: `
        <p>
          The Application offers optional in-app purchases of virtual currency,
          which can be spent on cosmetic items such as skins. All purchases are
          processed by Google Play Billing. Google acts as the merchant of
          record: it collects and processes your payment information under
          ${link("https://policies.google.com/privacy", "its own privacy policy")},
          and the Service Provider never receives or stores your payment card
          details.
        </p>
        <p>
          What the Application does receive from Google Play is a purchase token
          and order identifier, which it uses solely to verify the purchase,
          grant the corresponding content, and restore your purchases if you
          reinstall the Application or change devices.
        </p>
        <p>
          For refunds, billing history, or payment disputes, use your Google Play
          account, since the Service Provider cannot process payments or issue
          refunds directly. The Service Provider will assist with purchases that
          were paid but not delivered — contact ${contacts}.
        </p>
      `,
    });
  }

  if (caps.playGames || caps.cloudSave) {
    s.push({
      id: "play-games",
      title: "Leaderboards, Achievements and Cloud Save",
      html: `
        <p>
          The Application integrates Google Play Games Services. Signing in is
          optional and is initiated by you; the Application remains fully
          playable without signing in.
        </p>
        ${
          caps.playGames
            ? `<p>
                 If you sign in and submit a score, your <strong>public Play
                 Games player name and score become visible to other
                 players</strong> in the Application's leaderboards. Do not use a
                 player name that reveals information you would rather keep
                 private — your player name is managed in your Play Games
                 profile, not by the Service Provider, and you can change it
                 there at any time.
               </p>`
            : ""
        }
        ${
          caps.cloudSave
            ? `<p>
                 Cloud save stores your game progress in your own Google account
                 using Play Games Snapshots, so you can continue playing on
                 another device. The Service Provider does not host that data:
                 it lives in your Google account, and deleting the Application's
                 data from your Play Games account removes it.
               </p>`
            : ""
        }
        <p>
          Data processed through Play Games Services is subject to
          ${link("https://policies.google.com/privacy", "Google's Privacy Policy")}.
          You can disconnect the Application from your Play Games account at any
          time from your Google account settings.
        </p>
      `,
    });
  }

  s.push({
    id: "rights",
    title: "Your Rights",
    html: `
      <p>
        Depending on where you live, you may have the right to request access to,
        correction of, deletion of, or a portable copy of the personal data the
        Service Provider holds about you; to object to or request restriction of
        certain processing; and to withdraw consent where processing is based on
        consent. Withdrawing consent does not affect processing carried out before
        the withdrawal.
      </p>
      <p>
        To exercise any of these rights, contact the Service Provider at
        ${contacts}. The Service Provider will respond within the period required
        by applicable law and may need to ask for information to verify your
        request. Because the Application does not require an account, the Service
        Provider may be unable to identify data as yours; in that case it will
        explain what it can and cannot do.
      </p>
      <p>
        If you are in the EU/UK, you also have the right to lodge a complaint
        with your national data protection authority.
      </p>
    `,
  });

  s.push({
    id: "ccpa",
    title: "Your California Privacy Rights (CCPA/CPRA)",
    html: `
      <p>
        If you are a California resident, you have the right to know what personal
        information is collected and how it is used and disclosed, the right to
        delete personal information, the right to correct inaccurate personal
        information, the right to opt out of the sale or sharing of personal
        information, and the right not to be discriminated against for exercising
        these rights. To exercise your CCPA/CPRA rights, contact the Service
        Provider at ${contacts}.
      </p>
      <p>
        The Service Provider <strong>does not sell</strong> your personal
        information for money.${
          caps.ads && caps.personalizedAds
            ? ` Where you have allowed personalized advertising, the use of your
               advertising identifier by the advertising partner may qualify as
               "sharing" for cross-context behavioral advertising under the
               CPRA. You can opt out at any time by declining or withdrawing
               consent to personalized ads, or by enabling "Opt out of Ads
               Personalization" in your Android settings.`
            : caps.ads
              ? ` The Application does not use personalized advertising and does
                 not "share" personal information for cross-context behavioral
                 advertising as those terms are defined in the CPRA. You can
                 further limit the use of your advertising identifier by enabling
                 "Opt out of Ads Personalization" in your Android settings.`
              : ""
        }
      </p>
      <p>
        The categories of personal information handled are described under
        <a href="#collection">Information Collection and Use</a>, the purposes
        under <a href="#purposes">Purposes and Legal Bases</a>, the recipients
        under <a href="#third-party">Third Party Access</a>, and the retention
        periods under <a href="#retention">Data Retention</a>. The Service
        Provider does not knowingly collect or share the personal information of
        consumers under 16 years of age.
      </p>
    `,
  });

  s.push({
    id: "third-party",
    title: "Third Party Access",
    html: `
      <p>
        Only the information described in this policy is transmitted to the
        third-party services the Application relies on, and only for the purposes
        described. These services have their own privacy policies governing how
        they handle data:
      </p>
      ${sdkListHtml(caps, "privacy")}
      <p>
        The Service Provider may also disclose information:
      </p>
      <ul>
        <li>
          as required by law, such as to comply with a subpoena or similar legal
          process;
        </li>
        <li>
          when it believes in good faith that disclosure is necessary to protect
          its rights, protect your safety or the safety of others, investigate
          fraud, or respond to a lawful government request;
        </li>
        <li>
          to trusted service providers acting on its behalf, which have no
          independent right to use the information and have agreed to obligations
          consistent with this policy;
        </li>
        <li>
          in connection with a merger, acquisition, or sale of assets, in which
          case you will be notified of any change in how your data is handled.
        </li>
      </ul>
    `,
  });

  s.push({
    id: "transfers",
    title: "International Data Transfers",
    html: `
      <p>
        The Service Provider is established in ${ctx.studio.jurisdiction}, and
        its third-party service providers operate globally. Personal data may
        therefore be transferred to and processed in countries outside your
        country of residence, including outside the European Economic Area
        (EEA). Where applicable law requires safeguards for such transfers, the
        following mechanisms are used:
      </p>
      <ul>
        <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
        <li>Adequacy decisions or other legally recognized transfer mechanisms</li>
        <li>Your consent, where required and legally permitted</li>
      </ul>
      <p>
        Data protection laws in other countries may differ from those in your
        jurisdiction. Where required by law, the Service Provider will apply
        appropriate safeguards and obtain any consent required for the transfer.
      </p>
    `,
  });

  s.push({
    id: "opt-out",
    title: "Opt-Out Rights",
    html: `
      <p>
        You can stop all further collection of information by uninstalling the
        Application. Uninstalling stops the Application from collecting data from
        your device, but it does not automatically delete information already
        transmitted to the Service Provider or to third parties, and it does not
        delete ${
          caps.cloudSave
            ? "data stored in your own Google account, which you manage from your Play Games settings"
            : "data held by the third-party services listed above"
        }.
      </p>
      <p>
        To request deletion of your personal data, to withdraw consent, or to
        exercise any other right, contact the Service Provider at ${contacts}.
      </p>
    `,
  });

  s.push({
    id: "retention",
    title: "Data Retention Policy",
    html: `
      <p>
        The Service Provider retains personal data only as long as necessary for
        the purposes described in this policy:
      </p>
      <ul>
        <li>
          <strong>Data you provide directly</strong> (for example, the content of
          a support email): retained for the duration of your use of the
          Application plus 12 months, unless longer retention is required by law
        </li>
        <li>
          <strong>Automatically collected data</strong>: retained for up to 24
          months from collection, unless longer retention is required for legal
          compliance
        </li>
        ${
          caps.iap
            ? `<li>
                 <strong>Purchase records</strong>: retained for as long as
                 required by tax, accounting, and consumer protection law
               </li>`
            : ""
        }
        <li>
          <strong>Locally stored game data</strong>: kept on your device until you
          clear the Application's data or uninstall it
        </li>
        <li>
          <strong>Aggregated and anonymized data</strong>: retained indefinitely,
          as it no longer identifies you
        </li>
      </ul>
      <p>
        You may request deletion of your personal data at any time, subject to any
        legal obligation to retain it, by contacting ${contacts}. Note that some
        data is required for the Application to function properly.
      </p>
    `,
  });

  s.push({
    id: "children",
    title: "Children",
    html: `
      <p>
        The Application is not directed to children under 13 years of age, or such
        higher age as required by applicable law in your jurisdiction. The Service
        Provider does not knowingly solicit data from children and does not market
        the Application to them.
      </p>
      <p>
        Where parental or guardian consent is required under applicable law, the
        Application is not intended for use without that consent. If the Service
        Provider discovers that a child has provided personal information in
        violation of applicable law, it will delete that information promptly. If
        you are a parent or guardian and believe your child has provided personal
        information, contact the Service Provider at ${contacts} so that the
        necessary action can be taken.
      </p>
      ${
        caps.iap
          ? `<p>
               Parents and guardians can prevent unintended in-app purchases using
               the parental controls and purchase authentication settings available
               in the Google Play Store.
             </p>`
          : ""
      }
    `,
  });

  s.push({
    id: "security",
    title: "Security",
    html: `
      <p>
        The Service Provider is concerned about safeguarding the confidentiality
        of your information and applies physical, electronic, and procedural
        safeguards appropriate to the limited data the Application processes.
        Because the Application relies on Google Play services rather than
        servers operated by the Service Provider, most data in transit is
        protected by the encryption those services provide.
      </p>
      <p>
        No method of transmission or storage is completely secure, so absolute
        security cannot be guaranteed. It is also your responsibility to maintain
        the security of your device and of your Google account.
      </p>
    `,
  });

  s.push({
    id: "breach",
    title: "Data Breach Notification",
    html: `
      <p>
        If a data breach occurs that affects your personal data, the Service
        Provider will notify you and the competent supervisory authority in
        accordance with applicable legal requirements, including, where required,
        information about the nature of the breach, its likely consequences, and
        the steps taken to address it.
      </p>
    `,
  });

  s.push({
    id: "changes",
    title: "Changes",
    html: `
      <p>
        The Service Provider may update this Privacy Policy from time to time. You
        will be notified of material changes by posting the updated policy at this
        address with a new effective date. Where required by law, consent will be
        sought for material changes before they take effect. Continuing to use the
        Application after an update takes effect means you accept the updated
        policy.
      </p>
      <p>
        Previous versions of this Privacy Policy are maintained and made available
        on request by contacting the Service Provider at ${contacts}.
      </p>
      <p>
        This privacy policy is effective as of
        <strong>${ctx.effectiveDate}</strong>.${
          ctx.previousEffectiveDate
            ? ` It replaces the version effective ${ctx.previousEffectiveDate}.`
            : ""
        }
      </p>
    `,
  });

  s.push({
    id: "consent",
    title: "Your Consent",
    html: `
      <p>
        Where processing is based on consent, you give that consent by
        affirmatively opting in to the relevant feature or prompt${
          caps.ads ? ", such as the advertising consent message" : ""
        }. You may withdraw consent at any time, without affecting processing
        carried out before the withdrawal. Processing based on other lawful bases
        continues as described in this policy.
      </p>
    `,
  });

  s.push({
    id: "contact",
    title: "Contact Us",
    html: `
      <p>
        If you have questions about privacy while using ${appLabel}, or about the
        practices described here, contact the Service Provider by email at
        ${contacts}.
      </p>
      <p>
        See also our <a href="${ctx.termsHref}">Terms &amp; Conditions</a> for the
        full agreement governing your use of the Application.
      </p>
    `,
  });

  return s;
}

/* ==========================================================================
   TÉRMINOS Y CONDICIONES
   ========================================================================== */
export function termsSections(ctx) {
  const { caps, contacts } = ctx;
  const s = [];

  s.push({
    id: "license",
    title: "License to Use the Application",
    html: `
      <p>
        Subject to your compliance with these Terms, the Service Provider grants
        you a limited, non-exclusive, non-transferable, non-sublicensable,
        revocable license to install and use the Application on a device you own
        or control, for your personal, non-commercial entertainment. All rights
        not expressly granted are reserved.
      </p>
      <p>
        You may not reproduce, distribute, rent, lease, sell, sublicense, modify,
        create derivative works from, reverse engineer, decompile, or disassemble
        the Application, except to the extent such activity is expressly permitted
        by applicable law and cannot lawfully be excluded.
      </p>
    `,
  });

  s.push({
    id: "ip",
    title: "Intellectual Property",
    html: `
      <p>
        The Service Provider retains all intellectual property rights in the
        Application, including its code, artwork, audio, design, trademarks,
        service marks, trade names, logos, and branding (the "IP"). Nothing in
        these Terms grants you any license or right to use the Service Provider's
        trademarks, logos, or branding for any purpose. You agree not to remove,
        alter, or obscure any copyright, trademark, or other proprietary notice
        displayed in or on the Application.
      </p>
      <p>
        Unauthorized copying or modification of the Application or any part of it,
        attempts to extract its source code or assets, unauthorized translation
        into other languages, and the creation of derivative versions are
        prohibited. All trademarks, copyrights, database rights, and other
        intellectual property rights related to the Application remain the
        property of the Service Provider.
      </p>
      <p>
        You may create and share gameplay videos, screenshots, and streams of the
        Application for non-commercial or monetized content-creator purposes,
        provided you do not present them as official, do not use the Service
        Provider's branding in a way that implies endorsement, and do not
        distribute the Application's assets separately from your own commentary or
        content.
      </p>
    `,
  });

  s.push({
    id: "eligibility",
    title: "Eligibility and Acceptable Use",
    html: `
      <p>
        By accessing and using the Application, you represent that you are legally
        permitted to use it in your jurisdiction and that you are at least 13 years
        of age, or such higher age of digital consent as applies where you live. If
        you are below that age, a parent or legal guardian must review and accept
        these Terms on your behalf and supervise your use of the Application.
      </p>
      <p>You agree not to:</p>
      <ul>
        <li>
          Use cheats, automation, bots, modified clients, memory editors, or any
          other software or technique that alters the intended behavior of the
          Application
        </li>
        <li>
          Exploit bugs or glitches to gain an unfair advantage${
            caps.iap ? ", obtain virtual items without paying," : ""
          } or disrupt other players' experience
        </li>
        ${
          caps.playGames
            ? `<li>
                 Submit falsified scores, manipulate leaderboards, or use a player
                 name that is offensive, impersonates another person, or infringes
                 third-party rights
               </li>`
            : ""
        }
        ${
          caps.ads
            ? `<li>
                 Interfere with, falsify, or automate advertising impressions or
                 rewarded-ad completions
               </li>`
            : ""
        }
        <li>
          Interfere with, disrupt, or attempt to gain unauthorized access to the
          Application or any service it connects to
        </li>
        <li>Use the Application for any unlawful purpose</li>
      </ul>
    `,
  });

  if (caps.iap) {
    s.push({
      id: "purchases",
      title: "In-App Purchases and Virtual Items",
      html: `
        <p>
          The Application may offer optional in-app purchases. All purchases are
          processed by the app store from which you obtained the Application
          (Google Play), which acts as the merchant of record. Prices are shown
          before purchase, include applicable taxes where required, and may vary
          by region and over time.
        </p>
        <p>
          Virtual items, virtual currency, cosmetic content, and similar in-game
          benefits are licensed to you, not sold. They have
          <strong>no monetary value</strong>, cannot be redeemed for cash or
          exchanged for anything of value outside the Application, and may not be
          transferred, sold, or traded. The Service Provider may modify, balance,
          or discontinue virtual items to maintain game balance or for technical
          reasons, without compensation, except where applicable law provides
          otherwise.
        </p>
        <p>
          Virtual currency you purchase, and the cosmetic content you unlock with
          it, remain available to you for as long as you retain access to the app
          store account used to make the purchase, and can be restored by
          reinstalling the Application and signing in to that account.
        </p>
        <p>
          <strong>Refunds and consumer rights.</strong> Refund requests are handled
          by the app store under its own refund policy. If you are a consumer in
          the European Union, the United Kingdom, or another jurisdiction with a
          statutory right of withdrawal, you keep any such right that cannot be
          lawfully excluded; note that this right may lapse once delivery of
          digital content has begun with your consent. If you paid for something
          the Application did not deliver, contact ${contacts} and the Service
          Provider will assist.
        </p>
        <p>
          If the Application is discontinued, virtual items and unpurchased
          benefits may cease to be available. Where the law requires
          compensation or a refund in that situation, the Service Provider will
          comply.
        </p>
      `,
    });
  }

  if (caps.ads) {
    s.push({
      id: "advertising",
      title: "Advertising",
      html: `
        <p>
          The Application is supported by advertising, which may include banner,
          interstitial, and optional rewarded formats. Advertising content is
          supplied by third-party advertisers through Google AdMob and is not
          reviewed, endorsed, or controlled by the Service Provider, which is not
          responsible for the products, services, or claims made in third-party
          advertising.
        </p>
        <p>
          Rewarded advertising is optional and offered in exchange for an in-game
          benefit. The Service Provider does not guarantee that advertising
          inventory, and therefore rewarded opportunities, will be available at
          any given moment; a reward that fails to be granted for technical
          reasons does not entitle you to compensation beyond the in-game benefit
          concerned. How advertising affects your data is described in the
          <a href="${ctx.privacyHref}">Privacy Policy</a>.
        </p>
      `,
    });
  }

  if (caps.playGames || caps.cloudSave) {
    s.push({
      id: "play-games",
      title: "Leaderboards, Fair Play and Cloud Save",
      html: `
        ${
          caps.playGames
            ? `<p>
                 Leaderboards depend on Google Play Games Services and require you
                 to sign in voluntarily. Your public player name and submitted
                 scores are visible to other players. The Service Provider may
                 remove scores, reset rankings, or restrict a player's access to
                 leaderboards where it has reasonable grounds to believe scores
                 were obtained through cheating, modified software, or exploitation
                 of a defect. Where such a measure is taken against you, you may
                 request a review by contacting ${contacts}.
               </p>`
            : ""
        }
        ${
          caps.cloudSave
            ? `<p>
                 Cloud save stores your progress in your own Google account. The
                 Service Provider does not warrant that saved data will always be
                 available, complete, or recoverable, and is not liable for loss of
                 progress caused by the third-party service, by conflicts between
                 devices, or by your deletion of the data. Keeping the Application
                 updated reduces the risk of save incompatibility.
               </p>`
            : ""
        }
        <p>
          Google Play Games Services is a third-party service governed by
          ${link("https://play.google.com/games/terms/", "Google's terms")}, and its
          availability is outside the Service Provider's control.
        </p>
      `,
    });
  }

  if (caps.ugc) {
    s.push({
      id: "ugc",
      title: "User-Generated Content and Moderation",
      html: `
        <p>
          If the Application allows you to post, share, or upload content, you
          agree not to submit content that:
        </p>
        <ul>
          <li>Is illegal or infringes third-party intellectual property rights</li>
          <li>Is abusive, threatening, harassing, defamatory, or hate speech</li>
          <li>Contains discrimination or incitement to violence or illegal activity</li>
          <li>Is spam, phishing, or contains malware</li>
          <li>Violates the privacy or personal data rights of others</li>
          <li>Is misleading, false, or deceptive</li>
          <li>Contains explicit violence or sexual content</li>
        </ul>
        <p>The Service Provider reserves the right to:</p>
        <ul>
          <li>Remove or disable access to content that violates these guidelines</li>
          <li>Suspend or terminate access for users who repeatedly violate them</li>
          <li>Cooperate with law enforcement where illegal content is reported</li>
        </ul>
        <p>
          If you believe content violates these Terms, infringes your rights, or is
          unlawful, report it to ${contacts} with enough information to identify the
          content, evaluate the complaint, and contact you if follow-up is needed.
          The Service Provider will review reports, may request further
          information, and may remove content or act against the responsible
          account. Users affected by a moderation decision may request a further
          review at the same address and will receive the reasons for any upheld
          decision, subject to applicable law.
        </p>
        <p>
          By submitting content you grant the Service Provider a non-exclusive,
          worldwide, royalty-free license to use, reproduce, distribute, prepare
          derivative works of, display, and perform that content in connection with
          the Application and the Service Provider's business. This license does not
          permit the Service Provider to sell or sublicense your content to third
          parties independently of the Application. You represent that you own or
          control all rights in the content you submit. Processing of personal data
          in submitted content is governed by the
          <a href="${ctx.privacyHref}">Privacy Policy</a>; do not post other
          people's personal data without their consent.
        </p>
      `,
    });
  } else {
    s.push({
      id: "no-ugc",
      title: "No User-Generated Content",
      html: `
        <p>
          The Application does not host public forums, chat, or content uploads,
          and does not allow users to publish content to other users${
            caps.playGames
              ? ", other than the public player name and scores you choose to submit to leaderboards, which are governed by the fair-play rules above"
              : ""
          }. If a future version introduces such features, these Terms will be
          updated before that version is released.
        </p>
        <p>
          If you encounter content in or around the Application that you believe is
          unlawful or infringes your rights — including in third-party
          advertising — you can report it to ${contacts}, and the Service Provider
          will review the report and act where appropriate.
        </p>
      `,
    });
  }

  s.push({
    id: "termination",
    title: "Termination",
    html: `
      <p>
        The Service Provider may suspend your access to the Application or its
        related services if you materially breach these Terms. Written notice of
        the breach will be provided and, where the breach can be cured, you will
        have 14 days from receipt of notice to remedy it. If you fail to cure it
        within that period, access may be terminated.
      </p>
      <p>
        Access may be suspended or terminated immediately and without notice if
        you violate applicable law, infringe intellectual property rights, or
        engage in conduct that could harm other users or the Service Provider.
      </p>
      <p>
        You may stop using the Application at any time by uninstalling it. Upon
        termination, the rights and licenses granted to you end, you must cease
        using the Application and delete all copies from your devices${
          caps.iap
            ? ", and no refund is owed for virtual items already delivered, except where applicable law requires one"
            : ""
        }.
      </p>
    `,
  });

  s.push({
    id: "service-changes",
    title: "Service Availability and Updates",
    html: `
      <p>
        The Service Provider aims to keep the Application as useful and efficient
        as possible and may modify it, add or remove features, or change the terms
        on which it is offered, at any time. Any charge for the Application or its
        services will be clearly communicated to you before it applies.
      </p>
      <p>
        Some functions require an active internet connection, provided by Wi-Fi or
        by your mobile network. The Service Provider cannot be held responsible if
        the Application does not function at full capacity because you lack Wi-Fi
        access or have exhausted your data allowance. If you use the Application
        outside a Wi-Fi area, your mobile network provider's agreement still
        applies and you may incur data charges, including roaming charges outside
        your home territory. By using the Application you accept responsibility for
        those charges; if you are not the bill payer for the device, you are assumed
        to have the bill payer's permission. Likewise, the Service Provider cannot
        be responsible for your device running out of battery or otherwise being
        unable to access the Application.
      </p>
      <p>
        The Application may require updates as operating-system requirements
        change, and you may need to install them to keep using it. The Service
        Provider does not guarantee that it will always update the Application to
        remain compatible with the version of the operating system installed on
        your device, and may cease supporting earlier versions. The Service
        Provider may also discontinue the Application; where reasonably possible,
        advance notice will be given${
          caps.iap
            ? ", and paid content will be handled as described under In-App Purchases and Virtual Items"
            : ""
        }.
      </p>
      <p>
        The Service Provider strongly advises against jailbreaking or rooting your
        device, which removes restrictions imposed by its official operating
        system. Doing so may expose your device to malware, compromise its
        security features, and cause the Application to malfunction or not work at
        all.
      </p>
    `,
  });

  s.push({
    id: "third-party",
    title: "Third Party Services",
    html: `
      <p>
        The Application relies on the following third-party services, each governed
        by its own terms:
      </p>
      ${sdkListHtml(caps, "terms")}
      <p>
        The Service Provider does not control these services and is not responsible
        for their availability, content, or practices. Nothing in these Terms limits
        any rights you have under applicable consumer protection law that cannot be
        lawfully excluded.
      </p>
    `,
  });

  s.push({
    id: "warranties",
    title: "Disclaimer of Warranties",
    html: `
      <p>
        To the fullest extent permitted by law, and without affecting your
        statutory consumer rights, the Application is provided "as is" and "as
        available", without warranties of any kind, whether express or implied,
        including implied warranties of merchantability, fitness for a particular
        purpose, and non-infringement. The Service Provider does not warrant that
        the Application will be uninterrupted, error-free, free of harmful
        components, or that defects will be corrected.
      </p>
      <p>
        If you are a consumer, you may have statutory rights regarding digital
        content that is not as described or not of satisfactory quality. Nothing in
        these Terms excludes or limits those rights.
      </p>
    `,
  });

  s.push({
    id: "liability",
    title: "Limitation of Liability",
    html: `
      <p>
        To the fullest extent permitted by law, the Service Provider shall not be
        liable for any indirect, incidental, special, consequential, or punitive
        damages, including lost profits, loss of data or game progress, or business
        interruption, even if advised of the possibility of such damages.
      </p>
      <p>However, the Service Provider retains full liability for:</p>
      <ul>
        <li>Death or personal injury caused by its negligence</li>
        <li>Fraud or fraudulent misrepresentation</li>
        <li>Any other liability that cannot be excluded or limited under applicable law</li>
      </ul>
      <p>
        To the fullest extent permitted by law, the Service Provider's total
        liability for any claim shall not exceed the greater of (a) the amount you
        paid for the Application and its in-app content in the 12 months preceding
        the claim, and (b) the minimum amount that must be payable under applicable
        law. Where the Application is provided free of charge, liability is limited
        to the minimum amount permitted by applicable law.
      </p>
      <p>
        The Service Provider accepts no liability for loss, direct or indirect,
        resulting from your reliance on third-party information or content made
        available through the Application, including advertising.
      </p>
    `,
  });

  s.push({
    id: "indemnification",
    title: "Indemnification",
    html: `
      <p>
        To the fullest extent permitted by law, you agree to indemnify and hold
        harmless the Service Provider, its affiliates, officers, directors,
        employees, and agents from and against claims, liabilities, damages,
        losses, and expenses, including reasonable legal fees, arising out of or
        directly related to your breach of these Terms or your intentional misuse
        of the Application.
      </p>
      <p>
        This indemnification does not apply to claims arising from the Service
        Provider's own negligence, breach of these Terms, or violation of
        applicable law. In jurisdictions where consumer indemnification is
        restricted by law, this clause applies only to the maximum extent
        permitted.
      </p>
    `,
  });

  s.push({
    id: "law",
    title: "Governing Law and Jurisdiction",
    html: `
      <p>
        These Terms and Conditions are governed by the laws of
        ${ctx.studio.jurisdiction}, where the Service Provider is established,
        excluding its conflict of law rules. If you are a consumer resident in
        another country, this choice of law does not deprive you of the protection
        of mandatory consumer provisions of the law of your country of residence.
      </p>
      <p>
        Any dispute arising out of or relating to these Terms will be brought
        before the courts that have jurisdiction under applicable law. If you are a
        consumer, you may bring proceedings in the courts of your place of
        residence where mandatory law grants you that right. Before starting formal
        proceedings, please contact ${contacts} — most issues can be resolved
        informally.
      </p>
    `,
  });

  if (caps.ugc) {
    s.push({
      id: "dsa",
      title: "DSA Compliance (Digital Services Act)",
      html: `
        <p>
          To the extent the Application qualifies as an intermediary service under
          the Digital Services Act (Regulation (EU) 2022/2065, "DSA"), the
          following provisions apply in addition to the terms above.
        </p>
        <p>
          <strong>Point of Contact:</strong> The Service Provider maintains a single
          point of contact for direct communication with EU authorities and
          recipients of the service, reachable at ${contacts}. Where the Service
          Provider is established outside the European Union, a legal
          representative in the EU is designated in accordance with Article 13 of
          the DSA.
        </p>
        <p>
          <strong>Content Moderation and Statement of Reasons:</strong> Where the
          Service Provider restricts access to content, suspends or terminates an
          account, or limits the availability of features, a clear and specific
          statement of reasons will be provided to the affected user, including the
          nature of the restriction, its legal or contractual basis, and the
          available redress mechanisms, in accordance with Article 17 of the DSA.
        </p>
        <p>
          <strong>Notice and Action:</strong> Users and third parties may submit
          notices of allegedly illegal content through the contact details in these
          Terms. Notices are processed promptly and diligently, with human review
          where the circumstances require it, acknowledged electronically, and
          decided without undue delay, in accordance with Article 16 of the DSA.
        </p>
        <p>
          <strong>Out-of-Court Dispute Settlement:</strong> Disputes regarding
          content moderation decisions may be submitted to an out-of-court dispute
          settlement body certified under Article 21 of the DSA, with which the
          Service Provider will engage in good faith. This does not affect your
          right to seek a judicial remedy.
        </p>
        <p>
          <strong>Transparency Reporting:</strong> The Service Provider publishes
          periodic transparency reports on content moderation activity, including
          the volume of notices received, actions taken, and any automated means
          used, in accordance with Article 24 of the DSA. Reports are available on
          request at ${contacts}.
        </p>
        <p>
          These DSA provisions do not replace or limit any rights or obligations
          under applicable consumer protection or data protection law.
        </p>
      `,
    });
  }

  s.push({
    id: "severability",
    title: "Severability",
    html: `
      <p>
        If any provision of these Terms is held invalid, illegal, or unenforceable
        by a court of competent jurisdiction, that provision shall be modified to
        the minimum extent necessary to make it valid and enforceable, or severed
        if modification is not possible, and the remaining provisions shall remain
        in full force and effect.
      </p>
    `,
  });

  s.push({
    id: "entire-agreement",
    title: "Entire Agreement",
    html: `
      <p>
        These Terms and Conditions, together with the
        <a href="${ctx.privacyHref}">Privacy Policy</a>, constitute the entire
        agreement between you and the Service Provider concerning your use of the
        Application, superseding any prior agreements or understandings. The
        Service Provider's failure to enforce any provision is not a waiver of it.
        You may not assign these Terms; the Service Provider may assign them in
        connection with a merger, acquisition, or sale of assets.
      </p>
    `,
  });

  s.push({
    id: "changes",
    title: "Changes to These Terms and Conditions",
    html: `
      <p>
        The Service Provider may update these Terms from time to time and will
        notify you of changes by posting the new version at this address with a new
        effective date. You are advised to review this page periodically.
        Continuing to use the Application after a change takes effect means you
        accept the updated Terms; if you do not accept them, you must stop using
        the Application and uninstall it.
      </p>
      <p>
        Previous versions of these Terms are maintained and made available on
        request by contacting ${contacts}.
      </p>
      <p>
        These terms and conditions are effective as of
        <strong>${ctx.effectiveDate}</strong>.${
          ctx.previousEffectiveDate
            ? ` They replace the version effective ${ctx.previousEffectiveDate}.`
            : ""
        }
      </p>
    `,
  });

  s.push({
    id: "contact",
    title: "Contact Us",
    html: `
      <p>
        If you have questions or suggestions about these Terms and Conditions,
        contact the Service Provider at ${contacts}.
      </p>
      <p>
        See also our <a href="${ctx.privacyHref}">Privacy Policy</a> for details on
        how your data is handled.
      </p>
    `,
  });

  return s;
}

/* ==========================================================================
   Párrafos de encabezado (alcance del documento). Se emiten antes del primer
   <section> para que la primera cosa que lee un revisor de Play sea a qué app
   aplica el documento.
   ========================================================================== */
export function privacyIntro(ctx) {
  return `
    <p>
      This Privacy Policy applies to ${ctx.scopeSentence} operated by
      ${ctx.studio.name} (collectively, the "Application"). ${ctx.studio.name} is
      hereby referred to as the "Service Provider". It explains what information
      the Application handles, why, and what choices you have.
    </p>
  `;
}

export function termsIntro(ctx) {
  return `
    <p>
      These Terms and Conditions apply to ${ctx.scopeSentence} operated by
      ${ctx.studio.name} (collectively, the "Application"). ${ctx.studio.name} is
      hereby referred to as the "Service Provider".
    </p>
    <p>
      By downloading or using the Application, you agree to these Terms and
      Conditions. Please read them carefully before using the Application. If you
      do not agree, do not download or use the Application.
    </p>
  `;
}
