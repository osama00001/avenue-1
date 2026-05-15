import { NextResponse } from "next/server";
import { getStrapiCollection } from "@/lib/strapi";

export async function GET() {
  try {
    const data = await getStrapiCollection(
      "categories",
      "fields[0]=label&fields[1]=slug&fields[2]=description&populate[image]=*"
    );
    return NextResponse.json({ data: data?.data || [] });
  } catch (err) {
    console.error("[/api/strapi/categories] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
