import { MouseEventHandler } from 'react'
import styles from '../styles.module.scss'
// 抽屉里的card list item
export const CardListItem = ({
  active,
  content,
  onClick,
  children
}: {
  active: boolean
  content: React.ReactNode
  onClick: MouseEventHandler<HTMLDivElement>
  children?: React.ReactNode
}) => {
  return (
    <div
      onClick={onClick}
      className={`${styles['card-list-item']} ${active && styles['card-list-item-active']}`}
    >
      {children}
      <p>{content}</p>
    </div>
  )
}
