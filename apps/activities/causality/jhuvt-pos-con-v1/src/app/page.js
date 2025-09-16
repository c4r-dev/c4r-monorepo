'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to PositiveControl1 page
    router.push('/pages/PositiveControl1');
  }, [router]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Loading Positive Controls Activity...</h1>
      </main>
    </div>
  );
}