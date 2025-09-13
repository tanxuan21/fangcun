import { ReactNode } from 'react'
import styles from './menu-styles.module.scss'
import { useMenu } from './MenuContent'
interface props {
  children: ReactNode
  id?: string
  onClick?: () => void
  Styles?: React.CSSProperties
  className?: string
}
export const MenuItem = ({ onClick, children, className, Styles }: props) => {
  const { setOpenMenuId } = useMenu()
  return (
    <div
      onClick={() => {
        onClick && onClick()
        setOpenMenuId(null)
      }}
      className={`${styles['fangcun-menu-item-container']} ${className}`}
      style={Styles}
    >
      {children}
    </div>
  )
}
