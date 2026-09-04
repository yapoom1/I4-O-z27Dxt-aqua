"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Plus, Minus, Eye } from "lucide-react";
import styles from "./ProductCard.module.css";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const liked = isInWishlist(product.id);

  const defaultVariant = product.variants?.[0];
  const variantId = defaultVariant?.id || product.id;
  const size = defaultVariant?.sizes?.[0] || product.sizes?.[0] || "Standard";
  const color = defaultVariant?.colors?.[0] || product.colors?.[0] || "";

  // Get current quantity of the default variant from the cart
  const cartItem = cartItems.find((i) => i.id === variantId);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (quantity === 0) {
      addToCart({
        id: variantId,
        variantId,
        productId: product.id,
        name: product.name,
        price: defaultVariant?.price || product.price,
        numericPrice: defaultVariant?.numericPrice || product.numericPrice,
        image: defaultVariant?.image || product.image || "",
        size,
        color
      });
    } else {
      updateQuantity(variantId, size, color, quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (quantity > 0) {
      updateQuantity(variantId, size, color, quantity - 1);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product.id);
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    const doc = document as any;
    if (doc.startViewTransition) {
      doc.startViewTransition(() => {
        router.push(`/product/${product.id}`);
      });
    } else {
      router.push(`/product/${product.id}`);
    }
  };

  return (
    <div className={styles.card}>
      <Link 
        href={`/product/${product.id}`} 
        className={styles.cardLink}
        onClick={handleNavigate}
      >
        <div className={styles.imageWrapper}>
          {product.image ? (
            <>
              <Image
                src={product.image}
                alt={product.name}
                width={180}
                height={190}
                className={styles.productImage}
                style={{
                  viewTransitionName: `product-image-${product.id}`,
                } as React.CSSProperties}
                priority
              />
              <Image
                src={product.image}
                alt={product.name}
                width={180}
                height={190}
                className={styles.hoverImage}
                priority
              />
            </>
          ) : (
            <div className={styles.imagePlaceholder}>!</div>
          )}
          {product.views && product.views > 0 ? (
            <div className={styles.viewsTag}>
              <Eye size={11} />
              <span>{product.views}</span>
            </div>
          ) : null}
        </div>
        <div className={styles.details}>
          <div className={styles.info}>
            <h3 className={styles.title}>{product.name}</h3>
            <p className={styles.subtitle}>{product.subtitle}</p>
            <div className={styles.priceContainer}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap" }}>
                <span className={styles.price}>{product.price}</span>
                {product.originalPrice && product.originalPrice !== product.price && (
                  <span className={styles.originalPrice}>{product.originalPrice}</span>
                )}
                {product.discountPercent && product.discountPercent > 0 && (
                  <span className={styles.discountBadge}>{product.discountPercent}% OFF</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Floating Like Action */}
      <button
        className={`${styles.likeButton} ${liked ? styles.liked : ""}`}
        onClick={handleLike}
        aria-label={liked ? "Unlike product" : "Like product"}
      >
        <Heart
          size={14}
          className={styles.heartIcon}
          fill={liked ? "var(--like-active)" : "none"}
          stroke={liked ? "var(--like-active)" : "currentColor"}
          strokeWidth={2}
        />
      </button>

      {/* Floating Cart Action */}
      <div className={styles.cartActionWrapper}>
        <div className={`${styles.cartWrapper} ${quantity > 0 ? styles.expanded : ""}`}>
          <button
            className={styles.cartButton}
            onClick={handleIncrement}
            aria-label="Add to cart"
            style={{
              opacity: quantity === 0 ? 1 : 0,
              pointerEvents: quantity === 0 ? "auto" : "none",
              transform: quantity === 0 ? "scale(1)" : "scale(0.7)",
            }}
          >
            <ShoppingCart size={15} className={styles.cartIcon} strokeWidth={2.5} />
          </button>
          
          <div
            className={styles.quantitySelector}
            style={{
              opacity: quantity > 0 ? 1 : 0,
              pointerEvents: quantity > 0 ? "auto" : "none",
              transform: quantity > 0 ? "scale(1)" : "scale(0.8)",
            }}
          >
            <button
              className={styles.qtyButton}
              onClick={handleDecrement}
              aria-label="Decrease quantity"
            >
              <Minus size={11} strokeWidth={2.5} />
            </button>
            <span className={styles.quantityText}>{quantity}</span>
            <button
              className={styles.qtyButton}
              onClick={handleIncrement}
              aria-label="Increase quantity"
            >
              <Plus size={11} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
