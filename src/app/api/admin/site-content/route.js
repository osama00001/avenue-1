import { NextResponse } from "next/server";
import { getSiteContentManifest } from "@/lib/siteContent";
import {
  authorizeSiteContentRequest,
  siteContentErrorResponse,
} from "@/lib/siteContentRoute";

export async function GET(req) {
  const gate = await authorizeSiteContentRequest(req);
  if (gate.error) return gate.error;

  return NextResponse.json({ data: getSiteContentManifest() });
}
