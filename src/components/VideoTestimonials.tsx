"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./VideoTestimonials.module.css";

interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
}

const VIDEOS: VideoItem[] = [
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

export default function VideoTestimonials() {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const handlePlay = (youtubeId: string) => {
    setPlayingVideoId(youtubeId);
  };

  return (
    <section className={styles.section} id="testimonials">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>
            Our <span className={styles.headingHighlight}>YouTube Shorts</span>
          </h2>
          <p className={styles.subheading}>
            Watch quick product demos, maintenance tips, and customer stories
          </p>
        </div>

        <div className={styles.grid}>
          {VIDEOS.map((t, index) => {
            const isPlaying = playingVideoId === t.youtubeId;
            const thumbnailUrl = `https://img.youtube.com/vi/${t.youtubeId}/hqdefault.jpg`;

            return (
              <div
                key={t.id}
                className={`${styles.videoCard} ${isPlaying ? styles.isPlaying : ""}`}
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                {isPlaying ? (
                  <div className={styles.iframeWrapper}>
                    <iframe
                      src={`https://www.youtube.com/embed/${t.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                      title={t.title}
                      className={styles.youtubeIframe}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div
                    className={styles.thumbnailContainer}
                    onClick={() => handlePlay(t.youtubeId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handlePlay(t.youtubeId);
                      }
                    }}
                    aria-label={`Play YouTube Short - ${t.title}`}
                  >
                    <Image
                      src={thumbnailUrl}
                      alt={t.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className={styles.thumbnailImage}
                      priority={index === 0}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
