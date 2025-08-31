import { useState } from 'react'
import styles from '../styles.module.scss'
// 基础布局组件
export const Layout = ({ card, cards_list }) => {
  const [expand, set_expand] = useState<boolean>(true)
  return (
    <>
      <div className={styles['main-wrapper']}>{card}</div>
      <div className={`${styles['drawer-wrapper']} ${expand && styles['drawer-wrapper-expand']}`}>
        <div
          className={`${styles['drawer-handle']} ${expand && styles['drawer-handle-expand']}`}
          onClick={(event) => {
            event.stopPropagation()
            set_expand(!expand)
          }}
        ></div>
        <div className={styles['cards-container']}>{cards_list}</div>
      </div>
    </>
  )
}
