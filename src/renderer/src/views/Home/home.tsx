import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import styles from './styles.module.scss'
export function Home() {
  const nav = useNavigate()

  const boxRef = useRef<HTMLDivElement>(null)
  const [box_state, set_box_state] = useState<'ready' | 'show' | 'leave'>('ready')
  //   const []
  useEffect(() => {
    // nav('app/remember-card')
    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === 'translate') {
        console.log(box_state, 'translate end')
      }
    }
    window.addEventListener('transitionend', handleTransitionEnd)
    return () => {
      window.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [box_state])
  return (
    <div
      style={{
        display: 'flex',
        gap: '20px'
      }}
    >
      <Link to={'/app/remember-card/'}>Remember Car</Link>
      <Link to={'/app/board/'}>board</Link>
      <Link to={'/app/table/'}>table</Link>
      <svg
        style={{
          fontSize: '25px',
          width: '1em',
          height: '1em',
          display: 'inline-block',
          color: '#aaa'
        }}
        className="icon"
        aria-hidden="true"
      >
        <use style={{ width: '100%', height: '100%' }} xlinkHref="#icon-sousuo"></use>
      </svg>

      <div className={styles['test-container']}>
        <div ref={boxRef} className={`${styles['box']} ${styles[box_state]}`}></div>
        <button
          onClick={() => {
            if (box_state === 'leave') {
              // 这里。禁用transition
              const box = boxRef.current
              if (box) {
                box.style.transition = 'none'
                requestAnimationFrame(() => {
                  set_box_state('ready')
                })
              }
            } else if (box_state === 'ready') {
              const box = boxRef.current
              if (box) {
                box.style.transition = ''
                requestAnimationFrame(() => {
                  set_box_state('show')
                })
              }
            } else if (box_state === 'show') {
              const box = boxRef.current
              if (box) {
                box.style.transition = ''
                requestAnimationFrame(() => {
                  set_box_state('leave')
                })
              }
            }
          }}
        >
          切换状态
        </button>
      </div>
    </div>
  )
}
