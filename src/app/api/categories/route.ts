import { NextResponse } from "next/server";
import { getCategories } from "@/services/saleor";

const MOCK_CATEGORIES = [
  { id: "honey", name: "Honey", slug: "honey", emoji: "🍯" },
  { id: "dry-fish", name: "Dry Fish", slug: "dry-fish", emoji: "🐟" },
  { id: "meat", name: "Dry Meat", slug: "meat", emoji: "🥩" },
  { id: "traditional", name: "Traditional", slug: "traditional", emoji: "🌿" },
];

export async function GET() {
  try {
    const categories = await getCategories(20);
    if (categories && categories.length > 0) {
      return NextResponse.json(categories);
    }
    return NextResponse.json(MOCK_CATEGORIES);
  } catch (error) {
    console.error("API Route /api/categories error:", error);
    return NextResponse.json(MOCK_CATEGORIES);
  }
}
