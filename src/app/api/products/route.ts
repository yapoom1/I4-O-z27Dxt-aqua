import { NextResponse } from "next/server";
import { getProducts } from "@/services/saleor";
import { PRODUCTS } from "@/data/products";

export async function GET() {
  try {
    const products = await getProducts(24);
    if (products && products.length > 0) {
      return NextResponse.json(products);
    }
    return NextResponse.json(PRODUCTS);
  } catch (error) {
    console.error("API Route /api/products error:", error);
    return NextResponse.json(PRODUCTS);
  }
}
