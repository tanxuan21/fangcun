import { Template } from '@renderer/components/Layout/Template'
import styles from './layout-styles.module.scss'
export function VideoSplitter() {
  return (
    <Template
      header={<header className={styles['video-splitter-header']}></header>}
      asider={<aside className={styles['video-splitter-asider']}></aside>}
      main={
        <main className={styles['video-splitter-main']}>
          <div className={styles['video-wrapper']}>
            <video className={styles['video']} controls>
              <source
                src="http://localhost:3001/api/video/stream/S01E01_out.mp4"
                type="video/mp4"
              ></source>
            </video>
          </div>

          <div className={styles['splitter-container']}></div>
        </main>
      }
      footer={<footer className={styles['video-splitter-footer']}></footer>}
    />
  )
}
