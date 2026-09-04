import { NextRequest, NextResponse } from "next/server";
import { incrementProductViews } from "@/services/saleor";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const updatedViews = await incrementProductViews(id);
    return NextResponse.json({ success: true, views: updatedViews });
  } catch (err: any) {
    console.error("Failed to increment views:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Support GET as well for simple beacon / prefetch
  return POST(request, { params });
}
