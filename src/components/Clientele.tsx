import React from 'react';
import styles from './Clientele.module.css';

const CLIENTS = [
  "SS Enterprises", "Energy Construction", "Aura Interior",
  "Housing Promoters", "Magizh Aquatics", "RSquare Builders",
  "Shri Krish", "Surya Aqua Tech", "Secrets Detective",
  "ECRGOA Beach Resort", "Top Developers", "Tiny Bite"
];

export default function Clientele() {
  return (
    <section className={styles.section}>
      <div className={styles.headingWrapper}>
        <h2 className={styles.heading}>
          Our <span className={styles.headingHighlight}>Clientele</span>
        </h2>
      </div>
      <div className={styles.grid}>
        {CLIENTS.map((client, i) => (
          <div key={i} className={styles.logoCard}>
            <span className={styles.logoText}>{client}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
