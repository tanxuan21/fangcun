import { Icon } from '../Icon'
import styles from './styles.module.scss'
export const DeleteMenuItem = () => {
  return (
    <p className={styles['delete-menu-item']}>
      <Icon IconName="#icon-shanchu"></Icon>
      删除
    </p>
  )
}
