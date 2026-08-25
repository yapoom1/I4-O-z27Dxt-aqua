"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, ArrowDownAZ, ArrowUpZA, ArrowDown10, ArrowUp10, Check, X } from "lucide-react";
import styles from "./SearchBar.module.css";

export type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

interface SearchBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "default", label: "Default / Featured", icon: SlidersHorizontal },
  { id: "price-desc", label: "Price: High to Low", icon: ArrowDown10 },
  { id: "price-asc", label: "Price: Low to High", icon: ArrowUp10 },
  { id: "name-asc", label: "Name: A to Z (Ascending)", icon: ArrowDownAZ },
  { id: "name-desc", label: "Name: Z to A (Descending)", icon: ArrowUpZA },
];

export default function SearchBar({
  searchQuery = "",
  onSearchChange,
  sortBy = "default",
  onSortChange,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectSort = (sortId: SortOption) => {
    if (onSortChange) {
      onSortChange(sortId);
    }
    setIsOpen(false);
  };

  const activeSortLabel = SORT_OPTIONS.find((o) => o.id === sortBy)?.label;

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div className={styles.inputRow}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => onSearchChange?.("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className={styles.filterBtnWrapper}>
          <button
            type="button"
            className={`${styles.filterButton} ${sortBy !== "default" ? styles.filterActive : ""} ${isOpen ? styles.filterOpen : ""}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Filter and sort products"
            aria-expanded={isOpen}
          >
            <SlidersHorizontal size={20} className={styles.filterIcon} strokeWidth={2} />
            {sortBy !== "default" && <span className={styles.activeDot} />}
          </button>

          {/* Filter / Sort Dropdown Menu */}
          {isOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownTitle}>Sort & Filter</span>
                {sortBy !== "default" && (
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={() => handleSelectSort("default")}
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className={styles.optionsList}>
                {SORT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = sortBy === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`${styles.optionItem} ${isSelected ? styles.optionSelected : ""}`}
                      onClick={() => handleSelectSort(option.id)}
                    >
                      <div className={styles.optionLeft}>
                        <Icon size={18} className={styles.optionIcon} />
                        <span className={styles.optionLabel}>{option.label}</span>
                      </div>
                      {isSelected && <Check size={16} className={styles.checkIcon} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {sortBy !== "default" && (
        <div className={styles.activeChipsContainer}>
          <span className={styles.chip}>
            <span>{activeSortLabel}</span>
            <button
              type="button"
              className={styles.chipRemoveBtn}
              onClick={() => onSortChange?.("default")}
              aria-label="Remove sort filter"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
