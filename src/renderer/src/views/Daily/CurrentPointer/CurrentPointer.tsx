import { useEffect, useState } from 'react'

import className from './CurrentPointer.module.scss'
import dayjs from 'dayjs'
export const CurrentPointer = () => {
  const [styles, setStyles] = useState<React.CSSProperties>({
    top: 0
  })
  const [currentTime, setCurrentTime] = useState<string>('00:00')
  const calculate = () => {
    setStyles({
      top: `${dayjs().diff(dayjs().startOf('day'), 'minute')}px`
    })
    setCurrentTime(dayjs().format('HH:mm'))
    console.log('update')
  }
  useEffect(() => {
    const tm = setTimeout(calculate, 60000) // 两分钟更新一波
    calculate()
    return () => {
      clearTimeout(tm)
    }
  }, [])
  return (
    <div className={className['current-pointer-container']} style={styles}>
      <span>{currentTime}</span>
      <div></div>
    </div>
  )
}
