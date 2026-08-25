"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, HelpCircle, Check, MapPin, CreditCard } from "lucide-react";
import styles from "./page.module.css";

interface OrderItem {
  name: string;
  price: string;
  image: string;
  size: string;
  quantity: number;
}

interface OrderDetails {
  id: string;
  date: string;
  time: string;
  status: string;
  subtotal: string;
  shipping: string;
  total: string;
  address: {
    name: string;
    street: string;
    cityState: string;
    phone: string;
  };
  payment: {
    type: string;
    cardNo: string;
  };
  steps: {
    title: string;
    time?: string;
    completed: boolean;
    active?: boolean;
  }[];
  items: OrderItem[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (data.success && data.order) {
          const rawOrder = data.order;
          
          const createdDate = new Date(rawOrder.created);
          const dateStr = createdDate.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });
          const timeStr = createdDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          });

          // Price Calculation
          const totalVal = rawOrder.total?.gross?.amount || 0;
          const isFreeShipping = totalVal > 40;
          const shippingVal = isFreeShipping ? 0 : 5;
          const subtotalVal = Math.max(0, totalVal - shippingVal);

          // Steps Mapping
          const isCancelled = rawOrder.status === "CANCELED";
          const isFulfilled = rawOrder.status === "FULFILLED";

          const steps = isCancelled ? [
            { title: "Order Placed", time: dateStr + ", " + timeStr, completed: true },
            { title: "Cancelled", time: "Processing Cancel", completed: true, active: true }
          ] : [
            { title: "Order Placed", time: dateStr + ", " + timeStr, completed: true },
            { title: "Payment Confirmed", time: dateStr + ", " + timeStr, completed: true },
            { title: "Processed & Packed", completed: isFulfilled || !isCancelled },
            { title: "In Transit", completed: isFulfilled, active: !isFulfilled },
            { title: "Delivered", completed: isFulfilled, active: isFulfilled }
          ];

          // Address Mapping
          const addr = rawOrder.shippingAddress || {};
          const address = {
            name: `${addr.firstName || "Guest"} ${addr.lastName || "Customer"}`,
            street: addr.streetAddress1 || "No street address provided",
            cityState: `${addr.city || ""}, ${addr.postalCode || ""}, ${addr.country?.code || ""}`,
            phone: addr.phone || "N/A"
          };

          // Items Mapping
          const items = (rawOrder.lines || []).map((line: any): OrderItem => ({
            name: line.productName || "Product Item",
            price: `$${(line.unitPrice?.gross?.amount || 0).toFixed(2)}`,
            image: line.thumbnail?.url || "/images/placeholder.png",
            size: line.variantName || "Standard",
            quantity: line.quantity || 1
          }));

          setOrder({
            id: rawOrder.id,
            date: dateStr,
            time: timeStr,
            status: rawOrder.status,
            subtotal: `$${subtotalVal.toFixed(2)}`,
            shipping: isFreeShipping ? "Free" : `$${shippingVal.toFixed(2)}`,
            total: `$${totalVal.toFixed(2)}`,
            address,
            payment: {
              type: "Razorpay Secure",
              cardNo: "Net Banking / Wallet"
            },
            steps,
            items
          });
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <MobileContainer>
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.iconButton} aria-label="Go back">
            <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
          </button>
          <h2 className={styles.title}>Order Details</h2>
        </header>
        <main className={styles.mainContent}>
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Loading order details...</p>
          </div>
        </main>
        <BottomNav />
      </MobileContainer>
    );
  }

  if (!order) {
    return (
      <MobileContainer>
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.iconButton} aria-label="Go back">
            <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
          </button>
          <h2 className={styles.title}>Order Details</h2>
        </header>
        <main className={styles.mainContent}>
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Order not found.</p>
          </div>
        </main>
        <BottomNav />
      </MobileContainer>
    );
  }

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
        <h2 className={styles.title}>Order Details</h2>
        <button
          onClick={() => alert("Connecting with order customer support chat...")}
          className={styles.iconButton}
          aria-label="Support Help"
        >
          <HelpCircle size={20} strokeWidth={1.8} className={styles.icon} />
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.responsiveWrapper}>
          
          {/* Left Column - Stepper timeline & Items list */}
          <div className={styles.leftCol}>
            {/* Tracking Stepper */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Tracking Status</h3>
                <span className={styles.orderTag}>#{order.id.replace(/[^0-9]/g, "").substring(0, 8) || order.id}</span>
              </div>

              <div className={styles.stepper}>
                {order.steps.map((step, idx) => (
                  <div key={idx} className={styles.stepRow}>
                    <div className={styles.indicatorCol}>
                      <div
                        className={`${styles.circle} ${
                          step.completed
                            ? step.active
                              ? styles.circleActive
                              : styles.circleCompleted
                            : styles.circlePending
                        }`}
                      >
                        {step.completed && !step.active && <Check size={12} strokeWidth={3} />}
                        {step.active && <div className={styles.innerDot} />}
                      </div>
                      {idx < order.steps.length - 1 && (
                        <div
                          className={`${styles.line} ${
                            step.completed && order.steps[idx + 1].completed
                              ? styles.lineCompleted
                              : styles.linePending
                          }`}
                        />
                      )}
                    </div>
                    <div className={styles.stepMeta}>
                      <span
                        className={`${styles.stepTitle} ${
                          step.active ? styles.titleActive : ""
                        }`}
                      >
                        {step.title}
                      </span>
                      {step.time && <span className={styles.stepTime}>{step.time}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchased Items List */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Purchased Items</h3>
              <div className={styles.itemsList}>
                {order.items.map((item, idx) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemImageWrapper}>
                      {item.image && item.image !== "!" ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                          className={styles.itemImage}
                        />
                      ) : (
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            backgroundColor: "var(--input-bg)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "var(--text-secondary)",
                            borderRadius: "8px",
                            userSelect: "none"
                          }}
                        >
                          !
                        </div>
                      )}
                    </div>
                    <div className={styles.itemMeta}>
                      <h4 className={styles.itemName}>{item.name}</h4>
                      <span className={styles.itemSpecs}>
                        Weight: {item.size} • Qty: {item.quantity}
                      </span>
                    </div>
                    <span className={styles.itemPrice}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Address, Payments, Financial details */}
          <div className={styles.rightCol}>
            {/* Delivery address */}
            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <MapPin size={18} strokeWidth={2} className={styles.sectionIcon} />
                <h3 className={styles.cardTitleInline}>Shipping Address</h3>
              </div>
              <div className={styles.addressMeta}>
                <h4 className={styles.addressName}>{order.address.name}</h4>
                <p className={styles.addressText}>{order.address.street}</p>
                <p className={styles.addressText}>{order.address.cityState}</p>
                <p className={styles.addressPhone}>Phone: {order.address.phone}</p>
              </div>
            </div>

            {/* Payment method */}
            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <CreditCard size={18} strokeWidth={2} className={styles.sectionIcon} />
                <h3 className={styles.cardTitleInline}>Payment Method</h3>
              </div>
              <div className={styles.paymentMeta}>
                <span className={styles.cardType}>{order.payment.type}</span>
                <span className={styles.cardNo}>{order.payment.cardNo}</span>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Price Details</h3>
              <div className={styles.priceSummary}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Subtotal</span>
                  <span className={styles.priceValue}>{order.subtotal}</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Delivery Charges</span>
                  <span className={styles.priceValue}>{order.shipping}</span>
                </div>
                <div className={`${styles.priceRow} ${styles.totalRow}`}>
                  <span className={styles.totalLabel}>Total Amount</span>
                  <span className={styles.totalValue}>{order.total}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
