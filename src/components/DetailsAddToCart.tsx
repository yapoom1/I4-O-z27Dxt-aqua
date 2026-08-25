"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";
import styles from "./DetailsAddToCart.module.css";
import { useCart } from "@/context/CartContext";

interface DetailsAddToCartProps {
  id: string;
  variantId: string;
  name: string;
  price: string;
  numericPrice: number;
  image: string;
  size: string;
  color: string;
}

export default function DetailsAddToCart({
  id,
  variantId,
  name,
  price,
  numericPrice,
  image,
  size,
  color,
}: DetailsAddToCartProps) {
  const { cartItems, addToCart, updateQuantity } = useCart();

  // Find if this specific variant is already in the cart
  const cartItem = cartItems.find((i) => i.id === variantId);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleIncrement = () => {
    if (quantity === 0) {
      addToCart({
        id: variantId,
        variantId,
        productId: id,
        name,
        price,
        numericPrice,
        image: image || "!",
        size,
        color,
      });
    } else {
      updateQuantity(variantId, size, color, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      updateQuantity(variantId, size, color, quantity - 1);
    }
  };

  return (
    <div className={`${styles.container} ${quantity > 0 ? styles.active : ""}`}>
      {/* Main Add Button (Qty is 0) */}
      <button
        className={styles.addButton}
        onClick={handleIncrement}
        style={{
          opacity: quantity === 0 ? 1 : 0,
          pointerEvents: quantity === 0 ? "auto" : "none",
          transform: quantity === 0 ? "scale(1)" : "scale(0.95)",
        }}
      >
        Add to Cart
      </button>

      {/* Adjust quantity (Qty > 0) */}
      <div
        className={styles.quantityControls}
        style={{
          opacity: quantity > 0 ? 1 : 0,
          pointerEvents: quantity > 0 ? "auto" : "none",
          transform: quantity > 0 ? "scale(1)" : "scale(1.05)",
        }}
      >
        <button
          className={styles.qtyButton}
          onClick={handleDecrement}
          aria-label="Decrease quantity"
        >
          <Minus size={16} strokeWidth={2.5} />
        </button>
        <span className={styles.quantityText}>{quantity}</span>
        <button
          className={styles.qtyButton}
          onClick={handleIncrement}
          aria-label="Increase quantity"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
