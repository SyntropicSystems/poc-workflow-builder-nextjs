import { DirectorySelector } from '@/components/directory-selector';
import { FileList } from '@/components/file-list';
import { WorkflowLoader } from '@/components/workflow-loader';
import { WorkflowViewer } from '@/components/workflow-viewer';
import { StepInspector } from '@/components/step-inspector';
import { StepActions } from '@/components/step-actions';
import { EditModeToggle } from '@/components/edit-mode-toggle';
import { SaveButton } from '@/components/save-button';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1>Workflow Builder</h1>
        <DirectorySelector />
        <div className={styles.toolbar}>
          <EditModeToggle />
          <SaveButton />
        </div>
        <div className={styles.layout}>
          <div className={styles.sidebar}>
            <FileList />
            <WorkflowLoader />
          </div>
          <div className={styles.canvas}>
            <WorkflowViewer />
          </div>
          <div className={styles.inspector}>
            <StepActions />
            <StepInspector />
          </div>
        </div>
      </div>
    </main>
  );
}
