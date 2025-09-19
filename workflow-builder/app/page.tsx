import { DirectorySelector } from '@/components/directory-selector';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Workflow Builder</h1>
        <DirectorySelector />
      </div>
    </main>
  );
}
