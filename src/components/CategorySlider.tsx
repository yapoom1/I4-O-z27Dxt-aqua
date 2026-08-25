"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CategorySlider.module.css";

import { SaleorCategory } from "@/services/saleor";

const DEFAULT_CATEGORIES: SaleorCategory[] = [
  { id: "honey", name: "Honey", slug: "honey", emoji: "🍯" },
  { id: "dry-fish", name: "Dry Fish", slug: "dry-fish", emoji: "🐟" },
  { id: "meat", name: "Dry Meat", slug: "meat", emoji: "🥩" },
  { id: "traditional", name: "Traditional", slug: "traditional", emoji: "🌿" },
];

interface CategorySliderProps {
  categories?: SaleorCategory[];
}

export default function CategorySlider({ categories }: CategorySliderProps) {
  const router = useRouter();
  const displayCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const [activeCategory, setActiveCategory] = useState(displayCategories[0]?.id || "");

  const handleCategoryClick = (id: string, slug?: string) => {
    setActiveCategory(id);
    router.push(`/products?category=${encodeURIComponent(slug || id)}`);
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={`${styles.slider} no-scrollbar`}>
        {displayCategories.map((category) => {
          const isActive = category.id === activeCategory;
          return (
            <button
              key={category.id}
              className={`${styles.pill} ${isActive ? styles.activePill : styles.inactivePill}`}
              onClick={() => handleCategoryClick(category.id, category.slug)}
            >
              <span className={styles.emojiCircle}>
                {category.emoji}
              </span>
              <span className={styles.name}>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
