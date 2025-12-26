import { useEffect, useRef } from 'react'
import styles from './splitter-controller.module.scss'

interface props {
  video: React.RefObject<HTMLVideoElement>
}

export const SplitterController = ({ video }: props) => {
  const ctnRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // ===========================================================
    let dragging_pointer = false
    const pointer = document.createElement('div')
    pointer.className = styles['pointer']
    pointer.addEventListener('pointerdown', (e: PointerEvent) => {
      pointer.setPointerCapture(e.pointerId)
      dragging_pointer = true
    })
    pointer.addEventListener('pointermove', (e: PointerEvent) => {
      if (!ctnRef.current || !dragging_pointer) return
      const { left, right } = ctnRef.current?.getBoundingClientRect()
      let x = e.clientX - left
      if (x <= 0) x = 0
      if (x >= right - left) x = right - left
      pointer.style.left = `${x}px`
    })
    pointer.addEventListener('pointerup', (e: PointerEvent) => {
      dragging_pointer = false
      if (!ctnRef.current) return
      const { left, right } = ctnRef.current?.getBoundingClientRect()
      let x = parseInt(pointer.style.left)
      let rate = x / (right - left)
      if (video.current) video.current.currentTime = rate * video.current.duration
    })

    const pointer_header = document.createElement('div')
    pointer_header.className = styles['pointer_header']
    pointer.appendChild(pointer_header)
    ctnRef.current?.appendChild(pointer)

    // =====================================================
    const VideoTimeUpdateHandle = () => {
      if (!ctnRef.current || !video.current || dragging_pointer) return
      const { left, right } = ctnRef.current?.getBoundingClientRect()
      let x = (right - left) * (video.current.currentTime / video.current.duration)
      pointer.style.left = `${x}px`
    }
    if (video.current) {
      video.current.addEventListener('timeupdate', VideoTimeUpdateHandle)
    }
    return () => {
      if (ctnRef.current) ctnRef.current.innerHTML = ''
      video.current?.removeEventListener('timeupdate', VideoTimeUpdateHandle)
    }
  }, [])
  return (
    <div className={styles['splitter-controller-container']}>
      <header className={styles['tool-bar-header']}>
        <button
          onClick={() => {
            if (video.current) video.current.play()
          }}
        >
          play
        </button>
        <button
          onClick={() => {
            if (video.current) video.current.pause()
          }}
        >
          pluse
        </button>
      </header>
      <div ref={ctnRef} className={styles['time-line-editor']}></div>
    </div>
  )
}
