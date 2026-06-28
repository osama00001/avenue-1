import { NextResponse } from "next/server";
import {
  fetchSiteContentSingle,
  saveSiteContentSingle,
  SITE_CONTENT_SINGLES,
} from "@/lib/siteContent";
import {
  authorizeSiteContentRequest,
  siteContentErrorResponse,
} from "@/lib/siteContentRoute";

export async function GET(req, { params }) {
  const gate = await authorizeSiteContentRequest(req);
  if (gate.error) return gate.error;

  const { key } = await params;
  if (!SITE_CONTENT_SINGLES[key]) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  try {
    const data = await fetchSiteContentSingle(key);
    return NextResponse.json({ data });
  } catch (err) {
    return siteContentErrorResponse(err, "Failed to load site content");
  }
}

export async function PUT(req, { params }) {
  const gate = await authorizeSiteContentRequest(req);
  if (gate.error) return gate.error;

  const { key } = await params;
  if (!SITE_CONTENT_SINGLES[key]) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = await saveSiteContentSingle(key, body);
    return NextResponse.json({ data });
  } catch (err) {
    return siteContentErrorResponse(err, "Failed to save site content");
  }
}
