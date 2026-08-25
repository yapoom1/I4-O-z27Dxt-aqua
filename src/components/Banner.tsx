import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./Banner.module.css";

export default function Banner() {
  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <h2 className={styles.title}>
          Organic Palm Jaggery,<br />
          pure <span className={styles.highlight}>Karupatti</span> sweetness
        </h2>
        <Link href="/products-v2" className={styles.shopButton}>
          <span>Shop now</span>
          <ArrowRight size={14} className={styles.arrowIcon} strokeWidth={2.5} />
        </Link>
      </div>
      <div className={styles.imageContainer}>
        <Image
          src="/images/karupatti.png"
          alt="Karupatti Palm Jaggery Promo"
          width={150}
          height={150}
          className={styles.hoodieImage}
          priority
        />
      </div>
    </div>
  );
}
