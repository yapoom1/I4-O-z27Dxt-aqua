"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import BottomNav from "@/components/BottomNav";
import { ArrowUpRight, Loader2 } from "lucide-react";
import styles from "./page.module.css";

interface CollectionData {
  id: string;
  name: string;
  count: string;
  image: string;
  gridClass: string;
}

export default function CategoriesV2Page() {
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/products").then((res) => res.json())
    ])
      .then(([categoriesData, productsData]) => {
        if (Array.isArray(categoriesData) && Array.isArray(productsData)) {
          const GRID_CLASSES = [styles.heroCard, styles.tallCard, styles.squareCard1, styles.tallCard2];
          
          const mapped: CollectionData[] = categoriesData.map((c, index) => {
            const categoryProducts = productsData.filter((p) => p.category === c.slug);
            const count = categoryProducts.length;
            const image = categoryProducts[0]?.image || ""; // first product image or empty
            
            return {
              id: c.slug,
              name: c.name,
              count: count === 1 ? "1 Item" : `${count} Items`,
              image,
              gridClass: GRID_CLASSES[index % GRID_CLASSES.length]
            };
          });
          setCollections(mapped);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch collections client-side:", err);
        setLoading(false);
      });
  }, []);

  const handleSelect = (id: string) => {
    router.push(`/products?category=${encodeURIComponent(id)}`);
  };

  return (
    <MobileContainer>
      <ProductDetailsHeader title="Collections" />

      <main className={styles.mainContent}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
            <Loader2 className="animate-spin" size={32} style={{ color: "var(--primary-color, #e5a63c)" }} />
          </div>
        ) : collections.length > 0 ? (
          <div className={styles.masonryGrid}>
            {collections.map((col) => (
              <button
                key={col.id}
                className={`${styles.card} ${col.gridClass}`}
                onClick={() => handleSelect(col.id)}
                type="button"
              >
                {/* Background Image Wrapper */}
                <div className={styles.imageWrapper}>
                  {col.image ? (
                    <Image
                      src={col.image}
                      alt={col.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={styles.bgImage}
                      priority
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "var(--input-bg)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "48px",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      userSelect: "none",
                      position: "absolute",
                      top: 0,
                      left: 0
                    }}>!</div>
                  )}
                  <div className={styles.overlay} />
                </div>

                {/* Floating Header */}
                <div className={styles.cardHeader}>
                  <span className={styles.itemCount}>{col.count}</span>
                  <div className={styles.arrowIconWrapper}>
                    <ArrowUpRight size={16} strokeWidth={2.5} className={styles.arrowIcon} />
                  </div>
                </div>

                {/* Bottom Footer Title */}
                <div className={styles.cardFooter}>
                  <h3 className={styles.collectionName}>{col.name}</h3>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "var(--text-secondary)" }}>No collections found.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
