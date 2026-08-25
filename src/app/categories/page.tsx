"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import BottomNav from "@/components/BottomNav";
import { ChevronRight, Loader2 } from "lucide-react";
import styles from "./page.module.css";

interface CategoryData {
  id: string;
  name: string;
  emoji: string;
  count: string;
  gradient: string;
}

export default function AllCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/products").then((res) => res.json())
    ])
      .then(([categoriesData, productsData]) => {
        if (Array.isArray(categoriesData) && Array.isArray(productsData)) {
          const GRADIENTS = [
            "linear-gradient(135deg, #fceecb 0%, #f7d283 100%)", // soft gold
            "linear-gradient(135deg, #d2f1f0 0%, #a2e0df 100%)", // soft aqua
            "linear-gradient(135deg, #fcd9d9 0%, #f6a5a5 100%)", // soft coral
            "linear-gradient(135deg, #d3f3d3 0%, #a3e6a3 100%)", // soft mint
            "linear-gradient(135deg, #e3d9fc 0%, #c4b0f9 100%)", // soft violet
            "linear-gradient(135deg, #ffd9ec 0%, #ffa6d4 100%)", // soft pink
          ];

          const mapped: CategoryData[] = categoriesData.map((c, index) => {
            const productCount = productsData.filter((p) => p.category === c.slug).length;
            return {
              id: c.slug,
              name: c.name,
              emoji: c.emoji,
              count: productCount === 1 ? "1 Item" : `${productCount} Items`,
              gradient: GRADIENTS[index % GRADIENTS.length],
            };
          });
          setCategories(mapped);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch categories client-side:", err);
        setLoading(false);
      });
  }, []);

  const handleCategorySelect = (id: string) => {
    router.push(`/products?category=${encodeURIComponent(id)}`);
  };

  return (
    <MobileContainer>
      <ProductDetailsHeader title="All Categories" />

      <main className={styles.mainContent}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
            <Loader2 className="animate-spin" size={32} style={{ color: "var(--primary-color, #e5a63c)" }} />
          </div>
        ) : categories.length > 0 ? (
          <div className={styles.grid}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={styles.card}
                onClick={() => handleCategorySelect(category.id)}
                style={{ background: category.gradient }}
                type="button"
              >
                <div className={styles.emojiContainer}>
                  <span className={styles.emoji}>{category.emoji}</span>
                </div>
                
                <div className={styles.info}>
                  <h3 className={styles.name}>{category.name}</h3>
                  <span className={styles.count}>{category.count}</span>
                </div>

                <div className={styles.arrowButton}>
                  <ChevronRight size={18} className={styles.arrowIcon} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ color: "var(--text-secondary)" }}>No categories found.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
