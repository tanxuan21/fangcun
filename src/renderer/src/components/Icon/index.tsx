// components/Icon.tsx
import React from 'react'

type IconProps = {
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  size?: number | string
  color?: string
  className?: string
}

export const Icon: React.FC<IconProps> = ({
  icon: IconSvg,
  size = 24,
  color = 'currentColor',
  className = ''
}) => {
  return <IconSvg width={size} height={size} fill={color} className={className} />
}
