"use client";

import React from "react";
import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";
import { PRODUCTS, Product } from "@/data/products";

interface ProductGridProps {
  products?: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const displayProducts = products !== undefined ? products : PRODUCTS;
  return (
    <div className={styles.gridContainer}>
      <div className={styles.grid}>
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
