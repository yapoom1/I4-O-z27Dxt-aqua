"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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

const BANNERS: BannerData[] = [
  {
    id: "banner-1",
    productId: "1",
    brand: "AquaCare",
    badge: "PRO SERIES",
    title: "Aqua Grand 10L",
    subtitle: "Advanced RO+UV+UF+Minerals",
    subtext: "7-Stage Intelligent Purification",
    image: "/images/ro-1.jpg",
    bgClass: styles.tealGradient,
    priceTag: "₹10,000"
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
    bgClass: styles.blueGradient,
    priceTag: "₹13,500"
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
    bgClass: styles.darkGradient,
    priceTag: "₹7,000"
  }
];

export default function BrandBanners() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Monitor scroll index to update dots
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const slideWidth = window.innerWidth >= 768 ? clientWidth / 2 : clientWidth;
      const index = Math.round(scrollLeft / slideWidth);
      setActiveIndex(index % BANNERS.length);
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
      nextIndex = activeIndex === 0 ? BANNERS.length - 1 : activeIndex - 1;
    } else {
      nextIndex = activeIndex === BANNERS.length - 1 ? 0 : activeIndex + 1;
    }
    scrollToBanner(nextIndex);
  };

  // Infinite auto-scroll logic
  useEffect(() => {
    if (paused) return;

    const timer = setInterval(() => {
      const nextIndex = activeIndex === BANNERS.length - 1 ? 0 : activeIndex + 1;
      scrollToBanner(nextIndex);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeIndex, paused]);

  return (
    <div className={styles.sectionContainer}>
      {/* Carousel Wrapper containing snap track & arrows */}
      <div 
        className={styles.carouselWrapper}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Navigation Arrows */}
        <button 
          type="button" 
          className={`${styles.navArrow} ${styles.leftArrow}`} 
          onClick={() => handleArrowClick("left")}
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>

        <button 
          type="button" 
          className={`${styles.navArrow} ${styles.rightArrow}`} 
          onClick={() => handleArrowClick("right")}
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Horizontal Scroll Track */}
        <div 
          ref={scrollRef} 
          onScroll={handleScroll}
          className={styles.scrollTrack}
        >
          {BANNERS.map((banner) => (
            <Link 
              key={banner.id} 
              href={`/product/${banner.productId}`} 
              className={`${styles.bannerCard} ${banner.bgClass}`}
            >
              {/* Left Content Area */}
              <div className={styles.leftContent}>
                <div className={styles.brandRow}>
                  <span className={styles.brandName}>{banner.brand}</span>
                  <span className={styles.badge}>{banner.badge}</span>
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
                    width={150}
                    height={165}
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
      <div className={styles.dotsRow}>
        {BANNERS.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`${styles.dot} ${activeIndex === index ? styles.activeDot : ""}`}
            onClick={() => scrollToBanner(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
