"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import styles from "./ProductCatalog.module.css";
import { Product } from "@/data/products";
import { PackageSearch, X } from "lucide-react";
import { deduplicateProducts } from "@/services/saleor";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

interface CategoryDef {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  matcher: (p: Product) => boolean;
}

const CATEGORY_DEFINITIONS: CategoryDef[] = [
  {
    id: "all",
    name: "All Purifiers",
    shortName: "All",
    icon: "💧",
    matcher: () => true,
  },
  {
    id: "alkaline",
    name: "Alkaline RO",
    shortName: "Alkaline",
    icon: "🌿",
    matcher: (p) => {
      const text = (p.name + " " + (p.description || "")).toLowerCase();
      return text.includes("alkaline") || text.includes("alk");
    },
  },
  {
    id: "copper",
    name: "Copper Tech",
    shortName: "Copper",
    icon: "🛡️",
    matcher: (p) => {
      const text = (p.name + " " + (p.description || "")).toLowerCase();
      return text.includes("copper");
    },
  },
  {
    id: "undersink",
    name: "Undersink RO",
    shortName: "Undersink",
    icon: "🚰",
    matcher: (p) => {
      const text = (p.name + " " + (p.description || "")).toLowerCase();
      return text.includes("undersink") || text.includes("under-sink") || text.includes("under sink");
    },
  },
  {
    id: "hot-cold",
    name: "Hot & Cold",
    shortName: "Hot & Cold",
    icon: "☕",
    matcher: (p) => {
      const text = (p.name + " " + (p.description || "")).toLowerCase();
      return text.includes("hot") || text.includes("cold") || text.includes("blaze") || text.includes("dispenser");
    },
  },
  {
    id: "commercial",
    name: "Commercial",
    shortName: "Commercial",
    icon: "🏢",
    matcher: (p) => {
      const text = (p.name + " " + (p.description || "")).toLowerCase();
      return text.includes("commercial") || text.includes("heavy") || text.includes("storm") || text.includes("50 l") || text.includes("25 l");
    },
  },
  {
    id: "kent",
    name: "KENT Series",
    shortName: "KENT",
    icon: "⭐",
    matcher: (p) => p.name.toLowerCase().startsWith("kent"),
  },
  {
    id: "ao-smith",
    name: "AO Smith",
    shortName: "AO Smith",
    icon: "💎",
    matcher: (p) => p.name.toLowerCase().includes("smith"),
  },
  {
    id: "aquaguard",
    name: "Aquaguard",
    shortName: "Aquaguard",
    icon: "🌊",
    matcher: (p) => p.name.toLowerCase().includes("aquaguard"),
  },
  {
    id: "pureit",
    name: "Pureit Series",
    shortName: "Pureit",
    icon: "✨",
    matcher: (p) => p.name.toLowerCase().includes("pureit"),
  },
  {
    id: "aquaara",
    name: "Aquaara",
    shortName: "Aquaara",
    icon: "🌀",
    matcher: (p) => p.name.toLowerCase().includes("aquaara"),
  },
  {
    id: "heavy-duty",
    name: "Heavy Duty",
    shortName: "Heavy Duty",
    icon: "⚡",
    matcher: (p) => {
      const text = (p.name + " " + (p.description || "")).toLowerCase();
      return text.includes("storm") || text.includes("heavy") || text.includes("max");
    },
  },
];

interface ProductCatalogProps {
  initialProducts: Product[];
}

export default function ProductCatalog({ initialProducts }: ProductCatalogProps) {
  // Ensure only one instance of each model is loaded (deduplicate)
  const uniqueProducts = useMemo(() => {
    return deduplicateProducts(initialProducts);
  }, [initialProducts]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const productsGridRef = useRef<HTMLDivElement>(null);

  // Read initial query params and listen to global search events
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get("q") || "");
      setSortBy((params.get("sort") || "default") as SortOption);

      const catParam = params.get("category");
      if (catParam) {
        setSelectedCategoryId(catParam);
      }

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

  // Compute product count per category based on unique models
  const categoriesWithCount = useMemo(() => {
    return CATEGORY_DEFINITIONS.map((cat) => ({
      ...cat,
      count: uniqueProducts.filter(cat.matcher).length,
    }));
  }, [uniqueProducts]);

  const activeCategory = useMemo(() => {
    return CATEGORY_DEFINITIONS.find((c) => c.id === selectedCategoryId) || CATEGORY_DEFINITIONS[0];
  }, [selectedCategoryId]);

  const handleSelectCategory = (catId: string, shouldScroll = false) => {
    setSelectedCategoryId(catId);
    if (shouldScroll && productsGridRef.current) {
      productsGridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...uniqueProducts];

    // Category filter
    if (selectedCategoryId !== "all") {
      const currentCat = CATEGORY_DEFINITIONS.find((c) => c.id === selectedCategoryId);
      if (currentCat) {
        result = result.filter(currentCat.matcher);
      }
    }

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
        break;
    }

    return result;
  }, [uniqueProducts, selectedCategoryId, searchQuery, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSortBy("default");
    setSelectedCategoryId("all");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      url.searchParams.delete("sort");
      url.searchParams.delete("category");
      window.history.replaceState({}, "", url.toString());
      window.dispatchEvent(new CustomEvent("global-search", { detail: { q: "", sort: "default" } }));
    }
  };

  return (
    <div className={styles.catalogWrapper}>
      {/* 1. Category Grid - Exact Clientele Design Structure */}
      <section className={styles.categorySection} id="category-section">
        <div className={styles.headingWrapper}>
          <h2 className={styles.heading}>
            Our <span className={styles.headingHighlight}>Categories</span>
          </h2>
          <p className={styles.subheading}>
            Select a category to explore and purchase purifiers designed for your needs
          </p>
        </div>

        <div className={styles.categoryGrid}>
          {categoriesWithCount.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryCard} ${isSelected ? styles.categoryCardActive : ""}`}
                onClick={() => handleSelectCategory(cat.id, true)}
                aria-label={`Select category ${cat.name}`}
              >
                <span className={styles.cardEmoji}>{cat.icon}</span>
                <span className={styles.cardTitle}>{cat.name}</span>
                <span className={styles.cardCount}>
                  {cat.count} {cat.count === 1 ? "Model" : "Models"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter Status Bar */}
      {(selectedCategoryId !== "all" || searchQuery.trim() || sortBy !== "default") && (
        <div className={styles.filterStatus}>
          <span>
            Showing <strong>{filteredAndSortedProducts.length}</strong>{" "}
            {selectedCategoryId !== "all" ? (
              <strong>{activeCategory.name}</strong>
            ) : filteredAndSortedProducts.length === 1 ? (
              "purifier"
            ) : (
              "purifiers"
            )}
          </span>

          <button
            type="button"
            className={styles.clearFilterBtn}
            onClick={handleClearFilters}
          >
            <X size={14} /> Clear Filter
          </button>
        </div>
      )}

      {/* Product Grid (0 duplicates, unique models only) */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className={styles.gridContainer} ref={productsGridRef}>
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
            We couldn&apos;t find any purifiers matching your selection.
          </p>
          <button
            type="button"
            className={styles.resetSearchBtn}
            onClick={handleClearFilters}
          >
            View All Purifiers
          </button>
        </div>
      )}
    </div>
  );
}
