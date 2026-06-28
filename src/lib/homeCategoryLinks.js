import {
  catalogUrlForSection,
  catalogUrlFromPathOrLabel,
  categoryBrowseUrl,
} from "@/lib/catalogCategories";

const BESTSELLERS_BANNER_URL = categoryBrowseUrl("bestsellers");
const CHILDREN_BANNER_URL = categoryBrowseUrl("children_books");

const CHILDREN_BANNER_KEYWORDS =
  /half[\s-]?blood|percy\s*jackson|camp\s*half|riordan/i;

/** SEE MORE link — only when section exists in sidebar catalog. */
export function categorySeeMoreUrl(sectionKey) {
  return catalogUrlForSection(sectionKey);
}

/** Sale-highlight icon link — only when it maps to sidebar catalog. */
export function resolveSaleHighlightHref(href = "", label = "") {
  return catalogUrlFromPathOrLabel(href, label);
}

/**
 * Homepage banner destinations: Bestsellers by default; strip banner (Camp Half-Blood) → Children's.
 */
export function resolveHomeBannerHref(slot, banner = {}) {
  if (slot === "strip") {
    return CHILDREN_BANNER_URL;
  }

  const text = [banner.alt, banner.title, banner.imageUrl, banner.image]
    .filter(Boolean)
    .join(" ");
  if (CHILDREN_BANNER_KEYWORDS.test(text)) {
    return CHILDREN_BANNER_URL;
  }

  return BESTSELLERS_BANNER_URL;
}

/** Prefer href saved in site content; fall back to legacy slot rules. */
export function resolveStoredHomeHref(href, slot, banner = {}) {
  const saved = String(href || "").trim();
  if (saved && saved !== "#" && saved !== "/#") {
    return saved;
  }
  if (slot) {
    return resolveHomeBannerHref(slot, banner);
  }
  return saved || "/";
}
