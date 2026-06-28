/** Canonical legal page URLs — must match CMS page slugs in MongoDB. */
export const LEGAL_LINKS = {
  terms: {
    href: "/cms/terms",
    label: "Terms & Conditions",
  },
  privacy: {
    href: "/cms/privacy",
    label: "Privacy Notice",
  },
  cookies: {
    href: "/cms/cookies",
    label: "Cookie Policy",
  },
};

export const COOKIE_PREFERENCES_SELECTOR = "#changePreferences";

export function isManageCookiesLink(href = "", label = "") {
  const normalized = `${href} ${label}`.toLowerCase();
  return normalized.includes("manage-cookies") || normalized.includes("manage cookies");
}
