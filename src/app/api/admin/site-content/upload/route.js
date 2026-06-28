import { NextResponse } from "next/server";
import { uploadSiteContentImage } from "@/lib/siteContent";
import {
  authorizeSiteContentRequest,
  siteContentErrorResponse,
} from "@/lib/siteContentRoute";

export async function POST(req) {
  const gate = await authorizeSiteContentRequest(req);
  if (gate.error) return gate.error;

  try {
    const body = await req.json();
    const data = await uploadSiteContentImage(body);
    return NextResponse.json({ data });
  } catch (err) {
    return siteContentErrorResponse(err, "Failed to upload image");
  }
}
