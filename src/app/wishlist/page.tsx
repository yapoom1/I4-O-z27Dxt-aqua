"use client";

import React from "react";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { useWishlist } from "@/context/WishlistContext";
import { PRODUCTS } from "@/data/products";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const router = useRouter();

  // Find all products that are in the global wishlist
  const favoritedProducts = PRODUCTS.filter((product) =>
    wishlist.includes(product.id)
  );

  return (
    <MobileContainer>
      <ProductDetailsHeader title="My Wishlist" />
      
      <main className={styles.mainContent}>
        {favoritedProducts.length > 0 ? (
          <div className={styles.grid}>
            {favoritedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <Heart size={44} className={styles.emptyIcon} fill="none" strokeWidth={1.8} />
            </div>
            <h2 className={styles.emptyTitle}>Your Wishlist is Empty</h2>
            <p className={styles.emptyText}>
              Tap the heart icon on any water purifier to add it to your wishlist.
            </p>
            <button
              onClick={() => router.push("/")}
              className={styles.exploreBtn}
            >
              Explore Products
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
