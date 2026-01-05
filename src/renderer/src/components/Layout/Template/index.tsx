import { Wrapper } from '../Wrapper'
import styles from './styles.module.scss'
interface props {
  header?: React.ReactNode
  asider?: React.ReactNode
  main?: React.ReactNode
  footer?: React.ReactNode
  cover?: React.ReactNode
}
export function Template({ header, asider, main, footer, cover }: props) {
  return (
    <>
      <Wrapper className={styles['flex-page']}>
        {header}
        <Wrapper className={styles['flex-main']}>
          {asider}
          {main}
        </Wrapper>
        {footer}
      </Wrapper>
      {cover}
    </>
  )
}
