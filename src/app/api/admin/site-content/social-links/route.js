import { NextResponse } from "next/server";
import {
  fetchSiteContentSocialLinks,
  saveSiteContentSocialLinks,
} from "@/lib/siteContent";
import {
  authorizeSiteContentRequest,
  siteContentErrorResponse,
} from "@/lib/siteContentRoute";

export async function GET(req) {
  const gate = await authorizeSiteContentRequest(req);
  if (gate.error) return gate.error;

  try {
    const data = await fetchSiteContentSocialLinks();
    return NextResponse.json({ data });
  } catch (err) {
    return siteContentErrorResponse(err, "Failed to load social links");
  }
}

export async function PUT(req) {
  const gate = await authorizeSiteContentRequest(req);
  if (gate.error) return gate.error;

  try {
    const body = await req.json();
    const links = Array.isArray(body.links) ? body.links : body;
    const data = await saveSiteContentSocialLinks(links);
    return NextResponse.json({ data });
  } catch (err) {
    return siteContentErrorResponse(err, "Failed to save social links");
  }
}
