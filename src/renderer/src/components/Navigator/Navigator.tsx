import styles from './styles.module.scss'
import { Link } from 'react-router-dom'
import { Icon } from '../Icon'
export const Navigator = () => {
  return (
    <div className={styles['nav-container']}>
      <div className={styles['nav-wapper-upper']}>
        <Link className={styles['nav-link']} to={'/'}>
          <Icon className={styles['nav-link-icon']} IconName="#icon-zhuye"></Icon>
        </Link>
        <Link className={styles['nav-link']} to={'/app/board/'}>
          <Icon className={styles['nav-link-icon']} IconName="#icon-duoweidu"></Icon>
        </Link>
        <Link className={styles['nav-link']} to={'/app/remember-card/'}>
          <Icon className={styles['nav-link-icon']} IconName="#icon-qiapianxingshi"></Icon>
        </Link>
        <Link className={styles['nav-link']} to={'/app/table/'}>
          <Icon className={styles['nav-link-icon']} IconName="#icon-biaoge"></Icon>
        </Link>
        <Link className={styles['nav-link']} to={'/app/daily/'}>
          <Icon className={styles['nav-link-icon']} IconName="#icon-rili"></Icon>
        </Link>
        <span
          className={styles['nav-link']}
          onClick={() => {
            window.api.openTerminal()
          }}
        >
          <Icon className={styles['nav-link-icon']} IconName="#icon-yunminglinghang"></Icon>
        </span>
      </div>

      <div className={styles['nav-wapper-down']}>
        <span className={styles['nav-link']}>
          <Icon className={styles['nav-link-icon']} IconName="#icon-shezhi"></Icon>
        </span>
      </div>
    </div>
  )
}
