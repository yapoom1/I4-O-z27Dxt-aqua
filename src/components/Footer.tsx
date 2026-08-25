"use client";

import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <div className={styles.logoBadge}>A</div>
          <h4 className={styles.brandTitle}>AquaCare Hi-Tech</h4>
          <p className={styles.tagline}>
            Premium water purifier
          </p>
        </div>

        {/* Link Column 1: Shop */}
        <div className={styles.linkCol}>
          <span className={styles.colTitle}>Shop</span>
          <ul className={styles.linkList}>
            <li>
              <Link href="/" className={styles.link}>
                Home Catalog
              </Link>
            </li>
            <li>
              <Link href="/products-v2" className={styles.link}>
                Explore Products
              </Link>
            </li>
            <li>
              <Link href="/categories-v2" className={styles.link}>
                Categories V2
              </Link>
            </li>
            <li>
              <Link href="/coupons" className={styles.link}>
                Promo Tickets
              </Link>
            </li>
          </ul>
        </div>

        {/* Link Column 2: Legal Policies */}
        <div className={styles.linkCol}>
          <span className={styles.colTitle}>Policies</span>
          <ul className={styles.linkList}>
            <li>
              <Link href="/terms" className={styles.link}>
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={styles.link}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/addresses" className={styles.link}>
                Shipping Addresses
              </Link>
            </li>
          </ul>
        </div>

        {/* Link Column 3: Contact Info */}
        <div className={styles.linkCol}>
          <span className={styles.colTitle}>Contact Us</span>
          <ul className={styles.contactList}>
            <li>
              <span className={styles.contactLabel}>Email:</span>
              <a href="mailto:aqua@gmail.com" className={styles.contactValue}>
                aquahitech@gmail.com
              </a>
            </li>
            <li>
              <span className={styles.contactLabel}>Phone:</span>
              <a href="tel:+12345678900" className={styles.contactValue}>
                +1 (234) 567-8900
              </a>
            </li>
            <li>
              <span className={styles.contactLabel}>Store Address:</span>
              <span className={styles.contactValue}>
                Chennai, Tamil Nadu, India
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <span className={styles.copyright}>
          © {new Date().getFullYear()} AquaPure. All rights reserved. Built for aqua-care hi tech.
        </span>
      </div>
    </footer>
  );
}
