import { Styleprops } from '@renderer/views/RemenberCard/types'
import styles from './styles.module.scss'
export const NotifySpirit = ({
  max_count = 99,
  min_count = 0,
  count,
  className,
  style,
  padding = 5,
  size = 20
}: Styleprops & {
  max_count?: number
  min_count?: number
  count: number
  size?: number
  padding?: number
}) => {
  return (
    <p
      className={`${styles['notify-container']} ${className}`}
      style={{
        ...style,
        minWidth: `${size}px`,
        height: `${size}px`,
        fontSize: `${size - padding * 2}px`,
        padding: `${padding}px`
      }}
    >
      {count > max_count ? `${max_count}+` : count}
    </p>
  )
}
