import { Button } from 'antd'
import styles from './styles.module.scss'
import { IconTail } from '@renderer/components/Icon'

export const FinishReview = () => {
  return (
    <div className={styles['finish-review-page']}>
      {/* 喝彩icon */}
      <IconTail className={styles['appluse-icon']} IconName="#icon-zanhehecai-01" />
      <div className={styles['button-group']}>
        <Button>Review other</Button>
        <Button>Casual review</Button>
        <Button>Summarize</Button>
      </div>
    </div>
  )
}
