"use client";

import React, { useState, useMemo, useEffect } from "react";
import ProductCard from "./ProductCard";
import styles from "./ProductCatalog.module.css";
import { Product } from "@/data/products";
import { PackageSearch } from "lucide-react";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

interface ProductCatalogProps {
  initialProducts: Product[];
}

export default function ProductCatalog({ initialProducts }: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Read initial query params and listen to global search events
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get("q") || "");
      setSortBy((params.get("sort") || "default") as SortOption);

      const handleGlobalSearch = (e: Event) => {
        const customEvent = e as CustomEvent<{ q: string; sort: SortOption }>;
        setSearchQuery(customEvent.detail.q || "");
        setSortBy(customEvent.detail.sort || "default");
      };

      window.addEventListener("global-search", handleGlobalSearch);
      return () => {
        window.removeEventListener("global-search", handleGlobalSearch);
      };
    }
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-desc":
        result.sort((a, b) => b.numericPrice - a.numericPrice);
        break;
      case "price-asc":
        result.sort((a, b) => a.numericPrice - b.numericPrice);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "default":
      default:
        // Keep initial order
        break;
    }

    return result;
  }, [initialProducts, searchQuery, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSortBy("default");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      url.searchParams.delete("sort");
      window.history.replaceState({}, "", url.toString());

      // Sync header search inputs
      window.dispatchEvent(new CustomEvent("global-search", { detail: { q: "", sort: "default" } }));
    }
  };

  return (
    <div className={styles.catalogWrapper}>
      {/* Results Count / Info Bar if filtering */}
      {(searchQuery.trim() || sortBy !== "default") && (
        <div className={styles.filterStatus}>
          <span>
            Showing <strong>{filteredAndSortedProducts.length}</strong>{" "}
            {filteredAndSortedProducts.length === 1 ? "product" : "products"}
          </span>
        </div>
      )}

      {/* Product Grid or Empty State */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className={styles.gridContainer}>
          <div className={styles.grid}>
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrapper}>
            <PackageSearch size={40} className={styles.emptyIcon} />
          </div>
          <h3 className={styles.emptyTitle}>No products found</h3>
          <p className={styles.emptyText}>
            We couldn&apos;t find any RO units matching &quot;{searchQuery}&quot;
          </p>
          <button
            type="button"
            className={styles.resetSearchBtn}
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
