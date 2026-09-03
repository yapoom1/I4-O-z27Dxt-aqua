"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import styles from "./page.module.css";

interface OrderItem {
  name: string;
  price: string;
  image: string;
  size: string;
  quantity: number;
}

interface OrderData {
  id: string;
  date: string;
  status: "In Transit" | "Delivered" | "Cancelled";
  total: string;
  items: OrderItem[];
  statusMessage?: string;
  actionText: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Active" | "Completed" | "Cancelled">("Active");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success && data.orders) {
          // Map Saleor orders list into storefront OrderData interface
          const mappedOrders = data.orders.map((order: any): OrderData => {
            const dateStr = new Date(order.created).toLocaleDateString("en-US", {
              month: "long",
              day: "2-digit",
              year: "numeric",
            });

            // Map Saleor statuses: UNFULFILLED -> In Transit, FULFILLED -> Delivered, CANCELED -> Cancelled
            let status: "In Transit" | "Delivered" | "Cancelled" = "In Transit";
            let statusMessage = "Order is processing and preparing for shipping";
            let actionText = "Track Order";

            if (order.status === "FULFILLED") {
              status = "Delivered";
              statusMessage = "Order successfully delivered to destination";
              actionText = "Write Review";
            } else if (order.status === "CANCELED") {
              status = "Cancelled";
              statusMessage = "Order was cancelled";
              actionText = "Contact Support";
            }

            const items = (order.lines || []).map((line: any): OrderItem => {
              let imgUrl = line.thumbnail?.url || "";
              if (imgUrl) {
                imgUrl = imgUrl.replace(/^https?:\/\/[^\/]+\/media\//, "https://aquacare.udayamarketing.in/media/");
              }
              return {
                name: line.productName || "Product Item",
                price: `\u20b9${(line.unitPrice?.gross?.amount || 0).toFixed(0)}`,
                image: imgUrl || "/images/placeholder.png",
                size: line.variantName || "Standard",
                quantity: line.quantity || 1
              };
            });

            const total = `\u20b9${(order.total?.gross?.amount || 0).toFixed(0)}`;

            return {
              id: order.id,
              date: dateStr,
              status,
              total,
              items,
              statusMessage,
              actionText
            };
          });

          setOrders(mappedOrders);
        }
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "Active") return order.status === "In Transit";
    if (activeTab === "Completed") return order.status === "Delivered";
    return order.status === "Cancelled";
  });

  const getStatusClass = (status: string) => {
    if (status === "In Transit") return styles.badgeTransit;
    if (status === "Delivered") return styles.badgeDelivered;
    return styles.badgeCancelled;
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
        <h2 className={styles.title}>My Orders</h2>
        <button
          onClick={() => router.push("/cart")}
          className={styles.iconButton}
          aria-label="Shopping cart"
        >
          <ShoppingBag size={20} strokeWidth={1.8} className={styles.icon} />
        </button>
      </header>

      <main className={styles.mainContent}>
        {/* Filter Tab Buttons */}
        <div className={styles.tabContainer}>
          {(["Active", "Completed", "Cancelled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : styles.tabBtnInactive}`}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders Card Stack */}
        {loading ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className={styles.ordersList}>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={styles.orderCard}
                onClick={() => router.push(`/order/${order.id}`)}
                style={{ cursor: "pointer" }}
              >
                
                {/* Header Information */}
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeft}>
                    <span className={styles.orderId}>#{order.id.replace(/[^0-9]/g, "").substring(0, 8) || order.id}</span>
                    <span className={styles.orderDate}>{order.date}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items Listing Rows */}
                <div className={styles.itemsBlock}>
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
                            unoptimized
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

                {/* Update Log Notes */}
                {order.statusMessage && (
                  <div className={styles.updateLog}>
                    <p className={styles.logText}>
                      <strong>Update:</strong> {order.statusMessage}
                    </p>
                  </div>
                )}

                {/* Totals & Actions Footer */}
                <div className={styles.cardFooter}>
                  <div className={styles.totalBlock}>
                    <span className={styles.totalLabel}>Total Amount</span>
                    <span className={styles.totalValue}>{order.total}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`${order.actionText} clicked for order.`);
                    }}
                    className={styles.actionBtn}
                    type="button"
                  >
                    {order.actionText}
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No orders found in this section.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
