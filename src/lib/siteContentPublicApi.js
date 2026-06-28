import { NextResponse } from "next/server";
import {
  getPublicSection,
  getPublicPagesList,
  getPublicPageBySlug,
  getPublicSocialLinks,
} from "@/lib/siteContentStore";

function publicError(route, err, fallback) {
  console.error(route, err);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function publicSectionResponse(key, routeLabel) {
  try {
    const data = await getPublicSection(key);
    return NextResponse.json({ data });
  } catch (err) {
    return publicError(routeLabel, err, `Failed to fetch ${key}`);
  }
}

export async function publicPagesResponse(routeLabel = "[/api/content/pages]") {
  try {
    const data = await getPublicPagesList();
    return NextResponse.json({ data });
  } catch (err) {
    return publicError(routeLabel, err, "Failed to fetch pages");
  }
}

export async function publicPageBySlugResponse(slug, routeLabel) {
  try {
    const entry = await getPublicPageBySlug(slug);
    return NextResponse.json({ data: entry ? [entry] : [] });
  } catch (err) {
    return publicError(routeLabel, err, "Failed to fetch page");
  }
}

export async function publicSocialResponse(routeLabel = "[/api/content/social]") {
  try {
    const data = await getPublicSocialLinks();
    return NextResponse.json({ data });
  } catch (err) {
    return publicError(routeLabel, err, "Failed to fetch social links");
  }
}
