import React from 'react';
import styles from './Testimonials.module.css';

const REVIEWS = [
  {
    name: "Surya",
    role: "Client",
    text: '"Excellent service and very professional approach. The team offers excellent and reliable service. Highly recommended."',
    initial: "S"
  },
  {
    name: "Naren K",
    role: "Client",
    text: '"Great experience with AquaCare! Professional team, quick support, and creative water purification solutions."',
    initial: "N"
  },
  {
    name: "Balaji Sekar",
    role: "Client",
    text: '"I am very happy for the services. Good output comes in my home for the past more than 1 year..."',
    initial: "B"
  }
];

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className={styles.headingWrapper}>
        <h2 className={styles.heading}>What Our <span className={styles.headingHighlight}>Clients Say</span></h2>
      </div>
      <p className={styles.subheading}>Hear from the people who have experienced our pure water solutions.</p>
      
      <div className={styles.grid}>
        {REVIEWS.map((review, i) => (
          <div key={i} className={styles.reviewCard}>
            <div className={styles.reviewerInfo}>
              <div className={styles.avatar}>{review.initial}</div>
              <div className={styles.nameRole}>
                <h3 className={styles.name}>{review.name}</h3>
                <span className={styles.role}>{review.role}</span>
              </div>
            </div>
            <p className={styles.reviewText}>{review.text}</p>
            <div className={styles.stars}>★★★★★</div>
          </div>
        ))}
      </div>
      
      <button className={styles.viewMoreBtn}>View More Reviews</button>
    </section>
  );
}
