import { NextResponse } from "next/server";
import { getCategories } from "@/services/saleor";

export async function GET() {
  try {
    const categories = await getCategories(20);
    if (categories && categories.length > 0) {
      return NextResponse.json(categories);
    }
    return NextResponse.json([
      { id: "default-category", name: "Default Category", slug: "default-category", emoji: "📦" }
    ]);
  } catch (error) {
    console.error("API Route /api/categories error:", error);
    return NextResponse.json([
      { id: "default-category", name: "Default Category", slug: "default-category", emoji: "📦" }
    ]);
  }
}
