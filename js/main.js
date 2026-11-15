/* ==========================================================================
   Seconde Vie — Scripts de la page d'accueil
   Dépend de js/i18n.js (LANGUAGES, TRANSLATIONS), chargé avant ce fichier.
   ========================================================================== */

/* Numéro WhatsApp de la boutique, au format international SANS « + » ni espaces.
   Exemple : 06 40 60 36 18 (Maroc) → "212640603618" */
const WHATSAPP_NUMBER = "212640603618";

const DEFAULT_LANG = "fr";
const STORAGE_KEY = "secondevie-lang";

let currentLang = DEFAULT_LANG;

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  initMobileNav();
  setFooterYear();
});

/** Renvoie la traduction d'une clé dans la langue courante. */
function t(key) {
  return TRANSLATIONS[currentLang][key] ?? TRANSLATIONS[DEFAULT_LANG][key] ?? "";
}

/* ---------- Langue ---------- */

function initLanguage() {
  const select = document.getElementById("lang-select");

  select.addEventListener("change", () => {
    setLanguage(select.value);
    saveLanguage(select.value);
  });

  setLanguage(loadLanguage());
}

/** Applique une langue à toute la page (textes, attributs, sens de lecture). */
function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) lang = DEFAULT_LANG;
  currentLang = lang;

  const root = document.documentElement;
  root.lang = lang;
  root.dir = LANGUAGES[lang].dir;

  document.title = t("meta.title");
  document.querySelector('meta[name="description"]').setAttribute("content", t("meta.description"));

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    el.alt = t(el.dataset.i18nAlt);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  });
  // Prix en dirhams, avec la devise écrite selon la langue.
  // Le montant est lu une seule fois dans le HTML (ex. « 250 DH » → 250).
  document.querySelectorAll(".product-card__price").forEach((el) => {
    if (!el.dataset.amount) el.dataset.amount = el.textContent.replace(/\D/g, "");
    el.textContent = t("price.format").replace("{amount}", el.dataset.amount);
  });

  document.getElementById("lang-select").value = lang;
  updateMenuLabel();
  updateOrderLinks();
}

/* ---------- Commande WhatsApp ---------- */

/**
 * Prépare le lien WhatsApp de chaque article avec une fiche de commande
 * pré-remplie (nom, taille/état, prix, photo) dans la langue courante.
 * Le client complète ensuite son nom et sa ville avant d'envoyer.
 */
function updateOrderLinks() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const link = card.querySelector(".btn-order");
    if (!link) return;

    const values = {
      name: card.querySelector(".product-card__name").textContent.trim(),
      meta: card.querySelector(".product-card__meta").textContent.trim(),
      price: card.querySelector(".product-card__price").textContent.trim(),
      photo: card.querySelector(".product-card__media img").src,
    };

    // Remplace chaque {clé} du modèle par sa valeur
    const message = t("order.message").replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);

    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  });
}

/* Mémorise le choix dans le navigateur (peut être indisponible : navigation privée, etc.). */
function loadLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function saveLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* sans stockage, la langue reste simplement active jusqu'au rechargement */
  }
}

/* ---------- Menu mobile ---------- */

/**
 * Ouvre/ferme la navigation avec le bouton burger
 * et la referme après un clic sur un lien ou avec Échap.
 */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;

  const setOpen = (isOpen) => {
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    updateMenuLabel();
  };

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

/** Met à jour le libellé du bouton burger selon son état et la langue. */
function updateMenuLabel() {
  const toggle = document.querySelector(".nav-toggle");
  if (!toggle) return;
  const isOpen = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-label", t(isOpen ? "menu.close" : "menu.open"));
}

/* ---------- Footer ---------- */

/** Affiche l'année en cours dans le footer. */
function setFooterYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}
