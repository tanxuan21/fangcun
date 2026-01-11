import { MDXRender } from '@renderer/components/MarkdownRender/MDXRender'
import styles from './styles.module.scss'
import { MarkdownRenderMode } from '@renderer/components/MarkdownRender/types'
// 这个组件作为临时组件，未来要作更复杂的控制

interface props {
  q?: string
  a?: string
  setQ?: (v: string) => void
  setA?: (v: string) => void
  q_mode: MarkdownRenderMode
  a_mode: MarkdownRenderMode
}
export const QARender = ({ q, a, setQ, setA, q_mode, a_mode }: props) => {
  return (
    <div className={styles['qa-cover-function-container']}>
      <div className={styles['mdx-wrapper']}>
        <MDXRender
          mode={q_mode}
          markdown={q}
          onChange={setQ ? (v) => setQ(v) : () => {}}
        ></MDXRender>
      </div>
      <div className={styles['mdx-wrapper']}>
        <MDXRender
          mode={a_mode}
          markdown={a}
          onChange={setA ? (v) => setA(v) : () => {}}
        ></MDXRender>
      </div>
    </div>
  )
}
