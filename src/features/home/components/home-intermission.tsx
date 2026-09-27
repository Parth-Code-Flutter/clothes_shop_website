import { ArrowDown } from "lucide-react";
import { getAllCategories, getProductsByCategory } from "@/features/catalog/data";
import styles from "./home-cinema.module.css";

function Titles({ front }: { front: boolean }) {
  const categories = getAllCategories();
  return (
    <>
      {[0, 1].map((copy) => (
        <span key={copy} className={styles.title}>
          <b>{front ? "Now playing in store" : "House of Bollywood"}</b>
          <i />
          {categories.map((category) => (
            <span key={category.id} className={styles.item}>
              {category.name}
              <small>{front ? `${getProductsByCategory(category.id).length} titles` : "Tonight"}</small>
              <i />
            </span>
          ))}
        </span>
      ))}
    </>
  );
}

/** Bridge from the dark premiere into the page: two crossed film strips running the store's line-up. */
export function HomeIntermission() {
  return (
    <section aria-label="Now playing in store" className={styles.intermission}>
      <div className={styles.strips} aria-hidden="true">
        <div className={`${styles.strip} ${styles.stripBack}`}>
          <div className={styles.run}><Titles front={false} /></div>
        </div>
        <div className={`${styles.strip} ${styles.stripFront}`}>
          <div className={styles.run}><Titles front /></div>
        </div>
      </div>
      <a href="#categories" className={styles.cue}>
        Intermission · Up next: choose your scene <ArrowDown size={14} aria-hidden="true" />
      </a>
    </section>
  );
}
