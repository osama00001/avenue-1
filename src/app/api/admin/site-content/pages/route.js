import { NextResponse } from "next/server";
import {
  createSiteContentPage,
  fetchSiteContentPages,
} from "@/lib/siteContent";
import {
  authorizeSiteContentRequest,
  siteContentErrorResponse,
} from "@/lib/siteContentRoute";

export async function GET(req) {
  const gate = await authorizeSiteContentRequest(req);
  if (gate.error) return gate.error;

  try {
    const data = await fetchSiteContentPages();
    return NextResponse.json({ data });
  } catch (err) {
    return siteContentErrorResponse(err, "Failed to load pages");
  }
}

export async function POST(req) {
  const gate = await authorizeSiteContentRequest(req);
  if (gate.error) return gate.error;

  try {
    const body = await req.json();
    const { title, slug, level, content } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const data = await createSiteContentPage({
      title: title.trim(),
      slug: slug,
      level: Number(level) || 2,
      content: content || "",
    });

    return NextResponse.json({ data });
  } catch (err) {
    return siteContentErrorResponse(err, "Failed to create page");
  }
}
