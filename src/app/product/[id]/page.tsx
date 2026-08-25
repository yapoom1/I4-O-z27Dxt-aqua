import React from "react";
import { notFound } from "next/navigation";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import ProductInteractiveSection from "@/components/ProductInteractiveSection";
import { getProductById } from "@/services/saleor";
import styles from "./page.module.css";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(decodeURIComponent(id));

  if (!product) {
    notFound();
  }

  return (
    <div className={styles.pageWrapper}>
      <ProductDetailsHeader />
      <ProductInteractiveSection product={product} />
    </div>
  );
}
