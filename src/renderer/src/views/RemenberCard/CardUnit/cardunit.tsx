import { useEffect, useRef } from 'react'
import styles from './styles.module.scss'

interface props {
  set_content?: (c: string) => void
  content: string
  editable: boolean
  onClick?: () => void
}

export function CardUnit({ set_content, content, editable, onClick }: props) {
  const p = useRef<HTMLParagraphElement | null>(null)

  // 不能挂在content上
  useEffect(() => {
    ;(p.current as HTMLParagraphElement).innerHTML = content
  }, [])
  return (
    <div
      className={styles['card-unit-container']}
      onClick={() => {
        if (onClick) onClick()
        if (p.current) {
          p.current.focus()
        }
      }}
    >
      {/* <header className={styles['card-unit-header']}>
        <button className={styles['function-button']}>正文</button>
        <button className={styles['function-button']}>音频</button>
        <button className={styles['function-button']}>释义</button>
        <button className={styles['function-button']}>备注</button>
      </header> */}
      <p
        ref={p}
        className={styles['content']}
        contentEditable={editable ? 'true' : 'false'}
        onInput={(event) => {
          const p_ = event.target as HTMLParagraphElement
          const content = p_.innerHTML
          if (set_content) set_content(content)
        }}
      ></p>
    </div>
  )
}
