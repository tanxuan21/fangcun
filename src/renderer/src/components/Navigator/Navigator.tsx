import styles from './styles.module.scss'
import { Link } from 'react-router-dom'
import { Icon } from '../Icon'
import { SettingPage } from '../../views/Setting/Setting'

interface props {
  ShowSettingPage: () => void
}
export const Navigator = ({ ShowSettingPage }: props) => {
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
        <Link className={styles['nav-link']} to={'/component/'}>
          <Icon IconName="#icon-kaifazujian" className={styles['nav-link-icon']}></Icon>
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
        <span
          onClick={() => {
            ShowSettingPage()
          }}
          className={styles['nav-link']}
        >
          <Icon className={styles['nav-link-icon']} IconName="#icon-shezhi"></Icon>
        </span>
      </div>
    </div>
  )
}
