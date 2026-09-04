"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ArrowDown10, ArrowUp10, ArrowDownAZ, ArrowUpZA, Check } from "lucide-react";
import styles from "./SearchBarSection.module.css";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "default", label: "Default / Featured", icon: SlidersHorizontal },
  { id: "price-desc", label: "Price: High to Low", icon: ArrowDown10 },
  { id: "price-asc", label: "Price: Low to High", icon: ArrowUp10 },
  { id: "name-asc", label: "Name: A to Z (Ascending)", icon: ArrowDownAZ },
  { id: "name-desc", label: "Name: Z to A (Descending)", icon: ArrowUpZA },
];

export default function SearchBarSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read search params from URL on mount & sync via global event listeners
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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortOpen]);

  const updateSearchURL = (query: string, sort: SortOption) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (query) url.searchParams.set("q", query);
      else url.searchParams.delete("q");

      if (sort !== "default") url.searchParams.set("sort", sort);
      else url.searchParams.delete("sort");

      window.history.replaceState({}, "", url.toString());

      // Sync header search bar and catalog grid in real-time
      window.dispatchEvent(new CustomEvent("global-search", { detail: { q: query, sort: sort } }));
    }
  };

  const handleInputChange = (val: string) => {
    setSearchQuery(val);
    updateSearchURL(val, sortBy);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setIsSortOpen(false);
    updateSearchURL(searchQuery, sort);
  };

  const handleSearchClick = () => {
    router.push(searchQuery ? `/products?q=${encodeURIComponent(searchQuery)}` : "/products");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  return (
    <div className={styles.searchSection}>
      {/* Title with Inline Sparkle */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>
          <span className={styles.titleTextLine}>
            Discover 
            <span className={styles.sparkleWrapper}>
              <svg viewBox="0 0 100 100" className={styles.sparkleIcon}>
                <path 
                  d="M 50,0 Q 50,50 100,50 Q 50,50 50,100 Q 50,50 0,50 Q 50,50 50,0" 
                  fill="url(#sparkleGradientInline)" 
                />
                <defs>
                  <linearGradient id="sparkleGradientInline" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff7e40" />
                    <stop offset="50%" stopColor="#ff5277" />
                    <stop offset="100%" stopColor="#7928ca" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </span>
          <span className={styles.titleTextSub}>Premium Water Purifiers</span>
        </h1>
      </div>

      {/* Lengthy Pill Search Field */}
      <div className={styles.searchBarContainer}>
        <div 
          className={styles.inputWrapper} 
          onClick={handleSearchClick}
          style={{ cursor: "pointer" }}
        >
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search purifiers..."
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleSearchClick}
            onClick={handleSearchClick}
            onKeyDown={handleKeyDown}
            className={styles.inputField}
            style={{ cursor: "pointer" }}
          />
        </div>

        {/* Filter/Sort settings button */}
        <div className={styles.filterWrapper} ref={dropdownRef}>
          <button 
            type="button" 
            className={`${styles.filterBtn} ${sortBy !== "default" ? styles.filterBtnActive : ""}`}
            onClick={() => setIsSortOpen(!isSortOpen)}
            aria-label="Sort options"
          >
            <SlidersHorizontal size={20} />
            {sortBy !== "default" && <span className={styles.activeDot} />}
          </button>

          {isSortOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownHeader}>
                <span>Sort options</span>
                {sortBy !== "default" && (
                  <button type="button" className={styles.resetBtn} onClick={() => handleSortChange("default")}>
                    Reset
                  </button>
                )}
              </div>
              <div className={styles.optionsList}>
                {SORT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = sortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`${styles.optionItem} ${isSelected ? styles.optionSelected : ""}`}
                      onClick={() => handleSortChange(opt.id)}
                    >
                      <span className={styles.optionContent}>
                        <Icon size={16} />
                        {opt.label}
                      </span>
                      {isSelected && <Check size={14} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
