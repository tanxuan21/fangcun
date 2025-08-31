import { Icon } from '@renderer/components/Icon'

import styles from './styles.module.scss'
interface props {
  count: number
  progress: number
  className?: string
}

const Point = ({ finish }: { finish: boolean }) => {
  return <div className={`${styles['point']} ${finish && styles['finish']}`}></div>
}

export const ProgressPoints = ({ className, count, progress }: props) => {
  return (
    <div className={`${styles['progress-points-container']} ${className} `}>
      {Array(count)
        .fill(0)
        .map((_item, index) => (
          <Point key={index} finish={index < progress} />
        ))}
      {/* {<Icon IconName="#icon-queren1"></Icon>} */}
    </div>
  )
}
