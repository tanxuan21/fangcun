import styles from './styles.module.scss'
import { ReactNode } from 'react'
export enum CoverLayerState {
  hidden = 0,
  visible = 1
}

interface props {
  handleCallback?: () => void
  children?: ReactNode
  state: CoverLayerState
}

export const CoverPageContainer = ({ state, handleCallback, children }: props) => {
  return (
    <>
      {state === CoverLayerState.visible && (
        <div className={styles['cover-page-container']}>{children}</div>
      )}
    </>
  )
}
