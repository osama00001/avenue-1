import { NextResponse } from "next/server";
import {
  fetchSiteContentPage,
  removeSiteContentPage,
  updateSiteContentPage,
} from "@/lib/siteContent";
import {
  authorizeSiteContentRequest,
  siteContentErrorResponse,
} from "@/lib/siteContentRoute";

export async function GET(req, { params }) {
  const gate = await authorizeSiteContentRequest(req);
  if (gate.error) return gate.error;

  const { id } = await params;

  try {
    const data = await fetchSiteContentPage(id);
    if (!data) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    return siteContentErrorResponse(err, "Failed to load page");
  }
}

export async function PUT(req, { params }) {
  const gate = await authorizeSiteContentRequest(req);
  if (gate.error) return gate.error;

  const { id } = await params;

  try {
    const body = await req.json();
    const data = await updateSiteContentPage(id, body);
    return NextResponse.json({ data });
  } catch (err) {
    return siteContentErrorResponse(err, "Failed to update page");
  }
}

export async function DELETE(req, { params }) {
  const gate = await authorizeSiteContentRequest(req);
  if (gate.error) return gate.error;

  const { id } = await params;

  try {
    await removeSiteContentPage(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return siteContentErrorResponse(err, "Failed to delete page");
  }
}
