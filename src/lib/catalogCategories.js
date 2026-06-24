/** Sidebar catalog — single source of truth for category browse URLs. */
export const CATALOG_CATEGORIES = [
  {
    name: "BESTSELLERS",
    slug: "bestsellers",
    matches: ["bestsellers", "H"],
  },
  {
    name: "NEW BOOKS",
    slug: "popular",
    matches: ["popular", "new_books"],
  },
  {
    name: "HIGHLIGHTS",
    slug: "recently_reviewed",
    matches: ["recently_reviewed", "highlights"],
  },
  {
    name: "FICTION",
    slug: "fiction",
    matches: ["fiction", "F"],
  },
  {
    name: "NON-FICTION",
    slug: "non_fiction",
    matches: ["non_fiction", "non-fiction"],
  },
  {
    name: "CHILDREN'S",
    slug: "children_books",
    matches: ["children_books", "Y"],
  },
  {
    name: "LANGUAGE",
    slug: "adult_books",
    matches: ["adult_books", "language", "C", "D", "E"],
  },
  {
    name: "GAMES",
    slug: "gift_books",
    matches: ["gift_books", "games", "W"],
  },
  {
    name: "E-BOOKS",
    slug: "ebooks",
    matches: ["ebooks"],
  },
];

const CATALOG_SLUGS = new Set(CATALOG_CATEGORIES.map((c) => c.slug));

/** Homepage section / icon keys → catalog slug (client-approved mapping). */
export const HOME_SECTION_TO_CATALOG = {
  bestsellers: "bestsellers",
  popular: "popular",
  new_books: "popular",
  highlights: "recently_reviewed",
  recently_reviewed: "recently_reviewed",
  special_editions: "bestsellers",
  coming_soon: "popular",
  fiction: "fiction",
  non_fiction: "non_fiction",
  paperback_books: "fiction",
  children_books: "children_books",
  language: "adult_books",
  adult_books: "children_books",
  games: "gift_books",
  gift_books: "gift_books",
  stationery: "gift_books",
  calendars_diaries: "gift_books",
  ebooks: "ebooks",
};

export function categoryBrowseUrl(slug) {
  return `/category/${slug}`;
}

export function isCatalogSlug(slug) {
  return CATALOG_SLUGS.has(slug);
}

export function isCatalogCategoryActive(cat, categoryParam) {
  const param = (categoryParam || "").toLowerCase();
  const matches = cat.matches || [cat.slug];

  const isKnownSlug = CATALOG_CATEGORIES.some((c) => {
    const m = c.matches || [c.slug];
    return m.some((x) => x && x.length > 1 && x.toLowerCase() === param);
  });

  const isBicCode =
    !isKnownSlug && /^[a-z][a-z0-9]{0,5}$/i.test(categoryParam || "");

  return matches.some((match) => {
    if (!match) return false;
    if (match.length === 1) {
      return (
        isBicCode &&
        categoryParam.toUpperCase().startsWith(match.toUpperCase())
      );
    }
    return param === match.toLowerCase();
  });
}

export function catalogUrlForSection(sectionKey) {
  const slug = HOME_SECTION_TO_CATALOG[sectionKey];
  if (!slug) return null;
  return categoryBrowseUrl(slug);
}

export function catalogUrlFromPathOrLabel(href = "", label = "") {
  const path = String(href || "")
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\//, "")
    .toLowerCase()
    .split("?")[0];

  if (path.startsWith("category/")) {
    const slug = path.replace(/^category\//, "").split("/")[0];
    if (isCatalogSlug(slug)) return categoryBrowseUrl(slug);
    for (const cat of CATALOG_CATEGORIES) {
      const matches = cat.matches || [cat.slug];
      if (matches.some((m) => m.toLowerCase() === slug)) {
        return categoryBrowseUrl(cat.slug);
      }
    }
  }

  if (HOME_SECTION_TO_CATALOG[path]) {
    return categoryBrowseUrl(HOME_SECTION_TO_CATALOG[path]);
  }

  const labelNorm = String(label || "").toLowerCase();

  if (labelNorm.includes("bestseller")) return categoryBrowseUrl("bestsellers");
  if (labelNorm.includes("new book")) return categoryBrowseUrl("popular");
  if (labelNorm.includes("highlight")) {
    return categoryBrowseUrl("recently_reviewed");
  }
  if (labelNorm.includes("non-fiction") || labelNorm.includes("nonfiction")) {
    return categoryBrowseUrl("non_fiction");
  }
  if (labelNorm.includes("fiction")) return categoryBrowseUrl("fiction");
  if (labelNorm.includes("children")) return categoryBrowseUrl("children_books");
  if (labelNorm.includes("language")) return categoryBrowseUrl("adult_books");
  if (
    labelNorm.includes("game") ||
    labelNorm.includes("puzzle") ||
    labelNorm.includes("stationery") ||
    labelNorm.includes("calendar") ||
    labelNorm.includes("diary") ||
    labelNorm.includes("diaries")
  ) {
    return categoryBrowseUrl("gift_books");
  }
  if (labelNorm.includes("e-book") || labelNorm.includes("ebook")) {
    return categoryBrowseUrl("ebooks");
  }

  return null;
}

function toTitleCase(value = "") {
  return String(value)
    .toLowerCase()
    .split(" ")
    .map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1) : word
    )
    .join(" ");
}

/** Page heading for /category/[code] — matches sidebar catalog labels. */
export function getCatalogCategoryTitle(code) {
  if (!code) return "Featured Books";

  for (const cat of CATALOG_CATEGORIES) {
    if (isCatalogCategoryActive(cat, code)) {
      return toTitleCase(cat.name);
    }
  }

  const normalized = String(code).replace(/_/g, " ");
  if (/^[A-Za-z][A-Za-z0-9]{0,5}$/.test(normalized) && normalized.length <= 6) {
    return `BIC ${normalized.toUpperCase()}`;
  }

  return toTitleCase(normalized);
}
