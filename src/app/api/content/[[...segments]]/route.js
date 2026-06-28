import { NextResponse } from "next/server";
import { CATALOG_CATEGORIES } from "@/lib/catalogCategories";
import {
  publicPageBySlugResponse,
  publicPagesResponse,
  publicSectionResponse,
  publicSocialResponse,
} from "@/lib/siteContentPublicApi";

const SECTION_KEYS = new Set([
  "footer",
  "home-banner",
  "home-promo",
  "home-strip",
  "home-main-banner",
  "home-middle-banner",
  "home-bottom-banner",
  "home-quick-links",
  "navigation",
  "site-settings",
]);

export async function GET(_req, { params }) {
  const segments = (await params).segments || [];
  const path = segments.join("/");

  if (path === "pages") {
    return publicPagesResponse("[/api/content/pages]");
  }

  if (path === "social") {
    return publicSocialResponse("[/api/content/social]");
  }

  if (path === "categories") {
    return NextResponse.json({
      data: CATALOG_CATEGORIES.map((cat, index) => ({
        id: `cat-${index}`,
        attributes: {
          label: cat.name,
          slug: cat.slug,
          description: "",
        },
      })),
    });
  }

  if (segments[0] === "page" && segments[1]) {
    return publicPageBySlugResponse(segments[1], "[/api/content/page]");
  }

  if (SECTION_KEYS.has(path)) {
    return publicSectionResponse(path, `[/api/content/${path}]`);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
