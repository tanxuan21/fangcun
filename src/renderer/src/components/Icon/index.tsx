import { CSSProperties } from 'react'
import styles from './icon-style.module.scss'
type IconProps = {
  IconName: string
  size?: number | string
  color?: string
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

export const Icon = ({ IconName, style, className, onClick }: IconProps) => {
  return (
    <svg className={`icon ${className}`} aria-hidden={true} style={style} onClick={onClick}>
      <use xlinkHref={IconName}></use>
    </svg>
  )
}

export const IconTail = ({ IconName, style, className, onClick }: IconProps) => {
  return (
    <div
      style={{
        ...style,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      className={className}
      onClick={onClick}
    >
      <Icon IconName={IconName}></Icon>
    </div>
  )
}

type IconTailHoverProps = {} & IconProps
export const IconTailHover = ({ IconName, style, className, onClick }: IconTailHoverProps) => {
  return (
    <IconTail
      IconName={IconName}
      style={{ ...style }}
      className={`${styles['icon-tail-hover']} ${className}`}
      onClick={onClick}
    ></IconTail>
  )
}
export const ExpandIconTail = ({
  style,
  className,
  expand
}: {
  style?: React.CSSProperties
  className?: string
  expand: boolean
  expandDirection?: 'colum' | 'horizon'
}) => {
  return (
    <IconTail
      className={`${styles['icon-expand-tail']} ${expand ? styles['expand'] : ''} ${className}`}
      style={style}
      IconName="#icon-zhankai4"
    ></IconTail>
  )
}
