import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAddress, deleteAddressMutation, getValidToken } from "@/services/saleor";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const addressData = await request.json();
    const result = await createAddress(token, addressData);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to create address" }, { status: 400 });
    }

    return NextResponse.json({ success: true, address: result.address });
  } catch (error: any) {
    console.error("API /api/addresses POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create address" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const result = await deleteAddressMutation(token, id);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to delete address" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API /api/addresses DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete address" }, { status: 500 });
  }
}
