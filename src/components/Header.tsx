"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, User, Search, X, SlidersHorizontal, ArrowDownAZ, ArrowUpZA, ArrowDown10, ArrowUp10, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./Header.module.css";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "default", label: "Default / Featured", icon: SlidersHorizontal },
  { id: "price-desc", label: "Price: High to Low", icon: ArrowDown10 },
  { id: "price-asc", label: "Price: Low to High", icon: ArrowUp10 },
  { id: "name-asc", label: "Name: A to Z (Ascending)", icon: ArrowDownAZ },
  { id: "name-desc", label: "Name: Z to A (Descending)", icon: ArrowUpZA },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, setSidebarOpen, isLoggedIn, user, setLoginModalOpen } = useCart();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync search input and sort selection with URL query params client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q") || "";
      const sort = (params.get("sort") || "default") as SortOption;
      setSearchQuery(q);
      setSortBy(sort);
      
      // Auto open search bar if query params exist on mount
      if (q || sort !== "default") {
        setIsSearchOpen(true);
      }
    }
  }, [pathname]);

  // Focus search input when it opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close sort dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
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

  const handleCartClick = () => {
    if (window.innerWidth < 768) {
      router.push("/cart");
    } else {
      setSidebarOpen(true);
    }
  };

  const updateSearchURL = (query: string, sort: SortOption) => {
    if (typeof window !== "undefined") {
      // If we are not on '/' or '/products', redirect home with parameters
      if (window.location.pathname !== "/" && window.location.pathname !== "/products") {
        router.push(`/?q=${encodeURIComponent(query)}&sort=${sort}`);
        return;
      }
      
      const url = new URL(window.location.href);
      if (query) url.searchParams.set("q", query);
      else url.searchParams.delete("q");
      
      if (sort !== "default") url.searchParams.set("sort", sort);
      else url.searchParams.delete("sort");
      
      window.history.replaceState({}, "", url.toString());
      
      // Emit global search event for real-time filtering in catalog component
      window.dispatchEvent(new CustomEvent("global-search", { detail: { q: query, sort: sort } }));
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateSearchURL(val, sortBy);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setIsSortOpen(false);
    updateSearchURL(searchQuery, sort);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    updateSearchURL("", sortBy);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSortBy("default");
    updateSearchURL("", "default");
  };

  return (
    <div className={styles.headerWrapper}>
      <header className={styles.header}>
        {/* Logo & Brand Name Left */}
        <div className={styles.brandWrapper} onClick={() => router.push("/")}>
          <div className={styles.logoContainer}>
            <Image
              src="/logo/logo.png"
              alt="AquaCare Logo"
              width={34}
              height={34}
              className={styles.logo}
              priority
              style={{ objectFit: "contain" }}
            />
          </div>
          <span className={styles.brandTitle}>
            Aqua<span className={styles.brandTitleAccent}>Care</span>
          </span>
        </div>

        {/* Header Actions Buttons Right */}
        <div className={styles.actionsContainer}>
          {/* Cart Icon Button */}
          <button 
            className={styles.iconButton} 
            aria-label="Shopping Cart"
            onClick={handleCartClick}
          >
            <ShoppingBag size={20} strokeWidth={1.8} className={styles.icon} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>

          {/* Profile / Account Icon Button */}
          <button 
            className={styles.iconButton} 
            aria-label="My Account / Profile"
            onClick={() => {
              if (isLoggedIn) {
                router.push("/profile");
              } else {
                setLoginModalOpen(true);
              }
            }}
          >
            <User size={20} strokeWidth={1.8} className={styles.icon} />
          </button>
        </div>
      </header>

      {/* Global Slide-down Search Bar Overlay */}
      {isSearchOpen && (
        <div className={styles.searchBarOverlay}>
          <div className={styles.searchContainer}>
            <div className={styles.searchFieldWrapper}>
              <Search size={18} className={styles.fieldSearchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search purifiers..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button type="button" className={styles.clearBtn} onClick={handleClearSearch}>
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Inline Filter Dropdown */}
            <div className={styles.sortDropdownWrapper} ref={sortDropdownRef}>
              <button
                type="button"
                className={`${styles.filterBtn} ${sortBy !== "default" ? styles.filterBtnActive : ""}`}
                onClick={() => setIsSortOpen(!isSortOpen)}
                aria-label="Filter options"
              >
                <SlidersHorizontal size={18} />
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

            {/* Collapse Button */}
            <button type="button" className={styles.closeBtn} onClick={handleCloseSearch} aria-label="Close search">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
