import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getValidToken,
  getUserCheckout,
  createCheckout,
  updateCheckoutEmail,
  updateCheckoutAddress,
  getCheckoutDeliveryMethods,
  updateCheckoutDeliveryMethod,
  completeCheckout
} from "@/services/saleor";

export async function POST(request: Request) {
  try {
    const { checkoutId, items, phone, address, paymentInfo } = await request.json();

    const cookieStore = await cookies();
    const token = await getValidToken(cookieStore);

    let checkout: any = null;

    // 1. Resolve checkout object
    if (token) {
      checkout = await getUserCheckout(token);
    } else if (checkoutId) {
      // Guest with a pre-existing synced checkout ID
      checkout = { id: checkoutId };
    } else if (items && Array.isArray(items) && items.length > 0) {
      // Guest with checkout created dynamically on checkout proceed
      checkout = await createCheckout(undefined, items);
    }

    if (!checkout || !checkout.id) {
      return NextResponse.json({ error: "Checkout session could not be established." }, { status: 400 });
    }

    // 2. Step A: Update email/contact on checkout (mandatory for completing checkout on Saleor)
    if (!token) {
      // Generate clean guest email address from contact phone number (e.g. +91 99999 99999 -> 919999999999@gubera.com)
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const guestEmail = `${cleanPhone || "guest"}_${Date.now()}@gubera.com`;
      await updateCheckoutEmail(undefined, checkout.id, guestEmail);
    }

    // 3. Step B: Assign shipping and billing addresses
    const guestAddress = {
      firstName: address.firstName || "Guest",
      lastName: address.lastName || "Customer",
      streetAddress1: address.streetAddress1,
      city: address.city,
      postalCode: address.postalCode || "00000",
      country: address.country || "UK",
      phone: phone || address.phone || "0000000000"
    };

    // Update Shipping Address
    const shippingRes = await updateCheckoutAddress(token, checkout.id, guestAddress, true);
    if (!shippingRes) {
      console.warn("Shipping address assignment returned null, continuing...");
    }

    // Update Billing Address
    const billingRes = await updateCheckoutAddress(token, checkout.id, guestAddress, false);
    if (!billingRes) {
      console.warn("Billing address assignment returned null, continuing...");
    }

    // 4. Step C: Query and assign the first delivery / shipping method
    const deliveryMethods = await getCheckoutDeliveryMethods(token, checkout.id);
    if (deliveryMethods && deliveryMethods.length > 0) {
      const selectedMethodId = deliveryMethods[0].id;
      await updateCheckoutDeliveryMethod(token, checkout.id, selectedMethodId);
    } else {
      console.warn("No shipping methods available for this checkout.");
    }

    // 5. Step D: Finalize Checkout and Complete Order
    const order = await completeCheckout(token, checkout.id);
    if (!order) {
      return NextResponse.json({ error: "Checkout complete failed on Saleor API." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.number,
      total: order.total?.gross?.amount || 0,
      currency: order.total?.gross?.currency || "USD"
    });
  } catch (error: any) {
    console.error("API /api/checkout/complete error:", error);
    return NextResponse.json({ error: error.message || "Failed to complete checkout" }, { status: 500 });
  }
}
