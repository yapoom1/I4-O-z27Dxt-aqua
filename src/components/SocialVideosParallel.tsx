"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, ExternalLink } from "lucide-react";
import styles from "./SocialVideosParallel.module.css";

// YouTube Shorts items
const YOUTUBE_SHORTS = [
  {
    id: "1",
    title: "AquaCare Installation & Demo 1",
    youtubeId: "4CndblcoLto",
  },
  {
    id: "2",
    title: "AquaCare Installation & Demo 2",
    youtubeId: "_mv6KAVa9bA",
  },
  {
    id: "3",
    title: "AquaCare Installation & Demo 3",
    youtubeId: "6JoC-KvHxmM",
  },
];

// Instagram Reels items
const INSTAGRAM_REELS = [
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

const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/aqua_care_shop?igsi=MW80c2QxeGM3c3E1dA==";

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function SocialVideosParallel() {
  const [playingYoutubeId, setPlayingYoutubeId] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<"both" | "youtube" | "instagram">("both");

  const youtubeTrackRef = useRef<HTMLDivElement>(null);
  const instaTrackRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = 260;
      ref.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className={styles.section} id="social-videos">
      <div className={styles.container}>
        {/* Main Section Header */}
        <div className={styles.mainHeader}>
          <h2 className={styles.mainTitle}>Watch Us in Action</h2>
          <p className={styles.mainSubtitle}>
            Explore our real-world customer installations, purifier demos, and expert tips across YouTube & Instagram
          </p>
        </div>

        {/* Mobile View Toggle Tabs */}
        <div className={styles.mobileTabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeMobileTab === "both" ? styles.tabBtnActive : ""}`}
            style={activeMobileTab === "both" ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : {}}
            onClick={() => setActiveMobileTab("both")}
          >
            All Videos
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${styles.youtubeTab} ${activeMobileTab === "youtube" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveMobileTab("youtube")}
          >
            <YoutubeIcon size={16} />
            YouTube Shorts
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${styles.instaTab} ${activeMobileTab === "instagram" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveMobileTab("instagram")}
          >
            <InstagramIcon size={16} />
            Instagram Reels
          </button>
        </div>

        {/* Parallel Columns: YouTube on Left, Instagram on Right */}
        <div className={styles.columnsContainer}>
          {/* YouTube Column */}
          {(activeMobileTab === "both" || activeMobileTab === "youtube") && (
            <div className={styles.column}>
              <div className={styles.colHeader}>
                <div className={styles.colHeadingWrapper}>
                  <div className={`${styles.colBadge} ${styles.youtubeBadge}`}>
                    <YoutubeIcon size={14} />
                    YouTube Shorts
                  </div>
                  <h3 className={styles.colTitle}>Product Demos & Guides</h3>
                  <p className={styles.colSubtitle}>Quick tutorials & installation demos</p>
                </div>

                <div className={styles.navBtns}>
                  <button
                    type="button"
                    className={styles.navBtn}
                    onClick={() => scrollTrack(youtubeTrackRef, "left")}
                    aria-label="Previous YouTube video"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    className={styles.navBtn}
                    onClick={() => scrollTrack(youtubeTrackRef, "right")}
                    aria-label="Next YouTube video"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* YouTube Scroll Track */}
              <div className={styles.sliderTrack} ref={youtubeTrackRef}>
                {YOUTUBE_SHORTS.map((t, index) => {
                  const isPlaying = playingYoutubeId === t.youtubeId;
                  const thumbnailUrl = `https://img.youtube.com/vi/${t.youtubeId}/hqdefault.jpg`;

                  return (
                    <div key={t.id} className={styles.videoCard}>
                      {isPlaying ? (
                        <div className={styles.iframeWrapper}>
                          <iframe
                            src={`https://www.youtube.com/embed/${t.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                            title={t.title}
                            className={styles.videoIframe}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div
                          className={styles.thumbnailContainer}
                          onClick={() => setPlayingYoutubeId(t.youtubeId)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setPlayingYoutubeId(t.youtubeId);
                            }
                          }}
                          aria-label={`Play YouTube Short: ${t.title}`}
                        >
                          <Image
                            src={thumbnailUrl}
                            alt={t.title}
                            fill
                            sizes="(max-width: 768px) 220px, 260px"
                            className={styles.thumbnailImage}
                            priority={index === 0}
                          />
                          <div className={styles.playOverlay}>
                            <div className={styles.playButton}>
                              <Play size={22} fill="#ffffff" color="#ffffff" style={{ marginLeft: "3px" }} />
                            </div>
                          </div>
                          <div className={styles.cardBottomInfo}>
                            <div className={styles.videoTitle}>{t.title}</div>
                            <div className={styles.watchPrompt}>Tap to Play Demo</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instagram Column */}
          {(activeMobileTab === "both" || activeMobileTab === "instagram") && (
            <div className={styles.column}>
              <div className={styles.colHeader}>
                <div className={styles.colHeadingWrapper}>
                  <div className={`${styles.colBadge} ${styles.instaBadge}`}>
                    <InstagramIcon size={14} />
                    Instagram Reels
                  </div>
                  <h3 className={styles.colTitle}>Live Customer Stories</h3>
                  <p className={styles.colSubtitle}>On-site installations & real reviews</p>
                </div>

                <div className={styles.navBtns}>
                  <button
                    type="button"
                    className={styles.navBtn}
                    onClick={() => scrollTrack(instaTrackRef, "left")}
                    aria-label="Previous Instagram reel"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    className={styles.navBtn}
                    onClick={() => scrollTrack(instaTrackRef, "right")}
                    aria-label="Next Instagram reel"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Instagram Scroll Track */}
              <div className={styles.sliderTrack} ref={instaTrackRef}>
                {INSTAGRAM_REELS.map((item) => (
                  <div key={item.id} className={styles.videoCard}>
                    <div className={styles.iframeWrapper}>
                      <iframe
                        src={item.embedUrl}
                        className={styles.videoIframe}
                        title={`Instagram Reel ${item.id}`}
                        scrolling="no"
                        allowTransparency={true}
                        allow="encrypted-media; picture-in-picture"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.colFooter}>
                <a
                  href={INSTAGRAM_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewAllLink}
                >
                  Follow @aqua_care_shop on Instagram <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
