import { DirectorySelector } from '@/components/directory-selector';
import { FileList } from '@/components/file-list';
import { WorkflowLoader } from '@/components/workflow-loader';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Workflow Builder</h1>
        <DirectorySelector />
        <div className={styles.columns}>
          <div className={styles.sidebar}>
            <FileList />
          </div>
          <div className={styles.content}>
            <WorkflowLoader />
          </div>
        </div>
      </div>
    </main>
  );
}
