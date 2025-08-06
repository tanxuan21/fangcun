import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import styles from './styles.module.scss'
import './terminal-main.scss'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className={styles['terminal-container']}>terminal</div>
  </StrictMode>
)
