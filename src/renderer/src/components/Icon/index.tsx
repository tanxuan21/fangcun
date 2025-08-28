import { CSSProperties } from 'react'

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
