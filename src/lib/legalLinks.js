/** Canonical legal page URLs — must match Strapi footer link paths. */
export const LEGAL_LINKS = {
  terms: {
    href: "/cms/terms-conditions",
    label: "Terms & Conditions",
  },
  privacy: {
    href: "/cms/privacy-notice",
    label: "Privacy Notice",
  },
  cookies: {
    href: "/cms/cookie-policy",
    label: "Cookie Policy",
  },
};

export const COOKIE_PREFERENCES_SELECTOR = "#changePreferences";

export function isManageCookiesLink(href = "", label = "") {
  const normalized = `${href} ${label}`.toLowerCase();
  return normalized.includes("manage-cookies") || normalized.includes("manage cookies");
}
