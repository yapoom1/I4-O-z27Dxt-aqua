"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Plus, Minus } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import DetailsAddToCart from "./DetailsAddToCart";
import { Product, ProductVariant } from "@/data/products";
import { useCart } from "@/context/CartContext";
import layoutStyles from "@/app/product/[id]/page.module.css";
import styles from "./ProductInteractiveSection.module.css";

interface ProductInteractiveSectionProps {
  product: Product;
}

export default function ProductInteractiveSection({ product }: ProductInteractiveSectionProps) {
  const { cartItems, updateQuantity } = useCart();
  
  console.log("Cart Items in Product Page:", cartItems);
  console.log("Current Product ID:", product.id);

  const addedVariantsInCart = cartItems.filter(
    (item) => item.productId === product.id || item.name === product.name
  );
  console.log("Filtered added variants:", addedVariantsInCart);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [displayPrice, setDisplayPrice] = useState<string>(product.price);

  // Initialize selected options based on variants
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      // Find the first variant that has sizes or colors
      const firstVariant = product.variants[0];
      setSelectedVariant(firstVariant);
      setDisplayPrice(firstVariant.price);
      if (firstVariant.image) {
        setActiveImage(firstVariant.image);
      }

      // Collect initial size/color from the first variant
      const initialSize = firstVariant.sizes[0] || product.sizes[0] || "";
      const initialColor = firstVariant.colors[0] || product.colors[0] || "";
      setSelectedSize(initialSize);
      setSelectedColor(initialColor);
    } else {
      setSelectedSize(product.sizes[0] || "");
      setSelectedColor(product.colors[0] || "");
    }
  }, [product]);

  // Update selected variant when size or color changes
  useEffect(() => {
    if (!product.variants || product.variants.length === 0) return;

    // Attempt to match size AND color
    let match = product.variants.find((v) => {
      const matchesSize = selectedSize ? v.sizes.includes(selectedSize) : true;
      const matchesColor = selectedColor ? v.colors.includes(selectedColor) : true;
      return matchesSize && matchesColor;
    });

    // Fallback 1: match size only
    if (!match && selectedSize) {
      match = product.variants.find((v) => v.sizes.includes(selectedSize));
    }

    // Fallback 2: match color only
    if (!match && selectedColor) {
      match = product.variants.find((v) => v.colors.includes(selectedColor));
    }

    if (match) {
      setSelectedVariant(match);
      setDisplayPrice(match.price);
      if (match.image) {
        setActiveImage(match.image);
      }
    }
  }, [selectedSize, selectedColor, product.variants]);

  const fullStarsCount = Math.floor(product.rating);

  return (
    <main className={layoutStyles.mainContent}>
      {/* Left Column - Product Image & Gallery */}
      <div className={layoutStyles.imageBlock}>
        <div className={layoutStyles.imageCard}>
          {activeImage ? (
            <Image
              src={activeImage}
              alt={product.name}
              width={400}
              height={420}
              className={layoutStyles.productImage}
              style={{
                viewTransitionName: `product-image-${product.id}`,
              } as React.CSSProperties}
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
              fontSize: "96px",
              fontWeight: 700,
              color: "var(--text-secondary)",
              userSelect: "none"
            }}>!</div>
          )}
          {product.limited && (
            <span className={layoutStyles.limitedBadge}>LIMITED</span>
          )}
          <FavoriteButton productId={product.id} />
        </div>

        {/* Thumbnail Image Gallery */}
        {product.images && product.images.length > 1 && (
          <div className={styles.gallery}>
            {product.images.map((imgUrl, index) => {
              const isActive = activeImage === imgUrl;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`${styles.thumbnailWrapper} ${isActive ? styles.activeThumbnail : ""}`}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.name} gallery image ${index + 1}`}
                    width={70}
                    height={70}
                    className={styles.thumbnail}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column - Product Details & Selectors */}
      <div className={layoutStyles.infoBlock}>
        <div className={layoutStyles.titlePriceRow}>
          <div>
            <h1 className={layoutStyles.title}>{product.name}</h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
              {product.subtitle || "Domestic RO Water Purifier"}
            </p>
            {selectedVariant && selectedVariant.name !== product.name && (
              <span className={styles.variantLabel}>
                Variant: {selectedVariant.name}
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
            {product.originalPrice && (
              <span style={{ fontSize: "15px", color: "var(--text-secondary)", textDecoration: "line-through", opacity: 0.75 }}>
                {product.originalPrice}
              </span>
            )}
            <span className={layoutStyles.price} style={{ color: "#ff3b30" }}>{displayPrice}</span>
          </div>
        </div>

        <p className={layoutStyles.description}>{product.description}</p>

        <div className={layoutStyles.ratingRow}>
          <div className={layoutStyles.stars}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={15}
                fill={i < fullStarsCount ? "#ffcc00" : "none"}
                stroke={i < fullStarsCount ? "#ffcc00" : "#d1d1d6"}
                strokeWidth={2.5}
              />
            ))}
          </div>
          <span className={layoutStyles.ratingText}>
            {product.rating} ({product.reviewsCount} reviews)
          </span>
        </div>

        {/* Product Key Specifications */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
          padding: "14px",
          backgroundColor: "var(--card-bg)",
          borderRadius: "16px",
          marginBottom: "20px",
          border: "1px solid rgba(0, 0, 0, 0.04)"
        }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            <span style={{ fontWeight: 600, color: "var(--text-primary)", display: "block" }}>Technology</span>
            RO + UV + UF + TDS
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            <span style={{ fontWeight: 600, color: "var(--text-primary)", display: "block" }}>Mounting</span>
            Wall Mounted / Countertop
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            <span style={{ fontWeight: 600, color: "var(--text-primary)", display: "block" }}>Material</span>
            Food-Grade ABS Plastic
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            <span style={{ fontWeight: 600, color: "var(--text-primary)", display: "block" }}>Warranty</span>
            1 Year Complete
          </div>
        </div>

        {/* Dynamic Selectors Row */}
        <div className={layoutStyles.optionsRow}>
          {/* Colors Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className={layoutStyles.optionSection}>
              <h4 className={layoutStyles.optionLabel}>Color / Finish</h4>
              <div className={styles.colorsRow}>
                {product.colors.map((color) => {
                  const isActive = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`${styles.colorCircle} ${isActive ? styles.colorCircleActive : ""}`}
                      aria-label={`Select color ${color}`}
                    >
                      <span
                        className={styles.innerColor}
                        style={{ backgroundColor: color }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes / Capacity Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className={layoutStyles.optionSection}>
              <h4 className={layoutStyles.optionLabel}>Storage Capacity</h4>
              <div className={styles.sizesRow}>
                {product.sizes.map((size) => {
                  const isActive = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`${styles.sizePill} ${isActive ? styles.sizePillActive : styles.sizePillInactive}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Add to Cart Actions */}
        <div className={layoutStyles.actionContainer}>
          <DetailsAddToCart
            id={product.id}
            variantId={selectedVariant?.id || product.id}
            name={product.name}
            price={selectedVariant?.price || product.price}
            numericPrice={selectedVariant?.numericPrice || product.numericPrice}
            image={selectedVariant?.image || product.image || ""}
            size={selectedSize}
            color={selectedColor}
          />
        </div>

        {/* List of Added Variants in Cart */}
        {addedVariantsInCart.length > 0 && (
          <div className={styles.addedVariantsSection}>
            <h4 className={styles.addedVariantsTitle}>Added Variants in Cart</h4>
            <div className={styles.addedVariantsList}>
              {addedVariantsInCart.map((item) => (
                <div key={item.id} className={styles.addedVariantRow}>
                  <div className={styles.addedVariantInfo}>
                    <span className={styles.addedVariantName}>
                      {item.size} {item.color ? `/ ${item.color}` : ""}
                    </span>
                    <span className={styles.addedVariantPrice}>{item.price}</span>
                  </div>

                  <div className={styles.addedVariantQtyControls}>
                    <button
                      className={styles.addedVariantQtyBtn}
                      onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} strokeWidth={2.5} />
                    </button>
                    <span className={styles.addedVariantQtyText}>{item.quantity}</span>
                    <button
                      className={styles.addedVariantQtyBtn}
                      onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
