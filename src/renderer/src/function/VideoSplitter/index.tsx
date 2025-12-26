import { Template } from '@renderer/components/Layout/Template'
import styles from './layout-styles.module.scss'
import { SplitterController } from './SplitterController'
import { useRef } from 'react'
export function VideoSplitter() {
  const VideoRef = useRef<HTMLVideoElement>(null)
  return (
    <Template
      header={
        <header className={styles['video-splitter-header']}>
          <span>upload</span>
        </header>
      }
      asider={<aside className={styles['video-splitter-asider']}></aside>}
      main={
        <main className={styles['video-splitter-main']}>
          <div className={styles['video-wrapper']}>
            <video ref={VideoRef} className={styles['video']} controls={false}>
              <source
                src="http://localhost:3001/api/video/stream/S01E01_out.mp4"
                type="video/mp4"
              ></source>
            </video>
          </div>

          <div className={styles['splitter-container']}>
            <SplitterController video={VideoRef}></SplitterController>
          </div>
        </main>
      }
      footer={<footer className={styles['video-splitter-footer']}></footer>}
    />
  )
}
