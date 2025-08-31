import { forwardRef, useImperativeHandle, useState } from 'react'
import styles from './styles.module.scss'

interface props {}
export const ReviewSummary = forwardRef(({}: props, ref) => {
  const [isShow, setIsShow] = useState<boolean>(false)
  useImperativeHandle(ref, () => ({
    show: () => {
      setIsShow(true)
    }
  }))
  return (
    <div
      className={`${styles['review-summary-container']} ${isShow && styles['review-summary-show']}`}
    >
      <span
        onClick={() => {
          setIsShow(false)
        }}
      >
        返回
      </span>
    </div>
  )
})
