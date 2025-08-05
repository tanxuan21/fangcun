import styles from './styles.module.scss'
import { useEffect, useRef } from 'react'
import { BoardUI } from './UI/ui'
import { Board } from './board'
export function BoardReact() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (containerRef.current) {
      const b = new Board()
      b.createNodes() // 创建子节点 debug使用
      b.mount(containerRef.current) // 挂载
    }
  }, [])
  return (
    <div className={`${styles['fill']} ${styles['absolute-stak']}`}>
      <BoardUI></BoardUI>
      <div className={`${styles['fill']} ${styles['absolute-stak']}`} ref={containerRef}></div>
    </div>
  )
}
