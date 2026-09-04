"use client";

import React, { useState, useEffect } from "react";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { Product } from "@/data/products";
import { Search, Loader2, X } from "lucide-react";
import styles from "./page.module.css";

export default function ExploreProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Read category and search query from URL parameters client-side
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      const q = params.get("q");
      if (cat) {
        setSelectedCategory(cat);
      }
      if (q) {
        setSearchQuery(q);
      }
    }

    fetch("/api/products?first=100")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products client-side:", err);
        setLoading(false);
      });
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (val.trim()) {
        url.searchParams.set("q", val);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.replaceState({}, "", url.toString());
    }
    searchInputRef.current?.focus();
  };

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      (product.subtitle && product.subtitle.toLowerCase().includes(q)) ||
      (product.description && product.description.toLowerCase().includes(q));
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MobileContainer>
      <ProductDetailsHeader title="Explore Products" />
      
      <main className={styles.mainContent}>
        {/* Full-width Search Input */}
        <div className={styles.searchContainer}>
          <Search size={20} className={styles.searchIcon} strokeWidth={2} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search purifiers by name or model..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />
          {searchQuery && (
            <button 
              type="button" 
              className={styles.clearBtn} 
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Active Category Filter Badge */}
        {selectedCategory && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", marginTop: "-4px", flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "16px",
              backgroundColor: "rgba(229, 166, 60, 0.08)",
              border: "1px solid rgba(229, 166, 60, 0.15)",
              fontSize: "12px",
              fontWeight: 600,
              color: "#d48d1e"
            }}>
              Category: {selectedCategory.toUpperCase().replace("-", " ")}
              <button 
                onClick={() => {
                  setSelectedCategory(null);
                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("category");
                    window.history.replaceState({}, "", url.toString());
                  }
                }} 
                style={{
                  background: "none",
                  border: "none",
                  padding: "0",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  color: "#d48d1e",
                  marginLeft: "2px"
                }}
                type="button"
                aria-label="Remove category filter"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </span>
          </div>
        )}

        {/* Results Count when searching */}
        {!loading && searchQuery.trim() && (
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px", fontWeight: 500 }}>
            Found {filteredProducts.length} {filteredProducts.length === 1 ? "purifier" : "purifiers"} matching &quot;{searchQuery}&quot;
          </div>
        )}

        {/* Loading / Product Grid */}
        {loading ? (
          <div className={styles.loadingState} style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
            <Loader2 className="animate-spin" size={32} style={{ color: "var(--primary-color, #e5a63c)" }} />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No products found matching &quot;{searchQuery || selectedCategory}&quot;</p>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
