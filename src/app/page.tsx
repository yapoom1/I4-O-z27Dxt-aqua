import MobileContainer from "@/components/MobileContainer";
import Header from "@/components/Header";
import SearchBarSection from "@/components/SearchBarSection";
import ProductCatalog from "@/components/ProductCatalog";
import BrandBanners from "@/components/BrandBanners";
import BottomNav from "@/components/BottomNav";
import { getProducts, getCollectionProducts } from "@/services/saleor";
import Image from "next/image";
import styles from "./page.module.css";
import SocialVideosParallel from "@/components/SocialVideosParallel";
import Testimonials from "@/components/Testimonials";

export default async function Home() {
  const [products, featuredProducts] = await Promise.all([
    getProducts(100),
    getCollectionProducts("featured_products", 8),
  ]);

  return (
    <MobileContainer>
      <Header />
      
      <main className={styles.mainContent}>
        {/* Lengthy Search Bar Section */}
        <SearchBarSection />

        {/* Top Hero Section */}
        <div className={styles.topSection}>
          <div className={styles.heroWrapper}>
            <div className={styles.heroContainer}>
              <Image 
                src="/images/new_hero.png" 
                alt="Hero Image" 
                width={1200} 
                height={600} 
                sizes="(max-width: 1024px) 100vw, 1024px"
                className={styles.heroImage}
                priority
              />
            </div>

            {/* Rotating Badge Overlay Top Right */}
            <div className={styles.rotatingBadgeContainer}>
              <svg viewBox="0 0 100 100" className={styles.rotatingBadge}>
                <circle cx="50" cy="50" r="46" className={styles.badgeOuterBg} />
                <path 
                  id="badgePath" 
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" 
                  fill="none" 
                />
                <text className={styles.rotatingText}>
                  <textPath href="#badgePath" startOffset="0%">
                    100% PURE WATER • HEALTHY LIFE • AQUACARE •
                  </textPath>
                </text>
                <circle cx="50" cy="50" r="18" className={styles.badgeCenterBg} />
                {/* Water drop shape */}
                <path 
                  d="M50 34 C44 43 42 49 42 54 A 8 8 0 0 0 58 54 C58 49 56 43 50 34 Z" 
                  fill="url(#dropGradient)" 
                />
                <defs>
                  <linearGradient id="dropGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00c6ff" />
                    <stop offset="100%" stopColor="#0072ff" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Brand Banners with Left-Aligned Heading */}
        <div className={styles.sectionHeadingWrapper}>
          <h2 className={styles.sectionHeading}>Featured Series</h2>
        </div>
        <BrandBanners initialProducts={featuredProducts} />

        <ProductCatalog initialProducts={products} />

        <SocialVideosParallel />
        <Testimonials />
      </main>
      <BottomNav />
    </MobileContainer>
  );
}
