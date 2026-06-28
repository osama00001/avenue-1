/** Bare CMS slug from stored footer link value */
export function cmsPageSlug(value) {
  let slug = String(value || "").trim();
  if (!slug) return "";

  if (slug.startsWith("http://") || slug.startsWith("https://")) return slug;
  if (slug.startsWith("/cms/")) slug = slug.slice(5);
  else if (slug === "/cms") slug = "";
  else if (slug.startsWith("/")) slug = slug.slice(1);

  slug = slug.split("/").filter(Boolean)[0] || "";
  if (slug === "cms") return "";
  return slug;
}

export function resolveFooterHref(href, { label = "", cmsPages = [] } = {}) {
  const raw = String(href || "").trim();

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  if (raw.startsWith("/") && !raw.startsWith("/cms")) {
    return raw;
  }

  let slug = cmsPageSlug(raw);
  if (!slug && label && cmsPages.length) {
    const needle = label.toLowerCase().trim();
    const match = cmsPages.find((page) => {
      const title = String(page.title || "").toLowerCase();
      const pageSlug = String(page.slug || "").toLowerCase();
      return title === needle || pageSlug === needle || pageSlug === needle.replace(/\s+/g, "-");
    });
    slug = match?.slug || "";
  }

  if (!slug) return "#";
  return `/cms/${slug}`;
}
