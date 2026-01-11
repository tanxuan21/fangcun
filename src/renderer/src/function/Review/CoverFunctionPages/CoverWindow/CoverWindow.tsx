import styles from './styles.module.scss'

export const CoverWindow = ({
  handleClose,
  children
}: {
  handleClose?: () => void
  children: React.ReactNode
}) => {
  return (
    <div className={styles['cover-window']}>
      {/* 关闭按钮 */}
      <header className={styles['cover-window-header']}>
        <span className={styles['close-button']} onClick={handleClose}></span>
      </header>
      <main className={styles['cover-window-main']}>{children}</main>
    </div>
  )
}
