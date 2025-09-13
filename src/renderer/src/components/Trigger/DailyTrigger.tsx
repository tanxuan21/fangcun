import dayjs from 'dayjs'
import { useEffect } from 'react'

export default function DailyTrigger({ onTrigger }) {
  // 工具函数：获取今天日期字符串
  const getToday = () => dayjs().format('YYYY-MM-DD')

  // 页面进入时检查
  useEffect(() => {
    const today = getToday()
    const storage_today = localStorage.getItem('today') // 存储的时间
    if (storage_today !== today) {
      // 触发，同时写入storage_today
      localStorage.setItem('today', today)
      onTrigger()
    }
  }, [onTrigger])

  // 定时检查是否到 0 点
  useEffect(() => {
    const checkMidnight = () => {
      const today = getToday()
      // 如果已经是新的一天
      if (localStorage.getItem('today') !== today) {
        localStorage.setItem('today', today)
        onTrigger?.()
      }
    }

    // 十分钟检查一次
    const timer = setInterval(checkMidnight, 10 * 60 * 1000)

    return () => clearInterval(timer)
  }, [onTrigger])

  return null // 这个组件只负责逻辑，不渲染 UI
}
