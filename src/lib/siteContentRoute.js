import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/requireAdminApi";
import { connectDB } from "@/lib/db";

export async function authorizeSiteContentRequest(req) {
  const auth = await requireAdminApi(req);
  if (!auth.authorized) {
    return { error: auth.response };
  }

  try {
    await connectDB();
  } catch (err) {
    return {
      error: NextResponse.json(
        { error: err.message || "Database connection failed" },
        { status: 503 }
      ),
    };
  }

  return { auth };
}

export function siteContentErrorResponse(err, fallback = "Site content request failed") {
  console.error("[site-content]", err);
  return NextResponse.json(
    { error: err.message || fallback },
    { status: 500 }
  );
}
