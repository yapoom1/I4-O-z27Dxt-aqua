"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, ShoppingCart, Heart, User, LayoutGrid } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./BottomNav.module.css";

// CONFIGURATION TOGGLE:
// - Set to 'true' to use ONLY bottom navigation on all screen sizes.
// - Set to 'false' to use bottom navigation on mobile and top navigation on web/tablet.
export const FORCE_BOTTOM_NAV = true;

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { setSidebarOpen } = useCart();

  useEffect(() => {
    if (FORCE_BOTTOM_NAV) {
      document.body.classList.add("forced-bottom-nav");
    } else {
      document.body.classList.remove("forced-bottom-nav");
    }
  }, []);

  const getActiveTab = () => {
    if (pathname === "/") return "home";
    if (pathname?.startsWith("/categories") || pathname?.startsWith("/products")) return "categories";
    if (pathname === "/cart") return "cart";
    if (pathname === "/wishlist") return "favorites";
    if (
      pathname?.startsWith("/profile") ||
      pathname?.startsWith("/orders") ||
      pathname?.startsWith("/order") ||
      pathname?.startsWith("/addresses") ||
      pathname?.startsWith("/coupons")
    ) {
      return "profile";
    }
    return "";
  };

  const activeTab = getActiveTab();

  const handleHomeClick = () => {
    router.push("/");
  };

  const handleCartClick = () => {
    if (window.innerWidth < 768) {
      router.push("/cart");
    } else {
      setSidebarOpen(true);
    }
  };

  const handleCategoriesClick = () => {
    router.push("/products"); // Go to explore all products
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <div
      className={`${styles.navContainer} ${FORCE_BOTTOM_NAV ? styles.forceBottom : ""}`}
    >
      <nav
        className={`${styles.navBar} ${FORCE_BOTTOM_NAV ? styles.forceBottomBar : ""}`}
      >
        {/* Home Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "home" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleHomeClick}
          aria-label="Home"
        >
          <Home size={18} strokeWidth={2.5} />
          <span className={styles.navText}>Home</span>
        </button>

        {/* Categories / Explore Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "categories" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleCategoriesClick}
          aria-label="Explore"
        >
          <LayoutGrid size={18} strokeWidth={2.5} />
          <span className={styles.navText}>Explore</span>
        </button>

        {/* Cart Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "cart" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleCartClick}
          aria-label="Cart"
        >
          <ShoppingCart size={18} strokeWidth={2.5} />
          <span className={styles.navText}>Cart</span>
        </button>

        {/* Wishlist Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "favorites" ? styles.activeItem : styles.inactiveItem}`}
          onClick={() => router.push("/wishlist")}
          aria-label="Wishlist"
        >
          <Heart size={18} strokeWidth={2.5} />
          <span className={styles.navText}>Wishlist</span>
        </button>

        {/* Profile Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "profile" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleProfileClick}
          aria-label="Profile"
        >
          <User size={18} strokeWidth={2.5} />
          <span className={styles.navText}>Profile</span>
        </button>
      </nav>
    </div>
  );
}
