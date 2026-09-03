"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./InstagramFeed.module.css";

function InstagramIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/aqua_care_shop?igsi=MW80c2QxeGM3c3E1dA==";

// Actual Instagram Reel & Post Embed URLs from AquaCare
const EMBED_ITEMS = [
  {
    id: "1",
    embedUrl: "https://www.instagram.com/reel/DcV0BSlTpj3/embed",
  },
  {
    id: "2",
    embedUrl: "https://www.instagram.com/reel/Dcbhc4szs8k/embed",
  },
  {
    id: "3",
    embedUrl: "https://www.instagram.com/p/DOOnM5BEyIJ/embed",
  },
  {
    id: "4",
    embedUrl: "https://www.instagram.com/p/DBoW6BzTxid/embed",
  },
  {
    id: "5",
    embedUrl: "https://www.instagram.com/reel/DJLRPV_TQ3a/embed",
  },
  {
    id: "6",
    embedUrl: "https://www.instagram.com/reel/DcQzyIrz11O/embed",
  },
];

export default function InstagramFeed() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 340;
      sliderRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.headerContainer}>
        <div className={styles.headingWrapper}>
          <h2 className={styles.heading}>
            Our <span className={styles.headingHighlight}>Instagram Reels</span>
          </h2>
          <p className={styles.subheading}>
            Watch our live water purifier installations, product demonstrations, and customer stories
          </p>
        </div>

        {/* Slider Navigation Buttons */}
        <div className={styles.navButtons}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => scroll("left")}
            aria-label="Previous Reels"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => scroll("right")}
            aria-label="Next Reels"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Horizontal Right-to-Left Slide Carousel */}
      <div className={styles.sliderContainer}>
        <div className={styles.sliderTrack} ref={sliderRef}>
          {EMBED_ITEMS.map((item, index) => (
            <div
              key={item.id}
              className={styles.iframeCard}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className={styles.iframeWrapper}>
                <iframe
                  src={item.embedUrl}
                  className={styles.instaIframe}
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  loading="lazy"
                  title={`AquaCare Instagram Reel ${item.id}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.followButtonContainer}>
        <a 
          href={INSTAGRAM_PROFILE_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.followButton}
        >
          <InstagramIcon size={18} />
          FOLLOW @AQUA_CARE_SHOP ON INSTAGRAM
        </a>
      </div>
    </section>
  );
}
