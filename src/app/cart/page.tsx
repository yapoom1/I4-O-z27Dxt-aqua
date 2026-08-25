"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Minus, X, ChevronLeft, ShoppingBag, Check, Trash2 } from "lucide-react";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

export default function MobileCartPage() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingCost,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    addresses,
    selectedAddressId,
    selectAddress,
    isLoggedIn,
    setLoginModalOpen,
  } = useCart();

  // Env Checkout Policy flags
  const isOtpMandatory = process.env.NEXT_PUBLIC_CHECKOUT_OTP_MANDATORY === "true";
  const isSignupOtpMandatory = process.env.NEXT_PUBLIC_SIGNUP_OTP_MANDATORY === "true";

  const [promoCode, setPromoCode] = useState("");
  const [isSelectingAddress, setIsSelectingAddress] = useState(false);

  // Guest Information States
  const [guestPhone, setGuestPhone] = useState("");
  const [createAccountOpt, setCreateAccountOpt] = useState(false);
  const [emailOffers, setEmailOffers] = useState(false);

  // Guest Shipping Address States
  const [guestName, setGuestName] = useState("");
  const [guestStreet, setGuestStreet] = useState("");
  const [guestCityState, setGuestCityState] = useState("");
  const [guestCountry, setGuestCountry] = useState("UK");

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses.find((a) => a.isDefault) || addresses[0];

  const totalAmount = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await applyCoupon(promoCode);
    if (success) {
      alert(`Promo code ${promoCode.toUpperCase()} applied!`);
    }
  };

  // Helper to load Razorpay Checkout Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (isLoggedIn) {
      if (addresses.length === 0) {
        alert("Please add a shipping address in your profile before checking out.");
        router.push("/addresses");
        return;
      }
    } else {
      // Guest checkout controls
      if (isOtpMandatory) {
        alert("OTP Verification is required to check out. Opening login...");
        setLoginModalOpen(true);
        return;
      }

      // Validate guest details
      if (!guestPhone || !guestName || !guestStreet || !guestCityState || !guestCountry) {
        alert("Please fill out all contact details and shipping address fields.");
        return;
      }
    }

    // 1. Load Razorpay Script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Failed to load Razorpay payment gateway. Please check your internet connection.");
      return;
    }

    try {
      // 2. Call local API to create Razorpay Order
      const cartItemsPayload = cartItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }));

      const resOrder = await fetch("/api/checkout/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          checkoutId: selectedAddressId || undefined
        })
      });

      const orderData = await resOrder.json();
      if (!orderData.success) {
        alert("Razorpay payment initialization failed. Please try again.");
        return;
      }

      // Parse first and last names for shipping address payload
      const firstName = isLoggedIn 
        ? (selectedAddress?.name?.split(" ")[0] || "Customer") 
        : (guestName.split(" ")[0] || "Guest");
      const lastName = isLoggedIn 
        ? (selectedAddress?.name?.split(" ").slice(1).join(" ") || "") 
        : (guestName.split(" ").slice(1).join(" ") || "");

      const addressInputObject = isLoggedIn ? {
        firstName,
        lastName,
        streetAddress1: selectedAddress?.street || "",
        city: selectedAddress?.cityState?.split(",")[0]?.trim() || "",
        postalCode: selectedAddress?.cityState?.match(/\b\d{5}\b/)?.[0] || "00000",
        country: selectedAddress?.country || "UK",
        phone: selectedAddress?.phone || "0000000000"
      } : {
        firstName,
        lastName,
        streetAddress1: guestStreet,
        city: guestCityState.split(",")[0]?.trim() || "",
        postalCode: guestCityState.match(/\b\d{5}\b/)?.[0] || "00000",
        country: guestCountry,
        phone: guestPhone
      };

      // 3. Setup Razorpay Checkout parameters
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "AquaCare Hi-Tech",
          description: "Secure Order Checkout",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Trigger Saleor Checkout completion
            const completeRes = await fetch("/api/checkout/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                checkoutId: isLoggedIn ? (selectedAddressId || undefined) : undefined,
                items: !isLoggedIn ? cartItemsPayload : undefined,
                phone: isLoggedIn ? (selectedAddress?.phone || "0000000000") : guestPhone,
                address: addressInputObject,
                paymentInfo: {
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature
                }
              })
            });

            const completeData = await completeRes.json();
            if (completeData.success) {
              alert(`Order placed successfully! Order #${completeData.orderNumber}`);
              
              // Clear current local/cookie cart
              // (Reload or redirecting will auto-fetch clean checkout)
              router.push(`/order/${completeData.orderId}`);
            } else {
              alert(`Order placement failed: ${completeData.error || "Internal Error"}`);
            }
          } catch (err: any) {
            console.error("Saleor order creation error:", err);
            alert("Payment processed, but order creation failed. Please contact support.");
          }
        },
        prefill: {
          name: isLoggedIn ? (selectedAddress?.name || "") : guestName,
          contact: isLoggedIn ? (selectedAddress?.phone || "") : guestPhone
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay setup error:", err);
      alert(`Razorpay checkout initialization failed: ${err.message}`);
    }
  };

  return (
    <MobileContainer>
      {/* Header bar */}
      <header className={styles.header}>
        <button
          onClick={() => router.back()}
          className={styles.iconButton}
          aria-label="Go back"
        >
          <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
        <h2 className={styles.title}>Cart</h2>
        <button className={styles.iconButton} aria-label="Cart Overview">
          <ShoppingBag size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
      </header>

      <main className={styles.mainContent}>
        {cartItems.length > 0 ? (
          <>
            {/* Cart Items */}
            <div className={styles.itemsList}>
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className={styles.cartItem}>
                  {/* Image Container with Delete Overlay */}
                  <div className={styles.imageContainer}>
                    {item.image && item.image !== "!" ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={90}
                        height={100}
                        className={styles.itemImage}
                      />
                    ) : (
                      <div
                        style={{
                          width: 90,
                          height: 100,
                          backgroundColor: "var(--input-bg)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "24px",
                          fontWeight: 700,
                          color: "var(--text-secondary)",
                          borderRadius: "var(--radius-md)",
                          userSelect: "none"
                        }}
                      >
                        !
                      </div>
                    )}
                    <button
                      onClick={() => removeFromCart(item.id, item.size, item.color)}
                      className={styles.removeButton}
                      aria-label="Remove item"
                    >
                      <X size={10} strokeWidth={3} className={styles.closeIcon} />
                    </button>
                  </div>

                  {/* Details Info */}
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemSubtitle}>{item.subtitle}</p>
                    <span className={styles.itemSize}>{item.size}</span>
                    
                    <div className={styles.priceRow}>
                      <span className={styles.itemPrice}>{item.price}</span>
                      {/* Quantity Controls */}
                      <div className={styles.quantityControls}>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          className={styles.qtyBtn}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} strokeWidth={3} />
                        </button>
                        <span className={styles.qtyText}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          className={styles.qtyBtn}
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            {!appliedCoupon ? (
              <form onSubmit={handleApplyPromo} className={styles.promoForm}>
                <input
                  type="text"
                  placeholder="Enter Discount code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className={styles.promoInput}
                />
                <button type="submit" className={styles.promoButton}>
                  Apply code
                </button>
              </form>
            ) : (
              <div className={styles.activeCouponAlert}>
                <div className={styles.activeAlertLeft}>
                  <Check size={14} className={styles.activeCheck} strokeWidth={3} />
                  <span className={styles.activeText}>
                    Coupon <strong>{appliedCoupon}</strong> applied (-${discountAmount.toFixed(2)})
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className={styles.removeCouponBtn}
                  title="Remove applied coupon"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className={styles.couponsLinkContainer}>
              <button
                type="button"
                className={styles.couponsLink}
                onClick={() => router.push("/coupons")}
              >
                View Available Coupons
              </button>
            </div>

            {/* Authentication / Contact flow */}
            {!isLoggedIn && (
              <>
                {isOtpMandatory ? (
                  <div className={styles.loginWall}>
                    <p className={styles.loginWallText}>OTP verification is required to proceed with purchase.</p>
                    <button
                      className={styles.loginWallBtn}
                      type="button"
                      onClick={() => setLoginModalOpen(true)}
                    >
                      Log in / Verify OTP
                    </button>
                  </div>
                ) : (
                  <div className={styles.guestSection}>
                    <div className={styles.guestSectionHeader}>
                      <h4 className={styles.sectionTitle}>Contact</h4>
                      <div className={styles.loginOffer}>
                        <span>Have an account?</span>
                        <button
                          type="button"
                          className={styles.loginBtnLink}
                          onClick={() => setLoginModalOpen(true)}
                        >
                          Log in
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Phone number</label>
                      <input
                        type="tel"
                        placeholder="e.g. +44 7911 123456"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className={styles.guestInput}
                        required
                      />
                    </div>

                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={createAccountOpt}
                          onChange={(e) => setCreateAccountOpt(e.target.checked)}
                          className={styles.checkboxInput}
                        />
                        <span>Create an account for faster checkout next time</span>
                      </label>
                    </div>

                    {createAccountOpt && (
                      <div className={styles.accountCreationSubForm}>
                        {isSignupOtpMandatory ? (
                          <p className={styles.otpNotice}>An OTP will be sent to confirm registration upon proceeding.</p>
                        ) : (
                          <p className={styles.otpNotice}>Your phone number will be used as your account login password.</p>
                        )}
                      </div>
                    )}

                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={emailOffers}
                          onChange={(e) => setEmailOffers(e.target.checked)}
                          className={styles.checkboxInput}
                        />
                        <span>Email me with news and offers</span>
                      </label>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Shipping Address Section */}
            {(isLoggedIn || (!isLoggedIn && !isOtpMandatory)) && (
              <div className={styles.addressSection}>
                {isLoggedIn ? (
                  <>
                    <div className={styles.sectionHeader}>
                      <h4 className={styles.sectionTitle}>Shipping Address</h4>
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          className={styles.changeAddressBtn}
                          onClick={() => setIsSelectingAddress(!isSelectingAddress)}
                        >
                          {isSelectingAddress ? "Cancel" : "Change"}
                        </button>
                      )}
                    </div>

                    {addresses.length === 0 ? (
                      <div className={styles.noAddressBox}>
                        <p className={styles.noAddressText}>No shipping addresses saved.</p>
                        <button
                          type="button"
                          className={styles.addAddressLink}
                          onClick={() => router.push("/addresses")}
                        >
                          Add Address
                        </button>
                      </div>
                    ) : (
                      <>
                        {selectedAddress && (
                          <div className={styles.selectedAddressCard}>
                            <div className={styles.selectedHeader}>
                              <span className={styles.selectedName}>{selectedAddress.name}</span>
                              {selectedAddress.isDefault && (
                                <span className={styles.miniBadge}>Default</span>
                              )}
                            </div>
                            <p className={styles.selectedStreet}>{selectedAddress.street}</p>
                            <p className={styles.selectedCity}>{selectedAddress.cityState}</p>
                          </div>
                        )}

                        {isSelectingAddress && (
                          <div className={styles.otherAddressesSection}>
                            <span className={styles.otherAddressesTitle}>Choose another address:</span>
                            {addresses.filter((addr) => addr.id !== selectedAddress?.id).length === 0 ? (
                              <p className={styles.noOtherText}>No other addresses saved.</p>
                            ) : (
                              <div className={styles.addressSelectorList}>
                                {addresses
                                  .filter((addr) => addr.id !== selectedAddress?.id)
                                  .map((addr) => (
                                    <div
                                      key={addr.id}
                                      className={styles.selectorCard}
                                      onClick={() => {
                                        selectAddress(addr.id);
                                        setIsSelectingAddress(false);
                                      }}
                                    >
                                      <div className={styles.selectorHeader}>
                                        <span className={styles.selectorName}>{addr.name}</span>
                                        {addr.isDefault && <span className={styles.miniBadge}>Default</span>}
                                      </div>
                                      <p className={styles.selectorStreet}>{addr.street}</p>
                                      <p className={styles.selectorCity}>{addr.cityState}</p>
                                    </div>
                                  ))}
                              </div>
                            )}
                            <button
                              type="button"
                              className={styles.manageAddressBtnInline}
                              onClick={() => router.push("/addresses")}
                            >
                              Manage Addresses
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <h4 className={styles.sectionTitle} style={{ marginBottom: "12px" }}>Shipping Address</h4>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Full name</label>
                        <input
                          type="text"
                          placeholder="First and last name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className={styles.guestInput}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Street address</label>
                        <input
                          type="text"
                          placeholder="Apartment, suite, unit, building, street"
                          value={guestStreet}
                          onChange={(e) => setGuestStreet(e.target.value)}
                          className={styles.guestInput}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>City, State & Zip Code</label>
                        <input
                          type="text"
                          placeholder="London, NW1 6XE"
                          value={guestCityState}
                          onChange={(e) => setGuestCityState(e.target.value)}
                          className={styles.guestInput}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Country</label>
                        <input
                          type="text"
                          placeholder="UK"
                          value={guestCountry}
                          onChange={(e) => setGuestCountry(e.target.value)}
                          className={styles.guestInput}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Price Breakdowns */}
            <div className={styles.pricingSummary}>
              <div className={styles.summaryRow}>
                <span>Sub total:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className={styles.summaryRow}>
                  <span>Discount ({appliedCoupon}):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Shipping:</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Checkout CTA */}
            <div className={styles.actionContainer}>
              <button
                className={styles.checkoutBtn}
                type="button"
                onClick={handleCheckout}
              >
                Proceed to checkout
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>Your cart is empty</p>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
