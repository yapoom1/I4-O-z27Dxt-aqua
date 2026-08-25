"use client";

import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";
import styles from "./FavoriteButton.module.css";

export default function FavoriteButton({ productId }: { productId: string }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const liked = isInWishlist(productId);
  
  return (
    <button
      className={`${styles.button} ${liked ? styles.liked : ""}`}
      onClick={() => toggleWishlist(productId)}
      aria-label="Like product"
      type="button"
    >
      <Heart
        size={18}
        className={styles.icon}
        fill={liked ? "var(--like-active)" : "none"}
        stroke={liked ? "var(--like-active)" : "currentColor"}
        strokeWidth={2}
      />
    </button>
  );
}
