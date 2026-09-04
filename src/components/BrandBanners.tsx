"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Product } from "@/data/products";
import styles from "./BrandBanners.module.css";

interface BannerData {
  id: string;
  productId: string;
  brand: string;
  badge: string;
  title: string;
  subtitle: string;
  subtext: string;
  image: string;
  bgClass: string;
  priceTag?: string;
}

const THEME_CLASSES = [
  styles.sapphireTheme,
  styles.emeraldTheme,
  styles.amberTheme,
  styles.violetTheme,
];

function getBrandFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.startsWith("ao smith") || lower.startsWith("a.o. smith")) return "AO Smith";
  if (lower.startsWith("aquaara")) return "Aquaara";
  if (lower.startsWith("aquaguard")) return "Aquaguard";
  if (lower.startsWith("kent")) return "KENT";
  if (lower.startsWith("purosis")) return "Purosis";
  if (lower.startsWith("pureit")) return "Pureit";
  if (lower.startsWith("blueshell")) return "Blueshell";
  if (lower.startsWith("revito")) return "Revito";
  if (lower.startsWith("seron")) return "Seron";
  if (lower.startsWith("aquacare")) return "AquaCare";
  return name.split(" ")[0] || "AquaCare";
}

function getBadge(index: number, name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("proplanet") || lower.includes("pro planet")) return "PRO PLANET";
  if (lower.includes("pro") || lower.includes("max")) return "PRO SERIES";
  if (lower.includes("alkaline") || lower.includes("alk")) return "ALKALINE+";
  if (lower.includes("storm") || lower.includes("heavy")) return "HEAVY DUTY";
  if (lower.includes("copper") || lower.includes("cu")) return "COPPER TECH";
  const defaults = ["FLAGSHIP", "BESTSELLER", "TOP RATED", "FEATURED"];
  return defaults[index % defaults.length];
}

function getCleanSubtitle(product: Product): string {
  if (product.description && !product.description.toLowerCase().includes("premium quality")) {
    const clean = product.description.replace(/&amp;/g, "&").replace(/<[^>]*>/g, "").trim();
    if (clean.length > 0 && clean.length <= 48) return clean;
    if (clean.length > 48) return clean.slice(0, 45) + "...";
  }
  return product.subtitle || "Advanced RO Purification";
}

const FALLBACK_BANNERS: BannerData[] = [
  {
    id: "banner-1",
    productId: "1",
    brand: "AquaCare",
    badge: "PRO SERIES",
    title: "Aqua Grand 10L",
    subtitle: "Advanced RO+UV+UF+Minerals",
    subtext: "7-Stage Intelligent Purification",
    image: "/images/ro-1.jpg",
    bgClass: styles.sapphireTheme,
    priceTag: "₹10,000",
  },
  {
    id: "banner-2",
    productId: "2",
    brand: "Purosis",
    badge: "HEAVY DUTY",
    title: "Purosis 11L Max",
    subtitle: "With Auto TDS & Mineralizer",
    subtext: "High Recovery Membrane",
    image: "/images/ro-2.jpg",
    bgClass: styles.emeraldTheme,
    priceTag: "₹13,500",
  },
  {
    id: "banner-3",
    productId: "5",
    brand: "Dolphin",
    badge: "COMPACT",
    title: "Dolphin 9L",
    subtitle: "Wall Mount Space Saver",
    subtext: "Ideal for Small Kitchens",
    image: "/images/ro-3.jpg",
    bgClass: styles.amberTheme,
    priceTag: "₹7,000",
  },
];

interface BrandBannersProps {
  initialProducts?: Product[];
}

export default function BrandBanners({ initialProducts }: BrandBannersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const banners: BannerData[] = useMemo(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((product, index) => ({
        id: `dynamic-${product.id}`,
        productId: product.id,
        brand: getBrandFromName(product.name),
        badge: getBadge(index, product.name),
        title: product.name,
        subtitle: getCleanSubtitle(product),
        subtext: "Pure & Certified Drinking Water",
        image: product.image || "/images/ro-1.jpg",
        bgClass: THEME_CLASSES[index % THEME_CLASSES.length],
        priceTag: product.price,
      }));
    }
    return FALLBACK_BANNERS;
  }, [initialProducts]);

  // Monitor scroll index to update dots
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const slideWidth = window.innerWidth >= 768 ? clientWidth / 2 : clientWidth;
      const index = Math.round(scrollLeft / slideWidth);
      setActiveIndex(index % banners.length);
    }
  };

  const scrollToBanner = (index: number) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const slideWidth = window.innerWidth >= 768 ? clientWidth / 2 : clientWidth;
      scrollRef.current.scrollTo({
        left: index * slideWidth,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  const handleArrowClick = (direction: "left" | "right") => {
    let nextIndex = activeIndex;
    if (direction === "left") {
      nextIndex = activeIndex === 0 ? banners.length - 1 : activeIndex - 1;
    } else {
      nextIndex = activeIndex === banners.length - 1 ? 0 : activeIndex + 1;
    }
    scrollToBanner(nextIndex);
  };

  // Infinite auto-scroll logic
  useEffect(() => {
    if (paused || banners.length <= 1) return;

    const timer = setInterval(() => {
      const nextIndex = activeIndex === banners.length - 1 ? 0 : activeIndex + 1;
      scrollToBanner(nextIndex);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeIndex, paused, banners.length]);

  return (
    <div className={styles.sectionContainer}>
      {/* Carousel Wrapper containing snap track & arrows */}
      <div 
        className={styles.carouselWrapper}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button 
              type="button" 
              className={`${styles.navArrow} ${styles.leftArrow}`} 
              onClick={() => handleArrowClick("left")}
              aria-label="Previous slide"
            >
              <ChevronLeft size={22} />
            </button>

            <button 
              type="button" 
              className={`${styles.navArrow} ${styles.rightArrow}`} 
              onClick={() => handleArrowClick("right")}
              aria-label="Next slide"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Horizontal Scroll Track */}
        <div 
          ref={scrollRef} 
          onScroll={handleScroll}
          className={styles.scrollTrack}
        >
          {banners.map((banner) => (
            <Link 
              key={banner.id} 
              href={`/product/${banner.productId}`} 
              className={`${styles.bannerCard} ${banner.bgClass}`}
            >
              {/* Subtle ambient shimmer */}
              <div className={styles.shimmerOverlay} />

              {/* Left Content Area */}
              <div className={styles.leftContent}>
                <div className={styles.brandRow}>
                  <span className={styles.brandName}>{banner.brand}</span>
                  <span className={styles.badge}>
                    <span className={styles.sparkleDot} />
                    {banner.badge}
                  </span>
                </div>
                
                <h2 className={styles.title}>{banner.title}</h2>
                <div className={styles.subtitleRow}>
                  <span className={styles.subtitle}>{banner.subtitle}</span>
                </div>
                <p className={styles.subtext}>{banner.subtext}</p>
                
                <span className={styles.actionBtn}>
                  Explore Series
                  <ArrowRight size={14} />
                </span>
              </div>

              {/* Right Product Image Area */}
              <div className={styles.rightContent}>
                <div className={styles.imageCircle}>
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    width={160}
                    height={175}
                    className={styles.productImg}
                    priority
                  />
                </div>
              </div>
              
              {/* Floating Price Badge */}
              {banner.priceTag && (
                <span className={styles.floatingPriceBadge}>
                  {banner.priceTag}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className={styles.dotsRow}>
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.dot} ${activeIndex === index ? styles.activeDot : ""}`}
              onClick={() => scrollToBanner(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
