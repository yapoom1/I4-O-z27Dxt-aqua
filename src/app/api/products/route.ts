import { NextResponse } from "next/server";
import { getProducts, deduplicateProducts } from "@/services/saleor";
import { PRODUCTS } from "@/data/products";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get("first") || "100", 10);
    const products = await getProducts(count);
    if (products && products.length > 0) {
      return NextResponse.json(deduplicateProducts(products));
    }
    return NextResponse.json(deduplicateProducts(PRODUCTS));
  } catch (error) {
    console.error("API Route /api/products error:", error);
    return NextResponse.json(deduplicateProducts(PRODUCTS));
  }
}
